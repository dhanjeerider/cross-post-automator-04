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
    const { code } = await req.json();

    if (!code) {
      throw new Error('Authorization code is required');
    }

    // Facebook OAuth credentials
    const clientId = Deno.env.get('FACEBOOK_CLIENT_ID');
    const clientSecret = Deno.env.get('FACEBOOK_CLIENT_SECRET');
    const redirectUri = `${Deno.env.get('APP_URL') || 'http://localhost:5173'}/oauth/facebook`;

    // Exchange authorization code for access token
    const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Facebook token exchange error:', errorText);
      throw new Error(`Failed to exchange code for token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${tokenData.access_token}`);

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userResponse.json();

    // Exchange for long-lived token
    const longLivedResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${tokenData.access_token}`);
    
    let finalToken = tokenData.access_token;
    let expiresIn = tokenData.expires_in || 3600;

    if (longLivedResponse.ok) {
      const longLivedData = await longLivedResponse.json();
      finalToken = longLivedData.access_token;
      expiresIn = longLivedData.expires_in;
    }

    return new Response(
      JSON.stringify({
        access_token: finalToken,
        refresh_token: null,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        user_id: userData.id,
        name: userData.name,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in facebook-oauth-callback:', error);
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
