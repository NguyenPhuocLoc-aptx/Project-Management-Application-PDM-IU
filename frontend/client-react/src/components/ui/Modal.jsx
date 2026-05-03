import { useEffect, useRef } from "react";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
    const overlayRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    // Lock body scroll while open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(20,28,37,0.45)", backdropFilter: "blur(4px)" }}
            onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div
                className={`
          relative w-full ${maxWidth}
          bg-white rounded-2xl shadow-2xl
          flex flex-col overflow-hidden
        `}
                style={{ animation: "modalIn 0.18s ease-out" }}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {children}
                </div>
            </div>
        </div>
    );
}