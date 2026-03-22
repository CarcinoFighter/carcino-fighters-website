"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import { motion } from "framer-motion";
import { DynamicBackgroundHues } from "@/components/ui/dynamic-background-hues";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Footer } from "@/components/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import LikeButton from "@/components/LikeButton";
import { Eye } from "lucide-react";
import type {
  SurvivorStory,
  SurvivorStorySummary,
} from "@/lib/survivorStoriesRepository";

const colors = [
  "#E39E2E",
  "#64A04B",
  "#5a61f1",
  "#9E8DC5",
  "#7F2D3F",
  "#818181",
];

interface StoryPageClientProps {
  story: SurvivorStory;
  related: (SurvivorStorySummary & { image_url?: string | null })[];
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

function pickRelated(
  all: (SurvivorStorySummary & { image_url?: string | null })[],
  currentId: string,
) {
  const others = all.filter((s) => s.id !== currentId);
  if (others.length <= 3) return others;
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export default function StoryPageClient({
  story,
  related: relatedProp,
  cardColor,
}: StoryPageClientProps) {
  const [expanded, setExpanded] = useState(false);
  const [related, setRelated] = useState<
    (SurvivorStorySummary & { image_url?: string | null })[]
  >(() => pickRelated(relatedProp, story.id));
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [initialLiked, setInitialLiked] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  React.useEffect(() => {
    // Record view
    fetch("/api/blogs/interact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        action: "view", 
        blogId: story.id, 
        source: story.source || 'community', 
        content_type: "survivor_story" 
      }),
    }).catch(() => { });

    // Check auth status
    fetch(`/api/blogs/interact?blogId=${story.id}&source=${story.source || 'community'}&content_type=survivor_story`)
      .then((r) => r.json())
      .then((data) => {
        setIsAuthenticated(!!data.authenticated);
        setUserId(data.userId ?? null);
        setInitialLiked(!!data.liked);
        setIsBanned(!!data.isBanned);
      })
      .catch(() => { });

    (async () => {
      try {
        const res = await fetch("/api/survivor-stories");
        if (res.ok) {
          const payload = await res.json();
          const allStories: (SurvivorStorySummary & {
            image_url?: string | null;
          })[] = payload?.stories ?? [];
          if (allStories.length > 0) {
            setRelated(pickRelated(allStories, story.id));
          }
        }
      } catch (e) {
        // silently fall back to relatedProp
      }
    })();
  }, []);

  const getMainTitleFontSize = (title: string) => {
    if (title.length > 50)
      return "text-2xl sm:text-4xl md:text-5xl lg:text-6xl";
    if (title.length > 30)
      return "text-3xl sm:text-5xl md:text-6xl lg:text-7xl";
    return "text-4xl sm:text-6xl lg:text-7xl";
  };

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
    <div
      ref={containerRef}
      className="min-h-screen text-foreground bg-[#2A292F] relative overflow-hidden"
    >
      <DynamicBackgroundHues
        containerRef={containerRef}
        baseColor={cardColor}
      />
      <ScrollProgress className="hidden md:block" />

      <main className="w-full p-4 sm:p-6 relative z-10 mt-24 sm:mt-32 flex flex-col items-center justify-center self-center">
        {/* Constrained article content */}
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
          <header className="mb-8 text-center">
            <h1
              className={`${getMainTitleFontSize(story.title)} font-wintersolace font-bold leading-tight break-words [hyphens:auto]`}
              style={{ color: cardColor }}
            >
              {story.title}
            </h1>
            <div className="flex flex-col sm:flex-row items-center sm:justify-center gap-4 px-5 py-3 mt-4">
              <div className="relative flex items-center gap-4 px-5 py-2 rounded-full overflow-hidden isolate">
                <div className="liquidGlass-shine relative w-[102.5%] h-[100%] !top-[-0.1px] !left-[-2.3px]"></div>
                <span className="relative z-10 inline-flex items-center gap-1.5 text-white/40 text-xs sm:text-sm font-dmsans">
                  <Eye className="w-4 h-4" />
                  {story.views ?? 0}
                </span>
                <div className="relative z-10">
                  <LikeButton 
                    blogId={story.id} 
                    initialLikes={story.likes ?? 0} 
                    initialLiked={initialLiked} 
                    isAuthenticated={isAuthenticated} 
                    userId={userId} 
                    isBanned={isBanned}
                    source={story.source}
                    content_type="survivor_story"
                  />
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
                    maskImage:
                      "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
                  }
                : undefined
            }
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: (props) => (
                  <h1
                    className="text-2xl sm:text-3xl font-bold mt-8 mb-4 break-words [overflow-wrap:anywhere]"
                    {...props}
                  />
                ),
                h2: (props) => (
                  <h2
                    className="text-xl sm:text-2xl font-bold mt-8 mb-4 break-words [overflow-wrap:anywhere]"
                    {...props}
                  />
                ),
                h3: (props) => (
                  <h3
                    className="text-lg sm:text-xl font-bold mt-6 mb-3 break-words [overflow-wrap:anywhere]"
                    {...props}
                  />
                ),
                p: (props) => (
                  <p
                    className="mb-4 last:mb-0 leading-relaxed break-words [overflow-wrap:anywhere]"
                    {...props}
                  />
                ),
                a: (props) => (
                  <a
                    className="text-primary hover:text-primary/80 underline break-words [overflow-wrap:anywhere]"
                    {...props}
                  />
                ),
                ul: (props) => (
                  <ul
                    className="list-disc list-outside ml-6 my-4 space-y-2 break-words [overflow-wrap:anywhere]"
                    {...props}
                  />
                ),
                li: (props) => (
                  <li
                    className="break-words [overflow-wrap:anywhere]"
                    {...props}
                  />
                ),
                ol: (props) => (
                  <ol
                    className="list-decimal list-outside ml-6 my-4 space-y-2 break-words [overflow-wrap:anywhere]"
                    {...props}
                  />
                ),
                blockquote: (props) => (
                  <blockquote
                    className="border-l-4 border-primary/30 pl-4 italic my-4"
                    {...props}
                  />
                ),
                code: (props) => (
                  <code
                    className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                    {...props}
                  />
                ),
                pre: (props) => (
                  <pre
                    className="bg-muted p-4 rounded-lg overflow-x-auto my-4 w-full max-w-full break-normal"
                    {...props}
                  />
                ),
                table: (props) => (
                  <div className="my-8 overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <table
                      className="min-w-full divide-y divide-white/10"
                      {...props}
                    />
                  </div>
                ),
                thead: (props) => <thead className="bg-white/5" {...props} />,
                th: (props) => (
                  <th
                    className="px-4 py-3 text-left text-xs font-bold text-white/70 uppercase tracking-wider"
                    {...props}
                  />
                ),
                td: (props) => (
                  <td
                    className="px-4 py-3 text-sm text-white/50 border-t border-white/5"
                    {...props}
                  />
                ),
                img: ({ src, alt }) => (
                  <MDImage
                    src={typeof src === "string" ? src : undefined}
                    alt={alt}
                  />
                ),
              }}
            >
              {story.content ?? ""}
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
                className="relative px-7 py-5 rounded-full overflow-hidden backdrop-blur-sm inset-shadow-foreground/10 transition-all duration-300 font-dmsans font-medium hover:scale-[105%]"
              >
                <div className="relative z-10 flex items-center gap-2">
                  {expanded ? "Show less" : "Read more"}
                  <ArrowDown
                    className={`transition-transform ml-2 ${expanded ? "rotate-180" : ""}`}
                  />
                </div>
                <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                <div className="absolute inset-0 liquidGlass-tint pointer-events-none"></div>
                <div className="liquidGlass-shine relative w-[102.5%] h-[100%] !top-[-0.1px] !left-[-2.3px]"></div>
                <div className="absolute inset-0 liquidGlass-text pointer-events-none"></div>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Full-width related stories — outside max-w-5xl constraint */}
        {related.length > 0 && (
          <section className="mt-16 w-full max-w-6xl mx-auto px-4">
            <h2 className="sm:text-3xl text-4xl font-instrumentserifitalic text-[#CDA8E8] text-center mb-8">
              Other Survivor Stories:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {related.map((r, i) => {
                const colorsleft = colors.filter((c) => c !== cardColor);
                const fallbackColor = colorsleft[i % colorsleft.length];
                const relatedCardColor = r.colour || fallbackColor;
                const backgroundImage = r.image_url || "/sfs_bg.png";

                return (
                  <Link
                    key={r.id}
                    href={
                      r.slug
                        ? `/survivorstories/${r.slug}`
                        : `/survivorstories/${r.id}`
                    }
                    className="block h-full"
                  >
                    <motion.div
                      className="h-full"
                      whileHover={{ y: -4, scale: 1.015 }}
                      transition={{ duration: 0.3, ease: easeSoft }}
                    >
                      <div
                        style={{
                          backgroundImage: `url('${backgroundImage}')`,
                          backgroundColor: relatedCardColor,
                          backgroundBlendMode: "multiply",
                          filter:
                            "saturate(1.25) brightness(1.1) contrast(0.75)",
                        }}
                        className="
                          relative
                          group/card
                          vision-pro-ui-hoverable
                          w-full min-h-[200px]
                          flex flex-col justify-center
                          rounded-[44px]
                          overflow-hidden isolation-isolate liquid-glass !shadow-none
                          select-none bg-cover bg-center
                        "
                      >
                        <div
                          className="storyGlass-tint pointer-events-none"
                          style={{ backgroundColor: relatedCardColor }}
                        />
                        <div className="cardGlass-borders pointer-events-none" />
                        <div className="cardGlass-shine pointer-events-none" />
                        <div className="liquidGlass-text pointer-events-none" />

                        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-2 p-6">
                          <h3
                            className={`${getTitleFontSize(r.title)} leading-[1] p-2 text-center uppercase font-tttravelsnext font-bold max-w-[250px] mx-auto w-full text-white relative top-6 sm:top-3 translate-y-8 group-hover/card:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]`}
                          >
                            {r.title}
                          </h3>
                          <p className="text-[15px] sm:text-[17px] font-dmsans font-semibold text-white/90 text-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-100">
                            {r.slug
                              ? r.slug
                                  .split("-")
                                  .map(
                                    (w: string) =>
                                      w.charAt(0).toUpperCase() + w.slice(1),
                                  )
                                  .join(" ")
                              : ""}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-12">
          <Link
            href="/survivorstories"
            className="text-primary underline font-dmsans text-lg pl-3"
          >
            ← Back to Stories
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
