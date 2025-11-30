import { Home as HomeIcon, Star } from 'lucide-react';
import { FormatService } from '@/services/format/formatService';
import type { Database } from '@/shared/lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

interface PropertyCardProps {
  property: Property;
  showBadge?: boolean;
  badgeText?: string;
}

export default function PropertyCard({ property, showBadge, badgeText }: PropertyCardProps) {
  return (
    <a
      href={`/propriete/${property.id}`}
      className="group block w-full sm:w-80 flex-shrink-0 card-premium hover-lift touch-manipulation"
      style={{ minHeight: '44px' }}
      role="article"
      aria-label={`Voir les détails de ${property.title} à ${property.city}, ${property.neighborhood}`}
    >
      {/* Image */}
      <div className="relative h-64 sm:h-72 bg-gray-200 rounded-xl overflow-hidden mb-3 image-zoom shadow-premium group-hover:shadow-premium-hover transition-shadow duration-300">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={`${property.title} - ${property.city}, ${property.neighborhood}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            width="320"
            height="288"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <HomeIcon className="h-16 w-16 text-gray-300" />
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 glass rounded-lg text-sm font-semibold text-gray-900 shadow-premium">
          {FormatService.formatPrice(property.monthly_rent)}
        </div>

        {/* Optional Badge (Nouveau, etc.) */}
        {showBadge && badgeText && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold shadow-premium badge-pulse">
            {badgeText}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-1">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate flex-1">
            {property.city}, {property.neighborhood}
          </h3>
          {property.rating && (
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current text-gray-800" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">{property.rating}</span>
            </div>
          )}
        </div>

        <p className="text-gray-700 text-xs sm:text-sm truncate mb-1">
          {property.title}
        </p>

        <div className="text-neutral-600 text-xs sm:text-sm flex items-center gap-3">
          {/* Chambres - TOUJOURS afficher */}
          <span className="flex items-center gap-1">
            <span className="text-primary-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9.5C3 8.12 4.12 7 5.5 7h13c1.38 0 2.5 1.12 2.5 2.5v7.5c0 .83-.67 1.5-1.5 1.5H17v-5H7v5H4.5A1.5 1.5 0 0 1 3 17z"/>
                <path d="M7 17V7h10v10"/>
              </svg>
            </span>
            <span className="font-medium">{property.bedrooms ? `${property.bedrooms} ch.` : '-'}</span>
          </span>
          
          {/* Salles de bain - TOUJOURS afficher */}
          <span className="flex items-center gap-1">
            <span className="text-primary-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 6h6l1 9h3a3 3 0 0 1 0 6h-1a2 2 0 0 1-2-2"/>
                <path d="M5 6v9c0 1.66 1.34 3 3 3h8"/>
              </svg>
            </span>
            <span className="font-medium">{property.bathrooms ? `${property.bathrooms} sdb.` : '-'}</span>
          </span>
          
          {/* Superficie - TOUJOURS afficher en m² */}
          <span className="flex items-center gap-1">
            <span className="text-primary-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 9h6v6H9z"/>
              </svg>
            </span>
            <span className="font-medium">{property.surface_area ? `${property.surface_area} m²` : '-'}</span>
          </span>
        </div>
      </div>
    </a>
  );
}
