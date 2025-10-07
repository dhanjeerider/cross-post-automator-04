import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoAutomation } from "@/components/automation/VideoAutomation";
import { SocialComposer } from "@/components/automation/SocialComposer";
import { Settings } from "@/components/automation/Settings";
import { Zap, Video, MessageSquare, Settings as SettingsIcon } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("video");

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient glow */}
      <div className="bg-gradient-glow">
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AutoPost Pro
              </h1>
              <p className="text-sm text-muted-foreground">
                Automate your social media presence
              </p>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid bg-card border border-border shadow-card">
            <TabsTrigger value="video" className="gap-2">
              <Video className="w-4 h-4" />
              Video Automation
            </TabsTrigger>
            <TabsTrigger value="composer" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Social Composer
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="space-y-6">
            <VideoAutomation />
          </TabsContent>

          <TabsContent value="composer" className="space-y-6">
            <SocialComposer />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Settings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
