# Cross-Post Automator

A social media automation tool with AI-powered content generation using Google Gemini.

## Project info

**URL**: https://lovable.dev/projects/88897642-1025-4e61-9337-fe4a57c3df13

## Features

- 🤖 AI-powered caption generation using Google Gemini
- 📱 Multi-platform support (YouTube, Instagram, Facebook, Pinterest, TikTok)
- 🔄 Automated cross-posting
- 🎨 Platform-specific content optimization

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/88897642-1025-4e61-9337-fe4a57c3df13) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend & Edge Functions)
- Google Gemini AI (Content Generation)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/88897642-1025-4e61-9337-fe4a57c3df13) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Environment Setup

### Gemini AI Configuration

The project uses Google Gemini AI for content generation. To set up:

1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. For Supabase Edge Functions deployment, see [supabase/DEPLOYMENT.md](./supabase/DEPLOYMENT.md)
3. Current API key (already configured): `AIzaSyCyN_yWroef3t0yPWy-feJc89s_7Nrh-dc`

For more details on Supabase functions, see [supabase/functions/README.md](./supabase/functions/README.md)
