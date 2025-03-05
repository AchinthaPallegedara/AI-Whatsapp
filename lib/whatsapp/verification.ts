import { CONFIG } from "./config";

export function verifyWebhook(
  mode: string | null,
  token: string | null,
  challenge: string | null
): Response {
  if (mode === "subscribe" && token === CONFIG.VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Verification failed", { status: 403 });
}
