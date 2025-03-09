import axios from "axios";

interface ImageInfo {
  url: string;
  caption: string;
}

interface WhatsAppMessage {
  text?: string;
  images?: ImageInfo[];
}

export async function sendWhatsAppMessage(
  to: string,
  message: WhatsAppMessage
) {
  try {
    const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sendMessage = async (messageBody: any) => {
      const response = await axios({
        url: WHATSAPP_API_URL,
        method: "post",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify(messageBody),
      });
      console.log("Message sent successfully:", response.data);
      return response.data;
    };

    if (message.images && message.images.length > 0) {
      for (const image of message.images) {
        await sendMessage({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "image",
          image: {
            link: image.url,
            caption: image.caption,
          },
        });
      }
    }

    if (message.text) {
      await sendMessage({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          body: message.text,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw error;
  }
}

// Alternative approach: Use a reaction message as a "seen" indicator
export async function sendReactionIndicator(to: string, messageId: string) {
  try {
    const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    // Only send if we have a valid message ID (not a combined one)
    if (!messageId || messageId.includes("_")) return { success: false };

    const response = await axios({
      url: WHATSAPP_API_URL,
      method: "post",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "reaction",
        reaction: {
          message_id: messageId,
          emoji: "👀", // Eyes emoji to indicate "seen"
        },
      }),
    });

    console.log("Reaction indicator sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending reaction indicator:", error);
    // Don't throw the error as this is a non-critical feature
    return { success: false, error };
  }
}

// Keep the typing indicator function but make it more robust
export async function sendTypingIndicator(to: string, on = true) {
  try {
    // Check if typing indicators are enabled
    if (process.env.ENABLE_TYPING_INDICATOR !== "true") {
      return { success: false, reason: "Typing indicator disabled" };
    }

    const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    // Try the standard typing indicator format
    try {
      const response = await axios({
        url: WHATSAPP_API_URL,
        method: "post",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "typing",
          typing: {
            status: on ? "typing" : "paused",
          },
        }),
        timeout: 5000, // Add a timeout to prevent long-hanging requests
      });

      console.log(
        `Typing indicator ${on ? "started" : "stopped"}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      // If the standard format fails, try the alternative format
      console.warn(
        "Standard typing indicator failed, trying alternative format:",
        error
      );

      const response = await axios({
        url: WHATSAPP_API_URL,
        method: "post",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "typing",
          typing: on,
        }),
        timeout: 5000,
      });

      console.log(
        `Alternative typing indicator ${on ? "started" : "stopped"}:`,
        response.data
      );
      return response.data;
    }
  } catch (error) {
    console.error("Error sending typing indicator:", error);
    // Don't throw the error as this is a non-critical feature
    return { success: false, error };
  }
}
