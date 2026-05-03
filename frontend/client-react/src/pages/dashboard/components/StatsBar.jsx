
const STATUS_CONFIG = {
    PLANNING: { color: "bg-slate-500", label: "Planning" },
    IN_PROGRESS: { color: "bg-blue-500", label: "In Progress" },
    ON_HOLD: { color: "bg-orange-400", label: "On Hold" },
    COMPLETED: { color: "bg-green-500", label: "Completed" },
    CANCELLED: { color: "bg-red-400", label: "Cancelled" },
};

export default function StatsBar({ projects }) {
    const total = projects.length;
    if (total === 0) return null;

    const counts = projects.reduce((acc, p) => {
        const s = p.status || "PLANNING";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    const stats = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
        ...cfg,
        count: counts[key] || 0,
    })).filter((s) => s.count > 0);

    return (
        <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-extrabold text-slate-800">
                {total} project{total !== 1 ? "s" : ""}
            </span>
            <div className="h-4 w-px bg-slate-200" />
            {stats.map(({ label, color, count }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    {count} {label}
                </span>
            ))}
        </div>
    );
}