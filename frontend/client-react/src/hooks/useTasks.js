import { useState, useEffect, useCallback } from "react";
import { taskService, commentService, projectService } from "../services/api";

export function useTasks(projectId) {
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Initial load ──────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        setError(null);
        try {
            const [taskRes, memberRes, projectRes] = await Promise.all([
                taskService.getByProject(projectId),
                projectService.getMembers(projectId),
                projectService.getById(projectId),
            ]);
            setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
            setMembers(Array.isArray(memberRes.data) ? memberRes.data : []);
            setProject(projectRes.data || null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load board.");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── Optimistic status update (drag & drop) ────────────────────────
    const updateTaskStatus = useCallback(async (taskId, newStatus) => {
        // Optimistic update — move card immediately in UI
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
        try {
            await taskService.updateStatus(taskId, newStatus);
        } catch {
            // Rollback on failure
            fetchAll();
        }
    }, [fetchAll]);

    // ── Create task ───────────────────────────────────────────────────
    const createTask = useCallback(async (projectId, payload) => {
        const { data } = await taskService.create(projectId, payload);
        setTasks((prev) => [data, ...prev]);
        return data;
    }, []);

    // ── Update task ───────────────────────────────────────────────────
    const updateTask = useCallback(async (taskId, payload) => {
        const { data } = await taskService.update(taskId, payload);
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, ...data } : t))
        );
        return data;
    }, []);

    // ── Delete task ───────────────────────────────────────────────────
    const deleteTask = useCallback(async (taskId) => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        try {
            await taskService.delete(taskId);
        } catch {
            fetchAll();
        }
    }, [fetchAll]);

    // ── Comments ──────────────────────────────────────────────────────
    const fetchComments = useCallback(async (taskId) => {
        const { data } = await commentService.getByTask(taskId);
        return Array.isArray(data) ? data : [];
    }, []);

    const addComment = useCallback(async (taskId, content) => {
        const { data } = await commentService.create(taskId, content);
        return data;
    }, []);

    const deleteComment = useCallback(async (commentId) => {
        await commentService.delete(commentId);
    }, []);

    return {
        tasks, members, project, loading, error,
        refetch: fetchAll,
        updateTaskStatus,
        createTask,
        updateTask,
        deleteTask,
        fetchComments,
        addComment,
        deleteComment,
    };
}