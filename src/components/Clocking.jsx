import { useState, useEffect, useCallback, useRef } from "react";
import { getAllowedLateMinutes } from "../config.js";
import { getLateMinutes } from '../utils.js';

const Clocking = ({ person, onClocked, supervised, viaKeycard, onAutoClocked }) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [arrival, setArrival] = useState(undefined);
  const [showSupervisorPicker, setShowSupervisorPicker] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const allowedLateMinutes = getAllowedLateMinutes();

  // Stable clock-in handler to avoid stale closures in effects
  const handleClockIn = useCallback(async () => {
    setMessage("");
    setError("");
    const currentTime = new Date().toISOString();
    console.log("Clocking in at:", currentTime);
    const newArrival = await window.api.addArrival(person.id, currentTime);
    setArrival(newArrival);
    onClocked(newArrival);
    return newArrival;
  }, [person?.id, onClocked]);

  useEffect(() => {
    const fetchArrival = async () => {
      const a = await window.api.getArrivalToday(person.id);
      setArrival(a);
      console.log("Fetched today's arrival for user", person.id, a);
      console.log("supervised:", supervised, "viaKeycard:", viaKeycard, "arrival:", a);
    };
    fetchArrival();
  }, [person?.id]);

  // Latch whether this instance was opened via keycard to avoid race conditions
  const viaKeycardRef = useRef(!!viaKeycard);
  useEffect(() => {
    if (viaKeycard) viaKeycardRef.current = true;
  }, [viaKeycard]);

  // Auto clock-in via keycard after arrival has been fetched
  useEffect(() => {
    if (viaKeycardRef.current && arrival === null) {
      console.log("Clocking in via keycard for user", person.id);
      (async () => {
        try {
          const a = await handleClockIn();
          // Notify parent specifically for auto clock-ins (keycard)
          onAutoClocked?.(a);
          // Ensure we only auto-clock once per mount
          viaKeycardRef.current = false;
        } catch (e) {
          console.error('Auto clock-in failed', e);
        }
      })();
    }
  }, [arrival, handleClockIn, person?.id, onAutoClocked]);

  const lateMinutes = getLateMinutes(arrival?.arrivalTime);
  const timeClass = lateMinutes <= 0
    ? 'time-green'
    : lateMinutes <= allowedLateMinutes
      ? 'time-yellow'
      : 'time-red';

  console.log('Late minutes:', lateMinutes);

  const handleLateArrival = async () => {
    try {
      setError("");
      setMessage("");
      if (!showSupervisorPicker) {
        // Lazy-load staff when opening the picker
  const list = await window.api.getStaff();
  console.log("Fetched staff:", list);
        setSupervisors(list);
        setShowSupervisorPicker(true);
      } else {
        setShowSupervisorPicker(false);
      }
    } catch (e) {
      console.error('Failed to load supervisors', e);
      setError('Esimieslistan lataus epäonnistui');
    }
  }

  const confirmSupervisor = async () => {
    console.log("Confirming supervisor:", arrival?.supervisorId);
    try {
      const ok = await window.api.setArrivalSupervisor(arrival.id, arrival.supervisorId);
      if (ok) {
        setMessage('Lupa lisätty');
      } else {
        setError('Luvan lisääminen epäonnistui');
      }
    } catch (e) {
      console.error('Failed to set supervisor', e);
      setError('Luvan lisääminen epäonnistui');
    }
    setShowSupervisorPicker(false);
  }

  // Manual clock-in uses the same stable handler
  const manualClockIn = handleClockIn;

  if (arrival === undefined) {
    return <h2>Loading…</h2>;
  }

  if (arrival === null && !supervised) {
    return <button onClick={manualClockIn}>Kellota saapuminen</button>;
  }

  if (arrival === null) {
    return (
      <>
        <p>Ei ole saapunut tänään</p>
        <button onClick={manualClockIn}>Kellota saapuminen</button>
      </>
    );
  }

  if (lateMinutes <= allowedLateMinutes) {
    return (
      <div>
        <p>Ajoissa</p>
        <p>
          Kellotettu ajassa <span className={timeClass}>{new Date(arrival.arrivalTime).toLocaleTimeString()}</span>
        </p>
        <p className="clocking-message" role="status">{message}</p>
      </div>
    )
  } else {
    return (
      <div>
        <p>Myöhässä</p>
        <p>
          Kellotettu ajassa <span className={timeClass}>{new Date(arrival.arrivalTime).toLocaleTimeString()}</span>
        </p>
        {!showSupervisorPicker && <button type="button" onClick={handleLateArrival}>Luvallinen myöhästyminen</button>}
        {showSupervisorPicker && (
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label>
            Luvan antaja:
            <select
              value={arrival.supervisorId ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                setArrival({ ...arrival, supervisorId: v === '' ? null : Number(v) });
              }}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="">Ei lupaa</option>
              {supervisors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>

          <button type="button" onClick={confirmSupervisor}>Tallenna</button>
        </div>
      )}
      {!showSupervisorPicker && arrival.supervisorId && <p className="badge">Lupa lisätty</p>}
    </div>
  );
}

}

export default Clocking;
