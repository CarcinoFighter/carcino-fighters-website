import React from "react";
import Image from "next/image";
import Link from "next/link";

interface InternshipFooterProps {
  iconPath: string;
  departmentName: string;
  themeColor: string; // e.g., "#00FF00" or a tailwind color class if needed, but hex is better for custom gradients
}

export function InternshipFooter({ iconPath, departmentName, themeColor }: InternshipFooterProps) {
  return (
    <footer className="w-full max-w-6xl mx-auto py-12 px-6 md:px-14 lg:px-20 z-10 flex flex-col md:flex-row items-center justify-between gap-8 mt-auto">
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 md:w-32 md:h-32 opacity-40">
          <Image
            src={iconPath}
            alt={departmentName}
            fill
            className="object-contain"
            style={{ filter: `drop-shadow(0 0 12px ${themeColor}66)` }}
          />
        </div>
        <div className="flex flex-col opacity-80">
          <h2 className="text-4xl md:text-5xl lg:text-5xl font-tttravelsnext font-bold uppercase leading-[0.95] tracking-tighter flex flex-col opacity-40" style={{ color: themeColor }}>
            <span>DEPARTMENT</span>
            <span>OF</span>
            <span>{departmentName.replace(/Department of /i, "")}</span>
          </h2>
        </div>
      </div>



      <div className="flex flex-col items-center md:items-end gap-3 text-[10px] md:text-xs font-dmsans opacity-80" style={{ color: themeColor }}>
        <Link href="#" className="hover:opacity-100 transition-opacity">Cookies Settings</Link>
        <Link href="/privacy-policy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
        <Link href="/terms-of-service" className="hover:opacity-100 transition-opacity">Terms of Service</Link>
        <p>All Rights Reserved.</p>
      </div>
    </footer>
  );
}
