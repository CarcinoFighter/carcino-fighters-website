/* eslint react/no-unescaped-entities: "off" */
"use client";
import * as React from "react";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import { CardContainer, CardItem } from "@/components/ui/3d-card";
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

interface SurvivorStory {
  id: string;
  slug: string;
  title: string;
  authorName: string | null;
  content: string | null;
  image_url?: string | null;
  tags?: string[] | null;
  colour?: string | null;
}

export default function Home() {
  const [stories, setStories] = React.useState<SurvivorStory[]>([]);
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
        const res = await fetch("/api/survivor-stories");
        if (res.ok) {
          const payload = await res.json();
          setStories(payload?.stories ?? []);
        }
      } catch (error) {
        console.error("Failed to load stories", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featuredStories = React.useMemo<SurvivorStory[]>(() => {
    if (stories.length === 0) return [];
    return [...stories];
  }, [stories]);

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
    "@type": "WebSite",
    name: "The Carcino Foundation",
    url: "https://thecarcinofoundation.org",
    publisher: {
      "@type": "NGO",
      name: "The Carcino Foundation",
    },
    inLanguage: "en-IN",
  };

  return (
    <>
      <Script
        id="home-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageSchema) }}
      />
      <div
        ref={containerRef}
        className="flex flex-col relative lg:block lg:h-screen w-full overflow-y-scroll overflow-x-hidden items-start bg-background hide-scrollbar"
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

            <div className="flex z-10 flex-col w-full justify-self-center self-center items-center gap-7 top-0">
              <span className="text-4xl text-[#f8f8f8] lg:text-5xl text-center xl:text-7xl font-wintersolace font-medium max-w-4xl sm:mt-36 mt-40 max-sm:text-4xl max-sm:w-3/5 leading-[109%]">
                Stories from Survivors
              </span>
              <span className="font-dmsans text-[#f8f8f8] text-2xl sm:max-w-[40%] sm:-mt-0 w-full text-center max-sm:text-sm max-sm:w-4/5 font-light leading-[109%]">
                A collection of experiences from some of the heroes who won
                their battles against cancer.
              </span>
            </div>
          </div>

          {/* Stories */}
          <div className="z-10 font-dmsans flex flex-col items-center justify-start w-full max-w-7xl mx-auto px-4 sm:px-6 pb-20 relative">
            <motion.div
              className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch gap-6 w-full"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
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
                    Loading stories...
                  </span>
                </div>
              ) : stories.length === 0 ? (
                <div className="col-span-full text-center text-lg md:text-2xl text-muted-foreground pt-10">
                  No stories found.
                </div>
              ) : (
                featuredStories.map((story, idx) => {
                  const colors = [
                    "#E39E2E",
                    "#64A04B",
                    "#5a61f1",
                    "#9E8DC5",
                    "#7F2D3F",
                    "#818181",
                  ];
                  const defaultImages = [
                    "/sfs_bg.png",
                    "/landing/Background.png",
                    "/landing/background_new.png",
                  ];
                  const cardColor = story.colour || colors[idx % colors.length];
                  const backgroundImage =
                    story.image_url ||
                    defaultImages[idx % defaultImages.length];

                  const getTitleFontSize = (title: string) => {
                    const words = title.split(/\s+/);
                    const maxWordLength = Math.max(
                      ...words.map((w) => w.length),
                    );
                    if (maxWordLength > 12) return "text-[14px] sm:text-[18px]";
                    if (maxWordLength >= 9) return "text-[18px] sm:text-[22px]";
                    if (title.length > 35) return "text-[16px] sm:text-[20px]";
                    if (title.length >= 15) return "text-[18px] sm:text-[24px]";
                    return "text-[22px] sm:text-[30px]";
                  };

                  return (
                    <Link
                      key={story.id}
                      href={
                        story.slug
                          ? `/survivorstories/${story.slug}`
                          : `/survivorstories/${story.id}`
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
                        <CardContainer className="w-full h-full px-1 rounded-[44px]">
                          <div
                            style={{
                              backgroundImage: `url('${backgroundImage}')`,
                              // Desaturate and darken the card color to avoid harsh saturation
                              backgroundColor: cardColor,
                              backgroundBlendMode: "multiply",
                              filter: "saturate(0.8) brightness(1)",
                            }}
                            className="
                              relative z-20
                              group/card
                              vision-pro-ui-hoverable
                              w-full h-full min-h-[200px]
                              flex flex-col justify-center
                              rounded-[44px]
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
                                rounded-[44px]
                                w-full h-full
                              "
                            >
                              {/* translateY-based centering: smooth, no layout shift */}
                              <div className="w-full h-full flex flex-col items-center justify-center p-6">
                                <h3
                                  className={`${getTitleFontSize(story.title)} leading-[1] p-2 text-center uppercase font-tttravelsnext font-bold max-w-[250px] mx-auto w-full text-white translate-y-0 sm:translate-y-14 sm:group-hover/card:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]`}
                                >
                                  {story.title}
                                </h3>
                              </div>
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
      </div>
    </>
  );
}
