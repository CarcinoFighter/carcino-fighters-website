"use client";

import { useState } from "react";
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

            router.push("/sign-in?registered=true");
        } catch (err) {
            console.error("public sign-up error", err);
            setError("Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSignUp}>
            <div className="min-h-screen flex items-center justify-center bg-[#686279]">
                <div className="p-3 mt-7 rounded-xl h-3/4 bg-[#2C2638] md:flex md:gap-2 drop-shadow-2xl drop-shadow-black/50">
                    <Image
                        src="/dummy_image3.png"
                        width={400}
                        height={500}
                        alt="Auth Image"
                        priority
                        className="md:block hidden"
                    />
                    <Card className="bg-[#2C2638] border-0 shadow-none">
                        <CardHeader className="flex items-center">
                            <CardTitle className="text-3xl">Create an account</CardTitle>
                            <div className="-mb-3 text-sm text-white/70 flex items-center gap-1">
                                <span>Already have an account?</span>
                                <Button type="button" variant="link">
                                    <Link href="/sign-in">Log in</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-col space-y-7 items-center">
                            <div className="md:flex md:space-x-3 space-y-3">
                                <Input
                                    className="bg-[#3C364C]"
                                    value={formData.name}
                                    placeholder="Full Name"
                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                                <Input
                                    className="bg-[#3C364C]"
                                    value={formData.username}
                                    placeholder="Username"
                                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                                    required
                                />
                            </div>
                            <Input
                                className="bg-[#3C364C]"
                                type="email"
                                value={formData.email}
                                placeholder="Email"
                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                required
                            />
                            <div className="relative flex gap-2 items-center">
                                <Input
                                    type={type}
                                    className="bg-[#3C364C]"
                                    value={formData.password}
                                    placeholder="Enter your password"
                                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
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
                            <Textarea
                                className="bg-[#3C364C]"
                                placeholder="Short bio (optional)"
                                value={formData.bio}
                                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                            />
                            <Button
                                type="submit"
                                className="w-full hover:cursor-pointer bg-[#6D54B5]"
                                disabled={loading}
                            >
                                {loading ? "Creating account..." : "Create account"}
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
                                    Or register with
                                </p>
                                <div className="bg-slate-700 h-[1px] w-full"></div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                className="mt-2 flex text-md items-center justify-center w-full border  border-white px-5 hover:cursor-pointer"
                                disabled
                            >
                                Coming soon
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </form>
    );
}
