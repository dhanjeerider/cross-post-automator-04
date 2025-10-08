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

    // Pinterest OAuth credentials
    const clientId = '1533175';
    const clientSecret = Deno.env.get('PINTEREST_CLIENT_SECRET'); // Store in Supabase secrets
    const redirectUri = `${Deno.env.get('APP_URL') || 'http://localhost:5173'}/oauth/pinterest`;

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Pinterest token exchange error:', errorText);
      throw new Error(`Failed to exchange code for token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userResponse.json();

    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        user_id: userData.id || userData.username,
        username: userData.username,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in pinterest-oauth-callback:', error);
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
