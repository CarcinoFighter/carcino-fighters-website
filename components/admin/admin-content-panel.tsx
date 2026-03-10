"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { FileText, Heart, MessageSquare, User } from "lucide-react";
import { transformSupabaseUrl } from "@/lib/utils";

export type ContentItem = {
    id: string;
    slug: string;
    title: string;
    content: string;
    author_name?: string | null;
    author_username?: string | null;
    profilePicture?: string | null;
    hidden?: boolean;
    deleted?: boolean;
    created_at?: string;
    // Extras
    tags?: string[];
    image_url?: string | null;
    colour?: string | null;
    color?: string | null;
    author_user_id?: string | null;
    user_id?: string | null;
};

type Props = {
    items: ContentItem[];
    currentUser: any;
    type: "articles" | "blogs" | "survivors";
    onDelete: (id: string, type: "articles" | "blogs" | "survivors") => void | Promise<void>;
    loading: boolean;
};

export function AdminContentPanel(props: Props) {
    const { items, currentUser, type, onDelete, loading } = props;
    const [search, setSearch] = useState("");
    const router = useRouter();

    const filteredItems = useMemo(() => {
        const visibleItems = items.filter(item => !item.hidden && !item.deleted);
        const term = search.toLowerCase().trim();
        if (!term) return visibleItems;
        return visibleItems.filter(
            (item) =>
                item.title.toLowerCase().includes(term) ||
                item.slug.toLowerCase().includes(term) ||
                item.author_name?.toLowerCase().includes(term)
        );
    }, [search, items]);

    const cardClass = "rounded-[44px] border border-white/10 backdrop-blur shadow-2xl text-white relative overflow-hidden transition-all duration-300 hover:border-white/20 isolation-isolate group/card admin-card";
    const inputClass = "bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all";

    const getIcon = () => {
        switch (type) {
            case "articles": return FileText;
            case "blogs": return MessageSquare;
            case "survivors": return Heart;
            default: return FileText;
        }
    };
    const Icon = getIcon();

    const getEditUrl = (id: string) => {
        switch (type) {
            case "articles": return `/admin/docs/${id}/edit`;
            case "blogs": return `/blogs/dashboard?id=${id}`;
            case "survivors": return `/admin/survivor-stories/${id}/edit`; // Assuming this path exists or will be created
            default: return "#";
        }
    };

    return (
        <section className="space-y-6">
            {/* Search Header */}
            <div className="relative overflow-hidden isolation-isolate rounded-[44px] border border-white/10 bg-white/[0.02] backdrop-blur-md">
                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 relative z-10 w-full">
                    <div className="flex-1 relative">
                        <input
                            className={`${inputClass} w-full`}
                            placeholder={`Search ${type}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="text-xs text-white/30 font-medium px-4">
                        Showing {filteredItems.length} {type}
                    </div>
                </div>
            </div>

            {loading && items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="h-12 w-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-sm text-white/40 animate-pulse">Scanning archive...</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-20 rounded-[44px] border border-dashed border-white/10 bg-white/[0.01]">
                    <Icon size={48} className="mx-auto text-white/5 mb-4" />
                    <p className="text-white/40 font-medium">No results found in {type}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredItems.map((item) => {
                        const isHidden = item.hidden || item.deleted;
                        const canEdit = Boolean(currentUser?.admin_access || item.author_user_id === currentUser?.id || item.user_id === currentUser?.id);
                        const authorLabel = item.author_name || item.author_username || "—";
                        const displayDate = item.created_at ? new Date(item.created_at).toLocaleDateString() : "—";

                        return (
                            <motion.article
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${cardClass} flex flex-col p-7 ${isHidden ? 'opacity-60' : ''}`}
                                style={{ "--card-radius": "44px" } as React.CSSProperties}
                            >
                                <div className="cardGlass-tint" />
                                <div className="glass-noise" />
                                <div className="cardGlass-borders pointer-events-none" />
                                <div className="cardGlass-shine pointer-events-none" />

                                {/* Top Row: Title + Author Block */}
                                <div className="relative z-10 flex justify-between items-start gap-4 mb-4">
                                    {/* Left: Title + Slug Pill + ID */}
                                    <div className="flex-1 min-w-0">
                                        <h3 
                                            className="text-2xl font-extrabold font-tttravelsnext uppercase leading-tight tracking-tight text-white transition-colors mb-2 group-hover/card:text-[var(--hover-heading-color)]"
                                            style={type === "articles" ? { "--hover-heading-color": (item.color || item.colour || "#d8b4fe") } as React.CSSProperties : {}}
                                        >
                                            {item.title}
                                        </h3>
                                        <span className="inline-block px-3 py-0.5 rounded-full border border-white/15 bg-white/5 text-[11px] font-mono text-white/55 mb-2">
                                            {item.slug}
                                        </span>
                                        <p className="text-[10px] font-mono text-white/30 leading-snug mt-1">
                                            ID: {item.id}
                                        </p>
                                    </div>

                                    {/* Right: Author chip */}
                                    <div className="shrink-0 flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-2.5 border border-white/10 min-w-[180px]">
                                        {item.profilePicture || item.image_url ? (
                                            <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border border-white/20">
                                                <Image
                                                    src={transformSupabaseUrl(item.profilePicture || item.image_url) || ""}
                                                    fill
                                                    className="object-cover"
                                                    alt="author"
                                                    unoptimized
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/40 border border-white/10">
                                                <User size={16} />
                                            </div>
                                        )}
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[9px] uppercase tracking-[0.15em] text-purple-400 font-bold mb-0.5">Author</span>
                                            <span className="text-sm font-semibold text-white truncate">{authorLabel}</span>
                                            <span className="text-[10px] text-white/40">
                                                {type === "articles" ? "Researcher" : type === "blogs" ? "Blogger" : "Survivor"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="relative z-10 h-px w-full bg-white/8 mb-4" />

                                {/* Content Preview Section */}
                                <div className="relative z-10 flex-1">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold mb-2">Content Preview</p>
                                    <div className="text-[13px] text-white/60 font-dmsans leading-relaxed line-clamp-4 whitespace-pre-line">
                                        {item.content?.substring(0, 300)}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="relative z-10 flex items-center gap-3 pt-5 mt-2">
                                    {canEdit && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex">
                                            <button
                                                onClick={() => router.push(getEditUrl(item.id))}
                                                className="relative px-6 py-2.5 rounded-full overflow-hidden backdrop-blur-sm font-dmsans transition-all duration-300 group/btn"
                                            >
                                                <span className="relative z-10 flex items-center gap-2 text-white text-sm font-semibold tracking-wide">
                                                    Open Editor
                                                </span>
                                                <div className="absolute inset-0 liquidGlass-effect pointer-events-none opacity-80 group-hover/btn:opacity-100 transition-opacity"></div>
                                                <div className="absolute inset-0 liquidGlass-tint pointer-events-none opacity-60 group-hover/btn:opacity-80 transition-opacity"></div>
                                                <div className="liquidGlass-shine relative w-[100.8%] h-[100%] !top-[0px] !left-[-1px] opacity-40 group-hover/btn:opacity-60 transition-opacity"></div>
                                            </button>
                                        </motion.div>
                                    )}

                                    {currentUser?.admin_access && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex">
                                            <button
                                                onClick={() => onDelete(item.id, type)}
                                                className="relative px-6 py-2.5 rounded-full overflow-hidden backdrop-blur-sm font-dmsans transition-all duration-300 group/btn"
                                            >
                                                <span className="relative z-10 flex items-center gap-2 text-red-300 text-sm font-semibold tracking-wide group-hover/btn:text-red-200 transition-colors">
                                                    Delete
                                                </span>
                                                <div className="absolute inset-0 liquidGlass-effect pointer-events-none opacity-40 group-hover/btn:opacity-60 transition-opacity" style={{ filter: 'hue-rotate(300deg)' }}></div>
                                                <div className="absolute inset-0 liquidGlass-tint pointer-events-none opacity-30 group-hover/btn:opacity-50 transition-opacity !bg-red-900/20"></div>
                                                <div className="liquidGlass-shine relative w-[100.8%] h-[100%] !top-[0px] !left-[-1px] opacity-20 group-hover/btn:opacity-40 transition-opacity"></div>
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
