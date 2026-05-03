// src/context/ToastContext.jsx
import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const counter = useRef(0);

    const addToast = useCallback((message, type = "success", duration = 3500) => {
        const id = ++counter.current;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}

// ── Rendered inside provider so it lives above the whole tree ────────
function ToastContainer({ toasts, onRemove }) {
    if (!toasts.length) return null;
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onRemove={onRemove} />
            ))}
        </div>
    );
}

const TOAST_STYLES = {
    success: {
        bar: "bg-tertiary",
        icon: "check_circle",
        text: "text-white",
        bg: "bg-tertiary",
    },
    error: {
        bar: "bg-error",
        icon: "error",
        text: "text-white",
        bg: "bg-error",
    },
    info: {
        bar: "bg-primary",
        icon: "info",
        text: "text-white",
        bg: "bg-primary",
    },
    warning: {
        bar: "bg-orange-500",
        icon: "warning",
        text: "text-white",
        bg: "bg-orange-500",
    },
};

function ToastItem({ toast, onRemove }) {
    const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

    return (
        <div
            className={`
        pointer-events-auto flex items-center gap-3
        px-4 py-3 rounded-xl shadow-lg
        ${style.bg} ${style.text}
        text-sm font-semibold
        animate-[slideInRight_0.2s_ease-out]
        min-w-[260px] max-w-[360px]
      `}
            style={{ animation: "slideInRight 0.2s ease-out" }}
        >
            <span className="material-symbols-outlined text-lg flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}>
                {style.icon}
            </span>
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
                <span className="material-symbols-outlined text-base">close</span>
            </button>
        </div>
    );
}