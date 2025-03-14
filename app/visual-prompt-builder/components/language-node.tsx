"use client";

import { useState } from "react";
import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface Language {
  id: string;
  name: string;
}

interface LanguageNodeProps {
  data: {
    languages: Language[];
  };
  isConnectable: boolean;
}

export function LanguageNode({ data, isConnectable }: LanguageNodeProps) {
  const [languages, setLanguages] = useState<Language[]>(data.languages);
  const [newLanguage, setNewLanguage] = useState("");

  // Add a new language
  const handleAddLanguage = () => {
    if (!newLanguage.trim()) return;

    const newLang = {
      id: Date.now().toString(),
      name: newLanguage.trim(),
    };

    const updatedLanguages = [...languages, newLang];
    setLanguages(updatedLanguages);
    data.languages = updatedLanguages;
    setNewLanguage("");
  };

  // Remove a language
  const handleRemoveLanguage = (id: string) => {
    const updatedLanguages = languages.filter((lang) => lang.id !== id);
    setLanguages(updatedLanguages);
    data.languages = updatedLanguages;
  };

  // Update a language
  const handleUpdateLanguage = (id: string, value: string) => {
    const updatedLanguages = languages.map((lang) =>
      lang.id === id ? { ...lang, name: value } : lang
    );
    setLanguages(updatedLanguages);
    data.languages = updatedLanguages;
  };

  return (
    <Card className="w-64">
      <CardHeader className="bg-blue-500 text-white py-2">
        <CardTitle className="text-base">Languages</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Label>Supported Languages</Label>
          <div className="space-y-2">
            {languages.map((lang) => (
              <div key={lang.id} className="flex items-center gap-2">
                <Input
                  value={lang.name}
                  onChange={(e) =>
                    handleUpdateLanguage(lang.id, e.target.value)
                  }
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveLanguage(lang.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Add language..."
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={handleAddLanguage}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />
    </Card>
  );
}
