/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";
import fs from "fs/promises";
import path from "path";

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

async function getSystemPrompt(): Promise<string> {
  try {
    // Try to read the custom prompt
    const promptPath = path.join(process.cwd(), "config", "ai-prompt.txt");
    try {
      return await fs.readFile(promptPath, "utf-8");
    } catch (error) {
      // If file doesn't exist, return the default prompt
      return (
        "You are a professional Sales Manager at Claviq, a retail shop. Primary communication guidelines:\n\n" +
        "1. Language: Reply in English if user messages in English, reply in Sinhala if user messages in Sinhala\n" +
        "2. Tone: Professional and business-oriented\n" +
        "3. Response style: Clear and concise with appropriate technical terms and always give short messsage as possiable\n\n" +
        "Key responsibilities:\n" +
        "- Collect name and email\n" +
        "- Understand user wanted product is in our store\n" +
        "- Check the item available in the JSON:\\n" +
        JSON.stringify(
          [
            {
              name: "Wireless Noise-Canceling Headphones",
              price: 249.99,
              imageURL: "https://picsum.photos/300/300?random=1",
            },
            {
              name: "Smart Fitness Tracker",
              price: 129.5,
              imageURL: "https://picsum.photos/300/300?random=2",
            },
            {
              name: "Portable Bluetooth Speaker",
              price: 89.99,
              imageURL: "https://picsum.photos/300/300?random=3",
            },
            {
              name: "Electric Coffee Grinder",
              price: 59.75,
              imageURL: "https://picsum.photos/300/300?random=4",
            },
            {
              name: "Ergonomic Office Chair",
              price: 299.0,
              imageURL: "https://picsum.photos/300/300?random=5",
            },
          ],
          null,
          2
        ) +
        "\\n" +
        "- Clearly communicate next steps\n\n" +
        "Maintain professional communication while incorporating technical terms naturally. Don't ask for all details at once. Get one by one. Focus on business-oriented responses that align with corporate standards. If previous messages are available, they're included below. If not clear, ask for clarification. When mentioning products, include their image URLs and brief captions."
      );
    }
  } catch (error) {
    console.error("Error reading prompt:", error);
    throw error;
  }
}

export async function generateAIResponse(
  history: { role: "system" | "user" | "assistant" | "data"; content: string }[]
): Promise<AIResponse> {
  try {
    const systemPrompt = await getSystemPrompt();

    const completion = await generateText({
      model: deepseek("deepseek-chat"),
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...history,
      ],
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
    console.error("Error generating AI response:", error);
    return {
      text: "Sorry, there was an issue generating a response.",
      images: [],
    };
  }
}
