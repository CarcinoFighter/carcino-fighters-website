import { BlogListClient } from "./BlogListClient";
import { getAllDocs } from "@/lib/docsRepository";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs",
};

export const revalidate = 600;

export default async function BlogListPage() {
  const blogs = await getAllDocs();
  return <BlogListClient articles={blogs} />;
}
