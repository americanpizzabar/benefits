export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          code: string
          criteria: Json
          description: string | null
          icon: string | null
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          criteria?: Json
          description?: string | null
          icon?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          criteria?: Json
          description?: string | null
          icon?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      benefit_documents: {
        Row: {
          created_at: string
          error: string | null
          filename: string | null
          id: string
          parsed_at: string | null
          status: Database["public"]["Enums"]["doc_status"]
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          filename?: string | null
          id?: string
          parsed_at?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          filename?: string | null
          id?: string
          parsed_at?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      benefit_translations: {
        Row: {
          action: string | null
          benefit_id: string
          context_tip: string | null
          created_at: string
          details: string | null
          locale: string
          title: string | null
        }
        Insert: {
          action?: string | null
          benefit_id: string
          context_tip?: string | null
          created_at?: string
          details?: string | null
          locale: string
          title?: string | null
        }
        Update: {
          action?: string | null
          benefit_id?: string
          context_tip?: string | null
          created_at?: string
          details?: string | null
          locale?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benefit_translations_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      benefits: {
        Row: {
          action: string | null
          amount: number | null
          area: string | null
          base_locale: string
          created_at: string
          currency: string
          details: string | null
          discount_pct: number | null
          document_id: string | null
          id: string
          lat: number | null
          lng: number | null
          published: boolean
          scene: Database["public"]["Enums"]["scene"]
          title: string
          vendor: string | null
        }
        Insert: {
          action?: string | null
          amount?: number | null
          area?: string | null
          base_locale?: string
          created_at?: string
          currency?: string
          details?: string | null
          discount_pct?: number | null
          document_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          published?: boolean
          scene: Database["public"]["Enums"]["scene"]
          title: string
          vendor?: string | null
        }
        Update: {
          action?: string | null
          amount?: number | null
          area?: string | null
          base_locale?: string
          created_at?: string
          currency?: string
          details?: string | null
          discount_pct?: number | null
          document_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          published?: boolean
          scene?: Database["public"]["Enums"]["scene"]
          title?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benefits_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "benefit_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      buddy_posts: {
        Row: {
          benefit_id: string | null
          body: string | null
          created_at: string
          id: string
          status: string
          title: string
          user_id: string
          when_at: string | null
        }
        Insert: {
          benefit_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          status?: string
          title: string
          user_id: string
          when_at?: string | null
        }
        Update: {
          benefit_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          status?: string
          title?: string
          user_id?: string
          when_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buddy_posts_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          currency: string
          display_name: string | null
          home_area: string | null
          id: string
          is_admin: boolean
          lifestyle: Json
          locale: string
          onboarded: boolean
        }
        Insert: {
          created_at?: string
          currency?: string
          display_name?: string | null
          home_area?: string | null
          id: string
          is_admin?: boolean
          lifestyle?: Json
          locale?: string
          onboarded?: boolean
        }
        Update: {
          created_at?: string
          currency?: string
          display_name?: string | null
          home_area?: string | null
          id?: string
          is_admin?: boolean
          lifestyle?: Json
          locale?: string
          onboarded?: boolean
        }
        Relationships: []
      }
      reviews: {
        Row: {
          benefit_id: string
          body: string
          created_at: string
          id: string
          locale: string
          rating: number
          translations: Json
          user_id: string
        }
        Insert: {
          benefit_id: string
          body: string
          created_at?: string
          id?: string
          locale?: string
          rating: number
          translations?: Json
          user_id: string
        }
        Update: {
          benefit_id?: string
          body?: string
          created_at?: string
          id?: string
          locale?: string
          rating?: number
          translations?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_log: {
        Row: {
          amount_saved: number
          benefit_id: string
          id: string
          used_at: string
          user_id: string
        }
        Insert: {
          amount_saved?: number
          benefit_id: string
          id?: string
          used_at?: string
          user_id: string
        }
        Update: {
          amount_saved?: number
          benefit_id?: string
          id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_log_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_code: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_code: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_code?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_code_fkey"
            columns: ["badge_code"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      doc_status: "uploaded" | "parsing" | "parsed" | "failed"
      scene: "eat" | "move_learn" | "relax_play" | "life_events"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]
export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T]
