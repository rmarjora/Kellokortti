import { useEffect, useState } from 'react';

const Settings = () => {
  const [hour, setHour] = useState(null);
  const [minute, setMinute] = useState(null);
  const [allowedLate, setAllowedLate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      const h = await window.api.getSetting('work_start_time_hour');
      const m = await window.api.getSetting('work_start_time_minute');
      const a = await window.api.getSetting('allowed_late_minutes');
      setHour(String(h ?? 9));
      setMinute(String(m ?? 0));
      setAllowedLate(String(a ?? 15));
    };
    load();
  }, []);

  console.log("settings: ", { hour, minute, allowedLate });

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      const hNum = Math.max(0, Math.min(23, Number(hour)));
      const mNum = Math.max(0, Math.min(59, Number(minute)));
      const aNum = Math.max(0, Math.min(180, Number(allowedLate)));
      await window.api.setSetting('work_start_time_hour', hNum);
      await window.api.setSetting('work_start_time_minute', mNum);
      await window.api.setSetting('allowed_late_minutes', aNum);
      setMsg('Asetukset tallennettu');
    } catch (e) {
      console.error('Failed to save settings', e);
      setMsg('Tallennus epäonnistui');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <h3>Asetukset</h3>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <label>
          Työpäivän aloitusaika:
          <input type="number" min={0} max={23} value={hour} onChange={e => setHour(e.target.value)} style={{ width: 70, marginLeft: 8 }} />:
          <input type="number" min={0} max={59} value={minute} onChange={e => setMinute(e.target.value)} style={{ width: 70 }} />
        </label>
        <label>
          Sallittu myöhästyminen (min):
          <input type="number" min={0} max={180} value={allowedLate} onChange={e => setAllowedLate(e.target.value)} style={{ width: 100, marginLeft: 8 }} />
        </label>
        <button type="button" onClick={save} disabled={saving}>Tallenna</button>
        {msg && <span className="badge">{msg}</span>}
      </div>
      <p style={{ marginTop: '0.5rem', color: 'var(--muted)' }}>Muutokset vaikuttavat uusiin näkymiin; päivitä näkymä tarvittaessa.</p>
    </div>
  );
};

export default Settings;
