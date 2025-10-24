import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Return public OAuth client IDs (these are safe to expose)
    const config = {
      youtube: {
        clientId: Deno.env.get("YOUTUBE_CLIENT_ID") || "",
      },
      pinterest: {
        clientId: "1533175", // Public Pinterest app ID
      },
      instagram: {
        clientId: Deno.env.get("INSTAGRAM_CLIENT_ID") || "",
      },
      facebook: {
        clientId: Deno.env.get("FACEBOOK_CLIENT_ID") || "",
      },
    };

    return new Response(
      JSON.stringify(config),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error fetching OAuth config:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
