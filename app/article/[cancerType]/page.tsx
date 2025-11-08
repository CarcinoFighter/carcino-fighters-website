import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { ArticlePageClient } from "./ArticlePageClient";
import { getDocBySlugWithAvatar, getRandomArticleSummaries } from "@/lib/docsRepository";

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

  return <ArticlePageClient article={article} moreArticles={moreArticles} />;
}
