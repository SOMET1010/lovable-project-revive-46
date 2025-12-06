/**
 * Service de gestion des candidatures pour les propriétaires
 */

import { supabase } from '@/integrations/supabase/client';

export interface ApplicationFilters {
  status?: string;
  propertyId?: string;
  searchTerm?: string;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  inProgress: number;
  accepted: number;
  rejected: number;
}

export interface ApplicationWithDetails {
  id: string;
  property_id: string;
  applicant_id: string;
  status: string;
  cover_letter: string | null;
  application_score: number | null;
  created_at: string | null;
  updated_at: string | null;
  property: {
    id: string;
    title: string;
    city: string;
    neighborhood: string | null;
    monthly_rent: number;
    main_image: string | null;
  } | null;
  applicant: {
    user_id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
    trust_score: number | null;
    is_verified: boolean | null;
    oneci_verified: boolean | null;
    cnam_verified: boolean | null;
  } | null;
}

/**
 * Récupère toutes les candidatures des propriétés d'un propriétaire
 */
export async function getOwnerApplications(
  ownerId: string,
  filters?: ApplicationFilters
): Promise<ApplicationWithDetails[]> {
  // D'abord, récupérer les IDs des propriétés du propriétaire
  const { data: properties } = await supabase
    .from('properties')
    .select('id')
    .eq('owner_id', ownerId);

  if (!properties || properties.length === 0) {
    return [];
  }

  const propertyIds = properties.map(p => p.id);

  // Construire la requête de base
  let query = supabase
    .from('rental_applications')
    .select(`
      id,
      property_id,
      applicant_id,
      status,
      cover_letter,
      application_score,
      created_at,
      updated_at
    `)
    .in('property_id', propertyIds)
    .order('created_at', { ascending: false });

  // Appliquer les filtres
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.propertyId && filters.propertyId !== 'all') {
    query = query.eq('property_id', filters.propertyId);
  }

  const { data: applications, error } = await query;

  if (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }

  if (!applications || applications.length === 0) {
    return [];
  }

  // Récupérer les détails des propriétés
  const uniquePropertyIds = [...new Set(applications.map(a => a.property_id))];
  const { data: propertiesData } = await supabase
    .from('properties')
    .select('id, title, city, neighborhood, monthly_rent, main_image')
    .in('id', uniquePropertyIds);

  const propertiesMap = new Map(propertiesData?.map(p => [p.id, p]) || []);

  // Récupérer les profils des candidats via RPC
  const applicantIds = [...new Set(applications.map(a => a.applicant_id))];
  const { data: profilesData } = await supabase
    .rpc('get_public_profiles', { profile_user_ids: applicantIds });

  // Récupérer les emails depuis profiles
  const { data: fullProfiles } = await supabase
    .from('profiles')
    .select('user_id, email, phone')
    .in('user_id', applicantIds);

  const profilesMap = new Map(
    (profilesData || []).map((p: { user_id: string; full_name: string; avatar_url: string; trust_score: number; is_verified: boolean; oneci_verified: boolean; cnam_verified: boolean }) => [p.user_id, p])
  );
  const emailsMap = new Map(fullProfiles?.map(p => [p.user_id, { email: p.email, phone: p.phone }]) || []);

  // Combiner les données
  let result: ApplicationWithDetails[] = applications
    .filter(app => app.status !== null) // Filter out null status
    .map(app => {
      const profile = profilesMap.get(app.applicant_id);
      const emailData = emailsMap.get(app.applicant_id);
      
      return {
        ...app,
        status: app.status as string,
        property: propertiesMap.get(app.property_id) || null,
        applicant: profile ? {
          user_id: profile.user_id,
          full_name: profile.full_name,
          email: emailData?.email || null,
          phone: emailData?.phone || null,
          avatar_url: profile.avatar_url,
          trust_score: profile.trust_score,
          is_verified: profile.is_verified,
          oneci_verified: profile.oneci_verified,
          cnam_verified: profile.cnam_verified,
        } : null
      };
    });

  // Filtrer par terme de recherche si présent
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    result = result.filter(app => 
      app.applicant?.full_name?.toLowerCase().includes(term) ||
      app.applicant?.email?.toLowerCase().includes(term) ||
      app.property?.title?.toLowerCase().includes(term)
    );
  }

  return result;
}

/**
 * Récupère les statistiques des candidatures
 */
