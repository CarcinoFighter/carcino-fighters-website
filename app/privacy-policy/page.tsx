import Script from "next/script";
import { Privacy } from "./privacy";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
};

export const revalidate = 60;

export default async function PrivacyPolicyPage() {

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        headline: "Privacy Policy",
        description: "Privacy policy for The Carcino Foundation",
        url: "https://thecarcinofoundation.org/privacy-policy",
        publisher: {
            "@type": "NGO",
            name: "The Carcino Foundation",
            url: "https://thecarcinofoundation.org",
        },
    };

    return (
        <>
            <Script
                id="privacy-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(articleSchema),
                }}
            />

            <Privacy />
        </>
    );
}
