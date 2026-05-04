// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import AuthPage from "./pages/auth/AuthPage";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import BoardPage from "./pages/board/BoardPage";
import MyTasksPage from "./pages/tasks/MyTasksPage";
import MessagesPage from "./pages/messages/MessagesPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

function PublicRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />

            <Route path="/auth" element={
                <PublicRoute><AuthPage /></PublicRoute>
            } />

            <Route path="/" element={
                <ProtectedRoute><AppLayout /></ProtectedRoute>
            }>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="board/:projectId" element={<BoardPage />} />
                <Route path="board" element={<Navigate to="/dashboard" replace />} />
                <Route path="tasks" element={<MyTasksPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <AppRoutes />
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}