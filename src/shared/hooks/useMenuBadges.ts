/**
 * useMenuBadges - Centralized hook for real-time menu badge counts
 * Provides counters for messages, applications, contracts, and maintenance
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';

export interface MenuBadges {
  // Tenant badges
  unreadMessages: number;
  pendingApplications: number;      // Applications en attente de réponse
  contractsToSign: number;          // Contrats à signer (locataire)
  
  // Owner badges
  receivedApplications: number;     // Candidatures reçues en attente
  ownerContractsToSign: number;     // Contrats en attente signature propriétaire
  pendingMaintenance: number;       // Demandes maintenance en attente
  
  // Agency badges
  pendingMandates: number;          // Mandats en attente de signature
  managedProperties: number;        // Propriétés gérées actives
  agencyApplications: number;       // Candidatures sur propriétés gérées
  
  isLoading: boolean;
  refetch: () => void;
}

export function useMenuBadges(): MenuBadges {
  const { user } = useAuth();
  const [badges, setBadges] = useState({
    unreadMessages: 0,
    pendingApplications: 0,
    contractsToSign: 0,
    receivedApplications: 0,
    ownerContractsToSign: 0,
    pendingMaintenance: 0,
    pendingMandates: 0,
    managedProperties: 0,
    agencyApplications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchBadges = useCallback(async () => {
    if (!user) {
      setBadges({
        unreadMessages: 0,
        pendingApplications: 0,
        contractsToSign: 0,
        receivedApplications: 0,
        ownerContractsToSign: 0,
        pendingMaintenance: 0,
        pendingMandates: 0,
        managedProperties: 0,
        agencyApplications: 0,
      });
      setIsLoading(false);
      return;
    }

    try {
      // Fetch all counts in parallel for performance
      const [
        messagesResult,
        applicationsResult,
        tenantContractsResult,
        receivedAppsResult,
        ownerContractsResult,
        maintenanceResult,
        pendingMandatesResult,
        managedPropertiesResult,
        agencyAppsResult,
      ] = await Promise.all([
        // Unread messages
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('is_read', false),
        
        // Pending applications (tenant)
        supabase
          .from('rental_applications')
          .select('id', { count: 'exact', head: true })
          .eq('applicant_id', user.id)
          .eq('status', 'en_attente'),
        
        // Contracts awaiting tenant signature
        supabase
          .from('lease_contracts')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', user.id)
          .is('tenant_signed_at', null)
          .in('status', ['en_attente', 'brouillon']),
        
        // Received applications (owner) - via properties
        supabase
          .from('rental_applications')
          .select('id, property:properties!inner(owner_id)', { count: 'exact', head: true })
          .eq('properties.owner_id', user.id)
          .eq('status', 'en_attente'),
        
        // Contracts awaiting owner signature
        supabase
          .from('lease_contracts')
          .select('id', { count: 'exact', head: true })
          .eq('owner_id', user.id)
          .is('landlord_signed_at', null)
          .in('status', ['en_attente', 'brouillon']),
        
        // Pending maintenance requests (owner)
        supabase
          .from('maintenance_requests')
          .select('id, contract:lease_contracts!inner(owner_id)', { count: 'exact', head: true })
          .eq('lease_contracts.owner_id', user.id)
          .eq('status', 'ouverte'),
        
        // Agency: Pending mandates awaiting signature
        supabase
          .from('agency_mandates')
          .select('id, agency:agencies!inner(user_id)', { count: 'exact', head: true })
          .eq('agencies.user_id', user.id)
          .eq('status', 'pending'),
        
        // Agency: Managed properties count (active mandates)
        supabase
          .from('agency_mandates')
          .select('id, agency:agencies!inner(user_id)', { count: 'exact', head: true })
          .eq('agencies.user_id', user.id)
          .eq('status', 'active')
          .not('property_id', 'is', null),
        
        // Agency: Applications on managed properties
        supabase
          .from('rental_applications')
          .select(`
            id,
            property:properties!inner(
              id,
              mandate:agency_mandates!inner(
                agency:agencies!inner(user_id)
              )
            )
          `, { count: 'exact', head: true })
          .eq('properties.agency_mandates.agencies.user_id', user.id)
          .eq('status', 'en_attente'),
      ]);

      setBadges({
        unreadMessages: messagesResult.count ?? 0,
        pendingApplications: applicationsResult.count ?? 0,
        contractsToSign: tenantContractsResult.count ?? 0,
        receivedApplications: receivedAppsResult.count ?? 0,
        ownerContractsToSign: ownerContractsResult.count ?? 0,
        pendingMaintenance: maintenanceResult.count ?? 0,
        pendingMandates: pendingMandatesResult.count ?? 0,
        managedProperties: managedPropertiesResult.count ?? 0,
        agencyApplications: agencyAppsResult.count ?? 0,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching menu badges:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to messages changes
    const messagesChannel = supabase
      .channel('menu-badges-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => fetchBadges()
      )
      .subscribe();

    // Subscribe to applications changes
    const applicationsChannel = supabase
      .channel('menu-badges-applications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rental_applications',
        },
        () => fetchBadges()
      )
      .subscribe();

    // Subscribe to contracts changes
    const contractsChannel = supabase
      .channel('menu-badges-contracts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lease_contracts',
        },
        () => fetchBadges()
      )
      .subscribe();

    // Subscribe to maintenance changes
    const maintenanceChannel = supabase
      .channel('menu-badges-maintenance')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests',
        },
        () => fetchBadges()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(applicationsChannel);
      supabase.removeChannel(contractsChannel);
      supabase.removeChannel(maintenanceChannel);
    };
  }, [user, fetchBadges]);

  return {
    ...badges,
    isLoading,
    refetch: fetchBadges,
  };
}

export default useMenuBadges;
