// app/api/whatsapp/webhook/route.ts
import { generateAIResponse } from "@/app/actions/ai.action";
import { addMessage } from "@/lib/messageStore";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { NextRequest, NextResponse } from "next/server";
// import { createDeepSeek } from "@ai-sdk/deepseek";
// import { generateText } from "ai";

// const deepseek = createDeepSeek({
//   apiKey: process.env.DEEPSEEK_API_KEY ?? "",
// });

export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Your verification token
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  console.log("Verification request received");
  console.log("Mode:", mode);
  console.log("Token:", token);
  console.log("Challenge:", challenge);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully");
    return new Response(challenge, {
      status: 200,
    });
  }

  console.error("Webhook verification failed");
  return new Response("Verification failed", {
    status: 403,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("Received webhook data:", JSON.stringify(body));

    if (body.object === "whatsapp_business_account") {
      const entries = body.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];

        for (const change of changes) {
          if (change.field === "messages") {
            const messages = change.value.messages || [];

            for (const message of messages) {
              if (message.type === "text") {
                const from = message.from; // Sender's phone number
                const messageId = message.id;
                const messageText = message.text.body;

                console.log(`Received message: ${messageText} from: ${from}`);

                // Store the message
                addMessage({
                  id: messageId,
                  from: from,
                  text: messageText,
                  timestamp: new Date(),
                });

                // Generate AI response
                const aiResponse = await generateAIResponse(messageText);
                console.log("AI response:", aiResponse);

                // Send AI-generated response
                await sendWhatsAppMessage(from, aiResponse);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
// Function to generate AI response
// async function generateAIResponse(userMessage: string): Promise<string> {
//   try {
//     const completion = await generateText({
//       model: deepseek("deepseek-chat"),
//       messages: [
//         { role: "system", content: "You are a helpful assistant." },
//         { role: "user", content: userMessage },
//       ],
//       maxTokens: 100,
//     });

//     return completion.text || "Sorry, I couldn't generate a response.";
//   } catch (error) {
//     console.error("Error generating AI response:", error);
//     return "Sorry, there was an issue generating a response.";
//   }
// }
