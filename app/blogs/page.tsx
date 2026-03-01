/* eslint react/no-unescaped-entities: "off" */
"use client";
import * as React from "react";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
// import { CardContainer, CardItem } from "@/components/ui/3d-card";
import { motion, MotionConfig, useScroll } from "framer-motion";
import { Eye, Bookmark } from "lucide-react";

const easeSoft = [0.33, 1, 0.68, 1] as const;

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

interface BlogEntry {
  id: string;
  slug: string;
  title: string;
  authorName: string | null;
  content: string | null;
  tags?: string[] | null;
  created_at?: string;
  views?: number | null;
  likes?: number | null;
}

export default function BlogsPage() {
  const [entries, setEntries] = React.useState<BlogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const heroRef = React.useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: heroRef,
    offset: ["start start", "end start"],
  });

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/blogs");
        if (res.ok) {
          const payload = await res.json();
          setEntries(payload?.blogs ?? []);
        }
      } catch (error) {
        console.error("Failed to load blogs", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featuredEntries = React.useMemo<BlogEntry[]>(() => {
    if (entries.length === 0) return [];
    return [...entries];
  }, [entries]);

  const excerptFromContent = (textInput?: string | null, len = 100) => {
    if (!textInput) return null;
    let text = textInput;
    text = text.replace(/^[#>\s\-]*readme[:\s\-]*\n?/i, "");
    text = text.replace(/```[\s\S]*?```/g, "");
    text = text.replace(/!\[[^\]]*\]\([^\)]+\)/g, "");
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
    text = text.replace(/`([^`]*)`/g, "$1").replace(/<[^>]+>/g, "");
    text = text.replace(/^#{1,6}\s*/gm, "").replace(/[*_~]/g, "");
    text = text.replace(/\s+/g, " ").trim();
    if (!text) return null;
    return text.length > len ? text.slice(0, len) + "…" : text.slice(0, len);
  };

  const homePageSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "The Carcino Foundation Blog",
    url: "https://thecarcinofoundation.org/blogs",
    publisher: {
      "@type": "NGO",
      name: "The Carcino Foundation",
    },
    inLanguage: "en-IN",
  };

  React.useEffect(() => {
    if (loading) return;
    const cards = document.querySelectorAll<HTMLElement>(".article-card");
    let maxHeight = 0;
    cards.forEach((card) => {
      card.style.height = "auto";
    });
    cards.forEach((card) => {
      maxHeight = Math.max(maxHeight, card.offsetHeight);
    });
    cards.forEach((card) => {
      card.style.height = `${maxHeight}px`;
    });
  }, [loading, featuredEntries]);

  return (
    <>
      <Script
        id="blog-home-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homePageSchema),
        }}
      />
      <div
        ref={containerRef}
        className=" flex flex-col relative lg:block lg:h-screen w-full overflow-y-scroll overflow-x-hidden items-start gap-20 bg-background hide-scrollbar"
      >
        <MotionConfig transition={{ duration: 1 }}>
          <div
            ref={heroRef}
            className="flex bg-transparent flex-col mb-10 items-center gap-[10rem] justify-center w-full overflow-y-hidden relative lg:static overflow-x-hidden"
          >
            <div className="fixed inset-0 will-change-transform blur-sm">
              <Image
                src={`/blogs-bg.png`}
                height={888}
                width={1440}
                alt="background"
                className="object-cover w-full h-full"
                priority
              />
              <div className="fixed inset-x-0 top-0 h-1/5 bg-gradient-to-b from-black to-transparent" />
            </div>

            <div className="flex z-10 flex-col w-full justify-self-center self-center items-center gap-7 top-0">
              <span className="text-4xl text-[#f8f8f8] lg:text-5xl text-center xl:text-7xl font-wintersolace font-medium max-w-4xl sm:mt-36 mt-40 max-sm:text-4xl max-sm:w-3/5 leading-[109%]">
                Blogs
              </span>
              <span className="font-dmsans text-[#f8f8f8] text-2xl sm:max-w-[40%] sm:-mt-0 w-full text-center max-sm:text-sm max-sm:w-4/5 font-light leading-[109%]">
                A section dedicated to advancements in cancer treatements, lifestyle, global trends and more.
              </span>
            </div>
          </div>

          <div className="z-10 font-dmsans flex flex-col lg:gap-8 md:gap-4 gap-2 items-center text-center lg:text-left justify-start w-full sm:max-w-[90%] mx-auto h-fit lg:px-40 md:px-10 px-6 pb-6 relative">
            <motion.div
              className={
                "relative z-10 grid grid-cols-1 items-stretch gap-8 py-12 w-full max-w-5xl mx-auto"
              }
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              key={loading ? "skeleton" : "cards"}
              variants={staggerContainer}
            >
              {loading ? (
                <div className="col-span-full flex flex-col items-center gap-4 py-16">
                  <motion.div
                    className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary"
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.9,
                      ease: "linear",
                    }}
                    aria-hidden
                  />
                  <span className="text-lg text-muted-foreground">
                    Loading posts...
                  </span>
                </div>
              ) : entries.length === 0 ? (
                <div className="col-span-full text-center text-lg md:text-2xl text-muted-foreground pt-10">
                  No posts found.
                </div>
              ) : (
                featuredEntries.map((entry, idx) => {
                  const formattedDate = entry.created_at
                    ? new Date(entry.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                    : "";

                  return (
                    <Link
                      key={entry.id}
                      href={entry.slug ? `/blogs/${entry.slug}` : `/blogs/${entry.id}`}
                      className="block group"
                    >
                      <motion.div
                        className="relative overflow-hidden rounded-[44px] p-[1px] bg-white/5 hover:bg-white/10 transition-colors duration-500"
                        layout
                        whileHover={{ scale: 1.01 }}
                        variants={{
                          hidden: { opacity: 0, y: 12 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.55, ease: easeSoft },
                          },
                        }}
                      >
                        <div className="relative overflow-hidden rounded-[44px] p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-8 isolate min-h-[220px]">
                          {/* Card Glass Internal Layers */}
                          <div className="cardGlass-tint pointer-events-none" />
                          <div className="glass-noise pointer-events-none" />
                          <div className="cardGlass-borders pointer-events-none" />
                          <div className="cardGlass-shine pointer-events-none" />

                          {/* Left Side: Metadata */}
                          <div className="flex-1 flex flex-col justify-center text-left relative z-10 w-full sm:w-auto">
                            <span className="text-white/40 text-[12px] sm:text-sm font-dmsans mb-2 block font-normal tracking-wide">
                              by {entry.authorName || "The Carcino Foundation"}
                            </span>
                            <h3 className="text-xl sm:text-3xl md:text-3xl font-bold text-white mb-2 sm:mb-4 leading-tight font-tttravelsnext tracking-tight group-hover:text-purple-300 transition-colors duration-300">
                              {entry.title}
                            </h3>
                            <p className="text-white/50 text-sm sm:text-base md:text-lg font-dmsans mb-4 sm:mb-6 line-clamp-2 max-w-2xl font-light leading-relaxed">
                              {excerptFromContent(entry.content, 180) ?? "Dive into this article to learn more about the latest developments in cancer research."}
                            </p>
                            <span className="text-white/40 text-[12px] sm:text-sm font-dmsans font-normal">
                              {formattedDate || "February 14, 2026"}
                            </span>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="inline-flex items-center gap-1 text-white/30 text-[11px] sm:text-xs font-dmsans">
                                <Eye className="w-3.5 h-3.5" />
                                {entry.views ?? 0}
                              </span>
                              <span className="inline-flex items-center gap-1 text-white/30 text-[11px] sm:text-xs font-dmsans">
                                <Bookmark className="w-3.5 h-3.5" />
                                {entry.likes ?? 0}
                              </span>
                            </div>
                          </div>

                          {/* Right Side: Dummy Image */}
                          <div className="w-full sm:w-64 h-48 sm:h-44 shrink-0 relative rounded-[44px] overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-500 z-10">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-10" />
                            <Image
                              src={`/logo.png`}
                              alt="Blog illustration"
                              fill
                              className="object-contain opacity-40 group-hover:opacity-100 transition-opacity duration-700 grayscale group-hover:grayscale-0 p-10"
                              unoptimized
                            />
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })
              )}
            </motion.div>
          </div>
        </MotionConfig>
      </div>
    </>
  );
}
