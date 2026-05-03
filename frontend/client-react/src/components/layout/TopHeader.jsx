// src/components/layout/TopHeader.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import Avatar from "../ui/Avatar";
import LoadingSpinner from "../ui/LoadingSpinner";

// ── Notification panel ─────────────────────────────────────────────
function NotificationPanel({ notifications, unreadCount, loading, onMarkRead, onMarkAllRead, onClose }) {
    function timeAgo(dateStr) {
        if (!dateStr) return "";
        const diff = Date.now() - new Date(dateStr).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return "just now";
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    }

    return (
        <div className="
      absolute right-0 top-full mt-2 w-80 z-50
      bg-white rounded-2xl shadow-2xl overflow-hidden
      border border-slate-100
    "
            style={{ boxShadow: "0 20px 60px rgba(20,28,37,.12)" }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllRead}
                            className="text-xs text-primary font-semibold hover:underline"
                        >
                            Mark all read
                        </button>
                    )}
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined text-base">close</span>
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="max-h-80 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <LoadingSpinner size="md" className="border-slate-300 border-t-primary" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-4xl">notifications_none</span>
                        <p className="text-xs font-semibold">No notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {notifications.slice(0, 15).map((n) => {
                            const isRead = n.isRead || n.read;
                            return (
                                <button
                                    key={n.id}
                                    onClick={() => !isRead && onMarkRead(n.id)}
                                    className={`
                    w-full flex gap-3 px-4 py-3 text-left
                    hover:bg-slate-50 transition-colors
                    ${!isRead ? "bg-blue-50/60" : ""}
                  `}
                                >
                                    <span
                                        className={`
                      w-2 h-2 rounded-full mt-2 flex-shrink-0
                      ${!isRead ? "bg-primary" : "bg-slate-200"}
                    `}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
                                            {n.message}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            {timeAgo(n.createdAt)}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Top header ─────────────────────────────────────────────────────
export default function TopHeader() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    const {
        notifications,
        unreadCount,
        loading: notifLoading,
        markRead,
        markAllRead,
    } = useNotifications();

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClick(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        // Phase 3 will wire this to the search API
    };

    const handleLogout = () => {
        logout();
        navigate("/auth", { replace: true });
    };

    return (
        <header className="
      sticky top-0 z-40 h-16
      flex items-center justify-between px-6 gap-4
      bg-white/85 backdrop-blur-xl
      border-b border-slate-100/60
    ">
            {/* ── Left: search ── */}
            <form onSubmit={handleSearch} className="flex-1 max-w-sm">
                <div className="relative">
                    <span className="
            material-symbols-outlined
            absolute left-3 top-1/2 -translate-y-1/2
            text-slate-400 text-lg pointer-events-none
          ">
                        search
                    </span>
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tasks, projects..."
                        className="
              w-full pl-10 pr-4 py-2
              bg-slate-50 rounded-xl text-sm
              border-none outline-none
              focus:ring-2 focus:ring-primary/20
              focus:bg-white transition-all
            "
                    />
                </div>
            </form>

            {/* ── Right: actions ── */}
            <div className="flex items-center gap-2">

                {/* Help */}
                <button className="
          w-9 h-9 rounded-xl flex items-center justify-center
          text-slate-500 hover:bg-slate-100 transition-colors
        ">
                    <span className="material-symbols-outlined text-xl">help_outline</span>
                </button>

                {/* Notifications */}
                <div ref={notifRef} className="relative">
                    <button
                        onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }}
                        className="
              relative w-9 h-9 rounded-xl flex items-center justify-center
              text-slate-500 hover:bg-slate-100 transition-colors
            "
                    >
                        <span className="material-symbols-outlined text-xl">notifications</span>
                        {unreadCount > 0 && (
                            <span className="
                absolute -top-0.5 -right-0.5
                min-w-[18px] h-[18px] px-1
                bg-error rounded-full
                text-white text-[10px] font-bold
                flex items-center justify-center
              ">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {notifOpen && (
                        <NotificationPanel
                            notifications={notifications}
                            unreadCount={unreadCount}
                            loading={notifLoading}
                            onMarkRead={markRead}
                            onMarkAllRead={markAllRead}
                            onClose={() => setNotifOpen(false)}
                        />
                    )}
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-slate-200 mx-1" />

                {/* Profile menu */}
                <div ref={profileRef} className="relative">
                    <button
                        onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <Avatar name={user?.fullName || user?.email || "U"} size="sm" />
                        <span className="text-sm font-semibold text-slate-700 hidden sm:block max-w-[120px] truncate">
                            {user?.fullName || user?.email || "User"}
                        </span>
                        <span className="material-symbols-outlined text-slate-400 text-base">
                            expand_more
                        </span>
                    </button>

                    {profileOpen && (
                        <div className="
              absolute right-0 top-full mt-2 w-52 z-50
              bg-white rounded-2xl shadow-xl
              border border-slate-100 overflow-hidden py-1
            ">
                            <div className="px-4 py-3 border-b border-slate-50">
                                <p className="text-sm font-bold text-slate-900 truncate">
                                    {user?.fullName || "User"}
                                </p>
                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                            </div>

                            {[
                                { icon: "person", label: "Profile", action: () => { } },
                                { icon: "settings", label: "Settings", action: () => { } },
                            ].map(({ icon, label, action }) => (
                                <button
                                    key={label}
                                    onClick={() => { action(); setProfileOpen(false); }}
                                    className="
                    w-full flex items-center gap-3 px-4 py-2.5
                    text-sm text-slate-700 font-medium
                    hover:bg-slate-50 transition-colors text-left
                  "
                                >
                                    <span className="material-symbols-outlined text-lg text-slate-400">{icon}</span>
                                    {label}
                                </button>
                            ))}

                            <div className="border-t border-slate-50 mt-1">
                                <button
                                    onClick={handleLogout}
                                    className="
                    w-full flex items-center gap-3 px-4 py-2.5
                    text-sm text-red-600 font-medium
                    hover:bg-red-50 transition-colors text-left
                  "
                                >
                                    <span className="material-symbols-outlined text-lg">logout</span>
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}