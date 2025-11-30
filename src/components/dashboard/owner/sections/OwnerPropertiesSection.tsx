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

  return (
    <div className="space-y-6">
      {/* Header */}
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
        </div>
      )}
    </div>
  );
};

export default OwnerPropertiesSection;