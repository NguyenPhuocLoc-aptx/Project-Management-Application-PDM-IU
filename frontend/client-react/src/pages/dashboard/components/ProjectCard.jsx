import { useNavigate } from "react-router-dom";
import Avatar from "../../../components/ui/Avatar";

const STATUS_STYLES = {
    PLANNING: "bg-slate-100   text-slate-700",
    IN_PROGRESS: "bg-blue-100    text-blue-700",
    ON_HOLD: "bg-orange-100  text-orange-700",
    COMPLETED: "bg-green-100   text-green-700",
    CANCELLED: "bg-red-100     text-red-700",
};

const PRIORITY_DOT = {
    LOW: "bg-slate-400",
    MEDIUM: "bg-blue-500",
    HIGH: "bg-orange-500",
    URGENT: "bg-red-500",
};

function formatDate(isoStr) {
    if (!isoStr) return null;
    return new Date(isoStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(endDate) {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
}

export default function ProjectCard({ project }) {
    const navigate = useNavigate();
    const overdue = isOverdue(project.endDate) && project.status !== "COMPLETED" && project.status !== "CANCELLED";

    return (
        <button
            onClick={() => navigate(`/board/${project.id}`)}
            className="
        group text-left w-full
        bg-white rounded-2xl p-5
        border border-slate-100 hover:border-primary/30
        shadow-sm hover:shadow-md
        transition-all duration-200
        flex flex-col gap-4
      "
        >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[project.status] || STATUS_STYLES.PLANNING}`}>
                            {(project.status || "PLANNING").replace("_", " ")}
                        </span>
                        {project.category && (
                            <span className="text-[11px] font-semibold text-slate-400">
                                {project.category}
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                        {project.name}
                    </h3>
                    {project.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {project.description}
                        </p>
                    )}
                </div>

                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-xl flex-shrink-0">
                    arrow_forward
                </span>
            </div>

            {/* Progress bar */}
            <div>
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">Progress</span>
                    <span className="text-[11px] font-bold text-slate-700">{project.progress ?? 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress ?? 0}%` }}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2">
                {/* Owner avatar */}
                <div className="flex items-center gap-1.5">
                    <Avatar
                        name={project.owner?.fullName || project.owner?.email || "?"}
                        size="xs"
                    />
                    <span className="text-xs text-slate-400 truncate max-w-[100px]">
                        {project.owner?.fullName || project.owner?.email || "Unknown"}
                    </span>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Priority dot */}
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                        <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[project.priority] || PRIORITY_DOT.MEDIUM}`} />
                        {project.priority || "MEDIUM"}
                    </span>

                    {/* Due date */}
                    {project.endDate && (
                        <span className={`flex items-center gap-1 text-[11px] font-semibold ${overdue ? "text-red-500" : "text-slate-400"}`}>
                            <span className="material-symbols-outlined text-[13px]">
                                {overdue ? "schedule" : "calendar_today"}
                            </span>
                            {formatDate(project.endDate)}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}