/* Toast notification */
import { useEffect, useState } from 'react';

export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span className="toast-icon">{type === 'success' ? '✓' : '✕'}</span>
      <span>{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss">×</button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);

  function show(message, type = 'success') {
    setToast({ message, type, key: Date.now() });
  }

  function hide() {
    setToast(null);
  }

  return { toast, show, hide };
}

