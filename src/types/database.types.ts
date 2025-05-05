/**
 * Det här är en automatiskt genererad fil med Supabase-typ-definitioner.
 * Du kan generera den från ditt Supabase-projekt med CLI-kommandot:
 * `npx supabase gen types typescript --project-id [DIN-PROJEKT-ID]`
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          domain: string | null;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          domain?: string | null;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          domain?: string | null;
          slug?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
          organization_id: string | null;
          role: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          created_at?: string;
          organization_id?: string | null;
          role?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          created_at?: string;
          organization_id?: string | null;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_organization_id_fkey';
            columns: ['organization_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
