import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { Article } from "./docsRepository";

// We keep the client for n2m, but use fetch for queries due to SDK inconsistencies
const notion = new Client({
    auth: process.env.NOTION_SECRET,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const NOTION_SECRET = process.env.NOTION_SECRET!;

// In-memory cache with TTL
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const metadataCache = new Map<string, CacheEntry<Article[]>>();
const articleCache = new Map<string, CacheEntry<Article>>();
const METADATA_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const ARTICLE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCachedData<T>(cache: Map<string, CacheEntry<T>>, key: string, ttl: number): T | null {
    const entry = cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > ttl) {
        cache.delete(key);
        return null;
    }

    return entry.data;
}

function setCachedData<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
    cache.set(key, { data, timestamp: Date.now() });
}

async function notionFetch(path: string, options: RequestInit = {}) {
    const url = `https://api.notion.com/v1/${path}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            "Authorization": `Bearer ${NOTION_SECRET}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Notion API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Fetch Notion articles metadata only (fast) or with full content (slow)
 * @param includeContent - If true, fetches and converts full markdown content. If false, only fetches metadata.
 */
export async function getNotionArticles(includeContent: boolean = false): Promise<Article[]> {
    try {
        if (!NOTION_SECRET || !DATABASE_ID) {
            console.warn("Notion environment variables are not set.");
            return [];
        }

        // Check cache first
        const cacheKey = includeContent ? 'full' : 'metadata';
        const cached = getCachedData(metadataCache, cacheKey, METADATA_CACHE_TTL);
        if (cached) {
            console.log(`Returning cached Notion articles (${cacheKey}): ${cached.length} articles`);
            return cached;
        }

        console.log(`Querying Notion Database via fetch: ${DATABASE_ID} (includeContent: ${includeContent})`);
        const response = await notionFetch(`databases/${DATABASE_ID}/query`, {
            method: "POST",
            body: JSON.stringify({}),
        });

        console.log(`Notion API returned raw results count: ${response.results.length}`);

        if (response.results.length > 0) {
            console.log("Available Notion Property Names:", Object.keys(response.results[0].properties));
        }

        const articles = await Promise.all(
            response.results
                .filter((page: any) => {
                    const statusProp = page.properties.Status;
                    if (!statusProp) return false;

                    const status = statusProp.status?.name ||
                        statusProp.select?.name ||
                        statusProp.rich_text?.[0]?.plain_text;
                    return status === "Done";
                })
                .map(async (page: any) => {
                    try {
                        const article = await notionPageToArticle(page, includeContent);
                        return article;
                    } catch (e) {
                        console.error(`Error mapping page ${page.id}:`, e);
                        return null;
                    }
                })
        );

        const filteredArticles = articles.filter((a: Article | null): a is Article => a !== null);
        console.log(`Final processed Notion articles count: ${filteredArticles.length}`);

        // Cache the results
        setCachedData(metadataCache, cacheKey, filteredArticles);

        return filteredArticles;
    } catch (error: any) {
        console.error("Error fetching Notion articles:", error.message || error);
        return [];
    }
}

export async function getNotionArticleBySlug(slug: string): Promise<Article | null> {
    try {
        if (!NOTION_SECRET || !DATABASE_ID) {
            return null;
        }

        // Check cache first
        const cached = getCachedData(articleCache, slug, ARTICLE_CACHE_TTL);
        if (cached) {
            console.log(`Returning cached article: ${slug}`);
            return cached;
        }

        // Try to find in metadata first (fast)
        const articles = await getNotionArticles(false); // metadata only
        const metadataMatch = articles.find(a => a.slug === slug || a.id === slug || a.id.replace(/-/g, '') === slug.replace(/-/g, ''));

        if (metadataMatch) {
            // Fetch full content for this specific article
            try {
                const page = await notionFetch(`pages/${metadataMatch.id}`);
                if (page) {
                    const fullArticle = await notionPageToArticle(page, true);
                    if (fullArticle) {
                        setCachedData(articleCache, slug, fullArticle);
                        return fullArticle;
                    }
                }
            } catch (e) {
                console.error(`Error fetching full content for ${slug}:`, e);
            }
        }

        // Fallback: try direct page fetch if slug looks like a page ID
        if (slug.length >= 32) {
            try {
                const page = await notionFetch(`pages/${slug}`);
                if (page) {
                    const article = await notionPageToArticle(page, true);
                    if (article) {
                        setCachedData(articleCache, slug, article);
                        return article;
                    }
                }
            } catch {
                return null;
            }
        }

        return null;
    } catch (error) {
        console.error("Error fetching Notion article by slug:", error);
        return null;
    }
}

/**
 * Convert a Notion page to an Article
 * @param page - The Notion page object
 * @param includeContent - If true, converts page content to markdown. If false, only extracts metadata.
 */
async function notionPageToArticle(page: any, includeContent: boolean = true): Promise<Article | null> {
    try {
        const properties = page.properties;

        const titleProp = properties.Name || properties.Title;
        const title = titleProp?.title?.[0]?.plain_text || "Untitled";

        const slugProp = properties.Slug;
        let slug = slugProp?.rich_text?.[0]?.plain_text;

        if (!slug) {
            slug = title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/--+/g, '-')
                .trim();
        }

        if (!slug) slug = page.id;

        const authorProp = properties.Author;
        let author = "Notion Author";
        if (authorProp) {
            if (authorProp.type === 'people' && authorProp.people?.length > 0) {
                author = authorProp.people[0]?.name || author;
            } else if (authorProp.type === 'rich_text' && authorProp.rich_text?.length > 0) {
                author = authorProp.rich_text[0]?.plain_text || author;
            } else if (authorProp.type === 'select' && authorProp.select) {
                author = authorProp.select.name || author;
            } else if (authorProp.type === 'multi_select' && authorProp.multi_select?.length > 0) {
                author = authorProp.multi_select[0].name || author;
            } else {
                console.log(`Unknown Author property type: ${authorProp.type}`, JSON.stringify(authorProp));
            }
        }

        // Only convert to markdown if content is needed (expensive operation)
        let content = "";
        if (includeContent) {
            const mdblocks = await n2m.pageToMarkdown(page.id);
            const mdString = n2m.toMarkdownString(mdblocks);
            content = mdString.parent || "";
        }

        return {
            id: page.id,
            slug,
            title,
            author,
            content,
            position: "Writer",
        };
    } catch (error) {
        console.error("Error converting Notion page to article:", error);
        return null;
    }
}
