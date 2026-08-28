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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      apps: {
        Row: {
          accent: string | null
          created_at: string
          icon_url: string | null
          id: string
          is_folder: boolean
          name: string
          parent_id: string | null
          position: number
          url: string
          user_id: string
        }
        Insert: {
          accent?: string | null
          created_at?: string
          icon_url?: string | null
          id?: string
          is_folder?: boolean
          name: string
          parent_id?: string | null
          position?: number
          url?: string
          user_id: string
        }
        Update: {
          accent?: string | null
          created_at?: string
          icon_url?: string | null
          id?: string
          is_folder?: boolean
          name?: string
          parent_id?: string | null
          position?: number
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "apps_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          all_day: boolean
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          pillar: Database["public"]["Enums"]["pillar"] | null
          starts_at: string
          title: string
          user_id: string
        }
        Insert: {
          all_day?: boolean
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          pillar?: Database["public"]["Enums"]["pillar"] | null
          starts_at: string
          title: string
          user_id: string
        }
        Update: {
          all_day?: boolean
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          pillar?: Database["public"]["Enums"]["pillar"] | null
          starts_at?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          pillar: Database["public"]["Enums"]["pillar"] | null
          pinned: boolean
          source_thread_id: string | null
          tags: string[]
          title: string
          type: Database["public"]["Enums"]["memory_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          pillar?: Database["public"]["Enums"]["pillar"] | null
          pinned?: boolean
          source_thread_id?: string | null
          tags?: string[]
          title: string
          type?: Database["public"]["Enums"]["memory_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          pillar?: Database["public"]["Enums"]["pillar"] | null
          pinned?: boolean
          source_thread_id?: string | null
          tags?: string[]
          title?: string
          type?: Database["public"]["Enums"]["memory_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_entries_source_thread_id_fkey"
            columns: ["source_thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          parts: Json
          role: string
          text_content: string
          thread_id: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          parts?: Json
          role: string
          text_content?: string
          thread_id: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          parts?: Json
          role?: string
          text_content?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          body: string
          created_at: string
          height: number
          id: string
          is_minimized: boolean
          is_open: boolean
          pillar: Database["public"]["Enums"]["pillar"] | null
          pinned: boolean
          pos_x: number
          pos_y: number
          title: string
          updated_at: string
          user_id: string
          width: number
          z_index: number
        }
        Insert: {
          body?: string
          created_at?: string
          height?: number
          id?: string
          is_minimized?: boolean
          is_open?: boolean
          pillar?: Database["public"]["Enums"]["pillar"] | null
          pinned?: boolean
          pos_x?: number
          pos_y?: number
          title?: string
          updated_at?: string
          user_id: string
          width?: number
          z_index?: number
        }
        Update: {
          body?: string
          created_at?: string
          height?: number
          id?: string
          is_minimized?: boolean
          is_open?: boolean
          pillar?: Database["public"]["Enums"]["pillar"] | null
          pinned?: boolean
          pos_x?: number
          pos_y?: number
          title?: string
          updated_at?: string
          user_id?: string
          width?: number
          z_index?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      pillar_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["entry_kind"]
          pillar: Database["public"]["Enums"]["pillar"]
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["entry_kind"]
          pillar: Database["public"]["Enums"]["pillar"]
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["entry_kind"]
          pillar?: Database["public"]["Enums"]["pillar"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pillar_snapshots: {
        Row: {
          created_at: string
          id: string
          period: string
          pillar: Database["public"]["Enums"]["pillar"]
          summary: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period: string
          pillar: Database["public"]["Enums"]["pillar"]
          summary: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period?: string
          pillar?: Database["public"]["Enums"]["pillar"]
          summary?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      recents: {
        Row: {
          icon_url: string | null
          id: string
          title: string
          url: string
          user_id: string
          visited_at: string
        }
        Insert: {
          icon_url?: string | null
          id?: string
          title: string
          url: string
          user_id: string
          visited_at?: string
        }
        Update: {
          icon_url?: string | null
          id?: string
          title?: string
          url?: string
          user_id?: string
          visited_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          auto_extract: boolean
          created_at: string
          memory_enabled: boolean
          memory_scopes: Json
          model: string
          persona: string
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_extract?: boolean
          created_at?: string
          memory_enabled?: boolean
          memory_scopes?: Json
          model?: string
          persona?: string
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_extract?: boolean
          created_at?: string
          memory_enabled?: boolean
          memory_scopes?: Json
          model?: string
          persona?: string
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      threads: {
        Row: {
          created_at: string
          id: string
          pillar: Database["public"]["Enums"]["pillar"] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pillar?: Database["public"]["Enums"]["pillar"] | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pillar?: Database["public"]["Enums"]["pillar"] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      entry_kind:
        | "done"
        | "in_progress"
        | "changed"
        | "unchanged"
        | "blocked"
        | "next"
      memory_type:
        | "fact"
        | "decision"
        | "blocker"
        | "next_step"
        | "preference"
        | "note"
      pillar: "systems" | "career" | "projects" | "academics"
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
      entry_kind: [
        "done",
        "in_progress",
        "changed",
        "unchanged",
        "blocked",
        "next",
      ],
      memory_type: [
        "fact",
        "decision",
        "blocker",
        "next_step",
        "preference",
        "note",
      ],
      pillar: ["systems", "career", "projects", "academics"],
    },
  },
} as const
