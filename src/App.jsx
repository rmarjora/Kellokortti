import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, addStudentAsync, clearStudentsAsync } from './store/studentsSlice';
import NameList from './components/NameList';
import Contact from './components/Contact';
import useField from './hooks/useField';
import Settings from './components/Settings';
import Popup from './components/Popup';
import AddStaff from './components/AddStaff';

function App() {
  const dispatch = useDispatch();
  const students = useSelector(state => state.students.items);
  const name = useField()
  const [supervisor, setSupervisor] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);

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
      <h1 className='app-title'>Kellokortti - Digitalents Academy</h1>
      <h2 className='app-subtitle'>Tervetuloa pajalle!</h2>
  <NameList people={students} supervised={!!supervisor || isAdmin} />
  {isAdmin && 
  <div>
    <h3>Admin Panel</h3>
    <input type="text" onChange={name.onChange} value={name.value}/>
    <button onClick={handleAddStudent}>Lisää henkilö</button>
    <button onClick={() => setShowSettings(true)}>Asetukset</button>
    <Popup open={showSettings} onClose={() => setShowSettings(false)} exitText="Sulje"><Settings /></Popup>
    <button onClick={() => setShowAddStaff(true)}>Lisää henkilökuntaa</button>
    <Popup open={showAddStaff} onClose={() => setShowAddStaff(false)} exitText="Takaisin"><AddStaff /></Popup>
  </div>}
    {isAdmin && (
      <button onClick={() => dispatch(clearStudentsAsync())}>Tyhjennä opiskelijat</button>
    )}
    <button onClick={() => setIsAdmin(!isAdmin)}>
      {isAdmin ? 'Hide Admin Panel' : 'Show Admin Panel'}
    </button>
  <footer className="app-footer">
    <Contact />
  </footer>
    </div>
  );
}

export default App;
