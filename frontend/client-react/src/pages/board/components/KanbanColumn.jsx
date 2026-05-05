import { useState } from "react";
import TaskCard from "./TaskCard";

const COLUMN_CONFIG = {
    TODO: { label: "To Do", accent: "bg-slate-500", light: "bg-slate-50", count_bg: "bg-slate-100 text-slate-600" },
    IN_PROGRESS: { label: "In Progress", accent: "bg-blue-500", light: "bg-blue-50", count_bg: "bg-blue-100 text-blue-700" },
    IN_REVIEW: { label: "In Review", accent: "bg-orange-400", light: "bg-orange-50", count_bg: "bg-orange-100 text-orange-700" },
    DONE: { label: "Done", accent: "bg-green-500", light: "bg-green-50", count_bg: "bg-green-100 text-green-700" },
};

export default function KanbanColumn({
    status,
    tasks = [],
    onDrop,
    onTaskClick,
}) {
    const [isDragOver, setIsDragOver] = useState(false);
    const cfg = COLUMN_CONFIG[status] || COLUMN_CONFIG.TODO;

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragOver(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData("taskId");
        if (taskId) onDrop(taskId, status);
    };

    return (
        <div className="flex flex-col min-w-[300px] w-[300px] max-w-[300px] flex-shrink-0">
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 min-w-[12px] min-h-[12px] rounded-full flex-none block ${cfg.accent}`} />
                    <h3 className="text-sm font-extrabold text-slate-800 tracking-tight whitespace-nowrap">
                        {cfg.label}
                    </h3>
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-full flex-none ${cfg.count_bg}`}>
                        {tasks.length}
                    </div>
                </div>
            </div>

            {/* Drop zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    flex-1 flex flex-col gap-2.5 p-2.5 rounded-2xl min-h-[200px]
                    transition-all duration-150 overflow-hidden
                    ${isDragOver
                        ? `${cfg.light} ring-2 ring-primary/40 ring-offset-1`
                        : "bg-slate-50/70"
                    }
                `}
            >
                {tasks.length === 0 && !isDragOver && (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-300">
                        <span className="material-symbols-outlined text-3xl">inbox</span>
                        <p className="text-xs font-semibold">Drop tasks here</p>
                    </div>
                )}

                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onClick={onTaskClick}
                        onDragStart={() => { }}
                    />
                ))}

                {isDragOver && (
                    <div className={`h-1 rounded-full ${cfg.accent} opacity-60 mx-2`} />
                )}
            </div>

        </div>
    );
}