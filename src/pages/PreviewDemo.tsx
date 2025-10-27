import { PreviewDialog } from "@/components/PreviewDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

const PreviewDemo = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient glow */}
      <div className="bg-gradient-glow border-b border-border">
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-primary">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  AutoPost Pro - Preview Demo
                </h1>
                <p className="text-sm text-muted-foreground">
                  Test the preview dialog functionality
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <PreviewDialog />
            </div>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle>Preview Dialog Feature</CardTitle>
            <CardDescription>
              Click the "Preview" button in the header to see the application in an internal browser popup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h3 className="font-medium text-sm mb-2">✨ Features:</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Opens app preview in a modal dialog without leaving the page</li>
                <li>• Full-width responsive iframe viewer (90% viewport height)</li>
                <li>• Option to open in a new tab via the "Open in new tab" link</li>
                <li>• Smooth animations and professional UI</li>
                <li>• Accessible with keyboard navigation (ESC to close)</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h3 className="font-medium text-sm mb-2">🎯 How it works:</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Click the "Preview" button with eye icon in the header</li>
                <li>A large dialog opens showing the app in an embedded iframe</li>
                <li>Interact with the app inside the preview or click outside to close</li>
                <li>Use the "Open in new tab" link for a full browser experience</li>
              </ol>
            </div>

            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <h3 className="font-medium text-sm mb-2">✅ Benefits:</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Quick testing without navigating away from your current context</li>
                <li>• Perfect for demos and presentations</li>
                <li>• No need for external preview tools or new windows</li>
                <li>• Maintains your workflow and session state</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PreviewDemo;
