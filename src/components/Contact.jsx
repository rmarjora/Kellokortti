const Contact = ({ staff }) => {
	if (!staff) return null;
	const { id, name, email, phone1, phone2 } = staff;
	const parts = [];
	if (email) parts.push(email);
	const phones = [phone1, phone2].filter(Boolean).join(', ');
	if (phones) parts.push(phones);
	const line = `${name}: ${parts.join(' / ') || '-'}`;
	return <div>{line}</div>;
}

export default Contact;