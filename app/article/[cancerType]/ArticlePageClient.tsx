"use client";

import { useState, useRef, type ImgHTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Footer } from "@/components/footer";
import { DynamicBackgroundHues } from "@/components/ui/dynamic-background-hues";
import LikeButton from "@/components/LikeButton";
import { Eye } from "lucide-react";
import type { ArticleWithAvatar, ArticleSummary } from "@/lib/docsRepository";
import { useEffect } from "react";

interface ArticlePageClientProps {
  article: ArticleWithAvatar;
  moreArticles: ArticleSummary[];
}
const easeSoft = [0.33, 1, 0.68, 1] as const;

function MarkdownImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return null;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={800}
      sizes="(max-width: 768px) 100vw, 800px"
      className="rounded-lg shadow-lg my-8 max-w-full overflow-hidden h-auto"
      onError={() => setError(true)}
    />
  );
}

export function ArticlePageClient({ article, moreArticles }: ArticlePageClientProps) {
  const [readmore, setReadmore] = useState(false);
  // const firstCardRef = useRef<HTMLDivElement | null>(null);
  const authorLabel = article.author ?? "Unknown Author";
  const positionLabel = article.position ?? "";
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [initialLiked, setInitialLiked] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    // Record view
    fetch("/api/blogs/interact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        action: "view", 
        blogId: article.id, 
        source: article.source || 'community', 
        content_type: "cancer_doc" 
      }),
    }).catch(() => { });

    // Check auth status
    fetch(`/api/blogs/interact?blogId=${article.id}&source=${article.source || 'community'}&content_type=cancer_doc`)
      .then((r) => r.json())
      .then((data) => {
        setIsAuthenticated(!!data.authenticated);
        setUserId(data.userId ?? null);
        setInitialLiked(!!data.liked);
        setIsBanned(!!data.isBanned);
      })
      .catch(() => { });
  }, [article.id]);

  // Re-use the fadeUp variant from blogs for the button
  const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: easeSoft },
    },
  };

  const getMainTitleFontSize = (title: string) => {
    if (title.length > 50) return "text-2xl sm:text-4xl md:text-5xl lg:text-6xl";
    if (title.length > 30) return "text-3xl sm:text-5xl md:text-6xl lg:text-7xl";
    return "text-4xl sm:text-6xl lg:text-7xl";
  };

  return (
    <div ref={containerRef} className="relative w-full bg-[#2A292F] font-giest min-h-screen overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
          ::selection {
            background: ${article.color || '#70429b'};
            color: white;
          }
          ::-moz-selection {
            background: ${article.color || '#70429b'};
            color: white;
          }
        `
      }} />
      <DynamicBackgroundHues containerRef={containerRef} baseColor={article.color || undefined} />
      <div className="w-full px-5 sm:px-20 sm:pt-[80px] relative gap-6 z-10">
        <ScrollProgress className="hidden md:block" color={article.color || undefined} />
        <div className="relative pt-10 flex flex-col justify-center ">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full flex gap-5 flex-col sm:flex-row justify-center items-center"
          >
            <div className="sm:hidden">
              <Image src={`/logo.png`} alt="Logo" width={54} height={54} />
            </div>

            <div className="max-w-4xl sm:px-10 sm:overflow-y-visible overflow-x-hidden">
              <h1
                className={`${getMainTitleFontSize(article.title)} leading-[0.9] whitespace-pre-wrap text-center font-wintersolace font-bold py-4 px-4 sm:px-10 bg-clip-text text-transparent break-words [hyphens:auto]`}
                style={{
                  backgroundImage: article.color
                    ? `linear-gradient(to right, ${article.color} 8%, #dfcbf0 60%)`
                    : `linear-gradient(to right, #70429b 8%, #dfcbf0 60%)`
                }}
              >
                {article.title}
              </h1>

              <div className="flex flex-col items-center justify-center gap-2 py-6 sm:py-10 text-center font-inter">
                {(article.authors && article.authors.length > 0) ? (
                  article.authors.map((author, idx) => (
                    <div key={idx} className="flex items-center justify-center gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm">{author.name}</span>
                      {author.position && (
                        <>
                          <span className="text-xs sm:text-sm text-foreground/50">|</span>
                          <span className="text-xs sm:text-sm text-foreground/50">
                            {author.position}
                          </span>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm">{authorLabel}</span>
                    {positionLabel && (
                      <>
                        <span className="text-xs sm:text-sm text-foreground/50">|</span>
                        <span className="text-xs sm:text-sm text-foreground/50">
                          {positionLabel}
                        </span>
                      </>
                    )}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-center sm:justify-center gap-4 px-5 py-3 mt-4">
                  <div className="relative flex items-center gap-4 px-5 py-2 rounded-full overflow-hidden isolate">
                    <div className="liquidGlass-shine relative w-[102.5%] h-[100%] !top-[-0.1px] !left-[-2.3px]"></div>
                    <span className="relative z-10 inline-flex items-center gap-1.5 text-white/40 text-xs sm:text-sm font-dmsans">
                      <Eye className="w-4 h-4" />
                      {(article as any).views ?? 0}
                    </span>
                    <div className="relative z-10">
                      <LikeButton 
                        blogId={article.id} 
                        initialLikes={(article as any).likes ?? 0} 
                        initialLiked={initialLiked} 
                        isAuthenticated={isAuthenticated} 
                        userId={userId} 
                        isBanned={isBanned}
                        source={article.source}
                        content_type="cancer_doc"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center w-full px-4 pt-12"
          >
            <div className="relative w-full max-w-4xl px-4 sm:px-0 overflow-hidden">
              <article
                className={`
  prose
  prose-sm sm:prose-base lg:prose-lg
  relative
  w-full max-w-none sm:max-w-4xl
  dark:prose-invert
  font-dmsans
  break-words [overflow-wrap:anywhere] overflow-hidden
  ${readmore ? "" : "max-h-[50vh] sm:max-h-[60vh] overflow-hidden"}
`}
                style={
                  !readmore
                    ? {
                      maskImage: "linear-gradient(to bottom, black 0%, black 20%, transparent 100%)",
                      WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 20%, transparent 100%)",
                    }
                    : undefined
                }
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: (props) => <h1 className="text-2xl sm:text-3xl font-bold mt-8 mb-4 break-words [overflow-wrap:anywhere]" {...props} />,
                    h2: (props) => <h2 className="text-xl sm:text-2xl font-bold mt-8 mb-4 break-words [overflow-wrap:anywhere]" {...props} />,
                    h3: (props) => <h3 className="text-lg sm:text-xl font-bold mt-6 mb-3 break-words [overflow-wrap:anywhere]" {...props} />,
                    p: (props) => <p className="mb-4 last:mb-0 leading-relaxed break-words [overflow-wrap:anywhere]" {...props} />,
                    a: (props) => (
                      <a className="text-primary hover:text-primary/80 underline break-words [overflow-wrap:anywhere]" {...props} />
                    ),
                    ul: (props) => <ul className="list-disc list-outside ml-6 my-4 space-y-2 break-words [overflow-wrap:anywhere]" {...props} />,
                    li: (props) => <li className="break-words [overflow-wrap:anywhere]" {...props} />,
                    ol: (props) => <ol className="list-decimal list-outside ml-6 my-4 space-y-2 break-words [overflow-wrap:anywhere]" {...props} />,
                    blockquote: (props) => (
                      <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4" {...props} />
                    ),
                    code: (props) => (
                      <code className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded" {...props} />
                    ),
                    pre: (props) => (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4 w-full max-w-full break-normal" {...props} />
                    ),
                    table: (props) => (
                      <div className="my-8 overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                        <table className="min-w-full divide-y divide-white/10" {...props} />
                      </div>
                    ),
                    thead: (props) => <thead className="bg-white/5" {...props} />,
                    th: (props) => (
                      <th className="px-4 py-3 text-left text-xs font-bold text-white/70 uppercase tracking-wider" {...props} />
                    ),
                    td: (props) => (
                      <td className="px-4 py-3 text-sm text-white/50 border-t border-white/5" {...props} />
                    ),
                    img: (props: ImgHTMLAttributes<HTMLImageElement>) => {
                      const src = typeof props.src === "string" ? props.src : undefined;
                      if (!src) return null;
                      return <MarkdownImage src={src} alt={props.alt ?? ""} />;
                    },
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </article>

              <div className="mt-6 flex justify-center w-full">
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -2, scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex"
                >
                  <Button
                    variant="ghost"
                    onClick={() => setReadmore((s) => !s)}
                    className="relative px-7 py-5 rounded-full overflow-hidden backdrop-blur-sm inset-shadow-foreground/10 transition-all duration-300 font-dmsans font-medium hover:scale-[105%] text-white"
                  >
                    <div className="relative z-10 flex items-center gap-2">
                      {readmore ? "Show less" : "Read more"}
                      <ArrowDown className={`transition-transform ml-2 ${readmore ? "rotate-180" : ""}`} />
                    </div>

                    {/* Liquid glass layers matching blogs code */}
                    <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                    <div className="absolute inset-0 liquidGlass-tint pointer-events-none"></div>
                    <div className="liquidGlass-shine relative w-[102.5%] h-[100%] !top-[-0.1px] !left-[-2.3px]"></div>
                    <div className="absolute inset-0 liquidGlass-text pointer-events-none"></div>
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* AUTHOR SECTION */}
            <div className="flex flex-col gap-10 mt-20 items-center ">
              <h2 className="sm:text-3xl text-4xl font-instrumentserifitalic bg-clip-text text-transparent"
                style={{
                  backgroundImage: article.color
                    ? `linear-gradient(to right, ${article.color} 8%, #ffffff 60%)`
                    : `linear-gradient(to right, #b793d8 8%, #ffffff 60%)`
                }}>
                About the {(article.authors && article.authors.length > 1) ? "Authors" : "Author"}
              </h2>
              <div className="relative text-left flex flex-col sm:flex-row gap-6  p-5 rounded-[40px] overflow-hidden ">


                <div className="liquidGlass-effect pointer-events-none !rounded-[40px]"></div>
                <div className="cardGlass-tint pointer-events-none !rounded-[40px]"></div>
                <div className="glass-noise"></div>
                <div className="cardGlass-borders pointer-events-none"></div>
                <div className="cardGlass-shine pointer-events-none"></div>


                <div className="flex flex-col gap-6 relative z-10 w-full">
                  {(article.authors && article.authors.length > 0) ? (
                    article.authors.map((author, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-6 items-center sm:items-start w-full">
                        <div className="relative z-10">
                          <Avatar className="w-20 h-20 shrink-0">
                            <AvatarImage src={author.profilePicture || "/logo.png"} className="object-cover w-full h-full" />
                            <AvatarFallback>{author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 w-full">
                          <div className="flex-1 flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
                            <h3 className="text-[26px] uppercase font-tttravelsnext leading-[20px] font-bold">
                              {author.name}
                            </h3>
                            <p className="uppercase text-[13px] leading-[30px] text-[#C1C1C1]">{author.position}</p>
                          </div>
                          <p className="flex-[1.5] text-sm leading-[20px] sm:pr-15 text-center sm:text-left"
                            style={{ color: '#ffffffff' }}>
                            {author.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                      <div className="relative z-10">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={article.profilePicture || "/logo.png"} className="object-cover w-full h-full" />
                          <AvatarFallback>{authorLabel.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="max-w-[500px] flex flex-col gap-1 p-2 items-center sm:items-start">
                        <h3 className="text-[26px] uppercase font-tttravelsnext leading-[20px] font-bold text-center sm:text-left">
                          {authorLabel}
                        </h3>
                        <p className="uppercase text-[13px] leading-[30px]  text-[#C1C1C1]">{positionLabel}</p>
                      </div>
                      <p className="text-sm leading-[15px] p-5 relative z-10 sm:pr-15"
                        style={article.color ? { color: article.color } : { color: '#CDA8E8' }}>
                        {article.authorDescription || "Researcher at The Carcino Foundation."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>


            

          </motion.div>
        </div>
      </div>
      <div className="flex flex-col gap-8 mt-24 items-center -mx-5 sm:-mx-20 px-4">
              <h2 className="sm:text-3xl text-4xl font-instrumentserifitalic bg-gradient-to-r
  from-[#b793d8] from-8%
  to-[#ffffff] to-60%
  bg-clip-text text-transparent">Suggested Articles</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
                {moreArticles.map((a) => {
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
                      key={a.id}
                      href={a.slug ? `/article/${a.slug}` : `/article/${a.id}`}
                      className="w-full h-full block"
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
                            <div className="cardGlass-tint pointer-events-none opacity-0 group-hover/card:opacity-40 transition-opacity duration-300"
                              style={a.color ? { backgroundColor: a.color } : {}}></div>
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

                              <h3 className={`${getTitleFontSize(a.title)} leading-[1] p-2 text-center uppercase font-tttravelsnext font-bold max-w-[220px] mx-auto w-full text-white`}>
                                {a.title}
                              </h3>

                              <p className="text-[14px] sm:text-[18px] text-center text-[#CDA8E8] group-hover/card:text-white transition-colors duration-300 font-dmsans w-full font-light">
                                by {a.author ?? "Unknown Author"}
                              </p>
                            </CardItem>
                          </CardBody>
                        </CardContainer>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
      <Footer />
    </div>
  );
}
