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

  React.useEffect(() => {
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
    <div ref={containerRef} className="min-h-screen text-foreground bg-[#2A292F] relative overflow-hidden">
      <DynamicBackgroundHues containerRef={containerRef} baseColor={cardColor} />
      <ScrollProgress className="hidden md:block" />
      <main className="max-w-[80%] md:max-w-5xl mx-auto p-6 relative z-10 mt-32 items-center justify-center self-center">
        <header className="mb-8 text-center">
          <h1
            className="text-4xl md:text-6xl font-wintersolace font-bold leading-tight"
            style={{ color: cardColor }}
          >
            {story.title}
          </h1>
        </header>

        <article
          className={`
              prose
              prose-sm sm:prose-base lg:prose-lg
              relative
              max-w-full sm:max-w-5xl
              dark:prose-invert
              font-dmsans 
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
              <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
              <div className="absolute inset-0 liquidGlass-tint pointer-events-none"></div>
              <div className="liquidGlass-shine relative w-[102.5%] h-[100%] !top-[-0.1px] !left-[-2.3px]"></div>
              <div className="absolute inset-0 liquidGlass-text pointer-events-none"></div>
            </Button>
          </motion.div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="sm:text-3xl text-4xl font-instrumentserifitalic text-[#CDA8E8] text-center mb-8">
              Other Survivor Stories:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r, i) => {
                const colorsleft = colors.filter((c) => c !== cardColor);
                const relatedCardColor = colorsleft[i % colorsleft.length];
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
                          filter: "saturate(0.8) brightness(1)",
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

                        {/* Same translateY animation as main page */}
                        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                          <h3
                            className={`${getTitleFontSize(r.title)} leading-[1] p-2 text-center uppercase font-tttravelsnext font-bold max-w-[250px] mx-auto w-full text-white translate-y-12 group-hover/card:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]`}
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
        )}

        <div className="mt-12">
          <Link
            href="/survivorstories"
            className="text-primary underline font-dmsans text-lg"
          >
            ← Back to Stories
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
