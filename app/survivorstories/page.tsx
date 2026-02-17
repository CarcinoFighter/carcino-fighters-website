/* eslint react/no-unescaped-entities: "off" */
"use client";
import * as React from "react";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import { CardContainer, CardItem } from "@/components/ui/3d-card";
import { Footer } from "@/components/footer";
import { motion, MotionConfig, useScroll } from "framer-motion";
// import { useState } from "react";

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

interface Article {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  content: string;
}

// interface Position {
//   x: number;
//   y: number;
// }

export default function Home() {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const heroRef = React.useRef<HTMLDivElement | null>(null);

  // Parallax: move background slower than scroll within hero section
  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  // const [opacity, setOpacity] = useState<number>(0);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/articles");
        if (res.ok) {
          const docs = await res.json();
          setArticles(docs);
        }
      } catch (error) {
        console.error("Failed to load articles", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featuredArticles = React.useMemo<Article[]>(() => {
    if (articles.length === 0) return [];
    return [...articles];
  }, [articles]);
  const excerptFromContent = (content?: string, len = 100) => {
    if (!content) return null;
    let text = content as string;

    // Remove common README header markers like "# README" or "README" at start
    text = text.replace(/^[#>\s\-]*readme[:\s\-]*\n?/i, "");

    // Remove fenced code blocks
    text = text.replace(/```[\s\S]*?```/g, "");

    // Remove images
    text = text.replace(/!\[[^\]]*\]\([^\)]+\)/g, "");

    // Convert markdown links [text](url) -> text
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");

    // Remove inline code and HTML tags
    text = text.replace(/`([^`]*)`/g, "$1").replace(/<[^>]+>/g, "");

    // Strip remaining markdown headings/emphasis/formatting characters
    text = text.replace(/^#{1,6}\s*/gm, "").replace(/[*_~]/g, "");

    // Collapse whitespace
    text = text.replace(/\s+/g, " ").trim();

    if (!text) return null;
    return text.length > len ? text.slice(0, len) + "…" : text.slice(0, len);
  };
  const homePageSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "The Carcino Foundation",
    url: "https://thecarcinofoundation.org",
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

    // reset heights first
    cards.forEach((card) => {
      card.style.height = "auto";
    });

    // measure tallest
    cards.forEach((card) => {
      maxHeight = Math.max(maxHeight, card.offsetHeight);
    });

    // apply height
    cards.forEach((card) => {
      card.style.height = `${maxHeight}px`;
    });
  }, [loading, featuredArticles]);

  return (
    <>
      <Script
        id="home-schema"
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
                src={`/sfs_bg.png`}
                height={888}
                width={1440}
                alt="background"
                className="object-cover w-full h-full"
                priority
              />
              <div className="fixed inset-x-0 top-0 h-1/5 bg-gradient-to-b from-black to-transparent" />
            </div>

            <div className="flex z-10 flex-col w-full justify-self-center self-center items-center gap-11 top-0">
              <span className="text-4xl text-[#f8f8f8] lg:text-6xl text-center xl:text-8xl font-wintersolace font-medium max-w-4xl sm:mt-36 mt-40 max-sm:text-3xl max-sm:w-3/5 leading-[109%]">
                Stories from Survivors
              </span>
              <span className="font-dmsans text-[#f8f8f8] text-2xl sm:max-w-[40%] sm:-mt-0 w-full text-center max-sm:text-xs max-sm:w-4/5 font-light leading-[109%] tracking-[-2%]">
                A collection of experiences from some of the heroes who won
                their battles against cancer.
              </span>
            </div>
          </div>

          {/* Stories */}
          <div className="z-10 font-giest flex flex-col lg:gap-8 md:gap-4 gap-2 items-center text-center lg:text-left justify-start w-full sm:max-w-[90%] mx-auto h-fit lg:px-40 md:px-10 px-6 pb-6 relative">
            <motion.div
              className={
                "relative z-10 grid grid-cols-1 md:grid-cols-3 items-stretch gap-6 py-6 w-full"
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
                  <span className="font-space_grotesk text-sm text-muted-foreground">
                    Loading stories...
                  </span>
                </div>
              ) : articles.length === 0 ? (
                <div className="col-span-full text-center text-lg text-muted-foreground">
                  No stories found.
                </div>
              ) : (
                featuredArticles.map((article) => {
                  const colors = [
                    "#E39E2E",
                    "#64A04B",
                    "#2E3192",
                    "#9E8DC5",
                    "#7F2D3F",
                    "#818181",
                  ];
                  const images = [
                    "/sfs_bg.png",
                    "/landing/Background.png",
                    "/landing/background_new.png",
                  ];
                  const cardColor =
                    colors[featuredArticles.indexOf(article) % colors.length];
                  const backgroundImage =
                    images[featuredArticles.indexOf(article) % images.length];

                  const getTitleFontSize = (title: string) => {
                    const words = title.split(/\s+/);
                    const maxWordLength = Math.max(
                      ...words.map((w) => w.length),
                    );

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
                      href={
                        article.slug
                          ? `/survivorstories/${article.slug}`
                          : `/survivorstories/${article.id}`
                      }
                      className="h-full block"
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
                        <CardContainer className="w-[350px] h-[202px] px-1 rounded-[40px]">
                          <div
                            style={{
                              backgroundImage: `url('${backgroundImage}')`,
                              backgroundColor: cardColor,
                              backgroundBlendMode: "multiply",
                            }}
                            className="
                              relative z-20
                              group/card
                              vision-pro-ui-hoverable
                              w-full h-full min-h-[200px]
                              flex flex-col justify-center
                              rounded-[40px]
                              overflow-hidden isolation-isolate liquid-glass !shadow-none
                              select-none bg-cover
                            "
                          >
                            <div
                              className="storyGlass-tint pointer-events-none"
                              style={{ backgroundColor: cardColor }}
                            ></div>

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
                                w-full h-full py-10
                              "
                            >
                              <h3
                                className={`${getTitleFontSize(article.title)} leading-[1] p-2 text-center uppercase font-tttravelsnext font-bold max-w-[220px] mx-auto w-full text-white`}
                              >
                                {article.title}
                              </h3>

                              <p className="text-[12px] sm:text-[14px] text-center text-[#FFF9D0] group-hover/card:text-white transition-colors duration-300 font-dmsans w-[80%] font-light leading-none">
                                {excerptFromContent(article.content) ??
                                  "Unknown Author"}
                              </p>
                            </CardItem>
                          </div>
                        </CardContainer>
                      </motion.div>
                    </Link>
                  );
                })
              )}
            </motion.div>
          </div>
        </MotionConfig>

        {/* Footer */}
        <Footer></Footer>
      </div>
    </>
  );
}
