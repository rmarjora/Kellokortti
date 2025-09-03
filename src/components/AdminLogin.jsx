import { useEffect, useState } from 'react';
import useField from '../hooks/useField';

const AdminLogin = ({ onSuccess }) => {
  const password = useField();
  const confirm = useField();
  const [exists, setExists] = useState(undefined);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const ex = await window.api.adminPasswordExists();
        if (!mounted) return;
        setExists(!!ex);
      } catch (e) {
        console.error('adminPasswordExists failed', e);
        setExists(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (exists === undefined) return <div>Loading…</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
  if (!exists) {
        // Create admin password path
        if (password.value.trim().length < 4) {
          setError('Salasanan tulee olla vähintään 4 merkkiä');
          return;
        }
        if (password.value !== confirm.value) {
          setError('Salasanat eivät täsmää');
          return;
        }
        await window.api.setAdminPassword(password.value);
        onSuccess?.();
        return;
      }

      // Verify existing admin password
      const ok = await window.api.compareAdminPassword(password.value);
      if (ok) {
        onSuccess?.();
      } else {
        setError('Väärä salasana');
      }
    } catch (e) {
      console.error('Admin login failed', e);
      setError('Virhe kirjautumisessa');
    }
  };

  const handleReset = async () => {
    if (!exists) return;
    if (!confirmReset) {
      setConfirmReset(true);
      setInfo('Vahvista nollaus painamalla "Vahvista nollaus".');
      return;
    }
    try {
      setResetting(true);
      setError('');
      await window.api.clearAdminPassword();
      setExists(false);
      password.reset();
      confirm.reset();
      setInfo('Admin-salasana nollattu. Luo uusi salasana.');
    } catch (e) {
      console.error('clearAdminPassword failed', e);
      setError('Salasanan nollaaminen epäonnistui');
    } finally {
      setResetting(false);
      setConfirmReset(false);
    }
  };

  return (
    <div>
      <h2>Ylläpitäjän kirjautuminen</h2>
      {!exists && (
        <div style={{ marginBottom: 8 }}>
          <p>Admin-salasanaa ei ole asetettu. Luo salasana aloittaaksesi.</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="popup-form">
        <input
          type="password"
          placeholder={exists ? 'Salasana' : 'Uusi salasana'}
          onChange={password.onChange}
          value={password.value}
          className="popup-input"
          style={{ width: 314 }}
        />
        {!exists && (
          <input
            type="password"
            placeholder="Vahvista salasana"
            onChange={confirm.onChange}
            value={confirm.value}
            className="popup-input"
            style={{ width: 314, marginTop: 8 }}
          />
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button type="submit">{exists ? 'Kirjaudu' : 'Luo salasana'}</button>
        </div>
      </form>
      {exists && (
        <div style={{ marginTop: 12 }}>
          <button type="button" onClick={handleReset} disabled={resetting}>
            {confirmReset ? 'Vahvista nollaus' : 'Nollaa admin-salasana (väliaikainen)'}
          </button>
          {confirmReset && (
            <button type="button" onClick={() => { setConfirmReset(false); setInfo(''); }} style={{ marginLeft: 8 }}>
              Peruuta
            </button>
          )}
        </div>
      )}
      <div className="popup-error">{error}</div>
      {info && <div className="badge">{info}</div>}
    </div>
  );
};

export default AdminLogin;