// src/components/ui/LoadingSpinner.jsx

export default function LoadingSpinner({ size = "md", className = "" }) {
    const sizes = {
        sm: "w-4 h-4 border-2",
        md: "w-6 h-6 border-2",
        lg: "w-10 h-10 border-[3px]",
    };

    return (
        <span
            className={`
        inline-block rounded-full
        border-white/30 border-t-white
        animate-spin
        ${sizes[size]}
        ${className}
      `}
            role="status"
            aria-label="Loading"
        />
    );
}