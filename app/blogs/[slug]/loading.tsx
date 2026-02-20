export default function BlogDetailLoading() {
  return (
    <div className="w-full px-5 sm:px-20 sm:pt-[80px] relative bg-background font-giest min-h-screen overflow-x-hidden flex justify-center">
      <div className="hidden md:block h-1 w-full fixed top-0 left-0 right-0 bg-gradient-to-r from-primary/40 via-white/20 to-transparent animate-pulse" />

      <div className="w-full max-w-6xl">
        <div className="relative pt-10 flex flex-col justify-center items-center gap-10">
          <div className="flex flex-col sm:flex-row items-center gap-5 w-full justify-center">
            <div className="sm:hidden h-14 w-14 rounded-full bg-white/10 animate-pulse" />
            <div className="max-w-4xl sm:px-10 w-full flex flex-col items-center sm:items-start gap-4">
              <div className="h-10 sm:h-12 w-3/4 rounded-full bg-white/10 animate-pulse" />
              <div className="h-8 sm:h-10 w-full rounded-full bg-white/5 animate-pulse" />
              <div className="h-8 sm:h-10 w-2/3 rounded-full bg-white/5 animate-pulse" />
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-4">
                <div className="h-6 w-24 rounded-full bg-white/10 animate-pulse" />
                <div className="h-6 w-24 rounded-full bg-white/10 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full px-3 pt-4 gap-6 items-center">
            <div className="relative max-w-4xl w-full px-2 sm:px-0">
              <div className="h-64 sm:h-80 lg:h-96 w-full rounded-2xl bg-white/5 animate-pulse mb-6" />
              <div className="space-y-3">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="h-4 w-full rounded-full bg-white/5 animate-pulse" />
                ))}
                <div className="h-4 w-2/3 rounded-full bg-white/5 animate-pulse" />
              </div>
              <div className="flex justify-center mt-10">
                <div className="h-10 w-32 rounded-full bg-white/10 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col gap-6 mt-6 items-center w-full">
              <div className="h-8 w-48 rounded-full bg-white/10 animate-pulse" />
              <div className="w-full max-w-3xl rounded-3xl bg-white/5 animate-pulse h-32" />
            </div>

            <div className="flex flex-col gap-6 mt-10 items-center w-full">
              <div className="h-8 w-56 rounded-full bg-white/10 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-5xl px-2">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="h-48 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
