import { useState, useEffect, useCallback } from "react";
import { workspaceService } from "../services/api";

export function useWorkspaces() {
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await workspaceService.getAll();
            setWorkspaces(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load workspaces.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const addWorkspace = (ws) => setWorkspaces((prev) => [ws, ...prev]);

    return { workspaces, loading, error, refetch: fetch, addWorkspace };
}