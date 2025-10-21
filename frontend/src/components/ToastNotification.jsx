import React from 'react';

const ToastNotification = ({ message, type, onClose }) => (
  message ? (
    <div className={`toast ${type}`}>{message}
      <button onClick={onClose}>X</button>
    </div>
  ) : null
);

export default ToastNotification;
