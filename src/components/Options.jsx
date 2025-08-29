import Popup from "./Popup";
import ClockingTable from "./ClockingTable";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteStudentAsync } from "../store/studentsSlice";

const Options = ({ user, supervised, onDeleted }) => {
	const [showTable, setShowTable] = useState(false);
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);
	const dispatch = useDispatch();

		const handleDelete = async () => {
			try {
				await dispatch(deleteStudentAsync(user)).unwrap();
				setShowConfirmDelete(false);
				onDeleted?.();
			} catch (e) {
				console.error('Failed to delete student', e);
			}
		};

	return (
		<div>
			<button onClick={() => setShowTable(true)}>Tarkastele kellotuksia</button>
			{!supervised && <button onClick={() => console.log("Option 2 selected")}>Muuta salasanaa</button>}
			{supervised && <button onClick={() => setShowConfirmDelete(true)}>Poista henkilö</button>}
			<Popup open={showTable} onClose={() => setShowTable(false)} exitText='Sulje'>
				<ClockingTable user={user} />
			</Popup>
					<Popup open={showConfirmDelete} onClose={() => setShowConfirmDelete(false)} exitText='Peruuta'>
				<h2>Oletko varma, että haluat poistaa käyttäjän?</h2>
				<p>Tämä poistaa käyttäjän ja kaikki hänen kellotuksensa pysyvästi.</p>
						<button onClick={handleDelete}>Poista</button>
			</Popup>
		</div>
	)
}

export default Options;