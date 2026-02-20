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
  related: SurvivorStorySummary[];
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
  related,
  cardColor,
}: StoryPageClientProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="min-h-screen text-foreground bg-[#2A292F] relative overflow-hidden">
      {/* Decorative radial gradient orb */}
      <div
        style={{
          position: "absolute",
          left: -900,
          top: -800,
          width: 1800,
          height: 1800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${cardColor}55 0%, transparent 60%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -500,
          top: 0,
          width: 1500,
          height: 1500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${cardColor}55 0%, transparent 60%)`,
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
          <h2 className="text-2xl font-semibold mb-4">More stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={
                  r.slug
                    ? `/survivorstories/${r.slug}`
                    : `/survivorstories/${r.id}`
                }
                className="block p-4 rounded-lg bg-muted/20 hover:bg-muted/30"
              >
                <div className="font-bold uppercase text-sm">{r.title}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  by {r.authorName ?? "Unknown"}
                </div>
              </Link>
            ))}
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
