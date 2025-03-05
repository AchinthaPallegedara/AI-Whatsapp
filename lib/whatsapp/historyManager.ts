import { CONFIG } from "./config";
import type { ConversationEntry } from "./types";
import { messageStore } from "./messageStore";

// History cache
const historyCache = new Map<string, ConversationEntry[]>();

export const historyManager = {
  async buildContext(
    userId: string,
    newMessage: string
  ): Promise<ConversationEntry[]> {
    const cached = historyCache.get(userId) ?? [];
    if (cached.length >= CONFIG.HISTORY_CONTEXT) {
      return [...cached, { role: "user", content: newMessage }];
    }

    try {
      const dbMessages = await messageStore.getUserMessages(
        userId,
        CONFIG.HISTORY_CONTEXT
      );
      const history: ConversationEntry[] = [];

      // Convert the flat message list to conversation entries
      for (const msg of dbMessages) {
        history.push({ role: "user", content: msg.text });
        if (msg.reply) {
          history.push({ role: "system", content: msg.reply });
        }
      }

      historyCache.set(userId, history);
      return [...history, { role: "user", content: newMessage }];
    } catch (error) {
      console.error("Failed to build context:", error);
      return [{ role: "user", content: newMessage }];
    }
  },

  updateCache(userId: string, text: string, response: string): void {
    const history = historyCache.get(userId) ?? [];
    const newHistory: ConversationEntry[] = [
      ...history,
      { role: "user" as const, content: text },
      { role: "system" as const, content: response },
    ].slice(-CONFIG.HISTORY_CONTEXT);
    historyCache.set(userId, newHistory);
  },
};
