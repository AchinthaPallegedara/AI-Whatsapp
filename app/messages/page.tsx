"use client";
import { useEffect, useState } from "react";

interface Message {
  id: string;
  text: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch("/api/whatsapp/messages");
      const data = await res.json();
      setMessages(data);
    };

    // Fetch immediately on mount
    fetchMessages();

    // Then fetch every 10 seconds
    const interval = setInterval(fetchMessages, 10000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>WhatsApp Messages</h1>
      {messages.map((msg) => (
        <p key={msg.id}>{msg.text}</p>
      ))}
    </div>
  );
}
