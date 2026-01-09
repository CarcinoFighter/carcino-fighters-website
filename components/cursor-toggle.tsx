"use client";

import { usePathname } from "next/navigation";
import { Cursor } from "./cursor";

export function CursorToggle() {
  const pathname = usePathname();
  const disableFancy = pathname?.startsWith("/admin");
  if (disableFancy) return null;
  return <Cursor />;
}
