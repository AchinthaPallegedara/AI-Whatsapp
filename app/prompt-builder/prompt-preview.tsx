import { Card, CardContent } from "@/components/ui/card"
import type { Section } from "./page"

interface PromptPreviewProps {
  sections: Section[]
}

export function PromptPreview({ sections }: PromptPreviewProps) {
  const fullPrompt = sections.map((section) => section.content).join("\n\n")

  return (
    <Card>
      <CardContent className="p-4">
        <div className="bg-muted p-4 rounded-md">
          <pre className="whitespace-pre-wrap text-sm">{fullPrompt}</pre>
        </div>
      </CardContent>
    </Card>
  )
}

