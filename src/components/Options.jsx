import Popup from "./Popup";
import ClockingTable from "./ClockingTable";
import { useState } from "react";

const Options = ({ user }) => {
	const [showPopup, setShowPopup] = useState(false);

	return (
		<div>
			<button onClick={() => setShowPopup(true)}>Tarkastele kellotuksia</button>
			<button onClick={() => console.log("Option 2 selected")}>Muuta salasanaa</button>
			<Popup open={showPopup} onClose={() => setShowPopup(false)} exitText='Sulje'>
				<ClockingTable user={user} />
			</Popup>
		</div>
	)
}

export default Options;