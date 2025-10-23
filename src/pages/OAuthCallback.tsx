import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const platform = window.location.pathname.split("/oauth/")[1];

      if (!code) {
        setStatus("error");
        toast({
          title: "Authentication Failed",
          description: "No authorization code received",
          variant: "destructive",
        });
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        const { data, error } = await supabase.functions.invoke("oauth-callback", {
          body: { code, platform, state, userId: user.id },
        });

        if (error) throw error;

        setStatus("success");
        toast({
          title: "Connected Successfully!",
          description: `Your ${platform} account has been connected.`,
        });

        setTimeout(() => navigate("/?tab=settings"), 1500);
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect account",
          variant: "destructive",
        });
        setTimeout(() => navigate("/"), 2000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === "processing" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Connecting your account...</h2>
            <p className="text-muted-foreground">Please wait while we complete the setup.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Successfully Connected!</h2>
            <p className="text-muted-foreground">Redirecting you back...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Connection Failed</h2>
            <p className="text-muted-foreground">Redirecting you back...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
