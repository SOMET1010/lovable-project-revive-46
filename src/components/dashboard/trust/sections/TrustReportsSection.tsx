import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Share, 
  Eye, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  Home,
  User,
  Search,
  Filter,
  TrendingUp,
  Award,
  AlertTriangle,
  FileCheck,
  FileX
} from 'lucide-react';

interface Report {
  id: number;
  property: string;
  address: string;
  inspectionDate: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published';
  conclusion: 'conforme' | 'non-conforme' | 'partiellement-conforme';
  inspector: string;
  createdAt: string;
  lastModified: string;
  type: 'first-visit' | 'quality-control' | 'recertification';
  score: number;
  hasAttachments: boolean;
}

const TrustReportsSection: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Données mock des rapports
  const reports: Report[] = [
    {
      id: 1,
      property: 'Villa Bellevue',
      address: 'Cocody, Rue des Jardins',
      inspectionDate: '2025-11-29',
      status: 'approved',
      conclusion: 'conforme',
      inspector: 'Jean MUKENDI',
      createdAt: '2025-11-29',
      lastModified: '2025-11-29',
      type: 'first-visit',
      score: 95,
      hasAttachments: true
    },
    {
      id: 2,
      property: 'Appartement Riviera',
      address: 'Marcory, Zone 4A',
      inspectionDate: '2025-11-28',
      status: 'pending',
      conclusion: 'partiellement-conforme',
      inspector: 'Jean MUKENDI',
      createdAt: '2025-11-28',
      lastModified: '2025-11-30',
      type: 'quality-control',
      score: 78,
      hasAttachments: true
    },
    {
      id: 3,
      property: 'Résidence Les Palmiers',
      address: 'Abidjan, Plateau',
      inspectionDate: '2025-11-27',
      status: 'published',
      conclusion: 'conforme',
      inspector: 'Jean MUKENDI',
      createdAt: '2025-11-27',
      lastModified: '2025-11-28',
      type: 'recertification',
      score: 92,
      hasAttachments: true
    },
    {
      id: 4,
      property: 'Immeuble Cocody Centre',
      address: 'Cocody, Deux Plateaux',
      inspectionDate: '2025-11-26',
      status: 'draft',
      conclusion: 'non-conforme',
      inspector: 'Jean MUKENDI',
      createdAt: '2025-11-26',
      lastModified: '2025-11-30',
      type: 'first-visit',
      score: 65,
      hasAttachments: false
    },
    {
      id: 5,
      property: 'Villa Yopougon',
      address: 'Yopougon, Siporex',
      inspectionDate: '2025-11-25',
      status: 'approved',
      conclusion: 'conforme',
      inspector: 'Jean MUKENDI',
      createdAt: '2025-11-25',
      lastModified: '2025-11-26',
      type: 'quality-control',
      score: 88,
      hasAttachments: true
    },
    {
      id: 6,
      property: 'Résidence II Plateau',
      address: 'Plateau, Rue des Hôtels',
      inspectionDate: '2025-11-24',
      status: 'rejected',
      conclusion: 'non-conforme',
      inspector: 'Jean MUKENDI',
      createdAt: '2025-11-24',
      lastModified: '2025-11-25',
      type: 'recertification',
      score: 45,
      hasAttachments: true
    }
  ];

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'draft': { 
        label: 'Brouillon', 
        color: 'bg-gray-100 text-gray-800', 
        icon: Edit3 
      },
      'pending': { 
        label: 'En attente', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock 
      },
      'approved': { 
        label: 'Approuvé', 
        color: 'bg-green-100 text-semantic-success', 
        icon: CheckCircle 
      },
      'rejected': { 
        label: 'Rejeté', 
        color: 'bg-red-100 text-semantic-error', 
        icon: XCircle 
      },
      'published': { 
        label: 'Publié', 
        color: 'bg-blue-100 text-blue-800', 
        icon: Award 
      }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.draft;
  };

  const getConclusionInfo = (conclusion: string) => {
    const conclusionMap = {
      'conforme': { 
        label: 'Conforme', 
        color: 'bg-green-100 text-semantic-success', 
        icon: CheckCircle 
      },
      'non-conforme': { 
        label: 'Non-conforme', 
        color: 'bg-red-100 text-semantic-error', 
        icon: XCircle 
      },
      'partiellement-conforme': { 
        label: 'Partiellement conforme', 
        color: 'bg-yellow-100 text-semantic-warning', 
        icon: AlertTriangle 
      }
    };
    return conclusionMap[conclusion as keyof typeof conclusionMap] || conclusionMap['conforme'];
  };

  const getTypeInfo = (type: string) => {
    const typeMap = {
      'first-visit': { label: 'Première visite', color: 'bg-purple-100 text-purple-800' },
      'quality-control': { label: 'Contrôle qualité', color: 'bg-blue-100 text-blue-800' },
      'recertification': { label: 'Recertification', color: 'bg-green-100 text-green-800' }
    };
    return typeMap[type as keyof typeof typeMap] || typeMap['first-visit'];
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-semantic-success';
    if (score >= 75) return 'text-semantic-warning';
    return 'text-semantic-error';
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = selectedFilter === 'all' || report.status === selectedFilter;
    const matchesSearch = report.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const reportStats = {
    total: reports.length,
    approved: reports.filter(r => r.status === 'approved' || r.status === 'published').length,
    pending: reports.filter(r => r.status === 'pending').length,
    conformes: reports.filter(r => r.conclusion === 'conforme').length,
    averageScore: Math.round(reports.reduce((sum, r) => sum + r.score, 0) / reports.length)
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Rapports de Validation ANSUT
            </h2>
            <p className="text-neutral-700">
              Gestion et suivi des rapports de certification
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200">
              <FileText className="w-4 h-4 mr-2" />
              Nouveau rapport
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Total Rapports</p>
              <p className="text-lg font-bold text-neutral-900">{reportStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-semantic-success" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Approuvés</p>
              <p className="text-lg font-bold text-neutral-900">{reportStats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-semantic-warning" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">En attente</p>
              <p className="text-lg font-bold text-neutral-900">{reportStats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Conformes</p>
              <p className="text-lg font-bold text-neutral-900">{reportStats.conformes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Score Moyen</p>
              <p className="text-lg font-bold text-neutral-900">{reportStats.averageScore}%</p>
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
                placeholder="Rechercher un rapport..."
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
              <option value="draft">Brouillons</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvés</option>
              <option value="published">Publiés</option>
              <option value="rejected">Rejetés</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-neutral-700 hover:bg-neutral-50 rounded-lg">
              <Filter className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg border border-primary-200">
              Exporter PDF
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Liste des Rapports
          </h3>
        </div>
        
        <div className="divide-y divide-neutral-200">
          {filteredReports.map((report) => {
            const statusInfo = getStatusInfo(report.status);
            const conclusionInfo = getConclusionInfo(report.conclusion);
            const typeInfo = getTypeInfo(report.type);
            const StatusIcon = statusInfo.icon;
            const ConclusionIcon = conclusionInfo.icon;

            return (
              <div key={report.id} className="p-6 hover:bg-neutral-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-neutral-900">
                        {report.property}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${conclusionInfo.color}`}>
                        <ConclusionIcon className="w-3 h-3 mr-1" />
                        {conclusionInfo.label}
                      </span>
                      {report.hasAttachments && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <FileCheck className="w-3 h-3 mr-1" />
                          Pièces jointes
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-neutral-700 mb-2">
                      <div className="flex items-center">
                        <Home className="w-4 h-4 mr-2 text-neutral-500" />
                        <span>{report.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-neutral-500" />
                        <span>Inspecté le {new Date(report.inspectionDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-neutral-500" />
                        <span>{report.inspector}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-neutral-500">Modifié le {new Date(report.lastModified).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      <div className="flex items-center">
                        <span className="text-sm text-neutral-700 mr-2">Score:</span>
                        <span className={`text-sm font-bold ${getScoreColor(report.score)}`}>
                          {report.score}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Prévisualiser">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Modifier">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Télécharger PDF">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Partager">
                      <Share className="w-4 h-4" />
                    </button>
                    
                    {report.status === 'draft' && (
                      <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Soumettre
                      </button>
                    )}
                    
                    {report.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-semantic-success text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                          Approuver
                        </button>
                        <button className="px-3 py-1 text-sm bg-semantic-error text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
                          Rejeter
                        </button>
                      </div>
                    )}
                    
                    {(report.status === 'approved' || report.status === 'published') && (
                      <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                        Publier
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Templates Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <FileText className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Templates de Rapports
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-neutral-900 mb-2">Rapport Première Visite</h4>
            <p className="text-sm text-neutral-700 mb-3">Template standard pour les premières certifications</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Utiliser ce template
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-neutral-900 mb-2">Contrôle Qualité</h4>
            <p className="text-sm text-neutral-700 mb-3">Template pour les contrôles post-rénovation</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Utiliser ce template
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-neutral-900 mb-2">Recertification</h4>
            <p className="text-sm text-neutral-700 mb-3">Template pour le renouvellement annuel</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Utiliser ce template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustReportsSection;