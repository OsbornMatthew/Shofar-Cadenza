import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const ConfirmModal = () => {
  const { confirmModalState, closeConfirmModal } = useAudio();

  if (!confirmModalState || !confirmModalState.isOpen) return null;

  const {
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Delete',
    isDestructive = true,
    onConfirm
  } = confirmModalState;

  const handleConfirmClick = () => {
    const action = onConfirm;
    closeConfirmModal();
    if (typeof action === 'function') {
      action();
    }
  };

  return (
    <div className="modal-overlay" onClick={closeConfirmModal} style={{ zIndex: 200 }}>
      <div
        className="modal-content-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 440,
          borderRadius: 24,
          padding: '24px 20px',
          border: isDestructive ? '1px solid rgba(255, 107, 107, 0.4)' : '1px solid var(--border-gold-strong)',
          background: 'rgba(16, 16, 22, 0.97)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)'
        }}
      >
        {/* Header Icon + Close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: isDestructive ? 'rgba(255, 107, 107, 0.14)' : 'rgba(212, 175, 55, 0.14)',
            border: isDestructive ? '1.5px solid #ff6b6b' : '1.5px solid var(--gold-flat)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isDestructive ? (
              <Trash2 size={20} color="#ff6b6b" />
            ) : (
              <AlertTriangle size={20} color="var(--gold-flat)" />
            )}
          </div>

          <button
            onClick={closeConfirmModal}
            className="btn-icon"
            style={{ width: 32, height: 32 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Title & Message */}
        <h3 className="font-modern-heading" style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
          {title}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: 20 }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button
            type="button"
            onClick={closeConfirmModal}
            className="glass-pill"
            style={{
              flex: 1,
              padding: '12px 0',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'center',
              borderRadius: 999,
              border: '1px solid var(--border-glass)'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmClick}
            style={{
              flex: 1,
              padding: '12px 0',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'center',
              borderRadius: 999,
              border: 'none',
              background: isDestructive ? '#ff4d4d' : 'var(--gold-flat)',
              color: isDestructive ? '#fff' : '#060608',
              boxShadow: isDestructive ? '0 4px 16px rgba(255,77,77,0.4)' : '0 4px 16px rgba(212,175,55,0.4)',
              transition: 'transform 0.15s ease'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
