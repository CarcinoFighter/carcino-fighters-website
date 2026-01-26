"use client";

import { Suspense, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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

function SignUpInner() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const type = showPassword ? "text" : "password";
    const Icon = showPassword ? EyeOff : Eye;

    async function handleSignUp(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "register",
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data?.error || "Registration failed");
                return;
            }

            // Success
            router.push("/sign-in?registered=true");
        } catch (err) {
            console.error("Sign up error", err);
            setError("Registration failed");
        } finally {
            setLoading(false);
        }
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

            <form onSubmit={handleSignUp}>
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
                                    Create an account
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-col space-y-5 items-center">
                                <Input
                                    type="text"
                                    className="bg-[#3C364C] text-white placeholder:text-gray-400 border-gray-600 focus:border-purple-500"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <Input
                                    type="text"
                                    className="bg-[#3C364C] text-white placeholder:text-gray-400 border-gray-600 focus:border-purple-500"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                                <Input
                                    type="email"
                                    className="bg-[#3C364C] text-white placeholder:text-gray-400 border-gray-600 focus:border-purple-500"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                                <div className="relative flex gap-2 items-center">
                                    <Input
                                        type={type}
                                        className="bg-[#3C364C] text-white placeholder:text-gray-400 border-gray-600 focus:border-purple-500"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                                    {loading ? "Creating account..." : "Sign Up"}
                                </Button>
                                {error && <div className="text-red-400 text-sm text-center font-medium bg-red-900/20 p-2 rounded">{error}</div>}
                            </CardContent>
                            <CardFooter className="flex-col space-y-3 justify-center items-center">
                                <div className="text-slate-300 text-sm">
                                    Already have an account?{" "}
                                    <Link href="/sign-in" className="text-[#a58ce8] hover:text-[#bca6f2] font-semibold hover:underline">
                                        Sign In
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

export default function SignUpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <SignUpInner />
        </Suspense>
    );
}
