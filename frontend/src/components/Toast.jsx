import React, { useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastContext } from './ToastContextStore';
import { useLanguage } from '../contexts/useLanguage';

export function ToastProvider({ children }) {
  const { tr } = useLanguage();
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast-card">
            {t.type === 'success' && <CheckCircle2 size={18} color="color-mix(in srgb, var(--palette-teal) 45%, var(--palette-navy))" />}
            {t.type === 'error' && <AlertCircle size={18} color="var(--palette-teal)" />}
            {t.type === 'info' && <Info size={18} color="color-mix(in srgb, var(--palette-teal) 45%, var(--palette-navy))" />}
            <span>{tr(t.message)}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{ background: 'none', border: 'none', color: 'var(--palette-teal)', cursor: 'pointer', marginLeft: 'auto' }}
              aria-label={tr('Mbyll njoftimin')}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
