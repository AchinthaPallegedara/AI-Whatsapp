import type { Node } from "reactflow";

export function generatePromptFromNodes(nodes: Node[]): string {
  // Find nodes by type
  const businessInfoNode = nodes.find(
    (node) => node.type === "businessInfoNode"
  );
  const languageNode = nodes.find((node) => node.type === "languageNode");
  const toneNode = nodes.find((node) => node.type === "toneNode");
  const responseStyleNode = nodes.find(
    (node) => node.type === "responseStyleNode"
  );
  const productsNode = nodes.find((node) => node.type === "productsNode");

  // Extract business info
  const businessName = businessInfoNode?.data?.businessName || "Claviq";
  const businessType = businessInfoNode?.data?.businessType || "retail shop";
  const role = businessInfoNode?.data?.role || "Sales Manager";

  // Extract languages
  const languages = languageNode?.data?.languages || [];
  const languageText = languages
    .map((lang: { name: string }) => lang.name)
    .join(" or ");

  // Extract tones
  const tones = toneNode?.data?.tones || [];
  const toneText = tones
    .map((tone: { name: string }) => tone.name)
    .join(" and ");

  // Extract response styles
  const styles = responseStyleNode?.data?.styles || [];
  const styleText = styles
    .map((style: { name: string }) => style.name)
    .join(" with ");

  // Extract products
  const products = productsNode?.data?.products || [];

  // Build the prompt
  let prompt = `You are a professional ${role} at ${businessName}, a ${businessType}. Primary communication guidelines:\n\n`;

  // Add language preferences
  prompt += `1. Language: Reply in ${languageText}\n`;

  // Add tone preferences
  prompt += `2. Tone: ${toneText}\n`;

  // Add response style preferences
  prompt += `3. Response style: ${styleText}\n\n`;

  // Add key responsibilities
  prompt += `Key responsibilities:\n`;
  prompt += `- Collect name and email\n`;
  prompt += `- Understand user wanted product is in our store\n`;
  prompt += `- Check the item available in the JSON:\n${JSON.stringify(
    products,
    null,
    2
  )}\n`;
  prompt += `- Clearly communicate next steps\n\n`;

  // Add additional instructions
  prompt += `Maintain professional communication while incorporating technical terms naturally. Don't ask for all details at once. Get one by one. Focus on business-oriented responses that align with corporate standards. If previous messages are available, they're included below. If not clear, ask for clarification. When mentioning products, include their image URLs and brief captions.`;

  return prompt;
}
