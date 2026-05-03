function colorFromName(name = "") {
    const palette = [
        ["#dbeafe", "#1d4ed8"], // blue
        ["#dcfce7", "#166534"], // green
        ["#fce7f3", "#9d174d"], // pink
        ["#ede9fe", "#5b21b6"], // purple
        ["#ffedd5", "#9a3412"], // orange
        ["#cffafe", "#155e75"], // cyan
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    const [bg, fg] = palette[hash % palette.length];
    return { bg, fg };
}

export default function Avatar({
    name = "",
    src = null,
    size = "md",
    className = "",
}) {
    const sizes = {
        xs: "w-6 h-6 text-[10px]",
        sm: "w-7 h-7 text-xs",
        md: "w-8 h-8 text-xs",
        lg: "w-10 h-10 text-sm",
        xl: "w-12 h-12 text-base",
    };

    const initial = (name || "?")[0].toUpperCase();
    const { bg, fg } = colorFromName(name);

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`rounded-full object-cover flex-shrink-0 ${sizes[size]} ${className}`}
            />
        );
    }

    return (
        <span
            className={`
        rounded-full flex items-center justify-center
        font-bold flex-shrink-0 select-none
        ${sizes[size]} ${className}
      `}
            style={{ background: bg, color: fg }}
            aria-label={name}
        >
            {initial}
        </span>
    );
}