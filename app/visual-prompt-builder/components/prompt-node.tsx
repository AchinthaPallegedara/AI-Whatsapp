import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PromptNodeProps {
  data: {
    prompt: string;
  };
  isConnectable: boolean;
}

export function PromptNode({ data, isConnectable }: PromptNodeProps) {
  return (
    <Card className="w-80">
      <CardHeader className="bg-gray-500 text-white py-2">
        <CardTitle className="text-base">Prompt</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div>{data.prompt}</div>
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-gray-500"
      />
    </Card>
  );
}
