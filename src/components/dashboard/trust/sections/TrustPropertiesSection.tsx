import React, { useState } from 'react';
import { 
  Home, 
  MapPin, 
  User, 
  Calendar, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Award,
  Filter,
  Search,
  Eye,
  Edit,
  Phone,
  Navigation,
  Star,
  TrendingUp,
  FileText,
  Camera
} from 'lucide-react';

interface Property {
  id: number;
  photo: string;
  address: string;
  owner: string;
  phone: string;
  ansutStatus: 'non-inspecté' | 'en-cours' | 'certifié' | 'expiré' | 'suspendu';
  lastInspection?: string;
  nextInspection?: string;
  certificationLevel: 'basic' | 'premium' | 'excellence';
  score?: number;
  conformity: number;
  type: 'villa' | 'appartement' | 'immeuble' | 'commerce';
  area: number;
  rooms: number;
  value: number;
  location: string;
  coordinates?: { lat: number; lng: number };
  notes?: string;
}

const TrustPropertiesSection: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Données mock des propriétés
  const properties: Property[] = [
    {
      id: 1,
      photo: '/images/villa-bellevue.jpg',
      address: 'Cocody, Rue des Jardins',
      owner: 'M. KOUASSI Jean',
      phone: '+225 07 00 00 01',
      ansutStatus: 'certifié',
      lastInspection: '2025-11-29',
      nextInspection: '2026-11-29',
      certificationLevel: 'excellence',
      score: 95,
      conformity: 98,
      type: 'villa',
      area: 300,
      rooms: 6,
      value: 450000000,
      location: 'Cocody',
      coordinates: { lat: 5.3364, lng: -3.9847 },
      notes: 'Propriété exemplaire, très bien entretenue'
    },
    {
      id: 2,
      photo: '/images/appart-riviera.jpg',
      address: 'Marcory, Zone 4A',
      owner: 'Mme TRAORE Aya',
      phone: '+225 05 00 00 02',
      ansutStatus: 'en-cours',
      lastInspection: '2025-11-25',
      nextInspection: '2025-12-10',
      certificationLevel: 'premium',
      score: 78,
      conformity: 82,
      type: 'appartement',
      area: 120,
      rooms: 3,
      value: 180000000,
      location: 'Marcory',
      coordinates: { lat: 5.2767, lng: -3.9756 },
      notes: 'En cours de rénovation, inspection de contrôle prévue'
    },
    {
      id: 3,
      photo: '/images/residence-palmiers.jpg',
      address: 'Abidjan, Plateau',
      owner: 'SCI Palmiers SA',
      phone: '+225 20 00 00 03',
      ansutStatus: 'certifié',
      lastInspection: '2025-11-27',
      nextInspection: '2026-11-27',
      certificationLevel: 'premium',
      score: 88,
      conformity: 92,
      type: 'immeuble',
      area: 1200,
      rooms: 24,
      value: 1200000000,
      location: 'Plateau',
      coordinates: { lat: 5.3197, lng: -4.0265 },
      notes: 'Immeuble commercial, conformité aux normes'
    },
    {
      id: 4,
      photo: '/images/immeuble-cocody.jpg',
      address: 'Cocody, Deux Plateaux',
      owner: 'M. BAKAYOKO Ibrahim',
      phone: '+225 01 00 00 04',
      ansutStatus: 'non-inspecté',
      certificationLevel: 'basic',
      type: 'immeuble',
      area: 800,
      rooms: 16,
      value: 800000000,
      location: 'Cocody',
      coordinates: { lat: 5.3481, lng: -3.9876 },
      notes: 'Première demande de certification'
    },
    {
      id: 5,
      photo: '/images/villa-yopougon.jpg',
      address: 'Yopougon, Siporex',
      owner: 'M. DIALLO Ousmane',
      phone: '+225 03 00 00 05',
      ansutStatus: 'expiré',
      lastInspection: '2024-11-15',
      certificationLevel: 'basic',
      score: 65,
      conformity: 70,
      type: 'villa',
      area: 250,
      rooms: 5,
      value: 300000000,
      location: 'Yopougon',
      coordinates: { lat: 5.3340, lng: -4.0846 },
      notes: 'Certificat expiré, renouvellement nécessaire'
    },
    {
      id: 6,
      photo: '/images/commerce-plateau.jpg',
      address: 'Plateau, Rue des Hôtels',
      owner: 'SARL Commerce Plus',
      phone: '+225 27 00 00 06',
      ansutStatus: 'suspendu',
      lastInspection: '2025-10-20',
      certificationLevel: 'basic',
      score: 45,
      conformity: 48,
      type: 'commerce',
      area: 400,
      rooms: 8,
      value: 600000000,
      location: 'Plateau',
      coordinates: { lat: 5.3220, lng: -4.0270 },
      notes: 'Suspendu suite à non-conformité détectée'
    }
  ];

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'non-inspecté': { 
        label: 'Non inspecté', 
        color: 'bg-gray-100 text-gray-800', 
        icon: Clock 
      },
      'en-cours': { 
        label: 'En cours', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock 
      },
      'certifié': { 
        label: 'Certifié', 
        color: 'bg-green-100 text-semantic-success', 
        icon: Shield 
      },
      'expiré': { 
        label: 'Expiré', 
        color: 'bg-red-100 text-semantic-error', 
        icon: AlertTriangle 
      },
      'suspendu': { 
        label: 'Suspendu', 
        color: 'bg-orange-100 text-orange-800', 
        icon: AlertTriangle 
      }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap['non-inspecté'];
  };

  const getLevelInfo = (level: string) => {
    const levelMap = {
      'basic': { label: 'Standard', color: 'bg-blue-100 text-blue-800', icon: Star },
      'premium': { label: 'Premium', color: 'bg-purple-100 text-purple-800', icon: Star },
      'excellence': { label: 'Excellence', color: 'bg-emerald-100 text-emerald-800', icon: Award }
    };
    return levelMap[level as keyof typeof levelMap] || levelMap.basic;
  };

  const getTypeInfo = (type: string) => {
    const typeMap = {
      'villa': { label: 'Villa', color: 'bg-green-100 text-green-800' },
      'appartement': { label: 'Appartement', color: 'bg-blue-100 text-blue-800' },
      'immeuble': { label: 'Immeuble', color: 'bg-purple-100 text-purple-800' },
      'commerce': { label: 'Commerce', color: 'bg-orange-100 text-orange-800' }
    };
    return typeMap[type as keyof typeof typeMap] || typeMap['villa'];
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-neutral-500';
    if (score >= 90) return 'text-semantic-success';
    if (score >= 75) return 'text-semantic-warning';
    return 'text-semantic-error';
  };

  const filteredProperties = properties.filter(property => {
    const matchesFilter = selectedFilter === 'all' || property.ansutStatus === selectedFilter;
    const matchesSearch = property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const propertyStats = {
    total: properties.length,
    certifies: properties.filter(p => p.ansutStatus === 'certifié').length,
    enCours: properties.filter(p => p.ansutStatus === 'en-cours').length,
    nonInspectes: properties.filter(p => p.ansutStatus === 'non-inspecté').length,
    valueTotal: properties.reduce((sum, p) => sum + p.value, 0)
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Propriétés ANSUT
            </h2>
            <p className="text-neutral-700">
              Gestion des biens à certifier et propriétés validées
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
              <Home className="w-4 h-4 mr-2" />
              Nouvelle propriété
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Total Propriétés</p>
              <p className="text-lg font-bold text-neutral-900">{propertyStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <Shield className="w-5 h-5 text-semantic-success" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Certifiées</p>
              <p className="text-lg font-bold text-neutral-900">{propertyStats.certifies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-semantic-warning" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">En cours</p>
              <p className="text-lg font-bold text-neutral-900">{propertyStats.enCours}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Non inspectées</p>
              <p className="text-lg font-bold text-neutral-900">{propertyStats.nonInspectes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Valeur Totale</p>
              <p className="text-lg font-bold text-neutral-900">
                {(propertyStats.valueTotal / 1000000).toFixed(0)}M F
              </p>
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
              <option value="non-inspecté">Non inspecté</option>
              <option value="en-cours">En cours</option>
              <option value="certifié">Certifié</option>
              <option value="expiré">Expiré</option>
              <option value="suspendu">Suspendu</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-neutral-700 hover:bg-neutral-50 rounded-lg">
              <Filter className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg border border-primary-200">
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Properties Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            const statusInfo = getStatusInfo(property.ansutStatus);
            const levelInfo = getLevelInfo(property.certificationLevel);
            const typeInfo = getTypeInfo(property.type);
            const StatusIcon = statusInfo.icon;
            const LevelIcon = levelInfo.icon;

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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelInfo.color}`}>
                      <LevelIcon className="w-3 h-3 mr-1" />
                      {levelInfo.label}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-lg font-bold">{property.address}</p>
                    <p className="text-sm opacity-90">{property.location}</p>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    {property.score && (
                      <div className="flex items-center">
                        <span className="text-sm text-neutral-700 mr-1">Score:</span>
                        <span className={`text-sm font-bold ${getScoreColor(property.score)}`}>
                          {property.score}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-neutral-700 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-neutral-500" />
                      <span>{property.owner}</span>
                    </div>
                    <div className="flex items-center">
                      <Home className="w-4 h-4 mr-2 text-neutral-500" />
                      <span>{property.area}m² • {property.rooms} pièces</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-neutral-500" />
                      <span>{(property.value / 1000000).toFixed(0)}M F CFA</span>
                    </div>
                    {property.lastInspection && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-neutral-500" />
                        <span>Dernière: {new Date(property.lastInspection).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors duration-200">
                      <Eye className="w-4 h-4 mr-1 inline" />
                      Voir
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                      <Calendar className="w-4 h-4 mr-1 inline" />
                      Inspector
                    </button>
                  </div>

                  {property.notes && (
                    <p className="text-xs text-neutral-600 mt-2 italic">
                      {property.notes}
                    </p>
                  )}
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
              const statusInfo = getStatusInfo(property.ansutStatus);
              const levelInfo = getLevelInfo(property.certificationLevel);
              const typeInfo = getTypeInfo(property.type);
              const StatusIcon = statusInfo.icon;
              const LevelIcon = levelInfo.icon;

              return (
                <div key={property.id} className="p-6 hover:bg-neutral-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Property Image */}
                      <div className="w-16 h-16 bg-neutral-200 rounded-lg flex-shrink-0" />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-neutral-900">
                            {property.address}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelInfo.color}`}>
                            <LevelIcon className="w-3 h-3 mr-1" />
                            {levelInfo.label}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-neutral-700">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{property.owner}</span>
                          </div>
                          <div className="flex items-center">
                            <Home className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{property.area}m² • {property.rooms} pièces</span>
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{(property.value / 1000000).toFixed(0)}M F CFA</span>
                          </div>
                          {property.lastInspection && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-neutral-500" />
                              <span>Dernière: {new Date(property.lastInspection).toLocaleDateString('fr-FR')}</span>
                            </div>
                          )}
                        </div>
                        
                        {property.score && (
                          <div className="mt-2">
                            <span className="text-sm text-neutral-700 mr-2">Score de conformité:</span>
                            <span className={`text-sm font-bold ${getScoreColor(property.score)}`}>
                              {property.score}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Voir détails">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Modifier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Contacter">
                        <Phone className="w-4 h-4" />
                      </button>
                      {property.coordinates && (
                        <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Voir sur la carte">
                          <Navigation className="w-4 h-4" />
                        </button>
                      )}
                      
                      {property.ansutStatus === 'non-inspecté' && (
                        <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                          Programmer inspection
                        </button>
                      )}
                      
                      {property.ansutStatus === 'certifié' && (
                        <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                          Voir certificat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Standards and Norms */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <FileText className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Standards et Normes ANSUT
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-neutral-900 mb-2">Normes de Construction</h4>
            <p className="text-sm text-neutral-700 mb-3">Réglementations techniques bâtiment</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Consulter
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-neutral-900 mb-2">Standards Sécurité</h4>
            <p className="text-sm text-neutral-700 mb-3">Normes de sécurité incendie et évacuation</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Consulter
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-neutral-900 mb-2">Évaluation Qualité</h4>
            <p className="text-sm text-neutral-700 mb-3">Critères d'évaluation et scoring</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Consulter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustPropertiesSection;