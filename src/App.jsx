import { useState } from 'react';
import useDB from './hooks/useDB';
import NameList from './components/NameList';
import Login from './components/Login';

function App() {
  const { students, addStudent, clearStudents } = useDB();
  const [nameInput, setNameInput] = useState('');

  console.log('Students:', students);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Students</h1>
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
            addStudent({ name });
            setNameInput('');
          }}
          disabled={!nameInput.trim()}
        >
          Add Student
        </button>
      </div>
  <NameList people={students} />
  <button onClick={clearStudents}>Clear students</button>
  <button onClick={window.api.clearAllPasswords}>Clear all passwords</button>
  <button onClick={window.api.clearAllArrivals}>Clear all arrivals</button>
  <Login />
    </div>
  );
}

export default App;
