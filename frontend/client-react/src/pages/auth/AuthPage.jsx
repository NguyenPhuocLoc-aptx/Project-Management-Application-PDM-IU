import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

// ── Small reusable field component ────────────────────────────────────
function Field({ label, id, type = "text", placeholder, value, onChange, hint, autoComplete }) {
    return (
        <div>
            {hint ? (
                <div className="flex justify-between items-center mb-2 px-1">
                    <label htmlFor={id} className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                        {label}
                    </label>
                    {hint}
                </div>
            ) : (
                <label htmlFor={id} className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2 px-1">
                    {label}
                </label>
            )}
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete={autoComplete}
                className="input-field"
            />
        </div>
    );
}

// ── Error banner ──────────────────────────────────────────────────────
function ErrorBanner({ message, onClose }) {
    if (!message) return null;
    return (
        <div className="bg-error-container text-red-800 text-sm font-semibold px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="material-symbols-outlined text-base mt-0.5 flex-shrink-0">error</span>
            <span className="flex-1">{message}</span>
            <button onClick={onClose} className="text-red-600 hover:text-red-800 flex-shrink-0">
                <span className="material-symbols-outlined text-base">close</span>
            </button>
        </div>
    );
}

// ── Login form ────────────────────────────────────────────────────────
function LoginForm({ onSwitch }) {
    const { signin, loading, error, clearError } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async () => {
        if (!email || !password) return;
        const result = await signin(email, password);
        if (result.success) navigate("/dashboard");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSubmit();
    };

    return (
        <div className="space-y-6">
            <div className="text-center md:text-left">
                <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">
                    Welcome back
                </h2>
                <p className="text-on-surface-variant mt-2">
                    Enter your workspace credentials to continue.
                </p>
            </div>

            <ErrorBanner message={error} onClose={clearError} />

            <div className="space-y-4">
                <Field
                    label="Workspace Email"
                    id="login-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                />

                <Field
                    label="Password"
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(v) => { setPassword(v); }}
                    autoComplete="current-password"
                    hint={
                        <button
                            type="button"
                            className="text-xs font-semibold text-primary hover:underline"
                        >
                            Forgot password?
                        </button>
                    }
                />

                <input
                    type="password"
                    className="sr-only"
                    onKeyDown={handleKeyDown}
                    readOnly
                    tabIndex={-1}
                />

                <div className="pt-2">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !email || !password}
                        className="btn-primary w-full h-14"
                    >
                        {loading ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <>
                                <span>Enter Workspace</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/30" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-background text-outline font-medium">
                        OR CONTINUE WITH
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {[
                    {
                        label: "Google",
                        icon: (
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        ),
                    },
                    {
                        label: "SSO",
                        icon: <span className="material-symbols-outlined text-sm">terminal</span>,
                    },
                ].map(({ label, icon }) => (
                    <button
                        key={label}
                        type="button"
                        className="h-12 flex items-center justify-center gap-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-on-surface font-semibold text-sm border border-outline-variant/20"
                    >
                        {icon}
                        {label}
                    </button>
                ))}
            </div>

            <p className="text-center text-sm text-on-surface-variant">
                New to Dynblath?{" "}
                <button
                    type="button"
                    onClick={onSwitch}
                    className="text-primary font-bold hover:underline"
                >
                    Create an account
                </button>
            </p>
        </div>
    );
}

// ── Register form ─────────────────────────────────────────────────────
function RegisterForm({ onSwitch }) {
    const { signup, loading, error, clearError } = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [terms, setTerms] = useState(false);
    const [localErr, setLocalErr] = useState("");

    const handleSubmit = async () => {
        setLocalErr("");
        if (!fullName || !email || !password) {
            setLocalErr("Please fill in all fields.");
            return;
        }
        if (password.length < 8) {
            setLocalErr("Password must be at least 8 characters.");
            return;
        }
        if (!terms) {
            setLocalErr("Please agree to the Terms of Service.");
            return;
        }
        const result = await signup(fullName, email, password);
        if (result.success) navigate("/dashboard");
    };

    const displayError = localErr || error;
    const dismissError = () => { setLocalErr(""); clearError(); };

    return (
        <div className="space-y-6">
            <div className="text-center md:text-left">
                <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">
                    Begin your symphony
                </h2>
                <p className="text-on-surface-variant mt-2">
                    Setup your professional profile in seconds.
                </p>
            </div>

            <ErrorBanner message={displayError} onClose={dismissError} />

            <div className="space-y-4">
                <Field
                    label="Full Name"
                    id="signup-name"
                    placeholder="Johnathan Doe"
                    value={fullName}
                    onChange={setFullName}
                    autoComplete="name"
                />
                <Field
                    label="Professional Email"
                    id="signup-email"
                    type="email"
                    placeholder="john@design.com"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                />
                <Field
                    label="Create Password"
                    id="signup-password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                />

                {/* Password strength indicator */}
                {password.length > 0 && (
                    <PasswordStrength password={password} />
                )}

                <div className="flex items-start gap-3 px-1">
                    <input
                        id="signup-terms"
                        type="checkbox"
                        checked={terms}
                        onChange={(e) => setTerms(e.target.checked)}
                        className="w-5 h-5 rounded mt-0.5 accent-primary flex-shrink-0"
                    />
                    <label htmlFor="signup-terms" className="text-xs text-on-surface-variant leading-relaxed cursor-pointer">
                        I agree to the{" "}
                        <a href="#" className="text-primary font-semibold underline">
                            Terms of Service
                        </a>{" "}
                        and understand how my data is handled.
                    </label>
                </div>

                <div className="pt-2">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !fullName || !email || !password || !terms}
                        className="btn-primary w-full h-14"
                    >
                        {loading ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <>
                                <span>Create Free Account</span>
                                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <p className="text-center text-sm text-on-surface-variant">
                Already an architect?{" "}
                <button
                    type="button"
                    onClick={onSwitch}
                    className="text-primary font-bold hover:underline"
                >
                    Log in here
                </button>
            </p>
        </div>
    );
}

