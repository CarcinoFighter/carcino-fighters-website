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
          background: "linear-gradient(134deg, #000 41.58%, #2A2134 78.5%)",
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
            <div className="max-w-4xl flex flex-col gap-2 mx-auto px-6 text-center py-10">
              <h1 className="text-2xl md:text-3xl text-foreground font-geist">
                Our Research Articles
              </h1>
              <p className="text-lg text-muted-foreground font-space_grotesk mb-8">
                With extensive hard work and highly strenuous fact checking, by our Writing Team, and our panel of Esteemed Medical Professionals have led us to offer you a selection of curated articles.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 px-6 pb-10"
          >
            <div className="max-w-4xl w-full mx-auto col-span-full px-6">
              <div className="w-full flex flex-row justify-start items-center gap-1">
                <Search className="text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="bg-transparent rounded-full px-5 border border-foreground/10 placeholder:text-muted-foreground w-full"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="col-span-full text-center text-lg text-muted-foreground">
                No articles match your search.
              </div>
            ) : (
              filtered.map((article) => (
                <CardContainer key={article.id} className="w-full">
                  <CardBody className="relative group/card bg-background/20 border-accent w-full h-auto rounded-xl p-6 border flex flex-col justify-between min-h-[260px]">
                    <div className="flex flex-col gap-4 h-full justify-between">
                      <CardItem translateZ="20" className="flex flex-col gap-2 h-full">
                        <div className="text-primary bg-primary/10 px-2 rounded border-primary border/20 w-fit mb-2 text-xs font-medium">
                          Research Article
                        </div>
                        <h2 className="text-lg lg:text-2xl md:text-xl font-giest text-foreground mb-2 line-clamp-2">
                          {article.title}
                        </h2>
                        <p className="md:text-lg font-giest text-muted-foreground line-clamp-3 mb-4">
                          {article.content.replace(/[#*_`>\-\[\]!\(\)]/g, "").slice(0, 120)}...
                        </p>
                      </CardItem>
                      <Link href={`/article/${article.slug}`} className="mt-auto">
                        <p className="text-sm text-primary flex flex-row items-center gap-1 font-medium hover:underline">
                          View Article <ArrowUpRight size={14} />
                        </p>
                      </Link>
                    </div>
                  </CardBody>
                </CardContainer>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
