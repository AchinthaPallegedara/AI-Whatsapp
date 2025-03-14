"use client";

import { useState } from "react";
import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface Style {
  id: string;
  name: string;
}

interface ResponseStyleNodeProps {
  data: {
    styles: Style[];
  };
  isConnectable: boolean;
}

export function ResponseStyleNode({
  data,
  isConnectable,
}: ResponseStyleNodeProps) {
  const [styles, setStyles] = useState<Style[]>(data.styles);
  const [newStyle, setNewStyle] = useState("");

  // Add a new style
  const handleAddStyle = () => {
    if (!newStyle.trim()) return;

    const newStyleItem = {
      id: Date.now().toString(),
      name: newStyle.trim(),
    };

    const updatedStyles = [...styles, newStyleItem];
    setStyles(updatedStyles);
    data.styles = updatedStyles;
    setNewStyle("");
  };

  // Remove a style
  const handleRemoveStyle = (id: string) => {
    const updatedStyles = styles.filter((style) => style.id !== id);
    setStyles(updatedStyles);
    data.styles = updatedStyles;
  };

  // Update a style
  const handleUpdateStyle = (id: string, value: string) => {
    const updatedStyles = styles.map((style) =>
      style.id === id ? { ...style, name: value } : style
    );
    setStyles(updatedStyles);
    data.styles = updatedStyles;
  };

  return (
    <Card className="w-64">
      <CardHeader className="bg-purple-500 text-white py-2">
        <CardTitle className="text-base">Response Style</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Label>Communication Style</Label>
          <div className="space-y-2">
            {styles.map((style) => (
              <div key={style.id} className="flex items-center gap-2">
                <Input
                  value={style.name}
                  onChange={(e) => handleUpdateStyle(style.id, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveStyle(style.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={newStyle}
              onChange={(e) => setNewStyle(e.target.value)}
              placeholder="Add style..."
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={handleAddStyle}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-500"
      />
    </Card>
  );
}
