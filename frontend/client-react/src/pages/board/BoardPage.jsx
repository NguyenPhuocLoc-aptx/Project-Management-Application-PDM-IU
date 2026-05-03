import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTasks } from "../../hooks/useTasks";
import { useToast } from "../../context/ToastContext";
import KanbanColumn from "./components/KanbanColumn";
import TaskDetailModal from "./components/TaskDetailModal";
import CreateTaskModal from "./components/CreateTaskModal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Avatar from "../../components/ui/Avatar";

const COLUMNS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

const PRIORITY_DOT = {
    LOW: "bg-slate-400",
    MEDIUM: "bg-blue-500",
    HIGH: "bg-orange-500",
    URGENT: "bg-red-500",
};

export default function BoardPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const {
        tasks, members, project, loading, error,
        updateTaskStatus,
        createTask,
        updateTask,
        deleteTask,
        fetchComments,
        addComment,
        deleteComment,
    } = useTasks(projectId);

    // ── Local UI state ────────────────────────────────────────────────
    const [selectedTask, setSelectedTask] = useState(null);
    const [createStatus, setCreateStatus] = useState("TODO");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [filterPriority, setFilterPriority] = useState("ALL");
    const [filterAssignee, setFilterAssignee] = useState("ALL");
    const [search, setSearch] = useState("");

    // ── Derived: tasks per column after filters ───────────────────────
    const filteredTasks = useMemo(() => {
        let list = [...tasks];

        if (filterPriority !== "ALL") {
            list = list.filter((t) => t.priority === filterPriority);
        }
        if (filterAssignee !== "ALL") {
            if (filterAssignee === "UNASSIGNED") {
                list = list.filter((t) => !t.assignee);
            } else {
                list = list.filter((t) => t.assignee?.id === filterAssignee);
            }
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (t) => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [tasks, filterPriority, filterAssignee, search]);

    const tasksByColumn = useMemo(() =>
        COLUMNS.reduce((acc, col) => {
            acc[col] = filteredTasks.filter((t) => t.status === col);
            return acc;
        }, {}),
        [filteredTasks]);

    // ── Handlers ──────────────────────────────────────────────────────
    const handleDrop = (taskId, newStatus) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task || task.status === newStatus) return;
        updateTaskStatus(taskId, newStatus);
    };

    const handleAddTask = (status) => {
        setCreateStatus(status);
        setCreateModalOpen(true);
    };

    const handleCreateTask = async (payload) => {
        try {
            await createTask(projectId, payload);
            addToast("Task created!", "success");
            setCreateModalOpen(false);
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to create task.", "error");
        }
    };

    const handleUpdateTask = async (taskId, patch) => {
        return updateTask(taskId, patch);
    };

    const handleDeleteTask = async (taskId) => {
        await deleteTask(taskId);
        setSelectedTask(null);
    };

    // ── Loading / error states ────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center space-y-3">
                    <LoadingSpinner size="lg" className="border-slate-200 border-t-primary mx-auto" />
                    <p className="text-sm text-slate-400 font-semibold">Loading board…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <span className="material-symbols-outlined text-5xl text-red-300">error_outline</span>
                <p className="font-bold text-slate-700">Failed to load board</p>
                <p className="text-sm text-slate-400">{error}</p>
                <button onClick={() => navigate("/dashboard")} className="btn-primary px-5 py-2.5 rounded-xl">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-4 min-w-0">

            {/* ── Board header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-500 flex-shrink-0"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-xl font-extrabold text-slate-900 truncate">
                            {project?.name || "Board"}
                        </h1>
                        <p className="text-xs text-slate-400 truncate">
                            {project?.workspace?.name && `${project.workspace.name} · `}
                            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Member avatars */}
                    {members.slice(0, 5).length > 0 && (
                        <div className="flex -space-x-2 mr-1">
                            {members.slice(0, 5).map((m) => (
                                <Avatar
                                    key={m.id}
                                    name={m.user?.fullName || m.user?.email || "?"}
                                    size="sm"
                                    className="ring-2 ring-white"
                                />
                            ))}
                            {members.length > 5 && (
                                <span className="w-7 h-7 rounded-full bg-slate-100 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                                    +{members.length - 5}
                                </span>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => handleAddTask("TODO")}
                        className="btn-primary px-4 py-2 rounded-xl text-sm shadow-md shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add Task
                    </button>
                </div>
            </div>

            {/* ── Filter toolbar ── */}
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0 pb-1">
                {/* Search */}
                <div className="relative min-w-[180px]">
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

                {/* Priority filter */}
                <select
                    className="input-field w-auto py-2 text-sm cursor-pointer"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                >
                    <option value="ALL">All priorities</option>
                    {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>

                {/* Assignee filter */}
                <select
                    className="input-field w-auto py-2 text-sm cursor-pointer"
                    value={filterAssignee}
                    onChange={(e) => setFilterAssignee(e.target.value)}
                >
                    <option value="ALL">All members</option>
                    <option value="UNASSIGNED">Unassigned</option>
                    {members.map((m) => (
                        <option key={m.user?.id || m.id} value={m.user?.id || m.id}>
                            {m.user?.fullName || m.user?.email || "Unknown"}
                        </option>
                    ))}
                </select>

                {/* Task count summary */}
                <div className="flex gap-3 ml-auto flex-wrap">
                    {COLUMNS.map((col) => (
                        <span key={col} className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${col === "TODO" ? "bg-slate-400" :
                                col === "IN_PROGRESS" ? "bg-blue-500" :
                                    col === "IN_REVIEW" ? "bg-orange-400" :
                                        "bg-green-500"
                                }`} />
                            {tasksByColumn[col]?.length ?? 0}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Kanban columns (horizontal scroll) ── */}
            <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col}
                        status={col}
                        tasks={tasksByColumn[col] || []}
                        onDrop={handleDrop}
                        onTaskClick={(task) => setSelectedTask(task)}
                        onAddTask={handleAddTask}
                    />
                ))}
            </div>

            {/* ── Modals ── */}
            <CreateTaskModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreated={handleCreateTask}
                defaultStatus={createStatus}
                projectId={projectId}
                members={members}
            />

            <TaskDetailModal
                task={selectedTask}
                open={Boolean(selectedTask)}
                onClose={() => setSelectedTask(null)}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
                members={members}
                fetchComments={fetchComments}
                addComment={addComment}
                deleteComment={deleteComment}
            />
        </div>
    );
}