"use client";
import { useState, FormEvent } from "react";

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: phoneNumber,
          text: message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("Message sent successfully!");
        setMessage("");
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(
        `Failed to send message: ${
          error instanceof Error ? error.message : "Please try again"
        }`
      );
    }
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WhatsApp Message Sender</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">
            Phone Number (with country code):
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g., 14155552671"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Send Message
        </button>
      </form>

      {status && <div className="mt-4 p-3 bg-gray-100 rounded">{status}</div>}
    </div>
  );
}
