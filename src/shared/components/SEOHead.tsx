import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
  noIndex?: boolean;
}

// Structured Data par défaut pour l'organisation Mon Toit
const DEFAULT_ORGANIZATION_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Mon Toit CI',
  alternateName: 'Mon Toit Côte d\'Ivoire',
  url: 'https://montoit.ci',
  logo: 'https://montoit.ci/logo-montoit.png',
  description: 'Plateforme officielle ANSUT de location immobilière en Côte d\'Ivoire. Vérification d\'identité et paiement Mobile Money sécurisé.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'CI',
    addressLocality: 'Abidjan'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@mon-toit.ci',
    contactType: 'Service client',
    areaServed: 'CI',
    availableLanguage: ['French']
  },
  sameAs: [
    'https://facebook.com/montoitci',
    'https://twitter.com/montoitci',
    'https://instagram.com/montoitci'
  ],
  foundingDate: '2024'
};

export default function SEOHead({
  title = 'Mon Toit CI - Location Appartements & Villas Abidjan | Certifié ANSUT',
  description = 'Trouvez votre logement idéal en Côte d\'Ivoire. +3000 annonces vérifiées à Abidjan. Paiement Mobile Money sécurisé. Plateforme certifiée ANSUT.',
  keywords = 'location appartement Abidjan, villa Côte d\'Ivoire, immobilier CI, Mon Toit, ANSUT, paiement mobile money, logement Cocody, studio Marcory, location sécurisée',
  image = 'https://montoit.ci/og-image.jpg',
  url = 'https://montoit.ci',
  type = 'website',
  structuredData,
  noIndex = false,
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title (max 60 caractères recommandé)
    document.title = title.length > 60 ? title.substring(0, 57) + '...' : title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description.substring(0, 155)); // Max 155 caractères
    updateMetaTag('keywords', keywords);
    
    // Robots
    if (noIndex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1');
    }

    // Open Graph meta tags
    updateMetaTag('og:title', title.substring(0, 60), true);
    updateMetaTag('og:description', description.substring(0, 155), true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Mon Toit CI', true);
    updateMetaTag('og:locale', 'fr_CI', true);

    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@montoitci');
    updateMetaTag('twitter:title', title.substring(0, 60));
    updateMetaTag('twitter:description', description.substring(0, 155));
    updateMetaTag('twitter:image', image);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', url);

    // Structured data - Combine organization data with page-specific data
    const combinedStructuredData = structuredData 
      ? [DEFAULT_ORGANIZATION_DATA, structuredData]
      : DEFAULT_ORGANIZATION_DATA;

    // Find or create structured data script
    let scriptElement = document.querySelector('script[data-seo-structured]');
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.setAttribute('type', 'application/ld+json');
      scriptElement.setAttribute('data-seo-structured', 'true');
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify(combinedStructuredData);

  }, [title, description, keywords, image, url, type, structuredData, noIndex]);

  return null;
}

// Helper function to create structured data for a property (Accommodation/Apartment)
export function createPropertyStructuredData(property: {
  id: string;
  title: string;
  description: string;
  monthly_rent: number;
  city: string;
  neighborhood: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  surface_area: number;
  images?: string[];
  main_image?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  created_at?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    name: property.title,
    description: property.description?.substring(0, 200),
    url: `https://montoit.ci/propriete/${property.id}`,
    image: property.images?.length ? property.images : [property.main_image].filter(Boolean),
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.neighborhood || property.city,
      addressRegion: property.city,
      addressCountry: 'CI',
    },
    geo: property.latitude && property.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: property.latitude,
      longitude: property.longitude,
    } : undefined,
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.surface_area,
      unitCode: 'MTK',
    },
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Chambres', value: property.bedrooms },
      { '@type': 'LocationFeatureSpecification', name: 'Salles de bain', value: property.bathrooms },
    ],
    offers: {
      '@type': 'Offer',
      price: property.monthly_rent,
      priceCurrency: 'XOF',
      availability: property.status === 'disponible' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      validFrom: property.created_at,
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  };
}

// Helper function to create structured data for the organization
export function createOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mon Toit',
    alternateName: 'Mon Toit CI',
    url: 'https://montoit.ci',
    logo: 'https://montoit.ci/logo-montoit.png',
    description: 'Plateforme immobilière pour un accès universel au logement en Côte d\'Ivoire. Vérification d\'identité et signature électronique sécurisée.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Abidjan',
      addressCountry: 'CI',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@mon-toit.ci',
      contactType: 'customer service',
      availableLanguage: ['French'],
    },
    sameAs: [
      'https://facebook.com/montoit',
      'https://twitter.com/montoit',
      'https://instagram.com/montoit',
    ],
  };
}

// Helper function to create structured data for the website
export function createWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mon Toit',
    url: 'https://montoit.ci',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://montoit.ci/recherche?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

// Helper function to create breadcrumb structured data
export function createBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Helper function to create FAQ structured data (for rich snippets)
export function createFAQStructuredData(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Helper function to create LocalBusiness structured data
export function createLocalBusinessStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Mon Toit CI',
    image: 'https://montoit.ci/logo-montoit.png',
    url: 'https://montoit.ci',
    telephone: '+225-XX-XX-XX-XX',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Abidjan',
      addressRegion: 'Lagunes',
      addressCountry: 'CI',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 5.3600,
      longitude: -4.0083,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
    priceRange: '50000-5000000 XOF',
    areaServed: {
      '@type': 'Country',
      name: 'Côte d\'Ivoire',
    },
  };
}
