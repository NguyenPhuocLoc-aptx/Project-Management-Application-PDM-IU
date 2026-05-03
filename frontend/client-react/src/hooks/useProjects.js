import { useState, useEffect, useCallback } from "react";
import { projectService } from "../services/api";

export function useProjects(params = {}) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await projectService.getAll(params);
            setProjects(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load projects.");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const addProject = (p) => setProjects((prev) => [p, ...prev]);
    const removeProject = (id) => setProjects((prev) => prev.filter((p) => p.id !== id));
    const updateProject = (updated) =>
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));

    return { projects, loading, error, refetch: fetch, addProject, removeProject, updateProject };
}