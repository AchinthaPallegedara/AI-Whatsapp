"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getCurrentPrompt } from "./actions"

export function CurrentPrompt() {
  const [prompt, setPrompt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPrompt = async () => {
      try {
        const currentPrompt = await getCurrentPrompt()
        setPrompt(currentPrompt)
      } catch (error) {
        console.error("Error loading prompt:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPrompt()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current AI Prompt</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : prompt ? (
          <div className="bg-muted p-4 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">{prompt}</pre>
          </div>
        ) : (
          <p className="text-muted-foreground">No prompt has been set yet.</p>
        )}
      </CardContent>
    </Card>
  )
}

