# OAuth Setup Guide

This guide explains how to configure OAuth for each social media platform to enable social login functionality.

## Overview

The application now supports OAuth authentication for the following platforms:
- YouTube
- Pinterest  
- Instagram
- Facebook

## Prerequisites

You need to create OAuth applications in each platform's developer console to get the required credentials.

## YouTube OAuth Setup

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3

### 2. Create OAuth Credentials
1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Configure the OAuth consent screen if prompted
4. Select **Web application** as the application type
5. Add authorized redirect URIs:
   - `http://localhost:5173/oauth/callback` (for development)
   - `https://your-domain.com/oauth/callback` (for production)
6. Save and copy the **Client ID** and **Client Secret**

### 3. Configure Environment Variables
Add to your `.env` file:
```env
VITE_YOUTUBE_CLIENT_ID=your_client_id_here
```

Add to Supabase secrets:
```bash
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
```

---

## Pinterest OAuth Setup

### 1. Create a Pinterest App
1. Go to [Pinterest Developers](https://developers.pinterest.com/)
2. Create a new app
3. Note your **App ID** and **App Secret**

### 2. Configure Redirect URI
1. In your app settings, add redirect URI:
   - `http://localhost:5173/oauth/callback` (for development)
   - `https://your-domain.com/oauth/callback` (for production)

### 3. Configure Environment Variables
Add to your `.env` file:
```env
VITE_PINTEREST_APP_ID=1533175
```

Add to Supabase secrets:
```bash
PINTEREST_APP_ID=1533175
PINTEREST_APP_SECRET=your_app_secret_here
```

---

## Instagram OAuth Setup

### 1. Create a Facebook/Meta App
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add **Instagram Basic Display** product
4. Configure Instagram Basic Display settings

### 2. Configure OAuth
1. Add **Valid OAuth Redirect URIs**:
   - `http://localhost:5173/oauth/callback` (for development)
   - `https://your-domain.com/oauth/callback` (for production)
2. Note your **Instagram App ID** and **Instagram App Secret**

### 3. Configure Environment Variables
Add to your `.env` file:
```env
VITE_INSTAGRAM_CLIENT_ID=your_client_id_here
```

Add to Supabase secrets:
```bash
INSTAGRAM_CLIENT_ID=your_client_id_here
INSTAGRAM_CLIENT_SECRET=your_client_secret_here
```

---

## Facebook OAuth Setup

### 1. Create a Facebook App
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add **Facebook Login** product

### 2. Configure OAuth
1. Add **Valid OAuth Redirect URIs** in Facebook Login settings:
   - `http://localhost:5173/oauth/callback` (for development)
   - `https://your-domain.com/oauth/callback` (for production)
2. Note your **App ID** and **App Secret**

### 3. Configure Environment Variables
Add to your `.env` file:
```env
VITE_FACEBOOK_APP_ID=your_app_id_here
```

Add to Supabase secrets:
```bash
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
```

---

## Supabase Configuration

### Deploy Edge Functions

Deploy the OAuth functions to Supabase:

```bash
# Deploy all OAuth functions
supabase functions deploy oauth-youtube
supabase functions deploy oauth-pinterest
supabase functions deploy oauth-instagram
supabase functions deploy oauth-facebook
```

### Set Supabase Secrets

Set the required secrets in Supabase:

```bash
# YouTube
supabase secrets set YOUTUBE_CLIENT_ID=your_client_id
supabase secrets set YOUTUBE_CLIENT_SECRET=your_client_secret

# Pinterest
supabase secrets set PINTEREST_APP_ID=1533175
supabase secrets set PINTEREST_APP_SECRET=your_app_secret

# Instagram
supabase secrets set INSTAGRAM_CLIENT_ID=your_client_id
supabase secrets set INSTAGRAM_CLIENT_SECRET=your_client_secret

# Facebook
supabase secrets set FACEBOOK_APP_ID=your_app_id
supabase secrets set FACEBOOK_APP_SECRET=your_app_secret

# Frontend URL (used for OAuth redirects)
supabase secrets set FRONTEND_URL=https://your-domain.com
```

---

## Testing OAuth Flows

1. Start the development server: `npm run dev`
2. Navigate to the Settings page
3. Click **Connect** for any platform
4. You should be redirected to the platform's OAuth consent screen
5. After granting permissions, you'll be redirected back to the app
6. The account should appear as "Connected" in the Settings page

---

## Troubleshooting

### "OAuth client was not found" Error
- Verify that you've set the correct client ID in your `.env` file
- Ensure the OAuth app is properly configured in the platform's developer console
- Check that redirect URIs match exactly (including protocol and port)

### "Invalid redirect URI" Error
- Make sure the redirect URI is added to the OAuth app's allowed redirect URIs
- Verify the URI matches exactly (case-sensitive)

### Token Exchange Fails
- Check that all secrets are properly set in Supabase
- Verify the OAuth app has the required permissions/scopes
- Check the Supabase function logs for detailed error messages

### Connection Not Saved
- Ensure the `connected_accounts` table exists in your Supabase database
- Check that Row Level Security (RLS) policies allow the user to insert/update records
- Verify the Supabase service role key is set correctly

---

## API Keys Already Configured

The following API keys have been added to the `.env` file:

- **YouTube API Key**: AIzaSyDMJDSiqd78g52t6W0F0BAMUij5xSynDe0
- **Pinterest API Key**: 04b6e23cec2502fb538fec9319f644d262811caf
- **Pinterest App ID**: 1533175
- **ImgBB API Key**: 2a21aa2a66d64db0c276f6498bf56364

These can be used for API operations that don't require OAuth authentication.

---

## Security Notes

- Never commit OAuth secrets to version control
- Use environment variables for all sensitive credentials
- Regularly rotate OAuth secrets
- Use HTTPS in production
- Implement proper CORS policies
- Monitor OAuth token usage and expiration
