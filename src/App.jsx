import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, addStudentAsync, clearStudentsAsync } from './store/studentsSlice';
import NameList from './components/NameList';
import SupervisorLogin from './components/SupervisorLogin';
import Contact from './components/Contact';
import useField from './hooks/useField';
import Settings from './components/Settings';
import Popup from './components/Popup';

function App() {
  const dispatch = useDispatch();
  const students = useSelector(state => state.students.items);
  const name = useField()
  const [supervisor, setSupervisor] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  const handleAddStudent = () => {
    const studentName = name.value.trim();
    if (studentName) {
  dispatch(addStudentAsync({ name: studentName }));
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
    {isAdmin && (
      <button onClick={() => dispatch(clearStudentsAsync())}>Tyhjennä opiskelijat</button>
    )}
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
