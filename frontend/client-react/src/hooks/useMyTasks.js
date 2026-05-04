// src/hooks/useMyTasks.js
import { useState, useEffect, useCallback } from "react";
import { myTasksService } from "../services/api";

export function useMyTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await myTasksService.getAssigned();
            setTasks(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load your tasks.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const updateTaskLocally = useCallback((taskId, patch) => {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t)));
    }, []);

    return { tasks, loading, error, refetch: fetchTasks, updateTaskLocally };
}