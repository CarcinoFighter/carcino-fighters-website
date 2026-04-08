import React, { isValidElement, cloneElement, ReactNode } from "react";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";

export type GlossaryEntry = {
  id: string;
  word: string;
  meaning: string;
  aliases?: string; // Comma-separated variations
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function withGlossary(node: ReactNode, glossary: GlossaryEntry[]): ReactNode {
  if (!glossary || glossary.length === 0 || !node) return node;

  const allWords: string[] = [];
  glossary.forEach(g => {
    allWords.push(escapeRegExp(g.word));
    if (g.aliases) {
      g.aliases.split(',').forEach(alias => {
        const trimmed = alias.trim();
        if (trimmed) allWords.push(escapeRegExp(trimmed));
      });
    }
  });

  allWords.sort((a, b) => b.length - a.length);
  
  const regex = new RegExp(`\\b(${allWords.join('|')})\\b`, 'gi');

  const processString = (text: string): ReactNode[] | string => {
    const parts = text.split(regex);
    if (parts.length === 1) return text;

    return parts.map((part, i) => {
      // split with capturing group puts matches at odd indices
      if (i % 2 === 0) return part;

      const lowerMatch = part.toLowerCase();
      const entry = glossary.find((g) => {
        if (g.word.toLowerCase() === lowerMatch) return true;
        if (g.aliases) {
          return g.aliases.split(',').some(alias => alias.trim().toLowerCase() === lowerMatch);
        }
        return false;
      });
      
      if (entry) {
        return (
          <GlossaryTooltip key={`${entry.id}-${i}`} word={entry.word} meaning={entry.meaning}>
            {part}
          </GlossaryTooltip>
        );
      }
      return part;
    });
  };

  const processNode = (n: ReactNode): ReactNode => {
    if (typeof n === "string") {
      return processString(n);
    }
    if (Array.isArray(n)) {
      return n.map((child, i) => React.Children.toArray(processNode(child)));
    }
    if (isValidElement(n)) {
      if (typeof n.type === 'string' && ['code', 'pre', 'a'].includes(n.type)) {
        return n;
      }
      if (n.props && (n.props as any).children) {
        return cloneElement(n, { ...n.props, children: processNode((n.props as any).children) } as any);
      }
    }
    return n;
  };

  return processNode(node);
}
