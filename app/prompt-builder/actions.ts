"use server";

import fs from "fs/promises";
import path from "path";

export async function savePrompt(prompt: string): Promise<void> {
  try {
    // Create a config directory if it doesn't exist
    const configDir = path.join(process.cwd(), "config");
    try {
      await fs.mkdir(configDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
      console.error("Error creating config directory:", error);
    }

    // Save the prompt to a file
    const promptPath = path.join(configDir, "ai-prompt.txt");
    await fs.writeFile(promptPath, prompt, "utf-8");

    // Optional: Update an environment variable or database setting
    // This depends on how your application is configured

    return;
  } catch (error) {
    console.error("Error saving prompt:", error);
    throw new Error("Failed to save prompt");
  }
}

export async function getCurrentPrompt(): Promise<string | null> {
  try {
    const promptPath = path.join(process.cwd(), "config", "ai-prompt.txt");

    try {
      const prompt = await fs.readFile(promptPath, "utf-8");
      return prompt;
    } catch (error) {
      // File might not exist yet
      console.error("Error reading current prompt:", error);
      return null;
    }
  } catch (error) {
    console.error("Error getting current prompt:", error);
    throw new Error("Failed to get current prompt");
  }
}
