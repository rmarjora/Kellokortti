import { use, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, addStudentAsync, clearStudentsAsync } from './store/studentsSlice';
import NameList from './components/NameList';
import ContactList from './components/ContactList';
import useField from './hooks/useField';
import Settings from './components/Settings';
import Popup from './components/Popup';
import AdminLogin from './components/AdminLogin';
import AddStaff from './components/AddStaff';
import CurrentTime from './components/CurrentTime';
import Weather from './components/Weather';

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
  const [message, setMessage] = useState('');
  const titleInputRef = useRef(null);
  const subtitleInputRef = useRef(null);
  const prevTitleRef = useRef('');
  const prevSubtitleRef = useRef('');

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  // Global keycard scan handling on homepage in non-admin mode
  useEffect(() => {
    let unsub;
    if (!isAdmin) {
      unsub = window.api.onKeycardScanned(async (payload) => {
        const uid = typeof payload === 'string' ? payload : payload?.uid;
        if (!uid) return;
        try {
          const person = await window.api.getUserByCardUid(uid);
          if (person) {
            // Fire a DOM event that NameList listens to
            window.dispatchEvent(new CustomEvent('open-user-panel', { detail: person }));
          }
        } catch (e) {
          console.error('getUserByCardUid failed', e);
        }
      });
    }
    return () => { if (unsub) { try { unsub(); } catch (_) {} } };
  }, [isAdmin]);

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

  const handleAddStudent = async (event) => {
    event.preventDefault();
    const studentName = name.value.trim();
    console.log("Adding student:", studentName);
    if (!studentName) return;
    try {
      await dispatch(addStudentAsync({ name: studentName })).unwrap();
      // Force refresh to ensure list reflects DB state
      await dispatch(fetchStudents());
      name.setValue('');
    } catch (e) {
      console.error('Failed to add student', e);
      // Optional: surface error to user later if desired
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

  const handleResetPassword = async (event) => {
    event.preventDefault();
    try {
      await window.api.clearAdminPassword();
      setMessage('Salasana nollattu');
    } catch (e) {
      console.error('Failed to reset admin password', e);
      setMessage('Salasanan nollaaminen epäonnistui');
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
      <CurrentTime />
      <Weather />
      <NameList people={students} supervised={isAdmin} />
  {isAdmin && 
  <div className='admin-panel'>
    <form onSubmit={handleAddStudent}>
      <input type="text" placeholder="nimi" onChange={name.onChange} value={name.value}/>
      <button type="submit">Lisää nimi</button>
    </form>
    <button onClick={() => setShowSettings(true)}>Työpäivän asetukset</button>
    <Popup open={showSettings} onClose={() => setShowSettings(false)} exitText="Sulje"><Settings /></Popup>
    <button onClick={() => setShowAddStaff(true)}>Lisää henkilökuntaa</button>
    <Popup open={showAddStaff} onClose={() => setShowAddStaff(false)} exitText="Takaisin"><AddStaff /></Popup>
    <button className="reset"onClick={handleResetPassword}>Nollaa ylläpitäjän salasana</button>
    {message && <div className='badge'>{message}</div>}
  </div>}
    {isAdmin ? (
      <button className='back' onClick={() => setIsAdmin(false)}>
        Ylläpitäjän uloskirjautuminen
      </button>
    ) : (
      <button onClick={() => {
        setShowAdminLogin(true);
        setMessage('');
      }}>
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
