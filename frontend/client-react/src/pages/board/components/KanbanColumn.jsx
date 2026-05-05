import { useState } from "react";
import TaskCard from "./TaskCard";

const COLUMN_CONFIG = {
    TODO: { label: "To Do", accent: "bg-slate-500", light: "bg-slate-50", count_bg: "bg-slate-100  text-slate-600" },
    IN_PROGRESS: { label: "In Progress", accent: "bg-blue-500", light: "bg-blue-50", count_bg: "bg-blue-100   text-blue-700" },
    IN_REVIEW: { label: "In Review", accent: "bg-orange-400", light: "bg-orange-50", count_bg: "bg-orange-100 text-orange-700" },
    DONE: { label: "Done", accent: "bg-green-500", light: "bg-green-50", count_bg: "bg-green-100  text-green-700" },
};

export default function KanbanColumn({
    status,
    tasks = [],
    onDrop,
    onTaskClick,
    onAddTask,
}) {
    const [isDragOver, setIsDragOver] = useState(false);
    const cfg = COLUMN_CONFIG[status] || COLUMN_CONFIG.TODO;

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        // Only fire when leaving the column entirely (not child elements)
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
        <div className="flex flex-col min-w-[300px] w-[300px] flex-shrink-0">
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${cfg.accent}`} />
                    <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
                        {cfg.label}
                    </h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.count_bg}`}>
                        {tasks.length}
                    </span>
                </div>

                <button
                    onClick={() => onAddTask(status)}
                    title={`Add task to ${cfg.label}`}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary transition-colors flex-shrink-0"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                </button>
            </div>

            {/* Drop zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          flex-1 flex flex-col gap-2.5 p-2.5 rounded-2xl min-h-[200px]
          transition-all duration-150
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

                {/* Drop indicator at bottom */}
                {isDragOver && (
                    <div className={`h-1 rounded-full ${cfg.accent} opacity-60 mx-2`} />
                )}
            </div>

            {/* Column footer CTA */}
            <button
                onClick={() => onAddTask(status)}
                className="
          mt-2.5 w-full py-2.5 rounded-xl
          flex items-center justify-center gap-2
          text-xs font-bold text-slate-400
          hover:bg-slate-100 hover:text-slate-700
          transition-colors border border-dashed border-slate-200
          hover:border-primary/30
        "
            >
                <span className="material-symbols-outlined text-sm">add</span>
                Add task
            </button>
        </div>
    );
}