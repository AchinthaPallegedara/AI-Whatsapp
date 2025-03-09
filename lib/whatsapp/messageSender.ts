import { sendWhatsAppMessage, sendTypingIndicator } from "@/lib/whatsapp";
import { CONFIG } from "./config";

interface ImageInfo {
  url: string;
  caption: string;
}

interface AIResponse {
  text: string;
  images: ImageInfo[];
}

export const messageSender = {
  async sendWithRetry(
    to: string,
    message: AIResponse,
    attempt = 1
  ): Promise<void> {
    try {
      if (message.images.length > 0) {
        await sendWhatsAppMessage(to, { images: message.images });
      }
      if (message.text) {
        await sendWhatsAppMessage(to, { text: message.text });
      }
    } catch (error) {
      if (attempt >= CONFIG.MAX_RETRIES) {
        // Turn off typing indicator if all retries fail
        await sendTypingIndicator(to, false);
        throw error;
      }

      // Show typing indicator during retry
      await sendTypingIndicator(to, true);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      return this.sendWithRetry(to, message, attempt + 1);
    }
  },
};
