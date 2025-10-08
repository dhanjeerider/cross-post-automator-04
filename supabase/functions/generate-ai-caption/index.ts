import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, platform } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('AI API key not configured');
    }

    console.log('Generating caption for platform:', platform);

    const platformGuidelines: Record<string, string> = {
      instagram: 'Keep it engaging with emojis, use 3-5 relevant hashtags',
      youtube: 'Include relevant keywords, add timestamps if needed, use 2-3 hashtags',
      facebook: 'Conversational tone, ask a question to boost engagement',
      tiktok: 'Trendy and fun, use popular hashtags, keep it short',
      pinterest: 'SEO-friendly, include keywords, descriptive'
    };

    const prompt = `Create an engaging social media caption for ${platform} based on this content:

Title: ${title}
Description: ${description}

Guidelines for ${platform}: ${platformGuidelines[platform] || 'Keep it engaging'}

Return ONLY the caption text, nothing else.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a social media expert who creates engaging captions.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const caption = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ caption }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-ai-caption:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
