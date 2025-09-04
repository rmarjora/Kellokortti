import React, { useEffect, useRef, useState } from "react";

export default function FMIWeather({ place = "Helsinki" }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshMs = 60_000; // poll every 60 seconds
  const timeoutMs = 10_000; // fail fast if FMI is slow or unresponsive
  const fetchingRef = useRef(false);
  const hasWeatherRef = useRef(false); // track if we've shown data at least once
  const inFlightTimerRef = useRef(null); // safety watchdog

  useEffect(() => {
    // Helper to extract FMI OWS ExceptionText if present
    const extractExceptionText = (xmlStr) => {
      try {
        const p = new DOMParser();
        const d = p.parseFromString(xmlStr, 'application/xml');
        // Namespace-aware lookup
        const nsText = d.getElementsByTagNameNS?.('http://www.opengis.net/ows/1.1', 'ExceptionText')?.[0]?.textContent;
        if (nsText) return nsText;
        const owsTag = d.getElementsByTagName('ows:ExceptionText')?.[0]?.textContent;
        if (owsTag) return owsTag;
        const plain = d.getElementsByTagName('ExceptionText')?.[0]?.textContent;
        if (plain) return plain;
        return null;
      } catch (_) {
        return null;
      }
    };

    async function fetchWeather() {
      if (fetchingRef.current) return; // avoid overlapping fetches
      fetchingRef.current = true;
      // Only show spinner on first load; later polls are silent
      setLoading(!hasWeatherRef.current);
      setError(null);

      // Safety watchdog: if we somehow miss finally, clear loading after timeout
      if (inFlightTimerRef.current) clearTimeout(inFlightTimerRef.current);
      inFlightTimerRef.current = setTimeout(() => {
        if (fetchingRef.current) {
          fetchingRef.current = false;
          setLoading(false);
          setError((prev) => prev ?? 'Request timed out');
        }
      }, timeoutMs + 2000);

      const FMI_URL =
        `https://opendata.fmi.fi/wfs?` +
        `service=WFS&version=2.0.0&request=getFeature` +
        `&storedquery_id=fmi::observations::weather::simple` +
  `&parameters=t,rh,ws_10min` +
        `&maxlocations=1` +
        `&place=${encodeURIComponent(place)}`;

      try {
        // Prefer Electron main-process proxy if available (avoids CORS)
        let xmlText;
        if (window.api?.fetchRemote) {
          // Race the IPC call with a timeout to avoid UI being stuck
          const res = await Promise.race([
            window.api.fetchRemote(FMI_URL, { method: 'GET' }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeoutMs))
          ]);
          xmlText = res.body;
          if (!res.ok) {
            const et = extractExceptionText(xmlText);
            throw new Error(et ? `${res.status}: ${et}` : `HTTP ${res.status}`);
          }
        } else {
          // Use AbortController to cancel slow renderer fetches
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs);
          let response;
          try {
            response = await fetch(FMI_URL, { signal: controller.signal });
          } catch (e) {
            if (e?.name === 'AbortError') {
              throw new Error('Request timed out');
            }
            throw e;
          } finally {
            clearTimeout(timer);
          }
          xmlText = await response.text();
          if (!response.ok) {
            const et = extractExceptionText(xmlText);
            throw new Error(et ? `${response.status}: ${et}` : `HTTP ${response.status}`);
          }
        }

        // Parse XML to DOM
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        // Detect XML parser errors
        const parseErr = xmlDoc.getElementsByTagName('parsererror')?.[0];
        if (parseErr) {
          throw new Error('Invalid response from FMI (XML parse error)');
        }

        // Also check for service exception
        const exception = xmlDoc.getElementsByTagName('ExceptionText')[0]?.textContent;
        if (exception) {
          throw new Error(exception);
        }

        // Collect all elements and group pairs by observation time, then pick latest
        const nsWfs = 'http://xml.fmi.fi/schema/wfs/2.0';
        let elements = [];
        try {
          elements = Array.from(xmlDoc.getElementsByTagName('BsWfs:BsWfsElement'));
          if (elements.length === 0 && xmlDoc.getElementsByTagNameNS) {
            elements = Array.from(xmlDoc.getElementsByTagNameNS(nsWfs, 'BsWfsElement'));
          }
          if (elements.length === 0) {
            // Some responses may wrap in wfs:member
            const members = xmlDoc.getElementsByTagName('wfs:member');
            if (members?.length) {
              for (let i = 0; i < members.length; i++) {
                const el = members[i].getElementsByTagName('BsWfs:BsWfsElement')[0];
                if (el) elements.push(el);
              }
            }
          }
        } catch (_) { /* noop */ }

  const groups = new Map(); // timeStr -> { key: value }
        const parseTime = (el) => {
          const t = el.getElementsByTagName('BsWfs:Time')[0]?.textContent || el.getElementsByTagName('Time')[0]?.textContent;
          return t || '';
        };
        for (const el of elements) {
          const timeStr = parseTime(el);
          let group = groups.get(timeStr);
          if (!group) { group = {}; groups.set(timeStr, group); }
          let pnames = el.getElementsByTagName('BsWfs:ParameterName');
          let pvals = el.getElementsByTagName('BsWfs:ParameterValue');
          if ((pnames?.length ?? 0) === 0) pnames = el.getElementsByTagName('ParameterName');
          if ((pvals?.length ?? 0) === 0) pvals = el.getElementsByTagName('ParameterValue');
          for (let i = 0; i < pnames.length; i++) {
            const key = pnames[i]?.textContent;
            const value = pvals[i]?.textContent ?? '';
            if (key) group[key] = value;
          }
        }

        // Build per-parameter latest values across all times
        const latestByParam = new Map(); // keyLower -> { ts, value }
        for (const [timeStr, data] of groups) {
          const ts = Date.parse(timeStr);
          for (const [k, v] of Object.entries(data)) {
            const keyLower = (k || '').toLowerCase();
            const prev = latestByParam.get(keyLower);
            if (!prev || (!Number.isNaN(ts) && ts > prev.ts)) {
              latestByParam.set(keyLower, { ts: Number.isNaN(ts) ? -Infinity : ts, value: v });
            }
          }
        }

  let chosen = {};
        if (latestByParam.size > 0) {
          for (const [k, info] of latestByParam) {
            chosen[k] = info.value;
          }
        } else {
          console.warn('FMI weather: no BsWfsElement found');
        }

  setWeather(chosen);
  hasWeatherRef.current = true;
      } catch (err) {
        console.error('Weather fetch failed', err);
        setError(err.message || 'Unknown error');
      } finally {
        if (inFlightTimerRef.current) {
          clearTimeout(inFlightTimerRef.current);
          inFlightTimerRef.current = null;
        }
        setLoading(false);
        fetchingRef.current = false;
      }
    }

    // initial fetch immediately
    fetchWeather();
    // set up polling
    const id = setInterval(fetchWeather, refreshMs);
    return () => clearInterval(id);
  }, [place]);

  // Always render the weather row: while loading or on errors,
  // show last known values, or '-' if none yet.

  // Map various possible parameter names to the three fields we display
  const resolveValue = (data, keys) => {
    if (!data) return undefined;
    const lowerMap = Object.fromEntries(Object.entries(data).map(([k, v]) => [k?.toLowerCase?.(), v]));
    for (const k of keys) {
      const v = lowerMap[k.toLowerCase()];
      if (v !== undefined && v !== '') return v;
    }
    return undefined;
  };

  const temp = resolveValue(weather, ['t', 't2m', 'ta', 'air_temperature', 'temperature']);
  const humidity = resolveValue(weather, ['rh', 'h', 'humidity', 'relative_humidity']);
  const wind = resolveValue(weather, ['ws_10min', 'ws', 'wind_speed', 'wind_speed_ms']);

  return (
    <div className="p-6 max-w-xl w-full bg-white rounded-2xl shadow-md border border-gray-200" style={{ minWidth: '680px' }}>
  <h2 className="text-xl font-bold text-gray-800" style={{ marginBottom: '0.25rem' }}>
        Sää paikassa {place}
      </h2>

      <div className="flex gap-4" style={{ display: 'flex', gap: '1rem', flexWrap: 'nowrap' }}>
        <div style={{ flex: '0 0 auto', minWidth: '210px' }}>
          <p style={{ whiteSpace: 'nowrap', margin: 0 }}>🌡️ <span className="font-semibold">Lämpötila:</span> {temp ?? '-'} °C</p>
        </div>
        <div style={{ flex: '0 0 auto', minWidth: '210px' }}>
          <p style={{ whiteSpace: 'nowrap', margin: 0 }}>💧 <span className="font-semibold">Ilmankosteus:</span> {humidity ?? '-'} %</p>
        </div>
        <div style={{ flex: '0 0 auto', minWidth: '210px' }}>
          <p style={{ whiteSpace: 'nowrap', margin: 0 }}>💨 <span className="font-semibold">Tuulen nopeus:</span> {wind ?? '-'} m/s</p>
        </div>
      </div>
    </div>
  );
}