import { notFound } from "next/navigation";
import Script from "next/script";
import { Footer } from "@/components/footer";
import { Terms } from "./terms";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
};

export const revalidate = 60;

export default async function EditorsNotePage() {

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Terms",
        headline: "Terms of Service",
        description: "Terms of service",
        url: "https://thecarcinofoundation.org/terms-of-service",
        publisher: {
            "@type": "NGO",
            name: "The Carcino Foundation",
            url: "https://thecarcinofoundation.org",
        },
    };

    return (
        <>
            <Script
                id="article-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(articleSchema),
                }}
            />

            <Terms />
        </>
    );
}
