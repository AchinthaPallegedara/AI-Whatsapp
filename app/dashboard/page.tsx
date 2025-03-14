import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CurrentPrompt } from "../prompt-builder/current-prompt";
import { MessageSquare, PenSquare, Zap } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">WhatsApp Bot Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Visual Prompt Builder</CardTitle>
              <PenSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Customize your AI assistant visually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Use our visual editor to customize your AI assistant&apos;s
              behavior without needing to understand prompt engineering.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/visual-prompt-builder" passHref className="w-full">
              <Button className="w-full">Visual Editor</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Chat Sandbox</CardTitle>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Test your AI assistant in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Try out different prompts and see how your AI responds without
              sending actual WhatsApp messages.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/chat-sandbox" passHref className="w-full">
              <Button className="w-full" variant="outline">
                Test Chat
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Analytics</CardTitle>
              <Zap className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              View chat statistics and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Monitor usage, popular queries, and AI response performance to
              optimize your bot.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Prompt</CardTitle>
          <CardDescription>
            This is the prompt currently being used by your AI assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CurrentPrompt />
        </CardContent>
      </Card>
    </div>
  );
}
