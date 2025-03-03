// app/lib/messageStore.ts
type WhatsAppMessage = {
  id: string;
  from: string;
  text: string;
  timestamp: Date;
};

// Simple in-memory storage (replace with a database in production)
const messages: WhatsAppMessage[] = [];

export function addMessage(message: WhatsAppMessage) {
  messages.push(message);
  console.log(`Stored message: ${message.text} from ${message.from}`);
}

export function getAllMessages() {
  return [...messages].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
}
