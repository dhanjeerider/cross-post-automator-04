import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<string>("Processing OAuth callback...");

  useEffect(() => {
    handleOAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const handleOAuthCallback = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error");
      const platform = location.pathname.split("/").pop();

      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }

      if (!code) {
        throw new Error("No authorization code received");
      }

      setStatus(`Completing ${platform} authentication...`);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Handle different platforms
      if (platform === "pinterest") {
        await handlePinterestCallback(code, user.id);
      } else if (platform === "youtube") {
        await handleYouTubeCallback(code, user.id);
      } else if (platform === "instagram") {
        await handleInstagramCallback(code, user.id);
      } else if (platform === "facebook") {
        await handleFacebookCallback(code, user.id);
      } else {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      toast({
        title: "Success!",
        description: `${platform} account connected successfully.`,
      });

      // Redirect to settings page
      setTimeout(() => {
        navigate("/?tab=settings");
      }, 2000);
    } catch (error) {
      console.error("OAuth callback error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to connect account";
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      setTimeout(() => {
        navigate("/?tab=settings");
      }, 3000);
    }
  };

  const handlePinterestCallback = async (code: string, userId: string) => {
    // In a real implementation, you would exchange the code for an access token
    // via your backend/edge function, then store it in the database
    setStatus("Storing Pinterest credentials...");
    
    // For now, we'll store a placeholder
    // TODO: Implement proper token exchange with Pinterest API
    const { error } = await supabase
      .from("connected_accounts")
      .upsert({
        user_id: userId,
        platform: "pinterest",
        platform_user_id: "pinterest_user_" + Date.now(),
        platform_username: "Pinterest User",
        access_token: code, // This should be the actual access token
        is_active: true,
      });

    if (error) throw error;
  };

  const handleYouTubeCallback = async (code: string, userId: string) => {
    setStatus("Storing YouTube credentials...");
    
    // TODO: Implement proper token exchange with YouTube API
    const { error } = await supabase
      .from("connected_accounts")
      .upsert({
        user_id: userId,
        platform: "youtube",
        platform_user_id: "youtube_user_" + Date.now(),
        platform_username: "YouTube User",
        access_token: code,
        is_active: true,
      });

    if (error) throw error;
  };

  const handleInstagramCallback = async (code: string, userId: string) => {
    setStatus("Storing Instagram credentials...");
    
    // TODO: Implement proper token exchange with Instagram Graph API
    const { error } = await supabase
      .from("connected_accounts")
      .upsert({
        user_id: userId,
        platform: "instagram",
        platform_user_id: "instagram_user_" + Date.now(),
        platform_username: "Instagram User",
        access_token: code,
        is_active: true,
      });

    if (error) throw error;
  };

  const handleFacebookCallback = async (code: string, userId: string) => {
    setStatus("Storing Facebook credentials...");
    
    // TODO: Implement proper token exchange with Facebook Graph API
    const { error } = await supabase
      .from("connected_accounts")
      .upsert({
        user_id: userId,
        platform: "facebook",
        platform_user_id: "facebook_user_" + Date.now(),
        platform_username: "Facebook User",
        access_token: code,
        is_active: true,
      });

    if (error) throw error;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connecting Account</CardTitle>
          <CardDescription>{status}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
