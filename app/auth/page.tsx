"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/api/auth/auth-client";
import {
    Receipt,
    Mail,
    Lock,
    User,
    ArrowRight,
    Loader2,
    Eye,
    EyeOff,
    AlertCircle,
} from "lucide-react";

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                const { error: signInError } = await authClient.signIn.email({
                    email: form.email,
                    password: form.password,
                });

                if (signInError) {
                    setError(signInError.message || "Invalid email or password.");
                    setLoading(false);
                    return;
                }
            } else {
                if (form.password.length < 8) {
                    setError("Password must be at least 8 characters.");
                    setLoading(false);
                    return;
                }

                const { error: signUpError } = await authClient.signUp.email({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                });

                if (signUpError) {
                    setError(signUpError.message || "Could not create account.");
                    setLoading(false);
                    return;
                }
            }

            router.push("/");
            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setError(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            {/* Container */}
            <div className="w-full max-w-[420px]">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-10">
                    <div className="w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-background" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight">
                        ExpensWise
                    </span>
                </div>

                {/* Card */}
                <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-xl font-semibold">
                            {isLogin ? "Welcome back" : "Create your account"}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isLogin
                                ? "Sign in to continue managing your finances."
                                : "Start tracking your expenses in seconds."}
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-2.5 p-3 mb-5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name — only for signup */}
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="auth-name"
                                    className="text-sm font-medium"
                                >
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        id="auth-name"
                                        type="text"
                                        placeholder="John Doe"
                                        required={!isLogin}
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({ ...form, name: e.target.value })
                                        }
                                        className="flex h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="auth-email"
                                className="text-sm font-medium"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    id="auth-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="auth-password"
                                className="text-sm font-medium"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    id="auth-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({ ...form, password: e.target.value })
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-10 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {!isLogin && (
                                <p className="text-xs text-muted-foreground">
                                    Must be at least 8 characters.
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? "Sign in" : "Create account"}
                                    <ArrowRight className="w-4 h-4 ml-1.5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Mode toggle */}
                    <div className="mt-6 pt-5 border-t text-center text-sm text-muted-foreground">
                        {isLogin
                            ? "Don't have an account?"
                            : "Already have an account?"}{" "}
                        <button
                            type="button"
                            onClick={switchMode}
                            className="text-foreground font-medium hover:underline underline-offset-4 transition-colors"
                        >
                            {isLogin ? "Sign up" : "Sign in"}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-xs text-muted-foreground text-center mt-6">
                    By continuing, you agree to our Terms of Service and Privacy
                    Policy.
                </p>
            </div>
        </div>
    );
}
