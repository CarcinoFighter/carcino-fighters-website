import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function transformSupabaseUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return url;

  // Replace the default supabase domain with the custom one if found
  // Default: hpycprmvcnmfuqsoecvl.supabase.co
  // Custom: the-carcino-foundation.jiobase.com
  return url.replace("hpycprmvcnmfuqsoecvl.supabase.co", new URL(supabaseUrl).hostname);
}
