import "./globals.css";
import type { Metadata } from "next";
import { Geist, Space_Grotesk, Cinzel } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { startDocSync } from "@/services/docSync";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});


const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Carcino Foundation",
  description: "A simple hub, built to educate and help emerging and concurrent generations upon one of the leading causes of death in humanity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    startDocSync(),
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${spaceGrotesk.variable} ${cinzel.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          storageKey="theme"
          disableTransitionOnChange
        >
          <Navbar></Navbar>

          {children}

          
        </ThemeProvider>
      </body>
    </html>
  );
}
