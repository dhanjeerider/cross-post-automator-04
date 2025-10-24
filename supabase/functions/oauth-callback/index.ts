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

    } else if (platform === "instagram") {
      const clientId = Deno.env.get("INSTAGRAM_CLIENT_ID");
      const clientSecret = Deno.env.get("INSTAGRAM_CLIENT_SECRET");
      const redirectUri = `${req.headers.get("origin")}/oauth/instagram`;

      // Exchange code for short-lived token
      const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId || "",
          client_secret: clientSecret || "",
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Instagram token exchange failed: ${await tokenResponse.text()}`);
      }

      const shortLivedToken = await tokenResponse.json();

      // Exchange short-lived token for long-lived token
      const longLivedResponse = await fetch(
        `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${shortLivedToken.access_token}`
      );

      const longLivedToken = await longLivedResponse.json();

      // Get user info
      const userResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${longLivedToken.access_token}`
      );

      const userData = await userResponse.json();

      await supabase.from("connected_accounts").upsert({
        user_id: userId,
        platform: "instagram",
        platform_user_id: userData.id,
        platform_username: userData.username,
        access_token: longLivedToken.access_token,
        refresh_token: null,
        token_expires_at: new Date(Date.now() + longLivedToken.expires_in * 1000).toISOString(),
        is_active: true,
      }, { onConflict: "user_id,platform" });

    } else if (platform === "facebook") {
      const clientId = Deno.env.get("FACEBOOK_CLIENT_ID");
      const clientSecret = Deno.env.get("FACEBOOK_CLIENT_SECRET");
      const redirectUri = `${req.headers.get("origin")}/oauth/facebook`;

      const tokenResponse = await fetch("https://graph.facebook.com/v18.0/oauth/access_token", {
        method: "GET",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`;
      
      const fbTokenResponse = await fetch(tokenUrl);

      if (!fbTokenResponse.ok) {
        throw new Error(`Facebook token exchange failed: ${await fbTokenResponse.text()}`);
      }

      tokenData = await fbTokenResponse.json();

      // Get user info
      const userResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name&access_token=${tokenData.access_token}`
      );

      const userData = await userResponse.json();

      await supabase.from("connected_accounts").upsert({
        user_id: userId,
        platform: "facebook",
        platform_user_id: userData.id,
        platform_username: userData.name,
        access_token: tokenData.access_token,
        refresh_token: null,
        token_expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
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
