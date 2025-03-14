"use server";

import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
});

interface ImageInfo {
  url: string;
  caption: string;
}

interface AIResponse {
  text: string;
  images: ImageInfo[];
}

export async function generateSandboxResponse(
  message: string,
  history: { role: "user" | "assistant"; content: string }[],
  systemPrompt: string
): Promise<AIResponse> {
  try {
    // Convert the history to the format expected by the AI
    const formattedHistory = history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Add the new message to the history
    const messages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      ...formattedHistory,
      {
        role: "user" as const,
        content: message,
      },
    ];

    const completion = await generateText({
      model: deepseek("deepseek-chat"),
      messages,
      maxTokens: 1000,
      temperature: 1.3,
    });

    const response: AIResponse = {
      text: completion.text || "Sorry, I couldn't generate a response.",
      images: [],
    };

    // Extract all image URLs and captions from the response
    const imageMatches = response.text.matchAll(
      /imageURL: "(https:\/\/[^"]+)"/g
    );
    for (const match of imageMatches) {
      const imageUrl = match[1];
      const captionMatch = response.text.match(/name: "([^"]+)"/);
      const caption = captionMatch ? captionMatch[1] : "Product Image";
      response.images.push({ url: imageUrl, caption });
    }

    // Remove all image URLs from the text response
    response.text = response.text.replace(/imageURL: "[^"]+"/g, "").trim();

    return response;
  } catch (error) {
    console.error("Error generating sandbox response:", error);
    return {
      text: "Sorry, there was an issue generating a response.",
      images: [],
    };
  }
}
