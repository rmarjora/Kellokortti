import { useEffect, useRef, useState, useCallback } from "react";
import Popup from "./Popup";
import applePaySfx from '../assets/apple_pay.mp3';
import xpErrorSfx from "../assets/windows_xp_error.mp3";

const KeycardsList = ({ user }) => {
	const [keycards, setKeycards] = useState([]);
	const [showScanPopup, setShowScanPopup] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const keycardUnsubRef = useRef(null);
	const sfxRef = useRef(null);
	const errorSfxRef = useRef(null);

	// Preload confirm sound
	useEffect(() => {
		const a = new Audio(applePaySfx);
		a.preload = 'auto';
		sfxRef.current = a;
		// Preload error sound too
		const e = new Audio(xpErrorSfx);
		e.preload = 'auto';
		errorSfxRef.current = e;
		return () => { try { a.pause(); } catch {} sfxRef.current = null; try { e.pause(); } catch {} errorSfxRef.current = null; };
	}, []);

	const playChime = useCallback(() => {
		const a = sfxRef.current; if (!a) return; a.currentTime = 0; a.play().catch(() => {});
	}, []);

	const playError = useCallback(() => {
		const a = errorSfxRef.current; if (!a) return; a.currentTime = 0; a.play().catch(() => {});
	}, []);

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
					// Play confirmation sound on successful add
					playChime();
				} else {
					console.error("Failed to add keycard");
					setError("Tämä avain on jo käytössä");
					playError();
				}
			} catch (e) {
				console.error('Failed to add keycard:', e);
				const msg = String(e?.message || e).toLowerCase();
				if (msg.includes('duplicate') || msg.includes('already')) {
					setError("Tämä avain on jo käytössä");
					playError();
				}
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