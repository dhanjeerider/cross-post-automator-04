import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Youtube, Instagram, Facebook, Shield, Loader2 } from "lucide-react";
import { FaPinterest } from "react-icons/fa";

interface SettingsProps {
  userId: string;
}

export const Settings = ({ userId }: SettingsProps) => {
  const { toast } = useToast();
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [oauthConfig, setOauthConfig] = useState<any>(null);

  useEffect(() => {
    fetchConnectedAccounts();
    fetchOAuthConfig();
  }, [userId]);

  const fetchOAuthConfig = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-oauth-config');
      if (error) throw error;
      setOauthConfig(data);
    } catch (error) {
      console.error('Error fetching OAuth config:', error);
    }
  };

  const fetchConnectedAccounts = async () => {
    const { data, error } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching accounts:', error);
    } else {
      setConnectedAccounts(data || []);
    }
    setLoading(false);
  };

  const isConnected = (platform: string) => {
    return connectedAccounts.some(
      account => account.platform === platform && account.is_active
    );
  };

  const handleConnect = async (platform: string) => {
    if (!oauthConfig) {
      toast({
        title: "Configuration Loading",
        description: "Please wait while we load the configuration...",
      });
      return;
    }

    if (platform === "pinterest") {
      const clientId = oauthConfig.pinterest.clientId;
      const redirectUri = `${window.location.origin}/oauth/pinterest`;
      const scope = "pins:read,pins:write,boards:read,boards:write";
      const state = Math.random().toString(36).substring(2);
      const authUrl = `https://www.pinterest.com/oauth/?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
      window.location.href = authUrl;
    } else if (platform === "youtube") {
      const clientId = oauthConfig.youtube.clientId;
      if (!clientId) {
        toast({
          title: "Setup Required",
          description: "YouTube OAuth credentials need to be configured. Please contact support.",
          variant: "destructive",
        });
        return;
      }
      const redirectUri = `${window.location.origin}/oauth/youtube`;
      const scope = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly";
      const state = Math.random().toString(36).substring(2);
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&state=${state}&prompt=consent`;
      window.location.href = authUrl;
    } else if (platform === "instagram") {
      const clientId = oauthConfig.instagram.clientId;
      if (!clientId) {
        toast({
          title: "Setup Required",
          description: "Instagram OAuth credentials need to be configured. Please contact support.",
          variant: "destructive",
        });
        return;
      }
      const redirectUri = `${window.location.origin}/oauth/instagram`;
      const scope = "user_profile,user_media";
      const state = Math.random().toString(36).substring(2);
      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${state}`;
      window.location.href = authUrl;
    } else if (platform === "facebook") {
      const clientId = oauthConfig.facebook.clientId;
      if (!clientId) {
        toast({
          title: "Setup Required",
          description: "Facebook OAuth credentials need to be configured. Please contact support.",
          variant: "destructive",
        });
        return;
      }
      const redirectUri = `${window.location.origin}/oauth/facebook`;
      const scope = "pages_show_list,pages_read_engagement,pages_manage_posts";
      const state = Math.random().toString(36).substring(2);
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${state}`;
      window.location.href = authUrl;
    } else if (platform === "imgbb") {
      toast({
        title: "Imgbb Integration",
        description: "Imgbb uses an API key. Please enter your key in the settings (coming soon).",
      });
    } else {
      toast({
        title: "Coming Soon!",
        description: `OAuth connection for ${platform} will be available soon.`,
      });
    }
  };

  const handleDisconnect = async (platform: string) => {
    const { error } = await supabase
      .from('connected_accounts')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('platform', platform as any);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect account",
        variant: "destructive",
      });
    } else {
      toast({ title: `Disconnected from ${platform}` });
      fetchConnectedAccounts();
    }
  };

  const platforms = [
    {
      name: "YouTube",
      icon: <Youtube className="w-5 h-5 text-red-500" />,
      platform: "youtube",
      description: "Fetch and post videos"
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-5 h-5 text-pink-500" />,
      platform: "instagram",
      description: "Post Reels and photos"
    },
    {
      name: "Facebook",
      icon: <Facebook className="w-5 h-5 text-blue-600" />,
      platform: "facebook",
      description: "Post to Pages and Groups"
    },
    {
      name: "Pinterest",
      icon: <FaPinterest className="w-5 h-5 text-red-600" />,
      platform: "pinterest",
      description: "Create Pins via OAuth"
    },
    {
      name: "Imgbb",
      icon: <img src="https://img.icons8.com/color/48/000000/image.png" alt="Imgbb" className="w-5 h-5" />,
      platform: "imgbb",
      description: "Upload images via API key"
    }
  ];

  return (
    <div className="grid gap-6 max-w-4xl">
      {/* Platform Connections */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle>Platform Connections</CardTitle>
          <CardDescription>Connect your social media accounts via OAuth</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            platforms.map((platform) => {
              const connected = isConnected(platform.platform);
              return (
                <div
                  key={platform.platform}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-smooth"
                >
                  <div className="flex items-center gap-3">
                    {platform.icon}
                    <div>
                      <p className="font-medium">{platform.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {platform.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {connected && (
                      <Badge variant="default">Connected</Badge>
                    )}
                    <Button
                      variant={connected ? "secondary" : "default"}
                      size="sm"
                      onClick={() => connected ? handleDisconnect(platform.platform) : handleConnect(platform.platform)}
                      className={!connected ? "bg-gradient-primary" : ""}
                    >
                      {connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* API Setup Guide */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Setup Guide
          </CardTitle>
          <CardDescription>
            How to get started with platform integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                YouTube Setup (Ready to Use!)
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                YouTube API is already configured with your provided API key. You can start creating automations right away!
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✅ API key configured</li>
                <li>✅ Can fetch video information</li>
                <li>✅ Works with Shorts and regular videos</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                Instagram (Coming Soon)
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                OAuth login integration is in development
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Will use official Instagram Graph API</li>
                <li>• No API key needed - just connect your account</li>
                <li>• Post directly to Reels and Feed</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h4 className="font-medium text-sm mb-2">Why OAuth Login?</h4>
              <p className="text-xs text-muted-foreground">
                This tool uses OAuth (Login with Platform) instead of requiring you to create API keys manually. This makes it:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                <li>✅ <strong>Free</strong> - No paid API plans needed</li>
                <li>✅ <strong>Easy</strong> - Just click Connect and log in</li>
                <li>✅ <strong>Secure</strong> - Platform handles authentication</li>
                <li>✅ <strong>Simple</strong> - No technical setup required</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
