import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    images?: { url: string; caption: string }[];
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const formattedTime = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <Avatar className={cn("h-8 w-8", isUser ? "bg-primary" : "bg-muted")}>
        <AvatarFallback>{isUser ? "U" : "AI"}</AvatarFallback>
        {!isUser && <AvatarImage src="/ai-avatar.png" alt="AI" />}
      </Avatar>

      <div className={cn("flex flex-col max-w-[80%]", isUser && "items-end")}>
        <Card
          className={cn(
            "mb-1  py-2",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          <CardContent className="px-3 text-sm ">
            <div className="whitespace-pre-wrap">{message.content}</div>
          </CardContent>
        </Card>

        {message.images && message.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 my-2">
            {message.images.map((image, index) => (
              <div key={index} className="overflow-hidden rounded-md">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.caption}
                  className="w-full h-auto object-cover"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {image.caption}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground">{formattedTime}</div>
      </div>
    </div>
  );
}
