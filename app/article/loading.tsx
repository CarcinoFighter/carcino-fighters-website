"use client";

import { motion } from "framer-motion";

export default function ArticleLoading() {
  return (
    <div
      className="flex flex-col min-h-screen overflow-hidden relative"
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(314deg, transparent 40%, #2A2134 78.5%), linear-gradient(0deg, #000 30%, #2A2134 100%)",
        position: "absolute",
        zIndex: 0,
      }}
    >
      <div className="w-full h-full min-h-screen font-giest flex flex-col relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full from-primary/10 to-background pt-[80px]"
        >
          <div className="max-w-4xl flex flex-col gap-2 mx-auto px-6 text-center items-center py-10">
            <h1 className="text-4xl leading-[0.9] sm:text-6xl sm:leading-[0.9] lg:text-7xl lg:leading-[0.9] whitespace-nowrap text-center font-wintersolace text-white py-8 px-4 sm:px-10">
              Research <br className="sm:hidden" /> Articles
            </h1>
            <p className="text-lg text-muted-foreground font-dmsans mb-8 leading-[120%] font-light max-w-[80%]">
              With extensive hard work and highly strenuous fact checking, our Writing Team has led us to offer you a selection of curated articles.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 px-4 pb-4"
        >
          <div className="max-w-4xl w-full mx-auto col-span-full px-6 mb-8">
            <div className="relative liquid-glass rounded-full overflow-hidden isolation-isolate !shadow-none h-[64px] w-full flex items-center px-6">
              <div className="liquidGlass-effect pointer-events-none"></div>
              <div className="liquidGlass-shine pointer-events-none"></div>
              <div className="h-6 w-6 rounded-full bg-[#898989]/30 animate-pulse mr-3" />
              <div className="h-6 w-48 sm:w-64 rounded-md bg-[#898989]/20 animate-pulse" />
            </div>
          </div>

          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-full block">
              <div className="w-full h-full min-h-[200px] py-6 flex flex-col justify-center items-center rounded-[40px] overflow-hidden isolation-isolate liquid-glass !shadow-none backdrop-blur-[30px]">
                <div className="liquidGlass-effect pointer-events-none"></div>
                <div className="cardGlass-tint pointer-events-none"></div>
                <div className="glass-noise"></div>
                <div className="cardGlass-borders pointer-events-none"></div>
                <div className="cardGlass-shine pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center gap-4 w-full px-6 animate-pulse">
                  <div className="h-5 w-36 rounded-full bg-[#CDA8E8]/20 mb-2"></div>
                  <div className="h-10 w-full max-w-[220px] rounded-md bg-white/10"></div>
                  <div className="h-10 w-3/4 max-w-[180px] rounded-md bg-white/10"></div>
                  <div className="h-5 w-32 rounded-full bg-[#CDA8E8]/10 mt-3"></div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
