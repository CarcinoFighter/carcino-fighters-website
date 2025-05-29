/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button } from "@/components/ui/button"
import axios from "axios";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import React, { JSX } from "react";
import { useState } from "react";

interface TextRun {
  content: string;
  textStyle?: {
    fontSize?: {
      magnitude?: number;
      unit?: string;
    };
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    foregroundColor?: {
      color?: {
        rgbColor?: {
          red?: number;
          green?: number;
          blue?: number;
        };
      };
    };
  };
}

interface ParagraphElement {
  textRun?: TextRun;
  inlineObjectElement?: any;
}

interface Paragraph {
  elements: ParagraphElement[];
  paragraphStyle?: {
    namedStyleType?: string;
    lineSpacing?: number;
    alignment?: string;
  };
}

interface StructuralElement {
  paragraph?: Paragraph;
  sectionBreak?: any;
  table?: any;
}

export default function Test() {
  const [plainText, setPlainText] = useState("");
  const [formattedContent, setFormattedContent] = useState<JSX.Element[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parseDocumentContent = (contents: StructuralElement[]) => {
    let plainTextResult = "";
    const formattedResult: JSX.Element[] = [];
    let currentParagraph: JSX.Element[] = [];

    contents.forEach((item) => {
      if (item.paragraph?.elements) {
        const paragraphStyle = item.paragraph.paragraphStyle?.namedStyleType || 'NORMAL_TEXT';

        item.paragraph.elements.forEach((el) => {
          if (el.textRun?.content) {
            const { content, textStyle } = el.textRun;
            plainTextResult += content;

            const style: React.CSSProperties = {
              fontSize: textStyle?.fontSize?.magnitude ? `${textStyle.fontSize.magnitude}pt` : undefined,
              fontWeight: textStyle?.bold ? 'bold' : undefined,
              fontStyle: textStyle?.italic ? 'italic' : undefined,
              textDecoration: textStyle?.underline ? 'underline' : undefined,
              // color: getTextColor(textStyle?.foregroundColor?.color),
            };

            currentParagraph.push(
              <span key={`${plainTextResult.length}-${content}`} style={style}>
                {content}
              </span>
            );
          }
        });

        // Wrap paragraph content based on paragraph style
        if (paragraphStyle.startsWith('HEADING')) {
          const level = parseInt(paragraphStyle.replace('HEADING_', ''));
          formattedResult.push(
            React.createElement(
              `h${Math.min(level, 6)}`,
              { key: `heading-${formattedResult.length}` },
              ...currentParagraph
            )
          );
        } else {
          formattedResult.push(
            <p key={`para-${formattedResult.length}`} className="my-2">
              {currentParagraph}
            </p>
          );
        }

        currentParagraph = [];
      }
    });

    return { plainTextResult, formattedResult };
  };

  const testfetch = async () => {
    setIsSubmitting(true);
    try {
      const apiRoute = process.env.NEXT_PUBLIC_API_ROUTE;
      const response = await axios.get(`${apiRoute}/doc-fetch`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const contents: StructuralElement[] = response.data.data.body.content;
      const { plainTextResult, formattedResult } = parseDocumentContent(contents);

      setPlainText(plainTextResult);
      setFormattedContent(formattedResult);
      setIsSubmitting(false);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-8 mt-[68px]">
      <h1 className="text-2xl font-bold mb-6">Google Docs Content Fetcher</h1>

      <Button
        className="mt-4 mb-8"
        onClick={testfetch}
        variant="default"
        size="lg"
      >
        {isSubmitting ? (
          <>
            Fetching <LoaderCircle className="animate-spin ml-2" />
          </>
        ) : (
          <>
            Fetch Google Doc Content <ArrowUpRight className="ml-2" />
          </>
        )}
        
      </Button>

      <div className="w-full max-w-4xl bg-background rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Formatted Content:</h2>
        <div className="prose max-w-none">
          {formattedContent}
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4">Plain Text:</h2>
        <div className="p-4 bg-background rounded">
          {plainText}
        </div>
      </div>

      <p className="mt-8 text-sm text-foreground">
        This page demonstrates fetching and displaying Google Docs content with formatting.
      </p>
    </div>
  );
}