import { useEffect } from "react";
import { createPortal } from "react-dom";

const Popup = ({ open, onClose, children }) => {
  if (!open) return null;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {children}
        <div className="popup-actions">
          <button type="button" onClick={onClose}>Kirjaudu ulos</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Popup;