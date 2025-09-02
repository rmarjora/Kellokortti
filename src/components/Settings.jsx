import { useEffect, useState } from 'react';
import useField from '../hooks/useField';

const Settings = () => {
  const [hour, setHour] = useState(null);
  const [minute, setMinute] = useState(null);
  const [allowedLate, setAllowedLate] = useState(null);
  const title = useField();
  const subtitle = useField();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      const h = await window.api.getSetting('work_start_time_hour');
      const m = await window.api.getSetting('work_start_time_minute');
      const a = await window.api.getSetting('allowed_late_minutes');
  const t = await window.api.getSetting('title');
  const s = await window.api.getSetting('subtitle');
      setHour(String(h ?? 9));
      setMinute(String(m ?? 0));
      setAllowedLate(String(a ?? 15));
  title.setValue(String(t ?? ''));
  subtitle.setValue(String(s ?? ''));
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
  await window.api.setSetting('title', title.value);
  await window.api.setSetting('subtitle', subtitle.value);
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
          <input type="number" min={0} max={180} value={allowedLate} onChange={e => setAllowedLate(e.target.value)} style={{ width: 88, marginLeft: 8 }} />
        </label>
        <label>
          Otsikko:
          <input type="text" value={title.value} onChange={title.onChange} style={{ width: 186, marginLeft: 8 }} />
        </label>
        <label>
          Alaotsikko:
          <input type="text" value={subtitle.value} onChange={subtitle.onChange} style={{ marginLeft: 8 }} />
        </label>
        <button type="button" onClick={save} disabled={saving}>Tallenna</button>
        {msg && <span className="badge">{msg}</span>}
      </div>
    </div>
  );
};

export default Settings;
