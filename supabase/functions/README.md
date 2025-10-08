# Supabase Edge Functions

This directory contains Supabase Edge Functions for the cross-post automator.

## Functions

### generate-ai-caption
Generates AI-powered social media captions using Google's Gemini API.

**Environment Variables:**
- `GEMINI_API_KEY` - Your Google Gemini API key

### fetch-youtube-video
Fetches YouTube video information.

## Environment Setup

1. Copy `.env.example` to `.env` in the `supabase` directory
2. Add your API keys to the `.env` file
3. The `.env` file is gitignored to protect your keys

## Getting a Gemini API Key

1. Visit https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

## Local Development

When running Supabase functions locally, ensure the environment variables are loaded from the `.env` file.
