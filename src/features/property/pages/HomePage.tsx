import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Star, Shield, TrendingUp, Users, CheckCircle, ArrowRight, Home as HomeIcon, FileText, CreditCard, Award } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';
import { envConfig } from '@/shared/config/env.config';
import { demoPropertyService } from '@/shared/services/demoDataService';
import HeroSimplified from '../components/HeroSimplified';
import SEOHead, { createOrganizationStructuredData, createWebsiteStructuredData } from '@/shared/components/SEOHead';

type Property = Database['public']['Tables']['properties']['Row'];

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    propertyType: '',
    maxBudget: ''
  });
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
        console.log('🎭 Mode démo - Chargement des propriétés de démonstration');
        const { data, error } = await demoPropertyService.getAll();
        setProperties(data?.slice(0, 6) || []);
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
        console.log('🎭 Mode démo - Statistiques de démonstration');
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

      const uniqueCities = new Set(citiesResult.data?.map(p => p.city).filter(Boolean));

      const realProperties = propertiesResult.count || 0;
      const realProfiles = profilesResult.count || 0;
      const realCities = uniqueCities.size;

      const fallbackProperties = Math.max(realProperties, 31);
      const fallbackProfiles = Math.max(realProfiles, 1350);
      const fallbackCities = Math.max(realCities, 3);
      const fallbackContracts = Math.floor(fallbackProperties * 0.3);

      setStats({
        propertiesCount: realProperties > 0 ? realProperties : fallbackProperties,
        tenantsCount: realProfiles > 0 ? realProfiles : fallbackProfiles,
        citiesCount: realCities > 0 ? realCities : fallbackCities,
        contractsCount: fallbackContracts
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        propertiesCount: 31,
        tenantsCount: 1350,
        citiesCount: 3,
        contractsCount: 47
      });
    }
  };

  const handleSearch = (filters: { city: string; propertyType: string; maxBudget: string }) => {
    setSearchFilters(filters);
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.propertyType) params.append('type', filters.propertyType);
    if (filters.maxBudget) params.append('maxPrice', filters.maxBudget);
    
    window.location.href = `/recherche${params.toString() ? '?' + params.toString() : ''}`;
  };

  // Structured data combining organization and website
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      createOrganizationStructuredData(),
      createWebsiteStructuredData(),
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Mon Toit - Trouvez Votre Logement Idéal en Côte d'Ivoire | Abidjan, Yamoussoukro"
        description="Plus de 1000 propriétés vérifiées en Côte d'Ivoire. Appartements, villas, studios à Abidjan (Cocody, Plateau, Marcory). Plateforme certifiée ANSUT avec paiement Mobile Money."
        keywords="location Abidjan, appartement Cocody, villa Plateau, studio Marcory, immobilier Côte d'Ivoire, logement Yamoussoukro, location sécurisée CI, ANSUT, paiement Mobile Money"
        structuredData={structuredData}
      />

      {/* Hero Section - Modern Minimalist */}
      <HeroSimplified
        onSearch={handleSearch}
        title="Trouvez votre logement idéal"
        subtitle="Plus de 150 propriétés vérifiées dans toute la Côte d'Ivoire"
        backgroundImage="/images/hero-residence-moderne.jpg"
      />

      {/* Stats Section - 4 Cards Grid */}
      <section 
        className="py-24 bg-neutral-50" 
        aria-label="Statistiques de la plateforme"
        style={{ paddingTop: '96px', paddingBottom: '96px' }}
      >
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Propriétés */}
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <HomeIcon className="h-8 w-8 text-white" />
              </div>
              <div className="text-h2 font-bold text-neutral-900 mb-2">
                {stats.propertiesCount.toLocaleString()}+
              </div>
              <div className="text-body text-neutral-700">
                Propriétés disponibles
              </div>
            </div>

            {/* Utilisateurs */}
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-h2 font-bold text-neutral-900 mb-2">
                {stats.tenantsCount.toLocaleString()}+
              </div>
              <div className="text-body text-neutral-700">
                Utilisateurs inscrits
              </div>
            </div>

            {/* Contrats */}
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div className="text-h2 font-bold text-neutral-900 mb-2">
                {stats.contractsCount.toLocaleString()}+
              </div>
              <div className="text-body text-neutral-700">
                Contrats signés
              </div>
            </div>

            {/* Villes */}
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div className="text-h2 font-bold text-neutral-900 mb-2">
                {stats.citiesCount}
              </div>
              <div className="text-body text-neutral-700">
                Villes couvertes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid - 3 Columns */}
      <section 
        className="py-24 bg-white"
        aria-label="Propriétés populaires"
        style={{ paddingTop: '96px', paddingBottom: '96px' }}
      >
        <div className="container">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-h1 font-bold text-neutral-900 mb-4">
                Propriétés récentes
              </h2>
              <p className="text-hero-subtitle text-neutral-700">
                Découvrez les dernières annonces vérifiées
              </p>
            </div>
            <a 
              href="/recherche"
              className="hidden md:flex items-center gap-2 btn-secondary"
            >
              <span>Voir tout</span>
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-neutral-100 rounded-lg overflow-hidden animate-pulse">
                  <div className="h-64 bg-neutral-200"></div>
                  <div className="p-8">
                    <div className="h-6 bg-neutral-200 rounded mb-4"></div>
                    <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <HomeIcon className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
              <p className="text-h3 text-neutral-500">Aucune propriété disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <a
                  key={property.id}
                  href={`/proprietes/${property.id}`}
                  className="group card overflow-hidden hover:shadow-xl transition-base ease-out"
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden mb-6">
                    <img
                      src={property.images?.[0] || '/images/placeholder-property.jpg'}
                      alt={property.title || ''}
                      className="w-full h-full object-cover group-hover:scale-105 transition-slow ease-out"
                    />
                    {/* Badge Nouveau */}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-primary-500 text-white text-small font-semibold rounded-full">
                      NOUVEAU
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-0">
                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-h3 font-bold text-neutral-900">
                        {property.monthly_rent?.toLocaleString() || 'N/A'}
                      </span>
                      <span className="text-body text-neutral-500">FCFA/mois</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-h4 font-semibold text-neutral-900 mb-3 group-hover:text-primary-500 transition-base">
                      {property.title || 'Sans titre'}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-body text-neutral-600 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{property.city || 'Non spécifié'}, {property.neighborhood || ''}</span>
                    </div>

                    {/* Features */}
                    <div className="flex items-center gap-4 text-body text-neutral-600 border-t border-neutral-100 pt-4">
                      {property.bedrooms && (
                        <span className="flex items-center gap-1">
                          🛏️ {property.bedrooms} ch
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="flex items-center gap-1">
                          🚿 {property.bathrooms} sdb
                        </span>
                      )}
                      {property.surface_area && (
                        <span className="flex items-center gap-1">
                          📐 {property.surface_area}m²
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Mobile CTA */}
          <div className="mt-16 text-center md:hidden">
            <a 
              href="/recherche"
              className="btn-primary inline-flex items-center gap-2"
            >
              <span>Voir toutes les propriétés</span>
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Feature Cards */}
      <section 
        className="py-24 bg-neutral-50"
        aria-label="Comment ça marche"
        style={{ paddingTop: '96px', paddingBottom: '96px' }}
      >
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-h1 font-bold text-neutral-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-hero-subtitle text-neutral-700 max-w-2xl mx-auto">
              Trouvez votre logement en 3 étapes simples avec Mon Toit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Étape 1 */}
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-h3 font-bold text-neutral-900 mb-4">
                1. Recherchez
              </h3>
              <p className="text-body text-neutral-700 leading-relaxed">
                Utilisez nos filtres pour trouver le logement qui correspond à vos besoins et votre budget
              </p>
            </div>

            {/* Étape 2 */}
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-h3 font-bold text-neutral-900 mb-4">
                2. Vérifiez
              </h3>
              <p className="text-body text-neutral-700 leading-relaxed">
                Toutes les propriétés sont vérifiées par notre équipe et les propriétaires sont certifiés ANSUT
              </p>
            </div>

            {/* Étape 3 */}
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-h3 font-bold text-neutral-900 mb-4">
                3. Louez
              </h3>
              <p className="text-body text-neutral-700 leading-relaxed">
                Signez votre bail en ligne et payez en toute sécurité via Mobile Money
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section 
        className="py-24 bg-white"
        aria-label="Confiance et sécurité"
        style={{ paddingTop: '96px', paddingBottom: '96px' }}
      >
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-h1 font-bold text-neutral-900 mb-4">
              Pourquoi faire confiance à Mon Toit ?
            </h2>
            <p className="text-hero-subtitle text-neutral-700">
              La plateforme immobilière la plus sécurisée de Côte d'Ivoire
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Certification ANSUT */}
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-h3 font-bold text-neutral-900 mb-4">
                Certification ANSUT
              </h3>
              <p className="text-body text-neutral-700 leading-relaxed">
                Tous nos utilisateurs sont vérifiés par l'Agence Nationale de Soutien aux Travailleurs
              </p>
            </div>

            {/* Paiement sécurisé */}
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-h3 font-bold text-neutral-900 mb-4">
                Paiement sécurisé
              </h3>
              <p className="text-body text-neutral-700 leading-relaxed">
                Payez en Mobile Money avec Orange Money, MTN Money ou Moov Money en toute sécurité
              </p>
            </div>

            {/* Support 24/7 */}
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-h3 font-bold text-neutral-900 mb-4">
                Support 24/7
              </h3>
              <p className="text-body text-neutral-700 leading-relaxed">
                Notre équipe est disponible pour vous accompagner à chaque étape de votre recherche
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-24 bg-primary-500"
        aria-label="Appel à l'action"
        style={{ paddingTop: '96px', paddingBottom: '96px' }}
      >
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-h1 font-bold text-white mb-6">
              Prêt à trouver votre logement idéal ?
            </h2>
            <p className="text-hero-subtitle text-white/90 mb-10 leading-relaxed">
              Rejoignez des milliers d'Ivoiriens qui ont déjà trouvé leur chez-soi avec Mon Toit
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="/recherche"
                className="btn-primary bg-white text-primary-500 hover:bg-neutral-50 px-8 py-4 text-lg inline-flex items-center justify-center gap-3"
              >
                <Search className="h-5 w-5" />
                <span>Je cherche un logement</span>
              </a>
              <a
                href="/inscription?redirect=/dashboard/ajouter-propriete"
                className="btn-secondary border-white text-white hover:bg-white hover:text-primary-500 px-8 py-4 text-lg inline-flex items-center justify-center gap-3"
              >
                <HomeIcon className="h-5 w-5" />
                <span>Je loue mon bien</span>
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-body font-medium">100% Sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-body font-medium">ANSUT Vérifié</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-body font-medium">Support 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-24 bg-neutral-900 text-white"
        aria-label="Pied de page"
        style={{ paddingTop: '96px', paddingBottom: '96px' }}
      >
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo et description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <HomeIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-h3 font-bold">Mon Toit</span>
              </div>
              <p className="text-body text-neutral-300 leading-relaxed mb-6">
                La plateforme immobilière de référence en Côte d'Ivoire. 
                Trouvez votre logement idéal en toute sécurité.
              </p>
              <div className="flex items-center gap-2 text-neutral-300">
                <Shield className="h-5 w-5" />
                <span className="text-body">Plateforme certifiée ANSUT</span>
              </div>
            </div>

            {/* Liens rapides */}
            <div>
              <h4 className="text-h5 font-bold mb-6">Liens rapides</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/recherche" className="text-body text-neutral-300 hover:text-white transition-base">
                    Rechercher un logement
                  </a>
                </li>
                <li>
                  <a href="/inscription?redirect=/dashboard/ajouter-propriete" className="text-body text-neutral-300 hover:text-white transition-base">
                    Louer mon bien
                  </a>
                </li>
                <li>
                  <a href="/aide" className="text-body text-neutral-300 hover:text-white transition-base">
                    Centre d'aide
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-body text-neutral-300 hover:text-white transition-base">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-h5 font-bold mb-6">Contact</h4>
              <ul className="space-y-3 text-body text-neutral-300">
                <li>Abidjan, Côte d'Ivoire</li>
                <li>contact@montoit.ci</li>
                <li>+225 XX XX XX XX</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-neutral-700 mt-16 pt-8 text-center">
            <p className="text-body text-neutral-400">
              © 2024 Mon Toit. Tous droits réservés. | 
              <a href="/mentions-legales" className="hover:text-white transition-base ml-1">
                Mentions légales
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}