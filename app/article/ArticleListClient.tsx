"use client";

import { useMemo, useState, useEffect } from "react";
import Script from "next/script";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Search } from "lucide-react";
import type { Article } from "@/lib/docsRepository";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Input } from "@/components/ui/input";

interface ArticleListClientProps {
  articles: Article[];
}

export function ArticleListClient({ articles }: ArticleListClientProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    const qTrim = debouncedQuery.trim();
    if (!qTrim) return articles;
    const q = qTrim.toLowerCase();

    return articles.filter((a) => {
      const words = a.title
        .split(/\s+/)
        .map((w) => w.replace(/^[^\w']+|[^\w']+$/g, "").toLowerCase())
        .filter(Boolean);

      return words.some((w) => w.startsWith(q));
    });
  }, [articles, debouncedQuery]);

  const articleGallerySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Research Articles – The Carcino Foundation",
    url: "https://carcinofoundation.org/article",
    about: {
      "@type": "NGO",
      name: "The Carcino Foundation",
    },
    hasPart: articles.map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      url: `https://carcinofoundation.org/article/${article.slug}`,
      publisher: {
        "@type": "NGO",
        name: "The Carcino Foundation",
      },
    })),
  } as const;

  return (
    <>
      <Script
        id="article-gallery-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleGallerySchema),
        }}
      />
      <div
        className="flex flex-col min-h-screen overflow-scroll relative"
        style={{
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(314deg, transparent 40%, #2A2134 78.5%), linear-gradient(0deg, #000 30%, #2A2134 100%)",
          position: "absolute",
          zIndex: 0,
        }}
      >
        <div className="w-full h-full min-h-screen font-giest flex flex-col relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full from-primary/10 to-background pt-[80px]"
          >
            <div className="max-w-4xl flex flex-col gap-2 mx-auto px-6 text-center items-center py-10">
              <h1 className="text-4xl leading-[0.9]
  sm:text-6xl sm:leading-[0.9]
  lg:text-7xl lg:leading-[0.9] whitespace-nowrap
  text-center font-wintersolace
  text-white py-8 px-4 sm:px-10">
                Research <br className="sm:hidden" /> Articles
              </h1>
              <p className="text-lg text-muted-foreground font-dmsans mb-8 leading-[120%]">
                With extensive hard work and highly strenuous fact checking, by our Writing Team has led us to offer you a selection of curated articles.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 px-4 pb-4"
          >
            <div className="max-w-4xl w-full mx-auto col-span-full px-6 mb-8">
              <div className="relative liquid-glass rounded-full overflow-hidden isolation-isolate !shadow-none">
                <div className="liquidGlass-effect pointer-events-none"></div>
                {/* <div className="liquidGlass-tint pointer-events-none"></div> */}
                <div className="liquidGlass-shine pointer-events-none"></div>
                <div className="liquidGlass-text pointer-events-none"></div>

                <div className="relative z-10 w-full flex flex-row justify-start items-center font-dmsans gap-2 px-6 py-2">
                  <Search className="text-[#CDA8E8]" size={20} />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="bg-transparent border-none focus-visible:ring-0 text-white !text-[20px] placeholder:!text-[20px] placeholder:text-[#CDA8E8]/70 w-full h-14 shadow-none"
                  />
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="col-span-full text-center text-lg text-muted-foreground">
                No articles match your search.
              </div>
            ) : (
              filtered.map((article) => {
                const getTitleFontSize = (title: string) => {
                  const words = title.split(/\s+/);
                  const maxWordLength = Math.max(...words.map(w => w.length));

                  // Priority 1: Longest word must fit
                  if (maxWordLength > 12) return "text-[14px] sm:text-[18px]"; // Very long word
                  if (maxWordLength >= 9) return "text-[18px] sm:text-[22px]"; // Moderately long word

                  // Priority 2: Total length
                  if (title.length > 35) return "text-[16px] sm:text-[20px]";
                  if (title.length >= 15) return "text-[18px] sm:text-[24px]";
                  return "text-[22px] sm:text-[30px]";
                };

                return (
                  <Link
                    key={article.id}
                    href={article.slug ? `/article/${article.slug}` : `/article/${article.id}`}
                    className="h-full block"
                  >
                    <motion.div
                      className="h-full"
                      whileHover={{ y: -4, scale: 1.015 }}
                      transition={{ duration: 0.3 }}
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
                              Research Article
                            </div>

                            <h3 className={`${getTitleFontSize(article.title)} leading-[1] p-2 text-center uppercase font-tttravelsnext font-bold max-w-[220px] mx-auto w-full text-white`}>
                              {article.title}
                            </h3>

                            <p className="text-[14px] sm:text-[18px] text-center text-[#CDA8E8] group-hover/card:text-white transition-colors duration-300 font-dmsans w-full font-light">
                              by {article.author ?? "Unknown Author"}
                            </p>
                          </CardItem>
                        </CardBody>
                      </CardContainer>
                    </motion.div>
                  </Link>
                );
              })
            )}
          </motion.div>
        </div>
      </div >
    </>
  );
}
