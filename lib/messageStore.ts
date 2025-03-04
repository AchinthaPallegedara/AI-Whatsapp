"use server";
import { db } from "./db";

// Store a new message with AI reply
export async function addMessage(message: {
  id: string;
  from: string;
  text: string;
  reply: string;
  timestamp: Date;
}) {
  try {
    await db.message.create({
      data: { ...message, processed: true },
    });
  } catch (error) {
    console.error("Error saving message:", error);
  }
}

// Retrieve the last few messages from a user (including AI responses)
export async function getUserMessages(userId: string, limit: number) {
  try {
    return await db.message.findMany({
      where: { from: userId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}
