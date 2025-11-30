<<<<<<< HEAD
import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  User, 
  Calendar, 
  Eye, 
  Edit, 
  Archive,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Home,
  Phone,
  Star,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Camera,
  Share2
} from 'lucide-react';

interface Property {
  id: number;
  photo: string;
  title: string;
  address: string;
  type: 'villa' | 'appartement' | 'immeuble' | 'commerce' | 'terrain';
  status: 'disponible' | 'loué' | 'maintenance' | 'suspendu' | 'vendu';
  price: number;
  area: number;
  rooms: number;
  bathrooms: number;
  parking: number;
  owner: string;
  ownerPhone: string;
  agent: string;
  agentPhone: string;
  listedDate: string;
  views: number;
  inquiries: number;
  conversionRate: number;
  tags: string[];
  description: string;
  amenities: string[];
  location: string;
  coordinates?: { lat: number; lng: number };
  yearBuilt?: number;
  lastUpdated: string;
}

interface AgencyPropertiesSectionProps {
  agencyName: string;
}

const AgencyPropertiesSection: React.FC<AgencyPropertiesSectionProps> = ({ agencyName }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'views' | 'conversion'>('date');

  // Données mock des propriétés de l'agence
  const properties: Property[] = [
    {
      id: 1,
      photo: '/images/villa-cocody.jpg',
      title: 'Villa Moderne Cocody',
      address: 'Cocody, Riviera Golf',
      type: 'villa',
      status: 'disponible',
      price: 450000000,
      area: 300,
      rooms: 6,
      bathrooms: 4,
      parking: 3,
      owner: 'M. KOUASSI Jean',
      ownerPhone: '+225 07 00 00 01',
      agent: 'A. TRAORE',
      agentPhone: '+225 05 00 00 12',
      listedDate: '2025-11-25',
      views: 1247,
      inquiries: 23,
      conversionRate: 18.5,
      tags: ['Luxe', 'Neuf', 'Piscine'],
      description: 'Magnifique villa moderne avec piscine et jardin tropical',
      amenities: ['Piscine', 'Jardin', 'Garage 3 places', 'Sécurité 24h'],
      location: 'Cocody',
      yearBuilt: 2024,
      lastUpdated: '2025-11-29'
    },
    {
      id: 2,
      photo: '/images/appart-riviera.jpg',
      title: 'Appartement Riviera',
      address: 'Marcory, Zone 4A',
      type: 'appartement',
      status: 'loué',
      price: 180000000,
      area: 120,
      rooms: 3,
      bathrooms: 2,
      parking: 1,
      owner: 'Mme TRAORE Aya',
      ownerPhone: '+225 05 00 00 02',
      agent: 'M. BAKAYOKO',
      agentPhone: '+225 01 00 00 13',
      listedDate: '2025-11-20',
      views: 856,
      inquiries: 15,
      conversionRate: 22.1,
      tags: ['Meublé', 'Centre-ville'],
      description: 'Appartement meublé centre-ville, parfait pour investissement',
      amenities: ['Meublé', 'Climatisé', 'Ascenseur', 'Balcon'],
      location: 'Marcory',
      yearBuilt: 2020,
      lastUpdated: '2025-11-28'
    },
    {
      id: 3,
      photo: '/images/immeuble-plateau.jpg',
      title: 'Immeuble Commercial Plateau',
      address: 'Plateau, Rue des Hôtels',
      type: 'immeuble',
      status: 'maintenance',
      price: 1200000000,
      area: 1200,
      rooms: 24,
      bathrooms: 12,
      parking: 15,
      owner: 'SCI Plateau SA',
      ownerPhone: '+225 20 00 00 03',
      agent: 'Mme KONE',
      agentPhone: '+225 07 00 00 14',
      listedDate: '2025-11-15',
      views: 2341,
      inquiries: 8,
      conversionRate: 8.2,
      tags: ['Commercial', 'Investissement'],
      description: 'Immeuble commercial stratégique au cœur du Plateau',
      amenities: ['Réception', 'Parking', 'Sécurité', 'Climatisation'],
      location: 'Plateau',
      yearBuilt: 2018,
      lastUpdated: '2025-11-27'
    },
    {
      id: 4,
      photo: '/images/appart-yopougon.jpg',
      title: 'Appartement F3 Yopougon',
      address: 'Yopougon, Siporex',
      type: 'appartement',
      status: 'disponible',
      price: 85000000,
      area: 85,
      rooms: 3,
      bathrooms: 2,
      parking: 1,
      owner: 'M. DIALLO Ousmane',
      ownerPhone: '+225 03 00 00 04',
      agent: 'M. TRAORE',
      agentPhone: '+225 01 00 00 15',
      listedDate: '2025-11-22',
      views: 432,
      inquiries: 12,
      conversionRate: 28.7,
      tags: ['Abordable', 'Familial'],
      description: 'Appartement familial dans quartier résidentiel calme',
      amenities: ['Cuisine équipée', 'Terrasse', 'Sécurité'],
      location: 'Yopougon',
      yearBuilt: 2019,
      lastUpdated: '2025-11-29'
    },
    {
      id: 5,
      photo: '/images/commerce-adjame.jpg',
      title: 'Local Commercial Adjamé',
      address: 'Adjamé, Marché Central',
      type: 'commerce',
      status: 'loué',
      price: 150000000,
      area: 60,
      rooms: 2,
      bathrooms: 1,
      parking: 0,
      owner: 'SARL Commerce Plus',
      ownerPhone: '+225 27 00 00 05',
      agent: 'Mme FOFANA',
      agentPhone: '+225 05 00 00 16',
      listedDate: '2025-11-10',
      views: 678,
      inquiries: 19,
      conversionRate: 31.5,
      tags: ['Commercial', 'Passage'],
      description: 'Local commercial très passant, forte visibilité',
      amenities: ['Vitrine', 'Stockage', 'Électricité 220V'],
      location: 'Adjamé',
      yearBuilt: 2015,
      lastUpdated: '2025-11-26'
    },
    {
      id: 6,
      photo: '/images/terrain-bingerville.jpg',
      title: 'Terrain constructible Bingerville',
      address: 'Bingerville, Zone Résidentielle',
      type: 'terrain',
      status: 'disponible',
      price: 75000000,
      area: 500,
      rooms: 0,
      bathrooms: 0,
      parking: 0,
      owner: 'M. KONEbrahim',
      ownerPhone: '+225 01 00 00 06',
      agent: 'M. BAKAYOKO',
      agentPhone: '+225 01 00 00 13',
      listedDate: '2025-11-28',
      views: 234,
      inquiries: 6,
      conversionRate: 12.8,
      tags: ['Terrain', 'Construction'],
      description: 'Terrain constructible parfait pour villa familiale',
      amenities: ['Viabilisé', 'Titre foncier', 'Belle vue'],
      location: 'Bingerville',
      lastUpdated: '2025-11-29'
    }
  ];

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'disponible': { 
        label: 'Disponible', 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle 
      },
      'loué': { 
        label: 'Loué', 
        color: 'bg-blue-100 text-blue-800', 
        icon: Home 
      },
      'maintenance': { 
        label: 'Maintenance', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock 
      },
      'suspendu': { 
        label: 'Suspendu', 
        color: 'bg-red-100 text-red-800', 
        icon: AlertTriangle 
      },
      'vendu': { 
        label: 'Vendu', 
        color: 'bg-purple-100 text-purple-800', 
        icon: TrendingUp 
      }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap['disponible'];
  };

  const getTypeInfo = (type: string) => {
    const typeMap = {
      'villa': { label: 'Villa', color: 'bg-green-100 text-green-800' },
      'appartement': { label: 'Appartement', color: 'bg-blue-100 text-blue-800' },
      'immeuble': { label: 'Immeuble', color: 'bg-purple-100 text-purple-800' },
      'commerce': { label: 'Commerce', color: 'bg-orange-100 text-orange-800' },
      'terrain': { label: 'Terrain', color: 'bg-amber-100 text-amber-800' }
    };
    return typeMap[type as keyof typeof typeMap] || typeMap['appartement'];
  };

  const filteredProperties = properties.filter(property => {
    const matchesFilter = selectedFilter === 'all' || property.status === selectedFilter;
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.owner.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const propertyStats = {
    total: properties.length,
    disponibles: properties.filter(p => p.status === 'disponible').length,
    loues: properties.filter(p => p.status === 'loué').length,
    maintenance: properties.filter(p => p.status === 'maintenance').length,
    valeurTotale: properties.reduce((sum, p) => sum + p.price, 0),
    vuesTotales: properties.reduce((sum, p) => sum + p.views, 0),
    conversionMoyenne: properties.reduce((sum, p) => sum + p.conversionRate, 0) / properties.length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Portfolio Propriétés
            </h2>
            <p className="text-neutral-700">
              Gestion du portefeuille de {agencyName}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <div className="flex rounded-lg border border-neutral-300 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
              >
                Grille
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
              >
                Liste
              </button>
            </div>
            <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter propriété
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Total</p>
              <p className="text-lg font-bold text-neutral-900">{propertyStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-semantic-success" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Disponibles</p>
              <p className="text-lg font-bold text-neutral-900">{propertyStats.disponibles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Loukés</p>
              <p className="text-lg font-bold text-neutral-900">{propertyStats.loues}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-semantic-warning" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Maintenance</p>
              <p className="text-lg font-bold text-neutral-900">{propertyStats.maintenance}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Valeur</p>
              <p className="text-lg font-bold text-neutral-900">
                {(propertyStats.valeurTotale / 1000000000).toFixed(1)}Md F
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-amber-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-semantic-warning" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Vues</p>
              <p className="text-lg font-bold text-neutral-900">{propertyStats.vuesTotales.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Rechercher une propriété..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="disponible">Disponible</option>
              <option value="loué">Loué</option>
              <option value="maintenance">Maintenance</option>
              <option value="suspendu">Suspendu</option>
              <option value="vendu">Vendu</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'date' | 'views' | 'conversion')}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="date">Trier par date</option>
              <option value="price">Trier par prix</option>
              <option value="views">Trier par vues</option>
              <option value="conversion">Trier par conversion</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-neutral-700 hover:bg-neutral-50 rounded-lg">
              <Filter className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg border border-primary-200">
              Exporter
            </button>
=======
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
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Properties Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            const statusInfo = getStatusInfo(property.status);
            const typeInfo = getTypeInfo(property.type);
            const StatusIcon = statusInfo.icon;

            return (
              <div key={property.id} className="bg-white rounded-lg border border-neutral-200 hover:shadow-md transition-shadow duration-200">
                {/* Property Image */}
                <div className="relative h-48 bg-neutral-200 rounded-t-lg">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-lg" />
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-lg font-bold">{property.title}</p>
                    <p className="text-sm opacity-90">{property.address}</p>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="text-white font-bold text-lg">
                      {(property.price / 1000000).toFixed(0)}M F
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2 text-sm text-neutral-700 mb-3">
                    <div className="text-center">
                      <p className="font-semibold">{property.area}m²</p>
                      <p className="text-xs text-neutral-500">Surface</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{property.rooms} pièces</p>
                      <p className="text-xs text-neutral-500">Pièces</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{property.conversionRate}%</p>
                      <p className="text-xs text-neutral-500">Conversion</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-neutral-700 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Vues:</span>
                      <span className="font-medium">{property.views}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Inquiries:</span>
                      <span className="font-medium">{property.inquiries}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Agent:</span>
                      <span className="font-medium">{property.agent}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {property.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors duration-200">
                      <Eye className="w-4 h-4 mr-1 inline" />
                      Voir
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                      <Edit className="w-4 h-4 mr-1 inline" />
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="divide-y divide-neutral-200">
            {filteredProperties.map((property) => {
              const statusInfo = getStatusInfo(property.status);
              const typeInfo = getTypeInfo(property.type);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={property.id} className="p-6 hover:bg-neutral-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Property Image */}
                      <div className="w-20 h-20 bg-neutral-200 rounded-lg flex-shrink-0" />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-neutral-900">
                            {property.title}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </div>
                        
                        <p className="text-neutral-600 mb-2">{property.address}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm text-neutral-700">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{property.area}m² • {property.rooms} pièces</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{(property.price / 1000000).toFixed(0)}M F</span>
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{property.views} vues</span>
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{property.agent}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{new Date(property.listedDate).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{property.conversionRate}% conversion</span>
                          </div>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {property.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Voir détails">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Modifier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Archiver">
                        <Archive className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Partager">
                        <Share2 className="w-4 h-4" />
                      </button>
                      
                      <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                        Gérer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyPropertiesSection;
=======
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
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
