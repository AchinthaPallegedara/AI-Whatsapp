// app/api/whatsapp/send/route.ts
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, text } = body;

    if (!to || !text) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: to, text",
        },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppMessage(to, text);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in send API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send WhatsApp message",
      },
      { status: 500 }
    );
  }
}
