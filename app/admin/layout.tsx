import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Panel',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
