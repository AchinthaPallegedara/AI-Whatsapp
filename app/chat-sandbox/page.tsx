"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

import { generateSandboxResponse } from "./actions";
import { ChatMessage } from "./chat-message";
import { PromptEditor } from "./prompt-editor";
import { getCurrentPrompt } from "../prompt-builder/actions";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  images?: { url: string; caption: string }[];
}

export default function ChatSandbox() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [editedPrompt, setEditedPrompt] = useState<string>("");
  const [isPromptLoading, setIsPromptLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load the current prompt when the component mounts
  useEffect(() => {
    const loadPrompt = async () => {
      try {
        setIsPromptLoading(true);
        const prompt = await getCurrentPrompt();
        if (prompt) {
          setCurrentPrompt(prompt);
          setEditedPrompt(prompt);
        } else {
          // Set default prompt if none exists
          const defaultPrompt =
            "You are a professional Sales Manager at Claviq, a retail shop. Be helpful and concise.";
          setCurrentPrompt(defaultPrompt);
          setEditedPrompt(defaultPrompt);
        }
      } catch (error) {
        console.error("Error loading prompt:", error);
        toast("Failed to load prompt", {
          description: "There was an error loading the current prompt.",
        });
      } finally {
        setIsPromptLoading(false);
      }
    };

    loadPrompt();
  }, []);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Use the edited prompt if we're in the prompt tab, otherwise use the current prompt
      const promptToUse = activeTab === "prompt" ? editedPrompt : currentPrompt;

      // Get AI response
      const response = await generateSandboxResponse(
        input,
        messages.map((m) => ({ role: m.role, content: m.content })),
        promptToUse
      );

      // Add AI message
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response.text,
        timestamp: new Date(),
        images: response.images,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // If we're in the prompt tab and the response was good, update the current prompt
      if (activeTab === "prompt") {
        setCurrentPrompt(editedPrompt);
        toast("Prompt tested successfully", {
          description: "The new prompt was used for this response.",
        });
      }
    } catch (error) {
      console.error("Error generating response:", error);
      toast("Failed to generate response", {
        description: "There was an error generating the AI response.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptChange = (newPrompt: string) => {
    setEditedPrompt(newPrompt);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">AI Chat Sandbox</h1>
          </div>
          <Button variant="outline" onClick={handleClearChat}>
            Clear Chat
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 container mx-auto py-4 overflow-hidden flex">
        <div className="flex flex-col w-full h-full overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="prompt">Prompt</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="chat"
              className="flex-1 overflow-hidden flex flex-col mt-0 pt-4"
            >
              <div className="flex-1 overflow-y-auto px-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <Sparkles className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      Test Your AI Assistant
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      Send a message to see how your AI assistant responds. You
                      can modify the prompt in the Prompt tab.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="p-4 border-t mt-auto">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()}>
                    {isLoading ? "Sending..." : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent
              value="prompt"
              className="flex-1 overflow-hidden flex flex-col mt-0 pt-4"
            >
              <PromptEditor
                prompt={editedPrompt}
                onChange={handlePromptChange}
                isLoading={isPromptLoading}
              />

              <div className="p-4 border-t mt-auto">
                <div className="text-sm text-muted-foreground mb-2">
                  Send a message to test this prompt. The AI will use this
                  modified prompt for its response.
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message to test the prompt..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()}>
                    {isLoading ? "Testing..." : "Test Prompt"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
