import { useEffect, useState } from 'react';

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    window.api.getUsers().then(setUsers);
  }, []);

  const addUser = () => {
    const newUser = { name: 'Alice', email: 'alice@example.com' };
    window.api.addUser(newUser).then(user => setUsers(prev => [...prev, user]));
  };

  const clearUsers = () => {
    window.api.clearUsers().then(() => setUsers([]));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Users</h1>
      <button onClick={addUser}>Add User</button>
      <ul>
        {users.map(u => <li key={u.id}>{u.name}</li>)}
      </ul>
      <button onClick={clearUsers}>Clear users</button>
    </div>
  );
}

export default App;
