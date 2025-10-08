/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_SUPABASE_PROJECT_ID: string
  readonly VITE_YOUTUBE_API_KEY: string
  readonly VITE_YOUTUBE_CLIENT_ID: string
  readonly VITE_PINTEREST_API_KEY: string
  readonly VITE_PINTEREST_APP_ID: string
  readonly VITE_IMGBB_API_KEY: string
  readonly VITE_INSTAGRAM_CLIENT_ID: string
  readonly VITE_FACEBOOK_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
