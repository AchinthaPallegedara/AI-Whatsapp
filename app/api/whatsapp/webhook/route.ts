import { generateAIResponse } from "@/app/actions/ai.action";
import { db } from "@/lib/db";
import { addMessage, getUserMessages } from "@/lib/messageStore";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Verification failed", { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json(
        { success: false, error: "Invalid object type" },
        { status: 400 }
      );
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field !== "messages") continue;

        const messages = change.value.messages || [];
        for (const message of messages) {
          if (message.type !== "text") continue;

          const from = message.from;
          const messageId = message.id;
          const messageText = message.text.body;

          // Check if the message is already processed based on user and text
          const existingMessage = await db.message.findFirst({
            where: { from, text: messageText },
          });

          if (!existingMessage) {
            console.log(`Processing message: ${messageText} from: ${from}`);

            // Retrieve last 5 messages from the same user
            const previousMessages = await getUserMessages(from, 5);

            // Format conversation history for AI
            const history = previousMessages.map((msg) =>
              msg.reply
                ? { role: "assistant" as const, content: msg.reply }
                : { role: "user" as const, content: msg.text }
            );

            // Add the new message to history
            history.push({ role: "user" as const, content: messageText });

            // Generate AI response with context
            const aiResponse = await generateAIResponse(history);

            // Store the message & AI response in PostgreSQL
            await addMessage({
              id: messageId,
              from,
              text: messageText,
              reply: aiResponse,
              timestamp: new Date(),
            });

            // Send the AI response to WhatsApp
            await sendWhatsAppMessage(from, aiResponse);
          } else {
            console.log(
              `Duplicate detected for ${from}. Skipping AI generation.`
            );
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
