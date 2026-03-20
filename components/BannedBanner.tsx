"use client";

import React from "react";
import { Mail, AlertCircle } from "lucide-react";

export function BannedBanner() {
  const [isBanned, setIsBanned] = React.useState(false);

  React.useEffect(() => {
    // Check if user is banned
    fetch("/api/public-auth")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.is_banned) {
          setIsBanned(true);
        } else {
          setIsBanned(false);
        }
      })
      .catch(() => setIsBanned(false));
  }, []);

  if (!isBanned) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[100] bg-red-600/90 backdrop-blur-md text-white px-4 py-2 flex items-center justify-center gap-3 font-dmsans text-sm sm:text-base border-b border-red-500/50 shadow-lg animate-in fade-in slide-in-from-top duration-500">
      <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse text-white" />
      <span className="text-center font-medium">
        Your account has been permanently banned. In case you want to have your ban reversed, contact{" "}
        <a 
          href="mailto:support@carcino.work" 
          className="underline font-bold hover:text-white/80 transition-colors inline-flex items-center gap-1"
        >
          support@carcino.work
        </a>
      </span>
    </div>
  );
}
