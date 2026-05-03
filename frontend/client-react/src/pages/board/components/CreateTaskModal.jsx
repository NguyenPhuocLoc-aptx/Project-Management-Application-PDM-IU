import { useState } from "react";
import Modal from "../../../components/ui/Modal";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Avatar from "../../../components/ui/Avatar";

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const TYPE_OPTIONS = ["TASK", "BUG", "FEATURE", "IMPROVEMENT", "EPIC"];
const STATUS_OPTIONS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

const PRIORITY_STYLES = {
    LOW: "bg-slate-100  text-slate-600",
    MEDIUM: "bg-blue-100   text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100    text-red-700",
};

const TYPE_ICONS = {
    TASK: "task_alt",
    BUG: "bug_report",
    FEATURE: "star",
    IMPROVEMENT: "trending_up",
    EPIC: "bolt",
};

export default function CreateTaskModal({
    open, onClose, onCreated,
    defaultStatus = "TODO",
    projectId,
    members = [],
}) {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [status, setStatus] = useState(defaultStatus);
    const [priority, setPriority] = useState("MEDIUM");
    const [type, setType] = useState("TASK");
    const [assigneeId, setAssigneeId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!title.trim()) { setError("Task title is required."); return; }
        setLoading(true);
        setError("");
        try {
            await onCreated({
                title: title.trim(),
                description: desc.trim(),
                status,
                priority,
                type,
                assigneeId: assigneeId || null,
                dueDate: dueDate ? `${dueDate}T00:00:00` : null,
            });
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create task.");
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTitle(""); setDesc(""); setStatus(defaultStatus);
        setPriority("MEDIUM"); setType("TASK");
        setAssigneeId(""); setDueDate(""); setError("");
        setLoading(false);
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose} title="Create new task" maxWidth="max-w-xl">
            <div className="space-y-5">
                {error && (
                    <div className="bg-red-50 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl flex gap-2 items-start">
                        <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
                        {error}
                    </div>
                )}

                {/* Type selector tabs */}
                <div>
                    <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                        Type
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {TYPE_OPTIONS.map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                  transition-colors border
                  ${type === t
                                        ? "bg-primary text-white border-primary"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-primary/40"}
                `}
                            >
                                <span className="material-symbols-outlined text-sm">{TYPE_ICONS[t]}</span>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                        Title *
                    </label>
                    <input
                        className="input-field"
                        placeholder="What needs to be done?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
                        autoFocus
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                        Description
                    </label>
                    <textarea
                        className="input-field resize-none"
                        placeholder="Add more context…"
                        rows={3}
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                    />
                </div>

                {/* Status + Priority row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                            Status
                        </label>
                        <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s.replace("_", " ")}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                            Priority
                        </label>
                        <div className="flex gap-1.5">
                            {PRIORITY_OPTIONS.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={`
                    flex-1 py-2 rounded-xl text-[11px] font-bold transition-colors
                    ${priority === p ? PRIORITY_STYLES[p] + " ring-2 ring-offset-1 ring-primary/30" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}
                  `}
                                >
                                    {p[0]}
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 px-1">{priority}</p>
                    </div>
                </div>

                {/* Assignee + Due date row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                            Assignee
                        </label>
                        <select className="input-field" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                            <option value="">Unassigned</option>
                            {members.map((m) => (
                                <option key={m.user?.id || m.id} value={m.user?.id || m.id}>
                                    {m.user?.fullName || m.user?.email || m.fullName || m.email || "Unknown"}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                            Due Date
                        </label>
                        <input
                            type="date"
                            className="input-field"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={handleClose}
                        className="flex-1 h-11 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !title.trim()}
                        className="flex-1 btn-primary h-11 rounded-xl"
                    >
                        {loading ? <LoadingSpinner size="sm" /> : "Create Task"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}