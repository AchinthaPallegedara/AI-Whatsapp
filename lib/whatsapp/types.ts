// WhatsApp API Types
export interface WhatsAppWebhookPayload {
  object: "whatsapp_business_account";
  entry: WebhookEntry[];
}

export interface WebhookEntry {
  changes: WebhookChange[];
}

export interface WebhookChange {
  field: "messages";
  value: {
    messages: WebhookMessage[];
  };
}

export interface WebhookMessage {
  id: string;
  from: string;
  type: string;
  text?: { body: string };
  timestamp?: string;
}

// Application Types
export type Role = "user" | "system";

export interface ConversationEntry {
  role: Role;
  content: string;
}

export interface ProcessedMessage {
  id: string;
  from: string;
  text: string;
  timestamp: Date;
}

export interface MessageRecord {
  id: string;
  from: string;
  text: string;
  reply?: string;
  timestamp: Date;
}
