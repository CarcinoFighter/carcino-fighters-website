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
## **Bridging the Gap: Making Cancer Science Speak to Everyone**

In the world of medical research, information is the most powerful weapon we have against cancer. However, that weapon is only effective if people can understand how to use it. When we founded our non-profit one year ago, our mission was simple: to take complex, high-level research from the world’s leading international organizations and translate it into a language that everyone, no matter how little they know about medicine, can understand.

As the world observes **World Cancer Day** this February 4th, we are proud to stand with the global community. For us, this day isn't just about awareness; it's a precursor to our own first anniversary on February 20th. We are marking a year of tearing down the walls of "medical jargon" and replacing fear with clarity.

### **What’s New for Our Second Year?**

To honor the spirit of World Cancer Day, we are evolving from an information hub into a complete support ecosystem. Here is how we are stepping up our efforts this year:

- **The Launch of ‘Survivor Stories’**: We believe that while data informs, stories heal. Our new website will include real-life stories from people who have been down the road before, offering hope and advice to those newly diagnosed.
- **Expert-Led Advocacy:** We are extremely proud to announce that we have five professional oncologists joining our board. This ensures that while our language is simple, our scientific accuracy is not compromised.
- **NGO Collaboration:** We are teaming up with a partner NGO to reach out to more people, ensuring that even the underserved have access to life-saving information.
- **On-Ground Awareness Camps:** Having digital presence is one thing, but we are taking our mission on-ground this year. Our team of doctors will conduct awareness camps in the community, providing a platform for people to ask questions, clear doubts, and learn about early detection directly from the experts.

### **Our Promise to You**

Our goal for 2026 is to move beyond the screen. We want to be in the rooms where the questions are asked and in the homes where the answers are needed. By bringing together simplified research with real human experiences and professional medical guidance, we are ensuring that no one has to face the complexity of cancer alone.

**Join us this World Cancer Day in spreading the word, and stay tuned for our anniversary milestone on February 20th as we make 2026 the year of clarity and community.**
`;

export function EditorsNoteClient() {
    const [readmore, setReadmore] = useState(false);

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
                                Editor's Note
                            </h1>

                            <div className="flex flex-col items-center justify-center pt-6 sm:pt-10 gap-1">
                                <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-center font-inter">
                                    <span className="text-xs sm:text-sm">Soushree Chakraborty</span>
                                    <span className="text-xs sm:text-sm text-foreground/50">|</span>
                                    <span className="text-xs sm:text-sm text-foreground/50">
                                        Chief Research Officer
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-center font-inter">
                                    <span className="text-xs sm:text-sm">Jiya Haldar</span>
                                    <span className="text-xs sm:text-sm text-foreground/50">|</span>
                                    <span className="text-xs sm:text-sm text-foreground/50">
                                        Chief Editor
                                    </span>
                                </div>
                            </div>
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
                                className={`
                            prose
                            prose-sm sm:prose-base lg:prose-lg
                            relative
                            max-w-full sm:max-w-4xl
                            dark:prose-invert
                            font-dmsans
                            ${readmore ? "" : "max-h-[50vh] sm:max-h-[60vh] overflow-hidden"}
`}

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

                                <div className={`absolute bottom-0 left-0 right-0 h-[80%]
                            bg-gradient-to-t from-background to-transparent
                            ${readmore ? "hidden" : ""}`} />
                            </article>

                            <Button
                                variant="secondary"
                                aria-expanded={readmore}
                                onClick={() => setReadmore((s) => !s)}
                                className="mx-auto w-fit my-10 rounded-full bg-primary/44 backdrop-blur-xs flex justify-center"
                            >
                                {readmore ? "Show less" : "Read more"}
                                <ArrowDown className={`transition-transform ${readmore ? "rotate-180" : ""}`} />
                            </Button>
                        </div>

                        {/* Bottom Link to Articles */}
                        <div className="flex flex-col gap-10 mt-20 items-center pb-20">
                            <Button
                                variant="ghost"
                                className="relative px-6 py-5 rounded-full overflow-hidden backdrop-blur-sm inset-shadow-foreground/10 font-dmsans font-medium transition-all duration-300"
                            >
                                <Link
                                    href="/article"
                                    className="relative z-10 flex items-center gap-2"
                                >
                                    Visit the Articles Page{" "}
                                    <ArrowUpRight className="transition-transform" />
                                </Link>

                                {/* Liquid glass layers */}
                                <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                                <div className="absolute inset-0 liquidGlass-tint pointer-events-none"></div>
                                <div className="liquidGlass-shine  relative w-[100.8%] h-[100%] !top-[0px] !left-[-1px]"></div>
                                <div className="absolute inset-0 liquidGlass-text pointer-events-none"></div>
                            </Button>
                        </div>

                    </motion.div>
                </div>
            </div >
            <Footer />
        </div >
    );
}
