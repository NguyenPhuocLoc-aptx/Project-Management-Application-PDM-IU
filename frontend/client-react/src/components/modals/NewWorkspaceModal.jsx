import { useState } from "react";
import Modal from "../ui/Modal";
import LoadingSpinner from "../ui/LoadingSpinner";
import { workspaceService } from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function NewWorkspaceModal({ open, onClose, onCreated }) {
    const { addToast } = useToast();
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const slugify = (s) =>
        s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const handleSubmit = async () => {
        if (!name.trim()) { setError("Workspace name is required."); return; }
        setLoading(true);
        setError("");
        try {
            const { data } = await workspaceService.create({
                name: name.trim(),
                slug: slugify(name),
                description: desc.trim(),
            });
            addToast(`Workspace "${data.name}" created!`, "success");
            onCreated?.(data);
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create workspace.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName(""); setDesc(""); setError("");
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose} title="Create a new workspace">
            <div className="space-y-5">
                {/* Info banner */}
                <div className="flex gap-3 bg-blue-50 text-blue-800 text-xs font-semibold px-4 py-3 rounded-xl">
                    <span className="material-symbols-outlined text-base flex-shrink-0">info</span>
                    A workspace is your team's home. Projects live inside workspaces.
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                        Workspace Name *
                    </label>
                    <input
                        className="input-field"
                        placeholder="e.g. Design Studio"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        autoFocus
                    />
                    {name && (
                        <p className="text-xs text-slate-400 mt-1.5 px-1">
                            Slug: <span className="font-semibold text-slate-600">{slugify(name)}</span>
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                        Description
                    </label>
                    <textarea
                        className="input-field resize-none"
                        placeholder="What does this workspace focus on?"
                        rows={3}
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleClose}
                        className="flex-1 h-11 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !name.trim()}
                        className="flex-1 btn-primary h-11 rounded-xl"
                    >
                        {loading ? <LoadingSpinner size="sm" /> : "Create Workspace"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}