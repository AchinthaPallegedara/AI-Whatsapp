import { NextRequest, NextResponse } from "next/server";
import { generateAIResponse } from "@/app/actions/ai.action";
import { db } from "@/lib/db";
import { addMessage, getUserMessages } from "@/lib/messageStore";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { Mutex } from "async-mutex";

// Configuration interface
interface AppConfig {
  VERIFY_TOKEN: string;
  HISTORY_CONTEXT: number;
  RATE_LIMIT: number;
  MESSAGE_TTL: number;
  TRANSACTION_TIMEOUT: number;
  MAX_RETRIES: number;
}

const CONFIG: AppConfig = {
  VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || "",
  HISTORY_CONTEXT: parseInt(process.env.AI_CONTEXT_SIZE || "5", 10),
  RATE_LIMIT: 5,
  MESSAGE_TTL: 60 * 1000,
  TRANSACTION_TIMEOUT: 30000,
  MAX_RETRIES: 3,
};

// WhatsApp API Types
interface WhatsAppWebhookPayload {
  object: "whatsapp_business_account";
  entry: WebhookEntry[];
}

interface WebhookEntry {
  changes: WebhookChange[];
}

interface WebhookChange {
  field: "messages";
  value: {
    messages: WebhookMessage[];
  };
}

interface WebhookMessage {
  id: string;
  from: string;
  type: string;
  text?: { body: string };
  timestamp?: string;
}

// Application Types
type Role = "user" | "assistant";

interface ConversationEntry {
  role: Role;
  content: string;
}

interface ProcessedMessage {
  id: string;
  from: string;
  text: string;
  timestamp: Date;
}

// Global state management with types
const userLocks = new Map<string, Mutex>();
const rateLimits = new Map<string, number[]>();
const historyCache = new Map<string, ConversationEntry[]>();

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = request.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === CONFIG.VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Verification failed", { status: 403 });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as WhatsAppWebhookPayload;
    if (!isValidWhatsAppRequest(body)) {
      return errorResponse("Invalid request structure", 400);
    }

    await processEntries(body.entry);
    return successResponse();
  } catch (error) {
    console.error("Webhook processing error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Processing pipeline with strict types
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

// Adjust processMessageBatch to default to an empty array:
async function processMessageBatch(
  messages: WebhookMessage[] = []
): Promise<void> {
  const validMessages = messages
    .filter(isValidTextMessage)
    .map(normalizeMessage);

  await Promise.all(validMessages.map(processIndividualMessage));
}

// Type guards and validators
function isValidWhatsAppRequest(body: unknown): body is WhatsAppWebhookPayload {
  return (
    (body as WhatsAppWebhookPayload)?.object === "whatsapp_business_account"
  );
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

// Core message processing with strict types
async function processIndividualMessage(
  message: ProcessedMessage
): Promise<void> {
  if (!message.text) return;

  if (!userLocks.has(message.from)) {
    userLocks.set(message.from, new Mutex());
  }
  const release = await userLocks.get(message.from)!.acquire();
  try {
    if (await isDuplicateMessage(message.id)) return;
    if (isRateLimited(message.from)) {
      await handleRateLimit(message.from);
      return;
    }

    const history = await buildConversationContext(message.from, message.text);
    const aiResponse = await generateAIResponse(history);

    await storeMessage(message.id, message.from, message.text, aiResponse);
    await sendWhatsAppMessageWithRetry(message.from, aiResponse);
    updateHistoryCache(message.from, message.text, aiResponse);
  } finally {
    release();
  }
}

// Database operations with Prisma types
async function isDuplicateMessage(messageId: string): Promise<boolean> {
  try {
    const existing = await db.message.findUnique({ where: { id: messageId } });
    return !!existing;
  } catch (error) {
    console.error("Duplicate check failed:", error);
    return true;
  }
}

async function storeMessage(
  messageId: string,
  userId: string,
  text: string,
  response: string
): Promise<void> {
  try {
    await db.$transaction(
      async () => {
        await addMessage({
          id: messageId,
          from: userId,
          text,
          reply: response,
          timestamp: new Date(),
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
}

// Rate limiting with proper types
function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimits.get(userId) ?? [];
  const recent = timestamps.filter((ts) => now - ts < CONFIG.MESSAGE_TTL);

  rateLimits.set(userId, [...recent, now].slice(-CONFIG.RATE_LIMIT));
  return recent.length >= CONFIG.RATE_LIMIT;
}

async function handleRateLimit(userId: string): Promise<void> {
  console.warn(`Rate limit exceeded for ${userId}`);
  await sendWhatsAppMessage(
    userId,
    "⚠️ Please wait before sending more messages. Try again in a minute."
  );
}

// Context management with strict types
async function buildConversationContext(
  userId: string,
  newMessage: string
): Promise<ConversationEntry[]> {
  const cached = historyCache.get(userId) ?? [];
  if (cached.length >= CONFIG.HISTORY_CONTEXT) {
    return [...cached, { role: "user", content: newMessage }];
  }

  try {
    const dbMessages = await getUserMessages(userId, CONFIG.HISTORY_CONTEXT);
    const history: ConversationEntry[] = dbMessages.map((msg) => ({
      role: msg.reply ? "assistant" : "user",
      content: msg.reply ?? msg.text,
    }));

    historyCache.set(userId, history);
    return [...history, { role: "user", content: newMessage }];
  } catch (error) {
    console.error("Failed to build context:", error);
    return [{ role: "user", content: newMessage }];
  }
}

function updateHistoryCache(
  userId: string,
  text: string,
  response: string
): void {
  const history = historyCache.get(userId) ?? [];
  const newHistory: ConversationEntry[] = [
    ...history,
    { role: "user" as Role, content: text },
    { role: "assistant" as Role, content: response },
  ].slice(-CONFIG.HISTORY_CONTEXT);
  historyCache.set(userId, newHistory);
}

// Resilient messaging with proper typing
async function sendWhatsAppMessageWithRetry(
  to: string,
  message: string,
  attempt = 1
): Promise<void> {
  try {
    await sendWhatsAppMessage(to, message);
  } catch (error) {
    if (attempt >= CONFIG.MAX_RETRIES) throw error;
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    return sendWhatsAppMessageWithRetry(to, message, attempt + 1);
  }
}

// Response helpers with strict return types
function successResponse(): NextResponse {
  return NextResponse.json({ success: true });
}

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}
