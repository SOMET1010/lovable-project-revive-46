import React, { useState } from 'react';
import { 
  Award, 
  FileText, 
  Download, 
  Upload, 
  Eye, 
  Calendar, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Home,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Shield,
  Star,
  Bell,
  FileCheck,
  FileX,
  Archive
} from 'lucide-react';

interface Document {
  id: number;
  type: 'certificat-conformite' | 'attestation-securite' | 'rapport-technique' | 'plan-evacuation' | 'attestation-incendie';
  title: string;
  property: string;
  owner: string;
  issueDate: string;
  expiryDate?: string;
  status: 'valid' | 'expired' | 'expiring-soon' | 'pending' | 'draft';
  downloadUrl?: string;
  fileSize?: string;
  certificationLevel?: 'basic' | 'premium' | 'excellence';
  certificateNumber?: string;
  lastUpdated: string;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

const TrustDocumentsSection: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Données mock des documents
  const documents: Document[] = [
    {
      id: 1,
      type: 'certificat-conformite',
      title: 'Certificat de Conformité ANSUT',
      property: 'Villa Bellevue',
      owner: 'M. KOUASSI Jean',
      issueDate: '2025-11-29',
      expiryDate: '2026-11-29',
      status: 'valid',
      downloadUrl: '/documents/certificat-villa-bellevue.pdf',
      fileSize: '2.3 MB',
      certificationLevel: 'excellence',
      certificateNumber: 'ANSUT-2025-CC-001',
      lastUpdated: '2025-11-29',
      priority: 'high'
    },
    {
      id: 2,
      type: 'rapport-technique',
      title: 'Rapport Technique d\'Inspection',
      property: 'Appartement Riviera',
      owner: 'Mme TRAORE Aya',
      issueDate: '2025-11-25',
      status: 'pending',
      downloadUrl: '/documents/raptech-appart-riviera.pdf',
      fileSize: '4.1 MB',
      lastUpdated: '2025-11-30',
      priority: 'medium',
      notes: 'En attente de validation finale'
    },
    {
      id: 3,
      type: 'attestation-securite',
      title: 'Attestation de Sécurité Incendie',
      property: 'Résidence Les Palmiers',
      owner: 'SCI Palmiers SA',
      issueDate: '2025-11-27',
      expiryDate: '2026-11-27',
      status: 'valid',
      downloadUrl: '/documents/attestation-securite-palmiers.pdf',
      fileSize: '1.8 MB',
      certificateNumber: 'ANSUT-2025-AS-003',
      lastUpdated: '2025-11-27',
      priority: 'high'
    },
    {
      id: 4,
      type: 'certificat-conformite',
      title: 'Certificat de Conformité ANSUT',
      property: 'Villa Yopougon',
      owner: 'M. DIALLO Ousmane',
      issueDate: '2024-11-15',
      expiryDate: '2025-11-15',
      status: 'expired',
      downloadUrl: '/documents/certificat-villa-yopougon.pdf',
      fileSize: '2.0 MB',
      certificationLevel: 'basic',
      certificateNumber: 'ANSUT-2024-CC-025',
      lastUpdated: '2025-11-15',
      priority: 'high',
      notes: 'Certificat expiré - renouvellement requis'
    },
    {
      id: 5,
      type: 'plan-evacuation',
      title: 'Plan d\'Évacuation et Sécurité',
      property: 'Immeuble Cocody Centre',
      owner: 'M. BAKAYOKO Ibrahim',
      issueDate: '2025-11-20',
      status: 'expiring-soon',
      expiryDate: '2025-12-20',
      downloadUrl: '/documents/plan-evacuation-cocody.pdf',
      fileSize: '3.2 MB',
      lastUpdated: '2025-11-20',
      priority: 'medium'
    },
    {
      id: 6,
      type: 'rapport-technique',
      title: 'Rapport Technique de Contrôle',
      property: 'Commerce Plateau',
      owner: 'SARL Commerce Plus',
      issueDate: '2025-10-20',
      status: 'draft',
      fileSize: '1.5 MB',
      lastUpdated: '2025-11-30',
      priority: 'high',
      notes: 'Brouillon en cours de rédaction'
    },
    {
      id: 7,
      type: 'attestation-incendie',
      title: 'Attestation de Conformité Incendie',
      property: 'Résidence II Plateau',
      owner: 'SCI Plateau Plus',
      issueDate: '2025-11-15',
      expiryDate: '2026-11-15',
      status: 'valid',
      downloadUrl: '/documents/attestation-incidente-plateau.pdf',
      fileSize: '2.1 MB',
      certificateNumber: 'ANSUT-2025-AI-012',
      lastUpdated: '2025-11-15',
      priority: 'high'
    },
    {
      id: 8,
      type: 'certificat-conformite',
      title: 'Certificat de Conformité ANSUT',
      property: 'Appartement Marcory',
      owner: 'Mme KONE Aminata',
      issueDate: '2025-11-10',
      expiryDate: '2025-12-10',
      status: 'expiring-soon',
      downloadUrl: '/documents/certificat-appart-marcory.pdf',
      fileSize: '2.5 MB',
      certificationLevel: 'premium',
      certificateNumber: 'ANSUT-2025-CC-045',
      lastUpdated: '2025-11-10',
      priority: 'high',
      notes: 'Expire dans 10 jours'
    }
  ];

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'valid': { 
        label: 'Valide', 
        color: 'bg-green-100 text-semantic-success', 
        icon: CheckCircle 
      },
      'expired': { 
        label: 'Expiré', 
        color: 'bg-red-100 text-semantic-error', 
        icon: XCircle 
      },
      'expiring-soon': { 
        label: 'Expire bientôt', 
        color: 'bg-yellow-100 text-semantic-warning', 
        icon: AlertTriangle 
      },
      'pending': { 
        label: 'En attente', 
        color: 'bg-blue-100 text-blue-800', 
        icon: Clock 
      },
      'draft': { 
        label: 'Brouillon', 
        color: 'bg-gray-100 text-gray-800', 
        icon: FileText 
      }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.draft;
  };

  const getTypeInfo = (type: string) => {
    const typeMap = {
      'certificat-conformite': { 
        label: 'Certificat Conformité', 
        color: 'bg-green-100 text-green-800',
        icon: Shield
      },
      'attestation-securite': { 
        label: 'Attestation Sécurité', 
        color: 'bg-red-100 text-red-800',
        icon: Award
      },
      'rapport-technique': { 
        label: 'Rapport Technique', 
        color: 'bg-blue-100 text-blue-800',
        icon: FileText
      },
      'plan-evacuation': { 
        label: 'Plan d\'Évacuation', 
        color: 'bg-orange-100 text-orange-800',
        icon: Home
      },
      'attestation-incendie': { 
        label: 'Attestation Incendie', 
        color: 'bg-purple-100 text-purple-800',
        icon: Award
      }
    };
    return typeMap[type as keyof typeof typeMap] || typeMap['rapport-technique'];
  };

  const getLevelInfo = (level?: string) => {
    if (!level) return null;
    const levelMap = {
      'basic': { label: 'Standard', color: 'bg-blue-100 text-blue-800', icon: Star },
      'premium': { label: 'Premium', color: 'bg-purple-100 text-purple-800', icon: Star },
      'excellence': { label: 'Excellence', color: 'bg-emerald-100 text-emerald-800', icon: Award }
    };
    return levelMap[level as keyof typeof levelMap] || levelMap.basic;
  };

  const getDaysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = selectedFilter === 'all' || doc.status === selectedFilter;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.owner.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const documentStats = {
    total: documents.length,
    valid: documents.filter(d => d.status === 'valid').length,
    expired: documents.filter(d => d.status === 'expired').length,
    expiringSoon: documents.filter(d => d.status === 'expiring-soon').length,
    pending: documents.filter(d => d.status === 'pending').length
  };

  const expiringSoonDocs = documents.filter(d => 
    d.status === 'expiring-soon' || 
    (d.expiryDate && getDaysUntilExpiry(d.expiryDate) !== null && getDaysUntilExpiry(d.expiryDate)! <= 30)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Documents et Attestations ANSUT
            </h2>
            <p className="text-neutral-700">
              Gestion des certificats et documents de conformité
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
              <Upload className="w-4 h-4 mr-2" />
              Importer document
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200">
              <Award className="w-4 h-4 mr-2" />
              Nouveau certificat
            </button>
          </div>
        </div>
      </div>

      {/* Alert for Expiring Documents */}
      {expiringSoonDocs.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-semantic-warning mr-2" />
            <h3 className="text-lg font-semibold text-neutral-900">
              Documents expirant bientôt ({expiringSoonDocs.length})
            </h3>
          </div>
          <div className="mt-2 space-y-2">
            {expiringSoonDocs.slice(0, 3).map((doc) => {
              const days = getDaysUntilExpiry(doc.expiryDate);
              return (
                <div key={doc.id} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-900">
                    {doc.title} - {doc.property}
                  </span>
                  <span className="text-semantic-warning font-medium">
                    Expire dans {days} jour{days !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
            {expiringSoonDocs.length > 3 && (
              <button className="text-sm text-semantic-warning hover:text-semantic-warning font-medium">
                Voir tous les documents expirant bientôt
              </button>
            )}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Total Documents</p>
              <p className="text-lg font-bold text-neutral-900">{documentStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-semantic-success" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Valides</p>
              <p className="text-lg font-bold text-neutral-900">{documentStats.valid}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-semantic-warning" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Expirent bientôt</p>
              <p className="text-lg font-bold text-neutral-900">{documentStats.expiringSoon}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-semantic-error" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Expirés</p>
              <p className="text-lg font-bold text-neutral-900">{documentStats.expired}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">En attente</p>
              <p className="text-lg font-bold text-neutral-900">{documentStats.pending}</p>
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
                placeholder="Rechercher un document..."
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
              <option value="valid">Valides</option>
              <option value="expiring-soon">Expire bientôt</option>
              <option value="expired">Expirés</option>
              <option value="pending">En attente</option>
              <option value="draft">Brouillons</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-neutral-700 hover:bg-neutral-50 rounded-lg">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 text-neutral-700 hover:bg-neutral-50 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg border border-primary-200">
              Exporter liste
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Liste des Documents
          </h3>
        </div>
        
        <div className="divide-y divide-neutral-200">
          {filteredDocuments.map((document) => {
            const statusInfo = getStatusInfo(document.status);
            const typeInfo = getTypeInfo(document.type);
            const levelInfo = getLevelInfo(document.certificationLevel);
            const StatusIcon = statusInfo.icon;
            const TypeIcon = typeInfo.icon;
            const daysUntilExpiry = getDaysUntilExpiry(document.expiryDate);

            return (
              <div key={document.id} className="p-6 hover:bg-neutral-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <TypeIcon className={`w-5 h-5 ${typeInfo.color.includes('green') ? 'text-green-600' : 
                                                   typeInfo.color.includes('red') ? 'text-red-600' :
                                                   typeInfo.color.includes('blue') ? 'text-blue-600' :
                                                   typeInfo.color.includes('orange') ? 'text-orange-600' : 'text-purple-600'}`} />
                      <h4 className="text-lg font-semibold text-neutral-900">
                        {document.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </span>
                      {levelInfo && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelInfo.color}`}>
                          <levelInfo.icon className="w-3 h-3 mr-1" />
                          {levelInfo.label}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-neutral-700 mb-2">
                      <div className="flex items-center">
                        <Home className="w-4 h-4 mr-2 text-neutral-500" />
                        <span>{document.property}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-neutral-500" />
                        <span>{document.owner}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-neutral-500" />
                        <span>Émis le {new Date(document.issueDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-neutral-500">
                          {document.fileSize && `${document.fileSize} • `}
                          MAJ: {new Date(document.lastUpdated).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {document.certificateNumber && (
                        <span className="text-xs text-neutral-600">
                          N° {document.certificateNumber}
                        </span>
                      )}
                      {document.expiryDate && (
                        <span className="text-xs text-neutral-600">
                          Expire le {new Date(document.expiryDate).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      {daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
                        <span className="text-xs font-medium text-semantic-warning">
                          Expire dans {daysUntilExpiry} jour{daysUntilExpiry !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    
                    {document.notes && (
                      <p className="text-sm text-neutral-600 mt-2 italic">
                        {document.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {document.downloadUrl && (
                      <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Prévisualiser">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    
                    {document.downloadUrl && (
                      <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Télécharger">
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Renouveler">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    
                    <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Ouvrir dans nouvel onglet">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    
                    {document.status === 'draft' && (
                      <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Finaliser
                      </button>
                    )}
                    
                    {document.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-semantic-success text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                          Valider
                        </button>
                        <button className="px-3 py-1 text-sm bg-semantic-error text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
                          Rejeter
                        </button>
                      </div>
                    )}
                    
                    {(document.status === 'expired' || (daysUntilExpiry !== null && daysUntilExpiry <= 30)) && (
                      <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                        Renouveler
                      </button>
                    )}
                    
                    {document.status === 'valid' && (
                      <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                        Partager
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document Templates */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <FileText className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Templates de Documents ANSUT
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-neutral-900 mb-2">Certificat de Conformité</h4>
            <p className="text-sm text-neutral-700 mb-3">Template officiel ANSUT pour certificats</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Utiliser le template
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-neutral-900 mb-2">Attestation de Sécurité</h4>
            <p className="text-sm text-neutral-700 mb-3">Template pour attestations sécurité</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Utiliser le template
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-neutral-900 mb-2">Rapport Technique</h4>
            <p className="text-sm text-neutral-700 mb-3">Template standard rapport inspection</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Utiliser le template
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-neutral-700 mr-2" />
            <h3 className="text-lg font-semibold text-neutral-900">
              Notifications d'Expiration
            </h3>
          </div>
          <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
            Configurer alertes
          </button>
        </div>
        <p className="text-sm text-neutral-700 mt-2">
          Recevez des notifications automatiques 30, 15 et 7 jours avant l'expiration des documents.
        </p>
      </div>
    </div>
  );
};

export default TrustDocumentsSection;