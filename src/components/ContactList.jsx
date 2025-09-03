import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStaff, deleteStaffAsync } from '../store/staffSlice';
import Contact from './Contact';
import Popup from './Popup';

const ContactList = ({ isAdmin = false }) => {
  const dispatch = useDispatch();
  const { items: staff, status, error } = useSelector(state => state.staff);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
  if (status === 'idle' && window?.api?.getStaff) dispatch(fetchStaff());
  }, [status, dispatch]);
  
  const handleDeleteWarning = (id) => {
    if (!isAdmin) return;
    setDeleteId(id);
    setShowConfirmDelete(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      dispatch(deleteStaffAsync(deleteId));
      setDeleteId(null);
    }
    setShowConfirmDelete(false);
  };

  const content = status === 'loading' ? <div>Ladataan…</div> : staff.length === 0 ? <p>Henkilökuntaa ei ole</p> : (
    <div>
      {staff.map((s) => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Contact staff={s} />
          {isAdmin && (
            <button onClick={() => handleDeleteWarning(s.id)} title="Poista henkilökunnasta">Poista</button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
    <div>
  <h2>Henkilökunnan yhteystiedot:</h2>
  {error && <div className="clocking-error">{error}</div>}
      {content}
    </div>
				<Popup open={showConfirmDelete} onClose={() => setShowConfirmDelete(false)} exitText='Peruuta'>
				<h2>Oletko varma, että haluat poistaa henkilön {staff.find(s => s.id === deleteId)?.name}?</h2>
				<p>Tämä poistaa kaikki annetut luvat pysyvästi.</p>
						<button onClick={handleDelete}>Poista</button>
			</Popup>
      </>
  );
}

export default ContactList;