"use client";

import { motion } from "framer-motion";

export default function SurvivorStoriesLoading() {
  return (
    <div
      className="flex flex-col min-h-screen overflow-hidden relative"
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(134deg, #05060a 36%, #1b2029 78%)",
        position: "absolute",
        zIndex: 0,
      }}
    >
      <div className="w-full h-full min-h-screen font-giest flex flex-col relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full from-primary/10 to-background pt-[80px]"
        >
          <div className="max-w-4xl flex flex-col gap-4 mx-auto px-6 text-center py-10">
            <div className="h-8 w-64 mx-auto rounded-full bg-white/10 animate-pulse" />
            <div className="h-4 w-full max-w-xl mx-auto rounded-full bg-white/5 animate-pulse" />
            <div className="h-4 w-3/5 mx-auto rounded-full bg-white/5 animate-pulse" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-12"
        >
          {[...Array(9)].map((_, idx) => (
            <div
              key={idx}
              className="w-full h-full rounded-[36px] border border-white/10 bg-white/5 animate-pulse min-h-[200px]"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
