"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { savePrompt } from "../prompt-builder/actions";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

interface PromptEditorProps {
  prompt: string;
  onChange: (prompt: string) => void;
  isLoading: boolean;
}

export function PromptEditor({
  prompt,
  onChange,
  isLoading,
}: PromptEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePrompt = async () => {
    try {
      setIsSaving(true);
      await savePrompt(prompt);
      toast("Prompt saved successfully", {
        description:
          "Your prompt has been saved and will be used for all AI responses.",
      });
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast("Failed to save prompt", {
        description: "There was an error saving your prompt.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit AI Prompt</CardTitle>
          <CardDescription>
            Modify the system prompt to change how the AI responds
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <>
              <Textarea
                value={prompt}
                onChange={(e) => onChange(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                placeholder="Enter the system prompt for the AI..."
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handleSavePrompt} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save as Default Prompt"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Prompt Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Be specific about the AI&apos;s role and personality</li>
                  <li>
                    Include specific instructions for handling different types
                    of queries
                  </li>
                  <li>Specify the format and style of responses you want</li>
                  <li>
                    Include any product information the AI should know about
                  </li>
                  <li>
                    Test different prompts to see which produces the best
                    responses
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
