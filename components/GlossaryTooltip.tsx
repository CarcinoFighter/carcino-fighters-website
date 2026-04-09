import React, { useState, useRef, useLayoutEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface GlossaryTooltipProps {
  word: string;
  meaning: string;
  children: React.ReactNode;
}

export function GlossaryTooltip({ word, meaning, children }: GlossaryTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ xOffset: 0, side: "top" as "top" | "bottom" });
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (isHovered && tooltipRef.current && containerRef.current) {
      // First, reset to neutral position to measure natural width
      setPosition({ xOffset: 0, side: "top" });
      
      // Wait for the next tick to measure natural size
      const timer = requestAnimationFrame(() => {
        if (!tooltipRef.current || !containerRef.current) return;
        
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const padding = 20;

        let newXOffset = 0;
        let side: "top" | "bottom" = "top";

        // Horizontal adjustment check
        // tooltiRect.left/right is relative to current (un-offset) position
        if (tooltipRect.left < padding) {
          newXOffset = padding - tooltipRect.left;
        } else if (tooltipRect.right > viewportWidth - padding) {
          newXOffset = viewportWidth - padding - tooltipRect.right;
        }

        // Vertical flip if near top
        if (containerRect.top < 150) {
          side = "bottom";
        }

        setPosition({ xOffset: newXOffset, side });
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [isHovered]);

  return (
    <span 
      ref={containerRef}
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
          <motion.span
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95, y: position.side === "top" ? 5 : -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position.side === "top" ? 5 : -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`!absolute left-1/2 z-[999999] w-max max-w-[280px] rounded-2xl shadow-2xl pointer-events-none text-left backdrop-blur-xl bg-black/70 border border-white/10 p-5 transition-transform duration-200`}
            style={{ 
              position: 'absolute',
              left: '50%',
              transformOrigin: position.side === "top" ? 'bottom center' : 'top center',
              transform: `translateX(calc(-50% + ${position.xOffset}px))`,
              ...(position.side === "top" ? { bottom: '100%', marginBottom: '14px' } : { top: '100%', marginTop: '14px' })
            } as React.CSSProperties}
          >
            <span className="text-[13px] text-white/95 leading-relaxed font-dmsans block whitespace-normal">
              <strong className="text-purple-400 block mb-1.5 uppercase tracking-wider text-[11px] font-black">{word}</strong>
              {meaning}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
