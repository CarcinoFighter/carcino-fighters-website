import "./globals.css";
import type { Metadata } from "next";
import { Geist, Space_Grotesk, Cinzel, Michroma } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import localFont from "next/font/local";
// import { Footer } from "@/components/footer";


const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const wintersolace= localFont({
  src: [
    {
      path: "../public/fonts/wintersolace.ttf",
      weight: '400',
      style: "normal",
    }
  ],
  variable: "--font-wintersolace",
})

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
const inter= localFont({
  src: [
    {
      path: "../public/fonts/inter.ttf",
      weight: '400',
      style: "normal",
    }
  ],
  variable: "--font-inter",
})
const instrumentserifitalic = localFont({
  src: [
    {
      path: "../public/fonts/instrumentserifitalic.ttf",
      weight: "400",
      style: "italic",  // ✅ fix this
    },
  ],
  variable: "--font-instrumentserifitalic",
})
const tttravelsnext= localFont({
  src: [
    {
      path: "../public/fonts/tttravelsnext.ttf",
      style: "normal",
    }
  ],
  variable: "--font-tttravelsnext",
});
export const metadata: Metadata = {
  title: "The Carcino Foundation – Breaking Down Cancer for Anyone and Everyone",
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
        className={`${geist.variable} ${spaceGrotesk.variable} ${cinzel.variable} ${michroma.variable} ${panchang.variable} ${wintersolace.variable} ${inter.variable} 
        ${instrumentserifitalic.variable} ${tttravelsnext.variable} antialiased hide-scrollbar`}>
    
        <ThemeProvider
        
          attribute="class"
          defaultTheme="dark"
          storageKey="theme"
          disableTransitionOnChange
        >
          
          <Navbar></Navbar>
         {/* Global hidden SVG filter */}
<svg width={0} height={0} style={{ position: "absolute" }}>
  <defs>
    <filter
      id="nav-glass"
      x="-20%"
      y="-20%"
      width="140%"
      height="140%"
      filterUnits="objectBoundingBox"
    >
      {/* Horizontal refraction bias */}
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.002 0.05"
        numOctaves="3"
        seed="7"
        result="warpNoise"
      />

      {/* Stretch distortion stronger in middle, weaker edges */}
      <feComponentTransfer in="warpNoise" result="centerWarp">
        <feFuncR type="gamma" exponent="2.4" amplitude="1" offset="0" />
        <feFuncG type="gamma" exponent="1.8" amplitude="1" offset="0" />
        <feFuncB type="gamma" exponent="2.4" amplitude="1" offset="0" />
      </feComponentTransfer>

      {/* Refraction */}
      <feDisplacementMap
        in="SourceGraphic"
        in2="centerWarp"
        scale="30"
        xChannelSelector="R"
        yChannelSelector="G"
        result="refracted"
      />

      {/* Frosted blur */}
      <feGaussianBlur in="refracted" stdDeviation="10" result="frost" />

      {/* Slight brightness lift like real glass */}
      <feColorMatrix
        in="frost"
        type="matrix"
        values="
          1 0 0 0 0
          0 1 0 0 0
          0 0 1 0 0
          0 0 0 .28 0
        "
        result="glass"
      />

      {/* Edge highlight */}
      <feSpecularLighting
        in="centerWarp"
        specularConstant="1.3"
        specularExponent="70"
        surfaceScale="4"
        lightingColor="#ffffff"
        result="shine"
      >
        <fePointLight x="0" y="-200" z="150" />
      </feSpecularLighting>

      {/* Add rim glow */}
      <feBlend in="glass" in2="shine" mode="screen" />
    </filter>
  </defs>
</svg>


          {children}

          
        </ThemeProvider>
      </body>
      
    </html>
  );


}
