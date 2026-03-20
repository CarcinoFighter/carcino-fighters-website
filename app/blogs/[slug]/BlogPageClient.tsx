"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import { ArrowDown, Eye } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Footer } from "@/components/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import type { BlogEntry, BlogSummary } from "@/lib/blogsRepository";
import { motion } from "framer-motion";
import { DynamicBackgroundHues } from "@/components/ui/dynamic-background-hues";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

const colors = [
  "#E39E2E",
  "#64A04B",
  "#4145ca",
  "#9E8DC5",
  "#7F2D3F",
  "#818181",
];

interface BlogPageClientProps {
  entry: BlogEntry;
  related: BlogSummary[];
  cardColor: string;
}

function MDImage({ src, alt }: { src?: string; alt?: string }) {
  const [ok, setOk] = useState(true);
  if (!src) return null;
  if (!ok) return null;
  return (
    <Image
      src={src}
      alt={alt ?? ""}
      width={1200}
      height={800}
      sizes="(max-width: 768px) 100vw, 800px"
      className="rounded-lg shadow-lg my-8 max-w-full overflow-hidden h-auto w-full object-cover"
      onError={() => setOk(false)}
    />
  );
}

const easeSoft = [0.33, 1, 0.68, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easeSoft },
  },
};

export default function BlogPageClient({ entry, related, cardColor }: BlogPageClientProps) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [initialLiked, setInitialLiked] = useState(false);

  useEffect(() => {
    // Record view (anonymous)
    fetch("/api/blogs/interact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view", blogId: entry.id }),
    }).catch(() => { });

    // Check auth status
    fetch(`/api/blogs/interact?blogId=${entry.id}`)
      .then((r) => r.json())
      .then((data) => {
        setIsAuthenticated(!!data.authenticated);
        setUserId(data.userId ?? null);
        setInitialLiked(!!data.liked);
      })
      .catch(() => { });
  }, [entry.id]);

  const getMainTitleFontSize = (title: string) => {
    if (title.length > 50) return "text-2xl sm:text-4xl md:text-5xl lg:text-6xl";
    if (title.length > 30) return "text-3xl sm:text-5xl md:text-6xl lg:text-7xl";
    return "text-4xl sm:text-6xl lg:text-7xl";
  };

  return (
    <div ref={containerRef} className="min-h-screen text-foreground bg-[#2A292F] relative overflow-hidden">
      <DynamicBackgroundHues containerRef={containerRef} />
      <ScrollProgress className="hidden md:block" />
      <main className="w-full p-4 sm:p-6 relative z-10 mt-24 sm:mt-32 flex flex-col items-center justify-center self-center">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        <header className="mb-8 text-center px-4">
          <h1
            className={`${getMainTitleFontSize(entry.title)} leading-[0.9] whitespace-pre-wrap text-center font-wintersolace font-bold bg-gradient-to-r from-[#70429b] from-8% to-[#dfcbf0] to-60% bg-clip-text text-transparent py-4 break-words [hyphens:auto]`}
          >
            {entry.title}
          </h1>
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 px-5 py-3 mt-4">
            <span className="text-xs sm:text-sm font-inter text-white/70 text-center sm:text-left">
              {entry.authorName || "The Carcino Foundation"}
            </span>
            {/* Glass slab – view & like only */}
            <div className="relative flex items-center gap-4 px-5 py-2 rounded-full overflow-hidden isolate">
              <div className="liquidGlass-shine relative w-[102.5%] h-[100%] !top-[-0.1px] !left-[-2.3px]"></div>
              <span className="relative z-10 inline-flex items-center gap-1.5 text-white/40 text-xs sm:text-sm font-dmsans">
                <Eye className="w-4 h-4" />
                {entry.views ?? 0}
              </span>
              <div className="relative z-10">
                <LikeButton blogId={entry.id} initialLikes={entry.likes ?? 0} initialLiked={initialLiked} isAuthenticated={isAuthenticated} userId={userId} />
              </div>
            </div>
          </div>
        </header>

        <article
          className={`
              prose
              prose-sm sm:prose-base lg:prose-lg
              relative
              w-full max-w-none sm:max-w-5xl
              dark:prose-invert
              font-dmsans
              break-words [overflow-wrap:anywhere] overflow-hidden
              ${expanded ? "" : "max-h-[60vh] sm:max-h-[80vh] overflow-hidden"}
            `}
          style={
            !expanded
              ? {
                maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
              }
              : undefined
          }
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: (props) => <h1 className="text-2xl sm:text-3xl font-bold mt-8 mb-4 break-words [overflow-wrap:anywhere]" {...props} />,
              h2: (props) => <h2 className="text-xl sm:text-2xl font-bold mt-8 mb-4 break-words [overflow-wrap:anywhere]" {...props} />,
              h3: (props) => <h3 className="text-lg sm:text-xl font-bold mt-6 mb-3 break-words [overflow-wrap:anywhere]" {...props} />,
              p: (props) => <p className="mb-4 last:mb-0 leading-relaxed text-white/80 break-words [overflow-wrap:anywhere]" {...props} />,
              a: (props) => <a className="text-primary hover:text-primary/80 underline break-words [overflow-wrap:anywhere]" {...props} />,
              ul: (props) => <ul className="list-disc list-outside ml-6 my-4 space-y-2 text-white/70 break-words [overflow-wrap:anywhere]" {...props} />,
              li: (props) => <li className="leading-relaxed break-words [overflow-wrap:anywhere]" {...props} />,
              ol: (props) => <ol className="list-decimal list-outside ml-6 my-4 space-y-2 text-white/70 break-words [overflow-wrap:anywhere]" {...props} />,
              blockquote: (props) => <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4 text-white/60 w-full break-words [overflow-wrap:anywhere]" {...props} />,
              code: (props) => <code className="bg-white/5 text-white/90 px-1.5 py-0.5 rounded" {...props} />,
              pre: (props) => <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto my-4 border border-white/10 w-full max-w-full break-normal" {...props} />,
              table: (props) => (
                <div className="my-8 overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                  <table className="min-w-full divide-y divide-white/10" {...props} />
                </div>
              ),
              thead: (props) => <thead className="bg-white/5" {...props} />,
              th: (props) => (
                <th className="px-4 py-3 text-left text-xs font-bold text-white/70 uppercase tracking-wider" {...props} />
              ),
              td: (props) => (
                <td className="px-4 py-3 text-sm text-white/50 border-t border-white/5" {...props} />
              ),
              img: ({ src, alt }) => <MDImage src={typeof src === "string" ? src : undefined} alt={alt} />,
            }}
          >
            {entry.content ?? ""}
          </ReactMarkdown>
        </article>

        <div className="mt-6 flex justify-center">
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -2, scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex"
          >
            <Button
              variant="ghost"
              onClick={() => setExpanded((s) => !s)}
              className="relative px-7 py-5 rounded-full overflow-hidden backdrop-blur-sm inset-shadow-foreground/10 transition-all duration-300 font-dmsans font-medium hover:scale-[105%] text-white"
            >
              <div className="relative z-10 flex items-center gap-2">
                {expanded ? "Show less" : "Read more"}
                <ArrowDown className={`transition-transform ml-2 ${expanded ? "rotate-180" : ""}`} />
              </div>

              {/* Liquid glass layers */}
              <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
              <div className="absolute inset-0 liquidGlass-tint pointer-events-none"></div>
              <div className="liquidGlass-shine relative w-[102.5%] h-[100%] !top-[-0.1px] !left-[-2.3px]"></div>
              <div className="absolute inset-0 liquidGlass-text pointer-events-none"></div>
            </Button>
          </motion.div>
        </div>
        </div>

        <section className="mt-16 w-full max-w-6xl mx-auto px-4">
          <h2 className="sm:text-3xl text-4xl font-instrumentserifitalic text-[#CDA8E8] text-center mb-8">
            More Blogs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {related.map((r, i) => {
              const getTitleFontSize = (title: string) => {
                const words = title.split(/\s+/);
                const maxWordLength = Math.max(...words.map((w) => w.length));
                if (maxWordLength > 12) return "text-[14px] sm:text-[18px]";
                if (maxWordLength >= 9) return "text-[18px] sm:text-[22px]";
                if (title.length > 35) return "text-[16px] sm:text-[20px]";
                if (title.length >= 15) return "text-[18px] sm:text-[24px]";
                return "text-[22px] sm:text-[30px]";
              };

              return (
                <Link
                  key={r.id}
                  href={r.slug ? `/blogs/${r.slug}` : `/blogs/${r.id}`}
                  className="block h-full"
                >
                  <motion.div
                    className="h-full"
                    layout
                    whileHover={{ y: -4, scale: 1.015 }}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.55, ease: easeSoft },
                      },
                    }}
                  >
                    <CardContainer className="w-full h-full px-1 rounded-[40px]">
                      <CardBody
                        className="
                          relative z-20
                          group/card
                          vision-pro-ui-hoverable
                          w-full h-full min-h-[200px]
                          py-3
                          flex flex-col justify-center
                          rounded-[40px]
                          overflow-hidden isolation-isolate liquid-glass !shadow-none
                          backdrop-blur-[30px]
                          select-none
                        "
                      >
                        <div className="liquidGlass-effect pointer-events-none"></div>
                        <div className="cardGlass-tint pointer-events-none"></div>
                        <div className="glass-noise"></div>
                        <div className="cardGlass-borders pointer-events-none"></div>
                        <div className="cardGlass-shine pointer-events-none"></div>
                        <div className="liquidGlass-text pointer-events-none"></div>

                        <CardItem
                          translateZ="20"
                          className="
                            relative z-10
                            flex flex-col items-center gap-2
                            rounded-[40px]
                            pointer-events-none
                            w-full
                          "
                        >
                          <div className="lowercase text-[16px] sm:text-[20px] lg:text-[22px] font-medium font-instrumentserifitalic text-[#CDA8E8] group-hover/card:text-white transition-colors duration-300 text-center w-full">
                            Blog Post
                          </div>

                          <h3 className={`${getTitleFontSize(r.title)} leading-[1] p-2 text-center uppercase font-tttravelsnext font-bold max-w-[220px] mx-auto w-full text-white`}>
                            {r.title}
                          </h3>

                          <p className="text-[14px] sm:text-[18px] text-center text-[#CDA8E8] group-hover/card:text-white transition-colors duration-300 font-dmsans w-full font-light">
                            by {r.authorName || "The Carcino Foundation"}
                          </p>
                        </CardItem>
                      </CardBody>
                    </CardContainer>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-12 flex justify-center">
          <Link href="/blogs" className="text-[#CDA8E8] hover:text-white transition-colors underline-offset-4 font-dmsans">
            ← Back to Blogs
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
