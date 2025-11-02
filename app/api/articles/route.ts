import { NextResponse } from "next/server";
import { getAllDocs } from "@/lib/docsRepository";

type ApiArticle = {
  id: string;
  title: string;
  excerpt: string;
  image?: string | null;
  publishedAt?: string | null;
  slug?: string | null;
};

export async function GET() {
  try {
    const docs = await getAllDocs();

    const payload: ApiArticle[] = docs.map((d) => ({
      id: d.id,
      title: d.title,
      // simple plaintext excerpt from markdown content
      excerpt: (d.content || "").replace(/[#*_`>\-\[\]\(!)0-9]/g, "").slice(0, 200),
      image: null,
      publishedAt: null,
      slug: d.slug ?? null,
    }));

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch articles", err }, { status: 500 });
  }
}
