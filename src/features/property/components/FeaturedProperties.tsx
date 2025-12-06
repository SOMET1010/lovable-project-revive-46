import { MapPin, ArrowRight, Bed, Bath, Maximize, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScoreBadge } from '@/shared/ui/ScoreBadge';
import type { PropertyWithOwnerScore } from '../types';

interface FeaturedPropertiesProps {
  properties: PropertyWithOwnerScore[];
  loading: boolean;
}

function PropertyCard({ property }: { property: PropertyWithOwnerScore }) {
  return (
    <Link
      to={`/proprietes/${property.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'}
          alt={property.title || 'Propriété'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <span className="px-3 py-1.5 bg-[var(--terracotta-500)] text-white text-xs font-bold rounded-full uppercase tracking-wide">
            {property.property_type || 'Appartement'}
          </span>
          <button 
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all"
            onClick={(e) => {
              e.preventDefault();
              // Handle favorite
            }}
          >
            <Heart className="h-5 w-5 text-[var(--earth-700)]" />
          </button>
        </div>
        
        {/* Price Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2">
            <span className="text-h3 font-bold text-[var(--terracotta-600)]">
              {property.monthly_rent?.toLocaleString() || 'N/A'}
            </span>
            <span className="text-sm text-[var(--earth-700)] ml-1">FCFA/mois</span>
          </div>
        </div>

        {/* Trust Score Badge */}
        {property.owner_trust_score != null && (
          <div className="absolute bottom-4 right-4">
            <ScoreBadge 
              score={property.owner_trust_score} 
              variant="compact" 
              size="sm" 
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-h4 font-semibold text-[var(--earth-900)] mb-3 group-hover:text-[var(--terracotta-500)] transition-colors line-clamp-1">
          {property.title || 'Belle propriété à louer'}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-2 text-[var(--earth-700)] mb-4">
          <MapPin className="h-4 w-4 text-[var(--terracotta-500)]" />
          <span className="text-sm">
            {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city || 'Abidjan'}
          </span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-[var(--earth-700)] pt-4 border-t border-[var(--sand-200)]">
          {property.bedrooms && (
            <div className="flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-[var(--terracotta-400)]" />
              <span>{property.bedrooms} ch.</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-[var(--terracotta-400)]" />
              <span>{property.bathrooms} sdb</span>
            </div>
          )}
          {property.surface_area && (
            <div className="flex items-center gap-1.5">
              <Maximize className="h-4 w-4 text-[var(--terracotta-400)]" />
              <span>{property.surface_area} m²</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function PropertySkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
      <div className="h-64 bg-[var(--sand-200)]" />
      <div className="p-6">
        <div className="h-6 bg-[var(--sand-200)] rounded-lg mb-3 w-3/4" />
        <div className="h-4 bg-[var(--sand-200)] rounded mb-4 w-1/2" />
        <div className="pt-4 border-t border-[var(--sand-200)]">
          <div className="h-4 bg-[var(--sand-200)] rounded w-full" />
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProperties({ properties, loading }: FeaturedPropertiesProps) {
  // Limit to 4 properties for cleaner homepage
  const displayProperties = properties.slice(0, 4);
  
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="inline-block px-4 py-2 rounded-full bg-[var(--terracotta-100)] text-[var(--terracotta-600)] text-sm font-semibold mb-4">
              Nouvelles Annonces
            </span>
            <h2 className="text-h1 font-display text-[var(--earth-900)] mb-3">
              Propriétés à découvrir
            </h2>
            <p className="text-body-lg text-[var(--earth-700)] max-w-xl">
              Les dernières annonces vérifiées et prêtes à vous accueillir
            </p>
          </div>
          
          <Link
            to="/recherche"
            className="group inline-flex items-center gap-2 text-[var(--terracotta-600)] font-semibold hover:text-[var(--terracotta-700)] transition-colors"
          >
            <span>Voir toutes les propriétés</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Properties Grid - Limited to 4 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <PropertySkeleton key={i} />
            ))}
          </div>
        ) : displayProperties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Aucune propriété disponible</h3>
            <p className="text-muted-foreground">De nouvelles annonces arrivent bientôt</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* CTA Button Mobile */}
        <div className="mt-12 text-center md:hidden">
          <Link
            to="/recherche"
            className="btn-primary inline-flex items-center gap-2"
          >
            <span>Toutes les propriétés</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}