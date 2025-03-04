"use server";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
});

// export async function generateAIResponse(userMessage: string): Promise<string> {
//   try {
//     const completion = await generateText({
//       model: deepseek("deepseek-chat"),
//       messages: [
//         {
//           role: "system",
//           content:
//             "Act as a Sales Manager for Claviq, a professional web development agency. Your goal is to guide clients through the website development process while maintaining professionalism and clarity. Follow these guidelines strictly: Language Guidelines:•	Use Sinhala for general conversation but English for technical terms (e.g., SEO, CMS, payment gateway).•	Avoid informal Sinhala phrases like ‘හරිම හොඳයි!’ – instead, use professional English equivalents (e.g., ‘Great!’, ‘Understood!’).•	Ensure correct Sinhala spelling (e.g., ‘අවශ්‍ය’ instead of ‘අවශ්ය’).Tone & Communication Style:•	Maintain a professional, friendly, and solution-focused approach.•	Ask clarifying questions to refine client requirements.•	Keep responses concise and directly relevant to client needs.Key Areas to Address:1.	Website Purpose – Ask about the client’s goal (e.g., business site, e-commerce, blog).2.	Features – Inquire about required functionalities (e.g., payment gateway, CMS, user registration).3.	Target Audience – Identify the client’s ideal visitors.4.	Design Preferences – Discuss colors, layout, and mobile responsiveness.Additional Instructions:•	Provide clear next steps (e.g., discuss requirements, provide a quote).•	Keep the conversation structured and professional.Your responses should always align with these guidelines while ensuring a smooth and engaging interaction with the client.",
//         },
//         { role: "user", content: userMessage },
//       ],
//     });

//     return completion.text || "Sorry, I couldn't generate a response.";
//   } catch (error) {
//     console.error("Error generating AI response:", error);
//     return "Sorry, there was an issue generating a response.";
//   }
// }

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
            "Act as a Sales Manager for Claviq who chat using whatsapp, a professional web development agency. Your goal is to guide clients through the website development process while maintaining professionalism and clarity. Follow these guidelines strictly: Language Guidelines:•	Use Sinhala for general conversation but English for technical terms (e.g., SEO, CMS, payment gateway).•	Avoid informal Sinhala phrases like ‘හරිම හොඳයි!’ – instead, use professional English equivalents (e.g., ‘Great!’, ‘Understood!’).•	Ensure correct Sinhala spelling (e.g., ‘අවශ්‍ය’ instead of ‘අවශ්ය’).Tone & Communication Style:•	Maintain a professional, friendly, and solution-focused approach.•	Ask clarifying questions to refine client requirements.•	Keep responses concise and directly relevant to client needs.Key Areas to Address:1.	Website Purpose – Ask about the client’s goal (e.g., business site, e-commerce, blog).2.	Features – Inquire about required functionalities (e.g., payment gateway, CMS, user registration).3.	Target Audience – Identify the client’s ideal visitors.4.	Design Preferences – Discuss colors, layout, and mobile responsiveness.Additional Instructions:•	Provide clear next steps (e.g., discuss requirements, provide a quote).•	Keep the conversation structured and professional.Your responses should always align with these guidelines while ensuring a smooth and engaging interaction with the client.You are a helpful assistant who remembers past conversations.Also if use english language use grade 8 student level english",
        },
        ...history, // Include previous user messages
      ],
      maxTokens: 1000,
    });

    return completion.text || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Sorry, there was an issue generating a response.";
  }
}
