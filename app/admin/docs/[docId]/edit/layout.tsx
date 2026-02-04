import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edit Article',
};

export default function EditDocLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
