"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

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
    <div className="min-h-screen bg-black text-white px-6 md:px-12 pb-14 pt-16 font-dmsans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-white/60">Blogs</p>
            <h1 className="text-3xl font-bold">Creator Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="border-white/10 hover:bg-white/5"
            >
              Back to Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await fetch("/api/public-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
                router.replace("/sign-in");
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-400/30 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10 col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-white/10 overflow-hidden">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/60">Avatar</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                    disabled={uploading}
                  />
                </div>
              </div>
              <form className="space-y-3" onSubmit={handleProfileSave}>
                <div className="space-y-1">
                  <label className="text-xs text-white/60">Full name</label>
                  <Input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    className="bg-white/10 border-white/10"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/60">Username</label>
                  <Input
                    value={profileForm.username}
                    onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                    className="bg-white/10 border-white/10"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/60">Bio</label>
                  <Textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                    className="bg-white/10 border-white/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/60">New password</label>
                  <Input
                    type="password"
                    value={profileForm.password}
                    onChange={(e) => setProfileForm((p) => ({ ...p, password: e.target.value }))}
                    className="bg-white/10 border-white/10"
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={savingProfile}>
                  {savingProfile ? "Saving..." : "Save profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">{editingId ? "Edit post" : "Write a new post"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handlePostSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-white/60">Title</label>
                    <Input
                      value={postForm.title}
                      onChange={(e) => setPostForm((p) => ({ ...p, title: e.target.value }))}
                      className="bg-white/10 border-white/10"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-white/60">Custom slug (optional)</label>
                    <Input
                      value={postForm.slug}
                      onChange={(e) => setPostForm((p) => ({ ...p, slug: e.target.value }))}
                      className="bg-white/10 border-white/10"
                      placeholder="blog-post"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/60">Content (Markdown)</label>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-2" data-color-mode={colorMode}>
                    {mounted ? (
                      <MDEditor
                        value={postForm.content}
                        onChange={(v) => setPostForm((p) => ({ ...p, content: v ?? "" }))}
                        height={320}
                        preview="edit"
                        visibleDragbar
                        textareaProps={{
                          placeholder: "Write in Markdown. Use # for headings, **bold**, lists, and more.",
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
                        Loading editor...
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/60">Tags (comma separated)</label>
                  <Input
                    value={postForm.tags}
                    onChange={(e) => setPostForm((p) => ({ ...p, tags: e.target.value }))}
                    className="bg-white/10 border-white/10"
                    placeholder="research, update"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  {editingId && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null);
                        setPostForm({ title: "", slug: "", content: "", tags: "" });
                      }}
                    >
                      Cancel edit
                    </Button>
                  )}
                  <Button type="submit" disabled={postSaving}>
                    {postSaving ? "Saving..." : editingId ? "Update post" : "Publish post"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Your posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedPosts.length === 0 && (
              <div className="text-sm text-white/70">No posts yet. Start by writing one above.</div>
            )}
            {sortedPosts.map((post) => (
              <div
                key={post.id}
                className="border border-white/10 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <p className="text-xs text-white/60">/{post.slug}</p>
                  <div className="font-semibold">{post.title}</div>
                  <div className="text-xs text-white/60 mt-1">
                    {contentExcerpt(post.content)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingId(post.id);
                      setPostForm({
                        title: post.title,
                        slug: post.slug,
                        content: post.content ?? "",
                        tags: (post.tags || []).join(", "),
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(post.id)}>
                    Delete
                  </Button>
                  <Button variant="secondary" onClick={() => router.push(`/blogs/${post.slug}`)}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
