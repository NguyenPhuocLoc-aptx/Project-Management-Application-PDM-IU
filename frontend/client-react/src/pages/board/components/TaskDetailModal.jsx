import { useState, useEffect, useRef } from "react";
import Modal from "../../../components/ui/Modal";
import Avatar from "../../../components/ui/Avatar";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

const PRIORITY_STYLES = {
    LOW: "bg-slate-100  text-slate-600",
    MEDIUM: "bg-blue-100   text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100    text-red-700",
};

const STATUS_STYLES = {
    TODO: "bg-slate-100  text-slate-700",
    IN_PROGRESS: "bg-blue-100   text-blue-700",
    IN_REVIEW: "bg-orange-100 text-orange-700",
    DONE: "bg-green-100  text-green-700",
    CANCELLED: "bg-red-100    text-red-700",
};

const TYPE_ICONS = {
    TASK: "task_alt",
    BUG: "bug_report",
    FEATURE: "star",
    IMPROVEMENT: "trending_up",
    EPIC: "bolt",
};

function timeAgo(iso) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
    });
}

// ── Editable inline field ──────────────────────────────────────────
function EditableTitle({ value, onSave }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        if (editing) inputRef.current?.select();
    }, [editing]);

    const commit = () => {
        if (draft.trim() && draft.trim() !== value) onSave(draft.trim());
        setEditing(false);
    };

    if (editing) {
        return (
            <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") commit();
                    if (e.key === "Escape") { setDraft(value); setEditing(false); }
                }}
                className="
          w-full text-xl font-extrabold text-slate-900
          bg-blue-50 rounded-xl px-3 py-2 outline-none
          focus:ring-2 focus:ring-primary/30
        "
            />
        );
    }

    return (
        <h2
            onClick={() => setEditing(true)}
            className="text-xl font-extrabold text-slate-900 leading-snug cursor-text hover:text-primary transition-colors px-1"
            title="Click to edit"
        >
            {value}
        </h2>
    );
}

