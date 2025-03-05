import { CONFIG } from "./config";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// Rate limiting state
const rateLimits = new Map<string, number[]>();

export const rateLimit = {
  isLimited(userId: string): boolean {
    const now = Date.now();
    const timestamps = rateLimits.get(userId) ?? [];
    const recent = timestamps.filter((ts) => now - ts < CONFIG.MESSAGE_TTL);

    rateLimits.set(userId, [...recent, now].slice(-CONFIG.RATE_LIMIT));
    return recent.length >= CONFIG.RATE_LIMIT;
  },

  async handleLimitExceeded(userId: string): Promise<void> {
    console.warn(`Rate limit exceeded for ${userId}`);
    await sendWhatsAppMessage(
      userId,
      "⚠️ Please wait before sending more messages. Try again in a minute."
    );
  },
};
