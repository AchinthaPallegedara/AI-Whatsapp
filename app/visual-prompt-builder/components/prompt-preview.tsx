import { Card, CardContent } from "@/components/ui/card";

interface PromptPreviewProps {
  prompt: string;
}

export function PromptPreview({ prompt }: PromptPreviewProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="bg-muted p-4 rounded-md max-h-[600px] overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm font-mono">{prompt}</pre>
        </div>
      </CardContent>
    </Card>
  );
}
