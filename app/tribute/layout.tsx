import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forever in our Hearts",
};

export default function TechInternshipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
