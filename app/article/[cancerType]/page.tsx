

"use client";
import { getDocBySlug } from "@/lib/docsRepository";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";

interface ArticleData {
  id: string;
  slug: string;
  title: string;
  content: string;
}

export default function ArticlePage() {
  const params = useParams();
  const cancerType = params?.cancerType as string | undefined;
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      if (typeof cancerType === "string") {
        try {
          const fetchedDoc = await getDocBySlug(cancerType);
          setArticle(fetchedDoc);
        } catch (error) {
          console.error("Error fetching article:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (cancerType !== undefined) {
      fetchDoc();
    }
  }, [cancerType]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 pt-[68px] min-h-screen">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="w-full text-foreground text-center py-12 px-4 pt-[68px] min-h-screen">
        <p className="text-lg font-giest">This research is not available</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background font-giest">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full bg-gradient-to-b from-primary/10 to-background pt-[80px]"
      >
        <div className="max-w-4xl mx-auto px-6">
          <Label className="inline-block mb-4 text-primary bg-primary/10 px-3 py-1 rounded-full">
            Research Article
          </Label>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            {article.title}
          </h1>
        </div>
      </motion.div>

      {/* Article Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-4xl mx-auto px-6 py-12"
      >
        <article className="prose prose-lg dark:prose-invert prose-headings:font-giest prose-p:font-giest prose-a:text-primary hover:prose-a:text-primary/80 prose-pre:bg-muted prose-pre:text-muted-foreground max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: (props) => (
                <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
              ),
              h2: (props) => (
                <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />
              ),
              h3: (props) => (
                <h3 className="text-xl font-bold mt-6 mb-3" {...props} />
              ),
              p: (props) => <p className="my-4 leading-relaxed" {...props} />,
              a: (props) => (
                <a
                  className="text-primary hover:text-primary/80 underline"
                  {...props}
                />
              ),
              ul: (props) => (
                <ul className="list-disc list-inside my-4" {...props} />
              ),
              ol: (props) => (
                <ol className="list-decimal list-inside my-4" {...props} />
              ),
              blockquote: (props) => (
                <blockquote
                  className="border-l-4 border-primary/30 pl-4 italic my-4"
                  {...props}
                />
              ),
              code: (props) => (
                <code
                  className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                  {...props}
                />
              ),
              pre: (props) => (
                <pre
                  className="bg-muted p-4 rounded-lg overflow-x-auto my-4"
                  {...props}
                />
              ),
              img: (props) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="rounded-lg shadow-lg my-8 max-w-full"
                  alt=""
                  {...props}
                />
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </article>
      </motion.div>

      <Footer />
    </div>
  );
}
