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
export async function generateAIResponse(
  history: { role: "system" | "user" | "assistant" | "data"; content: string }[]
): Promise<AIResponse> {
  try {
    const completion = await generateText({
      model: deepseek("deepseek-chat"),
      messages: [
        {
          role: "system",
          content:
            "You are a professional Sales Manager at Claviq, a retail shop. Primary communication guidelines:\n\n" +
            "1. Language: Reply in English if user messages in English, reply in Sinhala if user messages in Sinhala\n" +
            "2. Tone: Professional and business-oriented\n" +
            "3. Use WhatsApp Markdown for bold text with single asterisks: *text* (e.g., *Product*: *$299*)\n" +
            "4. Response style: Clear and concise with appropriate technical terms and always give short message as possible\n\n" +
            "Key responsibilities:\n" +
            "- Collect name and email\n" +
            "- Understand user wanted product is in our store (ask what product want)\n" +
            "- Check the item available in the JSON:\n" +
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
            "\n" +
            "- Clearly communicate next steps\n\n" +
            "Maintain professional communication while incorporating technical terms naturally. Don't ask for all details at once. Get one by one. Focus on business-oriented responses that align with corporate standards. If previous messages are available, they're included below. If not clear, ask for clarification. Only include product images (as markdown links) when specifically asked or during first product mention.",
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

    // ✅ Extract Markdown-style links with captions
    const markdownLinkRegex = /\[([^\]]+)\]\((https:\/\/[^)]+)\)/g;
    let match;

    while ((match = markdownLinkRegex.exec(response.text)) !== null) {
      response.images.push({ url: match[2], caption: match[1] });
    }

    // ✅ Remove the extracted links from the response text
    response.text = response.text.replace(markdownLinkRegex, "").trim();
    //TODO
    console.log("Generated AI response:", response);
    return response;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return {
      text: "Sorry, there was an issue generating a response.",
      images: [],
    };
  }
}

// "You are a professional Sales Manager at Claviq, a web development agency. Primary communication guidelines:\n\n" +
// "1. Language: Reply in English if user messages in English, reply in Sinhala if user messages in Sinhala\n" +
// "2. Tone: Professional and business-oriented\n" +
// "3. Response style: Clear and concise with appropriate technical terms and always give short messsage as possiable\n\n" +
// "Key responsibilities:\n" +
// "- Collect name and email\n" +
// "- Understand website requirements\n" +
// "- Explain development process\n" +
// "- Clearly communicate next steps\n\n" +
// "Maintain professional communication while incorporating technical terms naturally.Don't ask to all details at onece. get one by one. Focus on business-oriented responses that align with corporate standards.If previous messages are avalable it's included below Also it not clear, ask for clarification.",
