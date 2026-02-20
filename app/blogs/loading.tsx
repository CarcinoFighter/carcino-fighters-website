"use client";

import { motion } from "framer-motion";

export default function BlogLoading() {
  return (
    <div
      className="flex flex-col min-h-screen overflow-hidden relative"
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(134deg, #000 41.58%, #2A2134 78.5%)",
        position: "absolute",
        zIndex: 0,
      }}
    >
      <div className="w-full h-full min-h-screen font-giest flex flex-col relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full from-primary/10 to-background pt-[80px]"
        >
          <div className="max-w-4xl flex flex-col gap-4 mx-auto px-6 text-center py-10">
            <div className="h-8 w-56 mx-auto rounded-full bg-white/10 animate-pulse" />
            <div className="h-4 w-full max-w-xl mx-auto rounded-full bg-white/5 animate-pulse" />
            <div className="h-4 w-3/5 mx-auto rounded-full bg-white/5 animate-pulse" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 px-6 pb-10"
        >
          <div className="max-w-4xl w-full mx-auto col-span-full px-6">
            <div className="w-full flex flex-row items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-white/10 animate-pulse" />
              <div className="h-10 w-full rounded-full bg-white/5 animate-pulse" />
            </div>
          </div>

          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="w-full h-full rounded-xl border border-white/10 bg-white/5 animate-pulse min-h-[220px]"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
