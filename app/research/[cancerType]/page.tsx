
"use client"
import { getDocBySlug } from '@/lib/docsRepository';
import { JSX, useEffect, useState } from 'react';
import { useParams } from 'next/navigation'
import React from 'react';
import Image from "next/image";
import { getDocJson } from '@/lib/googleDrive';

interface CancerDoc {
  id: string;
  slug: string;
  title: string | null | undefined;
  content: JSON;
  google_doc_id: string;
  last_updated: string | null | undefined;
}

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


export default function CancerDocPage() {
  const params = useParams();
  const cancerType = params?.cancerType as string | undefined;
  const [formattedContent, setFormattedContent] = useState<JSX.Element[]>([]);
  const [loading, setLoading] = useState(true);

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

    return formattedResult;
  };

  useEffect(() => {
    console.log('Fetching document for cancerType:', cancerType);
    const fetchDoc = async () => {
      if (typeof cancerType === 'string') {


        const fetchedDoc = await getDocBySlug(cancerType);
        const fetchJson = fetchedDoc?.content as StructuralElement[] | undefined;
        const formattedResult = parseDocumentContent(fetchJson || []);
        setFormattedContent(formattedResult);
      } else if (cancerType !== undefined) {
        console.warn(`Invalid cancerType slug: ${cancerType}`);
      }
    };
    if (cancerType !== undefined) {
      fetchDoc();
      setLoading(false);
    }
  }, [cancerType]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 pt-[68px]">
        <p>Loading...</p>
      </div>
    );
  }

  if (cancerType !== undefined && !formattedContent && !loading) {
    return (
      <div className=" w-full text-center py-12 px-4 pt-[68px]">
        <p>This research is not available</p>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center py-12 px-4 pt-[68px] bg-background ">
      <div
        className="max-w-3xl md:max-w-4xl text-foreground"
      >
        {formattedContent}
      </div>
      <div className="mt-8 text-sm text-foreground-secondary">
        {/* Last updated: {doc!.last_updated ? new Date(doc!.last_updated).toLocaleDateString() : 'Unknown'} */}
      </div>
    </div>

  );
}