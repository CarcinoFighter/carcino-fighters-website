"use client";

import { useState, type ImgHTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import Image from "next/image";
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
**Last Updated: 20/02/2025**

The Carcino Foundation values your trust, and we understand the importance of protecting your privacy. We want to make sure that you understand how your information is collected and used by us. This Privacy Statement describes 

- what information we collect about you,
- including what and how we collect it;
- how we use it,
- with whom we may share it,
- what choices you have regarding our use of your information.

This statement applies to all information collected by **The Carcino Foundation** through our "Services," which include:

- **Direct Communications:** Any information shared via electronic, written, or oral communication.
- **Digital Services:** Data collected through our website, including interactions with integrated **Artificial Intelligence (AI) technologies**.
- **Offline & Third-Party Data:** Information gathered through offline interactions or received from authorized third parties.

**Your Consent:** By accessing our Services or providing your personal information to us, you acknowledge and agree to the practices outlined in this Privacy Statement.

When you engage with The Carcino Foundation we collect a variety of information . In general, the type of information we collect on you will depend on how you choose to interact with The Carcino Foundation. For instance, if you are using our website to gather or search information on cancer related topics we will need a type of information from you. 

The type of data we collect depends on how you interact with The Carcino Foundation. We collect **"Personal Information",** data that identifies you directly or can be linked to you as an individual.

### **Categories of Data:**

- **Contact Information:** Such as your name, email address, mailing address, and phone number.
- **Demographic Information:** Basic details that help us understand our community (e.g., age or location).
- **Health Information:** Information regarding your relationship to cancer, shared voluntarily to help us provide relevant resources.
- **Employment Information:** Professional history and qualifications (relevant to staff and volunteers).
- **Internet Activity:** Data collected through cookies and tracking technologies regarding how you use our site (unless you choose to opt-out).

### How We Collect Information

We collect data through several primary channels:

- **Site Use & Public Forums:** Information provided via our website.
    
    **(Note:** Information posted in public forums becomes public. Please use caution when sharing personal details.) 
    
- **Event Registration:** When registering for events, you may share your relationship to cancer (e.g., survivor or caregiver) to help us tailor your experience.
- **Employment & Volunteering:** We collect work history and may conduct background checks depending on the role.
- **Third-Party Partnerships:** We receive information from partners during fundraising campaigns or promotions. This may include donor reports (name, contact info, and donation amount).

### Data Protection and Security

### Third-Party Sharing

### Cookies and Tracking

### Your Rights

### Contact Us`;

export function Privacy() {
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
                            <Image src={"/logo.png"} alt="Logo" width={54} height={54} />
                        </div>

                        <div className="max-w-4xl sm:px-10 sm:overflow-y-visible overflow-x-hidden">
                            <h1
                                className="  text-5xl leading-[0.9]
  sm:text-6xl sm:leading-[0.9]
  lg:text-7xl lg:leading-[0.9] whitespace-pre-wrap
  text-center font-wintersolace font-bold
  bg-gradient-to-r from-[#70429b] from-8% to-[#dfcbf0] to-60%
  bg-clip-text text-transparent py-4 px-10">
                                Privacy Policy
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
