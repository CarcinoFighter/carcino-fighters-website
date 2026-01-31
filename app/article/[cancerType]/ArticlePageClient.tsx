"use client";

import { useState, type ImgHTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Footer } from "@/components/footer";
import type { ArticleWithAvatar, ArticleSummary } from "@/lib/docsRepository";

interface ArticlePageClientProps {
  article: ArticleWithAvatar;
  moreArticles: ArticleSummary[];
}
const easeSoft = [0.33, 1, 0.68, 1] as const;
export function ArticlePageClient({ article, moreArticles }: ArticlePageClientProps) {
  const [readmore, setReadmore] = useState(false);
  // const firstCardRef = useRef<HTMLDivElement | null>(null);
  const authorLabel = article.author ?? "Unknown Author";
  const positionLabel = article.position ?? "";

  return (
    <div>
      <div className="w-full px-5 sm:px-20 sm:pt-[80px] relative gap-6 bg-background font-giest min-h-screen overflow-x-hidden">
        <ScrollProgress className="hidden md:block" />
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
                className="  text-5xl leading-[0.9]
  sm:text-6xl sm:leading-[0.9]
  lg:text-7xl lg:leading-[0.9] whitespace-pre-wrap
  text-center font-wintersolace font-bold
  bg-gradient-to-r from-[#70429b] from-8% to-[#dfcbf0] to-60%
  bg-clip-text text-transparent py-4 px-10">
                {article.title}
              </h1>

              <div className="
  flex flex-wrap items-center justify-center
  gap-1 sm:gap-2
  py-6 sm:py-10
  text-center font-inter
">
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
            </div>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col w-full px-3 pt-12"
          >
            <div className="relative max-w-4xl mx-auto px-2 sm:px-0 overflow-hidden">
              <article
                className={`
  prose
  prose-sm sm:prose-base lg:prose-lg
  relative
  max-w-full sm:max-w-4xl
  dark:prose-invert
  ${readmore ? "" : "max-h-[50vh] sm:max-h-[60vh] overflow-hidden"}
`}

              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: (props) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                    h2: (props) => <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />,
                    h3: (props) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
                    p: (props) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
                    a: (props) => (
                      <a className="text-primary hover:text-primary/80 underline" {...props} />
                    ),
                    ul: (props) => <ul className="list-disc list-inside my-4" {...props} />,
                    ol: (props) => <ol className="list-decimal pl-6 my-4 space-y-1" {...props} />,
                    blockquote: (props) => (
                      <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4" {...props} />
                    ),
                    code: (props) => (
                      <code className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded" {...props} />
                    ),
                    pre: (props) => (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4" {...props} />
                    ),
                    img: (props: ImgHTMLAttributes<HTMLImageElement>) => {
                      const src = typeof props.src === "string" ? props.src : undefined;
                      if (!src) return null;
                      const alt = props.alt ?? "";
                      return (
                        <Image
                          src={src}
                          alt={alt}
                          width={1200}
                          height={800}
                          sizes="(max-width: 768px) 100vw, 800px"
                          className="rounded-lg shadow-lg my-8 max-w-full overflow-hidden h-auto"
                        />
                      );
                    },
                  }}
                >
                  {article.content}
                </ReactMarkdown>

                <div className={`absolute bottom-0 left-0 right-0 h-[80%]
                  bg-gradient-to-t from-background to-transparent
                  ${readmore ? "hidden" : ""}`} />
              </article>

              <Button
                variant="secondary"
                aria-expanded={readmore}
                onClick={() => setReadmore((s) => !s)}
                className="mx-auto w-fit my-10 rounded-full bg-primary/44 backdrop-blur-xs flex justify-center"
              >
                {readmore ? "Show less" : "Read more"}
                <ArrowDown className={`transition-transform ${readmore ? "rotate-180" : ""}`} />
              </Button>
            </div>

            {/* AUTHOR SECTION */}
            <div className="flex flex-col gap-10 mt-20 items-center ">
              <h2 className="sm:text-3xl text-4xl font-instrumentserifitalic bg-gradient-to-r
  from-[#b793d8] from-8%
  to-[#ffffff] to-60%
  bg-clip-text text-transparent ">
                About the Author
              </h2>
              <div className="relative text-left flex flex-col sm:flex-row gap-6  p-5 rounded-[44px] overflow-hidden ">


                <div className=" divGlass-effect pointer-events-none z-0  "></div>
                <div className=" divGlass-tint pointer-events-none z-0 "></div>
                <div className=" divGlass-shine pointer-events-none z-0 relative opacity-70"></div>


                <Avatar className="w-20 h-20 relative z-10 mx-auto sm:mx-0">
                  <AvatarImage src={article.profilePicture || "/logo.png"} />
                  <AvatarFallback>{authorLabel.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="max-w-[500px] flex flex-col gap-1 p-2 relative z-10 items-center sm:items-start">
                  <h3 className="text-[26px] uppercase font-tttravelsnext leading-[20px] font-bold text-center sm:text-left">
                    {authorLabel}
                  </h3>

                  <p className="uppercase text-[13px] leading-[30px]  text-[#C1C1C1]">{positionLabel}</p>
                </div>

                <p className="text-sm text-[#CDA8E8] leading-[15px] p-5 relative z-10 sm:pr-15 ">
                  {article.authorDescription || "Researcher at The Carcino Foundation."}
                </p>
              </div>

            </div>


            <div className="flex flex-col gap-8 mt-24 items-center">
              <h2 className="sm:text-3xl text-4xl font-instrumentserifitalic bg-gradient-to-r
  from-[#b793d8] from-8%
  to-[#ffffff] to-60%
  bg-clip-text text-transparent">Suggested Articles</h2>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center
w-full max-w-screen-sm sm:max-w-none mx-auto px-4
">
                {moreArticles.map((a) => (
                  <Link
                    key={a.id}
                    href={a.slug ? `/article/${a.slug}` : `/article/${a.id}`}
                    className="w-full max-w-lg sm:w-auto h-full block"
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
                      <CardContainer className="w-full h-full px-4 rounded-[44px]">
                        <CardBody
                          className="
                            article-card
                            relative z-20
                            group/card
                            vision-pro-ui-hoverable
                            w-full h-full min-h-[260px]
                            py-5
                            flex flex-col justify-center
                            rounded-[44px]
                            bg-background/30
                            bg-gradient-to-br from-[#9875c1]/25 via-[#9875c1]/5 to-transparent
                            backdrop-blur-xl backdrop-saturate-150
                            border border-accent shadow-xl
                            overflow-hidden
                            select-none
                          "
                        >
                          <CardItem
                            translateZ="20"
                            className="
                              relative z-10
                              flex flex-col items-center gap-2
                              rounded-[44px]
                              pointer-events-none
                            "
                          >
                            <div className="lowercase text-[20px] sm:text-[26px] font-medium font-instrumentserifitalic text-[#CDA8E8]">
                              Research Article
                            </div>

                            <h3 className="text-[25px] sm:text-[35px] leading-[20px] sm:leading-[30px] p-2 text-center uppercase font-tttravelsnext font-bold line-clamp-7">
                              {a.title}
                            </h3>

                            <p className="text-[15px] sm:text-[20px] text-center text-[#CDA8E8]">
                              by {a.author ?? "Unknown Author"}
                            </p>
                          </CardItem>

                          <div className="divGlass-effect pointer-events-none z-0" />
                          {/* <div className="cardGlass-shine pointer-events-none z-0 overflow-hidden" /> */}
                        </CardBody>
                      </CardContainer>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
