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

export async function getNotionArticles(): Promise<Article[]> {
    try {
        if (!NOTION_SECRET || !DATABASE_ID) {
            console.warn("Notion environment variables are not set.");
            return [];
        }

        console.log(`Querying Notion Database via fetch: ${DATABASE_ID}`);
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
                        const article = await notionPageToArticle(page);
                        return article;
                    } catch (e) {
                        console.error(`Error mapping page ${page.id}:`, e);
                        return null;
                    }
                })
        );

        const filteredArticles = articles.filter((a: Article | null): a is Article => a !== null);
        console.log(`Final processed Notion articles count: ${filteredArticles.length}`);
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
        const articles = await getNotionArticles();
        const article = articles.find(a => a.slug === slug || a.id === slug || a.id.replace(/-/g, '') === slug.replace(/-/g, ''));

        if (article) return article;

        if (slug.length >= 32) {
            try {
                const page = await notionFetch(`pages/${slug}`);
                if (page) return await notionPageToArticle(page);
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

async function notionPageToArticle(page: any): Promise<Article | null> {
    try {
        const mdblocks = await n2m.pageToMarkdown(page.id);
        const mdString = n2m.toMarkdownString(mdblocks);

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

        return {
            id: page.id,
            slug,
            title,
            author,
            content: mdString.parent || "",
            position: "Writer",
        };
    } catch (error) {
        console.error("Error converting Notion page to article:", error);
        return null;
    }
}
