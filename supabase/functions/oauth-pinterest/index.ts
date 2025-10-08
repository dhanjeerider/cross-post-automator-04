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
    const clientId = Deno.env.get('PINTEREST_APP_ID');
    const clientSecret = Deno.env.get('PINTEREST_APP_SECRET');
    const redirectUri = `${Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'}/oauth/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Pinterest OAuth credentials not configured');
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange error:', errorData);
      throw new Error('Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get user info from Pinterest API
    const userInfoResponse = await fetch(
      'https://api.pinterest.com/v5/user_account',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch Pinterest user info');
    }

    const userInfo = await userInfoResponse.json();

    const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null;

    // Store or update the connected account in the database
    const { error: upsertError } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: userId,
        platform: 'pinterest',
        platform_user_id: userInfo.username || userInfo.id,
        platform_username: userInfo.username,
        access_token: access_token,
        refresh_token: refresh_token,
        token_expires_at: expiresAt ? expiresAt.toISOString() : null,
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
    console.error('OAuth Pinterest error:', error);
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
