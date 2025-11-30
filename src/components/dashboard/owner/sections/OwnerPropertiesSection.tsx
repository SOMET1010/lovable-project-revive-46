<<<<<<< HEAD
import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Users, 
  Calendar, 
  TrendingUp, 
  Eye,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  Star,
  Bed,
  Bath,
  Square,
  Home,
  CheckCircle,
  Clock,
  AlertCircle,
  Wrench
} from 'lucide-react';

interface Property {
  id: number;
  title: string;
  address: string;
  type: 'appartement' | 'villa' | 'studio' | 'maison';
  status: 'loue' | 'vacant' | 'maintenance' | 'negociation';
  rent: number;
  bedrooms: number;
  bathrooms: number;
  surface: number;
  image: string;
  description: string;
  tenant?: string;
  tenantSince?: string;
  nextPayment?: string;
  applications?: number;
  visits?: number;
  occupancyRate?: number;
  yearlyRevenue: number;
  lastMaintenance?: string;
  nextInspection?: string;
}

const OwnerPropertiesSection: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Données mock réalistes pour les propriétés
  const properties: Property[] = [
    {
      id: 1,
      title: "Villa Bellevue",
      address: "Cocody, Riviera Golf",
      type: "villa",
      status: "loue",
      rent: 450000,
      bedrooms: 4,
      bathrooms: 3,
      surface: 180,
      image: "/images/villa-bellevue.jpg",
      description: "Magnifique villa moderne avec jardin et piscine",
      tenant: "Jean et Marie Kouassi",
      tenantSince: "01/03/2024",
      nextPayment: "01/12/2024",
      applications: 12,
      visits: 8,
      occupancyRate: 98,
      yearlyRevenue: 5400000,
      lastMaintenance: "15/11/2024",
      nextInspection: "01/01/2025"
    },
    {
      id: 2,
      title: "Appartement Riviera",
      address: "Cocody, Riviera 2",
      type: "appartement",
      status: "loue",
      rent: 380000,
      bedrooms: 3,
      bathrooms: 2,
      surface: 120,
      image: "/images/appartement-riviera.jpg",
      description: "Appartement moderne avec vue sur lagune",
      tenant: "Sarah Mensah",
      tenantSince: "15/06/2024",
      nextPayment: "15/12/2024",
      applications: 8,
      visits: 6,
      occupancyRate: 95,
      yearlyRevenue: 4560000,
      lastMaintenance: "20/10/2024",
      nextInspection: "15/02/2025"
    },
    {
      id: 3,
      title: "Studio Plateau",
      address: "Plateau, Centre-ville",
      type: "studio",
      status: "vacant",
      rent: 180000,
      bedrooms: 1,
      bathrooms: 1,
      surface: 35,
      image: "/images/studio-plateau.jpg",
      description: "Studio fonctionnel en centre-ville",
      applications: 5,
      visits: 3,
      occupancyRate: 0,
      yearlyRevenue: 0,
      lastMaintenance: "10/11/2024",
      nextInspection: "20/01/2025"
    },
    {
      id: 4,
      title: "Maison Yopougon",
      address: "Yopougon, Toits Rouges",
      type: "maison",
      status: "maintenance",
      rent: 320000,
      bedrooms: 5,
      bathrooms: 2,
      surface: 200,
      image: "/images/maison-yopougon.jpg",
      description: "Grande maison familiale avec cour",
      applications: 15,
      visits: 12,
      occupancyRate: 88,
      yearlyRevenue: 3840000,
      lastMaintenance: "25/11/2024",
      nextInspection: "01/03/2025"
    },
    {
      id: 5,
      title: "Appartement Marcory",
      address: "Marcory, Zone 4A",
      type: "appartement",
      status: "loue",
      rent: 420000,
      bedrooms: 2,
      bathrooms: 2,
      surface: 95,
      image: "/images/appartement-marcory.jpg",
      description: "Appartement entièrement meublé",
      tenant: "Paul Akissi",
      tenantSince: "01/09/2024",
      nextPayment: "01/01/2025",
      applications: 10,
      visits: 7,
      occupancyRate: 92,
      yearlyRevenue: 5040000,
      lastMaintenance: "05/11/2024",
      nextInspection: "01/04/2025"
    }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'loue':
        return { 
          label: 'Loué', 
          color: 'bg-green-100 text-green-800', 
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600'
        };
      case 'vacant':
        return { 
          label: 'Vacant', 
          color: 'bg-red-100 text-red-800', 
          icon: Clock,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600'
        };
      case 'maintenance':
        return { 
          label: 'Maintenance', 
          color: 'bg-amber-100 text-amber-800', 
          icon: Wrench,
          bgColor: 'bg-amber-50',
          iconColor: 'text-amber-600'
        };
      case 'negociation':
        return { 
          label: 'En négociation', 
          color: 'bg-blue-100 text-blue-800', 
          icon: AlertCircle,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600'
        };
      default:
        return { 
          label: 'Inconnu', 
          color: 'bg-neutral-100 text-neutral-800', 
          icon: AlertCircle,
          bgColor: 'bg-neutral-50',
          iconColor: 'text-neutral-600'
        };
    }
  };

  const filteredProperties = properties.filter(property => {
    const statusMatch = selectedStatus === 'all' || property.status === selectedStatus;
    const typeMatch = selectedType === 'all' || property.type === selectedType;
    return statusMatch && typeMatch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
    const statusConfig = getStatusConfig(property.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Image */}
        <div className="relative h-48 bg-neutral-200 rounded-t-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <button className="p-2 bg-white/90 rounded-full text-neutral-700 hover:bg-white">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <p className="text-lg font-bold">{formatCurrency(property.rent)}/mois</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">{property.title}</h3>
              <div className="flex items-center text-neutral-600 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{property.address}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Property details */}
          <div className="flex items-center space-x-4 mb-3 text-sm text-neutral-600">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              <span>{property.surface}m²</span>
            </div>
          </div>

          {/* Tenant info */}
          {property.tenant && (
            <div className="bg-neutral-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-neutral-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{property.tenant}</p>
                    <p className="text-xs text-neutral-600">Depuis {property.tenantSince}</p>
                  </div>
                </div>
                {property.nextPayment && (
                  <div className="text-right">
                    <p className="text-xs text-neutral-600">Prochain loyer</p>
                    <p className="text-sm font-medium text-neutral-900">{property.nextPayment}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Performance metrics */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-neutral-50 rounded-lg p-2 text-center">
              <p className="text-xs text-neutral-600">Candidatures</p>
              <p className="text-sm font-bold text-neutral-900">{property.applications || 0}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-2 text-center">
              <p className="text-xs text-neutral-600">Visites</p>
              <p className="text-sm font-bold text-neutral-900">{property.visits || 0}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-2 text-center">
              <p className="text-xs text-neutral-600">Occupation</p>
              <p className="text-sm font-bold text-neutral-900">{property.occupancyRate || 0}%</p>
            </div>
          </div>

          {/* Revenue */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-neutral-600">Revenus annuels</p>
              <p className="text-lg font-bold text-semantic-success">{formatCurrency(property.yearlyRevenue)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-600">Type</p>
              <p className="text-sm font-medium text-neutral-900 capitalize">{property.type}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
              <Eye className="w-4 h-4 mr-2" />
              Voir détails
            </button>
            <button className="flex items-center justify-center px-3 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors duration-200">
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };
=======
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
>>>>>>> 179702229bfc197f668a7416e325de75b344681e

  return (
    <div className="space-y-6">
      {/* Header */}
<<<<<<< HEAD
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Mon Portefeuille</h2>
          <p className="text-neutral-600">Gérez vos propriétés en location</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
            Ajouter une propriété
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Statut</label>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="loue">Loué</option>
            <option value="vacant">Vacant</option>
            <option value="maintenance">En maintenance</option>
            <option value="negociation">En négociation</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="appartement">Appartement</option>
            <option value="villa">Villa</option>
            <option value="maison">Maison</option>
            <option value="studio">Studio</option>
          </select>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Building className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-700">Total propriétés</p>
              <p className="text-2xl font-bold text-neutral-900">{properties.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-semantic-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-700">Propriétés louées</p>
              <p className="text-2xl font-bold text-neutral-900">
                {properties.filter(p => p.status === 'loue').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="w-6 h-6 text-semantic-warning" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-700">Propriétés vacantes</p>
              <p className="text-2xl font-bold text-neutral-900">
                {properties.filter(p => p.status === 'vacant').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-semantic-info" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-700">Revenus annuels</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(properties.reduce((sum, p) => sum + p.yearlyRevenue, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Aucune propriété trouvée</h3>
          <p className="text-neutral-600">Essayez de modifier vos filtres</p>
=======
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
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
        </div>
      )}
    </div>
  );
<<<<<<< HEAD
};

export default OwnerPropertiesSection;
=======
}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
