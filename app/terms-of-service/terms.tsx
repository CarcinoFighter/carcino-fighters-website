"use client";

import { useState, type ImgHTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUpRight } from "lucide-react"; // Import ArrowLeft, ArrowUpRight
import { Button } from "@/components/ui/button";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Footer } from "@/components/footer";

const easeSoft = [0.33, 1, 0.68, 1] as const;

function MarkdownImage({ src, alt }: { src: string; alt: string }) {
    const [error, setError] = useState(false);
    if (error) {
        return (
            <img
                src={src}
                alt={alt}
                className="rounded-lg shadow-lg my-8 max-w-full overflow-hidden h-auto w-full object-cover"
                loading="lazy"
            />
        );
    }
    return (
        <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            sizes="(max-width: 768px) 100vw, 800px"
            className="rounded-lg shadow-lg my-8 max-w-full overflow-hidden h-auto"
            onError={() => setError(true)}
        />
    );
}

// Hardcoded content for now
const markdownContent = `
**Effective Date:** 20/02/2025

Welcome to The Carcino Foundation. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions.

### 1. Acceptance of Terms

By using this site, you certify that you have read and reviewed this Agreement and that you agree to comply with its terms. If you do not want to be bound by the terms of this Agreement, you are advised to leave the website accordingly.

### 2. Medical Disclaimer

**The content on this website is for informational and educational purposes only.** *It is **not** intended to be a substitute for professional medical advice, diagnosis, or treatment.*

- Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
- Never disregard professional medical advice or delay in seeking it because of something you have read on this website.

### 3. Intellectual Property

All materials and services provided on this website are the property of The Carcino Foundation, its affiliates, directors, developers, designers, employees or licensors including all copyrights and other intellectual property.

### 4. User Accounts & Contributions

If you post personal stories, comments, or images to our site:

- You grant The Carcino Foundation a non-exclusive, license to use, reproduce, and publish that content in connection with our mission.
- You agree not to post content that is defamatory, obscene, or violates the privacy of others.

### 5. Limitation of Liability

The Carcino Foundation  is not liable for any damages that may occur to you as a result of your misuse of our website. We reserve the right to edit, modify, and change this Agreement at any time.

### 6. Governing Law

By visiting this website, you agree that the laws of India will govern these terms and conditions, or any dispute of any sort that might come between The Carcino Foundation and you.

### 7. External Links

Our website may contain links to third-party websites (such as medical journals or partner organizations). We are not responsible for the content or accuracy of these external sites.
`;

export function Terms() {

    return (
        <div>
            <div className="w-full px-5 sm:px-20 sm:pt-[80px] relative gap-6 bg-background font-giest min-h-screen overflow-x-hidden">
                <ScrollProgress className="hidden md:block" />
                <div className="relative pt-10 flex flex-col justify-center ">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full flex gap-5 flex-col sm:flex-row justify-center items-center"
                    >
                        <div className="sm:hidden">
                            <Image src={`/logo.png`} alt="Logo" width={54} height={54} />
                        </div>

                        <div className="max-w-4xl sm:px-10 sm:overflow-y-visible overflow-x-hidden">
                            <h1
                                className="  text-5xl leading-[0.9]
  sm:text-6xl sm:leading-[0.9]
  lg:text-7xl lg:leading-[0.9] whitespace-pre-wrap
  text-center font-wintersolace font-bold
  bg-gradient-to-r from-[#70429b] from-8% to-[#dfcbf0] to-60%
  bg-clip-text text-transparent py-4 px-10">
                                Terms of Service
                            </h1>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={false}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="flex flex-col w-full px-3 pt-12"
                    >
                        <div className="relative max-w-4xl mx-auto px-2 sm:px-0 overflow-hidden">
                            <article
                                className="
                            prose
                            prose-sm sm:prose-base lg:prose-lg
                            relative
                            max-w-full sm:max-w-4xl
                            dark:prose-invert
                            font-dmsans
"

                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: (props) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                                        h2: (props) => <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />,
                                        h3: (props) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
                                        p: (props) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
                                        a: (props) => (
                                            <a className="text-primary hover:text-primary/80 underline" {...props} />
                                        ),
                                        ul: (props) => <ul className="list-disc list-inside my-4" {...props} />,
                                        ol: (props) => <ol className="list-decimal pl-6 my-4 space-y-1" {...props} />,
                                        blockquote: (props) => (
                                            <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4" {...props} />
                                        ),
                                        code: (props) => (
                                            <code className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded" {...props} />
                                        ),
                                        pre: (props) => (
                                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4" {...props} />
                                        ),
                                        img: (props: ImgHTMLAttributes<HTMLImageElement>) => {
                                            const src = typeof props.src === "string" ? props.src : undefined;
                                            if (!src) return null;
                                            return <MarkdownImage src={src} alt={props.alt ?? ""} />;
                                        },
                                    }}
                                >
                                    {markdownContent}
                                </ReactMarkdown>
                            </article>
                        </div>

                    </motion.div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
