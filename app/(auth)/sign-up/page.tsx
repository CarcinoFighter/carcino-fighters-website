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
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Lock, User as UserIcon, Mail, Phone, Calendar, FileText, Globe } from "lucide-react";

function AuthSkeleton() {
    return (
        <div className="h-screen w-screen relative overflow-hidden font-dmsans">
            <Image
                src="/leadership-bg-new-2.jpg"
                width={1920}
                height={1080}
                alt="Background Image"
                className="absolute top-0 left-0 w-full h-full object-cover brightness-50"
            />
            <div className="min-h-screen flex items-center justify-center relative z-10">
                <div className="p-3 my-auto rounded-xl bg-[#2C2638]/50 backdrop-blur-sm md:flex md:gap-2 drop-shadow-2xl drop-shadow-black/50 max-w-4xl w-full mx-4 animate-pulse">
                    <div className="hidden md:flex items-center justify-center p-4 w-1/2">
                        <div className="w-[400px] h-[500px] bg-white/5 rounded-xl" />
                    </div>

                    <div className="flex-1 p-8 space-y-6">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="h-10 w-48 bg-white/10 rounded-full" />
                        </div>
                        <div className="space-y-4">
                            <div className="h-12 w-full bg-white/5 rounded-lg" />
                            <div className="h-12 w-full bg-white/5 rounded-lg" />
                            <div className="h-12 w-full bg-white/5 rounded-lg" />
                            <div className="h-12 w-full bg-white/5 rounded-lg" />
                            <div className="h-14 w-full bg-white/10 rounded-lg mt-6" />
                        </div>
                        <div className="flex flex-col items-center space-y-4 pt-4">
                            <div className="h-4 w-40 bg-white/5 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SignUpInner() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        number: "",
        dob: "",
        bio: "",
        private_account: false,
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
                    number: formData.number,
                    dob: formData.dob,
                    bio: formData.bio,
                    private_account: formData.private_account,
                }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data?.error || "Registration failed");
                return;
            }

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
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="p-3 my-auto rounded-xl bg-[#2C2638]/50 backdrop-blur-sm md:flex md:gap-2 drop-shadow-2xl drop-shadow-black/50 max-w-4xl w-full mx-4 overflow-y-auto max-h-[90vh] hide-scrollbar">
                        <div className="hidden md:flex items-center justify-center p-4 sticky top-0 h-fit">
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
                            <CardContent className="flex-col space-y-4 items-center">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <Input
                                        type="tel"
                                        className="bg-[#3C364C] text-white placeholder:text-gray-400 border-gray-600 focus:border-purple-500"
                                        placeholder="Phone Number"
                                        value={formData.number}
                                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                    />
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-xs text-gray-400 pl-1">Date of Birth</span>
                                        <Input
                                            type="date"
                                            className="bg-[#3C364C] text-white placeholder:text-gray-400 border-gray-600 focus:border-purple-500 block w-full"
                                            value={formData.dob}
                                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative flex gap-2 items-center">
                                        <Input
                                            type={type}
                                            className="bg-[#3C364C] text-white placeholder:text-gray-400 border-gray-600 focus:border-purple-500 w-full"
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
                                </div>

                                <Textarea
                                    className="bg-[#3C364C] text-white placeholder:text-gray-400 border-gray-600 focus:border-purple-500 min-h-[100px]"
                                    placeholder="Description"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />

                                <div className="flex items-center space-x-2 bg-[#3C364C]/30 p-3 rounded-lg border border-gray-600/50">
                                    <input
                                        type="checkbox"
                                        id="private_account"
                                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 bg-[#3C364C]"
                                        checked={formData.private_account}
                                        onChange={(e) => setFormData({ ...formData, private_account: e.target.checked })}
                                    />
                                    <label
                                        htmlFor="private_account"
                                        className="text-sm font-medium leading-none text-gray-200 cursor-pointer select-none"
                                    >
                                        Private Account
                                    </label>
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
        <Suspense fallback={<AuthSkeleton />}>
            <SignUpInner />
        </Suspense>
    );
}
