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
import { CONFIG } from "./config";
import { sendTypingIndicator } from "@/lib/whatsapp";

// Global state management with types
const userLocks = new Map<string, Mutex>();

// Message queue for batching messages from the same user
interface MessageQueue {
  messages: ProcessedMessage[];
  timer: NodeJS.Timeout | null;
}

const messageQueues = new Map<string, MessageQueue>();

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

  for (const message of validMessages) {
    await queueMessage(message);
  }
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

async function queueMessage(message: ProcessedMessage): Promise<void> {
  // Check if the message is a duplicate
  if (await messageStore.isDuplicate(message.id)) return;

  const userId = message.from;

  // Create a new queue if one doesn't exist
  if (!messageQueues.has(userId)) {
    messageQueues.set(userId, {
      messages: [message],
      timer: setTimeout(
        () => processQueuedMessages(userId),
        CONFIG.MESSAGE_BATCH_DELAY
      ),
    });

    // Show typing indicator immediately when first message is received
    await sendTypingIndicator(userId, true);
    return;
  }

  // Add to existing queue and reset the timer
  const queue = messageQueues.get(userId)!;
  queue.messages.push(message);

  if (queue.timer) {
    clearTimeout(queue.timer);
  }

  queue.timer = setTimeout(
    () => processQueuedMessages(userId),
    CONFIG.MESSAGE_BATCH_DELAY
  );
}

async function processQueuedMessages(userId: string): Promise<void> {
  if (!messageQueues.has(userId)) return;

  const queue = messageQueues.get(userId)!;
  messageQueues.delete(userId);

  if (queue.messages.length === 0) {
    await sendTypingIndicator(userId, false);
    return;
  }

  // Sort messages by timestamp
  const sortedMessages = [...queue.messages].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Combine messages if there are multiple
  const combinedMessage: ProcessedMessage = {
    id: sortedMessages.map((m) => m.id).join("_"),
    from: userId,
    text: sortedMessages.map((m) => m.text).join("\n"),
    timestamp: sortedMessages[sortedMessages.length - 1].timestamp,
  };

  await processIndividualMessage(combinedMessage, sortedMessages);
}

async function processIndividualMessage(
  message: ProcessedMessage,
  originalMessages: ProcessedMessage[] = [message]
): Promise<void> {
  if (!message.text) {
    await sendTypingIndicator(message.from, false);
    return;
  }

  if (!userLocks.has(message.from)) {
    userLocks.set(message.from, new Mutex());
  }
  const release = await userLocks.get(message.from)!.acquire();

  try {
    // Keep typing indicator on
    await sendTypingIndicator(message.from, true);

    // Check rate limiting
    if (rateLimit.isLimited(message.from)) {
      await sendTypingIndicator(message.from, false);
      await rateLimit.handleLimitExceeded(message.from);
      return;
    }

    const history = await historyManager.buildContext(
      message.from,
      message.text
    );

    // Generate AI response (typing indicator remains on during this time)
    const aiResponse = await generateAIResponse(history);

    // Turn off typing indicator before sending the actual message
    await sendTypingIndicator(message.from, false);

    // Store each original message with the same AI response
    for (const originalMessage of originalMessages) {
      await messageStore.storeMessage(
        originalMessage.id,
        originalMessage.from,
        originalMessage.text,
        aiResponse
      );
    }

    await messageSender.sendWithRetry(message.from, aiResponse);
    historyManager.updateCache(message.from, message.text, aiResponse.text);
  } catch (error) {
    // Make sure to turn off typing indicator in case of error
    await sendTypingIndicator(message.from, false);
    throw error;
  } finally {
    release();
  }
}
