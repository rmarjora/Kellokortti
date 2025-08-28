import Popup from "./Popup";
import ClockingTable from "./ClockingTable";
import { useState } from "react";

const Options = ({ user, supervised }) => {
	const [showTable, setShowTable] = useState(false);
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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
			</Popup>
		</div>
	)
}

export default Options;