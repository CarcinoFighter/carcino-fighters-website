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
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="!absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[280px] sm:w-[320px] rounded-[44px] shadow-2xl z-[99999] isolate overflow-hidden pointer-events-none text-left liquid-glass backdrop-blur-2xl !shadow-none border border-white/10"
            style={{ "--card-radius": "44px", position: 'absolute' } as React.CSSProperties}
          >
            {/* Liquid Glass Base Layers */}
            <span className="liquidGlass-effect pointer-events-none absolute inset-0 z-0" />
            
            {/* Frosted Layer with distortion pass-through */}
            <span className="cardGlass-tint pointer-events-none absolute inset-0 opacity-100 !bg-[#1a1225]/60 z-[1] shadow-[inset_0.6px_0.6px_0.4px_rgba(255,255,255,0.4)]" />
            <span className="absolute inset-0 bg-white/[0.02] pointer-events-none z-[2]" />
            <span className="glass-noise absolute inset-0 opacity-30 pointer-events-none z-[3]" />
            
            {/* Border and Shine Layers */}
            <span className="cardGlass-borders absolute inset-0 pointer-events-none z-[4]" />
            <span className="cardGlass-shine absolute inset-0 pointer-events-none z-[5]" />
            
            <span className="relative z-10 flex flex-col p-6 px-8">
              <span className="text-sm text-gray-100 leading-relaxed font-dmsans font-medium block whitespace-normal text-center drop-shadow-md">
                {meaning}
              </span>
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
