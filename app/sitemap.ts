import type { MetadataRoute } from "next";
import { getAllDocs } from "@/lib/docsRepository";
import { getAllBlogs } from "@/lib/blogsRepository";
import { getAllSurvivorStories } from "@/lib/survivorStoriesRepository";

function getBaseUrl(): string {
  const siteUrl = "https://www.thecarcinofoundation.org"
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
    "/internship/design",
    "/internship/marketing",
    "/blogs",
    "/survivorstories",
    "/privacy-policy",
    "/terms-of-service",
    "/the-vision",
    "/tribute",
  ].map((path) => ({
    url: `${baseUrl}${path === "" ? "/" : path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.6,
  }));

  const [articles, blogs, stories] = await Promise.all([
    getAllDocs(),
    getAllBlogs(),
    getAllSurvivorStories(),
  ]);

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: new Date((article as any).updated_at || (article as any).created_at || new Date()),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = (blogs as any[]).map((blog) => ({
    url: `${baseUrl}/blogs/${blog.slug}`,
    lastModified: new Date(blog.updated_at || blog.created_at || new Date()),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const storyRoutes: MetadataRoute.Sitemap = (stories as any[]).map((story) => ({
    url: `${baseUrl}/survivorstories/${story.slug}`,
    lastModified: new Date(story.updated_at || story.created_at || new Date()),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes, ...blogRoutes, ...storyRoutes];
}

