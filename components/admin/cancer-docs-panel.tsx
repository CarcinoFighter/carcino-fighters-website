"use client";

import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type AdminUser = {
  id: string;
  username: string | null;
  email: string | null;
  name: string | null;
  admin_access?: boolean | null;
  position?: string | null;
  description?: string | null;
};

export type CancerDoc = {
  id: string;
  slug: string;
  title: string;
  content: string;
  position: string | null;
  author_user_id?: string | null;
  author_name?: string | null;
  author_username?: string | null;
  author_position?: string | null;
  profilePicture?: string | null;
};

export type EditDocPayload = {
  slug: string;
  title: string;
  content: string;
  authorId: string;
};

export type AddDocPayload = {
  slug: string;
  title: string;
  content: string;
};

type Props = {
  docs: CancerDoc[];
  currentUser: AdminUser | null;
  editingId: string | null;
  editData: EditDocPayload;
  setEditData: Dispatch<SetStateAction<EditDocPayload>>;
  setEditing: (id: string | null) => void;
  onSave: (id: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  users: AdminUser[];
  authorSearch: Record<string, string>;
  setAuthorSearch: Dispatch<SetStateAction<Record<string, string>>>;
  loading: boolean;
  adding: boolean;
  onAddOpen: () => void;
  onAddClose: () => void;
  addData: AddDocPayload;
  setAddData: Dispatch<SetStateAction<AddDocPayload>>;
  onAddSubmit: () => void | Promise<void>;
};

export function CancerDocsPanel(props: Props) {
  const {
    docs,
    currentUser,
    editingId,
    editData,
    setEditData,
    setEditing,
    onSave,
    onDelete,
    users,
    authorSearch,
    setAuthorSearch,
    loading,
    adding,
    onAddOpen,
    onAddClose,
    addData,
    setAddData,
    onAddSubmit,
  } = props;

  const canAdd = Boolean(currentUser?.admin_access);
  const [docSearch, setDocSearch] = useState("");

  const filteredDocs = useMemo(() => {
    const term = docSearch.toLowerCase().trim();
    if (!term) return docs;
    return docs.filter((doc) => doc.title.toLowerCase().includes(term) || doc.slug.toLowerCase().includes(term));
  }, [docSearch, docs]);

  const getUserLabel = (userId?: string | null) => {
    if (!userId) return "";
    const user = users.find((u) => u.id === userId);
    return user?.name || user?.username || user?.email || "";
  };

  const renderAuthorSelection = (doc: CancerDoc, isEditing: boolean) => {
    const term = (authorSearch[doc.id] ?? "").toLowerCase();
    const filtered = users
      .filter((u) => {
        if (!term) return true;
        return [u.name, u.username, u.email, u.position]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term));
      })
      .slice(0, 20);

    const selectedAuthorLabel = getUserLabel(editData.authorId) || getUserLabel(doc.author_user_id) || doc.author_name || doc.author_username || "";
    const currentAuthorLabel = doc.author_name || doc.author_username || getUserLabel(doc.author_user_id) || "";
    const authorPlaceholder = selectedAuthorLabel
      ? `Selected: ${selectedAuthorLabel}${currentAuthorLabel ? ` | Current: ${currentAuthorLabel}` : ""}`
      : currentAuthorLabel
        ? `Current: ${currentAuthorLabel}`
        : "Search authors...";

    if (!isEditing) {
      const label = doc.author_user_id
        ? doc.author_name || doc.author_username || ""
        : "";
      return (
        <div className="text-sm">
          <div className="text-muted-foreground text-xs">Author</div>
          <div className="font-medium">{label || "—"}</div>
          {doc.author_position && <div className="text-xs text-muted-foreground">{doc.author_position}</div>}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Search author</div>
        <input
          className="border rounded px-3 py-2 w-full bg-background"
          placeholder={authorPlaceholder}
          value={authorSearch[doc.id] ?? ""}
          onChange={(e) => setAuthorSearch((s) => ({ ...s, [doc.id]: e.target.value }))}
        />
        <div className="max-h-44 overflow-auto rounded border bg-popover shadow-sm divide-y">
          {filtered.map((u) => (
            <button
              type="button"
              key={u.id}
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-muted hover:cursor-pointer",
                editData.authorId === u.id && "bg-muted"
              )}
              onClick={() => setEditData((s) => ({ ...s, authorId: u.id }))}
            >
              <div className="font-medium leading-tight">{u.name || u.username || u.email || "(no name)"}</div>
              <div className="text-xs text-muted-foreground">{u.position || ""}</div>
            </button>
          ))}
          <button
            type="button"
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-muted hover:cursor-pointer"
            onClick={() => setEditData((s) => ({ ...s, authorId: "" }))}
          >
            Clear author
          </button>
        </div>
      </div>
    );
  };

  const renderContent = (doc: CancerDoc, isEditing: boolean) => {
    if (isEditing) {
      return (
        <textarea
          className="border rounded px-3 py-2 w-full min-h-[120px] bg-background"
          value={editData.content}
          onChange={(e) => setEditData((s) => ({ ...s, content: e.target.value }))}
        />
      );
    }

    return (
      <div className="prose prose-sm dark:prose-invert max-h-40 overflow-auto text-sm leading-relaxed">
        <p className="whitespace-pre-line">{doc.content}</p>
      </div>
    );
  };

  const renderCard = (doc: CancerDoc) => {
    const isEditing = editingId === doc.id;
    const canEdit = Boolean(currentUser?.admin_access || doc.author_user_id === currentUser?.id);
    const authorLabel = doc.author_name || doc.author_username || getUserLabel(doc.author_user_id) || "—";

    return (
      <article key={doc.id} className="rounded-xl border bg-card/80 backdrop-blur p-4 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Slug</div>
            {isEditing ? (
              <input
                className="border rounded px-3 py-2 bg-background w-full"
                value={editData.slug}
                onChange={(e) => setEditData((s) => ({ ...s, slug: e.target.value }))}
              />
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-mono">{doc.slug}</div>
            )}
            <div className="text-xs text-muted-foreground">ID: {doc.id.slice(0, 8)}...</div>
          </div>
          <div className="flex items-center gap-3">
            {doc.profilePicture ? (
              <Image src={doc.profilePicture} width={56} height={56} alt="avatar" className="h-14 w-14 rounded-full object-cover" unoptimized />
            ) : (
              <div className="h-14 w-14 rounded-full bg-muted" />
            )}
            <div className="flex flex-col">
              <div className="text-xs text-muted-foreground">Author</div>
              <div className="text-sm font-semibold leading-tight">{authorLabel}</div>
              {doc.author_position && <div className="text-xs text-muted-foreground">{doc.author_position}</div>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Title</div>
            {isEditing ? (
              <input
                className="border rounded px-3 py-2 bg-background w-full"
                value={editData.title}
                onChange={(e) => setEditData((s) => ({ ...s, title: e.target.value }))}
              />
            ) : (
              <div className="text-base font-semibold leading-snug">{doc.title}</div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Position</div>
            <div className="text-sm font-medium text-muted-foreground">{doc.position || "—"}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Content</div>
          {renderContent(doc, isEditing)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderAuthorSelection(doc, isEditing && Boolean(currentUser?.admin_access))}
          <div className="text-sm space-y-2">
            <div className="text-xs text-muted-foreground">Actions</div>
            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                <>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:cursor-pointer"
                    onClick={() => onSave(doc.id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </span>
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button
                    className="border px-4 py-2 rounded hover:cursor-pointer"
                    onClick={() => setEditing(null)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {canEdit && (
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:cursor-pointer"
                      onClick={() => {
                        setEditing(doc.id);
                        setEditData({
                          slug: doc.slug,
                          title: doc.title,
                          content: doc.content,
                          authorId: doc.author_user_id || "",
                        });
                      }}
                    >
                      Edit
                    </button>
                  )}
                  {currentUser?.admin_access && (
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded hover:cursor-pointer"
                      onClick={() => onDelete(doc.id)}
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Cancer Docs</h2>
          {/* <p className="text-sm text-muted-foreground">Manage slugs, titles, authors, and content in a mobile-friendly layout.</p> */}
        </div>
        {canAdd && (
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold shadow hover:cursor-pointer"
            onClick={onAddOpen}
          >
            + Add New Article
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm text-muted-foreground" htmlFor="doc-search">Search articles</label>
        <input
          id="doc-search"
          className="border rounded px-3 py-2 w-full sm:w-72 bg-background"
          placeholder="Search by title or slug"
          value={docSearch}
          onChange={(e) => setDocSearch(e.target.value)}
        />
      </div>

      {docs.length === 0 && (
        <div className="rounded-xl border bg-card/70 p-6 text-sm text-muted-foreground">No articles yet.</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => renderCard(doc))}
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Add New Article</h3>
                <p className="text-sm text-muted-foreground">Provide the essentials; you can refine later.</p>
              </div>
              <button className="text-sm text-muted-foreground hover:cursor-pointer" onClick={onAddClose} disabled={loading}>
                Close
              </button>
            </div>
            <div className="space-y-3">
              <input
                className="border rounded px-3 py-2 w-full bg-background"
                placeholder="Slug"
                value={addData.slug}
                onChange={(e) => setAddData((s) => ({ ...s, slug: e.target.value }))}
              />
              <input
                className="border rounded px-3 py-2 w-full bg-background"
                placeholder="Title"
                value={addData.title}
                onChange={(e) => setAddData((s) => ({ ...s, title: e.target.value }))}
              />
              <textarea
                className="border rounded px-3 py-2 w-full bg-background min-h-[120px]"
                placeholder="Content (Markdown supported)"
                value={addData.content}
                onChange={(e) => setAddData((s) => ({ ...s, content: e.target.value }))}
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                className="border px-4 py-2 rounded hover:cursor-pointer"
                onClick={onAddClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:cursor-pointer"
                onClick={onAddSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  "Add article"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
