import React, { useState, useRef, useLayoutEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface GlossaryTooltipProps {
  word: string;
  meaning: string;
  children: React.ReactNode;
}

export function GlossaryTooltip({ word, meaning, children }: GlossaryTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: "-50%", y: 0, side: "top" as "top" | "bottom" });
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (isHovered && tooltipRef.current && containerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const padding = 20;

      let xOffset = 0;
      let side: "top" | "bottom" = "top";

      // Horizontal adjustment
      if (tooltipRect.left < padding) {
        xOffset = padding - tooltipRect.left;
      } else if (tooltipRect.right > viewportWidth - padding) {
        xOffset = viewportWidth - padding - tooltipRect.right;
      }

      // Vertical flip if near top
      if (containerRect.top < 120) {
        side = "bottom";
      }

      setPosition({ 
        x: `calc(-50% + ${xOffset}px)`, 
        y: 0,
        side 
      });
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
            className={`!absolute left-1/2 z-[999999] w-max max-w-[250px] rounded-xl shadow-2xl pointer-events-none text-left backdrop-blur-md bg-black/80 border border-white/10 p-4 transition-all duration-300`}
            style={{ 
              position: 'absolute',
              left: '50%',
              transform: `translateX(${position.x})`,
              ...(position.side === "top" ? { bottom: '100%', marginBottom: '12px' } : { top: '100%', marginTop: '12px' })
            } as React.CSSProperties}
          >
            {/* Arrow */}
            <div 
              className={`absolute left-1/2 -translate-x-1/2 border-8 border-transparent ${
                position.side === "top" 
                  ? "top-full border-t-black/80" 
                  : "bottom-full border-b-black/80"
              }`}
              style={{
                left: `calc(50% - ${parseInt(position.x.replace('calc(-50% + ', '').replace('px)', '')) || 0}px)`
              }}
            />

            <span className="text-[13px] text-white/90 leading-relaxed font-dmsans block whitespace-normal">
              <strong className="text-purple-400 block mb-1 uppercase tracking-wider text-[10px] font-black">{word}</strong>
              {meaning}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
