/**
 * Hook pour la gestion des mandats agence
 * Permet aux propriétaires d'inviter des agences et aux agences de gérer les mandats
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { toast } from 'sonner';

// Types
export interface Agency {
  id: string;
  user_id: string;
  agency_name: string;
  registration_number: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  commission_rate: number;
  is_verified: boolean;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface MandatePermissions {
  can_view_properties: boolean;
  can_edit_properties: boolean;
  can_create_properties: boolean;
  can_delete_properties: boolean;
  can_view_applications: boolean;
  can_manage_applications: boolean;
  can_create_leases: boolean;
  can_view_financials: boolean;
  can_manage_maintenance: boolean;
  can_communicate_tenants: boolean;
  can_manage_documents: boolean;
}

export interface AgencyMandate {
  id: string;
  property_id: string;
  agency_id: string;
  owner_id: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'suspended';
  start_date: string;
  end_date: string | null;
  commission_rate: number;
  mandate_document_url: string | null;
  signed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Permissions
  can_view_properties: boolean;
  can_edit_properties: boolean;
  can_create_properties: boolean;
  can_delete_properties: boolean;
  can_view_applications: boolean;
  can_manage_applications: boolean;
  can_create_leases: boolean;
  can_view_financials: boolean;
  can_manage_maintenance: boolean;
  can_communicate_tenants: boolean;
  can_manage_documents: boolean;
  // Joined data
  property?: {
    id: string;
    title: string;
    city: string;
    neighborhood: string | null;
    monthly_rent: number;
    main_image: string | null;
  };
  agency?: Agency;
}

export interface CreateMandateParams {
  property_id: string;
  agency_id: string;
  start_date?: string;
  end_date?: string;
  commission_rate?: number;
  permissions?: Partial<MandatePermissions>;
  notes?: string;
}

const DEFAULT_PERMISSIONS: MandatePermissions = {
  can_view_properties: true,
  can_edit_properties: false,
  can_create_properties: false,
  can_delete_properties: false,
  can_view_applications: true,
  can_manage_applications: false,
  can_create_leases: false,
  can_view_financials: false,
  can_manage_maintenance: false,
  can_communicate_tenants: true,
  can_manage_documents: false,
};

export function useAgencyMandates() {
  const { user } = useAuth();
  const [mandates, setMandates] = useState<AgencyMandate[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [myAgency, setMyAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's agency if they are an agency
  const fetchMyAgency = useCallback(async () => {
    if (!user) return null;
    
    const { data, error: err } = await supabase
      .from('agencies')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (err) {
      console.error('Error fetching agency:', err);
      return null;
    }
    
    setMyAgency(data as Agency | null);
    return data as Agency | null;
  }, [user]);

  // Fetch all mandates (for owners and agencies)
  const fetchMandates = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: err } = await supabase
        .from('agency_mandates')
        .select(`
          *,
          property:properties(id, title, city, neighborhood, monthly_rent, main_image),
          agency:agencies(*)
        `)
        .order('created_at', { ascending: false });
      
      if (err) throw err;
      
      setMandates((data || []) as unknown as AgencyMandate[]);
    } catch (err) {
      console.error('Error fetching mandates:', err);
      setError('Erreur lors du chargement des mandats');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch all active agencies (for property owners to invite)
  const fetchAgencies = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('agencies')
      .select('*')
      .eq('status', 'active')
      .order('agency_name');
    
    if (err) {
      console.error('Error fetching agencies:', err);
      return;
    }
    
    setAgencies((data || []) as Agency[]);
  }, []);

  // Create a new mandate (owner invites agency)
  const createMandate = useCallback(async (params: CreateMandateParams): Promise<AgencyMandate | null> => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return null;
    }

    const permissions = { ...DEFAULT_PERMISSIONS, ...params.permissions };
    
    const { data, error: err } = await supabase
      .from('agency_mandates')
      .insert({
        property_id: params.property_id,
        agency_id: params.agency_id,
        owner_id: user.id,
        start_date: params.start_date || new Date().toISOString(),
        end_date: params.end_date || null,
        commission_rate: params.commission_rate || 10,
        notes: params.notes || null,
        status: 'pending',
        ...permissions,
      })
      .select(`
        *,
        property:properties(id, title, city, neighborhood, monthly_rent, main_image),
        agency:agencies(*)
      `)
      .single();
    
    if (err) {
      console.error('Error creating mandate:', err);
      toast.error('Erreur lors de la création du mandat');
      return null;
    }
    
    toast.success('Invitation envoyée à l\'agence');
    await fetchMandates();
    return data as unknown as AgencyMandate;
  }, [user, fetchMandates]);

  // Accept a mandate (agency)
  const acceptMandate = useCallback(async (mandateId: string): Promise<boolean> => {
    const { error: err } = await supabase
      .from('agency_mandates')
      .update({ 
        status: 'active',
        signed_at: new Date().toISOString()
      })
      .eq('id', mandateId);
    
    if (err) {
      console.error('Error accepting mandate:', err);
      toast.error('Erreur lors de l\'acceptation du mandat');
      return false;
    }
    
    toast.success('Mandat accepté');
    await fetchMandates();
    return true;
  }, [fetchMandates]);

  // Refuse a mandate (agency)
  const refuseMandate = useCallback(async (mandateId: string, reason?: string): Promise<boolean> => {
    const { error: err } = await supabase
      .from('agency_mandates')
      .update({ 
        status: 'cancelled',
        notes: reason || 'Mandat refusé par l\'agence'
      })
      .eq('id', mandateId);
    
    if (err) {
      console.error('Error refusing mandate:', err);
      toast.error('Erreur lors du refus du mandat');
      return false;
    }
    
    toast.success('Mandat refusé');
    await fetchMandates();
    return true;
  }, [fetchMandates]);

  // Terminate a mandate (owner or agency)
  const terminateMandate = useCallback(async (mandateId: string, reason?: string): Promise<boolean> => {
    const { error: err } = await supabase
      .from('agency_mandates')
      .update({ 
        status: 'cancelled',
        end_date: new Date().toISOString(),
        notes: reason || 'Mandat résilié'
      })
      .eq('id', mandateId);
    
    if (err) {
      console.error('Error terminating mandate:', err);
      toast.error('Erreur lors de la résiliation du mandat');
      return false;
    }
    
    toast.success('Mandat résilié');
    await fetchMandates();
    return true;
  }, [fetchMandates]);

  // Suspend a mandate (agency)
  const suspendMandate = useCallback(async (mandateId: string, reason?: string): Promise<boolean> => {
    const { error: err } = await supabase
      .from('agency_mandates')
      .update({ 
        status: 'suspended',
        notes: reason || 'Mandat suspendu temporairement'
      })
      .eq('id', mandateId);
    
    if (err) {
      console.error('Error suspending mandate:', err);
      toast.error('Erreur lors de la suspension du mandat');
      return false;
    }
    
    toast.success('Mandat suspendu');
    await fetchMandates();
    return true;
  }, [fetchMandates]);

  // Reactivate a suspended mandate
  const reactivateMandate = useCallback(async (mandateId: string): Promise<boolean> => {
    const { error: err } = await supabase
      .from('agency_mandates')
      .update({ 
        status: 'active',
        notes: null
      })
      .eq('id', mandateId);
    
    if (err) {
      console.error('Error reactivating mandate:', err);
      toast.error('Erreur lors de la réactivation du mandat');
      return false;
    }
    
    toast.success('Mandat réactivé');
    await fetchMandates();
    return true;
  }, [fetchMandates]);

  // Update mandate permissions (owner only)
  const updateMandatePermissions = useCallback(async (
    mandateId: string, 
    permissions: Partial<MandatePermissions>
  ): Promise<boolean> => {
    const { error: err } = await supabase
      .from('agency_mandates')
      .update(permissions)
      .eq('id', mandateId);
    
    if (err) {
      console.error('Error updating permissions:', err);
      toast.error('Erreur lors de la mise à jour des permissions');
      return false;
    }
    
    toast.success('Permissions mises à jour');
    await fetchMandates();
    return true;
  }, [fetchMandates]);

  // Update mandate commission rate
  const updateCommissionRate = useCallback(async (
    mandateId: string, 
    commissionRate: number
  ): Promise<boolean> => {
    const { error: err } = await supabase
      .from('agency_mandates')
      .update({ commission_rate: commissionRate })
      .eq('id', mandateId);
    
    if (err) {
      console.error('Error updating commission rate:', err);
      toast.error('Erreur lors de la mise à jour du taux');
      return false;
    }
    
    toast.success('Taux de commission mis à jour');
    await fetchMandates();
    return true;
  }, [fetchMandates]);

  // Initial load
  useEffect(() => {
    if (user) {
      Promise.all([fetchMandates(), fetchMyAgency(), fetchAgencies()]);
    }
  }, [user, fetchMandates, fetchMyAgency, fetchAgencies]);

  // Filter helpers
  const pendingMandates = mandates.filter(m => m.status === 'pending');
  const activeMandates = mandates.filter(m => m.status === 'active');
  const expiredMandates = mandates.filter(m => m.status === 'expired');
  const cancelledMandates = mandates.filter(m => m.status === 'cancelled');
  const suspendedMandates = mandates.filter(m => m.status === 'suspended');

  // Mandates where user is the owner
  const ownerMandates = mandates.filter(m => m.owner_id === user?.id);
  
  // Mandates where user is the agency
  const agencyMandates = mandates.filter(m => m.agency?.user_id === user?.id);

  return {
    // Data
    mandates,
    agencies,
    myAgency,
    loading,
    error,
    
    // Filtered data
    pendingMandates,
    activeMandates,
    expiredMandates,
    cancelledMandates,
    suspendedMandates,
    ownerMandates,
    agencyMandates,
    
    // Actions
    createMandate,
    acceptMandate,
    refuseMandate,
    terminateMandate,
    suspendMandate,
    reactivateMandate,
    updateMandatePermissions,
    updateCommissionRate,
    
    // Refresh
    refresh: fetchMandates,
    refreshAgencies: fetchAgencies,
  };
}

export default useAgencyMandates;
