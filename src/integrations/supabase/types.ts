export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          id: string
          user_id: string
          service: string
          api_key: string
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service: string
          api_key: string
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service?: string
          api_key?: string
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          created_at: string
          custom_caption_template: string | null
          id: string
          last_run_at: string | null
          name: string
          source_identifier: string
          source_platform: Database["public"]["Enums"]["platform_type"]
          source_type: string
          status: Database["public"]["Enums"]["automation_status"] | null
          target_platforms: Database["public"]["Enums"]["platform_type"][]
          updated_at: string
          use_ai_captions: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_caption_template?: string | null
          id?: string
          last_run_at?: string | null
          name: string
          source_identifier: string
          source_platform: Database["public"]["Enums"]["platform_type"]
          source_type: string
          status?: Database["public"]["Enums"]["automation_status"] | null
          target_platforms: Database["public"]["Enums"]["platform_type"][]
          updated_at?: string
          use_ai_captions?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          custom_caption_template?: string | null
          id?: string
          last_run_at?: string | null
          name?: string
          source_identifier?: string
          source_platform?: Database["public"]["Enums"]["platform_type"]
          source_type?: string
          status?: Database["public"]["Enums"]["automation_status"] | null
          target_platforms?: Database["public"]["Enums"]["platform_type"][]
          updated_at?: string
          use_ai_captions?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      connected_accounts: {
        Row: {
          access_token: string
          connected_at: string
          id: string
          is_active: boolean | null
          last_used_at: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          platform_user_id: string
          platform_username: string | null
          refresh_token: string | null
          token_expires_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          connected_at?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          platform_user_id: string
          platform_username?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          connected_at?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          platform_user_id?: string
          platform_username?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      posted_content: {
        Row: {
          automation_rule_id: string | null
          caption: string | null
          created_at: string
          error_message: string | null
          id: string
          posted_at: string | null
          source_platform: Database["public"]["Enums"]["platform_type"]
          source_video_id: string
          source_video_title: string | null
          source_video_url: string
          status: Database["public"]["Enums"]["post_status"] | null
          target_platform: Database["public"]["Enums"]["platform_type"]
          target_post_id: string | null
          target_post_url: string | null
          user_id: string
        }
        Insert: {
          automation_rule_id?: string | null
          caption?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          posted_at?: string | null
          source_platform: Database["public"]["Enums"]["platform_type"]
          source_video_id: string
          source_video_title?: string | null
          source_video_url: string
          status?: Database["public"]["Enums"]["post_status"] | null
          target_platform: Database["public"]["Enums"]["platform_type"]
          target_post_id?: string | null
          target_post_url?: string | null
          user_id: string
        }
        Update: {
          automation_rule_id?: string | null
          caption?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          posted_at?: string | null
          source_platform?: Database["public"]["Enums"]["platform_type"]
          source_video_id?: string
          source_video_title?: string | null
          source_video_url?: string
          status?: Database["public"]["Enums"]["post_status"] | null
          target_platform?: Database["public"]["Enums"]["platform_type"]
          target_post_id?: string | null
          target_post_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posted_content_automation_rule_id_fkey"
            columns: ["automation_rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      automation_status: "active" | "paused" | "error"
      platform_type:
        | "youtube"
        | "instagram"
        | "facebook"
        | "tiktok"
        | "pinterest"
        | "imgbb"
      post_status: "pending" | "processing" | "posted" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      automation_status: ["active", "paused", "error"],
      platform_type: [
        "youtube",
        "instagram",
        "facebook",
        "tiktok",
        "pinterest",
      ],
      post_status: ["pending", "processing", "posted", "failed"],
    },
  },
} as const
