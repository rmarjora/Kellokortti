import { useEffect, useState } from 'react';

const Contact = () => {
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await window.api.getStaffList();
        if (mounted) setStaff(list);
      } catch (e) {
        console.error('Failed to load staff list', e);
        if (mounted) setError('Yhteystietojen lataus epäonnistui');
      }
    })();
    return () => { mounted = false; };
  }, []);

  const content = !staff? <div>Ladataan…</div> : staff.length === 0 ? <p>Henkilökuntaa ei ole</p> : (
    <div>
      {staff.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );

  return (
    <div>
      <h2>Henkilökunnan yhteystiedot:</h2>
      {content}
    </div>
  );
}

export default Contact;