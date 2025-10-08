# OAuth and API Setup Guide

This guide explains how to configure OAuth credentials and API keys for the Cross-Post Automator application.

## Environment Variables / Supabase Secrets

The following environment variables need to be configured in your Supabase project as Edge Function secrets:

### Required for OAuth Flows

```bash
# Pinterest OAuth
PINTEREST_CLIENT_SECRET=your_pinterest_client_secret_here
# Note: Client ID (1533175) is already configured in the code

# YouTube OAuth
YOUTUBE_CLIENT_ID=your_youtube_client_id_here
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret_here

# Instagram OAuth (via Facebook)
INSTAGRAM_CLIENT_ID=your_instagram_client_id_here
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret_here

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_client_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret_here

# Application URL (for OAuth redirects)
APP_URL=https://your-app-url.com
```

### Required for API Access

```bash
# YouTube Data API (for fetching video information)
YOUTUBE_API_KEY=AIzaSyDMJDSiqd78g52t6W0F0BAMUij5xSynDe0

# Lovable AI API (for caption generation)
LOVABLE_API_KEY=your_lovable_api_key_here
```

## User-Configured API Keys

The following API keys are configured by users through the Settings UI:

### Imgbb Image Hosting
- **API Key**: `2a21aa2a66d64db0c276f6498bf56364`
- **Configuration**: Users enter this key in Settings > API Keys section
- **Usage**: Used for uploading images to Imgbb for hosting

### Pinterest API (Optional)
- **API Key**: `04b6e23cec2502fb538fec9319f644d262811caf`
- **App ID**: `1533175` (already in code)
- **Usage**: For Pinterest API v5 operations

## OAuth Redirect URIs

Make sure to configure these redirect URIs in each platform's developer console:

- **Pinterest**: `https://your-app-url.com/oauth/pinterest`
- **YouTube**: `https://your-app-url.com/oauth/youtube`
- **Instagram**: `https://your-app-url.com/oauth/instagram`
- **Facebook**: `https://your-app-url.com/oauth/facebook`

## Setting Up Supabase Secrets

To configure secrets in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to Edge Functions
3. Click on "Manage Secrets"
4. Add each secret with its corresponding value

Or use the Supabase CLI:

```bash
supabase secrets set PINTEREST_CLIENT_SECRET=your_secret_here
supabase secrets set YOUTUBE_CLIENT_ID=your_client_id_here
# ... and so on
```

## Platform-Specific Setup

### Pinterest
1. Go to [Pinterest Developers](https://developers.pinterest.com/)
2. Create an app (App ID: 1533175)
3. Get your Client Secret
4. Add redirect URI: `https://your-app-url.com/oauth/pinterest`

### YouTube
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Add redirect URI: `https://your-app-url.com/oauth/youtube`
5. Also create an API key for the YouTube Data API

### Instagram
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app with Instagram Basic Display or Instagram Graph API
3. Configure OAuth redirect URI: `https://your-app-url.com/oauth/instagram`

### Facebook
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app
3. Add Facebook Login product
4. Configure OAuth redirect URI: `https://your-app-url.com/oauth/facebook`

### Imgbb
1. Go to [Imgbb API](https://api.imgbb.com/)
2. Sign up and get your API key
3. Users enter this key in the application's Settings page

## Testing

After configuration:

1. Navigate to Settings in the application
2. Click "Connect" for each platform
3. You should be redirected to the platform's authorization page
4. After authorizing, you'll be redirected back with a connected account

## Troubleshooting

- **OAuth Error**: Check that redirect URIs match exactly
- **Token Exchange Failed**: Verify client ID and secret are correct
- **API Key Invalid**: Ensure API keys haven't expired and have proper permissions
- **CORS Errors**: Verify APP_URL is set correctly in Supabase secrets
