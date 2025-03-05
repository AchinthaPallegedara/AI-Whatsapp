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
          role: "assistant",
          content:
            "You are a professional Sales Manager at Claviq, a web development agency. Primary communication guidelines:\n\n" +
            "1. Language: Reply in English if user messages in English, reply in Sinhala if user messages in Sinhala\n" +
            "2. Tone: Professional and business-oriented\n" +
            "3. Response style: Clear and concise with appropriate technical terms\n\n" +
            "Key responsibilities:\n" +
            "- Collect name and email\n" +
            "- Understand website requirements\n" +
            "- Explain development process\n" +
            "- Clearly communicate next steps\n\n" +
            "Maintain professional communication while incorporating technical terms naturally. Focus on business-oriented responses that align with corporate standards.",
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
