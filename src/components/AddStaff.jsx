import useField from "../hooks/useField"
import { useDispatch } from 'react-redux';
import { addStaffAsync } from '../store/staffSlice';
import { useState } from "react";

const AddStaff = () => {
	const dispatch = useDispatch();
	const name = useField()
	const email = useField()
	const phone1 = useField()
	const phone2 = useField()
	const [message, setMessage] = useState(null)

	const handleSubmit = async (e) => {
		e.preventDefault()
		const payload = {
			name: name.value.trim(),
			email: email.value.trim(),
			phone1: phone1.value.trim(),
			phone2: phone2.value.trim()
		};
		if (!payload.name) return;
		await dispatch(addStaffAsync(payload));
		name.reset();
		email.reset();
		phone1.reset();
		phone2.reset();
		setMessage('Henkilökunta lisätty onnistuneesti');
	};

	return (
		<div>
			<h2>Uusi henkilökunnan jäsen</h2>
			<form onSubmit={handleSubmit}>
				<input type="text" placeholder="nimi" {...name} />
				<input type="email" placeholder="sähköposti" {...email} />
				<input type="tel" placeholder="puhelin 1" {...phone1} />
				<input type="tel" placeholder="puhelin 2" {...phone2} />
				<button type="submit" className="submit-button">Lisää</button>
			</form>
			{message && <span className="badge">{message}</span>}
		</div>
	)
}

export default AddStaff;