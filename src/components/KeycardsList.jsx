import { useEffect, useRef, useState } from "react";
import Popup from "./Popup";

const KeycardsList = ({ user }) => {
	const [keycards, setKeycards] = useState([]);
	const [showScanPopup, setShowScanPopup] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const keycardUnsubRef = useRef(null);

	// Mask all but the last 4 characters of the UID
	const maskUid = (uid) => {
		if (!uid && uid !== 0) return "";
		const s = String(uid);
		if (s.length <= 4) return s;
		return "*".repeat(s.length - 4) + s.slice(-4);
	};

	useEffect(() => {
		const fetchKeycards = async () => {
			try {
				const response = await window.api.getCards(user.id);
				setKeycards(response);
			} catch (error) {
				console.error("Failed to fetch keycards:", error);
			}
		};

		fetchKeycards();

		// Cleanup any listener on unmount
		return () => {
			// Clear capture flag if we unmount mid-flow
			if (typeof window !== 'undefined') {
				window.__keycardCaptureActive = false;
			}
			if (keycardUnsubRef.current) {
				try { keycardUnsubRef.current(); } catch (_) {}
				keycardUnsubRef.current = null;
			}
		};
	}, [user?.id]);

	const addKeycard = async () => {
		// Avoid multiple concurrent listeners
		setMessage("");
		setError("");
		if (keycardUnsubRef.current) {
			try { keycardUnsubRef.current(); } catch (_) {}
			keycardUnsubRef.current = null;
		}

		setShowScanPopup(true);
		// Signal that we are capturing the next keycard exclusively
		if (typeof window !== 'undefined') {
			window.__keycardCaptureActive = true;
		}
		console.log('Waiting for keycard scan...');
		const unsubscribe = window.api.onKeycardScanned(async (payload) => {
			const uid = typeof payload === 'string' ? payload : payload?.uid;
			console.log('Keycard scanned payload:', payload, 'resolved uid:', uid);
			if (!uid) {
				console.warn('No UID provided in keycard scan payload');
				return;
			}
			try {
				const newCard = await window.api.addCard(user.id, uid);
				console.log('New card added:', newCard);
				if (newCard) {
					setKeycards((prev) => [...prev, newCard]);
					setMessage("Avain lisätty");
				} else {
					console.error("Failed to add keycard");
					setError("Tämä avain on jo käytössä");
				}
			} catch (e) {
				console.error('Failed to add keycard:', e);
			} finally {
				setShowScanPopup(false);
				if (typeof window !== 'undefined') {
					window.__keycardCaptureActive = false;
				}
				if (keycardUnsubRef.current) {
					try { keycardUnsubRef.current(); } catch (_) {}
					keycardUnsubRef.current = null;
				}
			}
		});

		keycardUnsubRef.current = unsubscribe;
	}

	const removeKeycard = async (cardId) => {
		await window.api.deleteCard(cardId);
		setKeycards((prev) => prev.filter(card => card.id !== cardId));
	}

	const handleCancel = () => {
		setShowScanPopup(false);
		if (typeof window !== 'undefined') {
			window.__keycardCaptureActive = false;
		}
		if (keycardUnsubRef.current) {
			try { keycardUnsubRef.current(); } catch (_) {}
			keycardUnsubRef.current = null;
		}
	};

	return (
		<div className="keycards-list">
			<h2>Omat avaimet</h2>
			{keycards.length === 0 && <p>Ei avaimia</p>}
			{keycards.length > 0 && (
				<ul>
					{keycards.map((keycard) => (
						<li key={keycard.id}>
							{maskUid(keycard.uid)} <button onClick={() => removeKeycard(keycard.id)}>Poista</button>
						</li>
					))}
				</ul>
			)}
			<button onClick={addKeycard}>Lisää avain</button>
			{message && <p className="badge">{message}</p>}
			{error && <p className="popup-error error-red">{error}</p>}
			<Popup open={showScanPopup} onClose={handleCancel} exitText='Takaisin'>
				<h2>Skannaa avainlukija</h2>
				<p>Kosketa avaimella puhelinta</p>
			</Popup>
		</div>
	);
};

export default KeycardsList;