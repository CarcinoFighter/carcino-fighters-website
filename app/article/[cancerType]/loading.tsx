export default function ArticleDetailLoading() {
  return (
    <div className="relative w-full bg-[#2A292F] font-giest min-h-screen overflow-hidden flex justify-center">
      <div className="w-full px-5 sm:px-20 sm:pt-[80px] relative gap-6 z-10 flex flex-col items-center">
        <div className="hidden md:block h-1 w-full fixed top-0 left-0 right-0 bg-gradient-to-r from-[#70429b]/40 via-white/20 to-transparent animate-pulse z-50" />

        <div className="w-full max-w-4xl relative pt-10 flex flex-col justify-center items-center z-10">
          <div className="w-full flex gap-5 flex-col sm:flex-row justify-center items-center sm:px-10">
            <div className="sm:hidden h-14 w-14 rounded-full bg-white/10 animate-pulse" />

            <div className="w-full flex flex-col items-center justify-center gap-4 py-4 px-4 sm:px-10">
              {/* Title skeleton */}
              <div className="h-12 sm:h-16 w-full sm:w-[80%] rounded-xl bg-white/10 animate-pulse mb-2" />
              <div className="h-12 sm:h-16 w-[80%] sm:w-[60%] rounded-xl bg-white/10 animate-pulse" />

              {/* Author skeleton */}
              <div className="flex flex-col items-center justify-center gap-2 py-6 sm:py-10 w-full">
                <div className="h-5 w-48 rounded-full bg-white/5 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full px-3 pt-6 gap-6 items-center">
            <div className="relative max-w-4xl w-full px-2 sm:px-0">
              <div className="space-y-4 w-full">
                {/* Simulated paragraphs */}
                {[...Array(3)].map((_, pIdx) => (
                  <div key={pIdx} className="space-y-3 mb-10 w-full">
                    <div className="h-4 w-full rounded-full bg-white/5 animate-pulse" />
                    <div className="h-4 w-[98%] rounded-full bg-white/5 animate-pulse" />
                    <div className="h-4 w-[95%] rounded-full bg-white/5 animate-pulse" />
                    <div className="h-4 w-[90%] rounded-full bg-white/5 animate-pulse" />
                    <div className="h-4 w-3/4 rounded-full bg-white/5 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AUTHOR SECTION SKELETON */}
          <div className="flex flex-col gap-6 mt-20 items-center w-full max-w-4xl px-4 pb-20">
            <div className="h-10 w-64 rounded-xl bg-white/10 animate-pulse mb-8" />
            <div className="w-full h-auto min-h-[160px] rounded-[40px] liquid-glass !shadow-none backdrop-blur-[30px] animate-pulse p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start overflow-hidden relative">
              <div className="liquidGlass-effect pointer-events-none"></div>
              <div className="cardGlass-tint pointer-events-none"></div>
              <div className="cardGlass-borders pointer-events-none"></div>

              <div className="w-20 h-20 shrink-0 rounded-full bg-white/10 z-10" />
              <div className="flex flex-col gap-4 w-full items-center sm:items-start z-10 mt-2 sm:mt-0">
                <div className="h-8 w-48 rounded-md bg-white/10" />
                <div className="h-4 w-32 rounded-full bg-white/5" />
                <div className="h-4 w-full max-w-lg rounded-full bg-[#CDA8E8]/20 mt-2" />
                <div className="h-4 w-3/4 max-w-md rounded-full bg-[#CDA8E8]/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
