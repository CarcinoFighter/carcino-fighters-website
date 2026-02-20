import { notFound } from "next/navigation";
import Script from "next/script";
import { Footer } from "@/components/footer";
import { BlogPageClient } from "./BlogPageClient";
import { getDocBySlugWithAvatar, getRandomArticleSummaries } from "@/lib/docsRepository";
import { Metadata } from "next";

export async function generateMetadata({ params }: BlogPageParams): Promise<Metadata> {
  const { slug } = await params;
  const article = await getDocBySlugWithAvatar(slug);

  if (!article) {
    return {
      title: "Blog Not Found",
    };
  }

  return {
    title: article.title,
  };
}

interface BlogPageParams {
  params: Promise<{ slug: string }>;
}

export default async function BlogPage({ params }: BlogPageParams) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const [article, moreArticles] = await Promise.all([
    getDocBySlugWithAvatar(slug),
    getRandomArticleSummaries(3, slug),
  ]);

  if (!article) {
    return (
      <div className="w-full text-foreground text-center py-12 px-4 pt-[68px] min-h-screen">
        <p className="text-lg font-giest">This blog is not available</p>
        <Footer />
      </div>
    );
  }
  const cancerName = slug.replace(/-/g, " ");

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",

    headline: article.title,

    description: article.content
      .replace(/[#*_`>\-\[\]!\(\)]/g, "")
      .slice(0, 160),

    url: `https://thecarcinofoundation.org/blogs/${slug}`,

    author: {
      "@type": "Person",
      name: article.author || "Carcino Research Team",
    },

    publisher: {
      "@type": "NGO",
      name: "The Carcino Foundation",
      url: "https://thecarcinofoundation.org",
    },

    mainEntityOfPage: {
      "@type": "WebPage",
      about: {
        "@type": "Thing",
        name: cancerName,
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://thecarcinofoundation.org"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blogs",
        "item": "https://thecarcinofoundation.org/blogs"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `https://thecarcinofoundation.org/blogs/${slug}`
      }
    ]
  };

  return (
    <>
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />

      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <BlogPageClient article={article} moreArticles={moreArticles} />
    </>
  );

}
