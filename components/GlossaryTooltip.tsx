import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as Portal from "@radix-ui/react-portal";

interface GlossaryTooltipProps {
  word: string;
  meaning: string;
  children: React.ReactNode;
}

export function GlossaryTooltip({ word, meaning, children }: GlossaryTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0, side: "top" as "top" | "bottom", xOffset: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const padding = 20;
    const tooltipMaxWidth = 280;

    let side: "top" | "bottom" = "top";
    if (triggerRect.top < 150) {
      side = "bottom";
    }

    const centerX = triggerRect.left + triggerRect.width / 2;
    const top = side === "top" ? triggerRect.top - 12 : triggerRect.bottom + 12;

    // Detect horizontal overflow relative to trigger center
    let xOffset = 0;
    const expectedLeft = centerX - tooltipMaxWidth / 2;
    const expectedRight = centerX + tooltipMaxWidth / 2;

    if (expectedLeft < padding) {
      xOffset = padding - expectedLeft;
    } else if (expectedRight > viewportWidth - padding) {
      xOffset = viewportWidth - padding - expectedRight;
    }

    setCoords({
      left: centerX,
      top: top,
      side: side,
      xOffset: xOffset
    });
  };

  useLayoutEffect(() => {
    if (isHovered) {
      calculatePosition();
      window.addEventListener("scroll", calculatePosition, true);
      window.addEventListener("resize", calculatePosition);
    }
    return () => {
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [isHovered]);

  return (
    <span 
      ref={triggerRef}
      className="relative inline cursor-help group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)}
    >
      <span className="font-medium underline decoration-dotted decoration-2 decoration-purple-500/80 underline-offset-4 hover:decoration-purple-400 transition-colors">
        {children}
      </span>
      
      <AnimatePresence>
        {isHovered && (
          <Portal.Root>
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, scale: 0.95, y: coords.side === "top" ? 5 : -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: coords.side === "top" ? 5 : -5 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed z-[9999999] w-max max-w-[280px] rounded-2xl shadow-2xl pointer-events-none text-left backdrop-blur-xl bg-black/75 border border-white/10 p-5"
              style={{ 
                left: `${coords.left}px`,
                top: `${coords.top}px`,
                transform: `translate(calc(-50% + ${coords.xOffset}px), ${coords.side === "top" ? "-100%" : "0%"})`,
                transformOrigin: coords.side === "top" ? 'bottom center' : 'top center',
              }}
            >
              <span className="text-[13px] text-white/95 leading-relaxed font-dmsans block whitespace-normal">
                <strong className="text-purple-400 block mb-1.5 uppercase tracking-wider text-[11px] font-black">{word}</strong>
                {meaning}
              </span>
            </motion.div>
          </Portal.Root>
        )}
      </AnimatePresence>
    </span>
  );
}
