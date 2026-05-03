import { useState } from "react";
import Avatar from "../../../components/ui/Avatar";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

export default function WorkspaceSwitcher({
    workspaces,
    activeId,
    onSelect,
    onNewWorkspace,
    loading,
}) {
    const [open, setOpen] = useState(false);
    const active = workspaces.find((w) => w.id === activeId);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-primary/30 transition-colors shadow-sm"
            >
                {loading ? (
                    <LoadingSpinner size="sm" className="border-slate-200 border-t-primary" />
                ) : (
                    <>
                        <Avatar name={active?.name || "All"} size="sm" />
                        <span className="text-sm font-bold text-slate-800 max-w-[140px] truncate">
                            {active?.name || "All Workspaces"}
                        </span>
                        <span className="material-symbols-outlined text-slate-400 text-base">unfold_more</span>
                    </>
                )}
            </button>

            {open && (
                <div className="absolute left-0 top-full mt-1 w-60 z-50 bg-white rounded-2xl shadow-xl border border-slate-100 py-1 overflow-hidden">
                    {/* All option */}
                    <button
                        onClick={() => { onSelect(null); setOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors ${!activeId ? "text-primary" : "text-slate-700"}`}
                    >
                        <span className="material-symbols-outlined text-lg text-slate-400">workspaces</span>
                        All Workspaces
                        {!activeId && <span className="ml-auto material-symbols-outlined text-primary text-base">check</span>}
                    </button>

                    {workspaces.length > 0 && <div className="border-t border-slate-50 my-1" />}

                    {workspaces.map((ws) => (
                        <button
                            key={ws.id}
                            onClick={() => { onSelect(ws.id); setOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors ${activeId === ws.id ? "text-primary" : "text-slate-700"}`}
                        >
                            <Avatar name={ws.name} size="sm" />
                            <span className="flex-1 truncate text-left">{ws.name}</span>
                            {activeId === ws.id && (
                                <span className="material-symbols-outlined text-primary text-base">check</span>
                            )}
                        </button>
                    ))}

                    <div className="border-t border-slate-50 mt-1">
                        <button
                            onClick={() => { onNewWorkspace(); setOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-blue-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            New Workspace
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}