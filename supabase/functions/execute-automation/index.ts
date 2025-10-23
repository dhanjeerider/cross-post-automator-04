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
    const { automationId, userId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: automation, error: autoError } = await supabase
      .from("automation_rules")
      .select("*")
      .eq("id", automationId)
      .eq("user_id", userId)
      .single();

    if (autoError || !automation) {
      throw new Error("Automation not found");
    }

    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");
    let videoData;

    if (automation.source_platform === "youtube") {
      const videoId = automation.source_identifier;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${youtubeApiKey}`
      );
      const data = await response.json();
      videoData = data.items[0];
    }

    let caption = automation.custom_caption_template || "";
    
    if (automation.use_ai_captions && videoData) {
      const captionResponse = await supabase.functions.invoke("generate-ai-caption", {
        body: {
          title: videoData.snippet.title,
          description: videoData.snippet.description,
          platform: automation.target_platforms[0],
        },
      });
      
      if (captionResponse.data?.caption) {
        caption = captionResponse.data.caption;
      }
    }

    for (const targetPlatform of automation.target_platforms) {
      const { data: account } = await supabase
        .from("connected_accounts")
        .select("*")
        .eq("user_id", userId)
        .eq("platform", targetPlatform)
        .eq("is_active", true)
        .single();

      if (!account) {
        await supabase.from("posted_content").insert({
          automation_rule_id: automationId,
          user_id: userId,
          source_platform: automation.source_platform,
          source_video_id: automation.source_identifier,
          source_video_url: videoData?.snippet ? `https://youtube.com/watch?v=${automation.source_identifier}` : "",
          source_video_title: videoData?.snippet?.title || "",
          target_platform: targetPlatform,
          caption,
          status: "failed",
          error_message: `No ${targetPlatform} account connected`,
        });
        continue;
      }

      const postResult = await supabase.functions.invoke("post-to-platform", {
        body: {
          platform: targetPlatform,
          accessToken: account.access_token,
          videoUrl: `https://youtube.com/watch?v=${automation.source_identifier}`,
          caption,
          userId,
        },
      });

      await supabase.from("posted_content").insert({
        automation_rule_id: automationId,
        user_id: userId,
        source_platform: automation.source_platform,
        source_video_id: automation.source_identifier,
        source_video_url: `https://youtube.com/watch?v=${automation.source_identifier}`,
        source_video_title: videoData?.snippet?.title || "",
        target_platform: targetPlatform,
        caption,
        status: postResult.error ? "failed" : "posted",
        posted_at: postResult.error ? null : new Date().toISOString(),
        target_post_url: postResult.data?.url || null,
        error_message: postResult.error?.message || null,
      });
    }

    await supabase
      .from("automation_rules")
      .update({ last_run_at: new Date().toISOString() })
      .eq("id", automationId);

    return new Response(
      JSON.stringify({ success: true, message: "Automation executed successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Execute automation error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to execute automation" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