// ── Password strength meter ────────────────────────────────────────────
function PasswordStrength({ password }) {
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];
    const score = checks.filter(Boolean).length;
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

    return (
        <div className="px-1 space-y-1">
            <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-outline-variant/30"
                            }`}
                    />
                ))}
            </div>
            {score > 0 && (
                <p className="text-xs text-on-surface-variant px-0.5">
                    Password strength: <span className="font-semibold">{labels[score]}</span>
                </p>
            )}
        </div>
    );
}

// ── Left visual column ─────────────────────────────────────────────────
function VisualColumn() {
    return (
        <div className="hidden lg:flex lg:w-1/2 relative bg-surface-dim overflow-hidden items-center justify-center p-12">
            {/* Background image */}
            <div
                className="absolute inset-0 opacity-40"
                style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBswqQeXUBhTFD_S2PeaI8nmAm9jJ7Xe00FmytoNUJlfaOPUGz5lztNUX9yZ7rdc2NHz3XEs7TtBFoZfJ7Jo7tr2MwEekbQ_97MqdP2Ki1ychfnIIbU9VAqpLPHddRzxMEd9wwv0LdWEPIxBFfvNuoIbzj9FRl0RwVX-dLv937em5Q8-NMDhO_C_4menE30qhj-XtCzTGveijvuqyyDA3fV58lcaH0hR-dlQGjwlvagGzAJOj7TXtO5vrSDWgcDZSF_-EuwfM6TVKo')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />

            <div className="relative z-10 max-w-lg">
                <h1 className="text-5xl font-black tracking-tight text-on-surface mb-6 leading-tight">
                    Dynblath your{" "}
                    <span className="text-primary">vision.</span>
                </h1>
                <p className="text-xl text-on-surface-variant leading-relaxed mb-8">
                    The editorial workspace designed for high-level builders. Move through
                    your projects with the clarity of a high-end publication.
                </p>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        {
                            icon: "dashboard",
                            title: "Tonal Layering",
                            desc: "Visual depth without the noise.",
                            glass: true,
                        },
                        {
                            icon: "auto_awesome",
                            title: "Smart Flow",
                            desc: "Automated task orchestration.",
                            glass: false,
                        },
                    ].map(({ icon, title, desc, glass }) => (
                        <div
                            key={title}
                            className={`p-6 rounded-[0.75rem] ${glass
                                ? "bg-white/80 backdrop-blur-xl"
                                : "bg-surface-container-lowest"
                                }`}
                        >
                            <span className="material-symbols-outlined text-primary mb-2 block">
                                {icon}
                            </span>
                            <h3 className="font-bold text-on-surface">{title}</h3>
                            <p className="text-sm text-on-surface-variant">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Auth page root ─────────────────────────────────────────────────────
export default function AuthPage() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState("login"); // "login" | "register"

    useEffect(() => {
        if (!isAuthenticated) return;

        const pendingToken = sessionStorage.getItem("pendingInviteToken");
        if (pendingToken) {
            sessionStorage.removeItem("pendingInviteToken");
            navigate(`/accept-invitation?token=${pendingToken}`, { replace: true });
            return;
        }

        navigate("/dashboard", { replace: true });
    }, [isAuthenticated, navigate]);
    useEffect(() => {
        if (isAuthenticated) navigate("/dashboard", { replace: true });
    }, [isAuthenticated, navigate]);

    return (
        <div className="bg-background min-h-screen flex flex-col md:flex-row font-body">
            <VisualColumn />

            {/* Right auth column */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative">

                {/* Mobile logo */}
                <div className="absolute top-8 left-8 lg:hidden">
                    <div className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
                        <span
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
                            style={{ background: "linear-gradient(135deg, #0051ae, #0969da)" }}
                        >
                            D
                        </span>
                        Dynblath
                    </div>
                </div>

                <div className="w-full max-w-md">
                    {mode === "login" ? (
                        <LoginForm onSwitch={() => { setMode("register"); }} />
                    ) : (
                        <RegisterForm onSwitch={() => { setMode("login"); }} />
                    )}

                    {/* Footer links */}
                    <div className="mt-12 flex flex-wrap justify-center gap-6 text-[10px] font-bold tracking-widest text-outline uppercase opacity-50">
                        {["Privacy Policy", "Terms of Service", "System Status"].map((link) => (
                            <a key={link} href="#" className="hover:text-primary transition-colors">
                                {link}
                            </a>
                        ))}
                        <span>© 2025 Dynblath Inc.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}