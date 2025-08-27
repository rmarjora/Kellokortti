import { useState, useEffect } from "react";
import { WORK_START_TIME } from "../config.js";

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

  const isLate = () => {
    if (!arrival?.arrivalTime) return false;
    const arrivalDate = new Date(arrival.arrivalTime);

    if (arrivalDate.getHours() > WORK_START_TIME.hour) return true;
    if (arrivalDate.getHours() === WORK_START_TIME.hour && arrivalDate.getMinutes() > WORK_START_TIME.minute) return true;

    return false;
  };

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

  if (!isLate()) {
    return (
      <div>
        <p>Ajoissa</p>
        <p>Kellotettu ajassa {new Date(arrival.arrivalTime).toLocaleTimeString()}</p>
        <p className="clocking-message" role="status">{message}</p>
      </div>
    )
  } else {
    return (
      <div>
        <p>Myöhässä</p>
        <p>Kellotettu ajassa {new Date(arrival.arrivalTime).toLocaleTimeString()}</p>
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
      {!showSupervisorPicker && arrival.supervisorId != null && <p>Lupa lisätty</p>}
    </div>
  );
}

}

export default Clocking;
