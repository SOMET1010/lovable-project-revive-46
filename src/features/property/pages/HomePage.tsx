import SEOHead, { createOrganizationStructuredData, createWebsiteStructuredData } from '@/shared/components/SEOHead';

import HeroPremium from '../components/HeroPremium';
import FeaturedProperties from '../components/FeaturedProperties';
import HowItWorksCompact from '../components/HowItWorksCompact';
import CTASection from '../components/CTASection';

import { useState, useEffect } from 'react';
import { propertyApi } from '../services/property.api';
import type { PropertyWithOwnerScore } from '../types';

export default function Home() {
  const [properties, setProperties] = useState<PropertyWithOwnerScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const { data, error } = await propertyApi.getFeatured();
      if (error) throw error;
      // Limit to 4 properties for cleaner homepage
      setProperties((data || []).slice(0, 4));
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Mon Toit - Trouvez Votre Logement Idéal en Côte d'Ivoire | Abidjan, Yamoussoukro"
        description="Plus de 1000 propriétés vérifiées en Côte d'Ivoire. Appartements, villas, studios à Abidjan. Plateforme certifiée ANSUT avec paiement Mobile Money."
        keywords="location Abidjan, appartement Cocody, villa Plateau, immobilier Côte d'Ivoire"
        structuredData={structuredData}
      />

      <HeroPremium onSearch={handleSearch} />
      <HowItWorksCompact />
      <FeaturedProperties properties={properties} loading={loading} />
      <CTASection />
    </div>
  );
}
