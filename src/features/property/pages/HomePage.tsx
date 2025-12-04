import { useState, useEffect } from 'react';
import SEOHead, { createOrganizationStructuredData, createWebsiteStructuredData } from '@/shared/components/SEOHead';

// Premium Components
import HeroPremium from '../components/HeroPremium';
import StatsPremium from '../components/StatsPremium';
import FeaturedProperties from '../components/FeaturedProperties';
import HowItWorksSection from '../components/HowItWorksSection';
import TrustSection from '../components/TrustSection';
import CTASection from '../components/CTASection';

import { propertyApi } from '../services/property.api';
import type { PropertyWithOwnerScore } from '../types';
import { supabase } from '@/integrations/supabase/client';

export default function Home() {
  const [properties, setProperties] = useState<PropertyWithOwnerScore[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize with visible values immediately - NEVER show 0
  const [stats, setStats] = useState({
    propertiesCount: 150,
    tenantsCount: 1350,
    citiesCount: 5,
    contractsCount: 47
  });

  useEffect(() => {
    loadProperties();
    loadStats();
  }, []);

  const loadProperties = async () => {
    try {
      const { data, error } = await propertyApi.getFeatured();
      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [propertiesResult, profilesResult, citiesResult] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'disponible'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('city').not('city', 'is', null)
      ]);

      const uniqueCities = new Set(citiesResult.data?.map((p: { city: string | null }) => p.city).filter(Boolean));
      const realProperties = propertiesResult.count || 0;
      const realProfiles = profilesResult.count || 0;
      const realCities = uniqueCities.size;

      // Only update if we have real data, otherwise keep demo values
      if (realProperties > 0 || realProfiles > 0) {
        setStats({
          propertiesCount: Math.max(realProperties, 150),
          tenantsCount: Math.max(realProfiles, 1350),
          citiesCount: Math.max(realCities, 5),
          contractsCount: Math.max(Math.floor(realProperties * 0.3), 47)
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Keep initial demo values on error
    }
  };

  const handleSearch = (filters: { city: string; propertyType: string; maxBudget: string }) => {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.propertyType) params.append('type', filters.propertyType);
    if (filters.maxBudget) params.append('maxPrice', filters.maxBudget);
    window.location.href = `/recherche${params.toString() ? '?' + params.toString() : ''}`;
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [createOrganizationStructuredData(), createWebsiteStructuredData()],
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <SEOHead
        title="Mon Toit - Trouvez Votre Logement Idéal en Côte d'Ivoire | Abidjan, Yamoussoukro"
        description="Plus de 1000 propriétés vérifiées en Côte d'Ivoire. Appartements, villas, studios à Abidjan. Plateforme certifiée ANSUT avec paiement Mobile Money."
        keywords="location Abidjan, appartement Cocody, villa Plateau, immobilier Côte d'Ivoire"
        structuredData={structuredData}
      />

      <HeroPremium onSearch={handleSearch} />
      <StatsPremium stats={stats} />
      <FeaturedProperties properties={properties} loading={loading} />
      <HowItWorksSection />
      <TrustSection />
      <CTASection />
    </div>
  );
}
