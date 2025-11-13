import type { MetadataRoute } from "next";
import { getAllDocs } from "@/lib/docsRepository";

function getBaseUrl(): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return siteUrl.replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/article",
    "/leadership",
    "/fetch",
    "/internship/tech",
    "/internship/writer",
    "/admin",
  ].map((path) => ({
    url: `${baseUrl}${path === "" ? "/" : path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.6,
  }));

  const articles = await getAllDocs();

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes];
}
