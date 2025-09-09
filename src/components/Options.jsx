import Popup from "./Popup";
import ClockingTable from "./ClockingTable";
import KeycardsList from "./KeycardsList";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteStudentAsync } from "../store/studentsSlice";

const Options = ({ user, supervised, onDeleted }) => {
	const [showTable, setShowTable] = useState(false);
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);
	const [showKeycards, setShowKeycards] = useState(false);
	const [message, setMessage] = useState("");
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

	const handleResetPassword = async () => {
		await window.api.clearPassword(user.id);
		setMessage("Salasana nollattu");
	};

	return (
		<div>
			<button onClick={() => setShowTable(true)}>Tarkastele kellotuksia</button>
			<button className="reset" onClick={handleResetPassword}>Nollaa salasana</button>
			<button onClick={() => setShowKeycards(true)}>Tarkastele avaimia</button>
			{supervised && <button onClick={() => setShowConfirmDelete(true)}>Poista henkilö</button>}
			{message && <span className="badge">{message}</span>}
			<Popup open={showTable} onClose={() => setShowTable(false)} exitText='Sulje'>
				<ClockingTable user={user} />
			</Popup>
					<Popup open={showConfirmDelete} onClose={() => setShowConfirmDelete(false)} exitText='Peruuta'>
				<h2>Oletko varma, että haluat poistaa käyttäjän?</h2>
				<p>Tämä poistaa käyttäjän ja kaikki hänen kellotuksensa pysyvästi.</p>
						<button className="danger" onClick={handleDelete}>Poista</button>
			</Popup>
			<Popup open={showKeycards} onClose={() => setShowKeycards(false)} exitText='Sulje'>
				<KeycardsList user={user} />
			</Popup>
		</div>
	)
}

export default Options;