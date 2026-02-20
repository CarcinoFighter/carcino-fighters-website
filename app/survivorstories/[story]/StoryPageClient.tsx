"use client";

import React, { useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Footer } from "@/components/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import type {
  SurvivorStory,
  SurvivorStorySummary,
} from "@/lib/survivorStoriesRepository";

interface StoryPageClientProps {
  story: SurvivorStory;
  related: (SurvivorStorySummary & { image_url?: string | null })[];
  cardColor: string;
}

function MDImage({ src, alt }: { src?: string; alt?: string }) {
  const [ok, setOk] = useState(true);
  if (!src) return null;
  if (!ok)
    return (
      <img
        src={src}
        alt={alt}
        className="rounded-lg shadow-lg my-8 max-w-full overflow-hidden h-auto w-full object-cover"
      />
    );
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

export default function StoryPageClient({
  story,
  related: relatedProp,
  cardColor,
}: StoryPageClientProps) {
  const [expanded, setExpanded] = useState(false);
  const [related, setRelated] =
    useState<(SurvivorStorySummary & { image_url?: string | null })[]>(
      relatedProp,
    );

  // Fetch full story data (including image_url) the same way the main menu does
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/survivor-stories");
        if (res.ok) {
          const payload = await res.json();
          const allStories: (SurvivorStorySummary & {
            image_url?: string | null;
          })[] = payload?.stories ?? [];
          const relatedIds = new Set(relatedProp.map((r) => r.id));
          const enriched = allStories.filter((s) => relatedIds.has(s.id));
          if (enriched.length > 0) setRelated(enriched);
        }
      } catch (e) {
        // silently fall back to relatedProp
      }
    })();
  }, []);

  return (
    <div className="min-h-screen text-foreground bg-[#2A292F] relative overflow-hidden">
      {/* Decorative radial gradient orb */}
      <div
        style={{
          position: "absolute",
          left: -800,
          top: -700,
          width: 1600,
          height: 1600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${cardColor}55 0%, transparent 60%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -800,
          top: -200,
          width: 1600,
          height: 1600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${cardColor}55 0%, transparent 55%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <ScrollProgress className="hidden md:block" />
      <main className="max-w-4xl mx-auto p-6 relative z-10 mt-32">
        <header className="mb-8 text-center">
          <h1
            className="text-4xl md:text-6xl font-wintersolace font-bold leading-tight"
            style={{ color: cardColor }}
          >
            {story.title}
          </h1>
          {/* <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <Avatar className="w-12 h-12">
              <AvatarImage src={story.avatarUrl || "/logo.png"} />
              <AvatarFallback>
                {(story.authorName || "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="font-semibold">
                {story.authorName ?? "Unknown"}
              </div>
              {story.authorBio && (
                <div className="text-xs text-muted-foreground">
                  {story.authorBio}
                </div>
              )}
            </div>
          </div> */}
        </header>

        <article
          className={`
              prose
              prose-sm sm:prose-base lg:prose-lg
              relative
              max-w-full sm:max-w-4xl
              dark:prose-invert
              font-dmsans
              ${expanded ? "" : "max-h-[50vh] sm:max-h-[60vh] overflow-hidden"}
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
                <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
              ),
              h2: (props) => (
                <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />
              ),
              h3: (props) => (
                <h3 className="text-xl font-bold mt-6 mb-3" {...props} />
              ),
              p: (props) => (
                <p className="mb-4 last:mb-0 leading-relaxed" {...props} />
              ),
              a: (props) => (
                <a
                  className="text-primary hover:text-primary/80 underline"
                  {...props}
                />
              ),
              ul: (props) => (
                <ul className="list-disc list-inside my-4" {...props} />
              ),
              ol: (props) => (
                <ol className="list-decimal pl-6 my-4 space-y-1" {...props} />
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
                  className="bg-muted p-4 rounded-lg overflow-x-auto my-4"
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

              {/* Liquid glass layers */}
              <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
              <div className="absolute inset-0 liquidGlass-tint pointer-events-none"></div>
              <div className="liquidGlass-shine  relative w-[102.5%] h-[100%] !top-[-0.1px] !left-[-2.3px]"></div>
              <div className="absolute inset-0 liquidGlass-text pointer-events-none"></div>
            </Button>
          </motion.div>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">More stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((r, i) => {
              const colors = [
                "#E39E2E",
                "#64A04B",
                "#4145ca",
                "#9E8DC5",
                "#7F2D3F",
                "#818181",
              ];
              const relatedCardColor = colors[i % colors.length];
              const backgroundImage = r.image_url || "/sfs_bg.png";

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
                      }}
                      className="
                        relative
                        group/card
                        vision-pro-ui-hoverable
                        w-full h-[180px]
                        flex flex-col justify-center
                        rounded-[32px]
                        overflow-hidden isolation-isolate liquid-glass !shadow-none
                        select-none bg-cover
                      "
                    >
                      <div
                        className="storyGlass-tint pointer-events-none"
                        style={{ backgroundColor: relatedCardColor }}
                      />
                      <div className="cardGlass-borders pointer-events-none" />
                      <div className="cardGlass-shine pointer-events-none" />
                      <div className="liquidGlass-text pointer-events-none" />

                      <div className="relative z-10 flex flex-col items-center gap-2 p-4 w-full justify-center">
                        <h3
                          className={`${getTitleFontSize(r.title)} leading-[1] p-2 text-center uppercase font-tttravelsnext font-bold max-w-[220px] mx-auto w-full text-white`}
                        >
                          {r.title}
                        </h3>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-12">
          <Link href="/survivorstories" className="text-primary underline">
            ← Back to Stories
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
