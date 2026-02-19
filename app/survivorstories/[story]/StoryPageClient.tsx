"use client";

import React, { useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Footer } from "@/components/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import type { SurvivorStory, SurvivorStorySummary } from "@/lib/survivorStoriesRepository";

interface StoryPageClientProps {
  story: SurvivorStory;
  related: SurvivorStorySummary[];
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

export default function StoryPageClient({
  story,
  related,
}: StoryPageClientProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollProgress className="hidden md:block" />
      <main className="max-w-4xl mx-auto p-6">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-6xl font-wintersolace font-bold leading-tight">
            {story.title}
          </h1>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <Avatar className="w-12 h-12">
              <AvatarImage src={story.avatarUrl || "/logo.png"} />
              <AvatarFallback>
                {(story.authorName || "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="font-semibold">{story.authorName ?? "Unknown"}</div>
              {story.authorBio && (
                <div className="text-xs text-muted-foreground">{story.authorBio}</div>
              )}
            </div>
          </div>
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

          <div
            className={`absolute bottom-0 left-0 right-0 h-[80%] bg-gradient-to-t from-background to-transparent ${expanded ? "hidden" : ""}`}
          />
        </article>

        <div className="mt-6 flex justify-center">
          <Button variant="secondary" onClick={() => setExpanded((s) => !s)}>
            {expanded ? "Show less" : "Read more"}
            <ArrowDown
              className={`transition-transform ml-2 ${expanded ? "rotate-180" : ""}`}
            />
          </Button>
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
