import { notFound } from "next/navigation";
import Script from "next/script";
import { Footer } from "@/components/footer";
import { ArticlePageClient } from "./ArticlePageClient";
import { getDocBySlugWithAvatar, getRandomArticleSummaries } from "@/lib/docsRepository";

export const revalidate = 600;

interface ArticlePageParams {
  params: Promise<{ cancerType: string }>;
}

export default async function ArticlePage({ params }: ArticlePageParams) {
  const { cancerType: slug } = await params;

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
        <p className="text-lg font-giest">This research is not available</p>
        <Footer />
      </div>
    );
  }
  const cancerName = slug.replace(/-/g, " ");

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalScholarlyArticle",

  headline: article.title,

  description: article.content
    .replace(/[#*_`>\-\[\]!\(\)]/g, "")
    .slice(0, 160),

  url: `https://thecarcinofoundation.org/article/${slug}`,

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
    "@type": "MedicalWebPage",
    about: {
      "@type": "MedicalCondition",
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
      "name": "Articles",
      "item": "https://thecarcinofoundation.org/article"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": article.title,
      "item": `https://thecarcinofoundation.org/article/${slug}`
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

    <ArticlePageClient article={article} moreArticles={moreArticles} />
  </>
);

}
