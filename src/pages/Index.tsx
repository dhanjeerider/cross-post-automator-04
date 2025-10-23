import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VideoAutomation } from "@/components/automation/VideoAutomation";
import { SocialComposer } from "@/components/automation/SocialComposer";
import { Settings } from "@/components/automation/Settings";
import { Zap, Video, MessageSquare, Settings as SettingsIcon, LogOut } from "lucide-react";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "video");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

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
                  AutoPost Pro
                </h1>
                <p className="text-sm text-muted-foreground">
                  Automate your social media presence
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {session.user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
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
            <VideoAutomation userId={session.user.id} />
          </TabsContent>

          <TabsContent value="composer" className="space-y-6">
            <SocialComposer userId={session.user.id} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Settings userId={session.user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
