import "./globals.css";
import type { Metadata } from "next";
import { Geist, Space_Grotesk, Cinzel, Michroma } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import localFont from "next/font/local";


const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const panchang = localFont({
  src: [
    {
      path: "../public/fonts/Panchang-Extralight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/Panchang-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Panchang-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Panchang-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Panchang-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Panchang-Extrabold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-panchang",
});

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: "400"
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${spaceGrotesk.variable} ${cinzel.variable} ${michroma.variable} ${panchang.variable} antialiased `}
        
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