// ── Comment thread ─────────────────────────────────────────────────
function CommentThread({ taskId, fetchComments, addComment, deleteComment }) {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [comments, setComments] = useState([]);
    const [loadingC, setLoadingC] = useState(true);
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        let active = true;
        setLoadingC(true);
        fetchComments(taskId)
            .then((data) => { if (active) setComments(data); })
            .finally(() => { if (active) setLoadingC(false); });
        return () => { active = false; };
    }, [taskId, fetchComments]);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setSubmitting(true);
        try {
            const newComment = await addComment(taskId, content.trim());
            setComments((prev) => [...prev, newComment]);
            setContent("");
        } catch {
            addToast("Failed to post comment.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        try {
            await deleteComment(commentId);
        } catch {
            addToast("Failed to delete comment.", "error");
        }
    };

    return (
        <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-base">chat_bubble</span>
                Comments ({comments.length})
            </h4>

            {/* Comment list */}
            {loadingC ? (
                <div className="flex justify-center py-6">
                    <LoadingSpinner size="sm" className="border-slate-200 border-t-primary" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6 italic">
                    No comments yet. Be the first!
                </p>
            ) : (
                <div className="space-y-3">
                    {comments.map((c) => {
                        const isOwn = c.user?.email === user?.email;
                        return (
                            <div key={c.id} className="flex gap-3 group">
                                <Avatar name={c.user?.fullName || c.user?.email || "?"} size="sm" className="flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-slate-800">
                                            {c.user?.fullName || c.user?.email || "Unknown"}
                                        </span>
                                        <span className="text-[11px] text-slate-400">{timeAgo(c.createdAt)}</span>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl px-3 py-2.5 text-sm text-slate-700 leading-relaxed">
                                        {c.content}
                                    </div>
                                </div>
                                {isOwn && (
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all flex-shrink-0 mt-1"
                                    >
                                        <span className="material-symbols-outlined text-base">delete</span>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* New comment input */}
            <div className="flex gap-3 items-end pt-1">
                <Avatar name={user?.fullName || user?.email || "?"} size="sm" className="flex-shrink-0 mb-1" />
                <div className="flex-1 relative">
                    <textarea
                        ref={inputRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
                        }}
                        placeholder="Write a comment… (Enter to send)"
                        rows={2}
                        className="input-field resize-none pr-12 text-sm"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !content.trim()}
                        className="
              absolute right-2 bottom-2
              w-8 h-8 rounded-lg btn-primary
              disabled:opacity-40 disabled:cursor-not-allowed
            "
                    >
                        {submitting
                            ? <LoadingSpinner size="sm" />
                            : <span className="material-symbols-outlined text-sm">send</span>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main modal ────────────────────────────────────────────────────
export default function TaskDetailModal({
    task,
    open,
    onClose,
    onUpdate,
    onDelete,
    members = [],
    fetchComments,
    addComment,
    deleteComment,
}) {
    const { addToast } = useToast();
    const [saving, setSaving] = useState(false);

    if (!task) return null;

    const save = async (patch) => {
        setSaving(true);
        try {
            await onUpdate(task.id, patch);
            addToast("Task updated.", "success");
        } catch {
            addToast("Failed to update task.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this task? This cannot be undone.")) return;
        try {
            await onDelete(task.id);
            addToast("Task deleted.", "info");
            onClose();
        } catch {
            addToast("Failed to delete task.", "error");
        }
    };

    const assigneeName = task.assignee?.fullName || task.assignee?.email;

    return (
        <Modal open={open} onClose={onClose} maxWidth="max-w-2xl" title={null}>
            <div className="space-y-6 -mt-2">
                {/* ── Header bar ── */}
                <div className="flex items-start gap-3">
                    <span
                        className="material-symbols-outlined text-primary mt-1 flex-shrink-0"
                        style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                        {TYPE_ICONS[task.type] || "task_alt"}
                    </span>
                    <div className="flex-1 min-w-0">
                        <EditableTitle
                            value={task.title}
                            onSave={(title) => save({ title })}
                        />
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {saving && <LoadingSpinner size="sm" className="border-slate-200 border-t-primary" />}
                        <button
                            onClick={handleDelete}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                </div>

                {/* ── Status + Priority chips ── */}
                <div className="flex flex-wrap gap-2">
                    {/* Status selector */}
                    <select
                        value={task.status}
                        onChange={(e) => save({ status: e.target.value })}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer ${STATUS_STYLES[task.status] || STATUS_STYLES.TODO}`}
                    >
                        {["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"].map((s) => (
                            <option key={s} value={s}>{s.replace("_", " ")}</option>
                        ))}
                    </select>

                    {/* Priority selector */}
                    <select
                        value={task.priority}
                        onChange={(e) => save({ priority: e.target.value })}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM}`}
                    >
                        {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                {/* ── Two-column metadata ── */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4">
                    {/* Assignee */}
                    <div>
                        <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                            Assignee
                        </p>
                        <select
                            value={task.assignee?.id || ""}
                            onChange={(e) => save({ assigneeId: e.target.value || null })}
                            className="input-field py-1.5 text-sm bg-white"
                        >
                            <option value="">Unassigned</option>
                            {members.map((m) => (
                                <option key={m.user?.id || m.id} value={m.user?.id || m.id}>
                                    {m.user?.fullName || m.user?.email || "Unknown"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Due date */}
                    <div>
                        <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                            Due Date
                        </p>
                        <input
                            type="date"
                            defaultValue={task.dueDate?.slice(0, 10) || ""}
                            onBlur={(e) => {
                                const val = e.target.value;
                                save({ dueDate: val ? `${val}T00:00:00` : null });
                            }}
                            className="input-field py-1.5 text-sm bg-white"
                        />
                    </div>

                    {/* Created by */}
                    <div>
                        <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                            Created By
                        </p>
                        <div className="flex items-center gap-2">
                            <Avatar name={task.createdBy?.fullName || task.createdBy?.email || "?"} size="xs" />
                            <span className="text-sm text-slate-700 font-semibold">
                                {task.createdBy?.fullName || task.createdBy?.email || "Unknown"}
                            </span>
                        </div>
                    </div>

                    {/* Created date */}
                    <div>
                        <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                            Created
                        </p>
                        <p className="text-sm text-slate-700 font-semibold">
                            {formatDate(task.createdAt)}
                        </p>
                    </div>
                </div>

                {/* ── Description ── */}
                <div>
                    <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                        Description
                    </p>
                    <textarea
                        defaultValue={task.description || ""}
                        onBlur={(e) => {
                            if (e.target.value !== (task.description || "")) {
                                save({ description: e.target.value });
                            }
                        }}
                        placeholder="Add a description…"
                        rows={3}
                        className="input-field resize-none text-sm"
                    />
                </div>

                {/* ── Divider ── */}
                <div className="border-t border-slate-100" />

                {/* ── Comments ── */}
                <CommentThread
                    taskId={task.id}
                    fetchComments={fetchComments}
                    addComment={addComment}
                    deleteComment={deleteComment}
                />
            </div>
        </Modal>
    );
}