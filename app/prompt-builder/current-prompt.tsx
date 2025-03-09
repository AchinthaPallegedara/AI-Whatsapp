"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCurrentPrompt } from "./actions";

export function CurrentPrompt() {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPrompt = async () => {
      try {
        setIsLoading(true);
        const currentPrompt = await getCurrentPrompt();
        setPrompt(currentPrompt);
        setError(null);
      } catch (error) {
        console.error("Error loading prompt:", error);
        setError("Failed to load the current prompt. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPrompt();
  }, []);

  return (
    <div>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : prompt ? (
        <div className="bg-muted p-4 rounded-md max-h-[300px] overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm">{prompt}</pre>
        </div>
      ) : (
        <div className="text-muted-foreground p-4 bg-muted rounded-md">
          <p>
            No custom prompt has been set yet. The system is using the default
            prompt.
          </p>
        </div>
      )}
    </div>
  );
}
