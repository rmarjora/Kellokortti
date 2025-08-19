import useField from "../hooks/useField";
import { useEffect, useState } from "react";

const PersonLogin = ({ person }) => {
  const [passwordHash, setPasswordHash] = useState(undefined);
  const password = useField();

  if (!person) return <h2>Something went wrong</h2>;

  useEffect(() => {
    setPasswordHash(undefined);
    const fetchPasswordHash = async () => {
      try {
        const hash = await window.api.getPasswordHash(person.id);
        setPasswordHash(hash);
      } catch (error) {
        console.error('Failed to fetch password hash:', error);
      }
    };
    fetchPasswordHash();
  }, [person]);

  if (passwordHash === undefined) return <div>Loading…</div>;

  const handleSubmit = async event => {
    event.preventDefault();
    event.stopPropagation(); // Prevent popup from closing on submit

    if(!passwordHash) {
      try {
        window.api.setPasswordHash(person.id, password.value);
      } catch (error) {
        console.error('Failed to set password hash:', error);
      }
    } else {
      
    }
  }

  return (
    <>
      <h3>{passwordHash ? 'Enter password for ' : 'Create a password for '}{person.name}</h3>
      <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); /* handle submit here without closing popup */ }}>
        <input type="password" onChange={password.onChange} value={password.value} className="popup-input" />
        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default PersonLogin;