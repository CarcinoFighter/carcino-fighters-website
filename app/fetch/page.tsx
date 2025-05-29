/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button } from "@/components/ui/button"
import axios from "axios";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import Image from "next/image";
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

interface InlineObjectElement {
  inlineObjectId?: string;
}

interface ParagraphElement {
  textRun?: TextRun;
  inlineObjectElement?: InlineObjectElement;
}

interface Paragraph {
  elements: ParagraphElement[];
  paragraphStyle?: {
    namedStyleType?: string;
    lineSpacing?: number;
    alignment?: string;
  };
}

interface ImageProperties {
  contentUri?: string;
  size?: {
    width?: {
      magnitude?: number;
      unit?: string;
    };
    height?: {
      magnitude?: number;
      unit?: string;
    };
  };
}

interface InlineObject {
  inlineObjectProperties?: {
    embeddedObject?: {
      imageProperties?: ImageProperties;
    };
  };
}

interface StructuralElement {
  paragraph?: Paragraph;
  sectionBreak?: any;
  table?: any;
}

interface DocumentContent {
  body?: {
    content?: StructuralElement[];
  };
  inlineObjects?: {
    [key: string]: InlineObject;
  };
}

export default function Test() {
  const [plainText, setPlainText] = useState("");
  const [formattedContent, setFormattedContent] = useState<JSX.Element[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderImage = (inlineObjectId: string, inlineObjects: Record<string, InlineObject>) => {
    const inlineObject = inlineObjects[inlineObjectId];
    const imageProps = inlineObject?.inlineObjectProperties?.embeddedObject?.imageProperties;
    
    if (!imageProps?.contentUri) return null;

    const width = imageProps.size?.width?.magnitude || 300;
    const height = imageProps.size?.height?.magnitude || 200;

    return (
      <Image
        key={`image-${inlineObjectId}`}
        src={imageProps.contentUri}
        alt=" Image from Google Doc"
        style={{
          width: `${width}${imageProps.size?.width?.unit || 'px'}`,
          height: `${height}${imageProps.size?.height?.unit || 'px'}`,
          maxWidth: '100%',
          margin: '16px 0',
          borderRadius: '8px',
        }}
        className="my-4 rounded-lg shadow-md"
      />
    );
  };

  const parseDocumentContent = (docContent: DocumentContent) => {
    let plainTextResult = "";
    const formattedResult: JSX.Element[] = [];
    let currentParagraph: JSX.Element[] = [];
    const { inlineObjects = {}, body } = docContent;
    const contents = body?.content || [];

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
            };

            currentParagraph.push(
              <span key={`${plainTextResult.length}-${content}`} style={style}>
                {content}
              </span>
            );
          } else if (el.inlineObjectElement?.inlineObjectId) {
            const imageElement = renderImage(
              el.inlineObjectElement.inlineObjectId,
              inlineObjects
            );
            if (imageElement) {
              currentParagraph.push(imageElement);
            }
          }
        });

        // Only add paragraph if it has content
        if (currentParagraph.length > 0) {
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
      const response = await axios.get<{ data: DocumentContent }>(`${apiRoute}/doc-fetch`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { plainTextResult, formattedResult } = parseDocumentContent(response.data.data);
      setPlainText(plainTextResult);
      setFormattedContent(formattedResult);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-8 pt-[68px]">
      <h1 className="text-2xl font-bold mb-6">Google Docs Content Fetcher</h1>

      <Button
        className="py-4 text-lg font-medium cursor-pointer"
        onClick={testfetch}
        variant="default"
        size="lg"
        disabled={isSubmitting}
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

      <div className="w-full max-w-4xl bg-background rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Formatted Content:</h2>
        <div className="prose max-w-none">
          {formattedContent}
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4">Plain Text:</h2>
        <div className="p-4 bg-background rounded whitespace-pre-wrap">
          {plainText}
        </div>
      </div>

      <p className="mt-8 text-sm text-foreground">
        This page demonstrates fetching and displaying Google Docs content with formatting and images.
      </p>
    </div>
  );
}