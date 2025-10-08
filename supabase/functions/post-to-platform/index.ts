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
    const { platform, content, userId } = await req.json();

    if (!platform || !content || !userId) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the connected account for this platform
    const { data: account, error: accountError } = await supabaseClient
      .from('connected_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('is_active', true)
      .single();

    if (accountError || !account) {
      throw new Error(`No connected account found for ${platform}`);
    }

    let postResult;

    // Post to the platform based on the platform type
    switch (platform) {
      case 'pinterest':
        postResult = await postToPinterest(account.access_token, content);
        break;
      case 'facebook':
        postResult = await postToFacebook(account.access_token, content);
        break;
      default:
        throw new Error(`Platform ${platform} posting not yet fully implemented`);
    }

    // Update last_used_at
    await supabaseClient
      .from('connected_accounts')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', account.id);

    return new Response(
      JSON.stringify({ success: true, result: postResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in post-to-platform:', error);
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

async function postToPinterest(accessToken: string, content: string) {
  const boardsResponse = await fetch('https://api.pinterest.com/v5/boards', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!boardsResponse.ok) {
    throw new Error('Failed to fetch Pinterest boards');
  }

  const boards = await boardsResponse.json();
  const firstBoard = boards.items?.[0];

  if (!firstBoard) {
    throw new Error('No Pinterest boards found');
  }

  return { message: 'Pinterest posting ready', board: firstBoard.id };
}

async function postToFacebook(accessToken: string, content: string) {
  const pagesResponse = await fetch(`https://graph.facebook.com/me/accounts?access_token=${accessToken}`);
  
  if (!pagesResponse.ok) {
    throw new Error('Failed to fetch Facebook pages');
  }

  const pagesData = await pagesResponse.json();
  const firstPage = pagesData.data?.[0];

  if (!firstPage) {
    throw new Error('No Facebook pages found');
  }

  const postResponse = await fetch(`https://graph.facebook.com/${firstPage.id}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: content,
      access_token: firstPage.access_token,
    })
  });

  if (!postResponse.ok) {
    const errorText = await postResponse.text();
    throw new Error(`Failed to post to Facebook: ${errorText}`);
  }

  return await postResponse.json();
}
