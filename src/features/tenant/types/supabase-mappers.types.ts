/**
 * Types for Supabase query results with relations
 * These types replace `any` in mapper functions
 */

import type { LucideIcon } from 'lucide-react';

// ============================================
// Lease Contracts with Relations
// ============================================

export interface LeaseContractProperty {
  title: string;
  address: string | null;
  city: string;
  main_image: string | null;
}

export interface LeaseContractProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

export interface LeaseContractQueryResult {
  id: string;
  contract_number: string | null;
  property_id: string;
  contract_type?: string | null;
  status: string | null;
  start_date: string;
  end_date: string | null;
  monthly_rent: number;
  deposit_amount: number | null;
  charges_amount: number | null;
  owner_signed_at: string | null;
  tenant_signed_at: string | null;
  created_at: string | null;
  owner_id: string;
  tenant_id: string;
  properties: LeaseContractProperty | null;
  owner: LeaseContractProfile | null;
  tenant: LeaseContractProfile | null;
}

// ============================================
// Payments with Relations
// ============================================

export interface PaymentQueryResult {
  id: string;
  amount: number;
  payment_type: string;
  payment_method: string | null;
  status: string | null;
  created_at: string | null;
  payer_id: string | null;
  receiver_id: string | null;
  property_id: string | null;
  contract_id: string | null;
}

// ============================================
// Status Config Types (replace `icon: any`)
// ============================================

export interface StatusConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

export type StatusConfigMap = Record<string, StatusConfig>;

// ============================================
// Maintenance with Relations
// ============================================

export interface MaintenanceLeaseQueryResult {
  id: string;
  property_id: string;
  tenant_id: string;
  owner_id: string;
  status: string | null;
  properties: {
    title: string;
    address: string | null;
    city: string;
  } | null;
}
