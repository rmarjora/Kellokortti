import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStaff } from '../store/staffSlice';
import Contact from './Contact';

const ContactList = () => {
  const dispatch = useDispatch();
  const { items: staff, status, error } = useSelector(state => state.staff);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchStaff());
  }, [status, dispatch]);
  
  const content = status === 'loading' ? <div>Ladataan…</div> : staff.length === 0 ? <p>Henkilökuntaa ei ole</p> : (
    <div>
      {staff.map((s) => (
        <Contact key={s.id} staff={s} />
      ))}
    </div>
  );

  return (
    <div>
  <h2>Henkilökunnan yhteystiedot:</h2>
  {error && <div className="clocking-error">{error}</div>}
      {content}
    </div>
  );
}

export default ContactList;