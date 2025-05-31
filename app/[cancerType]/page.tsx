// pages/[cancerType]/index.tsx
import { getAllDocs, getDocBySlug } from '../../lib/docsRepository';
import { supabase } from '@/lib/initSupabase';
import { notFound } from 'next/navigation';


interface CancerDocPageProps {
  params: {
    cancerType: string;
  };
}

export default async function CancerDocPage(props: CancerDocPageProps) {
  const params = await props.params;
  const slug = params.cancerType;
  const doc = await getAllDocs().then(docs => docs.find(d => d.slug === slug));

  if (!doc) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6">{doc.title}</h1>
      <div className="prose lg:prose-xl max-w-none" dangerouslySetInnerHTML={{ __html: doc.content }} />
      <div className="mt-8 text-sm text-gray-500">
        Last updated: {doc.last_updated ? new Date(doc.last_updated).toLocaleDateString() : 'Unknown'}
      </div>
    </div>
  );
}