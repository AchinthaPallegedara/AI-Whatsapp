import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { CONFIG } from "./config";

export const messageSender = {
  async sendWithRetry(to: string, message: string, attempt = 1): Promise<void> {
    try {
      await sendWhatsAppMessage(to, message);
    } catch (error) {
      if (attempt >= CONFIG.MAX_RETRIES) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      return this.sendWithRetry(to, message, attempt + 1);
    }
  },
};
