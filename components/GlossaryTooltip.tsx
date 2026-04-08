import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface GlossaryTooltipProps {
  word: string;
  meaning: string;
  children: React.ReactNode;
}

export function GlossaryTooltip({ word, meaning, children }: GlossaryTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span 
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="!absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] rounded shadow-xl z-[999999] pointer-events-none text-left bg-[#212121] border border-white/10 px-3 py-1.5"
            style={{ position: 'absolute' } as React.CSSProperties}
          >
            <span className="text-[11px] text-white leading-tight font-dmsans block whitespace-normal">
              {meaning}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
