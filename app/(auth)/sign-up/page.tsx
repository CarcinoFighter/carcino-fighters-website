"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        bio: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const type = showPassword ? "text" : "password";
    const Icon = showPassword ? EyeOff : Eye;

    async function handleSignUp(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/public-auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "register",
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    bio: formData.bio,
                }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data?.error || "Registration failed");
                return;
            }

            router.push("/dashboard");
        } catch (err) {
            console.error("public sign-up error", err);
            setError("Registration failed");
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
                        <span>Sign up</span>
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
                                <p className="text-sm text-white/60">Join the community</p>
                                <h1 className="text-4xl font-semibold">Create an account</h1>
                                <div className="mt-3 text-sm text-white/70">
                                    Already have an account? <Link href="/sign-in" className="text-[#9a88ff] hover:text-white">Log in</Link>
                                </div>
                            </div>

                            <form className="space-y-4" onSubmit={handleSignUp}>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-[0.2em] text-white/50">Full name</label>
                                        <Input
                                            className="bg-white/5 border-white/10 h-11 text-base"
                                            value={formData.name}
                                            placeholder="Alex Johnson"
                                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-[0.2em] text-white/50">Username</label>
                                        <Input
                                            className="bg-white/5 border-white/10 h-11 text-base"
                                            value={formData.username}
                                            placeholder="username"
                                            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-[0.2em] text-white/50">Email</label>
                                    <Input
                                        className="bg-white/5 border-white/10 h-11 text-base"
                                        type="email"
                                        value={formData.email}
                                        placeholder="you@example.com"
                                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-[0.2em] text-white/50">Password</label>
                                    <div className="relative">
                                        <Input
                                            type={type}
                                            className="bg-white/5 border-white/10 h-11 pr-11 text-base"
                                            value={formData.password}
                                            placeholder="Enter your password"
                                            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
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

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-[0.2em] text-white/50">Bio (optional)</label>
                                    <Textarea
                                        className="bg-white/5 border-white/10 min-h-[120px] text-base"
                                        placeholder="Tell us a bit about yourself"
                                        value={formData.bio}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                                    />
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
                                    {loading ? "Creating account..." : "Sign up"}
                                </Button>

                                <div className="text-center text-sm text-white/60">Or register with</div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full h-11 border border-white/15 bg-white/5 text-white"
                                    disabled
                                >
                                    Coming soon
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* <div className="relative hidden lg:block rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/20 via-fuchsia-500/10 to-indigo-600/20 p-8 overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_70%_60%,rgba(108,99,255,0.15),transparent_55%)]" />
                        <div className="relative z-10 flex h-full flex-col justify-center gap-4 text-white">
                            <p className="text-sm text-white/70">Welcome</p>
                            <h2 className="text-3xl font-semibold leading-tight">Create your account to share and discover survivor stories.</h2>
                            <p className="text-white/70 text-base">Join the community and start writing, reading, and connecting with others on the same journey.</p>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
}
