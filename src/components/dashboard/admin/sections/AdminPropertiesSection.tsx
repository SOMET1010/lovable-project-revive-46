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
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
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
          </button>
        </div>
      </div>

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