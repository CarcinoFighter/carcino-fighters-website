import { FeedbackPageClient } from "./FeedbackPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback & Suggestions",
  description: "Share your thoughts and help us improve The Carcino Foundation",
};

export default function FeedbackPage() {
  return <FeedbackPageClient />;
}
