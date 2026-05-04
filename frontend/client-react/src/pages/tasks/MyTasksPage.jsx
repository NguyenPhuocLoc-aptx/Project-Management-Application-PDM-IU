// src/pages/tasks/MyTasksPage.jsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMyTasks } from "../../hooks/useMyTasks";
import { taskService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Avatar from "../../components/ui/Avatar";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

// ── Constants ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
    TODO: { label: "To Do", bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
    IN_PROGRESS: { label: "In Progress", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    IN_REVIEW: { label: "In Review", bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-400" },
    DONE: { label: "Done", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    CANCELLED: { label: "Cancelled", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-400" },
};

const PRIORITY_CONFIG = {
    LOW: { label: "Low", dot: "bg-slate-400", text: "text-slate-500" },
    MEDIUM: { label: "Medium", dot: "bg-blue-500", text: "text-blue-600" },
    HIGH: { label: "High", dot: "bg-orange-500", text: "text-orange-600" },
    URGENT: { label: "Urgent", dot: "bg-red-500", text: "text-red-600" },
};

const TYPE_ICONS = {
    TASK: "task_alt",
    BUG: "bug_report",
    FEATURE: "star",
    IMPROVEMENT: "trending_up",
    EPIC: "bolt",
};

const FILTERS = ["ALL", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
const SORT_OPTIONS = [
    { value: "dueDate", label: "Due Date" },
    { value: "priority", label: "Priority" },
    { value: "project", label: "Project" },
    { value: "createdAt", label: "Date Created" },
];

const PRIORITY_ORDER = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

// ── Helpers ────────────────────────────────────────────────────────
function formatDate(iso) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(iso, status) {
    if (!iso || status === "DONE" || status === "CANCELLED") return false;
    return new Date(iso) < new Date();
}

function isDueToday(iso) {
    if (!iso) return false;
    const d = new Date(iso);
    const now = new Date();
    return d.toDateString() === now.toDateString();
}

// ── Task row ───────────────────────────────────────────────────────
function TaskRow({ task, onStatusChange, onNavigate }) {
    const [updating, setUpdating] = useState(false);
    const { addToast } = useToast();
    const overdue = isOverdue(task.dueDate, task.status);
    const today = isDueToday(task.dueDate);
    const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
    const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            await taskService.updateStatus(task.id, newStatus);
            onStatusChange(task.id, { status: newStatus });
        } catch {
            addToast("Failed to update status.", "error");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="
      group flex items-center gap-4 px-5 py-4
      bg-white rounded-2xl border border-slate-100
      hover:border-primary/20 hover:shadow-sm
      transition-all duration-150
    ">
            {/* Status toggle */}
            <div className="flex-shrink-0">
                {updating ? (
                    <LoadingSpinner size="sm" className="border-slate-200 border-t-primary" />
                ) : (
                    <button
                        onClick={() => handleStatusChange(task.status === "DONE" ? "TODO" : "DONE")}
                        className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              transition-colors flex-shrink-0
              ${task.status === "DONE"
                                ? "bg-green-500 border-green-500 text-white"
                                : "border-slate-300 hover:border-primary"}
            `}
                        title={task.status === "DONE" ? "Mark incomplete" : "Mark complete"}
                    >
                        {task.status === "DONE" && (
                            <span className="material-symbols-outlined text-[11px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}>
                                check
                            </span>
                        )}
                    </button>
                )}
            </div>

            {/* Type icon */}
            <span className="material-symbols-outlined text-slate-300 text-base flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 0" }}>
                {TYPE_ICONS[task.type] || "task_alt"}
            </span>

            {/* Title + project */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${task.status === "DONE" ? "line-through text-slate-400" : "text-slate-800"}`}>
                    {task.title}
                </p>
                {task.project && (
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {task.project.name}
                    </p>
                )}
            </div>

            {/* Priority */}
            <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                <span className={`w-2 h-2 rounded-full ${priority.dot}`} />
                <span className={`text-xs font-semibold ${priority.text}`}>{priority.label}</span>
            </div>

            {/* Status badge */}
            <span className={`
        hidden md:inline-flex items-center gap-1.5
        text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0
        ${status.bg} ${status.text}
      `}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
            </span>

            {/* Due date */}
            <div className="flex-shrink-0 text-right min-w-[80px] hidden lg:block">
                {task.dueDate ? (
                    <span className={`text-xs font-semibold ${overdue ? "text-red-500" :
                            today ? "text-orange-500" :
                                "text-slate-400"
                        }`}>
                        {overdue && <span className="material-symbols-outlined text-[11px] mr-0.5">schedule</span>}
                        {today ? "Today" : formatDate(task.dueDate)}
                    </span>
                ) : (
                    <span className="text-xs text-slate-300">No due date</span>
                )}
            </div>

            {/* Go to board */}
            <button
                onClick={() => onNavigate(task.project?.id)}
                className="
          opacity-0 group-hover:opacity-100
          w-7 h-7 flex items-center justify-center
          rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50
          transition-all flex-shrink-0
        "
                title="Open board"
            >
                <span className="material-symbols-outlined text-base">open_in_new</span>
            </button>
        </div>
    );
}

// ── Empty state ────────────────────────────────────────────────────
function EmptyState({ filter }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-green-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                    task_alt
                </span>
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">
                    {filter === "ALL" ? "No tasks assigned to you" : `No ${filter.replace("_", " ")} tasks`}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                    {filter === "ALL"
                        ? "Tasks assigned to you across all projects will appear here."
                        : "Try switching the filter above."}
                </p>
            </div>
        </div>
    );
}

// ── Loading skeleton ───────────────────────────────────────────────
function SkeletonRow() {
    return (
        <div className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-slate-100 animate-pulse">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex-shrink-0" />
            <div className="w-4 h-4 bg-slate-100 rounded flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-3 bg-slate-50  rounded w-1/3" />
            </div>
            <div className="h-4 w-16 bg-slate-100 rounded-full hidden sm:block" />
            <div className="h-6 w-20 bg-slate-100 rounded-full hidden md:block" />
            <div className="h-3 w-20 bg-slate-100 rounded hidden lg:block" />
        </div>
    );
}

// ── Group header ───────────────────────────────────────────────────
function GroupHeader({ label, count }) {
    return (
        <div className="flex items-center gap-3 mt-6 mb-2 first:mt-0">
            <span className="text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                {label}
            </span>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {count}
            </span>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
    );
}

// ── Page root ──────────────────────────────────────────────────────
export default function MyTasksPage() {
    const navigate = useNavigate();
    const { tasks, loading, error, updateTaskLocally } = useMyTasks();

    const [filter, setFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("dueDate");
    const [search, setSearch] = useState("");
    const [groupBy, setGroupBy] = useState("status"); // "status" | "project" | "priority" | "none"

    // ── Derived list ────────────────────────────────────────────────
    const processed = useMemo(() => {
        let list = [...tasks];

        // Filter
        if (filter !== "ALL") list = list.filter((t) => t.status === filter);

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (t) => t.title?.toLowerCase().includes(q) ||
                    t.project?.name?.toLowerCase().includes(q)
            );
        }

        // Sort
        list.sort((a, b) => {
            if (sortBy === "dueDate") {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            if (sortBy === "priority") {
                return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
            }
            if (sortBy === "project") {
                return (a.project?.name || "").localeCompare(b.project?.name || "");
            }
            // createdAt
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return list;
    }, [tasks, filter, search, sortBy]);

    // ── Group the processed list ─────────────────────────────────────
    const grouped = useMemo(() => {
        if (groupBy === "none") return [{ label: null, tasks: processed }];

        const map = new Map();

        processed.forEach((t) => {
            let key = "";
            if (groupBy === "status") key = t.status || "TODO";
            if (groupBy === "project") key = t.project?.name || "No Project";
            if (groupBy === "priority") key = t.priority || "MEDIUM";
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(t);
        });

        // Order status groups sensibly
        if (groupBy === "status") {
            const order = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"];
            return order
                .filter((k) => map.has(k))
                .map((k) => ({ label: STATUS_CONFIG[k]?.label || k, tasks: map.get(k) }));
        }

        if (groupBy === "priority") {
            const order = ["URGENT", "HIGH", "MEDIUM", "LOW"];
            return order
                .filter((k) => map.has(k))
                .map((k) => ({ label: PRIORITY_CONFIG[k]?.label || k, tasks: map.get(k) }));
        }

        return Array.from(map.entries()).map(([label, tasks]) => ({ label, tasks }));
    }, [processed, groupBy]);

    // ── Stats ────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total = tasks.length;
        const done = tasks.filter((t) => t.status === "DONE").length;
        const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
        const dueToday = tasks.filter((t) => isDueToday(t.dueDate) && t.status !== "DONE").length;
        return { total, done, overdue, dueToday };
    }, [tasks]);

    const handleNavigate = (projectId) => {
        if (projectId) navigate(`/board/${projectId}`);
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <span className="material-symbols-outlined text-5xl text-red-300">error_outline</span>
                <p className="font-bold text-slate-700">Failed to load tasks</p>
                <p className="text-sm text-slate-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* ── Page header ── */}
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900">My Tasks</h1>
                <p className="text-sm text-slate-400 mt-0.5">
                    All tasks assigned to you across every project.
                </p>
            </div>

            {/* ── Stat pills ── */}
            {!loading && tasks.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {[
                        { label: "Total", value: stats.total, bg: "bg-slate-100", text: "text-slate-700", icon: "checklist" },
                        { label: "Completed", value: stats.done, bg: "bg-green-100", text: "text-green-700", icon: "task_alt" },
                        { label: "Overdue", value: stats.overdue, bg: "bg-red-100", text: "text-red-700", icon: "schedule" },
                        { label: "Due Today", value: stats.dueToday, bg: "bg-orange-100", text: "text-orange-700", icon: "today" },
                    ].map(({ label, value, bg, text, icon }) => (
                        <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-xl ${bg}`}>
                            <span className={`material-symbols-outlined text-base ${text}`}
                                style={{ fontVariationSettings: "'FILL' 1" }}>
                                {icon}
                            </span>
                            <span className={`text-sm font-extrabold ${text}`}>{value}</span>
                            <span className={`text-xs font-semibold ${text} opacity-70`}>{label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative min-w-[200px] flex-1 max-w-xs">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                        search
                    </span>
                    <input
                        className="input-field pl-9 py-2 text-sm"
                        placeholder="Search tasks…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Status filter pills */}
                <div className="flex gap-1.5 flex-wrap">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`
                text-xs font-bold px-3 py-1.5 rounded-full transition-colors
                ${filter === f
                                    ? "bg-primary text-white"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-primary/40"}
              `}
                        >
                            {f === "ALL" ? "All" : STATUS_CONFIG[f]?.label || f}
                        </button>
                    ))}
                </div>

                {/* Sort + Group selects */}
                <div className="flex gap-2 ml-auto">
                    <select
                        className="input-field w-auto py-2 text-sm cursor-pointer"
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value)}
                    >
                        <option value="status">Group: Status</option>
                        <option value="priority">Group: Priority</option>
                        <option value="project">Group: Project</option>
                        <option value="none">No Grouping</option>
                    </select>

                    <select
                        className="input-field w-auto py-2 text-sm cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        {SORT_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Task list ── */}
            {loading ? (
                <div className="space-y-2.5">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
                </div>
            ) : processed.length === 0 ? (
                <EmptyState filter={filter} />
            ) : (
                <div className="space-y-2.5">
                    {grouped.map(({ label, tasks: groupTasks }) => (
                        <div key={label || "all"}>
                            {label && <GroupHeader label={label} count={groupTasks.length} />}
                            {groupTasks.map((task) => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    onStatusChange={updateTaskLocally}
                                    onNavigate={handleNavigate}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}