/* eslint react/no-unescaped-entities: "off" */
"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import * as React from "react";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Award,
  CalendarCheck,
  PaintBucket,
  UserCheck,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Footer } from "@/components/footer";
import { motion, MotionConfig, useScroll, useTransform } from "framer-motion";
// import { useState } from "react";
import ShinyText from "@/components/ShinyText";

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

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easeSoft },
  },
};

const fadeScale = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: easeSoft },
  },
};

const MotionLabel = motion(Label);

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
  const articlesRef = React.useRef<HTMLDivElement | null>(null);
  // Parallax: move background slower than scroll within hero section
  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -300]);
  // Parallax blobs for Articles section
  const { scrollYProgress: articlesProgress } = useScroll({
    container: containerRef,
    target: articlesRef,
    offset: ["start end", "end start"],
  });
  const yBlob1 = useTransform(articlesProgress, [0, 1], [400, -400]);
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

  // React.useEffect(() => {
  //   let idleTimer: number | undefined;

  //   const onPointerMove = (e: PointerEvent) => {
  //     setPosition({ x: e.clientX, y: e.clientY });
  //     setOpacity(0.6);
  //     if (idleTimer) window.clearTimeout(idleTimer);
  //     idleTimer = window.setTimeout(() => setOpacity(0), 1000);
  //   };

  //   // Detect when the pointer leaves the window (relatedTarget === null)
  //   const onMouseOut = (e: MouseEvent) => {
  //     if ((e as MouseEvent).relatedTarget === null) {
  //       setOpacity(0);
  //     }
  //   };

  //   window.addEventListener("pointermove", onPointerMove);
  //   window.addEventListener("mouseout", onMouseOut);

  //   return () => {
  //     window.removeEventListener("pointermove", onPointerMove);
  //     window.removeEventListener("mouseout", onMouseOut);
  //     if (idleTimer) window.clearTimeout(idleTimer);
  //   };
  // }, []);

  const featuredArticles = React.useMemo<Article[]>(() => {
    if (articles.length === 0) return [];
    return [...articles].sort(() => Math.random() - 0.5).slice(0, 6);
  }, [articles]);
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
        {/* <div
        className=" hidden sm:inline fixed inset-0 z-100 opacity-0 transition-opacity duration-500 ease-in-out pointer-events-none"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, #471F77, transparent 10%)`,
        }}
      /> */}

        {/* Mobile Background */}
        {/* <div className="h-[40vh] w-full overflow-hidden fixed left-0 right-0 mx-auto top-0 bg-linear-180 rounded-b-full blur-3xl bg-radial-[at_50%_-50%] from-[#F0F0F0] via-primary-foreground to-[#F0F0F0] dark:from-[#2C2C2C] dark:via-[#471F77] dark:to-[#2C2C2C] lg:hidden animate-blob">
      </div> */}

        <MotionConfig transition={{ duration: 1 }}>
          {/* Main Content */}
          {/* <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="flex flex-row mb-10 items-center gap-[12rem] justify-start w-full h-fit pt-[68px] lg:pt-0 lg:h-[100vh] lg:px-14 md:px-10 px-6 z-10 snap-center"
        >
          <div className="flex flex-col text-center lg:my-auto lg:text-left items-center lg:items-start w-full h-fit lg:max-w-[50%] gap-6">
            <Image
              src="/ribbon_phone.png"
              alt=""
              width={117.56}
              height={150.23}
              quality={100}
              className="object-cover lg:hidden"
            />
            <Label className="border p-3 rounded-full font-space_grotesk text-base text-foreground hidden lg:inline">
              Let's change the world together!
            </Label>
            <ShinyText 
              text={"Touchdown"}
              disabled={false}
              speed={4}
              className="text-4xl lg:text-4xl xl:text-6xl font-panchang font-semibold"
            />
            <p className="text-lg text-muted-foreground font-space_grotesk">
              With over eight months in development, over six months of writing
              and refinement and about thirty research articles later, we are
              finally launching the Articles Tab!
            </p>
            <Button
              asChild
              variant={`ghost`}
              className="border hover:scale-[105%] group rounded-full text-white py-5 transition-all duration-300 animate font-giest font-medium "
            >
              <Link href="/article" className="">
                Read Our Documents{" "}
                <ArrowUpRight className="transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="hidden lg:inline relative h-full w-full">
            <div className="h-[598px] w-[524px] animate-blob dark:from-0% dark:from-[#2C2C2C] dark:to-[#471F77] from-[#F0F0F0] from-[28%] to-[#D5B0FF] bg-linear-180 blur-[133px] rounded-full absolute top-0 bottom-0 my-auto right-0 left-0 mr-auto"></div>
            <Image
              src="/ribbon.png"
              alt="Cancer"
              width={385}
              height={492}
              quality={100}
              className="object-cover absolute top-0 bottom-0 my-auto right-0 scale-75 left-17 mr-auto hidden dark:inline"
            />
          </div>
        </motion.div> */}

          <motion.div
            ref={heroRef}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            variants={staggerContainer}
            className="h-screen flex bg-transparent flex-col mb-10 items-center gap-[12rem] justify-center w-full overflow-y-hidden"
          >
            <motion.div
              style={{ y }}
              className="absolute inset-0 will-change-transform"
              aria-hidden
              initial="hidden"
              whileInView="visible"
              variants={fadeScale}
            >
              <Image
                src={`/landing/Background.png`}
                height={888}
                width={1440}
                alt="background"
                className="object-cover w-full h-full"
                priority
              />

              <div className="absolute inset-0 bg-[#471F77]/52" />
              <div className="absolute inset-0 bg-[#000000] opacity-55" />
            </motion.div>

            <motion.div
              className="flex z-10 flex-col w-full justify-self-center self-center items-center gap-11"
              variants={staggerContainer}
            >
              <ShinyText
                text={"Breaking Down Cancer for Everyone"}
                disabled={true}
                speed={4}
                className="text-2xl lg:text-5xl text-center xl:text-7xl font-wintersolace font-medium w-5xl mt-5 max-sm:text-3xl max-sm:w-4/5"
                textColor="#fafafa"
              />
              <motion.span
                className="font-dmsans text-2xl max-sm:px-6 sm:max-w-[35%] w-full text-center max-sm:text-xs max-sm:w-4/5 max-sm:font-light"
                variants={fadeUp}
              >
                At the Carcino Foundation, we believe that everyone should be
                able to learn about one of the leading causes of human
                mortality.
                {/* but in a way everyone can understand. */}
              </motion.span>
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -2, scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex"
              >
                <Button
                  variant="ghost"
                  className="relative px-6 py-5 rounded-full overflow-hidden backdrop-blur-sm inset-shadow-foreground/10 font-giest font-medium transition-all duration-300"
                >
                  <Link
                    href="/article"
                    className="relative z-10 flex items-center gap-2"
                  >
                    Read Our Documents{" "}
                    <ArrowUpRight className="transition-transform" />
                  </Link>

                  {/* Liquid glass layers */}
                  <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                  <div className="absolute inset-0 liquidGlass-tint pointer-events-none"></div>
                  <div className="liquidGlass-shine  relative w-[100.8%] h-[100%] !top-[0px] !left-[-1px]"></div>
                  <div className="absolute inset-0 liquidGlass-text pointer-events-none"></div>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Articles */}
          <motion.div
            ref={articlesRef}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="z-10 font-giest flex flex-col lg:gap-8 md:gap-4 gap-2 items-center text-center lg:text-left justify-start w-full sm:max-w-[90%] mx-auto h-fit lg:px-14 md:px-10 px-6 pb-6 py-7 relative"
          >

            <motion.h1
              className="text-5xl leading-[0.9]
  sm:text-5xl sm:leading-[0.9]
  lg:text-6xl lg:leading-[0.9] whitespace-pre-wrap
  text-center font-wintersolace font-bold
  bg-gradient-to-r from-[#70429b] from-8% to-[#dfcbf0] to-60%
  bg-clip-text text-transparent py-6 px-10"
              variants={fadeUp}
            >
              Article Gallery
            </motion.h1>
            <motion.p
              className="text-lg text-muted-foreground font-dmsans max-sm:text-md w-2/3 text-center"
              variants={fadeUp}
            >
              Here's the latest collection of articles we offer, tailored to be
              understandable by everyone, made with love and care by our Writing
              Team.
            </motion.p>
            {/* subtle parallax blobs behind the grid */}

            <motion.div
              className="
    relative z-10
    grid
    lg:grid-flow-col lg:grid-rows-2
    lg:auto-cols-fr
    auto-rows-fr
    items-stretch
    gap-x-6 gap-y-10
    py-6
    w-full
    justify-center
  "
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              key={loading ? 'skeleton' : 'cards'}
              variants={staggerContainer}
            >

              {/* <div className="pointer-events-none absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  initial={false}
                  style={{ y: yBlob1 }}
                  className="aspect-square w-[80rem] blur-3xl opacity-35 will-change-transform"
                  aria-hidden
                >
                  <div className="w-full h-full rounded-full bg-[radial-gradient(closest-side,rgba(213,176,255,0.8),transparent)]" />
                </motion.div>
              </div> */}
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
                    Loading articles...
                  </span>
                </div>
              ) : articles.length === 0 ? (
                <div className="col-span-full text-center text-lg text-muted-foreground">
                  No articles found.
                </div>
              ) : (
                featuredArticles.map((article) => {
                  const getTitleFontSize = (title: string) => {
                    const words = title.split(/\s+/);
                    const maxWordLength = Math.max(...words.map(w => w.length));

                    if (maxWordLength > 12) return "text-[14px] sm:text-[18px]";
                    if (maxWordLength >= 9) return "text-[18px] sm:text-[22px]";

                    if (title.length > 35) return "text-[16px] sm:text-[20px]";
                    if (title.length > 15) return "text-[20px] sm:text-[26px]";
                    return "text-[25px] sm:text-[35px]";
                  };

                  return (
                    <Link
                      key={article.id}
                      href={article.slug ? `/article/${article.slug}` : `/article/${article.id}`}
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
                        <CardContainer className="w-full h-full px-4 rounded-[44px]">
                          <CardBody
                            className="
                              relative z-20
                              group/card
                              vision-pro-ui-hoverable
                              w-full h-full min-h-[260px]
                              py-5
                              flex flex-col justify-center
                              rounded-[44px]
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
                                rounded-[44px]
                                pointer-events-none
                                w-full
                              "
                            >
                              <div className="lowercase text-[18px] sm:text-[22px] lg:text-[26px] font-medium font-instrumentserifitalic text-[#CDA8E8] group-hover/card:text-white transition-colors duration-300 text-center w-full">
                                Research Article
                              </div>

                              <h3 className={`${getTitleFontSize(article.title)} leading-[1] p-2 text-center uppercase font-tttravelsnext font-bold max-w-[220px] mx-auto w-full text-white`}>
                                {article.title}
                              </h3>

                              <p className="text-[15px] sm:text-[20px] text-center text-[#CDA8E8] group-hover/card:text-white transition-colors duration-300 font-dmsans w-full font-light">
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
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -2, scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex"
            >
              <Button
                variant="ghost"
                className="relative px-7 py-5 rounded-full overflow-hidden backdrop-blur-sm inset-shadow-foreground/10 transition-all duration-300 font-dmsans font-medium hover:scale-[105%]"
              >
                <Link
                  href="/article"
                  className="relative z-10 flex items-center gap-2"
                >
                  Visit the Articles Tab{" "}
                  <ArrowUpRight className="transition-transform border-none" />
                </Link>

                {/* Liquid glass layers */}
                <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                <div className="absolute inset-0 liquidGlass-tint pointer-events-none"></div>
                <div className="liquidGlass-shine  relative w-[102.5%] h-[100%] !top-[-0.1px] !left-[-2.3px]"></div>
                <div className="absolute inset-0 liquidGlass-text pointer-events-none"></div>
              </Button>
            </motion.div>
          </motion.div>

          {/* Featured */}
          {/* Mobile Quotation (hidden in pc) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="flex flex-col items-center gap-5 w-full h-fit justify-center lg:hidden py-16 z-10 max-sm:pt-0 max-sm:pb-20"
          >
            <motion.h2
              className="font-instrumentserifitalic px-3 text-lg text-center max-sm:w-60"
              variants={fadeUp}
            >
              “The human spirit was built to outlast despair. So, live life to
              the fullest and don't think about things too much.”
            </motion.h2>
            <motion.p
              className="font-giest
           text-center"
              variants={fadeUp}
            >
              Rajannya Das <br /> Founder & CEO
            </motion.p>
          </motion.div>

          {/* General Featured Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={staggerContainer}
            className="z-10 flex flex-col lg:gap-6 md:gap-4 gap-4 items-center lg:items-start text-center lg:text-left justify-center w-full lg:w-fit h-fit max-h-[1200px] lg:px-14 md:px-10 px-6 pb-6"
          >
            {/* <MotionLabel
            className="border p-3 rounded-full font-space_grotesk text-base text-foreground"
            variants={fadeUp}
          >
            Why Trust Us
          </MotionLabel> */}
            <motion.h1
              className="pt-3 text-4xl font-dmsans font-semibold text-foreground"
              variants={fadeUp}
            >
              We want everyone to be aware.
            </motion.h1>
            <motion.p
              className="text-lg max-w-[480px] text-muted-foreground leading-[20px] font-dmsans"
              variants={fadeUp}
            >
              There’s plenty of misconceptions about cancer, especially amongst
              our current generation.
            </motion.p>
            <div className="flex flex-row items-center justify-center w-full h-fit">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                className="grid lg:grid-flow-col lg:grid-rows-2 gap-7 pt-7 max-w-[400px] lg:max-w-[50%] h-fit"
              >
                <motion.div variants={fadeUp}>
                  <Card className="animate-floaty lg:border-0 shadow-none bg-transparent">
                    <CardHeader className="flex flex-col items-center lg:items-start gap-2">
                      <div className="animate-floaty">
                        <Award size={40} />
                      </div>
                      <p className="text-xl lg:text-2xl font-instrumentserifitalic">
                        Verified Research
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="font-dmsans leading-[20px] text-muted-foreground text-sm lg:text-lg">
                        Working with plenty of pioneers in the field of medicine
                        has helped us bring out the truth behind cancer.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div variants={fadeUp}>
                  <Card className="animate-floaty delay-400 lg:border-0 shadow-none bg-transparent">
                    <CardHeader className="flex flex-col items-center lg:items-start gap-1">
                      <div
                        className="animate-floaty"
                        style={{ animationDelay: "0.15s" }}
                      >
                        <CalendarCheck size={40} />
                      </div>
                      <p className="text-xl lg:text-2xl font-instrumentserifitalic">
                        Up-to-Date Articles
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="font-dmsans  leading-[20px] text-muted-foreground lg:text-lg">
                        From start to finish, all our writers prioritize
                        accuracy, ensuring up to date facts and studies.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div variants={fadeUp}>
                  <Card className="animate-floaty delay-800 lg:border-0 shadow-none bg-transparent">
                    <CardHeader className="flex flex-col items-center lg:items-start gap-2">
                      <div
                        className="animate-floaty"
                        style={{ animationDelay: "0.3s" }}
                      >
                        <PaintBucket size={40} />
                      </div>
                      <p className="text-xl lg:text-2xl font-instrumentserifitalic">
                        Made for Everyone
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="font-dmsans leading-[20px] text-muted-foreground lg:text-lg">
                        We try to keep things simple, to break the language
                        barrier and improve communication.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div variants={fadeUp}>
                  <Card className="animate-floaty delay-[1200] lg:border-0 shadow-none bg-transparent">
                    <CardHeader className="flex flex-col items-center lg:items-start gap-2">
                      <div
                        className="animate-floaty"
                        style={{ animationDelay: "0.45s" }}
                      >
                        <UserCheck size={40} />
                      </div>
                      <p className="text-xl lg:text-2xl font-instrumentserifitalic">
                        Run by Students
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="font-dmsans leading-[20px] text-muted-foreground lg:text-lg">
                        We believe that our generation can beat cancer. And we
                        try our best to educate our peers.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
              <div className="lg:flex flex-col items-center gap-7 max-w-[50%] w-full h-full justify-center hidden">
                <h2 className="font-instrumentserifitalic text-4xl max-w-[70%] text-center">
                  “The human spirit was built to outlast despair. So, live life
                  to the fullest and don't think about things too much.”
                </h2>
                <p className="font-dmsans text-2xl text-center">
                  <span className="font-bold">Rajannya Das</span> <br /> Founder
                  & CEO
                </p>

                <Button
                  variant="ghost"
                  className="relative px-5 py-3 mt-5 rounded-full overflow-hidden backdrop-blur-sm inset-shadow-foreground/10 transition-all duration-300 font-dmsans font-medium hover:scale-[105%]"
                >
                  <Link
                    href="/leadership"
                    className="relative z-10 flex items-center gap-2"
                  >
                    Meet the team{" "}
                    <ArrowUpRight className="transition-transform border-none" />
                  </Link>

                  {/* Liquid glass layers */}
                  <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                  <div className="absolute inset-0 liquidGlass-tint pointer-events-none"></div>
                  <div className="liquidGlass-shine  relative w-[102.5%] h-[100%] !top-[-0.1px] !left-[-2.3px]"></div>
                  <div className="absolute inset-0 liquidGlass-text pointer-events-none"></div>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Call to action  */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="z-10 font-giest text-foreground flex flex-col lg:gap-6 md:gap-4 gap-2 items-center text-center xl:text-left justify-start w-full h-fit lg:px-14 md:px-10 px-6 pb-6 lg:py-18 max-sm:mb-0"
          >
            {/* Main glass container */}
            <div className="w-full flex flex-row items-center justify-between relative overflow-hidden rounded-4xl">
              {/* Background blur & tint */}
              <div className="absolute inset-0 bg-linear-180 blur-3xl from-[#F0F0FF]/30 via-[#D5B0FF]/30 to-[#F0F0FF]/30 dark:from-[#2C2C2C]/30 dark:via-[#471F77]/30 dark:to-[#2C2C2C]/30"></div>

              {/* Liquid glass layers */}
              <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
              <div className="liquidGlass-shine  relative w-[100.8%] h-[100%] !top-[-0.1px] !left-[-0.5px]"></div>
              <div className="absolute inset-0 liquidGlass-text pointer-events-none"></div>

              {/* Content */}
              <div className="text-white flex flex-col items-center xl:items-start xl:max-w-[60%] justify-center gap-6 w-full h-fit lg:px-14 md:px-10 px-6 py-10 sm:py-14 md:py-18 lg:py-20 relative z-10">
                <h1
                  className="        text-4xl sm:text-5xl lg:text-6xl xl:text-7xl
        leading-[0.95]
        font-instrumentserifitalic
        bg-gradient-to-r from-[#70429b] to-[#dfcbf0]
        bg-clip-text text-transparent sm:ml-10 
        max-w-full py-2 sm:max-w-[70%]"
                >
                  Lets change the world together!
                </h1>
                <p
                  className=" text-base sm:text-lg
        font-dmsans
        text-muted-foreground sm:ml-10
        max-w-full sm:max-w-[85%] xl:max-w-[70%]"
                >
                  Do you wish to contribute to the cause? Write to us or send us
                  articles, and our Writing Team will work on it and share it
                  with the world.
                </p>

                <div className="flex flex-row sm:ml-10 gap-3 max-sm:flex-col">
                  {/* Writing Team Button */}
                  <Button
                    variant="ghost"
                    className="flex flex-col sm:flex-row relative px-6 py-5 rounded-full overflow-hidden backdrop-blur-sm inset-shadow-foreground/10 transition-all duration-300 font-dmsans font-medium hover:scale-[105%]"
                  >
                    <Link
                      href="/internship/writer"
                      className="relative z-10 flex items-center gap-2"
                    >
                      Writing Team{" "}
                      <ArrowUpRight className="transition-transform" />
                    </Link>
                    <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                    <div className="absolute inset-0 liquidGlass-tint pointer-events-none !bg-[rgba(32,2,51,0.84)]"></div>
                    <div className="liquidGlass-shine  relative w-[101%] h-[100%] !top-[0px] !left-[-1px]"></div>
                    <div className="absolute inset-0 liquidGlass-text pointer-events-none"></div>
                  </Button>

                  {/* Dev / Design Button */}
                  <Button
                    variant="ghost"
                    className="relative px-6 py-5 rounded-full overflow-hidden backdrop-blur-sm inset-shadow-foreground/10 transition-all duration-300 font-dmsans font-medium hover:scale-[105%]"
                  >
                    <Link
                      href="/internship/tech"
                      className="relative z-10 flex items-center gap-2"
                    >
                      Dev / Design{" "}
                      <ArrowUpRight className="transition-transform" />
                    </Link>
                    <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                    <div className="absolute inset-0 liquidGlass-tint pointer-events-none !bg-[rgba(32,2,51,0.84)]"></div>
                    <div className="liquidGlass-shine  relative w-[100.8%] h-[100%] !top-[0px] !left-[-1px]"></div>
                    <div className="absolute inset-0 liquidGlass-text pointer-events-none"></div>
                  </Button>
                </div>
              </div>

              {/* Image */}
              <div className="hidden xl:inline my-10 mr-20 relative z-10">
                <Image
                  src={`/logo-outline.png`}
                  height={300}
                  width={300}
                  alt=""
                  className="object-contain h-full"
                />
              </div>
            </div>
          </motion.div>
        </MotionConfig>

        {/* Footer */}
        <Footer></Footer>
      </div>
    </>
  );
}
