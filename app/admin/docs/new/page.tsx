"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen bg-background px-4 py-10 pt-[68px]">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <button
              className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
              onClick={() => router.push("/admin")}
            >
              ← Back to dashboard
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">New article</p>
              <h1 className="text-2xl font-bold leading-tight">Write with Markdown</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {success}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs text-muted-foreground" htmlFor="slug">Slug</label>
            <input
              id="slug"
              className="w-full rounded-lg border bg-background px-3 py-2"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <label className="text-xs text-muted-foreground" htmlFor="title">Title</label>
            <input
              id="title"
              className="w-full rounded-lg border bg-background px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm" data-color-mode={colorMode}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Markdown editor</h3>
              <p className="text-sm text-muted-foreground">All new articles must be authored in Markdown.</p>
            </div>
          </div>
          <div className="mt-3" data-color-mode={colorMode}>
            {mounted ? (
              <MDEditor
                value={content}
                onChange={(v) => setContent(v ?? "")}
                height={520}
                preview="edit"
                visibleDragbar
                textareaProps={{ placeholder: "Write in Markdown. Use # for headings, **bold**, lists, and more." }}
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Loading editor...
              </div>
            )}
          </div>
          <div className="mt-6 space-y-2">
            <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Live preview</div>
            <div className="rounded-xl border bg-muted/40 p-4">
              {mounted ? (
                <MarkdownPreview
                  source={trimmedPreview || "Nothing here yet. Start typing to see the preview."}
                  className="prose max-w-none dark:prose-invert"
                  data-color-mode={colorMode}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .w-md-editor {
          border-radius: 16px;
          background: hsl(var(--card));
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
        }
        .w-md-editor-bar svg {
          color: hsl(var(--muted-foreground));
        }
        .w-md-editor-toolbar {
          background: hsl(var(--muted));
          border-color: hsl(var(--border));
        }
        .w-md-editor-content {
          background: transparent;
        }
        .w-md-editor-text-input, .w-md-editor-text {
          background: transparent;
          color: hsl(var(--foreground));
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .w-md-editor-preview {
          background: hsl(var(--card));
        }
      `}</style>
    </div>
  );
}
