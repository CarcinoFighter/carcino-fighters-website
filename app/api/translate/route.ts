import { NextRequest, NextResponse } from "next/server";

// Proxy to Google's unofficial translate API — no API key needed, runs server-side
// This avoids loading the Google Translate widget client-side entirely.
export async function POST(req: NextRequest) {
  try {
    const { text, targetLang, sourceLang = "en" } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: "Missing text or targetLang" }, { status: 400 });
    }

    // If target is English (source), just return as-is
    if (targetLang === "en") {
      return NextResponse.json({ translatedText: text });
    }

    // Batch: text can be a string or array of strings
    const texts: string[] = Array.isArray(text) ? text : [text];

    // Build query string with multiple q= params
    const params = new URLSearchParams();
    params.append("client", "gtx");
    params.append("sl", sourceLang);
    params.append("tl", targetLang);
    params.append("dt", "t");
    texts.forEach((t) => params.append("q", t));

    const url = `https://translate.googleapis.com/translate_a/single?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
      next: { revalidate: 3600 }, // Cache translations for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse the response — Google returns a nested array
    // data[0] is an array of [translatedSegment, originalSegment, ...]
    const translatedText = data[0]
      .map((segment: [string, ...unknown[]]) => segment[0])
      .join("");

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("[translate] Error:", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}
