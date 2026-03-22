import { ArticleListClient } from "./ArticleListClient";
import { getAllDocs } from "@/lib/docsRepository";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles",
};

export const revalidate = 600;

export default async function ArticleListPage() {
  const communityDocs = await getAllDocs();
  
  const { getStaffCancerDocs } = await import("@/lib/carcinoWork");
  const staffDocs = await getStaffCancerDocs();
  
  const articles = [...communityDocs.map(d => ({ ...d, source: 'community' })), ...staffDocs].sort((a: any, b: any) => 
    a.title.localeCompare(b.title)
  );

  return <ArticleListClient articles={articles} />;
}
