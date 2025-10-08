import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const OAuthInstagram = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        toast({
          title: "Authorization Failed",
          description: `Instagram authorization was denied: ${error}`,
          variant: "destructive",
        });
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      if (!code) {
        setStatus("error");
        toast({
          title: "Invalid Callback",
          description: "No authorization code received",
          variant: "destructive",
        });
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      try {
        // Exchange code for access token via Supabase Edge Function
        const { data, error: exchangeError } = await supabase.functions.invoke('instagram-oauth-callback', {
          body: { code }
        });

        if (exchangeError) throw exchangeError;

        // Store the access token in connected_accounts
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("User not authenticated");
        }

        const { error: insertError } = await supabase
          .from('connected_accounts')
          .upsert({
            user_id: user.id,
            platform: 'instagram',
            platform_user_id: data.user_id,
            platform_username: data.username,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            token_expires_at: data.expires_at,
            is_active: true,
          });

        if (insertError) throw insertError;

        setStatus("success");
        toast({
          title: "Success!",
          description: "Instagram account connected successfully",
        });
        
        setTimeout(() => navigate("/"), 2000);
      } catch (error: any) {
        setStatus("error");
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect Instagram account",
          variant: "destructive",
        });
        setTimeout(() => navigate("/"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Instagram OAuth</CardTitle>
          <CardDescription>
            {status === "loading" && "Connecting your Instagram account..."}
            {status === "success" && "Successfully connected!"}
            {status === "error" && "Connection failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {status === "loading" && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
          {status === "success" && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Redirecting...</p>
            </div>
          )}
          {status === "error" && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Redirecting back...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthInstagram;
