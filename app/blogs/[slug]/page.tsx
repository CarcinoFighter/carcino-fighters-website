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

export default async function Page({ params }: Props) {
  const { slug } = await params;

  let entry: BlogEntry | null = null;
  try {
    entry = await getBlogBySlug(slug);
  } catch (e) {
    console.error("Error fetching blog entry:", e);
  }

  if (!entry) {
    try {
      const all = await getAllBlogs();
      const byId = all.find((d) => d.id === slug);
      if (byId) entry = byId as BlogEntry;
    } catch (e) {
      console.error("Fallback id lookup failed:", e);
    }
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-3xl w-full text-center">
          <h1 className="text-3xl font-bold mb-4">Post not found</h1>
          <p className="mb-6">Could not find a blog post with that id or slug.</p>
          <Link href="/blogs" className="text-primary underline">
            ← Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

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
      <BlogPageClient entry={entry} related={related} />
    </>
  );
}
