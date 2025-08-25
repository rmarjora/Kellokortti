import { useState } from 'react';
import useDB from './hooks/useDB';
import NameList from './components/NameList';
import Login from './components/Login';

function App() {
  const { users, addUser, clearUsers } = useDB();
  const [nameInput, setNameInput] = useState('');

  console.log('Users:', users);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Users</h1>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Enter name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          style={{ padding: '0.5rem', flex: '0 0 200px' }}
        />
        <button
          onClick={() => {
            const name = nameInput.trim();
            if (!name) return;
            addUser({ name });
            setNameInput('');
          }}
          disabled={!nameInput.trim()}
        >
          Add User
        </button>
      </div>
  <NameList people={users} addPerson={addUser} />
  <button onClick={clearUsers}>Clear users</button>
  <button onClick={window.api.clearAllPasswords}>Clear all passwords</button>
  <Login />
    </div>
  );
}

export default App;
