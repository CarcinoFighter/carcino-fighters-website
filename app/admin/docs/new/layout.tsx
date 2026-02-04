import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'New Article',
};

export default function NewDocLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
