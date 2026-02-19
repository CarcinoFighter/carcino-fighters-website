"use client";

import { Suspense, useMemo, useState } from "react";
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
    const rawRedirect = searchParams.get("redirectTo") || "/survivorstories/dashboard";
    const redirectTarget = useMemo(
        () => (rawRedirect.startsWith("/") ? rawRedirect : "/survivorstories/dashboard"),
        [rawRedirect]
    );

    const [username, setUsername] = useState("");
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
                body: JSON.stringify({ action: "login", username, password }),
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
        <form onSubmit={handleLogin}>
            <div className="min-h-screen flex items-center justify-center bg-[#686279]">
                <div className="p-3 mt-7 rounded-xl h-3/4 bg-[#2C2638] md:flex md:gap-2 drop-shadow-2xl drop-shadow-black/50">
                    <Image
                        src="/dummy_image4.png"
                        width={400}
                        height={500}
                        alt="Auth Image"
                        className="md:block hidden"
                    />
                    <Card className="bg-[#2C2638] border-0 shadow-none">
                        <CardHeader className="flex items-center">
                            <CardTitle className="text-3xl">Sign in to your account</CardTitle>
                            {registered && (
                                <div className="text-green-400 text-sm font-medium mt-2 bg-green-900/30 px-3 py-1 rounded-full">
                                    Account created! Please sign in.
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="flex-col space-y-7 items-center">
                            <Input
                                type="text"
                                className="bg-[#3C364C]"
                                value={username}
                                placeholder="Username"
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <div className="relative flex gap-2 items-center">
                                <Input
                                    type={type}
                                    className="bg-[#3C364C]"
                                    value={password}
                                    placeholder="Enter your password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 text-white/70 hover:text-white hover:cursor-pointer z-10"
                                >
                                    <Icon />
                                </button>
                            </div>
                            <Button
                                type="submit"
                                className="w-full hover:cursor-pointer bg-[#6D54B5]"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </Button>
                            {error && (
                                <div className="text-red-400 text-sm text-center font-medium bg-red-900/20 p-2 rounded">
                                    {error}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex-col space-y-3 justify-center items-center">
                            <div className="flex items-center justify-center gap-1 w-full">
                                <div className="bg-slate-700 h-[1px] w-full"></div>
                                <p className="text-slate-500 text-sm text-nowrap font-medium px-1">
                                    New here?
                                </p>
                                <div className="bg-slate-700 h-[1px] w-full"></div>
                            </div>
                            <Button type="button" variant="ghost" className="mt-2 flex items-center justify-center w-full border-[0.5px] px-5 hover:cursor-pointer border-white">
                                <Link href="/sign-up" className="w-full text-center">Create an account</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </form>
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
