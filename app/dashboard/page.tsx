"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type User = {
    id: string;
    username: string | null;
    email: string | null;
    name: string | null;
    description: string | null;
    profilePicture?: string | null;
};

type Doc = {
    id: string;
    slug: string;
    title: string;
    content: string;
    created_at: string;
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [docs, setDocs] = useState<Doc[]>([]);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [editForm, setEditForm] = useState({ description: "", password: "" });

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        setUpdating(true);
        try {
            const body: any = {
                action: "update_self",
                description: editForm.description
            };
            if (editForm.password) {
                body.password = editForm.password;
            }

            const res = await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json().catch(() => ({}));

            if (res.ok && data.user) {
                setUser(data.user);
                setIsEditing(false);
                setEditForm({ description: "", password: "" });
            } else {
                alert(data.error || "Update failed");
            }
        } catch (err) {
            console.error("Update error", err);
            alert("Update failed");
        } finally {
            setUpdating(false);
        }
    }

    useEffect(() => {
        const init = async () => {
            try {
                // 1. Check Session
                const authRes = await fetch("/api/admin", { method: "GET" });
                const authData = await authRes.json().catch(() => ({}));

                if (!authRes.ok || !authData.authenticated || !authData.user) {
                    router.replace("/sign-in");
                    return;
                }

                setUser(authData.user);

                // 2. Fetch Profile Picture
                const picRes = await fetch("/api/admin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "get_profile_picture" }),
                });
                const picData = await picRes.json().catch(() => ({}));
                if (picRes.ok && picData.url) {
                    setUser((prev) => (prev ? { ...prev, profilePicture: picData.url } : prev));
                }

                // 3. Fetch Articles
                const docsRes = await fetch("/api/admin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "list_docs", forceOwn: true }),
                });
                const docsData = await docsRes.json().catch(() => ({}));
                if (docsRes.ok && docsData.docs) {
                    setDocs(docsData.docs);
                }

            } catch (err) {
                console.error("Dashboard init error", err);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [router]);

    async function handleLogout() {
        setLoggingOut(true);
        try {
            await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "logout" }),
            });
            router.replace("/sign-in");
        } catch (err) {
            console.error("Logout error", err);
            setLoggingOut(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-pulse text-purple-400">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Profile Card */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="sticky top-12">
                        <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
                            {/* Card Glow Effect */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative w-32 h-32 mb-6">
                                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                                {user?.profilePicture ? (
                                    <Image
                                        src={user.profilePicture}
                                        alt={user.name || "User"}
                                        fill
                                        className="rounded-full object-cover p-1"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-3xl font-bold">
                                        {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "?"}
                                    </div>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold mb-1">{user?.name || user?.username}</h2>
                            <p className="text-gray-400 text-sm mb-6">{user?.email}</p>

                            <div className="w-full h-[1px] bg-white/5 mb-6" />

                            {!isEditing ? (
                                <>
                                    <p className="text-gray-300 text-sm leading-relaxed mb-8 whitespace-pre-wrap">
                                        {user?.description || "No bio description yet."}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setEditForm({
                                                description: user?.description || "",
                                                password: ""
                                            });
                                            setIsEditing(true);
                                        }}
                                        className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-sm font-medium py-2 px-4 rounded-lg mb-4 transition-colors w-full"
                                    >
                                        Edit Profile
                                    </button>
                                </>
                            ) : (
                                <form onSubmit={handleUpdateProfile} className="w-full space-y-4 mb-6 text-left">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
                                        <textarea
                                            className="w-full bg-[#111] border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-purple-500 min-h-[100px]"
                                            value={editForm.description}
                                            onChange={(e) => setEditForm(s => ({ ...s, description: e.target.value }))}
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">New Password (Optional)</label>
                                        <input
                                            type="password"
                                            className="w-full bg-[#111] border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                            value={editForm.password}
                                            onChange={(e) => setEditForm(s => ({ ...s, password: e.target.value }))}
                                            placeholder="Leave blank to keep current"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={updating}
                                            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {updating ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium py-2 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {!isEditing && (
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium flex items-center gap-2"
                                >
                                    {loggingOut ? "Signing out..." : "Sign Out"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Articles List */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-200">Your Articles</h3>
                        {/* Could add a 'New Article' button here if needed */}
                    </div>

                    {docs.length === 0 ? (
                        <div className="p-12 rounded-3xl bg-[#111] border border-white/5 text-center">
                            <p className="text-gray-500">You haven't written any articles yet.</p>
                        </div>
                    ) : (
                        docs.map((doc) => (
                            <div
                                key={doc.id}
                                className="group relative bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 hover:bg-[#111] transition-all duration-300 overflow-hidden"
                            >
                                {/* Article Image Placeholder */}
                                <div className="w-full md:w-48 h-48 md:h-auto shrink-0 relative rounded-2xl overflow-hidden bg-[#1A1A1A]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-indigo-900/40" />
                                    {/* Abstract shapes mimicking the user provided image style */}
                                    <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-500/20 blur-2xl rounded-full" />
                                    <div className="absolute top-4 left-4 w-full h-full opacity-50">
                                        {/* Could put a generic icon or pattern here */}
                                    </div>
                                </div>

                                {/* Article Content */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-gray-300">
                                            Information
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-300 transition-colors">
                                        {doc.title}
                                    </h3>

                                    <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                                        {doc.content?.substring(0, 150) || "No content preview available."}...
                                    </p>

                                    <Link
                                        href={`/article/${doc.slug}`}
                                        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium group/link"
                                    >
                                        View Article
                                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                                    </Link>
                                </div>

                                {/* Hover Glow */}
                                <div className="absolute inset-0 border border-white/0 group-hover:border-purple-500/20 rounded-3xl pointer-events-none transition-colors duration-500" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
