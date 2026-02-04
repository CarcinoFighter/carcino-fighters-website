import "./globals.css";
import Script from "next/script";
import type { Metadata } from "next";
import { Geist, Space_Grotesk, Cinzel, Michroma } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import localFont from "next/font/local";
import { GoogleAnalytics } from '@next/third-parties/google';

// import { Footer } from "@/components/footer";


const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const wintersolace = localFont({
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
const inter = localFont({
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
      style: "italic",
    },
  ],
  variable: "--font-instrumentserifitalic",
})
const tttravelsnext = localFont({
  src: [
    {
      path: "../public/fonts/tttravelsnext.ttf",
      style: "normal",
    }
  ],
  variable: "--font-tttravelsnext",
})
const dmsans = localFont({
  src: [
    {
      path: "../public/fonts/dmsans.ttf",
      style: "normal",
    }
  ],
  variable: "--font-dmsans",
});
export const metadata: Metadata = {
  title: {
    template: '%s | The Carcino Foundation',
    default: "The Carcino Foundation – Breaking Down Cancer for Anyone and Everyone",
  },
  description: "A simple hub, built to educate and help emerging and concurrent generations upon one of the leading causes of death in humanity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "NGO",
    "name": "The Carcino Foundation",
    "url": "https://thecarcinofoundation.org",
    "logo": "https://thecarcinofoundation.org/logo.png",
    "description":
      "At the Carcino Foundation, we believe that everyone should be able to learn about one of the leading causes of human mortality, but in a way everyone can understand.",
    "sameAs": [
      "https://www.instagram.com/thecarcinofoundation/",
      "https://www.linkedin.com/company/thecarcinofoundation/"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${spaceGrotesk.variable} ${cinzel.variable} ${michroma.variable} ${panchang.variable} ${wintersolace.variable} ${inter.variable} 
        ${instrumentserifitalic.variable} ${tttravelsnext.variable} ${dmsans.variable} antialiased hide-scrollbar`}>
        <Script
          id="carcino-org-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgSchema),
          }}
        />

        <ThemeProvider

          attribute="class"
          defaultTheme="dark"
          storageKey="theme"
          disableTransitionOnChange
        >

          <Navbar></Navbar>
          <svg
            style={{ display: "none" }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <filter
              id="glass-distortion"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              filterUnits="objectBoundingBox"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.0001 0.0001"
                numOctaves={1}
                seed={5}
                result="turbulence"
              />

              <feComponentTransfer in="turbulence" result="mapped">
                <feFuncR
                  type="gamma"
                  amplitude={0.2}
                  exponent={10}
                  offset={0.5}
                />
                <feFuncG
                  type="gamma"
                  amplitude={-0.5}
                  exponent={1}
                  offset={0}
                />
                <feFuncB
                  type="gamma"
                  amplitude={0}
                  exponent={1}
                  offset={0.5}
                />
              </feComponentTransfer>

              <feGaussianBlur
                in="turbulence"
                stdDeviation={1}
                result="softMap"
              />

              <feSpecularLighting
                in="softMap"
                surfaceScale={10}
                specularConstant={1}
                specularExponent={10}
                lightingColor="white"
                result="specLight"
              >
                <fePointLight x={-200} y={-200} z={300} />
              </feSpecularLighting>

              <feComposite
                in="specLight"
                operator="arithmetic"
                k1={0}
                k2={1}
                k3={1}
                k4={0}
                result="litImage"
              />

              <feDisplacementMap
                in="SourceGraphic"
                in2="softMap"
                scale={150}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </svg>

          {children}
        </ThemeProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      </body>

    </html>
  );


}
