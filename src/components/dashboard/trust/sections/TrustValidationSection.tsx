import React, { useState } from 'react';
<<<<<<< HEAD
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  MapPin,
  Home,
  Zap,
  Droplets,
  Wrench,
  Shield,
  FileCheck,
  User,
  Calendar,
  ChevronRight,
  Camera,
  Download,
  Filter
} from 'lucide-react';

const TrustValidationSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Données mock des propriétés à valider
  const propertiesToValidate = [
    {
      id: 'PROP-001',
      address: 'Villa Bellevue, Cocody',
      type: 'Villa familiale',
      owner: 'M. KOUASSI Jean',
      submitDate: '2024-11-25',
      status: 'pending',
      conformity: {
        electrical: { status: 'valid', score: 95, notes: 'Installation conforme aux normes' },
        plumbing: { status: 'valid', score: 98, notes: 'Plomberie moderne et aux normes' },
        structure: { status: 'warning', score: 82, notes: 'Fissures mineures détectées' },
        safety: { status: 'valid', score: 92, notes: 'Équipements de sécurité présents' }
      },
      documents: ['Plans architecturaux', 'Certificats électriques', 'Rapport de structure'],
      photos: 24,
      lastUpdated: '2024-11-28'
    },
    {
      id: 'PROP-002',
      address: 'Appartement Riviera, Plateau',
      type: 'Appartement T3',
      owner: 'Mme ADJOUNI Aminata',
      submitDate: '2024-11-24',
      status: 'in_progress',
      conformity: {
        electrical: { status: 'valid', score: 89, notes: 'Installation récente' },
        plumbing: { status: 'valid', score: 94, notes: 'Système de plomberie optimal' },
        structure: { status: 'valid', score: 88, notes: 'Structure solide' },
        safety: { status: 'valid', score: 91, notes: 'Sécurité incendie conforme' }
      },
      documents: ['Plans', 'Certificats conformité', 'Rapport technique'],
      photos: 18,
      lastUpdated: '2024-11-29'
    },
    {
      id: 'PROP-003',
      address: 'Maison Yopougon, Siporex',
      type: 'Maison individuelle',
      owner: 'M. YAO Michel',
      submitDate: '2024-11-23',
      status: 'validated',
      conformity: {
        electrical: { status: 'valid', score: 92, notes: 'Installation conforme' },
        plumbing: { status: 'valid', score: 87, notes: 'Système fonctionnel' },
        structure: { status: 'valid', score: 90, notes: 'Construction solide' },
        safety: { status: 'valid', score: 94, notes: 'Sécurité optimale' }
      },
      documents: ['Plans', 'Certificats', 'Rapports techniques'],
      photos: 32,
      lastUpdated: '2024-11-27'
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-800', icon: Clock, label: 'En attente' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Wrench, label: 'En cours' },
      validated: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Validé' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejeté' }
    };

    const config = styles[status as keyof typeof styles];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    );
  };

  const getConformityStatus = (status: string) => {
    const styles = {
      valid: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-500';
  };

  const filteredProperties = propertiesToValidate.filter(property => {
    if (activeFilter === 'all') return true;
    return property.status === activeFilter;
  });

  const PropertyCard: React.FC<{ property: any }> = ({ property }) => (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Home className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-neutral-900">{property.address}</h3>
          </div>
          <p className="text-sm text-neutral-700 mb-1">{property.type} • {property.owner}</p>
          <p className="text-sm text-neutral-600">Soumis le {new Date(property.submitDate).toLocaleDateString('fr-FR')}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(property.status)}
          <span className="text-xs text-neutral-500">ID: {property.id}</span>
        </div>
      </div>

      {/* Conformité Technique */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-neutral-900 mb-3">Conformité Technique</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
            <div className="flex items-center">
              <Zap className="w-4 h-4 text-amber-600 mr-2" />
              <span className="text-sm text-neutral-700">Électricité</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${getConformityStatus(property.conformity.electrical.status)}`}></div>
              <span className="text-sm font-medium">{property.conformity.electrical.score}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
            <div className="flex items-center">
              <Droplets className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm text-neutral-700">Plomberie</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${getConformityStatus(property.conformity.plumbing.status)}`}></div>
              <span className="text-sm font-medium">{property.conformity.plumbing.score}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
            <div className="flex items-center">
              <Home className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm text-neutral-700">Structure</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${getConformityStatus(property.conformity.structure.status)}`}></div>
              <span className="text-sm font-medium">{property.conformity.structure.score}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
            <div className="flex items-center">
              <Shield className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm text-neutral-700">Sécurité</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${getConformityStatus(property.conformity.safety.status)}`}></div>
              <span className="text-sm font-medium">{property.conformity.safety.score}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges ANSUT */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            <Shield className="w-3 h-3 mr-1" />
            Badge ANSUT Standard
          </span>
          {property.conformity.electrical.status === 'valid' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Électricité Conforme
            </span>
          )}
          {property.conformity.plumbing.status === 'valid' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Plomberie Conforme
            </span>
          )}
        </div>
      </div>

      {/* Documents et Photos */}
      <div className="flex items-center justify-between mb-4 p-3 bg-neutral-50 rounded-lg">
        <div className="flex items-center">
          <FileCheck className="w-4 h-4 text-neutral-600 mr-2" />
          <span className="text-sm text-neutral-700">{property.documents.length} documents</span>
        </div>
        <div className="flex items-center">
          <Camera className="w-4 h-4 text-neutral-600 mr-2" />
          <span className="text-sm text-neutral-700">{property.photos} photos</span>
        </div>
        <span className="text-xs text-neutral-500">Mis à jour: {new Date(property.lastUpdated).toLocaleDateString('fr-FR')}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setSelectedProperty(property)}
          className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          Voir détails
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
        <div className="flex gap-2">
          {property.status === 'pending' && (
            <>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Valider
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center">
                <XCircle className="w-4 h-4 mr-1" />
                Rejeter
              </button>
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Corriger
              </button>
            </>
          )}
          {property.status === 'in_progress' && (
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center">
              <FileCheck className="w-4 h-4 mr-1" />
              Finaliser
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Validation des Propriétés</h2>
          <p className="text-neutral-700 mt-1">Validez et certifiez les propriétés immobilières selon les normes ANSUT</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <select 
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="validated">Validés</option>
              <option value="rejected">Rejetés</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">En attente</p>
              <p className="text-xl font-bold text-neutral-900">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">En cours</p>
              <p className="text-xl font-bold text-neutral-900">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Validés</p>
              <p className="text-xl font-bold text-neutral-900">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Taux conformité</p>
              <p className="text-xl font-bold text-neutral-900">96%</p>
            </div>
=======
import { CheckCircle, XCircle, AlertTriangle, MapPin, Calendar, BarChart3 } from 'lucide-react';

interface Property {
  id: string;
  address: string;
  type: string;
  owner: string;
  status: 'pending' | 'approved' | 'rejected';
  score: number;
  conformity: {
    electricity: 'compliant' | 'non-compliant' | 'pending';
    plumbing: 'compliant' | 'non-compliant' | 'pending';
    structure: 'compliant' | 'non-compliant' | 'pending';
    safety: 'compliant' | 'non-compliant' | 'pending';
  };
  submittedDate: string;
}

const mockProperties: Property[] = [
  {
    id: 'PROP001',
    address: 'Cocody, Riviera 2',
    type: 'Appartement 3 pièces',
    owner: 'Jean Kouassi',
    status: 'pending',
    score: 85,
    conformity: {
      electricity: 'compliant',
      plumbing: 'compliant',
      structure: 'compliant',
      safety: 'pending'
    },
    submittedDate: '2024-11-25'
  },
  {
    id: 'PROP002',
    address: 'Plateau, Rue des Hôtels',
    type: 'Bureau commercial',
    owner: 'SARL Immobilier Plus',
    status: 'approved',
    score: 95,
    conformity: {
      electricity: 'compliant',
      plumbing: 'compliant',
      structure: 'compliant',
      safety: 'compliant'
    },
    submittedDate: '2024-11-20'
  },
  {
    id: 'PROP003',
    address: 'Yopougon, Niangon',
    type: 'Villa familiale',
    owner: 'Marie Ouattara',
    status: 'pending',
    score: 70,
    conformity: {
      electricity: 'compliant',
      plumbing: 'non-compliant',
      structure: 'compliant',
      safety: 'pending'
    },
    submittedDate: '2024-11-28'
  }
];

export function TrustValidationSection() {
  const [properties, setProperties] = useState<Property[]>(mockProperties);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validé
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            En attente
          </span>
        );
    }
  };

  const getConformityIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'non-compliant':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const handleValidate = (id: string, action: 'approve' | 'reject') => {
    setProperties(prev => prev.map(prop => 
      prop.id === id 
        ? { ...prop, status: action === 'approve' ? 'approved' : 'rejected' }
        : prop
    ));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Validation des Propriétés
        </h2>
        <p className="text-neutral-600">
          Gérez les demandes de validation des propriétés selon les normes ANSUT
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">En attente</p>
              <p className="text-2xl font-bold text-neutral-900">
                {properties.filter(p => p.status === 'pending').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Validées</p>
              <p className="text-2xl font-bold text-neutral-900">
                {properties.filter(p => p.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Score moyen</p>
              <p className="text-2xl font-bold text-neutral-900">
                {Math.round(properties.reduce((acc, p) => acc + p.score, 0) / properties.length)}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-primary-600" />
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Liste des propriétés */}
      <div className="space-y-4">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Modal de détails (sera implémenté plus tard) */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Détails de la propriété - {selectedProperty.id}</h3>
              <button 
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
              {/* Contenu détaillé à implémenter */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustValidationSection;
=======
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Propriétés à valider
          </h3>
        </div>
        <div className="divide-y divide-neutral-200">
          {properties.map((property) => (
            <div key={property.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-neutral-900">
                      {property.type}
                    </h4>
                    {getStatusBadge(property.status)}
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1 text-sm text-neutral-600">
                      <MapPin className="w-4 h-4" />
                      <span>{property.address}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-neutral-600">
                      <Calendar className="w-4 h-4" />
                      <span>{property.submittedDate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-600">Propriétaire</p>
                  <p className="font-medium text-neutral-900">{property.owner}</p>
                  <p className="text-sm text-neutral-500">Score: {property.score}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  {getConformityIcon(property.conformity.electricity)}
                  <span className="text-sm text-neutral-700">Électricité</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getConformityIcon(property.conformity.plumbing)}
                  <span className="text-sm text-neutral-700">Plomberie</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getConformityIcon(property.conformity.structure)}
                  <span className="text-sm text-neutral-700">Structure</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getConformityIcon(property.conformity.safety)}
                  <span className="text-sm text-neutral-700">Sécurité</span>
                </div>
              </div>

              {property.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleValidate(property.id, 'approve')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => handleValidate(property.id, 'reject')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
