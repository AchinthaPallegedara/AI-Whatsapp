"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PromptSection } from "./prompt-section";
import { PromptPreview } from "./prompt-preview";
import { savePrompt } from "./actions";

export interface Section {
  id: string;
  title: string;
  content: string;
}

export default function PromptBuilder() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([
    {
      id: "1",
      title: "Introduction",
      content: "You are a professional Sales Manager at Claviq, a retail shop.",
    },
  ]);
  const [activeTab, setActiveTab] = useState("builder");
  const [isSaving, setIsSaving] = useState(false);

  const addSection = () => {
    const newId = (sections.length + 1).toString();
    setSections([
      ...sections,
      {
        id: newId,
        title: `Section ${newId}`,
        content: "",
      },
    ]);
  };

  const updateSection = (id: string, title: string, content: string) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, title, content } : section
      )
    );
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((section) => section.id !== id));
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    const index = sections.findIndex((section) => section.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const temp = newSections[index];
    newSections[index] = newSections[newIndex];
    newSections[newIndex] = temp;
    setSections(newSections);
  };

  const handleSavePrompt = async () => {
    try {
      setIsSaving(true);
      const fullPrompt = sections
        .map((section) => section.content)
        .join("\n\n");
      await savePrompt(fullPrompt);
      toast("Prompt saved successfully", {
        description:
          "Your prompt has been saved and will be used for AI responses.",
      });
    } catch (error) {
      toast("Failed to save prompt", {
        description: "There was an error saving your prompt. Please try again.",
      });
      console.error("Error saving prompt:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Prompt Builder</CardTitle>
          <CardDescription>
            Build your AI prompt section by section. The prompt will be used to
            guide the AI&apos;s responses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="builder">Builder</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="builder" className="space-y-4 mt-4">
              {sections.map((section, index) => (
                <PromptSection
                  key={section.id}
                  section={section}
                  isFirst={index === 0}
                  isLast={index === sections.length - 1}
                  onUpdate={updateSection}
                  onRemove={removeSection}
                  onMove={moveSection}
                />
              ))}
              <Button onClick={addSection} className="w-full">
                Add Section
              </Button>
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <PromptPreview sections={sections} />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSavePrompt} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Prompt"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
