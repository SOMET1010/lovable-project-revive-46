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
      admin_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      agencies: {
        Row: {
          address: string | null
          agency_name: string
          avg_conversion_rate: number | null
          city: string | null
          commission_rate: number | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_verified: boolean | null
          logo_url: string | null
          monthly_target: number | null
          phone: string | null
          registration_number: string | null
          settings: Json | null
          status: string | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          total_agents: number | null
          total_properties_managed: number | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          website: string | null
          ytd_revenue: number | null
        }
        Insert: {
          address?: string | null
          agency_name: string
          avg_conversion_rate?: number | null
          city?: string | null
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          monthly_target?: number | null
          phone?: string | null
          registration_number?: string | null
          settings?: Json | null
          status?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          total_agents?: number | null
          total_properties_managed?: number | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          website?: string | null
          ytd_revenue?: number | null
        }
        Update: {
          address?: string | null
          agency_name?: string
          avg_conversion_rate?: number | null
          city?: string | null
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          monthly_target?: number | null
          phone?: string | null
          registration_number?: string | null
          settings?: Json | null
          status?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          total_agents?: number | null
          total_properties_managed?: number | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          website?: string | null
          ytd_revenue?: number | null
        }
        Relationships: []
      }
      agency_agents: {
        Row: {
          agency_id: string
          bio: string | null
          certifications: Json | null
          commission_split: number | null
          created_at: string | null
          email: string | null
          hire_date: string
          id: string
          phone: string | null
          role: string | null
          specialties: Json | null
          status: string | null
          target_monthly: number | null
          termination_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agency_id: string
          bio?: string | null
          certifications?: Json | null
          commission_split?: number | null
          created_at?: string | null
          email?: string | null
          hire_date?: string
          id?: string
          phone?: string | null
          role?: string | null
          specialties?: Json | null
          status?: string | null
          target_monthly?: number | null
          termination_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agency_id?: string
          bio?: string | null
          certifications?: Json | null
          commission_split?: number | null
          created_at?: string | null
          email?: string | null
          hire_date?: string
          id?: string
          phone?: string | null
          role?: string | null
          specialties?: Json | null
          status?: string | null
          target_monthly?: number | null
          termination_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_agents_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_agents_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "public_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_agents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      agency_mandates: {
        Row: {
          agency_id: string
          agency_signed_at: string | null
          can_communicate_tenants: boolean | null
          can_create_leases: boolean | null
          can_create_properties: boolean | null
          can_delete_properties: boolean | null
          can_edit_properties: boolean | null
          can_manage_applications: boolean | null
          can_manage_documents: boolean | null
          can_manage_maintenance: boolean | null
          can_view_applications: boolean | null
          can_view_financials: boolean | null
          can_view_properties: boolean | null
          commission_rate: number | null
          created_at: string | null
          cryptoneo_operation_id: string | null
          cryptoneo_signature_status: string | null
          end_date: string | null
          id: string
          mandate_document_url: string | null
          mandate_scope: string | null
          notes: string | null
          owner_id: string
          owner_signed_at: string | null
          property_id: string | null
          signed_at: string | null
          signed_mandate_url: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          agency_signed_at?: string | null
          can_communicate_tenants?: boolean | null
          can_create_leases?: boolean | null
          can_create_properties?: boolean | null
          can_delete_properties?: boolean | null
          can_edit_properties?: boolean | null
          can_manage_applications?: boolean | null
          can_manage_documents?: boolean | null
          can_manage_maintenance?: boolean | null
          can_view_applications?: boolean | null
          can_view_financials?: boolean | null
          can_view_properties?: boolean | null
          commission_rate?: number | null
          created_at?: string | null
          cryptoneo_operation_id?: string | null
          cryptoneo_signature_status?: string | null
          end_date?: string | null
          id?: string
          mandate_document_url?: string | null
          mandate_scope?: string | null
          notes?: string | null
          owner_id: string
          owner_signed_at?: string | null
          property_id?: string | null
          signed_at?: string | null
          signed_mandate_url?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          agency_signed_at?: string | null
          can_communicate_tenants?: boolean | null
          can_create_leases?: boolean | null
          can_create_properties?: boolean | null
          can_delete_properties?: boolean | null
          can_edit_properties?: boolean | null
          can_manage_applications?: boolean | null
          can_manage_documents?: boolean | null
          can_manage_maintenance?: boolean | null
          can_view_applications?: boolean | null
          can_view_financials?: boolean | null
          can_view_properties?: boolean | null
          commission_rate?: number | null
          created_at?: string | null
          cryptoneo_operation_id?: string | null
          cryptoneo_signature_status?: string | null
          end_date?: string | null
          id?: string
          mandate_document_url?: string | null
          mandate_scope?: string | null
          notes?: string | null
          owner_id?: string
          owner_signed_at?: string | null
          property_id?: string | null
          signed_at?: string | null
          signed_mandate_url?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_mandates_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_mandates_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "public_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_mandates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_mandates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_transactions: {
        Row: {
          agency_id: string
          agency_share: number
          agent_id: string | null
          agent_share: number | null
          created_at: string | null
          description: string | null
          gross_amount: number
          id: string
          lease_id: string | null
          paid_at: string | null
          payment_reference: string | null
          property_id: string | null
          status: string | null
          transaction_date: string | null
          transaction_type: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          agency_id: string
          agency_share: number
          agent_id?: string | null
          agent_share?: number | null
          created_at?: string | null
          description?: string | null
          gross_amount: number
          id?: string
          lease_id?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          property_id?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_type: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          agency_id?: string
          agency_share?: number
          agent_id?: string | null
          agent_share?: number | null
          created_at?: string | null
          description?: string | null
          gross_amount?: number
          id?: string
          lease_id?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          property_id?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_type?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_transactions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_transactions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "public_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agency_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_transactions_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_activities: {
        Row: {
          activity_type: string
          agent_id: string
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          activity_type: string
          agent_id: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          activity_type?: string
          agent_id?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_activities_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agency_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_performance_targets: {
        Row: {
          actual_leases: number | null
          actual_revenue: number | null
          actual_visits: number | null
          agent_id: string
          bonus_earned: number | null
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          target_leases: number | null
          target_revenue: number | null
          target_visits: number | null
          updated_at: string | null
        }
        Insert: {
          actual_leases?: number | null
          actual_revenue?: number | null
          actual_visits?: number | null
          agent_id: string
          bonus_earned?: number | null
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          target_leases?: number | null
          target_revenue?: number | null
          target_visits?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_leases?: number | null
          actual_revenue?: number | null
          actual_visits?: number | null
          agent_id?: string
          bonus_earned?: number | null
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          target_leases?: number | null
          target_revenue?: number | null
          target_visits?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_performance_targets_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agency_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_registration_requests: {
        Row: {
          agency_id: string
          applicant_email: string
          applicant_name: string
          applicant_phone: string
          certifications: Json | null
          created_at: string | null
          cv_url: string | null
          id: string
          motivation: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          specialties: Json | null
          status: string | null
          years_experience: number | null
        }
        Insert: {
          agency_id: string
          applicant_email: string
          applicant_name: string
          applicant_phone: string
          certifications?: Json | null
          created_at?: string | null
          cv_url?: string | null
          id?: string
          motivation?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialties?: Json | null
          status?: string | null
          years_experience?: number | null
        }
        Update: {
          agency_id?: string
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string
          certifications?: Json | null
          created_at?: string | null
          cv_url?: string | null
          id?: string
          motivation?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialties?: Json | null
          status?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_registration_requests_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_registration_requests_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "public_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_snapshots: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metrics: Json
          snapshot_date: string
          snapshot_type: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metrics?: Json
          snapshot_date: string
          snapshot_type: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metrics?: Json
          snapshot_date?: string
          snapshot_type?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          api_key: string
          api_secret: string | null
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          service_name: string
          updated_at: string | null
        }
        Insert: {
          api_key: string
          api_secret?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          service_name: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          api_secret?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          service_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      business_rules: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          max_value: number | null
          min_value: number | null
          rule_key: string
          rule_name: string
          rule_type: string
          updated_at: string | null
          value_boolean: boolean | null
          value_json: Json | null
          value_number: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          max_value?: number | null
          min_value?: number | null
          rule_key: string
          rule_name: string
          rule_type: string
          updated_at?: string | null
          value_boolean?: boolean | null
          value_json?: Json | null
          value_number?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          max_value?: number | null
          min_value?: number | null
          rule_key?: string
          rule_name?: string
          rule_type?: string
          updated_at?: string | null
          value_boolean?: boolean | null
          value_json?: Json | null
          value_number?: number | null
        }
        Relationships: []
      }
      cev_missions: {
        Row: {
          assigned_agent_id: string
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          documents: Json | null
          etat_lieux_report: Json | null
          id: string
          mission_type: string
          notes: string | null
          photos: Json | null
          property_id: string | null
          scheduled_date: string | null
          status: string
          updated_at: string | null
          urgency: string
          verification_checklist: Json | null
        }
        Insert: {
          assigned_agent_id: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          documents?: Json | null
          etat_lieux_report?: Json | null
          id?: string
          mission_type?: string
          notes?: string | null
          photos?: Json | null
          property_id?: string | null
          scheduled_date?: string | null
          status?: string
          updated_at?: string | null
          urgency?: string
          verification_checklist?: Json | null
        }
        Update: {
          assigned_agent_id?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          documents?: Json | null
          etat_lieux_report?: Json | null
          id?: string
          mission_type?: string
          notes?: string | null
          photos?: Json | null
          property_id?: string | null
          scheduled_date?: string | null
          status?: string
          updated_at?: string | null
          urgency?: string
          verification_checklist?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cev_missions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cev_missions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_conversations: {
        Row: {
          archived_at: string | null
          created_at: string | null
          id: string
          message_count: number | null
          metadata: Json | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          id?: string
          message_count?: number | null
          metadata?: Json | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          id?: string
          message_count?: number | null
          metadata?: Json | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chatbot_messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          metadata: Json | null
          reactions: Json | null
          read_at: string | null
          role: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          reactions?: Json | null
          read_at?: string | null
          role: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          reactions?: Json | null
          read_at?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chatbot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          resolved_at: string | null
          status: string | null
          subject: string | null
          submitted_at: string | null
        }
        Insert: {
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string | null
          submitted_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string | null
          submitted_at?: string | null
        }
        Relationships: []
      }
      departure_notices: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          departure_date: string
          deposit_deductions: Json | null
          deposit_return_amount: number | null
          deposit_returned_at: string | null
          exit_inventory_id: string | null
          exit_inventory_scheduled_at: string | null
          id: string
          initiated_by: string
          lease_id: string
          notice_date: string
          notice_document_url: string | null
          reason: string | null
          reason_details: string | null
          status: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          departure_date: string
          deposit_deductions?: Json | null
          deposit_return_amount?: number | null
          deposit_returned_at?: string | null
          exit_inventory_id?: string | null
          exit_inventory_scheduled_at?: string | null
          id?: string
          initiated_by: string
          lease_id: string
          notice_date: string
          notice_document_url?: string | null
          reason?: string | null
          reason_details?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          departure_date?: string
          deposit_deductions?: Json | null
          deposit_return_amount?: number | null
          deposit_returned_at?: string | null
          exit_inventory_id?: string | null
          exit_inventory_scheduled_at?: string | null
          id?: string
          initiated_by?: string
          lease_id?: string
          notice_date?: string
          notice_document_url?: string | null
          reason?: string | null
          reason_details?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departure_notices_exit_inventory_id_fkey"
            columns: ["exit_inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departure_notices_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_certificates: {
        Row: {
          certificate_data: Json | null
          certificate_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certificate_data?: Json | null
          certificate_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certificate_data?: Json | null
          certificate_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dispute_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          dispute_id: string
          id: string
          is_internal: boolean | null
          is_read: boolean | null
          sender_id: string
          sender_role: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          dispute_id: string
          id?: string
          is_internal?: boolean | null
          is_read?: boolean | null
          sender_id: string
          sender_role: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          dispute_id?: string
          id?: string
          is_internal?: boolean | null
          is_read?: boolean | null
          sender_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_messages_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          assigned_agent_id: string | null
          category: string
          complainant_id: string
          contract_id: string | null
          created_at: string | null
          description: string
          dispute_number: string
          escalated_at: string | null
          evidence: Json | null
          id: string
          intervention_id: string | null
          priority: string | null
          property_id: string | null
          resolution: string | null
          resolution_type: string | null
          resolved_at: string | null
          respondent_id: string
          satisfaction_complainant: number | null
          satisfaction_respondent: number | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          assigned_agent_id?: string | null
          category: string
          complainant_id: string
          contract_id?: string | null
          created_at?: string | null
          description: string
          dispute_number: string
          escalated_at?: string | null
          evidence?: Json | null
          id?: string
          intervention_id?: string | null
          priority?: string | null
          property_id?: string | null
          resolution?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          respondent_id: string
          satisfaction_complainant?: number | null
          satisfaction_respondent?: number | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          assigned_agent_id?: string | null
          category?: string
          complainant_id?: string
          contract_id?: string | null
          created_at?: string | null
          description?: string
          dispute_number?: string
          escalated_at?: string | null
          evidence?: Json | null
          id?: string
          intervention_id?: string | null
          priority?: string | null
          property_id?: string | null
          resolution?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          respondent_id?: string
          satisfaction_complainant?: number | null
          satisfaction_respondent?: number | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "interventions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      electronic_signature_logs: {
        Row: {
          created_at: string | null
          cryptoneo_response: Json | null
          error_message: string | null
          id: string
          initiated_by: string
          lease_id: string
          operation_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cryptoneo_response?: Json | null
          error_message?: string | null
          id?: string
          initiated_by: string
          lease_id: string
          operation_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cryptoneo_response?: Json | null
          error_message?: string | null
          id?: string
          initiated_by?: string
          lease_id?: string
          operation_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "electronic_signature_logs_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      facial_verification_attempts: {
        Row: {
          completed_at: string | null
          created_at: string | null
          document_id: string | null
          document_url: string | null
          failure_reason: string | null
          id: string
          is_live: boolean | null
          is_match: boolean | null
          matching_score: number | null
          provider: string
          provider_response: Json | null
          selfie_url: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          document_id?: string | null
          document_url?: string | null
          failure_reason?: string | null
          id?: string
          is_live?: boolean | null
          is_match?: boolean | null
          matching_score?: number | null
          provider?: string
          provider_response?: Json | null
          selfie_url?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          document_id?: string | null
          document_url?: string | null
          failure_reason?: string | null
          id?: string
          is_live?: boolean | null
          is_match?: boolean | null
          matching_score?: number | null
          provider?: string
          provider_response?: Json | null
          selfie_url?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          property_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          feature_name: string
          id: string
          is_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      guarantors: {
        Row: {
          created_at: string | null
          documents: Json | null
          email: string | null
          employer: string | null
          full_name: string
          id: string
          invitation_sent_at: string | null
          monthly_income: number | null
          neoface_score: number | null
          neoface_verified: boolean | null
          occupation: string | null
          phone: string | null
          relationship: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          documents?: Json | null
          email?: string | null
          employer?: string | null
          full_name: string
          id?: string
          invitation_sent_at?: string | null
          monthly_income?: number | null
          neoface_score?: number | null
          neoface_verified?: boolean | null
          occupation?: string | null
          phone?: string | null
          relationship?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          documents?: Json | null
          email?: string | null
          employer?: string | null
          full_name?: string
          id?: string
          invitation_sent_at?: string | null
          monthly_income?: number | null
          neoface_score?: number | null
          neoface_verified?: boolean | null
          occupation?: string | null
          phone?: string | null
          relationship?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guarantors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      hero_slides: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      interventions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          final_amount: number | null
          id: string
          maintenance_request_id: string | null
          notes: string | null
          owner_id: string
          owner_rating: number | null
          owner_review: string | null
          photos_after: Json | null
          photos_before: Json | null
          provider_id: string | null
          quoted_amount: number | null
          rating_criteria: Json | null
          scheduled_date: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          final_amount?: number | null
          id?: string
          maintenance_request_id?: string | null
          notes?: string | null
          owner_id: string
          owner_rating?: number | null
          owner_review?: string | null
          photos_after?: Json | null
          photos_before?: Json | null
          provider_id?: string | null
          quoted_amount?: number | null
          rating_criteria?: Json | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          final_amount?: number | null
          id?: string
          maintenance_request_id?: string | null
          notes?: string | null
          owner_id?: string
          owner_rating?: number | null
          owner_review?: string | null
          photos_after?: Json | null
          photos_before?: Json | null
          provider_id?: string | null
          quoted_amount?: number | null
          rating_criteria?: Json | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interventions_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_reports: {
        Row: {
          created_at: string
          damages: Json
          general_condition: string | null
          id: string
          inspection_date: string
          inspector_id: string | null
          inspector_signature_url: string | null
          inspector_signed_at: string | null
          keys_inventory: Json
          lease_id: string
          observations: string | null
          pdf_url: string | null
          photos: Json
          property_id: string
          report_type: string
          rooms: Json
          status: string
          tenant_present: boolean | null
          tenant_signature_url: string | null
          tenant_signed_at: string | null
          total_damages_cost: number | null
          updated_at: string
          utilities: Json
        }
        Insert: {
          created_at?: string
          damages?: Json
          general_condition?: string | null
          id?: string
          inspection_date: string
          inspector_id?: string | null
          inspector_signature_url?: string | null
          inspector_signed_at?: string | null
          keys_inventory?: Json
          lease_id: string
          observations?: string | null
          pdf_url?: string | null
          photos?: Json
          property_id: string
          report_type: string
          rooms?: Json
          status?: string
          tenant_present?: boolean | null
          tenant_signature_url?: string | null
          tenant_signed_at?: string | null
          total_damages_cost?: number | null
          updated_at?: string
          utilities?: Json
        }
        Update: {
          created_at?: string
          damages?: Json
          general_condition?: string | null
          id?: string
          inspection_date?: string
          inspector_id?: string | null
          inspector_signature_url?: string | null
          inspector_signed_at?: string | null
          keys_inventory?: Json
          lease_id?: string
          observations?: string | null
          pdf_url?: string | null
          photos?: Json
          property_id?: string
          report_type?: string
          rooms?: Json
          status?: string
          tenant_present?: boolean | null
          tenant_signature_url?: string | null
          tenant_signed_at?: string | null
          total_damages_cost?: number | null
          updated_at?: string
          utilities?: Json
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reports_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      lease_contracts: {
        Row: {
          ansut_certified_at: string | null
          auto_reminder_enabled: boolean | null
          certification_status: string | null
          charges_amount: number | null
          contract_number: string
          created_at: string | null
          cryptoneo_callback_received_at: string | null
          cryptoneo_operation_id: string | null
          cryptoneo_signature_status: string | null
          cryptoneo_signed_document_url: string | null
          custom_clauses: string | null
          deposit_amount: number | null
          document_url: string | null
          end_date: string
          ghost_tenant_detected: boolean | null
          grace_period_days: number | null
          id: string
          is_electronically_signed: boolean | null
          landlord_cryptoneo_signature_at: string | null
          landlord_signed_at: string | null
          last_payment_date: string | null
          lease_type: string | null
          legal_action_started: boolean | null
          legal_action_started_at: string | null
          monthly_rent: number
          next_payment_due_date: string | null
          owner_id: string
          payment_day: number | null
          penalty_cap: number | null
          penalty_rate: number | null
          property_id: string
          signed_at: string | null
          signed_document_url: string | null
          start_date: string
          status: string | null
          template_id: string | null
          tenant_cryptoneo_signature_at: string | null
          tenant_id: string
          tenant_signed_at: string | null
          updated_at: string | null
        }
        Insert: {
          ansut_certified_at?: string | null
          auto_reminder_enabled?: boolean | null
          certification_status?: string | null
          charges_amount?: number | null
          contract_number: string
          created_at?: string | null
          cryptoneo_callback_received_at?: string | null
          cryptoneo_operation_id?: string | null
          cryptoneo_signature_status?: string | null
          cryptoneo_signed_document_url?: string | null
          custom_clauses?: string | null
          deposit_amount?: number | null
          document_url?: string | null
          end_date: string
          ghost_tenant_detected?: boolean | null
          grace_period_days?: number | null
          id?: string
          is_electronically_signed?: boolean | null
          landlord_cryptoneo_signature_at?: string | null
          landlord_signed_at?: string | null
          last_payment_date?: string | null
          lease_type?: string | null
          legal_action_started?: boolean | null
          legal_action_started_at?: string | null
          monthly_rent: number
          next_payment_due_date?: string | null
          owner_id: string
          payment_day?: number | null
          penalty_cap?: number | null
          penalty_rate?: number | null
          property_id: string
          signed_at?: string | null
          signed_document_url?: string | null
          start_date: string
          status?: string | null
          template_id?: string | null
          tenant_cryptoneo_signature_at?: string | null
          tenant_id: string
          tenant_signed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          ansut_certified_at?: string | null
          auto_reminder_enabled?: boolean | null
          certification_status?: string | null
          charges_amount?: number | null
          contract_number?: string
          created_at?: string | null
          cryptoneo_callback_received_at?: string | null
          cryptoneo_operation_id?: string | null
          cryptoneo_signature_status?: string | null
          cryptoneo_signed_document_url?: string | null
          custom_clauses?: string | null
          deposit_amount?: number | null
          document_url?: string | null
          end_date?: string
          ghost_tenant_detected?: boolean | null
          grace_period_days?: number | null
          id?: string
          is_electronically_signed?: boolean | null
          landlord_cryptoneo_signature_at?: string | null
          landlord_signed_at?: string | null
          last_payment_date?: string | null
          lease_type?: string | null
          legal_action_started?: boolean | null
          legal_action_started_at?: string | null
          monthly_rent?: number
          next_payment_due_date?: string | null
          owner_id?: string
          payment_day?: number | null
          penalty_cap?: number | null
          penalty_rate?: number | null
          property_id?: string
          signed_at?: string | null
          signed_document_url?: string | null
          start_date?: string
          status?: string | null
          template_id?: string | null
          tenant_cryptoneo_signature_at?: string | null
          tenant_id?: string
          tenant_signed_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lease_contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_contracts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "lease_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      lease_renewals: {
        Row: {
          created_at: string
          finalized_at: string | null
          id: string
          lease_id: string
          original_end_date: string
          owner_notes: string | null
          owner_response_at: string | null
          proposed_end_date: string
          proposed_rent: number | null
          reminder_sent_at: string | null
          rent_increase_percent: number | null
          status: string
          tenant_notes: string | null
          tenant_response_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          finalized_at?: string | null
          id?: string
          lease_id: string
          original_end_date: string
          owner_notes?: string | null
          owner_response_at?: string | null
          proposed_end_date: string
          proposed_rent?: number | null
          reminder_sent_at?: string | null
          rent_increase_percent?: number | null
          status?: string
          tenant_notes?: string | null
          tenant_response_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          finalized_at?: string | null
          id?: string
          lease_id?: string
          original_end_date?: string
          owner_notes?: string | null
          owner_response_at?: string | null
          proposed_end_date?: string
          proposed_rent?: number | null
          reminder_sent_at?: string | null
          rent_increase_percent?: number | null
          status?: string
          tenant_notes?: string | null
          tenant_response_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lease_renewals_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      lease_templates: {
        Row: {
          content: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          actual_cost: number | null
          completed_date: string | null
          contract_id: string | null
          created_at: string | null
          description: string | null
          estimated_cost: number | null
          id: string
          images: string[] | null
          issue_type: string
          priority: string | null
          property_id: string | null
          rejection_reason: string | null
          resolved_at: string | null
          scheduled_date: string | null
          status: string | null
          tenant_id: string
          urgency: string | null
        }
        Insert: {
          actual_cost?: number | null
          completed_date?: string | null
          contract_id?: string | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: string
          images?: string[] | null
          issue_type: string
          priority?: string | null
          property_id?: string | null
          rejection_reason?: string | null
          resolved_at?: string | null
          scheduled_date?: string | null
          status?: string | null
          tenant_id: string
          urgency?: string | null
        }
        Update: {
          actual_cost?: number | null
          completed_date?: string | null
          contract_id?: string | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: string
          images?: string[] | null
          issue_type?: string
          priority?: string | null
          property_id?: string | null
          rejection_reason?: string | null
          resolved_at?: string | null
          scheduled_date?: string | null
          status?: string | null
          tenant_id?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      mandate_signature_logs: {
        Row: {
          created_at: string
          cryptoneo_response: Json | null
          error_message: string | null
          id: string
          ip_address: string | null
          mandate_id: string
          operation_id: string | null
          signer_id: string
          signer_type: string
          status: string
        }
        Insert: {
          created_at?: string
          cryptoneo_response?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          mandate_id: string
          operation_id?: string | null
          signer_id: string
          signer_type: string
          status: string
        }
        Update: {
          created_at?: string
          cryptoneo_response?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          mandate_id?: string
          operation_id?: string | null
          signer_id?: string
          signer_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mandate_signature_logs_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "agency_mandates"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_size: number | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "user_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          channel: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          channel?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          channel?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      owner_notification_settings: {
        Row: {
          alert_thresholds: Json | null
          auto_approve_maintenance_amount: number | null
          auto_approve_schedule_score: number | null
          auto_engage_lawyer_days: number | null
          channels: Json | null
          created_at: string | null
          daily_time: string | null
          delegate_contact_name: string | null
          delegate_contact_phone: string | null
          frequency: string | null
          id: string
          owner_id: string
          travel_mode_enabled: boolean | null
          travel_mode_end: string | null
          travel_mode_start: string | null
          travel_timezone: string | null
          updated_at: string | null
          weekly_day: number | null
          weekly_time: string | null
        }
        Insert: {
          alert_thresholds?: Json | null
          auto_approve_maintenance_amount?: number | null
          auto_approve_schedule_score?: number | null
          auto_engage_lawyer_days?: number | null
          channels?: Json | null
          created_at?: string | null
          daily_time?: string | null
          delegate_contact_name?: string | null
          delegate_contact_phone?: string | null
          frequency?: string | null
          id?: string
          owner_id: string
          travel_mode_enabled?: boolean | null
          travel_mode_end?: string | null
          travel_mode_start?: string | null
          travel_timezone?: string | null
          updated_at?: string | null
          weekly_day?: number | null
          weekly_time?: string | null
        }
        Update: {
          alert_thresholds?: Json | null
          auto_approve_maintenance_amount?: number | null
          auto_approve_schedule_score?: number | null
          auto_engage_lawyer_days?: number | null
          channels?: Json | null
          created_at?: string | null
          daily_time?: string | null
          delegate_contact_name?: string | null
          delegate_contact_phone?: string | null
          frequency?: string | null
          id?: string
          owner_id?: string
          travel_mode_enabled?: boolean | null
          travel_mode_end?: string | null
          travel_mode_start?: string | null
          travel_timezone?: string | null
          updated_at?: string | null
          weekly_day?: number | null
          weekly_time?: string | null
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          ip_address: string | null
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          ip_address?: string | null
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_delay_history: {
        Row: {
          amount_due: number | null
          created_at: string | null
          days_late: number
          id: string
          lease_id: string | null
          payment_id: string | null
          penalty_applied: number | null
          property_id: string | null
          risk_level: string | null
          tenant_id: string
        }
        Insert: {
          amount_due?: number | null
          created_at?: string | null
          days_late: number
          id?: string
          lease_id?: string | null
          payment_id?: string | null
          penalty_applied?: number | null
          property_id?: string | null
          risk_level?: string | null
          tenant_id: string
        }
        Update: {
          amount_due?: number | null
          created_at?: string | null
          days_late?: number
          id?: string
          lease_id?: string | null
          payment_id?: string | null
          penalty_applied?: number | null
          property_id?: string | null
          risk_level?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_delay_history_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_delay_history_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_delay_history_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_delay_history_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          fees: number | null
          id: string
          installments: Json
          lease_id: string | null
          owner_id: string
          reason: string | null
          rejection_reason: string | null
          requested_at: string | null
          status: string | null
          tenant_id: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          fees?: number | null
          id?: string
          installments?: Json
          lease_id?: string | null
          owner_id: string
          reason?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          status?: string | null
          tenant_id: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          fees?: number | null
          id?: string
          installments?: Json
          lease_id?: string | null
          owner_id?: string
          reason?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          status?: string | null
          tenant_id?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_plans_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reminders: {
        Row: {
          channel: string
          contract_id: string | null
          created_at: string | null
          delivered_at: string | null
          id: string
          message_content: string | null
          opened_at: string | null
          payment_id: string | null
          reminder_type: string
          sent_at: string | null
          tenant_id: string
        }
        Insert: {
          channel: string
          contract_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          message_content?: string | null
          opened_at?: string | null
          payment_id?: string | null
          reminder_type: string
          sent_at?: string | null
          tenant_id: string
        }
        Update: {
          channel?: string
          contract_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          message_content?: string | null
          opened_at?: string | null
          payment_id?: string | null
          reminder_type?: string
          sent_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reminders_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_schedules: {
        Row: {
          amount: number
          authorization_date: string | null
          contract_id: string | null
          created_at: string | null
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_payment_date: string | null
          max_failures: number | null
          mobile_money_number: string | null
          mobile_money_provider: string | null
          next_payment_date: string | null
          payment_day: number
          payment_method: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          authorization_date?: string | null
          contract_id?: string | null
          created_at?: string | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_payment_date?: string | null
          max_failures?: number | null
          mobile_money_number?: string | null
          mobile_money_provider?: string | null
          next_payment_date?: string | null
          payment_day: number
          payment_method?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          authorization_date?: string | null
          contract_id?: string | null
          created_at?: string | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_payment_date?: string | null
          max_failures?: number | null
          mobile_money_number?: string | null
          mobile_money_provider?: string | null
          next_payment_date?: string | null
          payment_day?: number
          payment_method?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_schedules_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          contract_id: string | null
          created_at: string | null
          days_late: number | null
          due_date: string | null
          id: string
          is_plan_payment: boolean | null
          late_fee_amount: number | null
          late_fee_applied_at: string | null
          overdue_notice_sent_at: string | null
          paid_date: string | null
          payer_id: string
          payment_method: string | null
          payment_type: string
          plan_id: string | null
          property_id: string | null
          receipt_number: string | null
          receipt_url: string | null
          receiver_id: string | null
          reminder_id: string | null
          reminder_sent_at: string | null
          status: string | null
          transaction_ref: string | null
        }
        Insert: {
          amount: number
          contract_id?: string | null
          created_at?: string | null
          days_late?: number | null
          due_date?: string | null
          id?: string
          is_plan_payment?: boolean | null
          late_fee_amount?: number | null
          late_fee_applied_at?: string | null
          overdue_notice_sent_at?: string | null
          paid_date?: string | null
          payer_id: string
          payment_method?: string | null
          payment_type: string
          plan_id?: string | null
          property_id?: string | null
          receipt_number?: string | null
          receipt_url?: string | null
          receiver_id?: string | null
          reminder_id?: string | null
          reminder_sent_at?: string | null
          status?: string | null
          transaction_ref?: string | null
        }
        Update: {
          amount?: number
          contract_id?: string | null
          created_at?: string | null
          days_late?: number | null
          due_date?: string | null
          id?: string
          is_plan_payment?: boolean | null
          late_fee_amount?: number | null
          late_fee_applied_at?: string | null
          overdue_notice_sent_at?: string | null
          paid_date?: string | null
          payer_id?: string
          payment_method?: string | null
          payment_type?: string
          plan_id?: string | null
          property_id?: string | null
          receipt_number?: string | null
          receipt_url?: string | null
          receiver_id?: string | null
          reminder_id?: string | null
          reminder_sent_at?: string | null
          status?: string | null
          transaction_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "rent_reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      postponement_requests: {
        Row: {
          created_at: string | null
          days_requested: number
          decision_at: string | null
          decision_by: string | null
          decision_reason: string | null
          id: string
          justification_url: string | null
          lease_id: string | null
          new_due_date: string | null
          original_due_date: string
          owner_id: string
          reason: string
          reason_details: string | null
          status: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          days_requested: number
          decision_at?: string | null
          decision_by?: string | null
          decision_reason?: string | null
          id?: string
          justification_url?: string | null
          lease_id?: string | null
          new_due_date?: string | null
          original_due_date: string
          owner_id: string
          reason: string
          reason_details?: string | null
          status?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          days_requested?: number
          decision_at?: string | null
          decision_by?: string | null
          decision_reason?: string | null
          id?: string
          justification_url?: string | null
          lease_id?: string | null
          new_due_date?: string | null
          original_due_date?: string
          owner_id?: string
          reason?: string
          reason_details?: string | null
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "postponement_requests_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_role: string | null
          address: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          cnam_verified: boolean | null
          cni_photo_url: string | null
          created_at: string | null
          date_of_birth: string | null
          dependents_count: number | null
          email: string | null
          employer: string | null
          employment_start_date: string | null
          employment_type: string | null
          facial_verification_date: string | null
          facial_verification_image_url: string | null
          facial_verification_score: number | null
          facial_verification_status: string | null
          full_name: string | null
          id: string
          is_verified: boolean | null
          marital_status: string | null
          monthly_income: number | null
          nationality: string | null
          occupation: string | null
          oneci_data: Json | null
          oneci_number: string | null
          oneci_verification_date: string | null
          oneci_verified: boolean | null
          phone: string | null
          profile_setup_completed: boolean | null
          reliability_score: number | null
          trust_score: number | null
          updated_at: string | null
          user_id: string | null
          user_type: string | null
        }
        Insert: {
          active_role?: string | null
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          cnam_verified?: boolean | null
          cni_photo_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dependents_count?: number | null
          email?: string | null
          employer?: string | null
          employment_start_date?: string | null
          employment_type?: string | null
          facial_verification_date?: string | null
          facial_verification_image_url?: string | null
          facial_verification_score?: number | null
          facial_verification_status?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          marital_status?: string | null
          monthly_income?: number | null
          nationality?: string | null
          occupation?: string | null
          oneci_data?: Json | null
          oneci_number?: string | null
          oneci_verification_date?: string | null
          oneci_verified?: boolean | null
          phone?: string | null
          profile_setup_completed?: boolean | null
          reliability_score?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Update: {
          active_role?: string | null
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          cnam_verified?: boolean | null
          cni_photo_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dependents_count?: number | null
          email?: string | null
          employer?: string | null
          employment_start_date?: string | null
          employment_type?: string | null
          facial_verification_date?: string | null
          facial_verification_image_url?: string | null
          facial_verification_score?: number | null
          facial_verification_status?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          marital_status?: string | null
          monthly_income?: number | null
          nationality?: string | null
          occupation?: string | null
          oneci_data?: Json | null
          oneci_number?: string | null
          oneci_verification_date?: string | null
          oneci_verified?: boolean | null
          phone?: string | null
          profile_setup_completed?: boolean | null
          reliability_score?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          agency_id: string | null
          amenities: string[] | null
          ansut_certificate_url: string | null
          ansut_verification_date: string | null
          ansut_verified: boolean | null
          assigned_agent_id: string | null
          avg_response_time_hours: number | null
          bathrooms: number | null
          bedrooms: number | null
          charges_amount: number | null
          city: string
          created_at: string | null
          deposit_amount: number | null
          description: string | null
          has_ac: boolean | null
          has_garden: boolean | null
          has_parking: boolean | null
          has_virtual_tour: boolean | null
          id: string
          images: string[] | null
          is_anonymous: boolean | null
          is_furnished: boolean | null
          latitude: number | null
          longitude: number | null
          main_image: string | null
          monthly_rent: number
          neighborhood: string | null
          osm_contribution_consent: boolean | null
          owner_id: string | null
          price: number | null
          property_category: string | null
          property_type: string
          status: string | null
          surface_area: number | null
          title: string
          updated_at: string | null
          view_count: number | null
          virtual_tour_url: string | null
        }
        Insert: {
          address?: string | null
          agency_id?: string | null
          amenities?: string[] | null
          ansut_certificate_url?: string | null
          ansut_verification_date?: string | null
          ansut_verified?: boolean | null
          assigned_agent_id?: string | null
          avg_response_time_hours?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          charges_amount?: number | null
          city: string
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          has_ac?: boolean | null
          has_garden?: boolean | null
          has_parking?: boolean | null
          has_virtual_tour?: boolean | null
          id?: string
          images?: string[] | null
          is_anonymous?: boolean | null
          is_furnished?: boolean | null
          latitude?: number | null
          longitude?: number | null
          main_image?: string | null
          monthly_rent: number
          neighborhood?: string | null
          osm_contribution_consent?: boolean | null
          owner_id?: string | null
          price?: number | null
          property_category?: string | null
          property_type: string
          status?: string | null
          surface_area?: number | null
          title: string
          updated_at?: string | null
          view_count?: number | null
          virtual_tour_url?: string | null
        }
        Update: {
          address?: string | null
          agency_id?: string | null
          amenities?: string[] | null
          ansut_certificate_url?: string | null
          ansut_verification_date?: string | null
          ansut_verified?: boolean | null
          assigned_agent_id?: string | null
          avg_response_time_hours?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          charges_amount?: number | null
          city?: string
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          has_ac?: boolean | null
          has_garden?: boolean | null
          has_parking?: boolean | null
          has_virtual_tour?: boolean | null
          id?: string
          images?: string[] | null
          is_anonymous?: boolean | null
          is_furnished?: boolean | null
          latitude?: number | null
          longitude?: number | null
          main_image?: string | null
          monthly_rent?: number
          neighborhood?: string | null
          osm_contribution_consent?: boolean | null
          owner_id?: string | null
          price?: number | null
          property_category?: string | null
          property_type?: string
          status?: string | null
          surface_area?: number | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
          virtual_tour_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_properties_owner_profile"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "public_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agency_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      property_alerts: {
        Row: {
          city: string | null
          created_at: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          last_notified_at: string | null
          last_results_count: number | null
          max_bedrooms: number | null
          max_price: number | null
          min_bedrooms: number | null
          min_price: number | null
          name: string | null
          neighborhood: string | null
          property_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_notified_at?: string | null
          last_results_count?: number | null
          max_bedrooms?: number | null
          max_price?: number | null
          min_bedrooms?: number | null
          min_price?: number | null
          name?: string | null
          neighborhood?: string | null
          property_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_notified_at?: string | null
          last_results_count?: number | null
          max_bedrooms?: number | null
          max_price?: number | null
          min_bedrooms?: number | null
          min_price?: number | null
          name?: string | null
          neighborhood?: string | null
          property_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      property_assignments: {
        Row: {
          agency_id: string
          agent_id: string
          assigned_by: string | null
          assignment_type: string | null
          commission_override: number | null
          created_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          property_id: string
          start_date: string | null
          status: string | null
        }
        Insert: {
          agency_id: string
          agent_id: string
          assigned_by?: string | null
          assignment_type?: string | null
          commission_override?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          property_id: string
          start_date?: string | null
          status?: string | null
        }
        Update: {
          agency_id?: string
          agent_id?: string
          assigned_by?: string | null
          assignment_type?: string | null
          commission_override?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          property_id?: string
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_assignments_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_assignments_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "public_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agency_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "property_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_documents: {
        Row: {
          created_at: string | null
          document_name: string | null
          document_type: string
          document_url: string
          id: string
          owner_id: string
          property_id: string | null
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_name?: string | null
          document_type: string
          document_url: string
          id?: string
          owner_id: string
          property_id?: string | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string | null
          document_type?: string
          document_url?: string
          id?: string
          owner_id?: string
          property_id?: string | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_quotes: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          estimated_duration: string | null
          expires_at: string | null
          id: string
          maintenance_request_id: string | null
          provider_id: string | null
          status: string | null
          validity_days: number | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          estimated_duration?: string | null
          expires_at?: string | null
          id?: string
          maintenance_request_id?: string | null
          provider_id?: string | null
          status?: string | null
          validity_days?: number | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          estimated_duration?: string | null
          expires_at?: string | null
          id?: string
          maintenance_request_id?: string | null
          provider_id?: string | null
          status?: string | null
          validity_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_quotes_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_quotes_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      rent_reminders: {
        Row: {
          amount_due: number | null
          channels_used: Json | null
          created_at: string | null
          id: string
          lease_id: string | null
          message_content: string | null
          opened_at: string | null
          owner_id: string
          penalty_amount: number | null
          property_id: string | null
          reminder_type: string
          sent_at: string | null
          status: string | null
          tenant_id: string
        }
        Insert: {
          amount_due?: number | null
          channels_used?: Json | null
          created_at?: string | null
          id?: string
          lease_id?: string | null
          message_content?: string | null
          opened_at?: string | null
          owner_id: string
          penalty_amount?: number | null
          property_id?: string | null
          reminder_type: string
          sent_at?: string | null
          status?: string | null
          tenant_id: string
        }
        Update: {
          amount_due?: number | null
          channels_used?: Json | null
          created_at?: string | null
          id?: string
          lease_id?: string | null
          message_content?: string | null
          opened_at?: string | null
          owner_id?: string
          penalty_amount?: number | null
          property_id?: string | null
          reminder_type?: string
          sent_at?: string | null
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rent_reminders_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_reminders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_reminders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_applications: {
        Row: {
          applicant_id: string
          application_score: number | null
          cover_letter: string | null
          created_at: string | null
          id: string
          property_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_id: string
          application_score?: number | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          property_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_id?: string
          application_score?: number | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          property_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_history: {
        Row: {
          city: string
          created_at: string | null
          departure_reason: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          landlord_email: string | null
          landlord_name: string | null
          landlord_phone: string | null
          monthly_rent: number
          proof_documents: Json | null
          property_address: string
          property_type: string | null
          self_condition_rating: number | null
          self_payment_rating: number | null
          start_date: string
          tenant_id: string
          updated_at: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          departure_reason?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          landlord_email?: string | null
          landlord_name?: string | null
          landlord_phone?: string | null
          monthly_rent: number
          proof_documents?: Json | null
          property_address: string
          property_type?: string | null
          self_condition_rating?: number | null
          self_payment_rating?: number | null
          start_date: string
          tenant_id: string
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          departure_reason?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          landlord_email?: string | null
          landlord_name?: string | null
          landlord_phone?: string | null
          monthly_rent?: number
          proof_documents?: Json | null
          property_address?: string
          property_type?: string | null
          self_condition_rating?: number | null
          self_payment_rating?: number | null
          start_date?: string
          tenant_id?: string
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          criteria_ratings: Json | null
          helpful_count: number | null
          id: string
          is_visible: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          moderation_status: string | null
          property_id: string | null
          rating: number
          response: string | null
          response_at: string | null
          review_type: string | null
          reviewee_id: string | null
          reviewer_id: string
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          criteria_ratings?: Json | null
          helpful_count?: number | null
          id?: string
          is_visible?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          property_id?: string | null
          rating: number
          response?: string | null
          response_at?: string | null
          review_type?: string | null
          reviewee_id?: string | null
          reviewer_id: string
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          criteria_ratings?: Json | null
          helpful_count?: number | null
          id?: string
          is_visible?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          property_id?: string | null
          rating?: number
          response?: string | null
          response_at?: string | null
          review_type?: string | null
          reviewee_id?: string | null
          reviewer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string | null
          filters: Json
          id: string
          name: string
          notifications_enabled: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters?: Json
          id?: string
          name: string
          notifications_enabled?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json
          id?: string
          name?: string
          notifications_enabled?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      service_configurations: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          priority: number | null
          provider: string
          service_name: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          priority?: number | null
          provider: string
          service_name: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          priority?: number | null
          provider?: string
          service_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          address: string | null
          bio: string | null
          city: string | null
          company_name: string
          completed_jobs: number | null
          created_at: string | null
          documents: Json | null
          email: string | null
          hourly_rate: number | null
          id: string
          insurance_expiry: string | null
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          phone: string | null
          rating_avg: number | null
          rating_count: number | null
          response_time_avg: number | null
          service_areas: string[]
          siret: string | null
          specialties: string[]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          city?: string | null
          company_name: string
          completed_jobs?: number | null
          created_at?: string | null
          documents?: Json | null
          email?: string | null
          hourly_rate?: number | null
          id?: string
          insurance_expiry?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          phone?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          response_time_avg?: number | null
          service_areas?: string[]
          siret?: string | null
          specialties?: string[]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string
          completed_jobs?: number | null
          created_at?: string | null
          documents?: Json | null
          email?: string | null
          hourly_rate?: number | null
          id?: string
          insurance_expiry?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          phone?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          response_time_avg?: number | null
          service_areas?: string[]
          siret?: string | null
          specialties?: string[]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      service_usage_logs: {
        Row: {
          error_message: string | null
          id: string
          phone: string | null
          provider: string
          response_time_ms: number | null
          service_name: string
          status: string
          timestamp: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          phone?: string | null
          provider: string
          response_time_ms?: number | null
          service_name: string
          status: string
          timestamp?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          phone?: string | null
          provider?: string
          response_time_ms?: number | null
          service_name?: string
          status?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          message: string
          phone: string
          provider: string
          status: string
          transaction_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          phone: string
          provider: string
          status: string
          transaction_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          phone?: string
          provider?: string
          status?: string
          transaction_id?: string | null
        }
        Relationships: []
      }
      suta_analytics: {
        Row: {
          avg_response_time_ms: number | null
          category: string | null
          created_at: string | null
          date: string | null
          id: string
          negative_feedback: number | null
          positive_feedback: number | null
          question_count: number | null
          topic: string | null
        }
        Insert: {
          avg_response_time_ms?: number | null
          category?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          negative_feedback?: number | null
          positive_feedback?: number | null
          question_count?: number | null
          topic?: string | null
        }
        Update: {
          avg_response_time_ms?: number | null
          category?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          negative_feedback?: number | null
          positive_feedback?: number | null
          question_count?: number | null
          topic?: string | null
        }
        Relationships: []
      }
      suta_feedback: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          feedback_text: string | null
          id: string
          message_id: string
          question: string
          rating: string
          response: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          message_id: string
          question: string
          rating: string
          response: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          message_id?: string
          question?: string
          rating?: string
          response?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suta_feedback_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chatbot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      suta_knowledge_base: {
        Row: {
          answer: string
          category: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          negative_feedback_count: number | null
          positive_feedback_count: number | null
          priority: number | null
          question: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          answer: string
          category: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          negative_feedback_count?: number | null
          positive_feedback_count?: number | null
          priority?: number | null
          question: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          negative_feedback_count?: number | null
          positive_feedback_count?: number | null
          priority?: number | null
          question?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      user_conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          participant_1_id: string
          participant_2_id: string
          property_id: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_1_id: string
          participant_2_id: string
          property_id?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_1_id?: string
          participant_2_id?: string
          property_id?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_documents: {
        Row: {
          created_at: string | null
          document_name: string | null
          document_type: string
          document_url: string
          file_size: number | null
          id: string
          ocr_extracted: Json | null
          rejection_reason: string | null
          user_id: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_name?: string | null
          document_type: string
          document_url: string
          file_size?: number | null
          id?: string
          ocr_extracted?: Json | null
          rejection_reason?: string | null
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string | null
          document_type?: string
          document_url?: string
          file_size?: number | null
          id?: string
          ocr_extracted?: Json | null
          rejection_reason?: string | null
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          attempts: number | null
          code: string
          created_at: string | null
          email: string | null
          expires_at: string
          id: string
          max_attempts: number | null
          phone: string | null
          type: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string | null
          email?: string | null
          expires_at: string
          id?: string
          max_attempts?: number | null
          phone?: string | null
          type: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string | null
          email?: string | null
          expires_at?: string
          id?: string
          max_attempts?: number | null
          phone?: string | null
          type?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      visit_requests: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          feedback: string | null
          id: string
          notes: string | null
          owner_id: string | null
          property_id: string
          rating: number | null
          status: string | null
          tenant_id: string
          visit_date: string
          visit_time: string
          visit_type: string | null
          visitor_notes: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          property_id: string
          rating?: number | null
          status?: string | null
          tenant_id: string
          visit_date: string
          visit_time: string
          visit_type?: string | null
          visitor_notes?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          property_id?: string
          rating?: number | null
          status?: string | null
          tenant_id?: string
          visit_date?: string
          visit_time?: string
          visit_type?: string | null
          visitor_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_slots: {
        Row: {
          booked_by: string | null
          created_at: string | null
          duration_minutes: number | null
          end_time: string
          google_calendar_event_id: string | null
          id: string
          is_booked: boolean | null
          notes: string | null
          owner_id: string
          property_id: string
          start_time: string
          updated_at: string | null
          visit_type: string | null
        }
        Insert: {
          booked_by?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          end_time: string
          google_calendar_event_id?: string | null
          id?: string
          is_booked?: boolean | null
          notes?: string | null
          owner_id: string
          property_id: string
          start_time: string
          updated_at?: string | null
          visit_type?: string | null
        }
        Update: {
          booked_by?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string
          google_calendar_event_id?: string | null
          id?: string
          is_booked?: boolean | null
          notes?: string | null
          owner_id?: string
          property_id?: string
          start_time?: string
          updated_at?: string | null
          visit_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_slots_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_slots_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          notes: string | null
          owner_id: string
          property_id: string
          rating: number | null
          slot_id: string | null
          status: string | null
          updated_at: string | null
          visit_date: string
          visit_time: string
          visit_type: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          notes?: string | null
          owner_id: string
          property_id: string
          rating?: number | null
          slot_id?: string | null
          status?: string | null
          updated_at?: string | null
          visit_date: string
          visit_time: string
          visit_type?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          property_id?: string
          rating?: number | null
          slot_id?: string | null
          status?: string | null
          updated_at?: string | null
          visit_date?: string
          visit_time?: string
          visit_type?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "visit_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          payload: Json | null
          processing_result: string
          signature_provided: string | null
          signature_valid: boolean | null
          source_ip: string | null
          webhook_type: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          processing_result: string
          signature_provided?: string | null
          signature_valid?: boolean | null
          source_ip?: string | null
          webhook_type: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          processing_result?: string
          signature_provided?: string | null
          signature_valid?: boolean | null
          source_ip?: string | null
          webhook_type?: string
        }
        Relationships: []
      }
      whatsapp_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          message: string
          phone: string
          provider: string
          status: string
          transaction_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          phone: string
          provider: string
          status: string
          transaction_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          phone?: string
          provider?: string
          status?: string
          transaction_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_agencies: {
        Row: {
          agency_name: string | null
          city: string | null
          description: string | null
          id: string | null
          is_verified: boolean | null
          logo_url: string | null
          status: string | null
          verified_at: string | null
        }
        Insert: {
          agency_name?: string | null
          city?: string | null
          description?: string | null
          id?: string | null
          is_verified?: boolean | null
          logo_url?: string | null
          status?: string | null
          verified_at?: string | null
        }
        Update: {
          agency_name?: string | null
          city?: string | null
          description?: string | null
          id?: string | null
          is_verified?: boolean | null
          logo_url?: string | null
          status?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      public_properties: {
        Row: {
          address: string | null
          amenities: string[] | null
          ansut_verified: boolean | null
          bathrooms: number | null
          bedrooms: number | null
          charges_amount: number | null
          city: string | null
          created_at: string | null
          deposit_amount: number | null
          description: string | null
          has_ac: boolean | null
          has_garden: boolean | null
          has_parking: boolean | null
          id: string | null
          images: string[] | null
          is_anonymous: boolean | null
          is_furnished: boolean | null
          latitude: number | null
          longitude: number | null
          main_image: string | null
          monthly_rent: number | null
          neighborhood: string | null
          owner_id: string | null
          property_category: string | null
          property_type: string | null
          status: string | null
          surface_area: number | null
          title: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          ansut_verified?: boolean | null
          bathrooms?: number | null
          bedrooms?: number | null
          charges_amount?: number | null
          city?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          has_ac?: boolean | null
          has_garden?: boolean | null
          has_parking?: boolean | null
          id?: string | null
          images?: string[] | null
          is_anonymous?: boolean | null
          is_furnished?: boolean | null
          latitude?: number | null
          longitude?: number | null
          main_image?: string | null
          monthly_rent?: number | null
          neighborhood?: string | null
          owner_id?: never
          property_category?: string | null
          property_type?: string | null
          status?: string | null
          surface_area?: number | null
          title?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          ansut_verified?: boolean | null
          bathrooms?: number | null
          bedrooms?: number | null
          charges_amount?: number | null
          city?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          has_ac?: boolean | null
          has_garden?: boolean | null
          has_parking?: boolean | null
          id?: string | null
          images?: string[] | null
          is_anonymous?: boolean | null
          is_furnished?: boolean | null
          latitude?: number | null
          longitude?: number | null
          main_image?: string | null
          monthly_rent?: number | null
          neighborhood?: string | null
          owner_id?: never
          property_category?: string | null
          property_type?: string | null
          status?: string | null
          surface_area?: number | null
          title?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_dispute_to_agent: {
        Args: { p_dispute_id: string }
        Returns: string
      }
      auto_expire_mandates: { Args: never; Returns: number }
      calculate_late_penalty: {
        Args: {
          p_amount: number
          p_cap?: number
          p_days_late: number
          p_grace_days?: number
          p_rate?: number
        }
        Returns: number
      }
      calculate_priority_score: {
        Args: {
          p_amount_due: number
          p_days_late: number
          p_legal_action_started: boolean
          p_tenant_score: number
        }
        Returns: number
      }
      calculate_profile_score: {
        Args: {
          p_address: string
          p_avatar_url: string
          p_bio: string
          p_city: string
          p_full_name: string
          p_phone: string
        }
        Returns: number
      }
      calculate_trust_score: {
        Args: {
          p_address: string
          p_avatar_url: string
          p_bio: string
          p_city: string
          p_cnam_verified: boolean
          p_facial_status: string
          p_full_name: string
          p_is_verified: boolean
          p_oneci_verified: boolean
          p_phone: string
        }
        Returns: number
      }
      calculate_verification_score: {
        Args: {
          p_cnam_verified: boolean
          p_facial_status: string
          p_is_verified: boolean
          p_oneci_verified: boolean
        }
        Returns: number
      }
      check_feature_flag: {
        Args: { flag_key: string; user_id?: string }
        Returns: boolean
      }
      cleanup_expired_verification_codes: { Args: never; Returns: number }
      cleanup_old_webhook_logs: { Args: never; Returns: number }
      expire_old_quotes: { Args: never; Returns: number }
      generate_otp: { Args: never; Returns: string }
      generate_receipt_number: { Args: never; Returns: string }
      generate_reset_token: { Args: never; Returns: string }
      get_agency_stats: { Args: { p_agency_id: string }; Returns: Json }
      get_agent_commissions: {
        Args: { p_agent_id: string; p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      get_agent_leaderboard: {
        Args: { p_agency_id: string; p_limit?: number }
        Returns: {
          agent_id: string
          agent_name: string
          avatar_url: string
          rank: number
          total_leases: number
          total_revenue: number
        }[]
      }
      get_dispute_stats: { Args: { p_user_id?: string }; Returns: Json }
      get_owner_analytics: {
        Args: { p_end_date?: string; p_owner_id: string; p_start_date?: string }
        Returns: Json
      }
      get_owner_properties_summary: {
        Args: { p_owner_id: string }
        Returns: Json
      }
      get_platform_analytics: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      get_platform_stats: { Args: never; Returns: Json }
      get_public_profile: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          city: string
          cnam_verified: boolean
          full_name: string
          is_verified: boolean
          oneci_verified: boolean
          trust_score: number
          user_id: string
        }[]
      }
      get_public_profiles: {
        Args: { profile_user_ids: string[] }
        Returns: {
          avatar_url: string
          city: string
          cnam_verified: boolean
          full_name: string
          is_verified: boolean
          oneci_verified: boolean
          trust_score: number
          user_id: string
        }[]
      }
      get_public_profiles_safe: {
        Args: { profile_user_ids: string[] }
        Returns: {
          avatar_url: string
          city: string
          cnam_verified: boolean
          full_name: string
          is_verified: boolean
          oneci_verified: boolean
          trust_score: number
          user_id: string
        }[]
      }
      get_user_roles: {
        Args: { _user_id?: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_property_views: {
        Args: { property_id: string }
        Returns: undefined
      }
      insert_audit_log: {
        Args: {
          p_action: string
          p_details?: Json
          p_entity_id?: string
          p_entity_type: string
        }
        Returns: string
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_details?: Json
          p_entity_id?: string
          p_entity_type: string
        }
        Returns: string
      }
      log_facial_verification_attempt: {
        Args: {
          p_document_id?: string
          p_document_url?: string
          p_provider?: string
          p_selfie_url?: string
          p_user_id: string
        }
        Returns: string
      }
      update_facial_verification_status: {
        Args: {
          p_failure_reason?: string
          p_is_live?: boolean
          p_is_match?: boolean
          p_matching_score?: number
          p_provider_response?: Json
          p_status: string
          p_verification_id: string
        }
        Returns: undefined
      }
      upsert_suta_analytics: {
        Args: { p_category: string; p_is_positive?: boolean; p_topic: string }
        Returns: undefined
      }
      verify_otp_code: {
        Args: {
          p_code?: string
          p_email?: string
          p_phone?: string
          p_type?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "trust_agent"
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
      app_role: ["admin", "moderator", "user", "trust_agent"],
    },
  },
} as const
