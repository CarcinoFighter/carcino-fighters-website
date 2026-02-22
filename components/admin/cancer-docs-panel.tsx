"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

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

  const cardClass = "rounded-[44px] border border-white/10 bg-white/0 backdrop-blur shadow-2xl text-white";
  const inputClass = "bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#6D54B5]";
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

  const renderCard = (doc: CancerDoc) => {
    const canEdit = Boolean(currentUser?.admin_access || doc.author_user_id === currentUser?.id);
    const authorLabel = doc.author_name || doc.author_username || getUserLabel(doc.author_user_id) || "—";
    const authorPosition = doc.author_position || users.find((u) => u.id === doc.author_user_id)?.position || "";

    return (
      <article key={doc.id} className="relative overflow-hidden isolation-isolate rounded-[40px] p-6 sm:p-8 flex flex-col gap-6 w-full text-white transition-transform duration-300 group border border-white/10 bg-white/0 backdrop-blur shadow-2xl">
        <div className="glass-noise" />
        <div className="cardGlass-borders" />
        <div className="cardGlass-tint" />
        <div className="cardGlass-shine pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-5 w-full">
          <div className="flex flex-col xl:flex-row xl:items-start sm:justify-between gap-6 w-full">
            {/* Left: Title & Slug */}
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl sm:text-2xl font-tttravelsnext font-bold uppercase tracking-tight">{doc.title}</h3>
                <span className="inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-1 text-xs font-mono text-white/80 backdrop-blur-md border border-white/5">{doc.slug}</span>
              </div>
              <p className="text-xs text-white/40 font-mono tracking-wider">ID: {doc.id}</p>
            </div>

            {/* Right: Author */}
            <div className="flex items-center gap-4 bg-white/5 rounded-full pl-2 pr-6 py-2 border border-white/5 backdrop-blur-sm self-start shrink-0">
              {doc.profilePicture ? (
                <Image src={doc.profilePicture} width={44} height={44} alt="avatar" className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10" unoptimized />
              ) : (
                <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-sm font-bold">
                  {authorLabel.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.1em] text-[#CDA8E8]">Author</span>
                <span className="text-sm font-semibold">{authorLabel}</span>
                {authorPosition && <span className="text-xs text-white/60">{authorPosition}</span>}
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-white/20 via-white/5 to-transparent my-1" />

          {/* Content Preview */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.1em] text-[#CDA8E8]">Content Preview</span>
            <div className="prose prose-sm dark:prose-invert max-h-32 overflow-hidden text-sm leading-relaxed text-white/80 font-dmsans relative"
              style={{ maskImage: "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)" }}>
              <p className="whitespace-pre-line">{doc.content}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 pt-4 mt-auto">
            {canEdit && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex">
                <button
                  className="relative px-5 py-2.5 rounded-full overflow-hidden backdrop-blur-sm font-dmsans transition-all duration-300"
                  onClick={() => router.push(`/admin/docs/${doc.id}/edit`)}
                >
                  <span className="relative z-10 flex items-center gap-2 text-white text-sm font-medium">Open Editor</span>
                  <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                  <div className="liquidGlass-shine relative w-[100.8%] h-[100%] !top-[0px] !left-[-1px]"></div>
                </button>
              </motion.div>
            )}
            {currentUser?.admin_access && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex">
                <button
                  className="relative px-5 py-2.5 rounded-full overflow-hidden backdrop-blur-sm font-dmsans transition-all duration-300 bg-red-500/10"
                  onClick={() => onDelete(doc.id)}
                >
                  <span className="relative z-10 flex items-center gap-2 text-[#ff6b6b] text-sm font-medium">Delete</span>
                  <div className="absolute inset-0 liquidGlass-effect opacity-60 pointer-events-none" style={{ filter: 'hue-rotate(300deg)' }}></div>
                  <div className="liquidGlass-shine relative w-[100.8%] h-[100%] !top-[0px] !left-[-1px] opacity-40"></div>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className="space-y-5 text-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      </div>

      <div className="relative overflow-hidden isolation-isolate liquid-glass !shadow-none rounded-[44px] w-full">
        <div className="liquidGlass-effect pointer-events-none"></div>
        <div className="liquidGlass-shine pointer-events-none"></div>
        <div className="liquidGlass-text pointer-events-none"></div>

        <div className="px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10 w-full">
          <label className="text-sm text-white/70" htmlFor="doc-search">Search articles</label>
          <input
            id="doc-search"
            className={`${inputClass} w-full sm:w-72`}
            placeholder="Search by title or slug"
            value={docSearch}
            onChange={(e) => setDocSearch(e.target.value)}
          />
        </div>
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

