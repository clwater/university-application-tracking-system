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
      students: {
        Row: {
          id: string
          name: string
          email: string
          graduation_year: number | null
          gpa: number | null
          sat_score: number | null
          act_score: number | null
          target_countries: string[] | null
          intended_majors: string[] | null
          user_id: string
          parent_ids: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          graduation_year?: number | null
          gpa?: number | null
          sat_score?: number | null
          act_score?: number | null
          target_countries?: string[] | null
          intended_majors?: string[] | null
          user_id: string
          parent_ids?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          graduation_year?: number | null
          gpa?: number | null
          sat_score?: number | null
          act_score?: number | null
          target_countries?: string[] | null
          intended_majors?: string[] | null
          user_id?: string
          parent_ids?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      universities: {
        Row: {
          id: string
          name: string
          country: string | null
          state: string | null
          city: string | null
          us_news_ranking: number | null
          acceptance_rate: number | null
          application_system: string | null
          tuition_in_state: number | null
          tuition_out_state: number | null
          application_fee: number | null
          deadlines: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          country?: string | null
          state?: string | null
          city?: string | null
          us_news_ranking?: number | null
          acceptance_rate?: number | null
          application_system?: string | null
          tuition_in_state?: number | null
          tuition_out_state?: number | null
          application_fee?: number | null
          deadlines?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string | null
          state?: string | null
          city?: string | null
          us_news_ranking?: number | null
          acceptance_rate?: number | null
          application_system?: string | null
          tuition_in_state?: number | null
          tuition_out_state?: number | null
          application_fee?: number | null
          deadlines?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          id: string
          student_id: string
          university_id: string
          application_type: string | null
          deadline: string | null
          status: string
          submitted_date: string | null
          decision_date: string | null
          decision_type: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          university_id: string
          application_type?: string | null
          deadline?: string | null
          status?: string
          submitted_date?: string | null
          decision_date?: string | null
          decision_type?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          university_id?: string
          application_type?: string | null
          deadline?: string | null
          status?: string
          submitted_date?: string | null
          decision_date?: string | null
          decision_type?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          }
        ]
      }
      application_requirements: {
        Row: {
          id: string
          application_id: string
          requirement_type: string
          status: string
          deadline: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          requirement_type: string
          status?: string
          deadline?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          requirement_type?: string
          status?: string
          deadline?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_requirements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          }
        ]
      }
      parents: {
        Row: {
          id: string
          name: string
          email: string
          user_id: string
          student_ids: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          user_id: string
          student_ids?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          user_id?: string
          student_ids?: string[] | null
          created_at?: string
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
      application_status: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted'
      application_type: 'early_decision' | 'early_action' | 'regular_decision' | 'rolling_admission'
      decision_type: 'accepted' | 'rejected' | 'waitlisted'
      requirement_status: 'not_started' | 'in_progress' | 'completed'
      user_role: 'student' | 'parent' | 'teacher' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// 方便使用的类型别名
export type Student = Database['public']['Tables']['students']['Row']
export type University = Database['public']['Tables']['universities']['Row']
export type Application = Database['public']['Tables']['applications']['Row']
export type ApplicationRequirement = Database['public']['Tables']['application_requirements']['Row']
export type Parent = Database['public']['Tables']['parents']['Row']

export type ApplicationStatus = Database['public']['Enums']['application_status']
export type ApplicationType = Database['public']['Enums']['application_type']
export type DecisionType = Database['public']['Enums']['decision_type']
export type RequirementStatus = Database['public']['Enums']['requirement_status']
export type UserRole = Database['public']['Enums']['user_role']