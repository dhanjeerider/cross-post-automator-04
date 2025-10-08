# Quick Start Guide - OAuth Setup

## ⚡ Quick Reference

This is a simplified guide to get OAuth working quickly. For detailed instructions, see `OAUTH_SETUP.md`.

## 🎯 Goal

Fix the "OAuth client was not found" error by configuring real OAuth credentials.

## ✅ What's Already Done

- ✅ OAuth infrastructure implemented
- ✅ Supabase Edge Functions created
- ✅ API keys added:
  - YouTube API: `AIzaSyDMJDSiqd78g52t6W0F0BAMUij5xSynDe0`
  - Pinterest API: `04b6e23cec2502fb538fec9319f644d262811caf`
  - Pinterest App ID: `1533175`
  - ImgBB API: `2a21aa2a66d64db0c276f6498bf56364`

## 🔧 What You Need to Do

### 1. Create OAuth Apps (15 minutes per platform)

#### YouTube
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable YouTube Data API v3
3. Create OAuth 2.0 Client ID
4. Add redirect URI: `http://localhost:5173/oauth/callback`
5. Copy Client ID and Client Secret

#### Pinterest
1. Go to [Pinterest Developers](https://developers.pinterest.com/)
2. Create app (use App ID: 1533175)
3. Add redirect URI: `http://localhost:5173/oauth/callback`
4. Copy App Secret

#### Instagram
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create app → Add Instagram Basic Display
3. Add redirect URI: `http://localhost:5173/oauth/callback`
4. Copy Instagram Client ID and Secret

#### Facebook
1. Same as Instagram - use the same Meta app
2. Add Facebook Login product
3. Copy App ID and App Secret

### 2. Update .env File (2 minutes)

```bash
# Copy the template
cp .env.example .env

# Edit .env and add your credentials:
VITE_YOUTUBE_CLIENT_ID="paste_your_youtube_client_id_here"
VITE_INSTAGRAM_CLIENT_ID="paste_your_instagram_client_id_here"
VITE_FACEBOOK_APP_ID="paste_your_facebook_app_id_here"
```

### 3. Deploy to Supabase (5 minutes)

```bash
# Deploy Edge Functions
supabase functions deploy oauth-youtube
supabase functions deploy oauth-pinterest
supabase functions deploy oauth-instagram
supabase functions deploy oauth-facebook

# Set secrets
supabase secrets set YOUTUBE_CLIENT_SECRET="paste_your_secret"
supabase secrets set PINTEREST_APP_SECRET="paste_your_secret"
supabase secrets set INSTAGRAM_CLIENT_SECRET="paste_your_secret"
supabase secrets set FACEBOOK_APP_SECRET="paste_your_secret"
supabase secrets set FRONTEND_URL="http://localhost:5173"
```

### 4. Test (2 minutes)

```bash
# Start dev server
npm run dev

# 1. Sign up / Sign in
# 2. Go to Settings tab
# 3. Click "Connect" for any platform
# 4. Authorize on the platform
# 5. Should redirect back and show "Connected" ✅
```

## 🎉 Done!

Your OAuth integration is now working! No more "OAuth client not found" errors.

## 🆘 Troubleshooting

### Error: "Redirect URI mismatch"
- Make sure redirect URI in OAuth app matches exactly: `http://localhost:5173/oauth/callback`

### Error: "Invalid client"
- Check that Client ID in `.env` matches the one from developer console
- Make sure there are no extra spaces or quotes

### Error: "Token exchange failed"
- Verify secrets are set in Supabase correctly
- Check Supabase function logs: `supabase functions logs oauth-youtube`

### Still stuck?
See detailed troubleshooting in `OAUTH_SETUP.md`

## 📚 Documentation

- **This File:** Quick start (you are here)
- **OAUTH_SETUP.md:** Detailed setup guide
- **OAUTH_IMPLEMENTATION_SUMMARY.md:** Technical details
- **.env.example:** Environment variable template

## 🔐 Security Reminder

- Never commit `.env` file (it's in .gitignore)
- Never share your Client Secrets
- Use HTTPS in production
- Rotate secrets regularly

## ⏱️ Total Setup Time

- **Per Platform:** ~15-20 minutes
- **All 4 Platforms:** ~1-1.5 hours
- **One-time setup** - then it works forever! 🎉
