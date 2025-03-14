/* eslint-disable @typescript-eslint/no-explicit-any */
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
      const stats = await fs.stat(promptPath);
      if (stats.isFile()) {
        const prompt = await fs.readFile(promptPath, "utf-8");
        return prompt;
      }
      return null;
    } catch (error: any) {
      // Check specifically for file not found error
      if (error.code === "ENOENT") {
        return null;
      }
      // For other errors, rethrow
      throw error;
    }
  } catch (error) {
    console.error("Error getting current prompt:", error);
    return null; // Return null instead of throwing to prevent UI errors
  }
}
