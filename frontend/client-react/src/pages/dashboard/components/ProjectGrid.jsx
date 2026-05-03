import ProjectCard from "./ProjectCard";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse space-y-4">
            <div className="space-y-2">
                <div className="h-4 w-20 bg-slate-100 rounded-full" />
                <div className="h-5 w-3/4 bg-slate-100 rounded-lg" />
                <div className="h-3 w-full bg-slate-50 rounded" />
            </div>
            <div className="space-y-1.5">
                <div className="flex justify-between">
                    <div className="h-3 w-12 bg-slate-50 rounded" />
                    <div className="h-3 w-8 bg-slate-50 rounded" />
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full" />
            </div>
            <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 rounded-full bg-slate-100" />
                    <div className="h-3 w-16 bg-slate-50 rounded" />
                </div>
                <div className="h-3 w-20 bg-slate-50 rounded" />
            </div>
        </div>
    );
}

export default function ProjectGrid({ projects, loading, error, onNewProject }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <span className="material-symbols-outlined text-5xl text-red-300">error_outline</span>
                <p className="font-bold text-slate-700">Failed to load projects</p>
                <p className="text-sm text-slate-400">{error}</p>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
                <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-primary">folder_open</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">No projects yet</h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Create your first project to get started.
                    </p>
                </div>
                <button onClick={onNewProject} className="btn-primary px-6 py-3 rounded-xl">
                    <span className="material-symbols-outlined text-sm">add</span>
                    New Project
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
    );
}