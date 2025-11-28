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
        className={`${geist.variable} ${spaceGrotesk.variable} ${cinzel.variable} ${michroma.variable} ${panchang.variable} ${wintersolace.variable} antialiased hide-scrollbar`}>
    
        <ThemeProvider
        
          attribute="class"
          defaultTheme="dark"
          storageKey="theme"
          disableTransitionOnChange
        >
          
          <Navbar></Navbar>
         {/* Global hidden SVG filter */}
<svg style={{ display: "none" }}>
  <filter
    id="glass-distortion"
    x="0"
    y="0"
    width="100%"
    height="100%"
    filterUnits="objectBoundingBox"
  >

    <feTurbulence
      type="fractalNoise"
      baseFrequency="0.007 0.01"
      numOctaves="3"
      seed="2"
      result="turb"
    />

    <feGaussianBlur in="turb" stdDeviation="2.2" result="blurredNoise" />

    <feSpecularLighting
      in="blurredNoise"
      surfaceScale="2"
      specularConstant="0.6"
      specularExponent="40"
      lightingColor="#ffffff"
      result="light"
    >
      <fePointLight x="-80" y="-40" z="120" />
    </feSpecularLighting>
    <feDisplacementMap
      in="SourceGraphic"
      in2="blurredNoise"
      scale="20"
      xChannelSelector="R"
      yChannelSelector="G"
    />
  </filter>
</svg>

          {children}

          
        </ThemeProvider>
      </body>
      
    </html>
  );


}
