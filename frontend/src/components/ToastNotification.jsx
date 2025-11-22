import React, { useEffect } from 'react';

const ToastNotification = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`toast ${type}`}>
      <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>{getIcon()}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose}>✕</button>
    </div>
  );
};

export default ToastNotification;
