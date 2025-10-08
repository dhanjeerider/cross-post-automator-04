import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, userId } = await req.json();
    
    if (!code || !userId) {
      throw new Error('Missing code or userId');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OAuth credentials from environment
    const clientId = Deno.env.get('INSTAGRAM_CLIENT_ID');
    const clientSecret = Deno.env.get('INSTAGRAM_CLIENT_SECRET');
    const redirectUri = `${Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'}/oauth/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Instagram OAuth credentials not configured');
    }

    // Exchange authorization code for short-lived access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange error:', errorData);
      throw new Error('Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, user_id } = tokenData;

    // Exchange short-lived token for long-lived token
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${access_token}`
    );

    if (!longLivedTokenResponse.ok) {
      console.error('Long-lived token exchange failed, using short-lived token');
    }

    const longLivedTokenData = longLivedTokenResponse.ok 
      ? await longLivedTokenResponse.json() 
      : { access_token, expires_in: 3600 };

    const finalAccessToken = longLivedTokenData.access_token;
    const expiresIn = longLivedTokenData.expires_in || 3600;

    // Get user info from Instagram Graph API
    const userInfoResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${finalAccessToken}`
    );

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch Instagram user info');
    }

    const userInfo = await userInfoResponse.json();
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Store or update the connected account in the database
    const { error: upsertError } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: userId,
        platform: 'instagram',
        platform_user_id: userInfo.id || user_id,
        platform_username: userInfo.username,
        access_token: finalAccessToken,
        refresh_token: null,
        token_expires_at: expiresAt.toISOString(),
        is_active: true,
        last_used_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform',
      });

    if (upsertError) {
      console.error('Database error:', upsertError);
      throw new Error('Failed to save account connection');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('OAuth Instagram error:', error);
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
