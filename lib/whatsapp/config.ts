// Configuration interface
export interface AppConfig {
  VERIFY_TOKEN: string;
  HISTORY_CONTEXT: number;
  RATE_LIMIT: number;
  MESSAGE_TTL: number;
  TRANSACTION_TIMEOUT: number;
  MAX_RETRIES: number;
}

export const CONFIG: AppConfig = {
  VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || "",
  HISTORY_CONTEXT: Number.parseInt(process.env.AI_CONTEXT_SIZE || "5", 10),
  RATE_LIMIT: 5,
  MESSAGE_TTL: 60 * 1000,
  TRANSACTION_TIMEOUT: 30000,
  MAX_RETRIES: 3,
};
