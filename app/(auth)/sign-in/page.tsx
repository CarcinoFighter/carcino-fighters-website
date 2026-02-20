"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

function SignInInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get("registered");
    const rawRedirect = searchParams.get("redirectTo") || "/blogs/dashboard";
    const redirectTarget = useMemo(
        () => (rawRedirect.startsWith("/") ? rawRedirect : "/blogs/dashboard"),
        [rawRedirect]
    );

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const type = showPassword ? "text" : "password";
    const Icon = showPassword ? EyeOff : Eye;

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch("/api/public-auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "login", identifier, password }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data?.error || "Login failed");
                return;
            }

            router.replace(redirectTarget);
        } catch (err) {
                console.error("public login error", err);
                setError("Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0d0b14] via-[#1a102b] to-[#130022] text-white flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-10 text-sm text-white/70">
                    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 flex items-center gap-3">
                        <span className="text-xs uppercase tracking-[0.15em]">Survivor Hub</span>
                        <span className="h-1 w-1 rounded-full bg-white/40" />
                        <span>Sign in</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-white/60">
                        <Link href="/">Home</Link>
                        <Link href="/article">Articles</Link>
                        <Link href="/survivorstories">Survivors</Link>
                    </div>
                </div>

                <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-center">
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_25px_80px_-30px_rgba(0,0,0,0.6)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-800/10 blur-3xl" />
                        <div className="relative flex flex-col gap-6">
                            <div>
                                <p className="text-sm text-white/60">Welcome back</p>
                                <h1 className="text-4xl font-semibold">Sign in to your account</h1>
                                {registered && (
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-200">
                                        Account created! Please sign in.
                                    </div>
                                )}
                            </div>

                            <form className="space-y-4" onSubmit={handleLogin}>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-[0.2em] text-white/50">Email or username</label>
                                    <Input
                                        type="text"
                                        className="bg-white/5 border-white/10 h-11 text-base"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder="you@example.com or username"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-[0.2em] text-white/50">Password</label>
                                    <div className="relative">
                                        <Input
                                            type={type}
                                            className="bg-white/5 border-white/10 h-11 pr-11 text-base"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute inset-y-0 right-3 flex items-center text-white/70 hover:text-white"
                                        >
                                            <Icon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                {error && (
                                    <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                                        {error}
                                    </div>
                                )}
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-[#7b5dff] hover:bg-[#6849e6]"
                                    disabled={loading}
                                >
                                    {loading ? "Signing in..." : "Sign in"}
                                </Button>
                                <div className="text-center text-sm text-white/70">
                                    New here? <Link href="/sign-up" className="text-[#9a88ff] hover:text-white">Create an account</Link>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* <div className="relative hidden lg:block rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/20 via-fuchsia-500/10 to-indigo-600/20 p-8 overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_70%_60%,rgba(108,99,255,0.15),transparent_55%)]" />
                        <div className="relative z-10 flex h-full flex-col justify-center gap-4 text-white">
                            <p className="text-sm text-white/70">Community of fighters</p>
                            <h2 className="text-3xl font-semibold leading-tight">Share, read, and support survivor stories.</h2>
                            <p className="text-white/70 text-base">Log back in to continue your journey, publish updates, or discover new stories of resilience.</p>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#686279] text-white/80">
                    Loading sign-in...
                </div>
            }
        >
            <SignInInner />
        </Suspense>
    );
}
