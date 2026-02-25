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

const SCROLL_SPEED = 40; // px/s auto-scroll speed

export default function Home() {
  const [items, setItems] = React.useState<Tribute[]>([]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const heroRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  const offsetRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const lastTimeRef = React.useRef<number | null>(null);
  const halfWidthRef = React.useRef(0);

  // Separate pause reasons so they don't clobber each other
  const hoveredRef = React.useRef(false);
  const isDragging = React.useRef(false);

  // Drag via pointer capture
  const dragStartX = React.useRef(0);
  const dragStartOffset = React.useRef(0);

  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);

  React.useEffect(() => {
    setItems(tributes);
  }, []);
  const featuredItems = React.useMemo<Tribute[]>(() => [...items], [items]);

  // Measure half-width after render
  React.useEffect(() => {
    if (!trackRef.current || featuredItems.length === 0) return;
    halfWidthRef.current = trackRef.current.scrollWidth / 2;
  }, [featuredItems]);

  React.useEffect(() => {
    const handleResize = () => {
      if (trackRef.current)
        halfWidthRef.current = trackRef.current.scrollWidth / 2;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // rAF loop
  React.useEffect(() => {
    if (featuredItems.length === 0) return;

    const tick = (timestamp: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const paused = hoveredRef.current || isDragging.current;
      if (!paused) {
        offsetRef.current += SCROLL_SPEED * delta;
      }

      const half = halfWidthRef.current;
      if (half > 0) {
        offsetRef.current = ((offsetRef.current % half) + half) % half;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${-offsetRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [featuredItems]);

  // Wheel scroll handler — horizontal scroll moves the carousel
  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const onWheel = (e: WheelEvent) => {
      // Only intercept horizontal scroll or shift+scroll
      // Let vertical scroll pass through for page scrolling
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        offsetRef.current += e.deltaX;
      } else if (e.shiftKey) {
        e.preventDefault();
        offsetRef.current += e.deltaY;
      }
      // Pure vertical scroll (no shift) is NOT prevented — page scrolls normally
    };

    wrapper.addEventListener("wheel", onWheel, { passive: false });
    return () => wrapper.removeEventListener("wheel", onWheel);
  }, [featuredItems]);

  // Pointer capture drag — works even when pointer moves outside element
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag on primary button (left click), not right click
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartOffset.current = offsetRef.current;
    if (wrapperRef.current) wrapperRef.current.style.cursor = "grabbing";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStartX.current;
    offsetRef.current = dragStartOffset.current - dx;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    isDragging.current = false;
    if (wrapperRef.current) wrapperRef.current.style.cursor = "grab";
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
                className="w-full h-full"
                priority
              />
            </div>

            <motion.div
              className="flex z-10 flex-col w-full items-center gap-8 sm:gap-5 mt-32 sm:mt-28"
              variants={staggerContainer}
            >
              <span className="text-3xl lg:text-5xl text-center xl:text-7xl font-wintersolace font-medium max-w-[40%] max-sm:text-3xl max-sm:w-3/5 leading-[109%] text-[#f8f8f8]">
                Forever in our Hearts
              </span>
              <span className="font-dmsans text-[#ffffff] text-2xl sm:max-w-[60%] w-full text-center max-sm:text-sm max-sm:w-4/5 font-light leading-[109%]">
                To the ones who touched our lives. We remember them today,
                tomorrow and always.
              </span>
            </motion.div>

            <motion.div
              className="relative z-10 w-full py-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
              style={{ overflow: "hidden" }}
            >
              {/*
                wrapperRef: receives wheel + pointer events.
                No overlay — pointer events reach cards naturally for hover.
                Pointer capture handles drag even outside bounds.
              */}
              <div
                ref={wrapperRef}
                className="w-full select-none"
                style={{ cursor: "grab", touchAction: "pan-y" }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                role="region"
                aria-label="tribute carousel"
              >
                <div
                  ref={trackRef}
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    width: "max-content",
                    willChange: "transform",
                    padding: "12px 0",
                  }}
                >
                  {[...featuredItems, ...featuredItems].map((item, idx) => {
                    const imgSrc = item.image;
                    return (
                      <div
                        key={`${item.name}-${idx}`}
                        className="block flex-shrink-0 w-[320px] sm:w-[420px] overflow-hidden rounded-[44px]"
                        onMouseEnter={() => {
                          hoveredRef.current = true;
                        }}
                        onMouseLeave={() => {
                          hoveredRef.current = false;
                        }}
                      >
                        <motion.div
                          className="tribute-card group rounded-[44px] will-change-transform transform-gpu"
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
                          <CardContainer className="w-[320px] sm:w-[420px] px-0 rounded-[44px]">
                            <CardBody
                              className="
                                relative z-20
                                group/card
                                vision-pro-ui-hoverable
                                w-[320px] sm:w-[420px] max-w-full h-[260px]
                                py-3
                                flex flex-col
                                rounded-[44px]
                                overflow-hidden isolation-isolate liquid-glass !shadow-none
                                backdrop-blur-[30px]
                                select-none
                              "
                            >
                              <div
                                className="absolute inset-0 bg-cover bg-center [filter:grayscale(100%)] group-hover:[filter:none] group-active:[filter:none] transition-all duration-500"
                                style={{ backgroundImage: `url(${imgSrc})` }}
                              />
                              <div className="absolute bottom-0 w-full h-3/5 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
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
                                  rounded-[44px]
                                  pointer-events-none
                                  w-full h-full
                                  p-4
                                "
                              >
                                <p className="absolute bottom-28 bg-black/30 backdrop-blur-sm px-4 text-[14px] sm:text-[16px] text-center text-[#dfdfdf] transition-opacity duration-300 font-dmsans w-full font-light opacity-0 group-hover:opacity-100">
                                  {item.text}
                                </p>
                                <h3 className="text-[26px] leading-[1] p-2 align-middle justify-center text-center font-tttravelsnext font-bold max-w-[300px] mx-auto w-full text-[#f8f8f8]">
                                  {item.name}
                                </h3>
                                <div className="sm:text-[16px] text-[14px] text-[#ffffff] font-tttravelsnext">
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