export async function getApplicationStats(ownerId: string): Promise<ApplicationStats> {
  const { data: properties } = await supabase
    .from('properties')
    .select('id')
    .eq('owner_id', ownerId);

  if (!properties || properties.length === 0) {
    return { total: 0, pending: 0, inProgress: 0, accepted: 0, rejected: 0 };
  }

  const propertyIds = properties.map(p => p.id);

  const { data: applications } = await supabase
    .from('rental_applications')
    .select('status')
    .in('property_id', propertyIds);

  if (!applications) {
    return { total: 0, pending: 0, inProgress: 0, accepted: 0, rejected: 0 };
  }

  return {
    total: applications.length,
    pending: applications.filter(a => a.status === 'en_attente').length,
    inProgress: applications.filter(a => a.status === 'en_cours').length,
    accepted: applications.filter(a => a.status === 'acceptee').length,
    rejected: applications.filter(a => a.status === 'refusee').length,
  };
}

/**
 * Accepter une candidature
 */
export async function acceptApplication(applicationId: string): Promise<void> {
  const { error } = await supabase
    .from('rental_applications')
    .update({ status: 'acceptee', updated_at: new Date().toISOString() })
    .eq('id', applicationId);

  if (error) {
    console.error('Error accepting application:', error);
    throw error;
  }

  // Envoyer notification
  await supabase.functions.invoke('send-lease-notifications', {
    body: {
      type: 'application_accepted',
      applicationId
    }
  });
}

/**
 * Refuser une candidature
 */
export async function rejectApplication(applicationId: string, _reason?: string): Promise<void> {
  const { error } = await supabase
    .from('rental_applications')
    .update({ 
      status: 'refusee', 
      updated_at: new Date().toISOString()
    })
    .eq('id', applicationId);

  if (error) {
    console.error('Error rejecting application:', error);
    throw error;
  }

  // Envoyer notification
  await supabase.functions.invoke('send-lease-notifications', {
    body: {
      type: 'application_rejected',
      applicationId
    }
  });
}

/**
 * Passer une candidature en cours (après planification de visite)
 */
export async function setApplicationInProgress(applicationId: string): Promise<void> {
  const { error } = await supabase
    .from('rental_applications')
    .update({ status: 'en_cours', updated_at: new Date().toISOString() })
    .eq('id', applicationId);

  if (error) {
    console.error('Error updating application:', error);
    throw error;
  }
}

/**
 * Rouvrir une candidature refusée
 */
export async function reopenApplication(applicationId: string): Promise<void> {
  const { error } = await supabase
    .from('rental_applications')
    .update({ status: 'en_attente', updated_at: new Date().toISOString() })
    .eq('id', applicationId);

  if (error) {
    console.error('Error reopening application:', error);
    throw error;
  }
}

/**
 * Planifier une visite depuis une candidature
 */
export async function scheduleVisitFromApplication(
  applicationId: string,
  visitData: {
    date: string;
    time: string;
    type: 'physique' | 'virtuelle';
    notes?: string;
  }
): Promise<void> {
  // Récupérer les détails de la candidature
  const { data: application, error: appError } = await supabase
    .from('rental_applications')
    .select('property_id, applicant_id')
    .eq('id', applicationId)
    .single();

  if (appError || !application) {
    throw new Error('Candidature non trouvée');
  }

  // Récupérer l'owner_id de la propriété
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('owner_id')
    .eq('id', application.property_id)
    .single();

  if (propError || !property) {
    throw new Error('Propriété non trouvée');
  }

  // Créer la visite
  const { error: visitError } = await supabase
    .from('visit_requests')
    .insert({
      property_id: application.property_id,
      tenant_id: application.applicant_id,
      owner_id: property.owner_id,
      visit_date: visitData.date,
      visit_time: visitData.time,
      visit_type: visitData.type,
      notes: visitData.notes,
      status: 'confirmee'
    });

  if (visitError) {
    console.error('Error creating visit:', visitError);
    throw visitError;
  }

  // Mettre à jour le statut de la candidature
  await setApplicationInProgress(applicationId);

  // Envoyer notification
  await supabase.functions.invoke('send-lease-notifications', {
    body: {
      type: 'visit_scheduled',
      applicationId,
      visitDate: visitData.date,
      visitTime: visitData.time
    }
  });
}

/**
 * Récupérer les propriétés d'un propriétaire (pour le filtre)
 */
export async function getOwnerProperties(ownerId: string): Promise<{ id: string; title: string }[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('id, title')
    .eq('owner_id', ownerId)
    .order('title');

  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }

  return data || [];
}
