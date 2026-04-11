import type { Metadata } from "next";
import Script from "next/script";
import { HomePageClient } from "./HomePageClient";
import { getAllDocs } from "@/lib/docsRepository";

export const metadata: Metadata = {
  title: "The Carcino Foundation – Breaking Down Cancer for Anyone and Everyone",
  description: "A simple hub, built to educate and help emerging and concurrent generations upon one of the leading causes of death in humanity.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Carcino Foundation",
    description: "Breaking Down Cancer for Anyone and Everyone",
    url: "https://www.thecarcinofoundation.org",
    siteName: "The Carcino Foundation",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "The Carcino Foundation Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Carcino Foundation",
    description: "Breaking Down Cancer for Anyone and Everyone",
    images: ["/logo.png"],
  },
};

export default async function Home() {
  const articles = await getAllDocs();
  
  const homePageSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "The Carcino Foundation",
    url: "https://thecarcinofoundation.org",
    publisher: {
      "@type": "NGO",
      name: "The Carcino Foundation",
    },
    inLanguage: "en-IN",
  };

  return (
    <>
      <Script
        id="home-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homePageSchema),
        }}
      />
      <HomePageClient initialArticles={articles as any} />
    </>
  );
}
