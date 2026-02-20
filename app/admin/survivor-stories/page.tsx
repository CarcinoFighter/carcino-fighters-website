"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type Story = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  tags: string[] | null;
  created_at: string;
  image_url?: string | null;
  colour?: string | null;
};

type AdminUser = {
  id: string;
  username: string | null;
  name: string | null;
  email?: string | null;
};

export default function AdminSurvivorStories() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storySaving, setStorySaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  const [storyForm, setStoryForm] = useState({
    title: "",
    slug: "",
    content: "",
    tags: "",
    image_url: "",
    colour: "",
  });

  const presetColours = ["#E39E2E", "#64A04B", "#4145ca", "#9E8DC5", "#7F2D3F", "#818181"];

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

  const sortedStories = useMemo(
    () => stories.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [stories]
  );

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin", { method: "GET" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.authenticated) {
          router.replace("/admin/login?redirectTo=/admin/survivor-stories");
          return;
        }
        setUser(data.user);
        await fetchStories();
      } catch (err) {
        console.error("admin survivor stories init error", err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [router]);

  async function fetchStories() {
    try {
      const res = await fetch("/api/survivor-stories?mine=true");
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStories(data.stories ?? []);
      } else {
        setError(data?.error || "Failed to load stories");
      }
    } catch (err) {
      console.error("fetchStories error", err);
      setError("Failed to load stories");
    }
  }

  async function handleCoverUpload(file: File) {
    if (!file) return;
    setImageUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("action", "upload_image");
      formData.append("image", file);

      const res = await fetch("/api/survivor-stories", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Image upload failed");
        return;
      }
      if (data.image_url) {
        setStoryForm((p) => ({ ...p, image_url: data.image_url }));
      }
    } catch (err) {
      console.error("cover upload error", err);
      setError("Image upload failed");
    } finally {
      setImageUploading(false);
    }
  }

  async function handleStorySubmit(e: React.FormEvent) {
    e.preventDefault();
    setStorySaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        action: editingId ? "update" : "create",
        id: editingId ?? undefined,
        title: storyForm.title,
        slug: storyForm.slug || undefined,
        image_url: storyForm.image_url || undefined,
        colour: storyForm.colour || undefined,
        content: storyForm.content,
        tags: storyForm.tags,
      };

      const res = await fetch("/api/survivor-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Save failed");
        return;
      }

      setStoryForm({ title: "", slug: "", image_url: "", content: "", tags: "", colour: "" });
      setEditingId(null);
      await fetchStories();
    } catch (err) {
      console.error("story save error", err);
      setError("Save failed");
    } finally {
      setStorySaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this story?")) return;
    try {
      const res = await fetch("/api/survivor-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Delete failed");
        return;
      }
      await fetchStories();
    } catch (err) {
      console.error("delete story error", err);
      setError("Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white">
        <div className="flex items-center gap-3 text-sm text-white/80">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading survivor stories...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0714] text-white px-6 md:px-12 pb-14 pt-12 font-dmsans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-white/60">Survivor Stories</p>
            <h1 className="text-3xl font-bold">Society Publishing</h1>
            <p className="text-sm text-white/60">Signed-in society members can publish survivor stories here.</p>
          </div>
          <div className="text-right text-sm text-white/70">
            <div className="font-semibold">{user?.name || user?.username || "Member"}</div>
            {user?.email ? <div className="text-white/50">{user.email}</div> : null}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-400/30 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? "Edit story" : "Publish a story"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleStorySubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-white/60">Title</label>
                  <Input
                    value={storyForm.title}
                    onChange={(e) => setStoryForm((p) => ({ ...p, title: e.target.value }))}
                    className="bg-white/10 border-white/10"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/60">Custom slug (optional)</label>
                  <Input
                    value={storyForm.slug}
                    onChange={(e) => setStoryForm((p) => ({ ...p, slug: e.target.value }))}
                    className="bg-white/10 border-white/10"
                    placeholder="survivor-story"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-xs text-white/60">Cover image</label>
                  <p className="text-[11px] text-white/50">Upload an image.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 md:items-center">
                  <Input
                    type="file"
                    accept="image/*"
                    className="bg-white/10 border-white/10"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCoverUpload(file);
                    }}
                    disabled={imageUploading}
                  />
                  <div className="text-[11px] text-white/50 flex-1">
                    {imageUploading ? "Uploading cover..." : ""}
                  </div>
                </div>
                {storyForm.image_url ? (
                  <div className="rounded-lg border border-white/10 overflow-hidden bg-white/5">
                    <div className="h-44 w-full bg-black/30">
                      <img src={storyForm.image_url} alt="Cover preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 text-[11px] text-white/70">
                      <span>Cover preview</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={() => setStoryForm((p) => ({ ...p, image_url: "" }))}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/60">Story content (Markdown)</label>
                <div className="rounded-xl border border-white/10 bg-black/40 p-2" data-color-mode={colorMode}>
                  {mounted ? (
                    <MDEditor
                      value={storyForm.content}
                      onChange={(v) => setStoryForm((p) => ({ ...p, content: v ?? "" }))}
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
                  value={storyForm.tags}
                  onChange={(e) => setStoryForm((p) => ({ ...p, tags: e.target.value }))}
                  className="bg-white/10 border-white/10"
                  placeholder="resilience, hope"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/60">Cover colour (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {presetColours.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setStoryForm((p) => ({ ...p, colour: c }))}
                      className={`h-9 w-9 rounded-full border ${
                        storyForm.colour === c ? "ring-2 ring-offset-2 ring-white/70 ring-offset-[#0a0714]" : "border-white/20"
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Select colour ${c}`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setStoryForm((p) => ({ ...p, colour: "" }))}
                    className="text-xs px-3 py-2 rounded-full border border-white/20 text-white/70 hover:border-white/40"
                  >
                    Clear
                  </button>
                </div>
                {storyForm.colour ? (
                  <p className="text-[11px] text-white/60">Selected: {storyForm.colour}</p>
                ) : (
                  <p className="text-[11px] text-white/50">Defaults to palette if not set.</p>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                {editingId && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null);
                      setStoryForm({ title: "", slug: "", image_url: "", content: "", tags: "", colour: "" });
                    }}
                  >
                    Cancel edit
                  </Button>
                )}
                <Button type="submit" disabled={storySaving || imageUploading}>
                  {storySaving ? "Saving..." : imageUploading ? "Wait for upload..." : editingId ? "Update story" : "Publish story"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Your stories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedStories.length === 0 && (
              <div className="text-sm text-white/70">No stories yet. Start by writing one above.</div>
            )}
            {sortedStories.map((story) => (
              <div
                key={story.id}
                className="border border-white/10 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <p className="text-xs text-white/60">/{story.slug}</p>
                  <div className="font-semibold">{story.title}</div>
                  <div className="text-xs text-white/60 mt-1">
                    {story.content?.slice(0, 120) || "No content yet"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingId(story.id);
                      setStoryForm({
                        title: story.title,
                        slug: story.slug,
                        image_url: story.image_url ?? "",
                        content: story.content ?? "",
                        tags: (story.tags || []).join(", "),
                        colour: story.colour ?? "",
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(story.id)}>
                    Delete
                  </Button>
                  <Button variant="secondary" onClick={() => router.push(`/survivorstories/${story.slug}`)}>
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
