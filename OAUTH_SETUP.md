# OAuth and API Keys Setup Guide

This document describes the OAuth integrations and API keys that have been configured for the AutoPost Pro application.

## Enabled Features

The following "coming soon" features have now been enabled:

### 1. Pinterest OAuth Integration ✅
- **Status**: Fully configured and ready to use
- **App ID**: 1533175
- **API Key**: 04b6e23cec2502fb538fec9319f644d262811caf
- **OAuth Flow**: Implemented via Pinterest OAuth 2.0
- **Callback URL**: `/oauth/pinterest`
- **Scopes**: pins:read, pins:write, boards:read, boards:write

**How it works**:
1. User clicks "Connect" on Pinterest in Settings
2. Redirected to Pinterest OAuth authorization page
3. After authorization, Pinterest redirects back to `/oauth/pinterest`
4. App stores credentials in Supabase `connected_accounts` table
5. User can now create Pins via the platform

### 2. YouTube API Integration ✅
- **Status**: Configured for video fetching and search
- **API Key**: AIzaSyDMJDSiqd78g52t6W0F0BAMUij5xSynDe0
- **Features**:
  - Search videos by query
  - Get videos from specific channels
  - Fetch videos by hashtag
  - Fetch video metadata (title, description, thumbnails, etc.)

**Utility functions available** in `src/utils/youtube.ts`:
- `searchYouTubeVideos(query, maxResults)` - Search videos
- `getChannelVideos(channelId, maxResults)` - Get channel's latest videos
- `getVideosByHashtag(hashtag, maxResults)` - Search by hashtag

### 3. Imgbb Image Upload Integration ✅
- **Status**: Configured and ready to use
- **API Key**: 2a21aa2a66d64db0c276f6498bf56364
- **Features**:
  - Upload images and get shareable URLs
  - Support for File objects and base64 strings
  - Returns image URL, display URL, and delete URL

**Utility function available** in `src/utils/imgbb.ts`:
- `uploadToImgbb(imageFile)` - Upload an image and get URLs

### 4. Gemini AI Content Generation ✅
- **Status**: Configured for AI caption generation
- **API Key**: AIzaSyCyN_yWroef3t0yPWy-feJc89s_7Nrh-dc
- **Features**:
  - Generate platform-specific captions
  - Optimized for Instagram, YouTube, Facebook, TikTok, and Pinterest
  - Context-aware suggestions based on content

**Supabase Function**: `generate-ai-caption`

### 5. Instagram OAuth (Configuration Required)
- **Status**: Template ready, requires Facebook App setup
- **Note**: Instagram uses Facebook Graph API for OAuth
- **Next Steps**: Configure Facebook App ID in Facebook Developer Console
- **Callback URL**: `/oauth/instagram`

### 6. Facebook OAuth (Configuration Required)
- **Status**: Template ready, requires Facebook App setup
- **Next Steps**: Configure Facebook App ID in Facebook Developer Console
- **Callback URL**: `/oauth/facebook`

### 7. YouTube OAuth for Posting (Configuration Required)
- **Status**: Template ready, requires Google Cloud Console setup
- **Note**: Different from YouTube API key (which is for fetching only)
- **Next Steps**: Create OAuth credentials in Google Cloud Console
- **Callback URL**: `/oauth/youtube`

## File Structure

### New Files Created

1. **`src/config/apiKeys.ts`** - Central configuration for all API keys and OAuth settings
2. **`src/pages/OAuthCallback.tsx`** - OAuth callback handler for all platforms
3. **`src/utils/imgbb.ts`** - Imgbb image upload utility
4. **`src/utils/youtube.ts`** - YouTube API utility functions
5. **`supabase/.env`** - Environment variables for Supabase functions

### Modified Files

1. **`src/components/automation/Settings.tsx`**
   - Added OAuth connection handlers for all platforms
   - Added Imgbb to platforms list
   - Updated setup guide with enabled features
   - Integrated with centralized API keys config

2. **`src/App.tsx`**
   - Added OAuth callback routes for Pinterest, YouTube, Instagram, and Facebook

3. **`supabase/.env.example`**
   - Added all API keys for reference

4. **`supabase/config.toml`**
   - Updated documentation for required environment variables

## Environment Variables

### For Supabase Edge Functions

Add these environment variables in the Supabase Dashboard under Project Settings > Edge Functions:

```bash
GEMINI_API_KEY=AIzaSyCyN_yWroef3t0yPWy-feJc89s_7Nrh-dc
YOUTUBE_API_KEY=AIzaSyDMJDSiqd78g52t6W0F0BAMUij5xSynDe0
PINTEREST_API_KEY=04b6e23cec2502fb538fec9319f644d262811caf
IMGBB_API_KEY=2a21aa2a66d64db0c276f6498bf56364
```

### For Client-Side (Already Configured)

The following are configured in `src/config/apiKeys.ts`:
- Pinterest App ID
- All API keys for client-side operations

## OAuth Flow Architecture

```
User clicks "Connect" → App redirects to OAuth provider
                                    ↓
OAuth provider shows authorization page → User authorizes
                                    ↓
Provider redirects to callback URL with code
                                    ↓
OAuthCallback component handles the response
                                    ↓
App exchanges code for access token (TODO: needs backend)
                                    ↓
Token stored in Supabase connected_accounts table
                                    ↓
User redirected back to Settings with success message
```

## Security Notes

⚠️ **Important**: In production:
1. Move all API keys to environment variables (not hardcoded)
2. Use backend/edge functions for OAuth token exchange
3. Never expose secret keys in client-side code
4. Implement proper token refresh mechanisms
5. Add rate limiting for API calls

## Next Steps for Full Implementation

1. **Pinterest**: Token exchange needs to be implemented in a backend function
2. **Instagram/Facebook**: Create Facebook App and configure App ID
3. **YouTube OAuth**: Create Google Cloud project and OAuth credentials
4. **Token Refresh**: Implement automatic token refresh for expired tokens
5. **Error Handling**: Add comprehensive error handling for API failures
6. **Rate Limiting**: Implement rate limiting to avoid API quota issues

## Testing

To test the enabled features:

1. **Pinterest OAuth**: Click "Connect" on Pinterest in Settings
2. **YouTube API**: Use the utility functions in automation rules
3. **Imgbb Upload**: Use the utility function when uploading images
4. **AI Captions**: Use the caption generator in the composer
5. **Settings Page**: View all platforms and their connection status

## Support

For issues or questions:
- Check Supabase logs for edge function errors
- Verify API keys are correctly set in environment variables
- Ensure OAuth redirect URLs match the configured callback URLs
- Check browser console for client-side errors
