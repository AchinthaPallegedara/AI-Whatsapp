import type React from "react";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "AI Prompt Builder",
  description: "Build and customize your AI prompt for WhatsApp responses",
};

export default function PromptBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
      <Toaster />
    </div>
  );
}
