import React, { useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Toast.css';

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Individual Toast Component
const Toast = ({ message, type, onClose }) => {
  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-success',
          icon: 'bi-check-circle-fill',
          title: 'Success'
        };
      case 'error':
        return {
          bg: 'bg-danger',
          icon: 'bi-exclamation-circle-fill',
          title: 'Error'
        };
      case 'warning':
        return {
          bg: 'bg-warning',
          icon: 'bi-exclamation-triangle-fill',
          title: 'Warning',
          textClass: 'text-dark'
        };
      case 'info':
        return {
          bg: 'bg-info',
          icon: 'bi-info-circle-fill',
          title: 'Info'
        };
      default:
        return {
          bg: 'bg-secondary',
          icon: 'bi-bell-fill',
          title: 'Notification'
        };
    }
  };

  const config = getToastConfig();

  return (
    <div className={`toast show ${config.bg} ${config.textClass || 'text-white'} mb-2`} role="alert">
      <div className="toast-header">
        <i className={`bi ${config.icon} me-2`}></i>
        <strong className="me-auto">{config.title}</strong>
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>
      <div className="toast-body">
        {message}
      </div>
    </div>
  );
};

export default ToastContainer;