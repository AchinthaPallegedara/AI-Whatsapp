import { db } from "@/lib/db";
import { CONFIG } from "./config";
import type { MessageRecord } from "./types";

export const messageStore = {
  async isDuplicate(messageId: string): Promise<boolean> {
    try {
      const existing = await db.message.findUnique({
        where: { id: messageId },
      });
      return !!existing;
    } catch (error) {
      console.error("Duplicate check failed:", error);
      return true;
    }
  },

  async storeMessage(
    messageId: string,
    userId: string,
    text: string,
    response: { text: string; images: { url: string; caption: string }[] }
  ): Promise<void> {
    try {
      await db.$transaction(
        async () => {
          await db.message.create({
            data: {
              id: messageId,
              from: userId,
              text,
              reply: response.text,
              images: response.images.map((img) => img.url),
              timestamp: new Date(),
              processed: true,
            },
          });
        },
        {
          timeout: CONFIG.TRANSACTION_TIMEOUT,
        }
      );
    } catch (error) {
      console.error("Database operation failed:", error);
      throw error;
    }
  },

  async getUserMessages(
    userId: string,
    limit: number
  ): Promise<MessageRecord[]> {
    try {
      const messages = await db.message.findMany({
        where: { from: userId },
        orderBy: { timestamp: "desc" },
        take: limit * 2, // Get enough messages for both user and assistant entries
      });

      return messages.map((msg) => ({
        id: msg.id,
        from: msg.from,
        text: msg.text,
        reply: msg.reply,
        images: msg.images,
        timestamp: msg.timestamp,
        processed: msg.processed,
      }));
    } catch (error) {
      console.error("Failed to fetch user messages:", error);
      return [];
    }
  },
};
