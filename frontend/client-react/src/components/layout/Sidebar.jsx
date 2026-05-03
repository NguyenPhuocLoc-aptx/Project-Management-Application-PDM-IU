// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";

const NAV_ITEMS = [
    { icon: "dashboard", label: "Dashboard", to: "/dashboard" },
    { icon: "view_kanban", label: "Kanban Board", to: "/board" },
    { icon: "assignment", label: "My Tasks", to: "/tasks" },
    { icon: "chat_bubble", label: "Messages", to: "/messages" },
    { icon: "notifications", label: "Notifications", to: "/notifications" },
];

export default function Sidebar({ onNewProject }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/auth", { replace: true });
    };

    return (
        <aside className="
      h-screen w-64 fixed left-0 top-0 z-50
      bg-slate-50 flex flex-col p-4
      border-r border-slate-100
    ">
            {/* ── Logo ── */}
            <div className="mb-6 px-2 flex items-center gap-3">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#0051ae,#0969da)" }}
                >
                    <span className="material-symbols-outlined text-white text-sm">
                        rocket_launch
                    </span>
                </div>
                <div>
                    <h2 className="text-lg font-black text-blue-700 leading-none">
                        Dynblath
                    </h2>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">
                        Premium Tier
                    </p>
                </div>
            </div>

            {/* ── Nav ── */}
            <nav className="flex-1 space-y-0.5">
                {NAV_ITEMS.map(({ icon, label, to }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-2.5 rounded-xl
              text-sm font-semibold transition-all duration-150
              ${isActive
                                ? "bg-blue-100/60 text-blue-700"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
            `}
                    >
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* ── New Project CTA ── */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
                <button
                    onClick={onNewProject}
                    className="
            w-full btn-primary py-2.5 text-sm rounded-xl
            shadow-lg shadow-primary/20
          "
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    New Project
                </button>

                {/* ── User footer ── */}
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-100 transition-colors group">
                    <Avatar name={user?.fullName || user?.email || "U"} size="md" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                            {user?.fullName || "User"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                            {user?.email || ""}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Sign out"
                        className="
              text-slate-400 hover:text-red-500 transition-colors
              opacity-0 group-hover:opacity-100
            "
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}