/* eslint react/no-unescaped-entities: "off" */
"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import * as React from "react";
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
import { motion, MotionConfig } from "framer-motion";
import { getAllDocs } from "@/lib/docsRepository";
// import { useState } from "react";
import ShinyText from "@/components/ShinyText";

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
}

// interface Position {
//   x: number;
//   y: number;
// }

export default function Home() {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  // const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  // const [opacity, setOpacity] = useState<number>(0);


  React.useEffect(() => {
    (async () => {
      const docs = await getAllDocs();
      setArticles(docs);
      setLoading(false);
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
    return [...articles].sort(() => Math.random() - 0.5).slice(0, 4);
  }, [articles]);

  return (
    <div className=" flex flex-col relative lg:block lg:h-screen w-screen overflow-y-scroll overflow-x-hidden items-start gap-20 bg-background lg:snap-y lg:scroll-pt-[68px] lg:snap-mandatory lg:snap-always">
      {/* <div
        className=" hidden sm:inline fixed inset-0 z-100 opacity-0 transition-opacity duration-500 ease-in-out pointer-events-none"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, #471F77, transparent 10%)`,
        }}
      /> */}

      {/* Mobile Background */}
      <div className="h-[40vh] w-full overflow-hidden fixed left-0 right-0 mx-auto top-0 bg-linear-180 rounded-b-full blur-3xl bg-radial-[at_50%_-50%] from-[#F0F0F0] via-primary-foreground to-[#F0F0F0] dark:from-[#2C2C2C] dark:via-[#471F77] dark:to-[#2C2C2C] lg:hidden animate-blob"></div>

      <MotionConfig transition={{ duration: 1 }}>
        {/* Main Content */}
        <motion.div
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
        </motion.div>

        {/* Articles */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="snap-start z-10 font-giest flex flex-col lg:gap-6 md:gap-4 gap-2 items-center text-center lg:text-left justify-start w-full h-fit lg:px-14 md:px-10 px-6 pb-6 py-7"
        >
          <Label className="border p-3 rounded-full font-space_grotesk text-base text-foreground">
            Research and Development
          </Label>
          <h1 className="text-2xl font-giest text-foreground ">Our Articles</h1>
          <p className="text-lg text-muted-foreground font-space_grotesk">
            Here's the latest collection of articles we offer, tailored to be
            understandable by everyone, made with love and care by our Writing
            Team.
          </p>
          <div className="grid lg:grid-flow-col lg:grid-rows-2 gap-3 py-6  w-full">
            {loading ? (
              <div className="col-span-full flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : articles.length === 0 ? (
              <div className="col-span-full text-center text-lg text-muted-foreground">
                No articles found.
              </div>
            ) : (
              // Use memoized featuredArticles (stable until `articles` changes)
              featuredArticles.map((article) => (
                <CardContainer key={article.id} className="w-full">
                  <CardBody className="relative group/card bg-background border-accent w-full h-auto rounded-xl p-6 border">
                    <div className="flex flex-col gap-4 h-full justify-between">
                      <Link
                        href={`/article/${article.slug}`}
                        className="mt-auto"
                      >
                        <CardItem
                          translateZ="20"
                          className="flex flex-col gap-2 h-full"
                        >
                          <div className="text-primary bg-primary/10 px-2 rounded border-primary border/20 w-fit mb-2 text-xs font-medium">
                            Research Article
                          </div>
                          <h2 className="text-lg lg:text-2xl md:text-xl font-giest text-foreground mb-2 line-clamp-2">
                            {article.title}
                          </h2>
                          <p className="md:text-lg font-giest text-muted-foreground line-clamp-3 mb-4">
                            {article.content
                              .replace(/[#*123456789_`>\-\[\]!\(\)]/g, "")
                              .slice(0, 120)}
                            ...
                          </p>
                        </CardItem>

                        <p className="text-sm text-primary flex  flex-row items-center gap-1 font-medium hover:underline">
                          View Article <ArrowUpRight size={14} />
                        </p>
                      </Link>
                    </div>
                  </CardBody>
                </CardContainer>
              ))
            )}
          </div>
          <Button asChild variant={`ghost`} className="">
            <Link href="/article">
              Read More Insights <ArrowUpRight />
            </Link>
          </Button>
        </motion.div>

        {/* Featured */}
        {/* Mobile Quotation (hidden in pc) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="flex flex-col items-center gap-5 w-full h-full justify-center lg:hidden py-16 z-10"
        >
          <h2 className="font-giest px-3 text-lg text-center font-semibold">
            “The human spirit was built to outlast despair. So, live life to the
            fullest and don't think about things too much.”
          </h2>
          <p
            className="font-giest
           text-center"
          >
            Rajannya Das <br /> Founder & CEO
          </p>
        </motion.div>

        {/* General Featured Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="z-10 snap-center flex flex-col lg:gap-6 md:gap-4 gap-4 items-center lg:items-start text-center lg:text-left justify-center w-full lg:w-fit h-fit lg:h-svh max-h-[1200px] lg:px-14 md:px-10 px-6 pb-6"
        >
          <Label className="border p-3 rounded-full font-space_grotesk text-base text-foreground">
            Why Trust Us
          </Label>
          <h1 className="text-2xl font-giest text-foreground ">
            We want everyone to be aware
          </h1>
          <p className="text-lg text-muted-foreground font-space_grotesk">
            We need the world to realise the threat, and for that we have a
            plan...
          </p>
          <div className="flex flex-row items-center justify-center w-full h-fit">
            <div className="grid lg:grid-flow-col lg:grid-rows-2 gap-7 pt-7 max-w-[400px] lg:max-w-[50%] h-fit">
              <Card className="lg:border-0 shadow-none bg-transparent">
                <CardHeader className="flex flex-col items-center lg:items-start gap-2">
                  <Award />
                  <p className="text-xl lg:text-2xl font-giest">
                    Verified Research
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="font-giest text-muted-foreground text-sm lg:text-lg">
                    Working with plenty of pioneers in the field of medicine has
                    helped us bring out the truth behind cancer.
                  </p>
                </CardContent>
              </Card>
              <Card className="lg:border-0 shadow-none bg-transparent">
                <CardHeader className="flex flex-col items-center lg:items-start gap-1">
                  <CalendarCheck />
                  <p className="text-xl lg:text-2xl font-giest">
                    Up-to-Date Articles
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="font-giest text-muted-foreground lg:text-lg">
                    From start to finish, all our writers prioritize accuracy,
                    ensuring up to date facts and studies.
                  </p>
                </CardContent>
              </Card>
              <Card className="lg:border-0 shadow-none bg-transparent">
                <CardHeader className="flex flex-col items-center lg:items-start gap-2">
                  <PaintBucket />
                  <p className="text-xl lg:text-2xl font-giest">
                    Made for Everyone
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="font-giest text-muted-foreground lg:text-lg">
                    We try to keep things simple, to break the language barrier
                    and improve communication.
                  </p>
                </CardContent>
              </Card>
              <Card className="lg:border-0 shadow-none bg-transparent">
                <CardHeader className="flex flex-col items-center lg:items-start gap-2">
                  <UserCheck />
                  <p className="text-xl lg:text-2xl font-giest">
                    Run By Students
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="font-giest text-muted-foreground lg:text-lg">
                    We believe that our generation can beat cancer. And we try
                    our best to educate our peers.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="lg:flex flex-col items-center gap-7 max-w-[50%] w-full h-full justify-center hidden">
              <h2 className="font-giest text-lg font-semibold max-w-[60%] text-center">
                “The human spirit was built to outlast despair. So, live life to
                the fullest and don't think about things too much.”
              </h2>
              <p className="font-giest text-center">
                Rajannya Das <br /> Founder & Managing Director
              </p>
            </div>
          </div>
        </motion.div>

        {/* Call to action  */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="snap-center z-10 font-giest text-foreground flex flex-col lg:gap-6 md:gap-4 gap-2 items-center text-center xl:text-left justify-start w-full h-fit lg:px-14 md:px-10 px-6 pb-6 lg:py-18"
        >
          <div className="w-full flex flex-row items-center justify-between bg-background/20 border rounded-4xl relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-180 blur-3xl from-[#F0F0FF]/30 via-[#D5B0FF]/30 to-[#F0F0FF]/30 dark:from-[#2C2C2C]/30 dark:via-[#471F77]/30 dark:to-[#2C2C2C]/30"></div>
            <div className="text-whte flex flex-col items-center xl:items-start xl:max-w-[60%] justify-center gap-6 w-full h-fit lg:px-14 md:px-10 px-6 py-10 sm:py-14 md:py-18 lg:py-20 relative z-10">
              <h1 className="text-5xl">Lets change the world together!</h1>
              <p className="text-lg">
                Do you wish to contribute to the cause? Write to us or send us
                articles, and our Writing Team will work on it and share it with
                the world.
              </p>
              <Button
                asChild
                variant={`outline`}
                className="text-white p-5 bg-primary/17 border-primary font-giest font-medium rounded-full"
              >
                <Link href="/internship/writer">
                  Start your project <ArrowUpRight />
                </Link>
              </Button>
            </div>
            <div className="hidden xl:inline relative z-10">
              <Image
                src={`/Shape.png`}
                height={590}
                width={559.63}
                alt=""
                className="object-cover h-full"
              />
            </div>
          </div>
        </motion.div>
      </MotionConfig>

      {/* Footer */}
      <Footer></Footer>
    </div>
  );
}
