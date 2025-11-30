/**
 * Owner Properties Section - Gestion des propriétés du propriétaire
 */

import { Badge } from '../../ui/Badge';

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  monthly_rent: number;
  status: 'occupé' | 'libre' | 'maintenance';
  images: string[];
  tenant?: {
    name: string;
    phone: string;
    lease_end: string;
  };
}

interface OwnerPropertiesSectionProps {
  properties: Property[];
  showHeader?: boolean;
}

export function OwnerPropertiesSection({ properties, showHeader = false }: OwnerPropertiesSectionProps) {
  const getStatusBadge = (status: Property['status']) => {
    switch (status) {
      case 'occupé':
        return <Badge variant="success" size="small">Occupé</Badge>;
      case 'libre':
        return <Badge variant="warning" size="small">Libre</Badge>;
      case 'maintenance':
        return <Badge variant="error" size="small">Maintenance</Badge>;
      default:
        return <Badge variant="default" size="small">Inconnu</Badge>;
    }
  };

  const filteredProperties = properties.filter(property => property.status === 'libre' || property.status === 'maintenance');

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Mes Propriétés</h2>
            <p className="text-text-secondary">Gestion de votre portefeuille immobilier</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="px-3 py-2 border border-neutral-200 rounded-lg text-sm">
              <option value="">Tous les statuts</option>
              <option value="occupé">Occupé</option>
              <option value="libre">Libre</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <button className="btn-primary">
              Ajouter une propriété
            </button>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {properties.map((property) => (
          <div 
            key={property.id}
            className="bg-background-page rounded-xl border border-neutral-100 overflow-hidden hover:shadow-lg transition-all duration-200 group"
          >
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-neutral-200 to-neutral-300">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-4 left-4">
                {getStatusBadge(property.status)}
              </div>
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                    <svg className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                    <svg className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span className="text-sm font-medium">{property.images.length} photo{property.images.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{property.monthly_rent.toLocaleString()} FCFA</div>
                    <div className="text-sm opacity-90">/ mois</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary-600 transition-colors">
                  {property.title}
                </h3>
                <div className="flex items-center gap-2 text-text-secondary">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">{property.address}, {property.city}</span>
                </div>
              </div>

              {/* Tenant Info */}
              {property.tenant && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700">Locataire actuel</span>
                    <Badge variant="success" size="small">Actif</Badge>
                  </div>
                  <div className="text-sm text-green-600">
                    <div className="font-medium">{property.tenant.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span>{property.tenant.phone}</span>
                    </div>
                    <div className="mt-1">
                      Fin de bail: {new Date(property.tenant.lease_end).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-medium">Voir détails</span>
                </button>
                <button className="flex items-center justify-center px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                  <svg className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button className="flex items-center justify-center px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                  <svg className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (si aucune propriété) */}
      {properties.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-neutral-400">🏠</span>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Aucune propriété</h3>
          <p className="text-text-secondary mb-6">Commencez par ajouter votre première propriété</p>
          <button className="btn-primary">
            Ajouter une propriété
          </button>
        </div>
      )}

      {/* Alerts pour propriétés disponibles */}
      {filteredProperties.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-800">
                {filteredProperties.length} propriété{filteredProperties.length > 1 ? 's' : ''} disponible{filteredProperties.length > 1 ? 's' : ''}
              </h4>
              <p className="text-sm text-amber-700">
                {filteredProperties.filter(p => p.status === 'libre').length} libre{filteredProperties.filter(p => p.status === 'libre').length > 1 ? 's' : ''} • {filteredProperties.filter(p => p.status === 'maintenance').length} en maintenance
              </p>
            </div>
            <div className="ml-auto">
              <button className="text-sm font-medium text-amber-800 hover:text-amber-900">
                Voir les candidatures →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}