// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Initialise from localStorage so state survives page refresh
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem("user")) || null; }
        catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem("authToken") || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const clearError = useCallback(() => setError(null), []);

    // ── signup ────────────────────────────────────────────────────────
    const signup = useCallback(async (fullName, email, password) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await authService.signup(fullName, email, password);
            const userData = { email, fullName };
            localStorage.setItem("authToken", data.jwt);
            localStorage.setItem("user", JSON.stringify(userData));
            setToken(data.jwt);
            setUser(userData);
            return { success: true };
        } catch (err) {
            // The backend returns ErrorDetails { error, message, timestamp }
            const message =
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Registration failed. Please try again.";
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    // ── signin ────────────────────────────────────────────────────────
    const signin = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await authService.signin(email, password);
            const userData = { email, fullName: data.fullName || email };
            localStorage.setItem("authToken", data.jwt);
            localStorage.setItem("user", JSON.stringify(userData));
            setToken(data.jwt);
            setUser(userData);
            return { success: true };
        } catch (err) {
            const message =
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Invalid email or password.";
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    // ── logout ────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }, []);

    const isAuthenticated = Boolean(token && user);

    return (
        <AuthContext.Provider value={{
            user, token, loading, error,
            isAuthenticated,
            signup, signin, logout,
            clearError,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Convenience hook — throws if used outside AuthProvider
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}