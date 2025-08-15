import { useEffect, useState } from 'react';
import NameList from './components/NameList';

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
  window.api.getPersons().then(setUsers);
  }, []);

  const addPerson = () => {
    const newUser = { name: 'Alice', email: 'alice@example.com' };
  window.api.addPerson(newUser).then(person => setUsers(prev => [...prev, person]));
  };

  const clearPersons = () => {
  window.api.clearPersons().then(() => setUsers([]));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Users</h1>
  <button onClick={addPerson}>Add Person</button>
      <NameList />
  <button onClick={clearPersons}>Clear persons</button>
    </div>
  );
}

export default App;
