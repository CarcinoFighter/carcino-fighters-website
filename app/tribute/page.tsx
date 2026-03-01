/* eslint react/no-unescaped-entities: "off" */
"use client";
import * as React from "react";
import Script from "next/script";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { CardBody, CardContainer, CardItem, useMouseEnter } from "@/components/ui/3d-card";
import { motion, MotionConfig, useScroll, useTransform, AnimatePresence } from "framer-motion";
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

/**
 * Sub-component for individual tribute card content.
 * Uses useMouseEnter hook from 3d-card context to drive height animation.
 */
function TributeCardInner({ item }: { item: Tribute }) {
  const [isHovered] = useMouseEnter();
  const [isActuallyHovered, setIsActuallyHovered] = React.useState(false);
  const [isColorHovered, setIsColorHovered] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [expandedHeight, setExpandedHeight] = React.useState(320);

  const imgSrc = item.image;

  // Handle delayed un-hover to prevent abrupt snapping
  React.useEffect(() => {
    // Only allow hover state if there's text to display
    const hasText = Boolean(item.text);
    if (isHovered && hasText) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsActuallyHovered(true);
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsActuallyHovered(false);
      }, 150);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isHovered]);

  // Color hover always responds to mouse
  React.useEffect(() => {
    setIsColorHovered(isHovered);
  }, [isHovered]);

  // Auto-scroll logic: when card expands, ensure it's visible in the viewport
  React.useEffect(() => {
    if (isActuallyHovered && contentRef.current) {
      const scrollTimeout = setTimeout(() => {
        // Using block: 'nearest' ensures the card scrolls just enough to be fully visible
        // without jumping to the top of the viewport if it's already mostly visible.
        contentRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 150); // Small delay to sync with the start of the height animation
      return () => clearTimeout(scrollTimeout);
    }
  }, [isActuallyHovered]);

  // Measure full expanded height dynamically when state changes
  React.useEffect(() => {
    if (contentRef.current) {
      const fullHeight = contentRef.current.scrollHeight;
      // Only update if the measured height is significantly different to avoid loops
      if (Math.abs(fullHeight - expandedHeight) > 1) {
        setExpandedHeight(fullHeight);
      }
    }
  }, [isActuallyHovered, expandedHeight]);

  const getTitleFontSize = (name: string) => {
    const words = name.split(/\s+/);
    const maxWordLength = Math.max(...words.map((w) => w.length));

    // For very small screens (under 400px), we need to be more aggressive with scaling
    if (maxWordLength > 12) return "text-[18px] sm:text-[24px] lg:text-[32px]";
    if (maxWordLength >= 9) return "text-[20px] sm:text-[28px] lg:text-[32px]";
    if (name.length > 35) return "text-[18px] sm:text-[26px] lg:text-[32px]";
    if (name.length >= 15) return "text-[22px] sm:text-[30px] lg:text-[32px]";
    return "text-[26px] sm:text-[32px]";
  };

  return (
    <motion.div
      initial={false}
      animate={{
        height: isActuallyHovered ? expandedHeight : 320,
      }}
      transition={{
        duration: 0.4,
        ease: easeSoft,
        delay: isActuallyHovered ? 0 : 0.15 // Apply delay only to retraction to fix abruptness
      }}
      className="
        relative z-20
        group/card
        vision-pro-ui-hoverable
        w-[280px] min-[400px]:w-[320px] sm:w-[420px] max-w-full
        flex flex-col
        rounded-[44px]
        overflow-hidden isolation-isolate liquid-glass !shadow-none
        backdrop-blur-[30px]
        select-none
        [transform-style:preserve-3d]
        *:[transform-style:preserve-3d]
      "
    >
      <div ref={contentRef} className="relative w-full h-full overflow-hidden rounded-[44px]">
        <motion.div
          className="absolute inset-0 bg-cover bg-center origin-center"
          style={{ backgroundImage: `url(${imgSrc})` }}
          initial={false}
          animate={{
            filter: isColorHovered ? "grayscale(0%)" : "grayscale(100%)",
            scale: isColorHovered ? 1.05 : 1,
          }}
          transition={{
            duration: 0.5,
            ease: easeSoft,
          }}
        />
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
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
            justify-start
            rounded-[44px]
            pointer-events-none
            w-full
            p-6 sm:p-8
          "
        >
          {/* Fixed spacer to push content to bottom of initial 320px view */}
          <div className="h-[140px] sm:h-[140px] w-full shrink-0" />

          <div className="flex flex-col items-center w-full">
            <h3 className={`${getTitleFontSize(item.name)} leading-tight p-2 align-middle justify-center text-center font-tttravelsnext font-bold max-w-[340px] mx-auto w-full text-[#f8f8f8]`}>
              {item.name}
            </h3>
            <div className="sm:text-[18px] text-[14px] text-[#ffffff]/95 font-tttravelsnext font-medium [text-shadow:0_2px_8px_rgba(0,0,0,0.4)]">
              {item.year}
            </div>
          </div>

          <motion.div
            animate={{
              opacity: isActuallyHovered ? 1 : 0,
            }}
            transition={{
              duration: 0.3,
              ease: easeSoft,
            }}
            className="overflow-hidden w-full mt-4"
            style={{
              height: isActuallyHovered ? "auto" : 0
            }}
          >
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4" />
            <p className="text-[14px] sm:text-[16px] text-center text-[#dfdfdf] font-dmsans w-full font-light leading-relaxed pb-4">
              {item.text}
            </p>
          </motion.div>
        </CardItem>
      </div>
    </motion.div>
  );
}

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

  // Auto-focus the container on mount to enable arrow key scrolling immediately
  React.useEffect(() => {
    containerRef.current?.focus();
  }, [featuredItems]);

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
        tabIndex={0}
        className="flex flex-col relative lg:block lg:h-screen w-full overflow-y-scroll overflow-x-hidden items-start gap-20 bg-background hide-scrollbar outline-none"
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
                    return (
                      <div
                        key={`${item.name}-${idx}`}
                        className="block flex-shrink-0 w-[280px] min-[400px]:w-[320px] sm:w-[420px] overflow-hidden rounded-[44px]"
                        onMouseEnter={() => {
                          hoveredRef.current = true;
                        }}
                        onMouseLeave={() => {
                          hoveredRef.current = false;
                        }}
                      >
                        <motion.div
                          className="tribute-card group rounded-[44px] will-change-transform transform-gpu"
                          variants={{
                            hidden: { opacity: 0, y: 12 },
                            visible: {
                              opacity: 1,
                              y: 0,
                              transition: { duration: 0.55, ease: easeSoft },
                            },
                          }}
                        >
                          <CardContainer
                            className="w-[280px] min-[400px]:w-[320px] sm:w-[420px] px-0 rounded-[44px]"
                            containerClassName="!items-start"
                          >
                            <TributeCardInner item={item} />
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