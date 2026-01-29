"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export type AdminUser = {
  id: string;
  username: string | null;
  email: string | null;
  name: string | null;
  admin_access?: boolean | null;
  position?: string | null;
  description?: string | null;
  profilePicture?: string | null;
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

type Props = {
  docs: CancerDoc[];
  currentUser: AdminUser | null;
  onDelete: (id: string) => void | Promise<void>;
  users: AdminUser[];
  loading: boolean;
};

export function CancerDocsPanel(props: Props) {
  const {
    docs,
    currentUser,
    onDelete,
    users,
    loading,
  } = props;

  const canAdd = Boolean(currentUser);
  const [docSearch, setDocSearch] = useState("");
  const router = useRouter();

  const cardClass = "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl text-white";
  const inputClass = "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#6D54B5]";
  const textareaClass = `${inputClass} min-h-[120px]`;
  const primaryButton = "bg-[#6D54B5] hover:bg-[#5a45a0] text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-[#6D54B5]/30 transition hover:cursor-pointer disabled:opacity-60";
  const subtleButton = "border border-white/15 bg-white/5 text-white px-3 py-2 rounded-lg hover:bg-white/10 transition hover:cursor-pointer disabled:opacity-60";
  const ghostButton = "text-sm text-white/80 hover:text-white underline underline-offset-4 hover:cursor-pointer disabled:opacity-60";

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

  const renderContentPreview = (doc: CancerDoc) => (
    <div className="prose prose-sm dark:prose-invert max-h-40 overflow-auto text-sm leading-relaxed text-white/80">
      <p className="whitespace-pre-line">{doc.content}</p>
    </div>
  );

  const renderCard = (doc: CancerDoc) => {
    const canEdit = Boolean(currentUser?.admin_access || doc.author_user_id === currentUser?.id);
    const authorLabel = doc.author_name || doc.author_username || getUserLabel(doc.author_user_id) || "—";
    const authorPosition = doc.author_position || users.find((u) => u.id === doc.author_user_id)?.position || "";

    return (
      <article key={doc.id} className={`${cardClass} p-4 flex flex-col gap-4`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-[0.12em] text-white/60">Slug</div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-mono text-white">{doc.slug}</div>
            <div className="text-xs text-white/60">ID: {doc.id.slice(0, 8)}...</div>
          </div>
          <div className="flex items-center gap-3">
            {doc.profilePicture ? (
              <Image src={doc.profilePicture} width={56} height={56} alt="avatar" className="h-14 w-14 rounded-full object-cover ring-2 ring-white/15" unoptimized />
            ) : (
              <div className="h-14 w-14 rounded-full bg-white/10" />
            )}
            <div className="flex flex-col">
              <div className="text-xs text-white/60">Author</div>
              <div className="text-sm font-semibold leading-tight">{authorLabel}</div>
              {authorPosition && <div className="text-xs text-white/60">{authorPosition}</div>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-xs text-white/60">Title</div>
            <div className="text-base font-semibold leading-snug">{doc.title}</div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-white/60">Position</div>
            <div className="text-sm font-medium text-white/70">{doc.position || "—"}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-white/60">Content</div>
          {renderContentPreview(doc)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-sm space-y-2">
            <div className="text-xs text-white/60">Author</div>
            <div className="font-medium">{authorLabel || "—"}</div>
            {authorPosition && <div className="text-xs text-white/60">{authorPosition}</div>}
          </div>
          <div className="text-sm space-y-2">
            <div className="text-xs text-white/60">Actions</div>
            <div className="flex flex-wrap gap-2">
              {canEdit && (
                <button
                  className={primaryButton}
                  onClick={() => router.push(`/admin/docs/${doc.id}/edit`)}
                >
                  Open editor
                </button>
              )}
              {currentUser?.admin_access && (
                <button
                  className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg shadow-md hover:cursor-pointer"
                  onClick={() => onDelete(doc.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className="space-y-5 text-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/60">Content</p>
          <h2 className="text-2xl font-bold leading-tight">Cancer Docs</h2>
        </div>
        {canAdd && (
          <button
            className={primaryButton}
            onClick={() => router.push("/admin/docs/new")}
          >
            + Add New Article
          </button>
        )}
      </div>

      <div className={`${cardClass} p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`}>
        <label className="text-sm text-white/70" htmlFor="doc-search">Search articles</label>
        <input
          id="doc-search"
          className={`${inputClass} w-full sm:w-72`}
          placeholder="Search by title or slug"
          value={docSearch}
          onChange={(e) => setDocSearch(e.target.value)}
        />
      </div>

      {docs.length === 0 && (
        <div className={`${cardClass} p-6 text-sm text-white/70`}>No articles yet.</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => renderCard(doc))}
      </div>
    </section>
  );
}

