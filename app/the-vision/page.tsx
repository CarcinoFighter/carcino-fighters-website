import { notFound } from "next/navigation";
import Script from "next/script";
import { Footer } from "@/components/footer";
import { EditorsNoteClient } from "./EditorsNoteClient";

export const revalidate = 60;

export default async function EditorsNotePage() {

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Editor's Note",
        description: "A note from the editor.",
        url: "https://thecarcinofoundation.org/the-vision",
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

            <EditorsNoteClient />
        </>
    );
}
