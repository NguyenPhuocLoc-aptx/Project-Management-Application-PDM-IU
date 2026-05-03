import { useState } from "react";
import Modal from "../ui/Modal";
import LoadingSpinner from "../ui/LoadingSpinner";
import { projectService } from "../../services/api";
import { useToast } from "../../context/ToastContext";

const STATUS_OPTIONS = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const CATEGORY_OPTIONS = ["Engineering", "Design", "Marketing", "Research", "Operations", "Other"];

const STATUS_COLORS = {
    PLANNING: "bg-slate-100  text-slate-700",
    IN_PROGRESS: "bg-blue-100   text-blue-700",
    ON_HOLD: "bg-orange-100 text-orange-700",
    COMPLETED: "bg-green-100  text-green-700",
    CANCELLED: "bg-red-100    text-red-700",
};

const PRIORITY_COLORS = {
    LOW: "bg-slate-100  text-slate-600",
    MEDIUM: "bg-blue-100   text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100    text-red-700",
};

export default function NewProjectModal({ open, onClose, onCreated, workspaces = [], defaultWorkspaceId = "" }) {
    const { addToast } = useToast();

    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [workspaceId, setWorkspaceId] = useState(defaultWorkspaceId);
    const [category, setCategory] = useState("Engineering");
    const [status, setStatus] = useState("PLANNING");
    const [priority, setPriority] = useState("MEDIUM");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!name.trim()) { setError("Project name is required."); return; }
        if (!workspaceId) { setError("Please select a workspace."); return; }
        if (startDate && endDate && endDate < startDate) {
            setError("End date cannot be before start date."); return;
        }

        setLoading(true);
        setError("");
        try {
            const payload = {
                name: name.trim(),
                description: desc.trim(),
                workspaceId,
                category,
                status,
                priority,
                progress: 0,
                startDate: startDate ? `${startDate}T00:00:00` : null,
                endDate: endDate ? `${endDate}T23:59:59` : null,
            };
            const { data } = await projectService.create(payload);
            addToast(`Project "${data.name}" created!`, "success");
            onCreated?.(data);
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create project.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName(""); setDesc(""); setWorkspaceId(defaultWorkspaceId);
        setCategory("Engineering"); setStatus("PLANNING"); setPriority("MEDIUM");
        setStartDate(""); setEndDate(""); setError("");
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose} title="Create a new project" maxWidth="max-w-2xl">
            <div className="space-y-5">
                {error && (
                    <div className="bg-red-50 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl flex gap-2 items-start">
                        <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
                        {error}
                    </div>
                )}

                {/* Name */}
                <div>
                    <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                        Project Name *
                    </label>
                    <input
                        className="input-field"
                        placeholder="e.g. Website Redesign"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        placeholder="What is this project about?"
                        rows={2}
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                    />
                </div>

                {/* Workspace */}
                <div>
                    <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                        Workspace *
                    </label>
                    {workspaces.length === 0 ? (
                        <p className="text-sm text-orange-600 font-semibold px-1">
                            No workspaces found. Create one first.
                        </p>
                    ) : (
                        <select
                            className="input-field"
                            value={workspaceId}
                            onChange={(e) => setWorkspaceId(e.target.value)}
                        >
                            <option value="">Select a workspace…</option>
                            {workspaces.map((ws) => (
                                <option key={ws.id} value={ws.id}>{ws.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Category + Status + Priority (3-col) */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                            Category
                        </label>
                        <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                            {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                            Status
                        </label>
                        <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
                            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                            Priority
                        </label>
                        <select className="input-field" value={priority} onChange={(e) => setPriority(e.target.value)}>
                            {PRIORITY_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                {/* Dates (2-col) */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            className="input-field"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            className="input-field"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Preview chips */}
                <div className="flex gap-2 flex-wrap pt-1">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[status]}`}>
                        {status.replace("_", " ")}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${PRIORITY_COLORS[priority]}`}>
                        {priority} priority
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                        {category}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleClose}
                        className="flex-1 h-11 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !name.trim() || !workspaceId}
                        className="flex-1 btn-primary h-11 rounded-xl"
                    >
                        {loading ? <LoadingSpinner size="sm" /> : "Create Project"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}