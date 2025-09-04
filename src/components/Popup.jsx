import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const Popup = ({ open, onClose, exitText, children }) => {
  if (!open) return null;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const modalRef = useRef(null);

  // Lock scroll while the popup is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Move focus into the modal and trap focus within it
  useEffect(() => {
    const prev = document.activeElement;
    const modalEl = modalRef.current;
    modalEl?.focus();

    const getFocusable = () => {
      if (!modalEl) return [];
      return Array.from(
        modalEl.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
    };

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusables = getFocusable();
      if (focusables.length === 0) {
        // Keep focus on modal container if nothing focusable
        e.preventDefault();
        modalEl?.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === modalEl) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    modalEl?.addEventListener('keydown', onKeyDown);
    return () => {
      modalEl?.removeEventListener('keydown', onKeyDown);
      if (prev && typeof prev.focus === 'function') prev.focus();
    };
  }, []);

  return createPortal(
    <div className="popup-overlay">
      <div
        className="popup-modal"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popup-content">
          {children}
        </div>
        <div className="popup-actions">
          <button className="back" type="button" onClick={onClose}>{exitText}</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Popup;