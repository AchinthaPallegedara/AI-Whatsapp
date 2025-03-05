import { Mutex } from "async-mutex";
import { generateAIResponse } from "@/app/actions/ai.action";
import type {
  WhatsAppWebhookPayload,
  WebhookEntry,
  WebhookMessage,
  ProcessedMessage,
} from "./types";
import { messageStore } from "./messageStore";
import { rateLimit } from "./rateLimit";
import { historyManager } from "./historyManager";
import { messageSender } from "./messageSender";

// Global state management with types
const userLocks = new Map<string, Mutex>();

export async function processWebhookPayload(
  payload: WhatsAppWebhookPayload
): Promise<void> {
  await processEntries(payload.entry);
}

async function processEntries(entries: WebhookEntry[] = []): Promise<void> {
  await Promise.all(
    entries.map(async (entry) => {
      const changes = entry.changes ?? [];
      await Promise.all(
        changes.map(async (change) => {
          if (change.field === "messages") {
            const messages = change.value?.messages ?? [];
            await processMessageBatch(messages);
          }
        })
      );
    })
  );
}

async function processMessageBatch(
  messages: WebhookMessage[] = []
): Promise<void> {
  const validMessages = messages
    .filter(isValidTextMessage)
    .map(normalizeMessage);

  await Promise.all(validMessages.map(processIndividualMessage));
}

function isValidTextMessage(message: WebhookMessage): boolean {
  return message.type === "text" && !!message.text?.body?.trim();
}

function normalizeMessage(message: WebhookMessage): ProcessedMessage {
  return {
    id: message.id,
    from: message.from,
    text: message.text?.body.trim() ?? "",
    timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
  };
}

async function processIndividualMessage(
  message: ProcessedMessage
): Promise<void> {
  if (!message.text) return;

  if (!userLocks.has(message.from)) {
    userLocks.set(message.from, new Mutex());
  }
  const release = await userLocks.get(message.from)!.acquire();

  try {
    if (await messageStore.isDuplicate(message.id)) return;

    if (rateLimit.isLimited(message.from)) {
      await rateLimit.handleLimitExceeded(message.from);
      return;
    }

    const history = await historyManager.buildContext(
      message.from,
      message.text
    );
    const aiResponse = await generateAIResponse(history);

    await messageStore.storeMessage(
      message.id,
      message.from,
      message.text,
      aiResponse
    );
    await messageSender.sendWithRetry(message.from, aiResponse);
    historyManager.updateCache(message.from, message.text, aiResponse.text);
  } finally {
    release();
  }
}
