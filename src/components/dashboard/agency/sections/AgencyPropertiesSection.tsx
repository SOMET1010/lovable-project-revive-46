/**
 * Agency Properties Section - Gestion du portefeuille de propriétés
 */

import { useState } from 'react';
import { Badge } from '../../ui/Badge';
import { Progress } from '../../ui/Progress';

interface Property {
  id: string;
  title: string;
  type: 'vente' | 'location';
  price: number;
  city: string;
  status: 'disponible' | 'vendu' | 'loue' | 'suspendu';
  views: number;
  image: string;
  agentId: string;
  createdAt: string;
}

interface AgencyPropertiesSectionProps {
  properties: Property[];
  showHeader?: boolean;
}

export function AgencyPropertiesSection({ properties, showHeader = false }: AgencyPropertiesSectionProps) {
  const [filterType, setFilterType] = useState<'all' | 'vente' | 'location'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'disponible' | 'vendu' | 'loue' | 'suspendu'>('all');
  const [filterCity, setFilterCity] = useState<string>('all');

  const filteredProperties = properties.filter(property => {
    if (filterType !== 'all' && property.type !== filterType) return false;
    if (filterStatus !== 'all' && property.status !== filterStatus) return false;
    if (filterCity !== 'all' && property.city !== filterCity) return false;
    return true;
  });

  const cities = [...new Set(properties.map(p => p.city))];
  const statusColors = {
    disponible: 'success',
    vendu: 'info',
    loue: 'warning',
    suspendu: 'error',
  } as const;

  const typeLabels = {
    vente: 'Vente',
    location: 'Location',
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Portefeuille propriétés</h2>
            <p className="text-text-secondary">Gestion et suivi de {properties.length} biens</p>
          </div>
          <button className="btn-primary">
            ➕ Ajouter une propriété
          </button>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-background-page rounded-xl p-4 border border-neutral-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Type</label>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="vente">Vente</option>
              <option value="location">Location</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Statut</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="disponible">Disponible</option>
              <option value="vendu">Vendu</option>
              <option value="loue">Loué</option>
              <option value="suspendu">Suspendu</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Ville</label>
            <select 
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Toutes les villes</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
          <span className="text-sm text-text-secondary">
            {filteredProperties.length} propriété(s) trouvée(s)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Trier par:</span>
            <select className="text-sm px-2 py-1 border border-neutral-200 rounded">
              <option>Date de création</option>
              <option>Prix décroissant</option>
              <option>Nombre de vues</option>
              <option>Alphabetique</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grille des propriétés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <div key={property.id} className="bg-background-page rounded-xl border border-neutral-100 overflow-hidden hover:shadow-lg transition-all">
            {/* Image */}
            <div className="relative h-48 bg-neutral-100">
              <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                <span className="text-4xl">🏠</span>
              </div>
              <div className="absolute top-3 left-3">
                <Badge 
                  variant={statusColors[property.status] as any}
                  size="small"
                >
                  {property.status}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge variant="outline" size="small">
                  {typeLabels[property.type]}
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge variant="default" size="small">
                  👁️ {property.views}
                </Badge>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-4">
              <h3 className="font-semibold text-text-primary mb-2 line-clamp-2">
                {property.title}
              </h3>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-primary-500">
                  {property.price.toLocaleString()} FCFA
                </span>
                <span className="text-sm text-text-secondary">{property.city}</span>
              </div>

              {/* Performance */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Performance</span>
                  <span>{Math.min(property.views * 2, 100)}%</span>
                </div>
                <Progress 
                  value={Math.min(property.views * 2, 100)} 
                  size="small"
                  variant={property.views > 100 ? 'success' : property.views > 50 ? 'warning' : 'default'}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                  Modifier
                </button>
                <button className="px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
                  📊
                </button>
                <button className="px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
                  ⚙️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background-page rounded-xl p-4 border border-neutral-100 text-center">
          <div className="text-2xl font-bold text-primary-500 mb-1">
            {properties.filter(p => p.status === 'disponible').length}
          </div>
          <div className="text-sm text-text-secondary">Disponibles</div>
        </div>
        
        <div className="bg-background-page rounded-xl p-4 border border-neutral-100 text-center">
          <div className="text-2xl font-bold text-semantic-success mb-1">
            {properties.filter(p => p.status === 'vendu' || p.status === 'loue').length}
          </div>
          <div className="text-sm text-text-secondary">Vendues/Louées</div>
        </div>
        
        <div className="bg-background-page rounded-xl p-4 border border-neutral-100 text-center">
          <div className="text-2xl font-bold text-info mb-1">
            {properties.filter(p => p.type === 'vente').length}
          </div>
          <div className="text-sm text-text-secondary">En vente</div>
        </div>
        
        <div className="bg-background-page rounded-xl p-4 border border-neutral-100 text-center">
          <div className="text-2xl font-bold text-warning mb-1">
            {properties.filter(p => p.type === 'location').length}
          </div>
          <div className="text-sm text-text-secondary">En location</div>
        </div>
      </div>
    </div>
  );
}