import useField from "../hooks/useField"

const AddStaff = () => {
	const name = useField()
	const email = useField()
	const phone1 = useField()
	const phone2 = useField()

	const handleSubmit = (e) => {
		e.preventDefault()
		window.api.addStaff(trim(name.value), trim(email.value), trim(phone1.value), trim(phone2.value))
		console.log("Staff added:", { name: name.value, email: email.value, phone1: phone1.value, phone2: phone2.value })
	}

	return (
		<div>
			<h2>Uusi henkilökunnan jäsen</h2>
			<form onSubmit={handleSubmit}>
				<input type="text" placeholder="name" {...name} />
				<input type="email" placeholder="sähköposti" {...email} />
				<input type="tel" placeholder="puhelin 1" {...phone1} />
				<input type="tel" placeholder="puhelin 2" {...phone2} />
				<button type="submit" className="submit-button">Lisää</button>
			</form>
		</div>
	)
}

export default AddStaff;