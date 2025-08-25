import { useState } from "react";

const Clocking = ({ person, onBreak, onClockOut }) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleClockIn = async () => {
    setMessage("");
    setError("");
    try {
      if (!person?.id) throw new Error("No person selected");
      await window.api.addArrival(person.id);
      setMessage(`Kellotettu ajassa ${new Date().toLocaleTimeString()}`);
    } catch (e) {
      console.error("Clock in failed:", e);
      setError("Kellotus epäonnistui");
    }
  };

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
