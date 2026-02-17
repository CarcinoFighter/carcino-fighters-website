"use server";

import React from "react";
import Link from "next/link";
import {
  getDocBySlugWithAvatar,
  getRandomArticleSummaries,
  getAllDocsWithAvatars,
} from "@/lib/docsRepository";
import Script from "next/script";
import StoryPageClient from "./StoryPageClient";
import type { ArticleWithAvatar, ArticleSummary } from "@/lib/docsRepository";

interface Props {
  params: Promise<{
    story: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { story } = await params;

  // Try to load the article by slug (or id if slug isn't found)
  let article: ArticleWithAvatar | null = null;
  try {
    article = await getDocBySlugWithAvatar(story);
  } catch (e) {
    console.error("Error fetching story:", e);
  }

  // Fallback: if `story` is actually an id (not a slug), try to find by id
  if (!article) {
    try {
      const all = await getAllDocsWithAvatars();
      const byId = all.find((d) => d.id === story);
      if (byId) article = byId as ArticleWithAvatar;
    } catch (e) {
      console.error("Fallback id lookup failed:", e);
    }
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-3xl w-full text-center">
          <h1 className="text-3xl font-bold mb-4">Story not found</h1>
          <p className="mb-6">
            Could not find a survivor story with that id or slug.
          </p>
          <Link href="/survivorstories" className="text-primary underline">
            ← Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  const moreArticles: ArticleSummary[] =
    (await getRandomArticleSummaries(3, article.slug)) || [];

  const storySchema = {
    "@context": "https://schema.org",
    "@type": "MedicalScholarlyArticle",
    headline: article.title,
    description: article.content
      .replace(/[#*_`>\-\[\]!\(\)]/g, "")
      .slice(0, 160),
    url: `https://thecarcinofoundation.org/survivorstories/${article.slug}`,
    author: {
      "@type": "Person",
      name: article.author || "Carcino Research Team",
    },
    publisher: {
      "@type": "NGO",
      name: "The Carcino Foundation",
      url: "https://thecarcinofoundation.org",
    },
    mainEntityOfPage: { "@type": "MedicalWebPage" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://thecarcinofoundation.org",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Stories",
        item: "https://thecarcinofoundation.org/survivorstories",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `https://thecarcinofoundation.org/survivorstories/${article.slug}`,
      },
    ],
  };

  return (
    <>
      <Script
        id="story-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storySchema) }}
      />
      <Script
        id="story-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <StoryPageClient story={article} related={moreArticles} />
    </>
  );
}
