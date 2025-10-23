import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, platform, userId } = await req.json();

    if (!code || !platform || !userId) {
      throw new Error("Missing required parameters");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let tokenData;

    if (platform === "pinterest") {
      const clientId = "1533175";
      const clientSecret = Deno.env.get("PINTEREST_CLIENT_SECRET");
      const redirectUri = `${req.headers.get("origin")}/oauth/pinterest`;

      const tokenResponse = await fetch("https://api.pinterest.com/v5/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret || "",
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Pinterest token exchange failed: ${await tokenResponse.text()}`);
      }

      tokenData = await tokenResponse.json();

      const userResponse = await fetch("https://api.pinterest.com/v5/user_account", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const userData = await userResponse.json();

      await supabase.from("connected_accounts").upsert({
        user_id: userId,
        platform: "pinterest",
        platform_user_id: userData.username,
        platform_username: userData.username,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        is_active: true,
      }, { onConflict: "user_id,platform" });

    } else if (platform === "youtube") {
      const clientId = Deno.env.get("YOUTUBE_CLIENT_ID");
      const clientSecret = Deno.env.get("YOUTUBE_CLIENT_SECRET");
      const redirectUri = `${req.headers.get("origin")}/oauth/youtube`;

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId || "",
          client_secret: clientSecret || "",
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`YouTube token exchange failed: ${await tokenResponse.text()}`);
      }

      tokenData = await tokenResponse.json();

      const channelResponse = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      );

      const channelData = await channelResponse.json();
      const channel = channelData.items[0];

      await supabase.from("connected_accounts").upsert({
        user_id: userId,
        platform: "youtube",
        platform_user_id: channel.id,
        platform_username: channel.snippet.title,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        is_active: true,
      }, { onConflict: "user_id,platform" });
    }

    return new Response(
      JSON.stringify({ success: true, message: `${platform} connected successfully` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "OAuth callback failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
