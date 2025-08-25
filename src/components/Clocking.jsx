import { useState } from "react";

const Clocking = ({ person, onBreak, onClockOut }) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleClockIn = async () => {
    setMessage("");
    setError("");
    try {
      const success = await window.api.addArrival(person.id);
      if (success) {
      setMessage(`Kellotettu ajassa ${new Date().toLocaleTimeString()}`);
      } else {
      setError("Olet jo kellottanut tänään");
      }
    } catch (e) {
      console.error("addArrival failed", e);
      setError("Kellotus epäonnistui");
    }
  };

  const handleLateArrival = () => {

  }

  return (
    <>
      <div className="button-group">
        <button type="button" onClick={handleClockIn}>Kellota</button>
        <button type="button" onClick={onBreak}>Olen myöhässä luvalla</button>
        <button type="button" onClick={onClockOut}>Tarkastele saapumisaikoja</button>
      </div>
      {message && <div className="clocking-message" role="status">{message}</div>}
      {error && <div className="clocking-error" role="alert">{error}</div>}
    </>
  );
};

export default Clocking;
