-- Create enum for platforms
CREATE TYPE public.platform_type AS ENUM ('youtube', 'instagram', 'facebook', 'tiktok', 'pinterest');

-- Create enum for automation status
CREATE TYPE public.automation_status AS ENUM ('active', 'paused', 'error');

-- Create enum for post status
CREATE TYPE public.post_status AS ENUM ('pending', 'processing', 'posted', 'failed');

-- Create connected_accounts table for OAuth tokens
CREATE TABLE public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  platform_user_id TEXT NOT NULL,
  platform_username TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, platform)
);

-- Create automation_rules table
CREATE TABLE public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_platform platform_type NOT NULL,
  target_platforms platform_type[] NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('single', 'hashtag', 'channel')),
  source_identifier TEXT NOT NULL,
  status automation_status DEFAULT 'active',
  use_ai_captions BOOLEAN DEFAULT FALSE,
  custom_caption_template TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_run_at TIMESTAMPTZ
);

-- Create posted_content table
CREATE TABLE public.posted_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_rule_id UUID REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_platform platform_type NOT NULL,
  source_video_id TEXT NOT NULL,
  source_video_url TEXT NOT NULL,
  source_video_title TEXT,
  target_platform platform_type NOT NULL,
  target_post_id TEXT,
  target_post_url TEXT,
  caption TEXT,
  status post_status DEFAULT 'pending',
  error_message TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posted_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connected_accounts
CREATE POLICY "Users can view their own connected accounts"
  ON public.connected_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connected accounts"
  ON public.connected_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connected accounts"
  ON public.connected_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connected accounts"
  ON public.connected_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for automation_rules
CREATE POLICY "Users can view their own automation rules"
  ON public.automation_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own automation rules"
  ON public.automation_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automation rules"
  ON public.automation_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own automation rules"
  ON public.automation_rules FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for posted_content
CREATE POLICY "Users can view their own posted content"
  ON public.posted_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own posted content"
  ON public.posted_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_connected_accounts_user_id ON public.connected_accounts(user_id);
CREATE INDEX idx_automation_rules_user_id ON public.automation_rules(user_id);
CREATE INDEX idx_automation_rules_status ON public.automation_rules(status);
CREATE INDEX idx_posted_content_user_id ON public.posted_content(user_id);
CREATE INDEX idx_posted_content_status ON public.posted_content(status);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();