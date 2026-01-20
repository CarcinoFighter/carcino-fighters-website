import { ArticleListClient } from "./ArticleListClient";
import { getAllDocs } from "@/lib/docsRepository";

export const revalidate = 600;

export default async function ArticleListPage() {
  const articles = await getAllDocs();
  return <ArticleListClient articles={articles} />;
}
