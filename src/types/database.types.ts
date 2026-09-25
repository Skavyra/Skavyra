// Generated from supabase/skavyra_backend_full.sql by hand-run script.
// Mirrors the output of `supabase gen types typescript`. Regenerate if the schema changes.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          college_name: string | null
          degree: string | null
          branch: string | null
          started_year: number | null
          passing_out_year: number | null
          address: string | null
          city: string | null
          state: string | null
          profile_completed: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          college_name?: string | null
          degree?: string | null
          branch?: string | null
          started_year?: number | null
          passing_out_year?: number | null
          address?: string | null
          city?: string | null
          state?: string | null
          profile_completed?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          college_name?: string | null
          degree?: string | null
          branch?: string | null
          started_year?: number | null
          passing_out_year?: number | null
          address?: string | null
          city?: string | null
          state?: string | null
          profile_completed?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
          granted_by: string | null
          granted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
          granted_by?: string | null
          granted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          granted_by?: string | null
          granted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          id: string
          employee_code: string | null
          designation: string | null
          department: string | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          date_of_joining: string | null
          reporting_manager_id: string | null
          is_active: boolean
          deactivated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          employee_code?: string | null
          designation?: string | null
          department?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          date_of_joining?: string | null
          reporting_manager_id?: string | null
          is_active?: boolean
          deactivated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_code?: string | null
          designation?: string | null
          department?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          date_of_joining?: string | null
          reporting_manager_id?: string | null
          is_active?: boolean
          deactivated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_reporting_manager_id_fkey"
            columns: ["reporting_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          entity_type: string
          entity_id: string | null
          action: string
          before: Json | null
          after: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          entity_type: string
          entity_id?: string | null
          action: string
          before?: Json | null
          after?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          entity_type?: string
          entity_id?: string | null
          action?: string
          before?: Json | null
          after?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          value: Json
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value?: Json
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_log: {
        Row: {
          id: string
          to_email: string
          template: string
          subject: string | null
          payload: Json
          status: Database["public"]["Enums"]["email_status"]
          provider_id: string | null
          error: string | null
          created_at: string
          sent_at: string | null
        }
        Insert: {
          id?: string
          to_email: string
          template: string
          subject?: string | null
          payload?: Json
          status?: Database["public"]["Enums"]["email_status"]
          provider_id?: string | null
          error?: string | null
          created_at?: string
          sent_at?: string | null
        }
        Update: {
          id?: string
          to_email?: string
          template?: string
          subject?: string | null
          payload?: Json
          status?: Database["public"]["Enums"]["email_status"]
          provider_id?: string | null
          error?: string | null
          created_at?: string
          sent_at?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          id: string
          slug: string
          title: string
          subtitle: string | null
          description: string | null
          category: Database["public"]["Enums"]["course_category"]
          level: Database["public"]["Enums"]["course_level"]
          cover_image_url: string | null
          price: number
          mrp: number | null
          currency: string
          duration_weeks: number | null
          language: string | null
          mentor_name: string | null
          mentor_company: string | null
          mentor_avatar_url: string | null
          allows_partial: boolean
          min_first_payment: number | null
          status: Database["public"]["Enums"]["course_status"]
          sort_order: number
          published_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          subtitle?: string | null
          description?: string | null
          category?: Database["public"]["Enums"]["course_category"]
          level?: Database["public"]["Enums"]["course_level"]
          cover_image_url?: string | null
          price: number
          mrp?: number | null
          currency?: string
          duration_weeks?: number | null
          language?: string | null
          mentor_name?: string | null
          mentor_company?: string | null
          mentor_avatar_url?: string | null
          allows_partial?: boolean
          min_first_payment?: number | null
          status?: Database["public"]["Enums"]["course_status"]
          sort_order?: number
          published_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          subtitle?: string | null
          description?: string | null
          category?: Database["public"]["Enums"]["course_category"]
          level?: Database["public"]["Enums"]["course_level"]
          cover_image_url?: string | null
          price?: number
          mrp?: number | null
          currency?: string
          duration_weeks?: number | null
          language?: string | null
          mentor_name?: string | null
          mentor_company?: string | null
          mentor_avatar_url?: string | null
          allows_partial?: boolean
          min_first_payment?: number | null
          status?: Database["public"]["Enums"]["course_status"]
          sort_order?: number
          published_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          id: string
          course_id: string
          title: string
          summary: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          summary?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          summary?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string | null
          lesson_type: Database["public"]["Enums"]["lesson_type"]
          provider: Database["public"]["Enums"]["media_provider"]
          content_url: string | null
          storage_path: string | null
          duration_minutes: number
          scheduled_at: string | null
          is_preview: boolean
          is_published: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description?: string | null
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          provider?: Database["public"]["Enums"]["media_provider"]
          content_url?: string | null
          storage_path?: string | null
          duration_minutes?: number
          scheduled_at?: string | null
          is_preview?: boolean
          is_published?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          description?: string | null
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          provider?: Database["public"]["Enums"]["media_provider"]
          content_url?: string | null
          storage_path?: string | null
          duration_minutes?: number
          scheduled_at?: string | null
          is_preview?: boolean
          is_published?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_resources: {
        Row: {
          id: string
          lesson_id: string
          title: string
          storage_path: string
          file_size: number | null
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          storage_path: string
          file_size?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
          storage_path?: string
          file_size?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          lead_id: string | null
          enrolled_by: string | null
          source: string
          plan: Database["public"]["Enums"]["payment_plan"]
          total_amount: number
          amount_paid: number
          balance_amount: number | null
          payment_status: Database["public"]["Enums"]["enrollment_payment_status"]
          access_status: Database["public"]["Enums"]["access_status"]
          starts_at: string
          expires_at: string | null
          completed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          lead_id?: string | null
          enrolled_by?: string | null
          source?: string
          plan?: Database["public"]["Enums"]["payment_plan"]
          total_amount: number
          amount_paid?: number
          payment_status?: Database["public"]["Enums"]["enrollment_payment_status"]
          access_status?: Database["public"]["Enums"]["access_status"]
          starts_at?: string
          expires_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          lead_id?: string | null
          enrolled_by?: string | null
          source?: string
          plan?: Database["public"]["Enums"]["payment_plan"]
          total_amount?: number
          amount_paid?: number
          payment_status?: Database["public"]["Enums"]["enrollment_payment_status"]
          access_status?: Database["public"]["Enums"]["access_status"]
          starts_at?: string
          expires_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_enrolled_by_fkey"
            columns: ["enrolled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "student_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      installments: {
        Row: {
          id: string
          enrollment_id: string
          seq: number
          label: string | null
          amount: number
          due_date: string | null
          status: Database["public"]["Enums"]["installment_status"]
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          enrollment_id: string
          seq: number
          label?: string | null
          amount: number
          due_date?: string | null
          status?: Database["public"]["Enums"]["installment_status"]
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          enrollment_id?: string
          seq?: number
          label?: string | null
          amount?: number
          due_date?: string | null
          status?: Database["public"]["Enums"]["installment_status"]
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "installments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          id: string
          enrollment_id: string | null
          installment_id: string | null
          user_id: string | null
          lead_id: string | null
          amount: number
          currency: string
          purpose: Database["public"]["Enums"]["payment_purpose"]
          provider: Database["public"]["Enums"]["payment_provider"]
          status: Database["public"]["Enums"]["payment_status"]
          method: string | null
          provider_order_id: string | null
          provider_payment_id: string | null
          provider_signature: string | null
          transaction_ref: string | null
          proof_path: string | null
          raw_payload: Json
          paid_at: string | null
          verified_by: string | null
          verified_at: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          enrollment_id?: string | null
          installment_id?: string | null
          user_id?: string | null
          lead_id?: string | null
          amount: number
          currency?: string
          purpose?: Database["public"]["Enums"]["payment_purpose"]
          provider?: Database["public"]["Enums"]["payment_provider"]
          status?: Database["public"]["Enums"]["payment_status"]
          method?: string | null
          provider_order_id?: string | null
          provider_payment_id?: string | null
          provider_signature?: string | null
          transaction_ref?: string | null
          proof_path?: string | null
          raw_payload?: Json
          paid_at?: string | null
          verified_by?: string | null
          verified_at?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          enrollment_id?: string | null
          installment_id?: string | null
          user_id?: string | null
          lead_id?: string | null
          amount?: number
          currency?: string
          purpose?: Database["public"]["Enums"]["payment_purpose"]
          provider?: Database["public"]["Enums"]["payment_provider"]
          status?: Database["public"]["Enums"]["payment_status"]
          method?: string | null
          provider_order_id?: string | null
          provider_payment_id?: string | null
          provider_signature?: string | null
          transaction_ref?: string | null
          proof_path?: string | null
          raw_payload?: Json
          paid_at?: string | null
          verified_by?: string | null
          verified_at?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_installment_id_fkey"
            columns: ["installment_id"]
            isOneToOne: false
            referencedRelation: "installments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "student_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          enrollment_id: string | null
          watched_seconds: number
          completed: boolean
          completed_at: string | null
          last_watched_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          enrollment_id?: string | null
          watched_seconds?: number
          completed?: boolean
          completed_at?: string | null
          last_watched_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          enrollment_id?: string | null
          watched_seconds?: number
          completed?: boolean
          completed_at?: string | null
          last_watched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          id: string
          enrollment_id: string
          certificate_no: string
          verify_token: string
          pdf_path: string | null
          issued_by: string | null
          issued_at: string
          revoked_at: string | null
        }
        Insert: {
          id?: string
          enrollment_id: string
          certificate_no: string
          verify_token?: string
          pdf_path?: string | null
          issued_by?: string | null
          issued_at?: string
          revoked_at?: string | null
        }
        Update: {
          id?: string
          enrollment_id?: string
          certificate_no?: string
          verify_token?: string
          pdf_path?: string | null
          issued_by?: string | null
          issued_at?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: true
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_upload_batches: {
        Row: {
          id: string
          uploaded_by: string
          file_name: string
          file_type: Database["public"]["Enums"]["upload_file_type"]
          detected_columns: string[]
          column_mapping: Json
          total_rows: number
          inserted_rows: number
          duplicate_rows: number
          skipped_rows: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          uploaded_by: string
          file_name: string
          file_type?: Database["public"]["Enums"]["upload_file_type"]
          detected_columns?: string[]
          column_mapping?: Json
          total_rows?: number
          inserted_rows?: number
          duplicate_rows?: number
          skipped_rows?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          uploaded_by?: string
          file_name?: string
          file_type?: Database["public"]["Enums"]["upload_file_type"]
          detected_columns?: string[]
          column_mapping?: Json
          total_rows?: number
          inserted_rows?: number
          duplicate_rows?: number
          skipped_rows?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_upload_batches_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_leads: {
        Row: {
          id: string
          batch_id: string | null
          source: Database["public"]["Enums"]["lead_source"]
          created_by: string
          assigned_employee_id: string | null
          assigned_by: string | null
          assigned_at: string | null
          full_name: string
          phone: string
          alt_phone: string | null
          email: string | null
          address: string | null
          city: string | null
          state: string | null
          college_name: string | null
          degree: string | null
          branch: string | null
          current_year: number | null
          started_year: number | null
          ending_year: number | null
          interested_course_text: string | null
          status: Database["public"]["Enums"]["lead_status"]
          follow_up_on: string | null
          last_contacted_at: string | null
          attempts_count: number
          remarks: string | null
          converted_enrollment_id: string | null
          completed_at: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          batch_id?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          created_by: string
          assigned_employee_id?: string | null
          assigned_by?: string | null
          assigned_at?: string | null
          full_name: string
          phone: string
          alt_phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          college_name?: string | null
          degree?: string | null
          branch?: string | null
          current_year?: number | null
          started_year?: number | null
          ending_year?: number | null
          interested_course_text?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          follow_up_on?: string | null
          last_contacted_at?: string | null
          attempts_count?: number
          remarks?: string | null
          converted_enrollment_id?: string | null
          completed_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          batch_id?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          created_by?: string
          assigned_employee_id?: string | null
          assigned_by?: string | null
          assigned_at?: string | null
          full_name?: string
          phone?: string
          alt_phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          college_name?: string | null
          degree?: string | null
          branch?: string | null
          current_year?: number | null
          started_year?: number | null
          ending_year?: number | null
          interested_course_text?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          follow_up_on?: string | null
          last_contacted_at?: string | null
          attempts_count?: number
          remarks?: string | null
          converted_enrollment_id?: string | null
          completed_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_leads_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "lead_upload_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_leads_assigned_employee_id_fkey"
            columns: ["assigned_employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_leads_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_leads_converted_enrollment_id_fkey"
            columns: ["converted_enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_courses: {
        Row: {
          lead_id: string
          course_id: string
          note: string | null
          created_at: string
        }
        Insert: {
          lead_id: string
          course_id: string
          note?: string | null
          created_at?: string
        }
        Update: {
          lead_id?: string
          course_id?: string
          note?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_courses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "student_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          id: string
          lead_id: string
          actor_id: string | null
          action: string
          old_status: Database["public"]["Enums"]["lead_status"] | null
          new_status: Database["public"]["Enums"]["lead_status"] | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          actor_id?: string | null
          action: string
          old_status?: Database["public"]["Enums"]["lead_status"] | null
          new_status?: Database["public"]["Enums"]["lead_status"] | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          actor_id?: string | null
          action?: string
          old_status?: Database["public"]["Enums"]["lead_status"] | null
          new_status?: Database["public"]["Enums"]["lead_status"] | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "student_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_letter_templates: {
        Row: {
          id: string
          name: string
          version: number
          body: Json
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          version?: number
          body?: Json
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          version?: number
          body?: Json
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_letter_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_letter_batches: {
        Row: {
          id: string
          source_type: string
          file_name: string | null
          detected_columns: string[]
          column_mapping: Json
          total_rows: number
          inserted_rows: number
          skipped_rows: number
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          source_type?: string
          file_name?: string | null
          detected_columns?: string[]
          column_mapping?: Json
          total_rows?: number
          inserted_rows?: number
          skipped_rows?: number
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          source_type?: string
          file_name?: string | null
          detected_columns?: string[]
          column_mapping?: Json
          total_rows?: number
          inserted_rows?: number
          skipped_rows?: number
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_letter_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_letters: {
        Row: {
          id: string
          batch_id: string | null
          template_id: string | null
          source_row_number: number | null
          letter_no: string
          candidate_name: string
          email: string
          phone: string | null
          role_title: string
          department: string | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          ctc_amount: number
          ctc_currency: string
          ctc_period: Database["public"]["Enums"]["pay_period"]
          joining_date: string
          issue_date: string
          work_location: string | null
          reporting_manager_id: string | null
          reporting_manager_name: string | null
          status: Database["public"]["Enums"]["letter_status"]
          pdf_path: string | null
          raw_row: Json
          generated_at: string | null
          generated_by: string | null
          sent_at: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          batch_id?: string | null
          template_id?: string | null
          source_row_number?: number | null
          letter_no: string
          candidate_name: string
          email: string
          phone?: string | null
          role_title: string
          department?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          ctc_amount: number
          ctc_currency?: string
          ctc_period?: Database["public"]["Enums"]["pay_period"]
          joining_date: string
          issue_date?: string
          work_location?: string | null
          reporting_manager_id?: string | null
          reporting_manager_name?: string | null
          status?: Database["public"]["Enums"]["letter_status"]
          pdf_path?: string | null
          raw_row?: Json
          generated_at?: string | null
          generated_by?: string | null
          sent_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          batch_id?: string | null
          template_id?: string | null
          source_row_number?: number | null
          letter_no?: string
          candidate_name?: string
          email?: string
          phone?: string | null
          role_title?: string
          department?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          ctc_amount?: number
          ctc_currency?: string
          ctc_period?: Database["public"]["Enums"]["pay_period"]
          joining_date?: string
          issue_date?: string
          work_location?: string | null
          reporting_manager_id?: string | null
          reporting_manager_name?: string | null
          status?: Database["public"]["Enums"]["letter_status"]
          pdf_path?: string | null
          raw_row?: Json
          generated_at?: string | null
          generated_by?: string | null
          sent_at?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_letters_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "offer_letter_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_letters_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "offer_letter_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_letters_reporting_manager_id_fkey"
            columns: ["reporting_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_letters_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_letters_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      course_outline: {
        Row: {
          course_id: string | null
          slug: string | null
          module_id: string | null
          module_title: string | null
          module_order: number | null
          lesson_id: string | null
          lesson_title: string | null
          lesson_type: Database["public"]["Enums"]["lesson_type"] | null
          duration_minutes: number | null
          is_preview: boolean | null
          lesson_order: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: { Args: { p_user_id: string; p_role: Database["public"]["Enums"]["app_role"] }; Returns: boolean }
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_employee: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_staff: { Args: Record<PropertyKey, never>; Returns: boolean }
      has_course_access: { Args: { p_course_id: string }; Returns: boolean }
      lesson_course_id: { Args: { p_lesson_id: string }; Returns: string }
      create_enrollment: { Args: { p_user_id: string; p_course_id: string; p_plan?: Database["public"]["Enums"]["payment_plan"]; p_total_amount?: number; p_installments?: Json; p_lead_id?: string; p_source?: string }; Returns: Database["public"]["Tables"]["enrollments"]["Row"] }
      issue_certificate: { Args: { p_enrollment_id: string; p_pdf_path?: string }; Returns: Database["public"]["Tables"]["certificates"]["Row"] }
      import_leads: { Args: { p_file_name: string; p_file_type: Database["public"]["Enums"]["upload_file_type"]; p_column_mapping: Json; p_detected_columns: string[]; p_rows: Json }; Returns: Json }
      assign_leads: { Args: { p_lead_ids: string[]; p_employee_ids: string[] }; Returns: number }
      import_offer_letters: { Args: { p_file_name: string; p_source_type: string; p_column_mapping: Json; p_detected_columns: string[]; p_rows: Json; p_template_id?: string }; Returns: Json }
      apply_payment: { Args: { p_payment_id: string; p_provider_payment_id?: string; p_method?: string }; Returns: Database["public"]["Tables"]["payments"]["Row"] }
      recalc_enrollment: { Args: { p_enrollment_id: string }; Returns: undefined }
      provision_user: { Args: { p_user_id: string; p_role: Database["public"]["Enums"]["app_role"]; p_actor_id: string; p_first_name?: string; p_last_name?: string; p_email?: string; p_phone?: string; p_employee_code?: string; p_designation?: string; p_department?: string; p_date_of_joining?: string; p_reporting_manager_id?: string }; Returns: Json }
      deactivate_staff: { Args: { p_user_id: string; p_actor_id: string; p_reassign_to?: string }; Returns: Json }
      normalize_phone: { Args: { p_phone: string }; Returns: string }
      next_letter_no: { Args: Record<PropertyKey, never>; Returns: string }
      verify_certificate: {
        Args: { p_token: string }
        Returns: {
          certificate_no: string
          issued_at: string
          revoked_at: string | null
          first_name: string | null
          last_name: string | null
          course_title: string
          duration_weeks: number | null
        }[]
      }
      submit_contact_lead: {
        Args: { p_full_name: string; p_phone: string; p_email?: string | null; p_interested_course_text?: string | null; p_remarks?: string | null }
        Returns: undefined
      }
      find_lead_owner: {
        Args: { p_phone: string }
        Returns: { full_name: string; assignee_first_name: string | null; assignee_last_name: string | null }[]
      }
    }
    Enums: {
      app_role: "admin" | "employee" | "student"
      course_status: "draft" | "published" | "archived"
      course_category: "it" | "non_it" | "both"
      course_level: "beginner" | "intermediate" | "advanced"
      lesson_type: "video" | "document" | "live_class" | "link"
      media_provider: "drive" | "supabase" | "bunny" | "youtube" | "zoom" | "other"
      payment_plan: "full" | "partial"
      access_status: "active" | "suspended" | "completed" | "refunded"
      enrollment_payment_status: "pending" | "partial" | "paid" | "refunded"
      installment_status: "pending" | "paid" | "waived" | "overdue"
      payment_provider: "simulated" | "razorpay" | "manual_upi" | "cash"
      payment_status: "created" | "pending" | "success" | "failed" | "refunded"
      payment_purpose: "registration" | "installment" | "full" | "balance"
      lead_status: "new" | "interested" | "follow_up" | "callback_requested" | "called_no_response" | "not_interested" | "invalid_contact" | "enrolled"
      lead_source: "bulk_upload" | "manual" | "website_form" | "referral"
      upload_file_type: "csv" | "xlsx"
      employment_type: "intern" | "full_time" | "contract"
      pay_period: "month" | "year" | "total"
      letter_status: "draft" | "generated" | "sent" | "accepted" | "declined" | "revoked"
      email_status: "queued" | "sent" | "failed"
    }
    CompositeTypes: { [_ in never]: never }
  }
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
export type Views<T extends keyof PublicSchema["Views"]> = PublicSchema["Views"][T]["Row"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
