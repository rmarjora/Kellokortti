import { useState } from 'react';
import useDB from './hooks/useDB';
import NameList from './components/NameList';
import SupervisorLogin from './components/SupervisorLogin';
import Contact from './components/Contact';
import useField from './hooks/useField';
import Settings from './components/Settings';
import Popup from './components/Popup';

function App() {
  const { students, addStudent, clearStudents } = useDB();
  const name = useField()
  const [supervisor, setSupervisor] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  console.log('Students:', students);

  const handleAddStudent = () => {
    const studentName = name.value.trim();
    if (studentName) {
      addStudent({ name: studentName });
      name.setValue('');
    }
  };

  return (
    <div className="app">
      <div className="floating-blob blob-1" />
      <div className="floating-blob blob-2" />
      <h1>Kellokortti - Digitalents Academy</h1>
      <h2>Tervetuloa pajalle!</h2>
      <div className="card" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        
      </div>
  <NameList people={students} supervised={!!supervisor || isAdmin} />
  {isAdmin && 
  <div>
    <h3>Admin Panel</h3>
    <input type="text" onChange={name.onChange} value={name.value}/>
    <button onClick={handleAddStudent}>Lisää henkilö</button>
    <button onClick={() => setShowSettings(true)}>Asetukset</button>
    <Popup open={showSettings} onClose={() => setShowSettings(false)} exitText="Sulje"><Settings /></Popup>
  </div>}
  <SupervisorLogin onLogin={setSupervisor} onLogout={() => setSupervisor(null)} />
    <button onClick={() => setIsAdmin(!isAdmin)}>
      {isAdmin ? 'Hide Admin Panel' : 'Show Admin Panel'}
    </button>
  <footer>
    <Contact />
  </footer>
    </div>
  );
}

export default App;
