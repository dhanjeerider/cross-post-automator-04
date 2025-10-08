import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, userId } = await req.json();

    if (!imageBase64 || !userId) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the Imgbb API key for this user
    const { data: apiKeyData, error: apiKeyError } = await supabaseClient
      .from('api_keys')
      .select('api_key')
      .eq('user_id', userId)
      .eq('service', 'imgbb')
      .eq('is_active', true)
      .single();

    if (apiKeyError || !apiKeyData) {
      throw new Error('No Imgbb API key found. Please configure it in Settings.');
    }

    // Upload to Imgbb
    const formData = new FormData();
    formData.append('image', imageBase64);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKeyData.api_key}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Imgbb upload error:', errorText);
      throw new Error(`Failed to upload image: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Imgbb upload failed');
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: data.data.url,
        display_url: data.data.display_url,
        delete_url: data.data.delete_url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in upload-to-imgbb:', error);
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
