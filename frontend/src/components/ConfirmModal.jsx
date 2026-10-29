import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/useLanguage';

export default function ConfirmModal({
  isOpen,
  title = 'A jeni të sigurt?',
  message = 'Ky veprim nuk mund të kthehet prapa.',
  confirmText = 'Po, vazhdo',
  cancelText = 'Anulo',
  isDanger = false,
  onConfirm,
  onClose
}) {
  const { tr } = useLanguage();
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="modal-box glass"
            style={{
              maxWidth: '440px',
              width: '100%',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isDanger && (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--color-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AlertTriangle size={20} />
                  </div>
                )}
                <h3 className="modal-title" id="confirm-modal-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {tr(title)}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition-fast)'
                }}
                aria-label={tr('Mbyll dialogun')}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ marginBottom: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                {tr(message)}
              </p>
            </div>

            <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <motion.button
                type="button"
                className="btn btn-glass"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tr(cancelText)}
              </motion.button>
              <motion.button
                type="button"
                className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
                onClick={onConfirm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tr(confirmText)}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
