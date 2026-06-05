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
      amenities: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          icon: string
          id: string
          sort: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          icon?: string
          id?: string
          sort?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          icon?: string
          id?: string
          sort?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      attractions: {
        Row: {
          created_at: string
          description: string | null
          distance: string | null
          enabled: boolean
          id: string
          image_url: string | null
          maps_url: string | null
          name: string
          sort: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          distance?: string | null
          enabled?: boolean
          id?: string
          image_url?: string | null
          maps_url?: string | null
          name: string
          sort?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          distance?: string | null
          enabled?: boolean
          id?: string
          image_url?: string | null
          maps_url?: string | null
          name?: string
          sort?: number
          updated_at?: string
        }
        Relationships: []
      }
      faq_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort?: number
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer_html: string
          category_id: string | null
          created_at: string
          enabled: boolean
          id: string
          question: string
          sort: number
          updated_at: string
        }
        Insert: {
          answer_html?: string
          category_id?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          question: string
          sort?: number
          updated_at?: string
        }
        Update: {
          answer_html?: string
          category_id?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          question?: string
          sort?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_slides: {
        Row: {
          created_at: string
          cta_href: string | null
          cta_label: string | null
          enabled: boolean
          id: string
          image_url: string
          sort: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          enabled?: boolean
          id?: string
          image_url: string
          sort?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          enabled?: boolean
          id?: string
          image_url?: string
          sort?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          content_type: string | null
          created_at: string
          folder: string
          id: string
          name: string
          path: string
          size: number | null
          url: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          folder?: string
          id?: string
          name: string
          path: string
          size?: number | null
          url: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          folder?: string
          id?: string
          name?: string
          path?: string
          size?: number | null
          url?: string
        }
        Relationships: []
      }
      nav_items: {
        Row: {
          created_at: string
          enabled: boolean
          href: string
          id: string
          label: string
          sort: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          href: string
          id?: string
          label: string
          sort?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          href?: string
          id?: string
          label?: string
          sort?: number
          updated_at?: string
        }
        Relationships: []
      }
      ota_links: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          logo_url: string | null
          platform: string
          sort: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          logo_url?: string | null
          platform: string
          sort?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          logo_url?: string | null
          platform?: string
          sort?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          country: string | null
          created_at: string
          enabled: boolean
          featured: boolean
          guest_name: string
          id: string
          rating: number
          sort: number
          text: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          enabled?: boolean
          featured?: boolean
          guest_name: string
          id?: string
          rating?: number
          sort?: number
          text: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          enabled?: boolean
          featured?: boolean
          guest_name?: string
          id?: string
          rating?: number
          sort?: number
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      room_amenities: {
        Row: {
          amenity_id: string
          room_id: string
        }
        Insert: {
          amenity_id: string
          room_id: string
        }
        Update: {
          amenity_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_amenities_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_images: {
        Row: {
          created_at: string
          id: string
          room_id: string
          sort: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          room_id: string
          sort?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          room_id?: string
          sort?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_images_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          name: string
          price: number | null
          slug: string
          sort: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name: string
          price?: number | null
          slug: string
          sort?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          price?: number | null
          slug?: string
          sort?: number
          updated_at?: string
        }
        Relationships: []
      }
      seo_pages: {
        Row: {
          canonical: string | null
          description: string | null
          keywords: string | null
          og_image: string | null
          page_key: string
          title: string | null
          updated_at: string
        }
        Insert: {
          canonical?: string | null
          description?: string | null
          keywords?: string | null
          og_image?: string | null
          page_key: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          canonical?: string | null
          description?: string | null
          keywords?: string | null
          og_image?: string | null
          page_key?: string
          title?: string | null
          updated_at?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
