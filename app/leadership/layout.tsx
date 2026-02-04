import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Leadership',
};

export default function LeadershipLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
