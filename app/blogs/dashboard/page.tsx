"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

type PublicUser = {
  id: string;
  username: string | null;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

type BlogEntry = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  tags: string[] | null;
  created_at: string;
};

export default function BlogsDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<BlogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [postSaving, setPostSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    username: "",
    bio: "",
    password: "",
  });

  const [postForm, setPostForm] = useState({
    title: "",
    slug: "",
    content: "",
    tags: "",
  });

  function contentExcerpt(text?: string | null, len = 120) {
    if (!text) return "No content yet";
    const stripped = text.replace(/```[\s\S]*?```/g, "").replace(/\s+/g, " ").trim();
    if (!stripped) return "No content yet";
    return stripped.length > len ? `${stripped.slice(0, len)}…` : stripped;
  }

  useEffect(() => {
    setMounted(true);
    const updateColorMode = () => {
      if (typeof document === "undefined") return;
      setColorMode(document.documentElement.classList.contains("dark") ? "dark" : "light");
    };
    updateColorMode();
    const observer = new MutationObserver(updateColorMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const sortedPosts = useMemo(
    () => posts.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [posts]
  );

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/public-auth", { method: "GET" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.authenticated) {
          router.replace("/sign-in");
          return;
        }

        setUser(data.user);
        setProfileForm({
          name: data.user?.name ?? "",
          username: data.user?.username ?? "",
          bio: data.user?.bio ?? "",
          password: "",
        });
        await fetchPosts();
      } catch (err) {
        console.error("dashboard init error", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [router]);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/blogs?mine=true");
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPosts(data.blogs ?? []);
      } else {
        setError(data?.error || "Failed to load posts");
      }
    } catch (err) {
      console.error("fetchPosts error", err);
      setError("Failed to load posts");
    }
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        action: "update_profile",
        name: profileForm.name,
        username: profileForm.username,
        bio: profileForm.bio,
      };
      if (profileForm.password) body.password = profileForm.password;

      const res = await fetch("/api/public-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Update failed");
        return;
      }
      setUser(data.user);
      setProfileForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      console.error("profile update error", err);
      setError("Update failed");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("action", "upload_avatar");
      formData.append("avatar", file);

      const res = await fetch("/api/public-auth", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Upload failed");
        return;
      }
      setUser((prev) => (prev ? { ...prev, avatar_url: data.avatar_url } : prev));
    } catch (err) {
      console.error("avatar upload error", err);
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handlePostSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPostSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        action: editingId ? "update" : "create",
        id: editingId ?? undefined,
        title: postForm.title,
        slug: postForm.slug || undefined,
        content: postForm.content,
        tags: postForm.tags,
      };

      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Save failed");
        return;
      }

      setPostForm({ title: "", slug: "", content: "", tags: "" });
      setEditingId(null);
      await fetchPosts();
    } catch (err) {
      console.error("post save error", err);
      setError("Save failed");
    } finally {
      setPostSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Delete failed");
        return;
      }
      await fetchPosts();
    } catch (err) {
      console.error("delete post error", err);
      setError("Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        <div className="flex items-center gap-3 text-sm text-white/80">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2A292F] text-white pb-14 font-dmsans overflow-x-hidden relative">
      {/* Background Gradients (Consistent with article page) */}
      <div
        style={{
          position: "absolute",
          left: -800,
          top: -700,
          width: 1600,
          height: 1600,
          borderRadius: "50%",
          background: `radial-gradient(circle, #D5B0FF26 0%, transparent 60%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="max-md:hidden"
        style={{
          position: "absolute",
          right: -900,
          top: -300,
          width: 1800,
          height: 1800,
          borderRadius: "50%",
          background: `radial-gradient(circle, #D5B0FF26 0%, transparent 50%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -600,
          bottom: -1200,
          width: 1800,
          height: 1800,
          borderRadius: "50%",
          background: `radial-gradient(circle, #471F7733 0%, transparent 60%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Hero Section */}
      <div className="flex bg-transparent flex-col mb-10 items-center justify-center w-full relative h-[40vh] min-h-[300px]">
        <div className="flex z-10 flex-col w-full items-center gap-7 px-6 text-center text-white">
          <h1 className="text-4xl lg:text-7xl font-wintersolace font-bold text-white mt-32 leading-[109%]">
            Add Your Blog
          </h1>
          <p className="font-dmsans text-white/70 text-xl md:text-2xl max-w-2xl font-light leading-relaxed">
            Help us out in this mission with a word from you. It makes a huge difference.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-12 relative z-10">
        {error && (
          <div className="rounded-2xl border border-red-400/30 bg-red-900/20 px-6 py-4 text-sm text-red-200 backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Unified Editor Card with CardGlass Effect */}
        <div className="relative overflow-hidden isolation-isolate liquid-glass !shadow-none backdrop-blur-[30px] rounded-[40px] p-1 group">
          {/* Card Glass Layers */}
          <div className="liquidGlass-effect pointer-events-none" />
          <div className="cardGlass-tint pointer-events-none" />
          <div className="glass-noise" />
          <div className="cardGlass-borders pointer-events-none" />
          <div className="cardGlass-shine pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-10">
            <h2 className="text-2xl font-bold mb-8 font-dmsans bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              {editingId ? "Edit Post" : "Write a New Post"}
            </h2>

            <form className="space-y-6" onSubmit={handlePostSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Title</label>
                  <Input
                    value={postForm.title}
                    onChange={(e) => setPostForm((p) => ({ ...p, title: e.target.value }))}
                    className="bg-white/5 border-white/10 focus:border-purple-500/50 rounded-2xl h-12"
                    placeholder="Enter an engaging title..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Custom Slug (Optional)</label>
                  <Input
                    value={postForm.slug}
                    onChange={(e) => setPostForm((p) => ({ ...p, slug: e.target.value }))}
                    className="bg-white/5 border-white/10 focus:border-purple-500/50 rounded-2xl h-12"
                    placeholder="blog-post-url"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Content & Preview</label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
                  {/* Editor Side */}
                  <div className="rounded-[30px] border border-white/10 bg-transparent p-3 overflow-hidden" data-color-mode={colorMode}>
                    {mounted ? (
                      <MDEditor
                        value={postForm.content}
                        onChange={(v) => setPostForm((p) => ({ ...p, content: v ?? "" }))}
                        height={500}
                        preview="edit"
                        hideToolbar={false}
                        visibleDragbar={false}
                        textareaProps={{
                          placeholder: "Begin your story here...",
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center p-20 text-sm text-white/40">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white mr-3" />
                        Initializing Editor...
                      </div>
                    )}
                  </div>

                  {/* Preview Side */}
                  <div className="rounded-[30px] border border-white/10 bg-transparent p-6 overflow-y-auto max-h-[526px] custom-scrollbar relative">
                    <div className="absolute top-4 right-6 text-[10px] uppercase tracking-widest text-white/20 font-bold z-20">Live Preview</div>
                    {mounted ? (
                      <MarkdownPreview
                        source={postForm.content || "*Nothing to preview yet...*"}
                        className="prose max-w-none dark:prose-invert bg-transparent"
                        data-color-mode={colorMode}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-white/20">
                        Loading Preview...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-end gap-6">
                <div className="flex-1 space-y-2 w-full">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Tags (comma separated)</label>
                  <Input
                    value={postForm.tags}
                    onChange={(e) => setPostForm((p) => ({ ...p, tags: e.target.value }))}
                    className="bg-white/5 border-white/10 focus:border-purple-500/50 rounded-2xl h-12"
                    placeholder="e.g. Health, Journey, Research"
                  />
                </div>
                <div className="flex gap-3 h-12">
                  {editingId && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-2xl px-6 hover:bg-white/5"
                      onClick={() => {
                        setEditingId(null);
                        setPostForm({ title: "", slug: "", content: "", tags: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <motion.div
                    whileHover={{ y: -2, scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex"
                  >
                    <Button
                      type="submit"
                      disabled={postSaving}
                      variant="ghost"
                      className="relative px-4 py-3 md:px-[22px] md:py-[22px] rounded-full overflow-hidden backdrop-blur-sm font-dmsans transition-all duration-300 font-normal hover:bg-transparent"
                    >
                      <span className="relative z-10 flex items-center gap-2 text-[#e0e0e0] text-[12px] sm:text-[18px] font-light">
                        {postSaving ? "Saving..." : editingId ? "Update Post" : "Publish Post"}
                      </span>

                      {/* Liquid glass layers */}
                      <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                      <div className="liquidGlass-shine relative w-[100.8%] h-[100%] !top-[0px] !left-[-1px]"></div>
                      <div className="absolute inset-0 liquidGlass-text pointer-events-none"></div>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Existing Posts Section */}
        <div className="space-y-6 pt-8">
          <h2 className="text-2xl font-bold font-dmsans text-white/90 px-4">Your Published Stories</h2>

          <div className="grid grid-cols-1 gap-6">
            {sortedPosts.length === 0 && (
              <div className="relative overflow-hidden isolation-isolate liquid-glass !shadow-none backdrop-blur-[30px] rounded-[40px] p-16 text-center">
                <div className="cardGlass-tint pointer-events-none" />
                <p className="relative z-10 text-white/40 font-medium">You haven't shared any stories yet. The world is waiting!</p>
              </div>
            )}
            {sortedPosts.map((post) => (
              <div
                key={post.id}
                className="group relative overflow-hidden isolation-isolate liquid-glass !shadow-none backdrop-blur-[20px] rounded-[40px] p-[1px] hover:bg-white/5 transition-all duration-500"
              >
                <div className="cardGlass-tint pointer-events-none" />
                <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">/{post.slug}</p>
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{post.title}</h3>
                    <p className="text-sm text-white/50 line-clamp-2 leading-relaxed">
                      {contentExcerpt(post.content, 180)}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      className="rounded-xl hover:bg-purple-500/10 hover:text-purple-300"
                      onClick={() => {
                        setEditingId(post.id);
                        setPostForm({
                          title: post.title,
                          slug: post.slug,
                          content: post.content ?? "",
                          tags: (post.tags || []).join(", "),
                        });
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="rounded-xl text-red-400 hover:bg-red-900/10 hover:text-red-300"
                      onClick={() => handleDelete(post.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
                      onClick={() => router.push(`/blogs/${post.slug}`)}
                    >
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx global>{`
        .w-md-editor {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .w-md-editor-toolbar {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 20px 20px 0 0 !important;
        }
        .w-md-editor-content {
          background-color: transparent !important;
        }
        .w-md-editor-text {
          background-color: transparent !important;
        }
        .w-md-editor-text-input {
          background-color: transparent !important;
          color: white !important;
        }
        .w-md-editor-preview {
          background-color: transparent !important;
        }
        .wmde-markdown {
          background-color: transparent !important;
        }
        .wmde-markdown-var {
          background-color: transparent !important;
        }
      `}</style>
    </div>
  );
}
