"use client";
import { getDocBySlugWithAvatar, getAllDocsWithAvatars, ArticleWithAvatar } from "@/lib/docsRepository";
import { useEffect, useMemo, useState, useRef } from "react";
import type { ImgHTMLAttributes } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { ScrollProgress } from "@/components/ui/scroll-progress";


type ArticleData = ArticleWithAvatar;

export default function ArticlePage() {
  const params = useParams();
  const cancerType = params?.cancerType as string | undefined;
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<ArticleWithAvatar[] | null>(null);
  const [readmore, setReadmore] = useState<boolean>(false);

  useEffect(() => {
    const fetchDoc = async () => {
      if (typeof cancerType === "string") {
        try {
          const fetchedDoc = await getDocBySlugWithAvatar(cancerType);
          const fetchedArticles = await getAllDocsWithAvatars();
          setArticle(fetchedDoc);
          setArticles(fetchedArticles);
        } catch (error) {
          console.error("Error fetching article:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (cancerType !== undefined) {
      fetchDoc();
    }
  }, [cancerType]);

  const selected = useMemo(() => {
    if (!articles || articles.length === 0) return [];
    const arr = articles.slice();
    if (article) {
      const idx = arr.findIndex(a => a.id === article.id || a.slug === article.slug);
      if (idx !== -1) arr.splice(idx, 1);
    }
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, Math.min(3, arr.length));
  }, [articles, article]);

  const stickyRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<HTMLDivElement | null>(null);
  const moreArticlesRef = useRef<HTMLHeadingElement | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(Math.min(3, selected.length));

  useEffect(() => {
    if (!stickyRef.current) return;

    const measure = () => {
      const container = stickyRef.current!;
      const containerHeight = container.clientHeight || 0;
      // If we don't have a card measurement yet, default to up to 3
      if (!firstCardRef.current) {
        setVisibleCount(Math.min(3, selected.length));
        return;
      }

      const cardRect = firstCardRef.current.getBoundingClientRect();
      const cardHeight = cardRect.height || 0;

      const style = window.getComputedStyle(container);
      const gapStr = style.columnGap || style.gap || "0px";
      const gap = parseFloat(gapStr) || 0;
      // compute how many (cardHeight + gap) fit into containerHeight
      const count = Math.floor((containerHeight) / (cardHeight + gap));
      const bounded = Math.max(0, Math.min(3, count));
      setVisibleCount(bounded || 0);
    };

    // initial measure after a frame to ensure layout settled
    const raf = requestAnimationFrame(measure);

    // watch for resize of the container
    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(stickyRef.current);

    // watch window resize as well
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [selected]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 pt-[68px] min-h-screen">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="w-full text-foreground text-center py-12 px-4 pt-[68px] min-h-screen">
        <p className="text-lg font-giest">This research is not available</p>
      </div>
    );
  }

  return (
    <div>
    
      <div className="w-screen px-5 sm:px-20 sm:pt-[80px] relative gap-6 sm:flex-row bg-background font-giest min-h-screen">
  <ScrollProgress className="hidden md:block" />
        <div className={`relative pt-10 flex flex-col justify-center`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full flex gap-5 flex-col sm:flex-row justify-between items-center"
          >
            <div className="sm:hidden">
              <Image
                src={`/logo.png`}
                alt="Logo"
                width={54}
                height={54}
              />
            </div>
            <div className="max-w-4xl sm:px-6">
              
              <h1 className="text-6xl/25 text-center sm:text-left sm:text-7xl/30 font-wintersolace sm:font-bold text-foreground">
                {article.title}
                
              </h1>
            </div>
            <div className="flex max-sm:w-full flex-row gap-7 items-center sm:pr-15">
              <div className="flex max-sm:text-xs max-sm:w-full flex-row items-center justify-center sm:flex-col sm:items-end gap-3 sm:gap-1">
                <span>{article.author}</span> 
                <br className="max-sm:hidden" />
                <span className="sm:hidden">|</span>
                <span className="sm:text-xs text-foreground/50">
                  {article.position}
                </span>
              </div>
              <Avatar className="max-sm:hidden scale-140">
                <AvatarImage
                  src={article.profilePicture || "/dummy_image1.png"}
                  className="object-cover"
                  onError={(e) => {
                    console.warn('Hero avatar failed', article?.id, article?.profilePicture);
                    console.warn(e);
                  }}
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`flex pr-0 flex-col sm:flex-row w-full px-6 pt-12 transition-all duration-300 `}
          >
            <div className=" relative">
              <article
                className={`prose relative max-w-4xl prose-lg dark:prose-invert prose-headings:font-giest prose-p:font-giest prose-a:text-primary hover:prose-a:text-primary/80 prose-pre:bg-muted prose-pre:text-muted-foreground ${
                  readmore ? "" : "max-h-[60vh] overflow-hidden"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
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
                      <p className="my-4 leading-relaxed" {...props} />
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
                      <ol
                        className="list-decimal list-inside my-4"
                        {...props}
                      />
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
                    img: (props: ImgHTMLAttributes<HTMLImageElement>) => {
                      const src = typeof props.src === 'string' ? props.src : undefined;
                      if (!src) return null;
                      const alt = props.alt ?? '';
                      return (
                        <Image
                          src={src}
                          alt={alt}
                          width={1200}
                          height={800}
                          sizes="(max-width: 768px) 100vw, 800px"
                          className="rounded-lg shadow-lg my-8 max-w-full h-auto"
                        />
                      );
                    },
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              <div
                className={
                  `absolute bottom-0 left-0 right-0 h-[80%] bg-gradient-to-t from-background to-transparent` +
                  (readmore ? ` hidden` : ``)
                }
              ></div>
              </article>
              <Button
                variant="secondary"
                aria-expanded={readmore}
                onClick={() => setReadmore((s) => !s)}
                className={
                  `mx-auto z-10 w-fit my-10 rounded-full bg-primary/44 backdrop-blur-xs cursor-pointer hover:!bg-primary/44 focus:!bg-primary/44 active:!bg-primary/44 transition-none flex items-center gap-2` +
                  (readmore ? `` : ` `)
                }
              >
                {readmore ? "Show less" : "Read more"}
                <ArrowDown
                  className={`transition-transform ${
                    readmore ? "rotate-180" : ""
                  }`}
                />
              </Button>
               
            </div>

            <div ref={stickyRef} className="sm:ml-auto z-20 flex flex-col gap-4 self-center sm:self-start items-center sticky top-[80px] h-fit max-h-[calc(100vh-169px)] ">
              <div className="flex flex-col gap-4">
                <h2 ref={moreArticlesRef} className="text-center font-geist font-thin text-sm tracking-wide">
                  More Articles
                </h2>
                {selected.slice(0, visibleCount).map((a, idx) => (
                  <Link
                    key={a.id}
                    href={a.slug ? `/article/${a.slug}` : `/article/${a.id}`}
                    className="text-primary flex items-center gap-1 text-sm"
                  >
                    <div ref={idx === 0 ? firstCardRef : undefined} className="w-full">
                      <CardContainer className=" w-full px-4 overflow-hidden">
                        <CardBody className="relative group/card bg-background border-accent w-full h-auto rounded-[55px] p-[30px] px-[45px] border">
                        <div className="flex flex-col gap-4 h-full justify-between">
                          <CardItem
                            translateZ="20"
                            className="flex flex-col gap-2 h-full items-center"
                          >
                            <div className="text-primary  bg-primary/10 px-2 rounded border-primary border/20 w-fit mb-2 text-xs font-medium">
                              Research Article
                            </div>
                            <h3 className="text-lg font-giest text-foreground mb-1 line-clamp-2">
                              {a.title}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <p className=" text-muted-foreground text-sm line-clamp-3">
                                Authored by {a.author}
                              </p>
                            </div>
                            <div className="text-primary flex items-center gap-1 text-sm hover:underline">
                              Read it
                              <ArrowUpRight size={14} />
                            </div>
                          </CardItem>
                        </div>
                      </CardBody>
                    </CardContainer>
                    </div>
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
