import useField from "../hooks/useField";
import { useEffect, useState } from "react";

const PersonLogin = ({ person, onSuccess }) => {
  const password = useField();
  const [hasPassword, setHasPassword] = useState(undefined);
  const [error, setError] = useState("");

  if (!person) return <h2>Something went wrong</h2>;

  useEffect(() => {
    setHasPassword(undefined);
  setError("");
  password.reset();
    const fetchHasPassword = async () => {
      try {
        setHasPassword(await window.api.hasPassword(person.id));
      } catch (error) {
        console.error('Failed to fetch hasPassword:', error);
      }
    };
    fetchHasPassword();
  }, [person]);

  if (hasPassword === undefined) return <div>Loading…</div>;

  const handleSubmit = async event => {
    event.preventDefault();
    event.stopPropagation(); // Prevent popup from closing on submit

    if(!hasPassword) {
      // Create a new password
      try {
        await window.api.setPassword(person.id, password.value);
        setHasPassword(true);
        setError("");
        // Mount Clocking on success
        onSuccess?.(person);
      } catch (error) {
        console.error('Failed to set password:', error);
      }
    } else {
      // Verify existing password
      const isValid = await window.api.comparePassword(person.id, password.value);
      setError(isValid ? "" : "Invalid password");
      if (isValid) {
        // Mount Clocking on success
        onSuccess?.(person);
      }
    }
  }

  return (
    <>
      <h3>{hasPassword ? 'Enter password for ' : 'Create a password for '}{person.name}</h3>
  <form onSubmit={handleSubmit} className="popup-form">
        <input type="password" onChange={password.onChange} value={password.value} className="popup-input" />
        <button type="submit">Submit</button>
      </form>
      <div className="popup-error">{error}</div>
    </>
  );
};

export default PersonLogin;