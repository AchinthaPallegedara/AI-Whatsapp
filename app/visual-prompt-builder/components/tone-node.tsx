"use client";

import { useState } from "react";
import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface Tone {
  id: string;
  name: string;
}

interface ToneNodeProps {
  data: {
    tones: Tone[];
  };
  isConnectable: boolean;
}

export function ToneNode({ data, isConnectable }: ToneNodeProps) {
  const [tones, setTones] = useState<Tone[]>(data.tones);
  const [newTone, setNewTone] = useState("");

  // Add a new tone
  const handleAddTone = () => {
    if (!newTone.trim()) return;

    const newToneItem = {
      id: Date.now().toString(),
      name: newTone.trim(),
    };

    const updatedTones = [...tones, newToneItem];
    setTones(updatedTones);
    data.tones = updatedTones;
    setNewTone("");
  };

  // Remove a tone
  const handleRemoveTone = (id: string) => {
    const updatedTones = tones.filter((tone) => tone.id !== id);
    setTones(updatedTones);
    data.tones = updatedTones;
  };

  // Update a tone
  const handleUpdateTone = (id: string, value: string) => {
    const updatedTones = tones.map((tone) =>
      tone.id === id ? { ...tone, name: value } : tone
    );
    setTones(updatedTones);
    data.tones = updatedTones;
  };

  return (
    <Card className="w-64">
      <CardHeader className="bg-green-500 text-white py-2">
        <CardTitle className="text-base">Tone</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Label>Communication Tone</Label>
          <div className="space-y-2">
            {tones.map((tone) => (
              <div key={tone.id} className="flex items-center gap-2">
                <Input
                  value={tone.name}
                  onChange={(e) => handleUpdateTone(tone.id, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTone(tone.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={newTone}
              onChange={(e) => setNewTone(e.target.value)}
              placeholder="Add tone..."
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={handleAddTone}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-green-500"
      />
    </Card>
  );
}
