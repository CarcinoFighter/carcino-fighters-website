"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

function SignInInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get("registered");
    const rawRedirect = searchParams.get("redirectTo") || "/dashboard";
    // Whitelist redirect to avoid open redirect vulnerabilities, though relative internal paths are generally safe
    const redirectTarget = useMemo(() => (rawRedirect.startsWith("/") ? rawRedirect : "/dashboard"), [rawRedirect]);

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const type = showPassword ? "text" : "password";
    const Icon = showPassword ? EyeOff : Eye;

    // Check if already authenticated
    useEffect(() => {
        const verifySession = async () => {
            setChecking(true);
            try {
                const res = await fetch("/api/admin", { method: "GET" });
                const data = await res.json().catch(() => ({}));
                // If authenticated, redirect
                if (res.ok && data?.authenticated) {
                    router.replace(redirectTarget);
                    return;
                }
            } catch (err) {
                console.error("login precheck error", err);
            } finally {
                setChecking(false);
            }
        };

        verifySession();
    }, [redirectTarget, router]);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/admin", {
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
            console.error("Login error", err);
            setError("Login failed");
        } finally {
            setLoading(false);
        }
    }

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#2C2638]">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                    Checking session...
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen relative overflow-hidden font-dmsans">
            <Image
                src={`/leadership-bg-new-2.jpg`}
                width={1920}
                height={1080}
                alt="Background Image"
                className="absolute top-0 left-0 w-full h-full object-cover brightness-50"
            />

            <form onSubmit={handleLogin}>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="p-3 my-auto rounded-xl bg-[#2C2638]/50 backdrop-blur-sm md:flex md:gap-2 drop-shadow-2xl drop-shadow-black/50 max-w-4xl w-full mx-4">
                        <div className="hidden md:flex items-center justify-center p-4">
                            <Image
                                src="/dummy_image4.png"
                                width={400}
                                height={500}
                                alt="Auth Image"
                                className="scale-95 object-contain"
                            />
                        </div>

                        <Card className="bg-transparent border-0 shadow-none flex-1 min-w-[300px]">
                            <CardHeader className="flex items-center">
                                <CardTitle className="text-3xl text-white">
                                    Welcome Back
                                </CardTitle>
                                {registered && (
                                    <div className="text-green-400 text-sm font-medium mt-2 bg-green-900/30 px-3 py-1 rounded-full">
                                        Account created! Please sign in.
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="flex-col space-y-7 items-center">
                                <Input
                                    type="text"
                                    className="bg-[#3C364C] text-white placeholder:text-gray-400 border-gray-600 focus:border-purple-500"
                                    placeholder="Username or email"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                />
                                <div className="relative flex gap-2 items-center">
                                    <Input
                                        type={type}
                                        className="bg-[#3C364C] text-white placeholder:text-gray-400 border-gray-600 focus:border-purple-500"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 text-white/70 hover:text-white hover:cursor-pointer z-10"
                                    >
                                        <Icon className="w-5 h-5" />
                                    </button>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full hover:cursor-pointer bg-[#6D54B5] hover:bg-[#5a4495] text-white py-6 text-lg"
                                    disabled={loading}
                                >
                                    {loading ? "Signing in..." : "Sign In"}
                                </Button>
                                {error && <div className="text-red-400 text-sm text-center font-medium bg-red-900/20 p-2 rounded">{error}</div>}
                            </CardContent>
                            <CardFooter className="flex-col space-y-3 justify-center items-center">
                                <div className="flex items-center justify-center gap-1 w-full opacity-50">
                                    <div className="bg-slate-500 h-[1px] w-full"></div>
                                    <p className="text-slate-300 text-sm text-nowrap font-medium px-1">
                                        Or
                                    </p>
                                    <div className="bg-slate-500 h-[1px] w-full"></div>
                                </div>
                                <div className="text-slate-300 text-sm">
                                    Don't have an account?{" "}
                                    <Link href="/sign-up" className="text-[#a58ce8] hover:text-[#bca6f2] font-semibold hover:underline">
                                        Sign Up
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-zinc-900">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Loading login...
                    </div>
                </div>
            }
        >
            <SignInInner />
        </Suspense>
    );
}
