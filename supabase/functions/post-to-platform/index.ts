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
    const { platform, accessToken, videoUrl, caption } = await req.json();

    let result;

    if (platform === "pinterest") {
      const boardResponse = await fetch("https://api.pinterest.com/v5/boards", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const boards = await boardResponse.json();
      const boardId = boards.items?.[0]?.id;

      if (!boardId) {
        throw new Error("No Pinterest board found");
      }

      const pinResponse = await fetch("https://api.pinterest.com/v5/pins", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          board_id: boardId,
          title: caption.substring(0, 100),
          description: caption,
          link: videoUrl,
          media_source: {
            source_type: "video_url",
            url: videoUrl,
          },
        }),
      });

      if (!pinResponse.ok) {
        throw new Error(`Pinterest post failed: ${await pinResponse.text()}`);
      }

      result = await pinResponse.json();
      
      return new Response(
        JSON.stringify({ success: true, url: `https://pinterest.com/pin/${result.id}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (platform === "instagram") {
      throw new Error("Instagram posting requires additional setup and app review");
    } else if (platform === "facebook") {
      const pageResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
      );
      const pages = await pageResponse.json();
      const pageAccessToken = pages.data?.[0]?.access_token;

      if (!pageAccessToken) {
        throw new Error("No Facebook page found");
      }

      const postResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: caption,
            link: videoUrl,
            access_token: pageAccessToken,
          }),
        }
      );

      if (!postResponse.ok) {
        throw new Error(`Facebook post failed: ${await postResponse.text()}`);
      }

      result = await postResponse.json();
      
      return new Response(
        JSON.stringify({ success: true, url: `https://facebook.com/${result.id}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Platform ${platform} not yet supported`);
  } catch (error: any) {
    console.error("Post to platform error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to post to platform" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
