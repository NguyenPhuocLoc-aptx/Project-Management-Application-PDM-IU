import React, { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

const Toast = ({ id, message, type }) => {
    const bgColor = {
        success: 'bg-green-100 border-green-400',
        error: 'bg-red-100 border-red-400',
        warning: 'bg-yellow-100 border-yellow-400',
        info: 'bg-blue-100 border-blue-400',
    }[type] || 'bg-blue-100 border-blue-400';

    const textColor = {
        success: 'text-green-800',
        error: 'text-red-800',
        warning: 'text-yellow-800',
        info: 'text-blue-800',
    }[type] || 'text-blue-800';

    const { removeToast } = useContext(ToastContext);

    return (
        <div
            className={`border-l-4 ${bgColor} ${textColor} p-4 mb-3 rounded shadow-lg animate-fade-in`}
            role="alert"
        >
            <div className="flex justify-between items-start">
                <p className="font-medium">{message}</p>
                <button
                    onClick={() => removeToast(id)}
                    className={`ml-4 ${textColor} hover:opacity-70`}
                    aria-label="Close notification"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export const ToastContainer = () => {
    const { toasts } = useContext(ToastContext);

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md pointer-events-auto">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                />
            ))}
        </div>
    );
};

export default Toast;
