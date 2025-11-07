export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          city: string | null
          country: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          city?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          city?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
      }
      trip_days: {
        Row: {
          id: string
          trip_id: string
          day_number: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          day_number: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          day_number?: number
          date?: string
          created_at?: string
        }
      }
      places: {
        Row: {
          id: string
          trip_id: string
          trip_day_id: string | null
          name: string
          category: string
          latitude: number
          longitude: number
          address: string | null
          planned_time: string | null
          planned_date: string | null
          emoji: string | null
          visited: boolean
          notes: string | null
          review: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          trip_day_id?: string | null
          name: string
          category: string
          latitude: number
          longitude: number
          address?: string | null
          planned_time?: string | null
          planned_date?: string | null
          emoji?: string | null
          visited?: boolean
          notes?: string | null
          review?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          trip_day_id?: string | null
          name?: string
          category?: string
          latitude?: number
          longitude?: number
          address?: string | null
          planned_time?: string | null
          planned_date?: string | null
          emoji?: string | null
          visited?: boolean
          notes?: string | null
          review?: string | null
          created_at?: string
        }
      }
      place_photos: {
        Row: {
          id: string
          place_id: string
          photo_url: string
          caption: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          place_id: string
          photo_url: string
          caption?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          place_id?: string
          photo_url?: string
          caption?: string | null
          uploaded_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          icon: string
          color: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          color: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          color?: string
        }
      }
      reservations: {
        Row: {
          id: string
          trip_id: string
          place_id: string | null
          restaurant_name: string
          reservation_date: string
          reservation_time: string
          party_size: number
          latitude: number | null
          longitude: number | null
          address: string | null
          confirmation_number: string | null
          phone_number: string | null
          email: string | null
          special_requests: string | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          place_id?: string | null
          restaurant_name: string
          reservation_date: string
          reservation_time: string
          party_size: number
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          confirmation_number?: string | null
          phone_number?: string | null
          email?: string | null
          special_requests?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          place_id?: string | null
          restaurant_name?: string
          reservation_date?: string
          reservation_time?: string
          party_size?: number
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          confirmation_number?: string | null
          phone_number?: string | null
          email?: string | null
          special_requests?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          title: string
          content: Json
          entry_date: string
          latitude: number | null
          longitude: number | null
          address: string | null
          place_id: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          title: string
          content?: Json
          entry_date: string
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          place_id?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          title?: string
          content?: Json
          entry_date?: string
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          place_id?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      journal_media: {
        Row: {
          id: string
          journal_entry_id: string
          media_url: string
          media_type: string
          caption: string | null
          latitude: number | null
          longitude: number | null
          order_index: number
          uploaded_at: string
        }
        Insert: {
          id?: string
          journal_entry_id: string
          media_url: string
          media_type: string
          caption?: string | null
          latitude?: number | null
          longitude?: number | null
          order_index?: number
          uploaded_at?: string
        }
        Update: {
          id?: string
          journal_entry_id?: string
          media_url?: string
          media_type?: string
          caption?: string | null
          latitude?: number | null
          longitude?: number | null
          order_index?: number
          uploaded_at?: string
        }
      }
      trip_shares: {
        Row: {
          id: string
          trip_id: string
          invited_by: string
          invited_email: string
          permission_level: string
          status: string
          invited_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          trip_id: string
          invited_by: string
          invited_email: string
          permission_level?: string
          status?: string
          invited_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          trip_id?: string
          invited_by?: string
          invited_email?: string
          permission_level?: string
          status?: string
          invited_at?: string
          accepted_at?: string | null
        }
      }
      trip_collaborators: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          permission_level: string
          joined_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          permission_level?: string
          joined_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          permission_level?: string
          joined_at?: string
        }
      }
      books: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          title: string
          description: string | null
          cover_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          title: string
          description?: string | null
          cover_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          title?: string
          description?: string | null
          cover_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          book_id: string
          title: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          book_id: string
          title: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          title?: string
          order_index?: number
          created_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          section_id: string
          order_index: number
          background_color: string
          created_at: string
        }
        Insert: {
          id?: string
          section_id: string
          order_index?: number
          background_color?: string
          created_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          order_index?: number
          background_color?: string
          created_at?: string
        }
      }
      page_elements: {
        Row: {
          id: string
          page_id: string
          element_type: string
          content: string
          position_x: number
          position_y: number
          width: number
          height: number
          rotation: number
          z_index: number
          style_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          page_id: string
          element_type: string
          content: string
          position_x?: number
          position_y?: number
          width?: number
          height?: number
          rotation?: number
          z_index?: number
          style_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          element_type?: string
          content?: string
          position_x?: number
          position_y?: number
          width?: number
          height?: number
          rotation?: number
          z_index?: number
          style_data?: Json
          created_at?: string
        }
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
  }
}
