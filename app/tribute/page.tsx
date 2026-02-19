/* eslint react/no-unescaped-entities: "off" */
"use client";
import * as React from "react";
import Script from "next/script";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { motion, MotionConfig, useScroll, useTransform } from "framer-motion";
import { tributes, Tribute } from "./tribute";

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

const MotionLabel = motion(Label);

export default function Home() {
  const [items, setItems] = React.useState<Tribute[]>([]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const heroRef = React.useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = React.useState(false);

  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);

  React.useEffect(() => {
    setItems(tributes);
  }, []);

  const featuredItems = React.useMemo<Tribute[]>(() => {
    return [...items];
  }, [items]);

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

      {/*
        THE ROOT CAUSE OF THE TELEPORT BUG:
        Setting `animation` as a React inline style string means every re-render
        (including the paused state toggle) can re-assign the `animation` property,
        which resets the animation back to frame 0.

        THE FIX:
        - Define the full `animation` in a global CSS class (never touched by React)
        - React only toggles a secondary `paused` class that sets `animation-play-state: paused`
        - This way the animation position is NEVER reset — it just freezes and resumes in place
      */}
      <style jsx global>{`
        @keyframes carousel-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .carousel-track {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          will-change: transform;
          animation: carousel-scroll 40s linear infinite;
          padding: 12px 0;
        }

        .carousel-track.paused {
          animation-play-state: paused;
        }
      `}</style>

      <div
        ref={containerRef}
        className="flex flex-col relative lg:block lg:h-screen w-full overflow-y-scroll overflow-x-hidden items-start gap-20 bg-background hide-scrollbar"
      >
        <MotionConfig transition={{ duration: 1 }}>
          <motion.div
            ref={heroRef}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            variants={staggerContainer}
            className="flex bg-transparent flex-col items-center gap-10 justify-center w-full overflow-y-hidden relative lg:static"
          >
            <div className="fixed inset-0 will-change-transform">
              <Image
                src={`/bg_trib.png`}
                height={1198}
                width={1728}
                alt="background"
                className=" w-full h-full"
                priority
              />
            </div>

            <motion.div
              className="flex z-10 flex-col w-full items-center gap-5 mt-28"
              variants={staggerContainer}
            >
              <span className="text-2xl lg:text-5xl text-center xl:text-7xl font-wintersolace font-medium max-w-[40%] max-sm:text-3xl max-sm:w-3/5 leading-[109%] text-[#f8f8f8]">
                Forever in our Hearts
              </span>
              <span className="font-dmsans text-[#ffffff] text-2xl sm:max-w-[60%] w-full text-center max-sm:text-xs max-sm:w-4/5 font-light leading-[109%] tracking-[-2%]">
                To the ones who touched our lives. We remember them today,
                tomorrow and always.
              </span>
            </motion.div>

            <motion.div
              className="relative z-10 w-full overflow-hidden py-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <div
                className="w-full"
                style={{ overflowX: "hidden", overflowY: "visible" }}
                role="region"
                aria-label="tribute carousel"
              >
                <div
                  className={`carousel-track${paused ? " paused" : ""}`}
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                >
                  {[...featuredItems, ...featuredItems].map((item, idx) => {
                    const imgSrc = item.image;
                    return (
                      <div
                        key={`${item.name}-${idx}`}
                        className="block flex-shrink-0 w-[450px]"
                      >
                        <motion.div
                          className="tribute-card group"
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
                          <CardContainer className="w-[450px] px-0 rounded-[40px]">
                            <CardBody
                              className="
                                relative z-20
                                group/card
                                vision-pro-ui-hoverable
                                w-[450px] h-[300px]
                                py-3
                                flex flex-col 
                                rounded-[40px]
                                overflow-hidden isolation-isolate liquid-glass !shadow-none
                                backdrop-blur-[30px]
                                select-none
                              "
                            >
                              <div
                                className="absolute inset-0 bg-cover bg-center "
                                style={{
                                  backgroundImage: `url(${imgSrc})`,
                                }}
                              />
                              {/* gradient overlay to improve text readability */}
                              <div className="absolute bottom-0 w-full h-3/5 bg-gradient-to-t from-black/90 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />
                              <div className="storyGlass-tint pointer-events-none"></div>
                              <div className="glass-noise"></div>
                              <div className="cardGlass-borders pointer-events-none"></div>
                              <div className="cardGlass-shine pointer-events-none"></div>
                              <div className="liquidGlass-text pointer-events-none"></div>

                              <CardItem
                                translateZ="20"
                                className="
                                  relative z-10
                                  flex flex-col items-center
                                  justify-end
                                  rounded-[40px]
                                  pointer-events-none
                                  w-full h-full
                                  p-4
                                "
                              >
                                {/* description overlays top, visible only on hover */}
                                <p className="absolute bottom-28 bg-black/30 backdrop-blur-sm px-4 text-[14px] sm:text-[16px] text-center text-[#dfdfdf] transition-opacity duration-300 font-dmsans w-full font-light opacity-0 group-hover:opacity-100">
                                  {item.text}
                                </p>

                                <h3 className="text-[26px] leading-[1] p-2 align-middle justify-center text-center font-tttravelsnext font-bold max-w-[300px] mx-auto w-full text-[#f8f8f8]">
                                  {item.name}
                                </h3>
                                <div className="text-[16px] text-[#ffffff] font-tttravelsnext">
                                  {item.year}
                                </div>
                              </CardItem>
                            </CardBody>
                          </CardContainer>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </MotionConfig>
      </div>
    </>
  );
}
