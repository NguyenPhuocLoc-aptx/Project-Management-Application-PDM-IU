// src/pages/notifications/NotificationsPage.jsx
import { useState, useMemo } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

// ── Constants ──────────────────────────────────────────────────────
const TYPE_CONFIG = {
    TASK_ASSIGNED: { icon: "task_alt", color: "bg-blue-100   text-blue-700", dot: "bg-blue-500" },
    TASK_UPDATED: { icon: "edit", color: "bg-slate-100  text-slate-700", dot: "bg-slate-400" },
    TASK_COMMENT: { icon: "chat_bubble", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
    PROJECT_INVITATION: { icon: "group_add", color: "bg-green-100  text-green-700", dot: "bg-green-500" },
    PROJECT_MEMBER_JOINED: { icon: "person_add", color: "bg-teal-100   text-teal-700", dot: "bg-teal-500" },
    MENTION: { icon: "alternate_email", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
    DUE_DATE_REMINDER: { icon: "schedule", color: "bg-red-100    text-red-700", dot: "bg-red-500" },
    DEFAULT: { icon: "notifications", color: "bg-slate-100  text-slate-600", dot: "bg-slate-400" },
};

function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Single notification row ────────────────────────────────────────
function NotificationRow({ notification, onMarkRead }) {
    const isRead = notification.isRead || notification.read;
    const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.DEFAULT;

    return (
        <div
            onClick={() => !isRead && onMarkRead(notification.id)}
            className={`
        flex items-start gap-4 px-5 py-4 rounded-2xl
        border transition-all duration-150
        ${isRead
                    ? "bg-white border-slate-100"
                    : "bg-blue-50/60 border-blue-100/50 cursor-pointer hover:bg-blue-50"}
      `}
        >
            {/* Icon */}
            <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center
        flex-shrink-0 ${cfg.color}
      `}>
                <span className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                    {cfg.icon}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${isRead ? "text-slate-600" : "text-slate-800 font-semibold"}`}>
                    {notification.message}
                </p>
                <p className="text-[11px] text-slate-400 mt-1.5">{timeAgo(notification.createdAt)}</p>
            </div>

            {/* Unread dot */}
            <div className="flex-shrink-0 mt-1.5">
                {!isRead ? (
                    <span className={`w-2.5 h-2.5 rounded-full block ${cfg.dot}`} />
                ) : (
                    <span className="w-2.5 h-2.5 block" />
                )}
            </div>
        </div>
    );
}

// ── Loading skeleton ───────────────────────────────────────────────
function SkeletonRow() {
    return (
        <div className="flex items-start gap-4 px-5 py-4 bg-white rounded-2xl border border-slate-100 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-50  rounded w-1/4" />
            </div>
        </div>
    );
}

// ── Page root ──────────────────────────────────────────────────────
export default function NotificationsPage() {
    const {
        notifications,
        unreadCount,
        loading,
        markRead,
        markAllRead,
    } = useNotifications();

    const [filter, setFilter] = useState("ALL"); // "ALL" | "UNREAD"

    const visible = useMemo(() => {
        if (filter === "UNREAD") {
            return notifications.filter((n) => !n.isRead && !n.read);
        }
        return notifications;
    }, [notifications, filter]);

    return (
        <div className="max-w-3xl mx-auto space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Notifications</h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                        {unreadCount > 0
                            ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                            : "All caught up!"}
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-primary hover:bg-blue-50 transition-colors border border-primary/20"
                    >
                        <span className="material-symbols-outlined text-base">done_all</span>
                        Mark all read
                    </button>
                )}
            </div>

            {/* ── Filter tabs ── */}
            <div className="flex gap-2 border-b border-slate-100 pb-1">
                {[
                    { key: "ALL", label: "All", count: notifications.length },
                    { key: "UNREAD", label: "Unread", count: unreadCount },
                ].map(({ key, label, count }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
              transition-colors
              ${filter === key
                                ? "bg-primary text-white"
                                : "text-slate-600 hover:bg-slate-100"}
            `}
                    >
                        {label}
                        {count > 0 && (
                            <span className={`
                text-[11px] font-bold px-1.5 py-0.5 rounded-full
                ${filter === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}
              `}>
                                {count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Notification list ── */}
            {loading ? (
                <div className="space-y-2.5">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
                </div>
            ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-slate-400"
                            style={{ fontVariationSettings: "'FILL' 1" }}>
                            notifications_none
                        </span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">
                            {filter === "UNREAD" ? "No unread notifications" : "No notifications yet"}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                            {filter === "UNREAD"
                                ? "Switch to All to see your notification history."
                                : "Activity on your projects and tasks will appear here."}
                        </p>
                    </div>
                    {filter === "UNREAD" && (
                        <button
                            onClick={() => setFilter("ALL")}
                            className="btn-primary px-5 py-2.5 rounded-xl text-sm"
                        >
                            View All
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-2.5">
                    {visible.map((n) => (
                        <NotificationRow
                            key={n.id}
                            notification={n}
                            onMarkRead={markRead}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}