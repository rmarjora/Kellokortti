import { useState, useEffect } from "react";
import { WORK_START_TIME, ALLOWED_LATE_MINUTES } from "../config.js";

const Clocking = ({ person, onBreak, onClockOut }) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [arrival, setArrival] = useState(undefined);
  const [showSupervisorPicker, setShowSupervisorPicker] = useState(false);
  const [supervisors, setSupervisors] = useState([]);

  useEffect(() => {
    const fetchArrival = async () => {
      const a = await window.api.getArrivalToday(person.id);
      setArrival(a);
    };
    fetchArrival();
  }, []);

  // Compute minutes late and pick a color class for the time display
  const getLateMinutes = () => {
    if (!arrival?.arrivalTime) return 0;
    const arrivalDate = new Date(arrival.arrivalTime);
    const start = new Date(arrivalDate);
    start.setHours(WORK_START_TIME.hour, WORK_START_TIME.minute, 0, 0);
    const diffMin = Math.round((arrivalDate.getTime() - start.getTime()) / 60000);
    return diffMin;
  };

  const lateMinutes = getLateMinutes();
  const timeClass = lateMinutes <= 0
    ? 'time-green'
    : lateMinutes <= ALLOWED_LATE_MINUTES
      ? 'time-yellow'
      : 'time-red';

  const handleLateArrival = async () => {
    try {
      setError("");
      setMessage("");
      if (!showSupervisorPicker) {
        // Lazy-load supervisors when opening the picker
        const list = await window.api.getSupervisors();
        console.log("Fetched supervisors:", list);
        list.push({ id: -2, name: "Krishna "}); // Example supervisors because we don't have real data
        list.push({ id: -1, name: "Joku muu" });
        console.log("Fetched supervisors:", list);
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
    try {
      const ok = await window.api.setArrivalSupervisor(arrival.id, arrival.supervisorId);
      if (ok) {
        setMessage('Lupa lisätty');
        setShowSupervisorPicker(false);
      } else {
        setError('Luvan lisääminen epäonnistui');
      }
    } catch (e) {
      console.error('Failed to set supervisor', e);
      setError('Luvan lisääminen epäonnistui');
    }
  }

  const handleClockIn = async () => {
    setMessage("");
    setError("");
    const currentTime = new Date().toISOString();
    console.log("Clocking in at:", currentTime);
  setArrival(await window.api.addArrival(person.id, currentTime));
  };

  if (arrival === undefined) {
    return <h2>Loading…</h2>;
  }
  
  if (arrival === null) {
    return <button onClick={handleClockIn}>Kellota saapuminen</button>;
  }

  if (lateMinutes <= ALLOWED_LATE_MINUTES) {
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
        <button type="button" onClick={handleLateArrival}>Luvallinen myöhästyminen</button>
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
      {!showSupervisorPicker && arrival.supervisorId != null && <p className="clocking-message">Lupa lisätty</p>}
    </div>
  );
}

}

export default Clocking;
