# Supabase Deployment Guide

## Setting Environment Variables for Edge Functions

The `generate-ai-caption` function requires the `GEMINI_API_KEY` environment variable to be set.

### Via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions**
3. Click on **Manage secrets**
4. Add a new secret:
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key (e.g., `AIzaSyCyN_yWroef3t0yPWy-feJc89s_7Nrh-dc`)
5. Click **Save**

### Via Supabase CLI

```bash
# Set the environment variable
supabase secrets set GEMINI_API_KEY=AIzaSyCyN_yWroef3t0yPWy-feJc89s_7Nrh-dc

# List all secrets
supabase secrets list

# Deploy functions
supabase functions deploy
```

### Local Development

For local development, create a `.env` file in the `supabase` directory:

```bash
cd supabase
cp .env.example .env
# Edit .env and add your API key
```

## Deploying Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy generate-ai-caption
```

## Testing the Function

After deployment, you can test the function using curl or the Supabase client:

```javascript
const { data, error } = await supabase.functions.invoke('generate-ai-caption', {
  body: { 
    title: 'My awesome post',
    description: 'About my latest adventure',
    platform: 'instagram'
  }
});
```

## API Key Information

- **Gemini API Key**: Used for AI-powered caption generation
- Get your key from: https://makersuite.google.com/app/apikey
- Current key (already configured): `AIzaSyCyN_yWroef3t0yPWy-feJc89s_7Nrh-dc`
