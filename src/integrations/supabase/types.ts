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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agent_availability: {
        Row: {
          agent_id: string
          id: string
          last_seen: string | null
          status: Database["public"]["Enums"]["availability_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          id?: string
          last_seen?: string | null
          status?: Database["public"]["Enums"]["availability_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          id?: string
          last_seen?: string | null
          status?: Database["public"]["Enums"]["availability_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_availability_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "delivery_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_order_responses: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          order_id: string
          proposed_fee: number | null
          reason: string | null
          response_type: Database["public"]["Enums"]["order_response_type"]
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          order_id: string
          proposed_fee?: number | null
          reason?: string | null
          response_type: Database["public"]["Enums"]["order_response_type"]
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          order_id?: string
          proposed_fee?: number | null
          reason?: string | null
          response_type?: Database["public"]["Enums"]["order_response_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_order_responses_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "delivery_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_order_responses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_agents: {
        Row: {
          agent_code: string
          avatar_url: string | null
          average_rating: number | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_verified: boolean
          phone: string | null
          total_deliveries: number | null
          total_earnings: number | null
          updated_at: string
          user_id: string
          vehicle: Database["public"]["Enums"]["vehicle_type"]
        }
        Insert: {
          agent_code: string
          avatar_url?: string | null
          average_rating?: number | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_verified?: boolean
          phone?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          updated_at?: string
          user_id: string
          vehicle?: Database["public"]["Enums"]["vehicle_type"]
        }
        Update: {
          agent_code?: string
          avatar_url?: string | null
          average_rating?: number | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_verified?: boolean
          phone?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          updated_at?: string
          user_id?: string
          vehicle?: Database["public"]["Enums"]["vehicle_type"]
        }
        Relationships: []
      }
      delivery_orders: {
        Row: {
          agent_id: string | null
          agent_user_id: string | null
          base_fee: number | null
          created_at: string
          customer_name: string
          customer_phone: string | null
          delivery_address: string
          delivery_lat: number | null
          delivery_lng: number | null
          distance_km: number | null
          distance_surcharge: number | null
          fragility_surcharge: number | null
          id: string
          is_fragile: boolean | null
          order_code: string
          package_description: string | null
          package_weight_kg: number | null
          pickup_address: string
          pickup_lat: number | null
          pickup_lng: number | null
          plus_code: string | null
          proof_photo_url: string | null
          special_instructions: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_fee: number | null
          updated_at: string
          urgency_bonus: number | null
          weather_adjustment: number | null
          weight_surcharge: number | null
        }
        Insert: {
          agent_id?: string | null
          agent_user_id?: string | null
          base_fee?: number | null
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          delivery_address: string
          delivery_lat?: number | null
          delivery_lng?: number | null
          distance_km?: number | null
          distance_surcharge?: number | null
          fragility_surcharge?: number | null
          id?: string
          is_fragile?: boolean | null
          order_code: string
          package_description?: string | null
          package_weight_kg?: number | null
          pickup_address: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          plus_code?: string | null
          proof_photo_url?: string | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_fee?: number | null
          updated_at?: string
          urgency_bonus?: number | null
          weather_adjustment?: number | null
          weight_surcharge?: number | null
        }
        Update: {
          agent_id?: string | null
          agent_user_id?: string | null
          base_fee?: number | null
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: string
          delivery_lat?: number | null
          delivery_lng?: number | null
          distance_km?: number | null
          distance_surcharge?: number | null
          fragility_surcharge?: number | null
          id?: string
          is_fragile?: boolean | null
          order_code?: string
          package_description?: string | null
          package_weight_kg?: number | null
          pickup_address?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          plus_code?: string | null
          proof_photo_url?: string | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_fee?: number | null
          updated_at?: string
          urgency_bonus?: number | null
          weather_adjustment?: number | null
          weight_surcharge?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_orders_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "delivery_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_tracking: {
        Row: {
          agent_id: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          order_id: string
          recorded_at: string
          speed: number | null
          user_id: string
        }
        Insert: {
          agent_id: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          order_id: string
          recorded_at?: string
          speed?: number | null
          user_id: string
        }
        Update: {
          agent_id?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          order_id?: string
          recorded_at?: string
          speed?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "delivery_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string | null
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_status_timeline: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_timeline_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "agent" | "user"
      availability_status: "online" | "offline" | "busy"
      order_response_type: "accepted" | "rejected" | "negotiated"
      order_status:
        | "pending_assignment"
        | "accepted"
        | "en_route_pickup"
        | "arrived_pickup"
        | "picked_up"
        | "in_transit"
        | "arrived_delivery"
        | "delivered"
        | "cancelled"
      vehicle_type: "bike" | "car" | "foot"
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
      app_role: ["admin", "moderator", "agent", "user"],
      availability_status: ["online", "offline", "busy"],
      order_response_type: ["accepted", "rejected", "negotiated"],
      order_status: [
        "pending_assignment",
        "accepted",
        "en_route_pickup",
        "arrived_pickup",
        "picked_up",
        "in_transit",
        "arrived_delivery",
        "delivered",
        "cancelled",
      ],
      vehicle_type: ["bike", "car", "foot"],
    },
  },
} as const
