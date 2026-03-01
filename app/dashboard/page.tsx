"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Plus, Bookmark } from "lucide-react";
// @ts-ignore
import DarkVeil from "@/components/DarkVeil";
import { createClient } from "@supabase/supabase-js";
import { ProfilePictureEditor } from "@/components/admin/pfp-cropper";

type User = {
    id: string;
    username: string | null;
    email: string | null;
    name: string | null;
    description: string | null;
    position?: string | null;
    profilePicture?: string | null;
};

type Doc = {
    id: string;
    slug: string;
    title: string;
    content: string;
    created_at: string;
};

type Blog = {
    id: string;
    slug: string;
    title: string;
    content: string | null;
    created_at: string;
};

type BookmarkedBlog = {
    id: string;
    slug: string;
    title: string;
    content: string | null;
    created_at: string;
    authorName: string | null;
    views: number | null;
    likes: number | null;
};


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-black text-white px-6 md:px-12 pb-12 pt-20 md:pt-32 font-dmsans overflow-x-hidden relative">

            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl p-8 flex flex-col items-center animate-pulse">
                        <div className="w-32 h-32 rounded-full bg-white/10 mb-6" />
                        <div className="h-8 w-3/4 bg-white/10 rounded-full mb-2" />
                        <div className="h-4 w-1/2 bg-white/5 rounded-full mb-6" />
                        <div className="w-full h-[1px] bg-white/5 mb-6" />
                        <div className="space-y-3 w-full">
                            <div className="h-3 w-full bg-white/5 rounded-full" />
                            <div className="h-3 w-5/6 bg-white/5 rounded-full" />
                            <div className="h-3 w-4/6 bg-white/5 rounded-full" />
                        </div>
                        <div className="mt-8 w-full h-10 bg-white/5 rounded-lg" />
                    </div>
                </div>


                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="h-8 w-40 bg-white/10 rounded-full" />
                    </div>

                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 animate-pulse"
                        >
                            <div className="w-full md:w-48 h-48 md:h-auto shrink-0 rounded-2xl bg-white/5" />
                            <div className="flex-1 flex flex-col justify-center space-y-4">
                                <div className="h-6 w-24 bg-white/5 rounded-full" />
                                <div className="h-8 w-3/4 bg-white/10 rounded-full" />
                                <div className="space-y-2">
                                    <div className="h-4 w-full bg-white/5 rounded-full" />
                                    <div className="h-4 w-5/6 bg-white/5 rounded-full" />
                                </div>
                                <div className="h-4 w-24 bg-white/5 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [docs, setDocs] = useState<Doc[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [bookmarkedBlogs, setBookmarkedBlogs] = useState<BookmarkedBlog[]>([]);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [editForm, setEditForm] = useState({ description: "", password: "" });
    const [uploading, setUploading] = useState(false);
    const [croppingImage, setCroppingImage] = useState<string | null>(null);

    async function handleUpload(file: File) {
        if (!user || !user.id) return;
        try {
            setUploading(true);

            const formData = new FormData();
            formData.append("avatar", file);

            if (isAdmin) {
                formData.append("targetUserId", user.id);
                const res = await fetch("/api/admin", {
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error || "Failed to update admin avatar");
                }
                const data = await res.json();
                setUser((prev) => (prev ? { ...prev, profilePicture: data.avatar_url } : prev));
            } else {
                const res = await fetch("/api/public-auth", {
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) throw new Error("Failed to update public avatar");
                const data = await res.json();
                setUser(prev => prev ? { ...prev, profilePicture: data.avatar_url } : prev);
            }
        } catch (err) {
            console.error("Upload error", err);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    }

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        setUpdating(true);
        try {
            const body: any = {
                action: isAdmin ? "update_self" : "update_profile",
                description: editForm.description,
                bio: editForm.description, // For public-auth
                password: editForm.password || undefined
            };

            const apiUrl = isAdmin ? "/api/admin" : "/api/public-auth";

            const res = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json().catch(() => ({}));

            if (res.ok && data.user) {
                const updatedUser = isAdmin ? data.user : {
                    id: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    name: data.user.name,
                    description: data.user.bio,
                    profilePicture: data.user.avatar_url,
                };
                setUser((prev) => ({ ...updatedUser, profilePicture: prev?.profilePicture || updatedUser.profilePicture || null }));
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
                // Primary Auth Check via public-auth (now handles employee recognition)
                const publicRes = await fetch("/api/public-auth", { method: "GET" });
                const publicData = await publicRes.json().catch(() => ({}));

                if (publicRes.ok && publicData.authenticated && publicData.user) {
                    const pu = publicData.user;
                    setIsAdmin(pu.is_employee || false);
                    setUser({
                        id: pu.id,
                        username: pu.username,
                        email: pu.email,
                        name: pu.name,
                        description: pu.bio,
                        profilePicture: pu.avatar_url,
                        position: pu.position,
                    });

                    // If employee, fetch articles
                    if (pu.is_employee) {
                        const docsRes = await fetch("/api/admin", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "list_docs", forceOwn: true }),
                        });
                        const docsData = await docsRes.json().catch(() => ({}));
                        if (docsRes.ok && docsData.docs) {
                            setDocs(docsData.docs);
                        }
                    }
                } else {
                    router.replace("/sign-in");
                    return;
                }

                // Fetch Blogs (always for own content)
                const blogsRes = await fetch("/api/blogs?mine=true");
                const blogsData = await blogsRes.json().catch(() => ({}));
                if (blogsRes.ok && blogsData.blogs) {
                    setBlogs(blogsData.blogs);
                }

                // Fetch bookmarked blogs from localStorage
                try {
                    const userId = publicData.user?.id;
                    const bookmarkedIds: string[] = [];
                    const uuidRe = /^blog_liked_([0-9a-f-]{36})(?:_([0-9a-f-]{36}))?$/;
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (!key || localStorage.getItem(key) !== "true") continue;
                        const m = key.match(uuidRe);
                        if (!m) continue;
                        const blogId = m[1];
                        const keyUserId = m[2]; // may be undefined
                        // If the key includes a userId, only accept if it matches the current user
                        if (keyUserId && keyUserId !== userId) continue;
                        bookmarkedIds.push(blogId);
                    }
                    if (bookmarkedIds.length > 0) {
                        const bmRes = await fetch(`/api/blogs?ids=${bookmarkedIds.join(",")}`);
                        const bmData = await bmRes.json().catch(() => ({}));
                        if (bmRes.ok && bmData.blogs) {
                            setBookmarkedBlogs(bmData.blogs);
                        }
                    }
                } catch (e) {
                    console.error("Failed to load bookmarked blogs", e);
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
            // Try logging out from both just in case, or detect which one
            await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "logout" }),
            });
            await fetch("/api/public-auth", {
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
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen text-white px-6 md:px-12 pb-12 pt-20 md:pt-32 font-dmsans overflow-x-hidden">
            <div className="fixed inset-0 pointer-events-none -z-10 bg-black">
                <DarkVeil
                    hueShift={0}
                    noiseIntensity={0.16}
                    scanlineIntensity={0}
                    speed={0.5}
                    scanlineFrequency={0}
                    warpAmount={0}
                    resolutionScale={1}
                />
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="sticky top-12">
                        <div className="relative overflow-hidden isolation-isolate liquid-glass !shadow-none backdrop-blur-[30px] rounded-[40px] p-8 flex flex-col items-center text-center group hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-shadow duration-500">
                            {/* Card Glass Internal Layers */}
                            <div className="liquidGlass-effect pointer-events-none"></div>
                            <div className="cardGlass-tint pointer-events-none"></div>
                            <div className="glass-noise"></div>
                            <div className="cardGlass-borders pointer-events-none"></div>
                            <div className="cardGlass-shine pointer-events-none"></div>

                            {/* Admin/Employee Sheen */}
                            {isAdmin && (
                                <div className="absolute inset-0 z-20 border border-purple-500/30 rounded-[40px] pointer-events-none shadow-[0_0_50px_rgba(168,85,247,0.15)]" />
                            )}

                            {/* Card Content */}
                            <div className="relative z-10 w-full flex flex-col items-center">
                                {/* Subtle violet hue internal glow */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-700" />

                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative w-32 h-32 mb-6 group-hover:scale-105 transition-transform duration-500">
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
                                        <div className="w-full h-full rounded-full bg-purple-900/30 border border-purple-500/20 flex items-center justify-center text-3xl font-bold text-purple-300/80">
                                            {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "?"}
                                        </div>
                                    )}
                                    {isEditing && (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                            <label htmlFor="pfp-upload" className="text-xs font-medium text-white cursor-pointer p-2">
                                                Change
                                                <input
                                                    id="pfp-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const f = e.target.files?.[0];
                                                        if (f) {
                                                            const reader = new FileReader();
                                                            reader.onload = (ev) => {
                                                                setCroppingImage(ev.target?.result as string);
                                                            };
                                                            reader.readAsDataURL(f);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 rounded-full">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-2xl font-bold mb-1">{user?.name || user?.username}</h2>
                                <p className="text-gray-400 text-sm mb-1">{user?.email}</p>
                                {isAdmin && user?.position ? (
                                    <p className="text-purple-400/80 text-xs font-medium uppercase mb-6">
                                        {user.position}
                                    </p>
                                ) : (
                                    <div className="mb-6" />
                                )}

                                <div className="w-full h-[1px] bg-white/5 mb-6" />

                                {!isEditing ? (
                                    <>
                                        <p className="text-gray-300 text-sm leading-[120%] mb-8 whitespace-pre-wrap ">
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
                                            <label className="text-xs text-gray-500 uppercase mb-1 block">Description</label>
                                            <textarea
                                                className="w-full bg-[#111] border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-purple-500 min-h-[100px]"
                                                value={editForm.description}
                                                onChange={(e) => setEditForm(s => ({ ...s, description: e.target.value }))}
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase mb-1 block">New Password (Optional)</label>
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

                                {isAdmin && !isEditing && (
                                    <Link
                                        href="/admin"
                                        className="w-full bg-white/5 hover:bg-white/10 text-white text-sm font-medium py-3 rounded-xl mb-4 transition-all duration-300 flex items-center justify-center gap-2 border border-white/10 hover:border-purple-500/50 group/admin"
                                    >
                                        Admin Panel
                                        <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover/admin:text-purple-400 transition-colors" />
                                    </Link>
                                )}

                                {!isEditing && (
                                    <button
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium flex items-center gap-2 mt-2"
                                    >
                                        {loggingOut ? "Signing out..." : "Sign Out"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    {(isAdmin || docs.length > 0) && (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-semibold text-gray-200">Your Articles</h3>
                            </div>

                            {docs.length === 0 ? (
                                <div className="relative overflow-hidden isolation-isolate liquid-glass !shadow-none backdrop-blur-[30px] rounded-[40px] p-12 text-center group">
                                    {/* Card Glass Internal Layers */}
                                    <div className="liquidGlass-effect pointer-events-none"></div>
                                    <div className="cardGlass-tint pointer-events-none"></div>
                                    <div className="glass-noise"></div>
                                    <div className="cardGlass-borders pointer-events-none"></div>
                                    <div className="cardGlass-shine pointer-events-none"></div>

                                    <p className="relative z-10 text-gray-400 font-medium font-dmsans">You haven't written any articles yet.</p>
                                </div>
                            ) : (
                                docs.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="group relative overflow-hidden isolation-isolate liquid-glass !shadow-none backdrop-blur-[30px] rounded-[40px] p-6 sm:p-8 flex flex-col md:flex-row gap-8 hover:bg-white/5 transition-all duration-300"
                                    >
                                        {/* Card Glass Internal Layers */}
                                        <div className="liquidGlass-effect pointer-events-none"></div>
                                        <div className="cardGlass-tint pointer-events-none"></div>
                                        <div className="glass-noise"></div>
                                        <div className="cardGlass-borders pointer-events-none"></div>
                                        <div className="cardGlass-shine pointer-events-none"></div>

                                        <div className="relative z-10 w-full flex flex-col md:flex-row gap-8">
                                            <div className="w-full md:w-48 h-48 md:h-auto shrink-0 relative rounded-2xl overflow-hidden bg-[#1A1A1A]">
                                                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-indigo-900/40" />
                                                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-500/20 blur-2xl rounded-full" />
                                                <div className="absolute top-4 left-4 w-full h-full opacity-50">

                                                </div>
                                            </div>


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
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    )}

                    <div className="flex items-center justify-between mb-2 pt-8">
                        <h3 className="text-xl font-semibold text-gray-200">Your Blogs</h3>
                        <Link
                            href="/blogs/dashboard"
                            className="bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-2 px-4 rounded-xl transition-all duration-300 flex items-center gap-2 border border-white/10 hover:border-purple-500/50"
                        >
                            <Plus className="w-4 h-4" />
                            Add Blog
                        </Link>
                    </div>

                    {blogs.length === 0 ? (
                        <div className="relative overflow-hidden isolation-isolate liquid-glass !shadow-none backdrop-blur-[30px] rounded-[40px] p-12 text-center group">
                            <div className="liquidGlass-effect pointer-events-none"></div>
                            <div className="cardGlass-tint pointer-events-none"></div>
                            <div className="glass-noise"></div>
                            <div className="cardGlass-borders pointer-events-none"></div>
                            <div className="cardGlass-shine pointer-events-none"></div>
                            <p className="relative z-10 text-gray-400 font-medium font-dmsans">You haven't written any blogs yet.</p>
                        </div>
                    ) : (
                        blogs.map((blog) => (
                            <div
                                key={blog.id}
                                className="group relative overflow-hidden isolation-isolate liquid-glass !shadow-none backdrop-blur-[30px] rounded-[40px] p-6 sm:p-8 flex flex-col md:flex-row gap-8 hover:bg-white/5 transition-all duration-300"
                            >
                                <div className="liquidGlass-effect pointer-events-none"></div>
                                <div className="cardGlass-tint pointer-events-none"></div>
                                <div className="glass-noise"></div>
                                <div className="cardGlass-borders pointer-events-none"></div>
                                <div className="cardGlass-shine pointer-events-none"></div>

                                <div className="relative z-10 w-full flex flex-col md:flex-row gap-8">
                                    <div className="w-full md:w-48 h-48 md:h-auto shrink-0 relative rounded-2xl overflow-hidden bg-[#1A1A1A]">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-cyan-900/40" />
                                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full" />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-gray-300">
                                                Blog Post
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-300 transition-colors">
                                            {blog.title}
                                        </h3>

                                        <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                                            {blog.content?.replace(/```[\s\S]*?```/g, "").replace(/\s+/g, " ").trim().substring(0, 150) || "No content preview available."}...
                                        </p>

                                        <Link
                                            href={`/blogs/${blog.slug}`}
                                            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium group/link"
                                        >
                                            View Blog
                                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Your Activity / Bookmarked Blogs */}
                    <div className="flex items-center justify-between mb-2 pt-8">
                        <h3 className="text-xl font-semibold text-gray-200">Your Activity</h3>
                    </div>

                    {bookmarkedBlogs.length === 0 ? (
                        <div className="relative overflow-hidden isolation-isolate liquid-glass !shadow-none backdrop-blur-[30px] rounded-[40px] p-12 text-center group">
                            <div className="liquidGlass-effect pointer-events-none"></div>
                            <div className="cardGlass-tint pointer-events-none"></div>
                            <div className="glass-noise"></div>
                            <div className="cardGlass-borders pointer-events-none"></div>
                            <div className="cardGlass-shine pointer-events-none"></div>
                            <p className="relative z-10 text-gray-400 font-medium font-dmsans">You haven't bookmarked any blogs yet.</p>
                        </div>
                    ) : (
                        bookmarkedBlogs.map((blog) => (
                            <div
                                key={blog.id}
                                className="group relative overflow-hidden isolation-isolate liquid-glass !shadow-none backdrop-blur-[30px] rounded-[40px] p-6 sm:p-8 flex flex-col md:flex-row gap-8 hover:bg-white/5 transition-all duration-300"
                            >
                                <div className="liquidGlass-effect pointer-events-none"></div>
                                <div className="cardGlass-tint pointer-events-none"></div>
                                <div className="glass-noise"></div>
                                <div className="cardGlass-borders pointer-events-none"></div>
                                <div className="cardGlass-shine pointer-events-none"></div>

                                <div className="relative z-10 w-full flex flex-col md:flex-row gap-8">
                                    <div className="w-full md:w-48 h-48 md:h-auto shrink-0 relative rounded-2xl overflow-hidden bg-[#1A1A1A]">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-violet-900/40" />
                                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full" />
                                        <div className="absolute top-4 left-4">
                                            <Bookmark className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300">
                                                Bookmarked
                                            </span>
                                            {blog.authorName && (
                                                <span className="text-xs text-gray-500">by {blog.authorName}</span>
                                            )}
                                        </div>

                                        <h3 className="text-2xl font-bold mb-3 group-hover:text-indigo-300 transition-colors">
                                            {blog.title}
                                        </h3>

                                        <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                                            {blog.content?.replace(/```[\s\S]*?```/g, "").replace(/\s+/g, " ").trim().substring(0, 150) || "No content preview available."}...
                                        </p>

                                        <Link
                                            href={`/blogs/${blog.slug}`}
                                            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium group/link"
                                        >
                                            View Blog
                                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <AnimatePresence>
                {croppingImage && (
                    <ProfilePictureEditor
                        imageSrc={croppingImage}
                        onCrop={(file) => {
                            handleUpload(file);
                            setCroppingImage(null);
                        }}
                        onCancel={() => setCroppingImage(null)}
                    />
                )}
            </AnimatePresence>
        </div >
    );
}
