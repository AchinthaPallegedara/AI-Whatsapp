"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ArrowLeft, Save } from "lucide-react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";

import { savePrompt } from "../prompt-builder/actions";
import { PromptNode } from "./components/prompt-node";
import { ProductsNode } from "./components/products-node";
import { LanguageNode } from "./components/language-node";
import { ToneNode } from "./components/tone-node";
import { ResponseStyleNode } from "./components/response-style-node";
import { BusinessInfoNode } from "./components/business-info-node";
import { PromptPreview } from "./components/prompt-preview";
import { generatePromptFromNodes } from "./utils/generate-prompt";
import { toast } from "sonner";

// Register custom node types
const nodeTypes = {
  promptNode: PromptNode,
  productsNode: ProductsNode,
  languageNode: LanguageNode,
  toneNode: ToneNode,
  responseStyleNode: ResponseStyleNode,
  businessInfoNode: BusinessInfoNode,
};

// Initial nodes
const initialNodes: Node[] = [
  {
    id: "business-info",
    type: "businessInfoNode",
    data: {
      businessName: "Claviq",
      businessType: "retail shop",
      role: "Sales Manager",
    },
    position: { x: 250, y: 0 },
  },
  {
    id: "language",
    type: "languageNode",
    data: {
      languages: [
        { id: "1", name: "English" },
        { id: "2", name: "Sinhala" },
      ],
    },
    position: { x: 50, y: 150 },
  },
  {
    id: "tone",
    type: "toneNode",
    data: {
      tones: [
        { id: "1", name: "Professional" },
        { id: "2", name: "Business-oriented" },
      ],
    },
    position: { x: 250, y: 150 },
  },
  {
    id: "response-style",
    type: "responseStyleNode",
    data: {
      styles: [
        { id: "1", name: "Clear and concise" },
        { id: "2", name: "Use appropriate technical terms" },
        { id: "3", name: "Keep messages short" },
      ],
    },
    position: { x: 450, y: 150 },
  },
  {
    id: "products",
    type: "productsNode",
    data: {
      products: [
        {
          id: "1",
          name: "Wireless Noise-Canceling Headphones",
          price: 249.99,
          imageURL: "https://picsum.photos/300/300?random=1",
        },
        {
          id: "2",
          name: "Smart Fitness Tracker",
          price: 129.5,
          imageURL: "https://picsum.photos/300/300?random=2",
        },
        {
          id: "3",
          name: "Portable Bluetooth Speaker",
          price: 89.99,
          imageURL: "https://picsum.photos/300/300?random=3",
        },
        {
          id: "4",
          name: "Electric Coffee Grinder",
          price: 59.75,
          imageURL: "https://picsum.photos/300/300?random=4",
        },
        {
          id: "5",
          name: "Ergonomic Office Chair",
          price: 299.0,
          imageURL: "https://picsum.photos/300/300?random=5",
        },
      ],
    },
    position: { x: 250, y: 300 },
  },
];

// Initial edges
const initialEdges: Edge[] = [
  { id: "e1-2", source: "business-info", target: "language", animated: true },
  { id: "e1-3", source: "business-info", target: "tone", animated: true },
  {
    id: "e1-4",
    source: "business-info",
    target: "response-style",
    animated: true,
  },
  { id: "e2-5", source: "language", target: "products", animated: true },
  { id: "e3-5", source: "tone", target: "products", animated: true },
  { id: "e4-5", source: "response-style", target: "products", animated: true },
];

export default function VisualPromptBuilder() {
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Handle node changes
  const onNodesChange = (changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  // Handle edge changes
  const onEdgesChange = (changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };

  // Handle new connections
  const onConnect = (connection: Connection) => {
    setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
  };

  // Generate prompt from nodes
  useEffect(() => {
    const prompt = generatePromptFromNodes(nodes);
    setGeneratedPrompt(prompt);
  }, [nodes]);

  // Handle save prompt
  const handleSavePrompt = async () => {
    try {
      setIsSaving(true);
      await savePrompt(generatedPrompt);
      toast("Prompt saved successfully", {
        description:
          "Your customized prompt has been saved and will be used for AI responses.",
      });
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast("Failed to save prompt", {
        description: "There was an error saving your prompt. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
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
            <h1 className="text-xl font-bold">Visual Prompt Builder</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button
              onClick={handleSavePrompt}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Prompt"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Flow diagram */}
        <div className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="w-1/3 border-l p-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle>Prompt Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <PromptPreview prompt={generatedPrompt} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
