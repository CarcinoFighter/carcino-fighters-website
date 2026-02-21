"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

export default function NewDocPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [verifying, setVerifying] = useState(true);

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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin", { method: "GET" });
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }
      } catch (err) {
        console.error("auth check error", err);
        router.replace("/admin/login");
        return;
      } finally {
        setVerifying(false);
      }
    };
    checkSession();
  }, [router]);

  const trimmedPreview = useMemo(() => content?.trim() || "", [content]);

  async function handleSave() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_doc_change",
          slug,
          title,
          content,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Creation failed");
      } else {
        setSuccess(data?.autoApproved ? "Saved and published" : "Submitted for admin approval");
        setSlug("");
        setTitle("");
        setContent("");
        router.push("/admin");
      }
    } catch (err) {
      console.error("create doc error", err);
      setError("Creation failed");
    } finally {
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <div className="flex items-center gap-3 text-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/60 border-t-transparent" />
          Verifying session...
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
            Create Masterpiece
          </h1>
          <p className="font-dmsans text-white/70 text-xl md:text-2xl max-w-2xl font-light leading-relaxed">
            Society Publishing Panel
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-12 relative z-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <button
              className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors"
              onClick={() => router.push("/admin")}
            >
              ← Back to dashboard
            </button>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <motion.div
              whileHover={{ y: -2, scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex"
            >
              <button
                className="relative px-4 py-2 md:px-[22px] md:py-[22px] rounded-full overflow-hidden backdrop-blur-sm font-dmsans transition-all duration-300 font-normal hover:bg-transparent"
                onClick={handleSave}
                disabled={loading}
              >
                <span className="relative z-10 flex items-center gap-2 text-[#e0e0e0] text-xs sm:text-[18px] font-light">
                  {loading ? "Saving..." : "Publish Article"}
                  {!loading && <ArrowUpRight className="transition-transform mt-[1px]" />}
                </span>

                {/* Liquid glass layers */}
                <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                <div className="liquidGlass-shine relative w-[100.8%] h-[100%] !top-[0px] !left-[-1px]"></div>
                <div className="absolute inset-0 liquidGlass-text pointer-events-none"></div>
              </button>
            </motion.div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400/30 bg-red-900/20 px-6 py-4 text-sm text-red-200 backdrop-blur-md">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-2xl border border-green-400/30 bg-green-900/20 px-6 py-4 text-sm text-green-200 backdrop-blur-md">
            {success}
          </div>
        )}

        <div className="relative overflow-hidden isolation-isolate liquid-glass !shadow-none backdrop-blur-[30px] rounded-[40px] p-1 group">
          {/* Card Glass Layers */}
          <div className="liquidGlass-effect pointer-events-none" />
          <div className="cardGlass-tint pointer-events-none" />
          <div className="glass-noise" />
          <div className="cardGlass-borders pointer-events-none" />
          <div className="cardGlass-shine pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-10 space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1" htmlFor="slug">Slug</label>
                  <input
                    id="slug"
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-2xl h-12 px-4 transition-all text-white outline-none"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="article-url-slug"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1" htmlFor="title">Title</label>
                  <input
                    id="title"
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-2xl h-12 px-4 transition-all text-white outline-none"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter article title..."
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-center gap-3">
                <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Drafting Guidelines</div>
                <p className="text-sm text-white/50 leading-relaxed font-light">
                  Maintain our standard research tone. Utilize headings and bullet points for clarity. All metadata will be automatically populated via admin review.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Composition & Live Preview</label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
                {/* Editor Side */}
                <div className="rounded-[30px] border border-white/10 bg-transparent p-3 overflow-hidden" data-color-mode={colorMode}>
                  {mounted ? (
                    <MDEditor
                      value={content}
                      onChange={(v) => setContent(v ?? "")}
                      height={500}
                      preview="edit"
                      hideToolbar={false}
                      visibleDragbar={false}
                      textareaProps={{ placeholder: "Compose your masterpiece..." }}
                    />
                  ) : (
                    <div className="flex items-center justify-center p-20 text-sm text-white/40">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white mr-3" />
                      Initializing...
                    </div>
                  )}
                </div>

                {/* Preview Side */}
                <div className="rounded-[30px] border border-white/10 bg-transparent p-6 overflow-y-auto max-h-[526px] custom-scrollbar relative">
                  <div className="absolute top-4 right-6 text-[10px] uppercase tracking-widest text-white/20 font-bold z-20">Live View</div>
                  {mounted ? (
                    <MarkdownPreview
                      source={trimmedPreview || "*Begin your research to see the preview...*"}
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
