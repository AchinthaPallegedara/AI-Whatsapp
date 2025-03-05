import { type NextRequest, NextResponse } from "next/server";
import { processWebhookPayload } from "@/lib/whatsapp/processor";
import { verifyWebhook } from "@/lib/whatsapp/verification";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = request.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  return verifyWebhook(mode, token, challenge);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    if (!body || body.object !== "whatsapp_business_account") {
      return NextResponse.json(
        { success: false, error: "Invalid request structure" },
        { status: 400 }
      );
    }

    await processWebhookPayload(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
