<<<<<<< HEAD
import React, { useState } from 'react';
import { 
  Home, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Ban,
  MapPin,
  Calendar,
  User,
  Building,
  Star,
  DollarSign,
  Bed,
  Bath,
  Square,
  Car
} from 'lucide-react';

const AdminPropertiesSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Données mock des propriétés
  const properties = [
    {
      id: 1,
      title: 'Villa Moderne Cocody',
      type: 'Villa',
      address: 'Cocody, Riviera 4',
      owner: 'Jean MUKENDI',
      ownerEmail: 'jean.mukendi@email.com',
      price: 150000000,
      bedrooms: 4,
      bathrooms: 3,
      area: 250,
      parking: 2,
      status: 'active',
      validationStatus: 'approved',
      image: '/images/property1.jpg',
      createdDate: '2024-01-15',
      lastUpdate: '2024-11-30',
      views: 234,
      rating: 4.8,
      certifications: ['ANSUT', 'Sécurité']
    },
    {
      id: 2,
      title: 'Appartement Plateau Centre',
      type: 'Appartement',
      address: 'Plateau, Avenue Chardy',
      owner: 'Marie KOUASSI',
      ownerEmail: 'marie.kouassi@immoPlus.ci',
      price: 85000000,
      bedrooms: 2,
      bathrooms: 2,
      area: 120,
      parking: 1,
      status: 'pending',
      validationStatus: 'pending',
      image: '/images/property2.jpg',
      createdDate: '2024-02-20',
      lastUpdate: '2024-11-28',
      views: 156,
      rating: 4.2,
      certifications: ['ANSUT']
    },
    {
      id: 3,
      title: 'Bureau Riviera 2',
      type: 'Bureau',
      address: 'Cocody, Riviera 2',
      owner: 'Pierre YAO',
      ownerEmail: 'pierre.yao@email.com',
      price: 95000000,
      bedrooms: 0,
      bathrooms: 2,
      area: 180,
      parking: 3,
      status: 'suspended',
      validationStatus: 'rejected',
      image: '/images/property3.jpg',
      createdDate: '2024-03-10',
      lastUpdate: '2024-11-25',
      views: 89,
      rating: 3.9,
      certifications: []
    },
    {
      id: 4,
      title: 'Résidence Les Palmiers',
      type: 'Appartement',
      address: 'Marcory, Zone 4A',
      owner: 'Sarah BAMBA',
      ownerEmail: 'sarah.bamba@trustAnsut.ci',
      price: 120000000,
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      parking: 1,
      status: 'active',
      validationStatus: 'approved',
      image: '/images/property4.jpg',
      createdDate: '2024-04-05',
      lastUpdate: '2024-11-29',
      views: 312,
      rating: 4.6,
      certifications: ['ANSUT', 'Énergie', 'Sécurité']
    },
    {
      id: 5,
      title: 'Maison Familiale Abobo',
      type: 'Maison',
      address: 'Abobo, Té',
      owner: 'Ahmed TRAORE',
      ownerEmail: 'ahmed.traore@email.com',
      price: 75000000,
      bedrooms: 3,
      bathrooms: 2,
      area: 200,
      parking: 1,
      status: 'inactive',
      validationStatus: 'pending',
      image: '/images/property5.jpg',
      createdDate: '2024-05-12',
      lastUpdate: '2024-11-20',
      views: 67,
      rating: 4.1,
      certifications: ['ANSUT']
    }
  ];

  const propertyTypes = [
    { value: 'all', label: 'Tous les types', count: properties.length },
    { value: 'Villa', label: 'Villas', count: properties.filter(p => p.type === 'Villa').length },
    { value: 'Appartement', label: 'Appartements', count: properties.filter(p => p.type === 'Appartement').length },
    { value: 'Maison', label: 'Maisons', count: properties.filter(p => p.type === 'Maison').length },
    { value: 'Bureau', label: 'Bureaux', count: properties.filter(p => p.type === 'Bureau').length }
  ];

  const propertyStatuses = [
    { value: 'all', label: 'Tous les statuts', count: properties.length },
    { value: 'active', label: 'Actives', count: properties.filter(p => p.status === 'active').length },
    { value: 'pending', label: 'En attente', count: properties.filter(p => p.status === 'pending').length },
    { value: 'inactive', label: 'Inactives', count: properties.filter(p => p.status === 'inactive').length },
    { value: 'suspended', label: 'Suspendues', count: properties.filter(p => p.status === 'suspended').length }
  ];

  // Filtrage
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || property.status === selectedStatus;
    const matchesType = selectedType === 'all' || property.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-neutral-100 text-neutral-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-semantic-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-semantic-warning" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-neutral-600" />;
      case 'suspended':
        return <Ban className="w-4 h-4 text-semantic-error" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-neutral-600" />;
    }
  };

  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const formatPrice = (price: number) => {
=======
/**
 * Admin Properties Section - Modération et gestion des propriétés
 */

import { useState } from 'react';

interface Property {
  id: string;
  title: string;
  owner_name: string;
  status: 'en_attente' | 'valide' | 'rejete' | 'suspendu';
  created_at: string;
  city: string;
  property_type?: string;
  price?: number;
  reports_count?: number;
  images_count?: number;
  views?: number;
}

interface AdminPropertiesSectionProps {
  properties: Property[];
  showHeader?: boolean;
}

export function AdminPropertiesSection({ properties, showHeader = false }: AdminPropertiesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'en_attente' | 'valide' | 'rejete' | 'suspendu'>('all');
  const [filterCity, setFilterCity] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'owner'>('date');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  // Générer des données mock réalistes pour simuler 1156 propriétés
  const mockProperties = [
    ...properties,
    // Ajout de propriétés mock pour atteindre un nombre réaliste
    {
      id: 'prop-004',
      title: 'Duplex moderne Treichville',
      owner_name: 'Aya Ouattara',
      status: 'en_attente' as const,
      created_at: '2025-11-30T14:20:00Z',
      city: 'Treichville',
      property_type: 'Duplex',
      price: 180000,
      reports_count: 0,
      images_count: 8,
      views: 156,
    },
    {
      id: 'prop-005',
      title: 'Villa avec piscine Bingerville',
      owner_name: 'Kouadio Jean',
      status: 'valide' as const,
      created_at: '2025-11-29T16:45:00Z',
      city: 'Bingerville',
      property_type: 'Villa',
      price: 450000,
      reports_count: 2,
      images_count: 12,
      views: 423,
    },
    {
      id: 'prop-006',
      title: 'Appartement meublé Plateau',
      owner_name: 'Immobilière Elite',
      status: 'rejete' as const,
      created_at: '2025-11-28T11:30:00Z',
      city: 'Abidjan Plateau',
      property_type: 'Appartement',
      price: 120000,
      reports_count: 5,
      images_count: 6,
      views: 89,
    },
    {
      id: 'prop-007',
      title: 'Maison familiale Yopougon',
      owner_name: 'Fatou Coulibaly',
      status: 'suspendu' as const,
      created_at: '2025-11-27T09:15:00Z',
      city: 'Yopougon',
      property_type: 'Maison',
      price: 95000,
      reports_count: 3,
      images_count: 10,
      views: 267,
    },
    {
      id: 'prop-008',
      title: 'Studio étudiant Cocody',
      owner_name: 'Abou Diarra',
      status: 'en_attente' as const,
      created_at: '2025-11-30T10:30:00Z',
      city: 'Cocody',
      property_type: 'Studio',
      price: 65000,
      reports_count: 0,
      images_count: 5,
      views: 78,
    },
  ];

  const filteredProperties = mockProperties
    .filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.owner_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || property.status === filterStatus;
      const matchesCity = filterCity === 'all' || property.city === filterCity;
      return matchesSearch && matchesStatus && matchesCity;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'owner':
          return a.owner_name.localeCompare(b.owner_name);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const handlePropertyAction = (propertyId: string, action: 'validate' | 'reject' | 'suspend' | 'view') => {
    console.log(`${action} property:`, propertyId);
    // TODO: Implémenter les actions réelles
  };

  const handleBulkAction = (action: 'validate' | 'reject' | 'suspend') => {
    console.log(`Bulk ${action}:`, selectedProperties);
    setSelectedProperties([]);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'valide': return 'Validé';
      case 'rejete': return 'Rejeté';
      case 'suspendu': return 'Suspendu';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-semantic-warning';
      case 'valide': return 'bg-success-100 text-success-700';
      case 'rejete': return 'bg-red-100 text-semantic-error';
      case 'suspendu': return 'bg-orange-100 text-semantic-error';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
<<<<<<< HEAD
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Gestion des Propriétés
            </h2>
            <p className="text-neutral-700">
              Administration et validation des biens immobiliers de la plateforme ANSUT
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Propriété
=======
    }).format(price);
  };

  const propertyStats = {
    total: 1156,
    en_attente: 42,
    valide: 987,
    rejete: 89,
    suspendu: 38,
    reports: 23,
  };

  const cities = ['all', 'Abidjan Plateau', 'Cocody', 'Treichville', 'Yopougon', 'Bingerville', 'Marcory', 'Adjamé'];

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="bg-background-page rounded-2xl border border-neutral-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-h4 font-bold text-text-primary">Modération des Propriétés</h2>
              <p className="text-text-secondary mt-1">
                Validation et contrôle qualité ({propertyStats.total.toLocaleString()} propriétés)
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                <div className="text-yellow-700 text-sm font-semibold">{propertyStats.en_attente}</div>
                <div className="text-yellow-600 text-xs">En attente</div>
              </div>
              <div className="bg-success-50 px-3 py-2 rounded-lg border border-success-200">
                <div className="text-success-700 text-sm font-semibold">{propertyStats.valide}</div>
                <div className="text-success-600 text-xs">Validées</div>
              </div>
              <div className="bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                <div className="text-red-700 text-sm font-semibold">{propertyStats.reports}</div>
                <div className="text-red-600 text-xs">Signalées</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions for Moderation */}
      <div className="bg-background-page rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-h6 font-semibold text-text-primary mb-4">Actions de Modération Rapide</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 bg-success-50 border border-success-200 rounded-xl hover:bg-success-100 transition-colors">
            <div className="bg-success-500 p-2 rounded-lg">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-success-700">Validation Massive</div>
              <div className="text-sm text-success-600">Valider toutes les propriétés conformes</div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-semantic-warning bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-colors">
            <div className="bg-semantic-warning p-2 rounded-lg">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-yellow-700">Propriétés Signalées</div>
              <div className="text-sm text-yellow-600">{propertyStats.reports} à examiner</div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-semantic-error bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
            <div className="bg-semantic-error p-2 rounded-lg">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-red-700">Nettoyage</div>
              <div className="text-sm text-red-600">Supprimer contenu inapproprié</div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-semantic-info bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">
            <div className="bg-semantic-info p-2 rounded-lg">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-blue-700">Rapport Qualité</div>
              <div className="text-sm text-blue-600">Analyse des données</div>
            </div>
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">Total Propriétés</p>
              <p className="text-3xl font-bold text-neutral-900">{properties.length}</p>
              <p className="text-sm text-semantic-success mt-1">+8% ce mois</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">Propriétés Actives</p>
              <p className="text-3xl font-bold text-neutral-900">
                {properties.filter(p => p.status === 'active').length}
              </p>
              <p className="text-sm text-semantic-success mt-1">En ligne</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-semantic-success" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">En Attente</p>
              <p className="text-3xl font-bold text-neutral-900">
                {properties.filter(p => p.status === 'pending').length}
              </p>
              <p className="text-sm text-semantic-warning mt-1">Validation requise</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-semantic-warning" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">Suspendues</p>
              <p className="text-3xl font-bold text-neutral-900">
                {properties.filter(p => p.status === 'suspended').length}
              </p>
              <p className="text-sm text-semantic-error mt-1">Action requise</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <Ban className="w-6 h-6 text-semantic-error" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par titre, adresse ou propriétaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filtre par type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {propertyTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label} ({type.count})
              </option>
            ))}
          </select>

          {/* Filtre par statut */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {propertyStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label} ({status.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grille des propriétés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
            {/* Image de la propriété */}
            <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
              <Home className="w-12 h-12 text-purple-400" />
            </div>

            <div className="p-6">
              {/* En-tête */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-sm text-neutral-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.address}
                  </div>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(property.status)}
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                    {property.status === 'active' ? 'Active' : 
                     property.status === 'pending' ? 'En attente' :
                     property.status === 'inactive' ? 'Inactive' : 'Suspendue'}
                  </span>
                </div>
              </div>

              {/* Propriétaire */}
              <div className="flex items-center text-sm text-neutral-600 mb-3">
                <User className="w-4 h-4 mr-1" />
                {property.owner}
              </div>

              {/* Caractéristiques */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {property.bedrooms > 0 && (
                  <div className="flex items-center text-sm text-neutral-600">
                    <Bed className="w-4 h-4 mr-2" />
                    {property.bedrooms} ch.
                  </div>
                )}
                <div className="flex items-center text-sm text-neutral-600">
                  <Bath className="w-4 h-4 mr-2" />
                  {property.bathrooms} sdb.
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <Square className="w-4 h-4 mr-2" />
                  {property.area} m²
                </div>
                {property.parking > 0 && (
                  <div className="flex items-center text-sm text-neutral-600">
                    <Car className="w-4 h-4 mr-2" />
                    {property.parking} park.
                  </div>
                )}
              </div>

              {/* Prix */}
              <div className="text-lg font-bold text-neutral-900 mb-3">
                {formatPrice(property.price)}
              </div>

              {/* Statut de validation */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getValidationStatusColor(property.validationStatus)}`}>
                  {property.validationStatus === 'approved' ? 'Validée' :
                   property.validationStatus === 'pending' ? 'En attente' : 'Refusée'}
                </span>
                <div className="flex items-center text-sm text-neutral-600">
                  <Star className="w-4 h-4 mr-1 text-yellow-400" />
                  {property.rating}
                </div>
              </div>

              {/* Certifications */}
              {property.certifications.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {property.certifications.map((cert, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-neutral-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center text-xs text-neutral-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(property.lastUpdate).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucune propriété */}
      {filteredProperties.length === 0 && (
        <div className="bg-white rounded-lg p-12 border border-neutral-200 text-center">
          <Home className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            Aucune propriété trouvée
          </h3>
          <p className="text-neutral-600">
            Essayez de modifier vos critères de recherche ou ajoutez une nouvelle propriété.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPropertiesSection;
=======
      {/* Filters & Search */}
      <div className="bg-background-page rounded-2xl border border-neutral-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher par titre ou propriétaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="valide">Validé</option>
              <option value="rejete">Rejeté</option>
              <option value="suspendu">Suspendu</option>
            </select>

            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Toutes les villes</option>
              {cities.filter(city => city !== 'all').map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="date">Trier par date</option>
              <option value="title">Trier par titre</option>
              <option value="owner">Trier par propriétaire</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProperties.length > 0 && (
          <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-700">
                {selectedProperties.length} propriété(s) sélectionnée(s)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('validate')}
                  className="px-3 py-1 bg-success-600 text-white text-sm rounded-lg hover:bg-success-700"
                >
                  Valider
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="px-3 py-1 bg-semantic-error text-white text-sm rounded-lg hover:bg-red-600"
                >
                  Rejeter
                </button>
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="px-3 py-1 bg-semantic-warning text-white text-sm rounded-lg hover:bg-yellow-600"
                >
                  Suspendre
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Properties Table */}
      <div className="bg-background-page rounded-2xl border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProperties.length === filteredProperties.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProperties(filteredProperties.map(p => p.id));
                      } else {
                        setSelectedProperties([]);
                      }
                    }}
                    className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Propriété
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Propriétaire
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Signalements
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Date d'ajout
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(property.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProperties([...selectedProperties, property.id]);
                        } else {
                          setSelectedProperties(selectedProperties.filter(id => id !== property.id));
                        }
                      }}
                      className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-500 text-white rounded-lg w-12 h-12 flex items-center justify-center text-sm font-semibold">
                        🏠
                      </div>
                      <div>
                        <div className="font-medium text-text-primary line-clamp-1">{property.title}</div>
                        <div className="text-sm text-neutral-500">{property.city} • {property.property_type}</div>
                        <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                          <span>👁️ {property.views || 0}</span>
                          <span>🖼️ {property.images_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-text-primary">{property.owner_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                      {getStatusLabel(property.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-text-primary">
                    {formatPrice(property.price)}
                  </td>
                  <td className="px-6 py-4">
                    {property.reports_count && property.reports_count > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-semantic-error">
                        ⚠️ {property.reports_count}
                      </span>
                    ) : (
                      <span className="text-sm text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {formatDate(property.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handlePropertyAction(property.id, 'view')}
                        className="p-2 text-neutral-500 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Voir détails"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {property.status === 'en_attente' && (
                        <>
                          <button
                            onClick={() => handlePropertyAction(property.id, 'validate')}
                            className="p-2 text-neutral-500 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                            title="Valider"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handlePropertyAction(property.id, 'reject')}
                            className="p-2 text-neutral-500 hover:text-semantic-error hover:bg-red-50 rounded-lg transition-colors"
                            title="Rejeter"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                      
                      {property.status === 'valide' && (
                        <button
                          onClick={() => handlePropertyAction(property.id, 'suspend')}
                          className="p-2 text-neutral-500 hover:text-semantic-warning hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Suspendre"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              Affichage de {filteredProperties.length} sur {propertyStats.total.toLocaleString()} propriétés
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
                Précédent
              </button>
              <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
                2
              </button>
              <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
                3
              </button>
              <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
