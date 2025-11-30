/**
 * Tenant Favorites Section - Propriétés favorites du locataire
 */

import { useState } from 'react';
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Eye, 
  Trash2,
  Filter,
  Grid3X3,
  List,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

interface Property {
  id: string;
  title: string;
  city: string;
  neighborhood?: string;
  property_type: string;
  monthly_rent: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  main_image: string;
  status: 'disponible' | 'occupé' | 'maintenance';
  created_at: string;
  description?: string;
}

interface TenantFavoritesSectionProps {
  properties?: Property[];
}

export function TenantFavoritesSection({ properties = [] }: TenantFavoritesSectionProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priceRange: [0, 500000] as [number, number],
    propertyType: 'all',
    bedrooms: 'all',
    city: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Données mock pour la démo
  const mockProperties: Property[] = [
    {
      id: '1',
      title: 'Appartement moderne Cocody',
      city: 'Cocody',
      neighborhood: 'Deux Plateaux',
      property_type: 'Appartement',
      monthly_rent: 180000,
      bedrooms: 3,
      bathrooms: 2,
      area: 85,
      main_image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      status: 'disponible',
      created_at: '2025-11-28',
      description: 'Magnifique appartement avec vue sur la lagune',
    },
    {
      id: '2',
      title: 'Studio Plateau Centre',
      city: 'Abidjan Plateau',
      neighborhood: 'Centre',
      property_type: 'Studio',
      monthly_rent: 120000,
      bedrooms: 1,
      bathrooms: 1,
      area: 35,
      main_image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      status: 'disponible',
      created_at: '2025-11-27',
      description: 'Studio moderne en plein centre-ville',
    },
    {
      id: '3',
      title: 'Villa familiale Bingerville',
      city: 'Bingerville',
      neighborhood: 'Residential',
      property_type: 'Villa',
      monthly_rent: 350000,
      bedrooms: 5,
      bathrooms: 3,
      area: 200,
      main_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
      status: 'disponible',
      created_at: '2025-11-26',
      description: 'Grande villa avec jardin et piscine',
    },
  ];

  const allProperties = properties.length > 0 ? properties : mockProperties;

  const filteredProperties = allProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = property.monthly_rent >= filters.priceRange[0] && 
                        property.monthly_rent <= filters.priceRange[1];
    const matchesType = filters.propertyType === 'all' || property.property_type === filters.propertyType;
    const matchesBedrooms = filters.bedrooms === 'all' || property.bedrooms.toString() === filters.bedrooms;
    
    return matchesSearch && matchesPrice && matchesType && matchesBedrooms;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price).replace('XOF', 'FCFA');
  };

  const handleRemoveFavorite = (propertyId: string) => {
    // TODO: Implémenter la suppression des favoris
    console.log('Supprimer favori:', propertyId);
  };

  const handleViewDetails = (propertyId: string) => {
    // TODO: Implémenter la navigation vers les détails
    console.log('Voir détails:', propertyId);
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <Card variant="elevated" hoverable clickable className="group">
      <div className="relative">
        <img
          src={property.main_image}
          alt={property.title}
          className="w-full h-48 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badge de statut */}
        <div className="absolute top-3 left-3">
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${property.status === 'disponible' 
              ? 'bg-green-500 text-white' 
              : property.status === 'occupé'
              ? 'bg-red-500 text-white'
              : 'bg-amber-500 text-white'
            }
          `}>
            {property.status === 'disponible' ? 'Disponible' : 
             property.status === 'occupé' ? 'Occupé' : 'Maintenance'}
          </span>
        </div>

        {/* Bouton de suppression */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveFavorite(property.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          aria-label="Retirer des favoris"
        >
          <Heart className="h-4 w-4 text-red-500 fill-current" />
        </button>
      </div>

      <CardBody>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-text-primary mb-1 group-hover:text-primary-500 transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-text-secondary">
              <MapPin className="h-3 w-3" />
              {property.neighborhood && `${property.neighborhood}, `}{property.city}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{property.area}m²</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-primary-500">
                {formatPrice(property.monthly_rent)}
              </p>
              <p className="text-xs text-text-disabled">par mois</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="small"
                onClick={() => handleViewDetails(property.id)}
                className="px-3"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="small">
                Détails
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const PropertyListItem = ({ property }: { property: Property }) => (
    <Card variant="bordered" hoverable className="group">
      <CardBody>
        <div className="flex gap-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <img
              src={property.main_image}
              alt={property.title}
              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
            />
            <button
              onClick={() => handleRemoveFavorite(property.id)}
              className="absolute -top-1 -right-1 p-1 bg-white rounded-full shadow-sm hover:bg-neutral-50"
              aria-label="Retirer des favoris"
            >
              <Heart className="h-3 w-3 text-red-500 fill-current" />
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-1">
                  {property.title}
                </h3>
                <div className="flex items-center gap-1 text-sm text-text-secondary mb-2">
                  <MapPin className="h-3 w-3" />
                  {property.neighborhood && `${property.neighborhood}, `}{property.city}
                </div>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span>{property.bedrooms} chambres</span>
                  <span>{property.bathrooms} SDB</span>
                  <span>{property.area}m²</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary-500">
                  {formatPrice(property.monthly_rent)}
                </p>
                <p className="text-xs text-text-disabled mb-2">par mois</p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleViewDetails(property.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Voir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-h3 font-bold text-text-primary mb-2">
            Mes favoris
          </h2>
          <p className="text-body text-text-secondary">
            {filteredProperties.length} propriété{filteredProperties.length !== 1 ? 's' : ''} sauvegardée{filteredProperties.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card variant="bordered">
        <CardBody>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-disabled" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher dans vos favoris..."
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Bouton filtres */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
            </Button>
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Prix (FCFA)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [Number(e.target.value), prev.priceRange[1]]
                      }))}
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], Number(e.target.value)]
                      }))}
                      placeholder="Max"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Type de bien
                  </label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Tous</option>
                    <option value="Appartement">Appartement</option>
                    <option value="Studio">Studio</option>
                    <option value="Villa">Villa</option>
                    <option value="Maison">Maison</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Chambres
                  </label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Toutes</option>
                    <option value="1">1 chambre</option>
                    <option value="2">2 chambres</option>
                    <option value="3">3 chambres</option>
                    <option value="4">4+ chambres</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Ville
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Toutes</option>
                    <option value="Cocody">Cocody</option>
                    <option value="Abidjan Plateau">Abidjan Plateau</option>
                    <option value="Bingerville">Bingerville</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Liste des propriétés */}
      {filteredProperties.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredProperties.map((property) => 
            viewMode === 'grid' ? (
              <PropertyCard key={property.id} property={property} />
            ) : (
              <PropertyListItem key={property.id} property={property} />
            )
          )}
        </div>
      ) : (
        <Card variant="bordered">
          <CardBody className="text-center py-12">
            <Heart className="h-16 w-16 text-text-disabled mx-auto mb-4" />
            <h3 className="text-h5 font-semibold text-text-primary mb-2">
              Aucun favori trouvé
            </h3>
            <p className="text-body text-text-secondary mb-6">
              {searchQuery || showFilters 
                ? 'Aucune propriété ne correspond à vos critères de recherche.'
                : 'Vous n\'avez pas encore ajouté de propriétés à vos favoris.'
              }
            </p>
            <Button variant="primary">
              Explorer les propriétés
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}