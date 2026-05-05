// src/pages/dashboard/DashboardPage.jsx
import { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../components/layout/AppLayout";
import { useWorkspaces } from "../../hooks/useWorkspaces";
import { useProjects } from "../../hooks/useProjects";
import WorkspaceSwitcher from "./components/WorkspaceSwitcher";
import StatsBar from "./components/StatsBar";
import ProjectGrid from "./components/ProjectGrid";
import NewWorkspaceModal from "../../components/modals/NewWorkspaceModal";
import NewProjectModal from "../../components/modals/NewProjectModal";

const SORT_OPTIONS = [
    { value: "updated", label: "Last Updated" },
    { value: "name", label: "Name A–Z" },
    { value: "created", label: "Date Created" },
];

const STATUS_FILTER_OPTIONS = ["ALL", "PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"];

export default function DashboardPage() {
    const { user } = useAuth();
    const { openNewProject } = useLayout();

    // Data hooks
    const { workspaces, loading: wsLoading, addWorkspace } = useWorkspaces();
    const { projects, loading: prLoading, error: prError, addProject } = useProjects();

    // Local UI state
    const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("updated");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [wsModalOpen, setWsModalOpen] = useState(false);
    const [projModalOpen, setProjModalOpen] = useState(false);

    // ── Derived: filtered + sorted project list ─────────────────────
    const visibleProjects = useMemo(() => {
        let list = [...projects];

        // Workspace filter
        if (activeWorkspaceId) {
            list = list.filter((p) => p.workspace?.id === activeWorkspaceId);
        }

        // Status filter
        if (statusFilter !== "ALL") {
            list = list.filter((p) => p.status === statusFilter);
        }

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (p) =>
                    p.name?.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q) ||
                    p.category?.toLowerCase().includes(q)
            );
        }

        // Sort
        list.sort((a, b) => {
            if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
            if (sortBy === "created") return new Date(b.createdAt) - new Date(a.createdAt);
            // default: updated
            return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        });

        return list;
    }, [projects, activeWorkspaceId, search, statusFilter, sortBy]);

    // ── Greeting ────────────────────────────────────────────────────
    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? "Good morning" :
            hour < 18 ? "Good afternoon" :
                "Good evening";

    const firstName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">
                        {greeting}, {firstName} 👋
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                        Here's what's happening with your projects today.
                    </p>
                </div>

                <button
                    onClick={() => setProjModalOpen(true)}
                    className="btn-primary px-5 py-2.5 rounded-xl self-start sm:self-auto shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    New Project
                </button>
            </div>

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Workspace switcher */}
                <WorkspaceSwitcher
                    workspaces={workspaces}
                    activeId={activeWorkspaceId}
                    onSelect={setActiveWorkspaceId}
                    onNewWorkspace={() => setWsModalOpen(true)}
                    loading={wsLoading}
                />

                {/* Search */}
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none z-10">
                        search
                    </span>
                    <input
                        className="input-field !pl-10 py-2 w-full"
                        placeholder="Filter projects…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Status filter pills */}
                <div className="flex gap-1.5 flex-wrap">
                    {STATUS_FILTER_OPTIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`
                text-xs font-bold px-3 py-1.5 rounded-full transition-colors
                ${statusFilter === s
                                    ? "bg-primary text-white"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-primary/40"}
              `}
                        >
                            {s === "ALL" ? "All" : s.replace("_", " ")}
                        </button>
                    ))}
                </div>

                {/* Sort */}
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

            {/* ── Stats bar ── */}
            <StatsBar projects={visibleProjects} />

            {/* ── Project grid ── */}
            <ProjectGrid
                projects={visibleProjects}
                loading={prLoading}
                error={prError}
                onNewProject={() => setProjModalOpen(true)}
            />

            {/* ── Modals ── */}
            <NewWorkspaceModal
                open={wsModalOpen}
                onClose={() => setWsModalOpen(false)}
                onCreated={(ws) => {
                    addWorkspace(ws);
                    setActiveWorkspaceId(ws.id);
                }}
            />

            <NewProjectModal
                open={projModalOpen}
                onClose={() => setProjModalOpen(false)}
                onCreated={addProject}
                workspaces={workspaces}
                defaultWorkspaceId={activeWorkspaceId || workspaces[0]?.id || ""}
            />
        </div>
    );
}