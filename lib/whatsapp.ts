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

export async function sendTypingIndicator(to: string, on = true) {
  try {
    const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

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
    });

    console.log(
      `Typing indicator ${on ? "started" : "stopped"}:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error("Error sending typing indicator:", error);
    // Don't throw the error as this is a non-critical feature
    return { success: false, error };
  }
}
