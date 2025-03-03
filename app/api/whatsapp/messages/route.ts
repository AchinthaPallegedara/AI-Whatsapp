import { getAllMessages } from "@/lib/messageStore";
import { NextResponse } from "next/server";

export async function GET() {
  const messages = getAllMessages(); // Implement getAllMessages in messageStore
  return NextResponse.json(messages);
}
