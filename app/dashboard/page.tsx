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

export default function Dashboard() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">WhatsApp Bot Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>AI Prompt</CardTitle>
            <CardDescription>
              Customize how your AI assistant responds to customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              The AI prompt determines how your assistant behaves, what
              information it provides, and how it interacts with your customers.
            </p>
            <p className="text-sm text-muted-foreground">
              Use the prompt builder to create a custom prompt. If no custom
              prompt is set, the system will use the default prompt.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/prompt-builder" passHref>
              <Button>Edit Prompt</Button>
            </Link>
          </CardFooter>
        </Card>

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
    </div>
  );
}
