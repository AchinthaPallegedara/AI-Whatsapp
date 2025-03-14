import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visual Prompt Builder",
  description: "Build your AI prompt visually",
};

export default function VisualPromptBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex min-h-screen flex-col">{children}</div>;
}
