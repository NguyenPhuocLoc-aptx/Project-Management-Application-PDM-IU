import { useState, useEffect, useCallback, useRef } from "react";
import { notificationService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const POLL_INTERVAL = 30_000; // 30 s

export function useNotifications() {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const intervalRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const { data } = await notificationService.getAll();
            const list = Array.isArray(data) ? data : (data?.content ?? []);
            setNotifications(list);
            setUnreadCount(list.filter((n) => !n.isRead && !n.read).length);
        } catch {
            // Non-critical — silently swallow errors
        }
    }, [isAuthenticated]);

    // Initial fetch
    useEffect(() => {
        if (!isAuthenticated) return;
        setLoading(true);
        fetchNotifications().finally(() => setLoading(false));
        intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, [isAuthenticated, fetchNotifications]);

    const markRead = useCallback(async (id) => {
        try {
            await notificationService.markRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch {
            // silently fail
        }
    }, []);

    const markAllRead = useCallback(async () => {
        try {
            await notificationService.markAllRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true, read: true }))
            );
            setUnreadCount(0);
        } catch {
            // silently fail
        }
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        refetch: fetchNotifications,
        markRead,
        markAllRead,
    };
}