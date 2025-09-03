import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, addStudentAsync, clearStudentsAsync } from './store/studentsSlice';
import NameList from './components/NameList';
import ContactList from './components/ContactList';
import useField from './hooks/useField';
import Settings from './components/Settings';
import Popup from './components/Popup';
import AdminLogin from './components/AdminLogin';
import AddStaff from './components/AddStaff';

function App() {
  const dispatch = useDispatch();
  const students = useSelector(state => state.students.items);
  const name = useField()
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [appTitle, setAppTitle] = useState('Kellokortti - Digitalents Academy');
  const [appSubtitle, setAppSubtitle] = useState('Tervetuloa pajalle!');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const titleInputRef = useRef(null);
  const subtitleInputRef = useRef(null);
  const prevTitleRef = useRef('');
  const prevSubtitleRef = useRef('');

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  // Load title and subtitle from settings
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [t, s] = await Promise.all([
          window.api.getSetting('title'),
          window.api.getSetting('subtitle')
        ]);
        if (!mounted) return;
        if (t != null) setAppTitle(String(t));
        if (s != null) setAppSubtitle(String(s));
      } catch (e) {
        console.error('Failed to load title/subtitle', e);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleAddStudent = (event) => {
    event.preventDefault();
    const studentName = name.value.trim();
    if (studentName) {
  dispatch(addStudentAsync({ name: studentName }));
      name.setValue('');
    }
  };

  const handleSaveTitle = async (val) => {
    const newVal = (val ?? appTitle).trim();
    try {
      setAppTitle(newVal);
      await window.api.setSetting('title', newVal);
    } catch (e) {
      console.error('Failed to save title', e);
    } finally {
      setEditingTitle(false);
    }
  };

  const handleSaveSubtitle = async (val) => {
    const newVal = (val ?? appSubtitle).trim();
    try {
      setAppSubtitle(newVal);
      await window.api.setSetting('subtitle', newVal);
    } catch (e) {
      console.error('Failed to save subtitle', e);
    } finally {
      setEditingSubtitle(false);
    }
  };

  return (
    <div className="app">
  {editingTitle ? (
        <input
          ref={titleInputRef}
          className='app-title'
          style={{ width: '100%', font: 'inherit', textAlign: 'center' }}
          type="text"
          value={appTitle}
          onChange={(e) => setAppTitle(e.target.value)}
          onBlur={() => handleSaveTitle(appTitle)}
          onKeyDown={(e) => {
    if (e.key === 'Enter') handleSaveTitle(appTitle);
    if (e.key === 'Escape') { setAppTitle(prevTitleRef.current); setEditingTitle(false); }
          }}
          autoFocus
        />
      ) : (
        <h1
          className='app-title'
          title={isAdmin ? 'Klikkaa muokataksesi otsikkoa' : undefined}
      onClick={() => { if (isAdmin) { prevTitleRef.current = appTitle; setEditingTitle(true); } }}
          style={isAdmin ? { cursor: 'text' } : undefined}
        >
          {appTitle}
        </h1>
      )}

  {editingSubtitle ? (
        <input
          ref={subtitleInputRef}
          className='app-subtitle'
          style={{ width: '100%', font: 'inherit', textAlign: 'center' }}
          type="text"
          value={appSubtitle}
          onChange={(e) => setAppSubtitle(e.target.value)}
          onBlur={() => handleSaveSubtitle(appSubtitle)}
          onKeyDown={(e) => {
    if (e.key === 'Enter') handleSaveSubtitle(appSubtitle);
    if (e.key === 'Escape') { setAppSubtitle(prevSubtitleRef.current); setEditingSubtitle(false); }
          }}
          autoFocus
        />
      ) : (
        <h2
          className='app-subtitle'
          title={isAdmin ? 'Klikkaa muokataksesi alaotsikkoa' : undefined}
      onClick={() => { if (isAdmin) { prevSubtitleRef.current = appSubtitle; setEditingSubtitle(true); } }}
          style={isAdmin ? { cursor: 'text' } : undefined}
        >
          {appSubtitle}
        </h2>
      )}
  <NameList people={students} supervised={isAdmin} />
  {isAdmin && 
  <div>
    <form onSubmit={handleAddStudent}>
      <input type="text" placeholder="nimi" onChange={name.onChange} value={name.value}/>
      <button type="submit" onClick={handleAddStudent}>Lisää nimi</button>
    </form>
    <button onClick={() => setShowSettings(true)}>Työpäivän asetukset</button>
    <Popup open={showSettings} onClose={() => setShowSettings(false)} exitText="Sulje"><Settings /></Popup>
    <button onClick={() => setShowAddStaff(true)}>Lisää henkilökuntaa</button>
    <Popup open={showAddStaff} onClose={() => setShowAddStaff(false)} exitText="Takaisin"><AddStaff /></Popup>
  </div>}
    {isAdmin ? (
      <button onClick={() => setIsAdmin(false)}>
        Ylläpitäjän uloskirjautuminen
      </button>
    ) : (
      <button onClick={() => setShowAdminLogin(true)}>
        Ylläpitäjän kirjautuminen
      </button>
    )}
    <Popup open={showAdminLogin} onClose={() => setShowAdminLogin(false)} exitText="Peruuta">
      <AdminLogin onSuccess={() => { setIsAdmin(true); setShowAdminLogin(false); }} />
    </Popup>
  <footer className="app-footer">
    <ContactList isAdmin={isAdmin} />
  </footer>
    </div>
  );
}

export default App;
