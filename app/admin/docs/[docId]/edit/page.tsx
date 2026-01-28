"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";


const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

type DocPayload = {
  id: string;
  slug: string;
  title: string;
  content: string;
  position?: string | null;
  author_user_id?: string | null;
  author_name?: string | null;
  author_username?: string | null;
  author_position?: string | null;
  profilePicture?: string | null;
  updated_at?: string | null;
};

export default function DocEditPage() {
  const router = useRouter();
  const params = useParams<{ docId: string }>();
  const docId = params?.docId;

  const [doc, setDoc] = useState<DocPayload | null>(null);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

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
    if (!docId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_doc", docId }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 401) {
            router.replace("/admin/login");
            return;
          }
          setError(data?.error || "Failed to load article");
          setLoading(false);
          return;
        }
        setDoc(data.doc);
        setSlug(data.doc?.slug ?? "");
        setTitle(data.doc?.title ?? "");
        setContent(data.doc?.content ?? "");
      } catch (err) {
        console.error("get_doc error", err);
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [docId, router]);

  const trimmedPreview = useMemo(() => content?.trim() || "", [content]);

  async function handleSave() {
    if (!docId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_doc_change",
          docId,
          slug,
          title,
          content,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Update failed");
      } else {
        if (data.doc) setDoc(data.doc);
        setSuccess(data?.autoApproved ? "Saved and published" : "Submitted for admin approval");
      }
    } catch (err) {
      console.error("save doc error", err);
      setError("Update failed");
    } finally {
      setSaving(false);
    }
  }

  const authorLabel = doc?.author_name || doc?.author_username || "";

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
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Editing article</p>
              <h1 className="text-2xl font-bold leading-tight">{title || "Untitled"}</h1>
              <div className="text-xs text-muted-foreground">ID: {docId}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {doc?.slug && (
              <button
                className="rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                onClick={() => window.open(`/article/${doc.slug}`, "_blank")}
              >
                View live
              </button>
            )}
            <button
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow"
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? "Saving..." : "Save"}
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

        {loading ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading editor...
          </div>
        ) : (
          <>
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
              <div className="rounded-xl border bg-card p-4 shadow-sm flex gap-3">
                {doc?.profilePicture ? (
                  <Image
                    src={doc.profilePicture}
                    alt="Author avatar"
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-muted" />
                )}
                <div className="flex flex-col gap-1 text-sm">
                  <div className="text-xs text-muted-foreground">Author</div>
                  <div className="font-semibold">{authorLabel || "Unknown"}</div>
                  {doc?.author_position && <div className="text-xs text-muted-foreground">{doc.author_position}</div>}
                  {doc?.updated_at && (
                    <div className="text-xs text-muted-foreground">Updated {new Date(doc.updated_at).toLocaleString()}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-4 shadow-sm" data-color-mode={colorMode}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Markdown editor</h3>
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
          </>
        )}
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
