
"use client"
import { getDocBySlug } from '@/lib/docsRepository';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'

interface CancerDoc {
  id: string;
  slug: string;
  title: string | null | undefined;
  content: string;
  google_doc_id: string;
  last_updated: string | null | undefined;
}

export default function CancerDocPage() {
  const params = useParams();
  const cancerType = params?.cancerType as string | undefined;
  const [doc, setDoc] = useState<CancerDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Fetching document for cancerType:', cancerType);
    const fetchDoc = async () => {
      if (typeof cancerType === 'string') {
        const fetchedDoc = await getDocBySlug(cancerType);
        setDoc(fetchedDoc);
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

  if (cancerType !== undefined && !doc && !loading) {
    return (
      <div className=" w-full text-center py-12 px-4 pt-[68px]">
        <p>This research is not available</p>
      </div>
    );
  }

  return (
      <div className="w-full flex items-center justify-center py-12 px-4 pt-[68px] bg-white">
        <div
          className="max-w-4xl text-foreground"
          dangerouslySetInnerHTML={{ __html: doc!.content }}
        />
        <div className="mt-8 text-sm text-foreground-secondary">
          Last updated: {doc!.last_updated ? new Date(doc!.last_updated).toLocaleDateString() : 'Unknown'}
        </div>
      </div>

  );
}