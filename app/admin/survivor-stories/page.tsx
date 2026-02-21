"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="min-h-screen flex items-center justify-center bg-[#2A292F] text-white">
        <div className="flex items-center gap-3 text-sm text-white/60">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading survivor stories...
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
            Survivor Stories
          </h1>
          <p className="font-dmsans text-white/70 text-xl md:text-2xl max-w-2xl font-light leading-relaxed">
            Stories that give hope. Stories that matter.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <button
              className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors"
              onClick={() => router.push("/admin")}
            >
              ← Back to dashboard
            </button>
            <div className="max-md:hidden border-l border-white/10 h-10 mx-2" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Authenticated Member</span>
              <div className="text-lg font-bold text-white/90 leading-none mt-1">{user?.name || user?.username || "Member"}</div>
              {user?.email && <div className="text-xs text-white/40 mt-1">{user.email}</div>}
            </div>
          </div>
          <div className="flex md:items-end flex-col">
            <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Status</div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-sm font-medium text-white/70">Live Connection</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400/30 bg-red-900/20 px-6 py-4 text-sm text-red-200 backdrop-blur-md">
            {error}
          </div>
        )}

        <div className="relative overflow-hidden isolation-isolate liquid-glass !shadow-none backdrop-blur-[30px] rounded-[40px] p-1 group">
          {/* Card Glass Layers */}
          <div className="liquidGlass-effect pointer-events-none" />
          <div className="cardGlass-tint pointer-events-none" />
          <div className="glass-noise" />
          <div className="cardGlass-borders pointer-events-none" />
          <div className="cardGlass-shine pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold font-wintersolace tracking-tight">
                {editingId ? "Refine Your Story" : "Publish New Story"}
              </h2>
            </div>

            <form className="space-y-8" onSubmit={handleStorySubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Title</label>
                    <Input
                      value={storyForm.title}
                      onChange={(e) => setStoryForm((p) => ({ ...p, title: e.target.value }))}
                      className="bg-white/5 border-white/10 focus:border-purple-500/50 rounded-2xl h-12 px-4 transition-all text-white outline-none"
                      placeholder="Heart of Resilience"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Custom Slug (Optional)</label>
                    <Input
                      value={storyForm.slug}
                      onChange={(e) => setStoryForm((p) => ({ ...p, slug: e.target.value }))}
                      className="bg-white/5 border-white/10 focus:border-purple-500/50 rounded-2xl h-12 px-4 transition-all text-white outline-none"
                      placeholder="survivor-story-slug"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Cover Image</label>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-[calc(100%-24px)] flex flex-col items-center justify-center text-center group/upload relative overflow-hidden transition-all hover:bg-white/10">
                    {storyForm.image_url ? (
                      <div className="absolute inset-0 z-0">
                        <img src={storyForm.image_url} alt="Cover" className="w-full h-full object-cover opacity-30" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1b172a] to-transparent" />
                      </div>
                    ) : null}

                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <label className="cursor-pointer flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center group-hover/upload:bg-purple-500/20 transition-all">
                          <ArrowUpRight className="text-white/60 group-hover/upload:text-purple-400 rotate-[-45deg] transition-all" />
                        </div>
                        <span className="text-sm font-medium text-white/60 group-hover/upload:text-white transition-all">
                          {imageUploading ? "Uploading..." : storyForm.image_url ? "Change Image" : "Upload Cover"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCoverUpload(file);
                          }}
                          disabled={imageUploading}
                        />
                      </label>
                      {storyForm.image_url && (
                        <button
                          type="button"
                          onClick={() => setStoryForm((p) => ({ ...p, image_url: "" }))}
                          className="text-[10px] uppercase tracking-widest text-red-400/60 hover:text-red-400 mt-2 font-bold"
                        >
                          Remove Artwork
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Story Narrative & Preview</label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
                  {/* Editor Side */}
                  <div className="rounded-[30px] border border-white/10 bg-black/20 p-3 overflow-hidden" data-color-mode={colorMode}>
                    {mounted ? (
                      <MDEditor
                        value={storyForm.content}
                        onChange={(v) => setStoryForm((p) => ({ ...p, content: v ?? "" }))}
                        height={400}
                        preview="edit"
                        hideToolbar={false}
                        visibleDragbar={false}
                        textareaProps={{ placeholder: "Unfold the journey..." }}
                      />
                    ) : (
                      <div className="flex items-center justify-center p-20 text-sm text-white/40">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white mr-3" />
                        Initializing...
                      </div>
                    )}
                  </div>

                  {/* Preview Side */}
                  <div className="rounded-[30px] border border-white/10 bg-black/10 p-6 overflow-y-auto max-h-[426px] custom-scrollbar relative">
                    <div className="absolute top-4 right-6 text-[10px] uppercase tracking-widest text-white/20 font-bold z-20">Live View</div>
                    {mounted ? (
                      <MarkdownPreview
                        source={storyForm.content || "*Your words will illuminate this space...*"}
                        className="prose max-w-none dark:prose-invert bg-transparent"
                        data-color-mode={colorMode}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-white/20">
                        Loading...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Tags (Comma Separated)</label>
                    <Input
                      value={storyForm.tags}
                      onChange={(e) => setStoryForm((p) => ({ ...p, tags: e.target.value }))}
                      className="bg-white/5 border-white/10 focus:border-purple-500/50 rounded-2xl h-12 px-4 transition-all text-white outline-none"
                      placeholder="resilience, hope, victory"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Signature Colour</label>
                    <div className="flex flex-wrap gap-2">
                      {presetColours.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setStoryForm((p) => ({ ...p, colour: c }))}
                          className={`h-10 w-10 rounded-full border-2 transition-transform hover:scale-110 ${storyForm.colour === c ? "border-white ring-2 ring-purple-500 ring-offset-2 ring-offset-[#2A292F]" : "border-white/10"
                            }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => setStoryForm((p) => ({ ...p, colour: "" }))}
                        className="h-10 px-4 rounded-full border border-white/10 text-xs text-white/40 hover:text-white/60 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-end">
                  {editingId && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null);
                        setStoryForm({ title: "", slug: "", image_url: "", content: "", tags: "", colour: "" });
                      }}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      Cancel Edit
                    </Button>
                  )}
                  <motion.div
                    whileHover={{ y: -2, scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex"
                  >
                    <Button
                      type="submit"
                      disabled={storySaving || imageUploading}
                      variant="ghost"
                      className="relative px-4 py-2 md:px-6 md:py-3 rounded-full overflow-hidden backdrop-blur-sm font-dmsans transition-all duration-300 font-normal hover:bg-transparent"
                    >
                      <span className="relative z-10 flex items-center gap-2 text-[#e0e0e0] text-[12px] sm:text-[15px] font-light">
                        {storySaving ? "Saving..." : editingId ? "Update Story" : "Publish Story"}
                        <ArrowUpRight className="transition-transform mt-[1px]" />
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

        {/* Existing Stories Section */}
        <div className="space-y-6 pt-12">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-bold font-wintersolace">Your Published Stories</h2>
            <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{sortedStories.length} Entries Found</div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {sortedStories.length === 0 ? (
              <div className="relative overflow-hidden liquid-glass rounded-[30px] p-10 text-center">
                <div className="text-white/30 italic">No stories published yet. Start by writing one above.</div>
              </div>
            ) : (
              sortedStories.map((story) => (
                <div
                  key={story.id}
                  className="relative overflow-hidden isolation-isolate liquid-glass !shadow-none backdrop-blur-[20px] rounded-[30px] p-1 group transition-all hover:scale-[1.005]"
                >
                  <div className="relative z-10 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-6">
                      {story.image_url ? (
                        <div className="h-16 w-16 rounded-2xl border border-white/10 overflow-hidden ring-4 ring-white/5">
                          <img src={story.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-2xl border border-white/10 flex items-center justify-center bg-white/5 text-white/20 text-xs font-bold ring-4 ring-white/5">
                          No Art
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">/{story.slug}</div>
                        <h3 className="text-xl font-bold text-white/90">{story.title}</h3>
                        <div className="text-sm text-white/50 line-clamp-1 max-w-md mt-1 font-light">
                          {story.content?.replace(/#|\*|_|`/g, "") || "No content summary"}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        className="rounded-full bg-white/5 border border-white/10 hover:bg-white/20 transition-all px-6"
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
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        className="rounded-full bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all px-6"
                        onClick={() => handleDelete(story.id)}
                      >
                        Delete
                      </Button>
                      <button
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all"
                        onClick={() => router.push(`/survivorstories/${story.slug}`)}
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Glass layers for list items */}
                  <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>
              ))
            )}
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
          background-color: rgba(255, 255, 255, 0.03) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
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
          font-family: inherit !important;
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
