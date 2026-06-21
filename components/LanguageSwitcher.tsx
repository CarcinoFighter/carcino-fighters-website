"use client";

import * as React from "react";
import { Globe, Check, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUAGES, useTranslation } from "./TranslationProvider";

export function LanguageSwitcher() {
  const { currentLang, isTranslating, setLanguage } = useTranslation();
  const activeLang = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-hidden select-none border-none bg-transparent">
          <div className="relative px-3.5 py-1.5 md:px-4 md:py-2 rounded-full overflow-hidden backdrop-blur-md transition-all duration-300 hover:scale-[103%] group cursor-pointer border border-white/10 hover:border-white/20 bg-white/5 flex items-center gap-2">
            {/* Glass background & glow */}
            <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
            <div className="absolute inset-0 bg-[#B372FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="liquidGlass-shine relative w-[100.8%] h-[100%] !top-[0px] !left-[-1px]"></div>

            {isTranslating ? (
              <Loader2 className="w-4 h-4 text-white/70 animate-spin relative z-10" />
            ) : (
              <Globe className="w-4 h-4 text-white/70 group-hover:text-white transition-colors duration-300 relative z-10" />
            )}
            <span className="text-xs sm:text-sm font-dmsans font-medium text-white/80 group-hover:text-white transition-colors duration-300 relative z-10">
              {activeLang.nativeName}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-44 bg-[#1E1C22]/95 border border-white/10 backdrop-blur-xl rounded-2xl p-1.5 shadow-2xl relative z-50">
        <div className="text-[10px] uppercase font-dmsans font-semibold text-white/40 tracking-wider px-2.5 py-1.5 select-none">
          Select Language
        </div>
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="flex items-center justify-between px-2.5 py-2 text-sm font-dmsans text-white/80 rounded-xl cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white transition-all duration-200"
          >
            <div className="flex flex-col text-left">
              <span className="font-medium text-white">{lang.nativeName}</span>
              <span className="text-[10px] text-white/40">{lang.label}</span>
            </div>
            {currentLang === lang.code && (
              <Check className="w-4 h-4 text-[#B372FF]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
