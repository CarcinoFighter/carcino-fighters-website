"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { usePathname } from "next/navigation";

export const LANGUAGES = [
  { code: "en", label: "English", nativeName: "English" },
  { code: "es", label: "Spanish", nativeName: "Español" },
  { code: "fr", label: "French", nativeName: "Français" },
  { code: "de", label: "German", nativeName: "Deutsch" },
  { code: "hi", label: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", label: "Bengali", nativeName: "বাংলা" },
  { code: "ta", label: "Tamil", nativeName: "தமிழ்" },
  { code: "zh-CN", label: "Chinese (Simplified)", nativeName: "简体中文" },
];

// Language codes that have a hand-crafted JSON locale file in /public/locales/
const LOCALE_JSON_CODES = new Set(["hi", "bn"]);

const STORAGE_KEY = "cf_language";
const ORIGINAL_KEY = "__cf_original__";

interface TranslationContextType {
  currentLang: string;
  isTranslating: boolean;
  setLanguage: (lang: string) => void;
}

const TranslationContext = createContext<TranslationContextType>({
  currentLang: "en",
  isTranslating: false,
  setLanguage: () => {},
});

export function useTranslation() {
  return useContext(TranslationContext);
}

// In-memory cache for loaded locale JSON files so we only fetch once per session
const localeCache = new Map<string, Record<string, string>>();

/** Fetch the hand-crafted locale JSON for a language, with in-memory caching. */
async function loadLocaleMap(lang: string): Promise<Record<string, string>> {
  if (localeCache.has(lang)) return localeCache.get(lang)!;
  try {
    const res = await fetch(`/locales/${lang}.json`);
    if (!res.ok) return {};
    const raw = await res.json();
    // Strip the _meta key — it's not a translation pair
    const { _meta, ...map } = raw as Record<string, string>;
    void _meta;
    localeCache.set(lang, map);
    return map;
  } catch {
    return {};
  }
}

// Walk the DOM and collect all visible text nodes
function getTextNodes(root: Node): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName.toUpperCase();
      if (["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG"].includes(tag))
        return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-notranslate]"))
        return NodeFilter.FILTER_REJECT;
      const text = node.textContent?.trim() ?? "";
      if (!text) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    nodes.push(node as Text);
  }
  return nodes;
}

function saveOriginals(nodes: Text[]) {
  for (const node of nodes) {
    if (!(node as unknown as Record<string, string>)[ORIGINAL_KEY]) {
      (node as unknown as Record<string, string>)[ORIGINAL_KEY] =
        node.textContent ?? "";
    }
  }
}

function restoreOriginals(nodes: Text[]) {
  for (const node of nodes) {
    const orig = (node as unknown as Record<string, string>)[ORIGINAL_KEY];
    if (orig !== undefined) node.textContent = orig;
  }
}

// Translate via our server-side API route (one string per request, parallelized)
async function translateBatch(
  texts: string[],
  targetLang: string
): Promise<string[]> {
  const results = await Promise.all(
    texts.map(async (t) => {
      try {
        const r = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: t, targetLang }),
        });
        if (!r.ok) return t;
        const d = await r.json();
        return d.translatedText ?? t;
      } catch {
        return t;
      }
    })
  );
  return results;
}

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentLang, setCurrentLang] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const pathname = usePathname();

  // Stable ref so effects always read the latest language without needing it as a dep
  const currentLangRef = useRef("en");

  /**
   * Core translation function.
   *
   * Pass 1 — JSON locale map (instant, no network):
   *   For languages with a hand-crafted JSON file, look up each text node's
   *   original English value in the map and apply the translation immediately.
   *   This covers all known system strings with zero latency.
   *
   * Pass 2 — Auto-translate API (async, network):
   *   Any nodes that weren't covered by the JSON map are sent to the API.
   *   For languages without a JSON file, all nodes go here.
   */
  const applyTranslation = useCallback(async (lang: string) => {
    const allNodes = getTextNodes(document.body);

    if (lang === "en") {
      restoreOriginals(allNodes);
      setIsTranslating(false);
      return;
    }

    // Only process nodes not yet translated on this page
    const fresh = allNodes.filter(
      (node) => !(node as unknown as Record<string, string>)[ORIGINAL_KEY]
    );

    if (fresh.length === 0) return;

    setIsTranslating(true);
    saveOriginals(fresh);

    // ── Pass 1: apply JSON locale map immediately ────────────────────────────
    let needsApi = fresh;

    if (LOCALE_JSON_CODES.has(lang)) {
      const localeMap = await loadLocaleMap(lang);

      if (Object.keys(localeMap).length > 0) {
        const stillUntranslated: Text[] = [];

        for (const node of fresh) {
          const orig = (
            node as unknown as Record<string, string>
          )[ORIGINAL_KEY]?.trim();

          if (orig && Object.prototype.hasOwnProperty.call(localeMap, orig)) {
            node.textContent = localeMap[orig];
          } else {
            stillUntranslated.push(node);
          }
        }

        needsApi = stillUntranslated;
      }
    }

    // ── Pass 2: send remaining texts to the auto-translate API ───────────────
    const uniqueTexts = [
      ...new Set(
        needsApi
          .map((n) => (n as unknown as Record<string, string>)[ORIGINAL_KEY] ?? "")
          .filter(Boolean)
      ),
    ];

    if (uniqueTexts.length === 0) {
      setIsTranslating(false);
      return;
    }

    const translated = await translateBatch(uniqueTexts, lang);
    const map = new Map(uniqueTexts.map((t, i) => [t, translated[i]]));

    for (const node of needsApi) {
      const orig = (node as unknown as Record<string, string>)[ORIGINAL_KEY];
      if (orig && map.has(orig)) {
        node.textContent = map.get(orig)!;
      }
    }

    setIsTranslating(false);
  }, []);

  // On mount: restore persisted language
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved !== "en") {
      setCurrentLang(saved);
      currentLangRef.current = saved;
      // Small delay so React hydration finishes before we walk the DOM
      setTimeout(() => applyTranslation(saved), 400);
    }
  }, [applyTranslation]);

  // On every route change: re-translate the new page content.
  // Multiple staggered passes catch content that streams in at different times
  // (Suspense, lazy components, data fetches, etc.)
  useEffect(() => {
    const lang = currentLangRef.current;
    if (lang === "en") return;

    const t1 = setTimeout(() => applyTranslation(lang), 350);
    const t2 = setTimeout(() => applyTranslation(lang), 1000);
    const t3 = setTimeout(() => applyTranslation(lang), 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname, applyTranslation]);

  const setLanguage = useCallback(
    (lang: string) => {
      setCurrentLang(lang);
      currentLangRef.current = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      applyTranslation(lang);
    },
    [applyTranslation]
  );

  return (
    <TranslationContext.Provider value={{ currentLang, isTranslating, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}
