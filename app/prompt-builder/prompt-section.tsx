"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import type { Section } from "./page";

interface PromptSectionProps {
  section: Section;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (id: string, title: string, content: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}

export function PromptSection({
  section,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMove,
}: PromptSectionProps) {
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onUpdate(section.id, e.target.value, content);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onUpdate(section.id, title, e.target.value);
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
        <Input
          value={title}
          onChange={handleTitleChange}
          className="font-semibold"
          placeholder="Section Title"
        />
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(section.id, "up")}
            disabled={isFirst}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(section.id, "down")}
            disabled={isLast}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(section.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Enter the content for this section..."
          className="min-h-[100px] resize-y"
        />
      </CardContent>
    </Card>
  );
}
