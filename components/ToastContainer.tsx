
import React, { useEffect, useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { ToastMessage } from '../types';

const Toast: React.FC<{ toast: ToastMessage; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => onRemove(toast.id), 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      className={`
        w-full max-w-sm rounded-md shadow-lg text-white p-4 mb-2 transition-all duration-500
        ${typeStyles[toast.type]}
        ${isFadingOut ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'}
      `}
    >
      {toast.message}
    </div>
  );
};


const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-sm">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
