import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chat Sandbox",
  description: "Test your AI assistant with different prompts",
};

export default function ChatSandboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex min-h-screen flex-col">{children}</div>;
}
