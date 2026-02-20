"use server";

import React from "react";
import Link from "next/link";
import {
  getBlogBySlug,
  getAllBlogs,
  getRandomBlogs,
  type BlogEntry,
  type BlogSummary,
} from "@/lib/blogsRepository";
import Script from "next/script";
import BlogPageClient from "./BlogPageClient";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

const CARD_COLORS = [
  "#E39E2E",
  "#64A04B",
  "#2E3192",
  "#9E8DC5",
  "#7F2D3F",
  "#818181",
];

export default async function Page({ params }: Props) {
  const { slug } = await params;

  let entry: BlogEntry | null = null;
  let allBlogs: BlogEntry[] = [];

  try {
    entry = await getBlogBySlug(slug);
  } catch (e) {
    console.error("Error fetching blog entry:", e);
  }

  try {
    const res = await getAllBlogs();
    allBlogs = res as BlogEntry[];
  } catch (e) {
    console.error("Failed to fetch all blogs:", e);
  }

  if (!entry) {
    const byId = allBlogs.find((d) => d.id === slug);
    if (byId) entry = byId as BlogEntry;
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#2A292F] font-dmsans">
        <div className="max-w-3xl w-full text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Post not found</h1>
          <p className="mb-6 opacity-60">
            Could not find a blog post with that id or slug.
          </p>
          <Link href="/blogs" className="text-primary underline">
            ← Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  // Derive the same color that was assigned to this card on the listing page
  const blogIndex = allBlogs.findIndex((s) => s.id === entry!.id);
  const cardColor =
    blogIndex !== -1
      ? CARD_COLORS[blogIndex % CARD_COLORS.length]
      : CARD_COLORS[0];

  const related: BlogSummary[] = (await getRandomBlogs(3, entry.slug)) || [];

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: entry.title,
    description: (entry.content || "").replace(/[#*_`>\-\[\]!\(\)]/g, "").slice(0, 160),
    url: `https://thecarcinofoundation.org/blogs/${entry.slug}`,
    author: {
      "@type": "Person",
      name: entry.authorName || "Carcino Research Team",
    },
    publisher: {
      "@type": "NGO",
      name: "The Carcino Foundation",
      url: "https://thecarcinofoundation.org",
    },
    mainEntityOfPage: { "@type": "WebPage" },
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
        name: "Blogs",
        item: "https://thecarcinofoundation.org/blogs",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: entry.title,
        item: `https://thecarcinofoundation.org/blogs/${entry.slug}`,
      },
    ],
  };

  return (
    <>
      <Script
        id="blog-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <Script
        id="blog-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogPageClient entry={entry} related={related} cardColor={cardColor} />
    </>
  );
}
