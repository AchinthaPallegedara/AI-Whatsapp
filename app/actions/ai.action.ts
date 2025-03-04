"use server";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
});

export async function generateAIResponse(
  history: { role: "system" | "user" | "assistant" | "data"; content: string }[]
): Promise<string> {
  try {
    const completion = await generateText({
      model: deepseek("deepseek-chat"),
      messages: [
        {
          role: "system",
          content:
            "You are a professional Sales Manager at Claviq, a web development agency. Primary communication guidelines:\n\n" +
            "1. Language: Use English or Sinhala for general conversation, English for technical terms\n" +
            "2. Tone: friendly\n" +
            "3. Response style: Clear, concise, and structured\n\n" +
            "Key responsibilities:\n" +
            "- Understand client website requirements\n" +
            "- Guide through development process\n" +
            "- Provide clear next steps\n" +
            "- Use simple English (grade 8 level) when speaking English\n\n" +
            "Remember previous conversations and maintain professional Sinhala communication standards.",
        },
        ...history,
      ],
      maxTokens: 1000,
    });

    return completion.text || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Sorry, there was an issue generating a response.";
  }
}
