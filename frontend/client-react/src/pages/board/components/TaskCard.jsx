import { useRef } from "react";
import Avatar from "../../../components/ui/Avatar";

const PRIORITY_CONFIG = {
    LOW: { dot: "bg-slate-400", label: "Low" },
    MEDIUM: { dot: "bg-blue-500", label: "Med" },
    HIGH: { dot: "bg-orange-500", label: "High" },
    URGENT: { dot: "bg-red-500", label: "Urgent" },
};

const TYPE_ICONS = {
    TASK: "task_alt",
    BUG: "bug_report",
    FEATURE: "star",
    IMPROVEMENT: "trending_up",
    EPIC: "bolt",
};

function formatDue(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(iso, status) {
    if (!iso || status === "DONE" || status === "CANCELLED") return false;
    return new Date(iso) < new Date();
}

export default function TaskCard({ task, onDragStart, onClick }) {
    const cardRef = useRef(null);
    const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
    const overdue = isOverdue(task.dueDate, task.status);

    return (
        <div
            ref={cardRef}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("taskId", task.id);
                onDragStart?.(task.id);
                // Shrink ghost slightly for visual polish
                setTimeout(() => {
                    if (cardRef.current) cardRef.current.style.opacity = "0.45";
                }, 0);
            }}
            onDragEnd={() => {
                if (cardRef.current) cardRef.current.style.opacity = "1";
            }}
            onClick={() => onClick?.(task)}
            className="
        bg-white rounded-2xl p-4 shadow-sm
        border border-slate-100 hover:border-primary/30
        hover:shadow-md cursor-grab active:cursor-grabbing
        transition-all duration-150 select-none
        group space-y-3
      "
        >
            {/* Top: type icon + priority dot + overflow menu */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span
                        className="material-symbols-outlined text-slate-400 text-base"
                        style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                        {TYPE_ICONS[task.type] || "task_alt"}
                    </span>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${prio.dot}`} title={prio.label} />
                    <span className="text-[11px] font-semibold text-slate-400">{prio.label}</span>
                </div>

                {overdue && (
                    <span className="flex items-center gap-0.5 text-[11px] font-bold text-red-500">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        Overdue
                    </span>
                )}
            </div>

            {/* Title */}
            <p className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {task.title}
            </p>

            {/* Description snippet */}
            {task.description && (
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 pt-1">
                {/* Assignee */}
                {task.assignee ? (
                    <div className="flex items-center gap-1.5">
                        <Avatar
                            name={task.assignee.fullName || task.assignee.email || "?"}
                            size="xs"
                        />
                        <span className="text-[11px] text-slate-400 truncate max-w-[80px]">
                            {task.assignee.fullName?.split(" ")[0] || task.assignee.email}
                        </span>
                    </div>
                ) : (
                    <span className="text-[11px] text-slate-300 italic">Unassigned</span>
                )}

                {/* Due date */}
                {task.dueDate && (
                    <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${overdue ? "text-red-400" : "text-slate-400"}`}>
                        <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                        {formatDue(task.dueDate)}
                    </span>
                )}
            </div>
        </div>
    );
}