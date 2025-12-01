import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';
import { envConfig } from '@/shared/config/env.config';
import { demoPropertyService } from '@/shared/services/demoDataService';
import SEOHead, { createOrganizationStructuredData, createWebsiteStructuredData } from '@/shared/components/SEOHead';

// New African Design Components
import HeroAfrican from '../components/HeroAfrican';
import StatsSection from '../components/StatsSection';
import FeaturedProperties from '../components/FeaturedProperties';
import HowItWorksSection from '../components/HowItWorksSection';
import TrustSection from '../components/TrustSection';
import CTASection from '../components/CTASection';

type Property = Database['public']['Tables']['properties']['Row'];

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    propertiesCount: 0,
    tenantsCount: 0,
    citiesCount: 0,
    contractsCount: 0
  });

  useEffect(() => {
    loadProperties();
    loadStats();
  }, []);

  const loadProperties = async () => {
    try {
      if (envConfig.isDemoMode) {
        const { data } = await demoPropertyService.getAll();
        setProperties((data?.slice(0, 6) || []) as unknown as Property[]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'disponible')
        .order('created_at', { ascending: false })
        .limit(6);

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
      if (envConfig.isDemoMode) {
        setStats({
          propertiesCount: 150,
          tenantsCount: 1350,
          citiesCount: 5,
          contractsCount: 47
        });
        return;
      }

      const [propertiesResult, profilesResult, citiesResult] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'disponible'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('city').not('city', 'is', null)
      ]);

      const uniqueCities = new Set(citiesResult.data?.map((p: { city: string | null }) => p.city).filter(Boolean));
      const realProperties = propertiesResult.count || 0;
      const realProfiles = profilesResult.count || 0;
      const realCities = uniqueCities.size;

      setStats({
        propertiesCount: Math.max(realProperties, 31),
        tenantsCount: Math.max(realProfiles, 1350),
        citiesCount: Math.max(realCities, 3),
        contractsCount: Math.floor(Math.max(realProperties, 31) * 0.3)
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({ propertiesCount: 31, tenantsCount: 1350, citiesCount: 3, contractsCount: 47 });
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
    <div className="min-h-screen bg-[var(--sand-50)]">
      <SEOHead
        title="Mon Toit - Trouvez Votre Logement Idéal en Côte d'Ivoire | Abidjan, Yamoussoukro"
        description="Plus de 1000 propriétés vérifiées en Côte d'Ivoire. Appartements, villas, studios à Abidjan. Plateforme certifiée ANSUT avec paiement Mobile Money."
        keywords="location Abidjan, appartement Cocody, villa Plateau, immobilier Côte d'Ivoire"
        structuredData={structuredData}
      />

      <HeroAfrican onSearch={handleSearch} />
      <StatsSection stats={stats} />
      <FeaturedProperties properties={properties} loading={loading} />
      <HowItWorksSection />
      <TrustSection />
      <CTASection />
    </div>
  );
}