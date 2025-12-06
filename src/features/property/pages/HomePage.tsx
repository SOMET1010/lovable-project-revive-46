import SEOHead, { createOrganizationStructuredData, createWebsiteStructuredData } from '@/shared/components/SEOHead';
import { useNavigate } from 'react-router-dom';

import HeroPremium from '../components/HeroPremium';
import FeaturedProperties from '../components/FeaturedProperties';
import HowItWorksSection from '../components/HowItWorksSection';
import TestimonialsSection from '../components/TestimonialsSection';
import CTASection from '../components/CTASection';

import { useState, useEffect, useCallback } from 'react';
import { propertyApi } from '../services/property.api';
import type { PropertyWithOwnerScore } from '../types';

export default function Home() {
  const navigate = useNavigate();
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

  const handleSearch = useCallback((filters: { city: string; propertyType: string; maxBudget: string }) => {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.propertyType) params.append('type', filters.propertyType);
    if (filters.maxBudget) params.append('maxPrice', filters.maxBudget);
    navigate(`/recherche${params.toString() ? '?' + params.toString() : ''}`);
  }, [navigate]);

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
      <HowItWorksSection />
      <FeaturedProperties properties={properties} loading={loading} />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
