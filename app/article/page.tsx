import { ArticleListClient } from "./ArticleListClient";
import { getAllDocs } from "@/lib/docsRepository";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles",
};

export const revalidate = 600;

export default async function ArticleListPage() {
  const articles = await getAllDocs();
  return <ArticleListClient articles={articles} />;
}
