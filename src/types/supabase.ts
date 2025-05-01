export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string | null
          avatar_url: string | null
          organizationId: string | null
          role: 'USER' | 'ADMIN' | 'SUPERADMIN'
          metadata: Json | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          organizationId?: string | null
          role?: 'USER' | 'ADMIN' | 'SUPERADMIN'
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          organizationId?: string | null
          role?: 'USER' | 'ADMIN' | 'SUPERADMIN'
          metadata?: Json | null
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