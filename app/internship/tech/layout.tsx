import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tech Team Registration',
};

export default function TechInternshipLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
