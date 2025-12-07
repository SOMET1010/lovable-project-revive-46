import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize } from 'lucide-react';
import { FormatService } from '@/services/format/formatService';
import { OwnerBadge } from '@/shared/ui';
import type { Database } from '@/shared/lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

const FALLBACK_IMAGE = '/images/hero-villa-cocody.jpg';

function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  const target = e.target as HTMLImageElement;
  if (target.src !== FALLBACK_IMAGE) {
    target.src = FALLBACK_IMAGE;
  }
}

interface PropertyCardProps {
  property: Property;
  showBadge?: boolean;
  badgeText?: string;
  ownerTrustScore?: number | null;
  ownerName?: string | null;
  ownerAvatarUrl?: string | null;
  ownerIsVerified?: boolean;
}

export default function PropertyCard({
  property,
  showBadge,
  badgeText,
  ownerTrustScore,
  ownerName,
  ownerAvatarUrl,
  ownerIsVerified,
}: PropertyCardProps) {
  const imageUrl = property.images?.[0] || FALLBACK_IMAGE;

  return (
    <Link
      to={`/propriete/${property.id}`}
      className="group block w-full sm:w-80 flex-shrink-0 premium-card card-hover-premium overflow-hidden"
      role="article"
      aria-label={`Voir les détails de ${property.title} à ${property.city}, ${property.neighborhood}`}
    >
      {/* Image Container - 60%+ de la carte */}
      <div className="relative h-72 sm:h-80 bg-[var(--color-creme)] overflow-hidden">
        <img
          src={imageUrl}
          alt={`${property.title} - ${property.city}, ${property.neighborhood}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          width="320"
          height="320"
          onError={handleImageError}
        />

        {/* Prix en Overlay - Bottom Left */}
        <div className="absolute bottom-3 left-3 px-4 py-2 bg-[var(--color-chocolat)]/90 backdrop-blur-sm rounded-xl text-white shadow-lg">
          <span className="text-lg font-bold">{FormatService.formatCurrency(property.monthly_rent)}</span>
          <span className="text-xs opacity-80 ml-1">/mois</span>
        </div>

        {/* Badge Nouveau - Orange Premium */}
        {showBadge && badgeText && (
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-[var(--color-orange)] text-white rounded-full text-xs font-semibold shadow-lg">
            {badgeText}
          </div>
        )}

        {/* Owner Badge with Trust Score - Bottom Right */}
        {ownerTrustScore != null && (
          <div className="absolute bottom-3 right-3">
            <OwnerBadge
              name={ownerName}
              avatarUrl={ownerAvatarUrl}
              trustScore={ownerTrustScore}
              isVerified={ownerIsVerified}
              variant="inline"
              size="sm"
              showName={true}
            />
          </div>
        )}
      </div>

      {/* Content - Premium Ivorian Colors */}
      <div className="p-4">
        {/* Location */}
        <h3 className="font-bold text-[var(--color-chocolat)] text-base sm:text-lg truncate mb-1">
          {property.city}{property.neighborhood && `, ${property.neighborhood}`}
        </h3>

        {/* Title */}
        <p className="text-[var(--color-gris-texte)] text-sm truncate mb-3">{property.title}</p>

        {/* Features Row */}
        <div className="flex items-center gap-4 text-sm text-[var(--color-gris-texte)]">
          {/* Chambres */}
          <span className="flex items-center gap-1.5">
            <Bed className="h-4 w-4 text-[var(--color-orange)]" />
            <span className="font-medium">{property.bedrooms ?? '-'} ch.</span>
          </span>

          {/* Salles de bain */}
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-[var(--color-orange)]" />
            <span className="font-medium">{property.bathrooms ?? '-'} sdb.</span>
          </span>

          {/* Superficie */}
          <span className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4 text-[var(--color-orange)]" />
            <span className="font-medium">{property.surface_area ?? '-'} m²</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
