import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Eye,
  MessageSquare,
  Calendar,
  MapPin,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Star,
  User,
  Home,
  DollarSign
} from 'lucide-react';
import { ApplicationCard, ApplicationFilters, ApplicationStats, FilterOptions } from '../shared';

interface TenantApplicationsSectionProps {
  tenantId: number;
  tenantName: string;
}

const TenantApplicationsSection: React.FC<TenantApplicationsSectionProps> = ({
  tenantId,
  tenantName
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    documentsStatus: 'all',
    priority: 'all',
    propertyType: 'all',
    propertyAddress: '',
    dateRange: { from: '', to: '' },
    priceRange: { min: '', max: '' },
    hasVisited: null,
    creditScoreRange: { min: '', max: '' },
    sortBy: 'applicationDate',
    sortOrder: 'desc'
  });

  // Données mock des candidatures du tenant
  const applications = [
    {
      id: 1,
      propertyId: 101,
      propertyTitle: "Appartement Moderne Cocody",
      propertyAddress: "Cocody, Riviera Golf",
      propertyType: "appartement" as const,
      propertyRent: 380000,
      applicantName: tenantName,
      applicantEmail: "john.doe@email.com",
      applicantPhone: "+225 07 00 00 01",
      applicantAge: 28,
      applicantIncome: 850000,
      applicationDate: "2025-11-28",
      status: "en_attente" as const,
      documentsStatus: "incomplet" as const,
      message: "Je suis très intéressé par cet appartement. J'ai un travail stable chez Orange CI.",
      notes: "A contacté pour une visite",
      priority: "haute" as const,
      lastUpdate: "2025-11-29",
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' },
        { id: 'doc2', name: 'BulletinSalaire.pdf', type: 'pdf', size: 1536000, url: '/docs/bulletin-salaire.pdf' }
      ]
    },
    {
      id: 2,
      propertyId: 102,
      propertyTitle: "Villa Bellevue",
      propertyAddress: "Cocody, Riviera Golf",
      propertyType: "villa" as const,
      propertyRent: 450000,
      applicantName: tenantName,
      applicantEmail: "john.doe@email.com",
      applicantPhone: "+225 07 00 00 01",
      applicantAge: 28,
      applicantIncome: 850000,
      applicationDate: "2025-11-25",
      status: "accepte" as const,
      documentsStatus: "complet" as const,
      message: "Parfait pour ma famille, j'aimerais visiter soon.",
      priority: "normale" as const,
      lastUpdate: "2025-11-29",
      visited: true,
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' },
        { id: 'doc2', name: 'BulletinSalaire.pdf', type: 'pdf', size: 1536000, url: '/docs/bulletin-salaire.pdf' },
        { id: 'doc3', name: 'JustificatifDomicile.pdf', type: 'pdf', size: 1024000, url: '/docs/justificatif-domicile.pdf' }
      ]
    },
    {
      id: 3,
      propertyId: 103,
      propertyTitle: "Studio Plateau",
      propertyAddress: "Plateau, Centre-ville",
      propertyType: "studio" as const,
      propertyRent: 180000,
      applicantName: tenantName,
      applicantEmail: "john.doe@email.com",
      applicantPhone: "+225 07 00 00 01",
      applicantAge: 28,
      applicantIncome: 850000,
      applicationDate: "2025-11-20",
      status: "refuse" as const,
      documentsStatus: "complet" as const,
      message: "Intéressé pour un investissement locatif.",
      priority: "basse" as const,
      lastUpdate: "2025-11-26",
      notes: "Refusé - budget insuffisant",
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' },
        { id: 'doc2', name: 'BulletinSalaire.pdf', type: 'pdf', size: 1536000, url: '/docs/bulletin-salaire.pdf' }
      ]
    },
    {
      id: 4,
      propertyId: 104,
      propertyTitle: "Appartement F3 Yopougon",
      propertyAddress: "Yopougon, Siporex",
      propertyType: "appartement" as const,
      propertyRent: 280000,
      applicantName: tenantName,
      applicantEmail: "john.doe@email.com",
      applicantPhone: "+225 07 00 00 01",
      applicantAge: 28,
      applicantIncome: 850000,
      applicationDate: "2025-11-22",
      status: "en_cours" as const,
      documentsStatus: "en_verification" as const,
      message: "À la recherche d'un appartement familial.",
      priority: "normale" as const,
      lastUpdate: "2025-11-29",
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' },
        { id: 'doc2', name: 'BulletinSalaire.pdf', type: 'pdf', size: 1536000, url: '/docs/bulletin-salaire.pdf' },
        { id: 'doc4', name: 'AttestationTravail.pdf', type: 'pdf', size: 1536000, url: '/docs/attestation-travail.pdf' }
      ]
    }
  ];

  // Calcul des statistiques
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'en_attente').length,
    inProgress: applications.filter(app => app.status === 'en_cours').length,
    accepted: applications.filter(app => app.status === 'accepte').length,
    rejected: applications.filter(app => app.status === 'refuse').length,
    cancelled: applications.filter(app => app.status === 'annule').length,
    withIncompleteDocs: applications.filter(app => app.documentsStatus === 'incomplet').length,
    withCompleteDocs: applications.filter(app => app.documentsStatus === 'complet').length,
    underReview: applications.filter(app => app.documentsStatus === 'en_verification').length,
    totalValue: applications.reduce((sum, app) => sum + app.propertyRent, 0),
    averageRent: applications.reduce((sum, app) => sum + app.propertyRent, 0) / applications.length,
    conversionRate: applications.length > 0 ? (applications.filter(app => app.status === 'accepte').length / applications.length) * 100 : 0,
    recentActivity: [
      { date: '2025-11-29', count: 1, type: 'Nouvelle candidature' },
      { date: '2025-11-28', count: 1, type: 'Candidature acceptée' },
      { date: '2025-11-26', count: 1, type: 'Document ajouté' }
    ],
    statusTrend: [
      { period: 'Nov', applications: 4, change: 12 },
      { period: 'Oct', applications: 3, change: -8 },
      { period: 'Sep', applications: 3, change: 25 }
    ]
  };

  // Filtrage des candidatures
  const filteredApplications = useMemo(() => {
    return applications.filter(application => {
      // Recherche textuelle
      if (filters.search && !(
        application.propertyTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
        application.propertyAddress.toLowerCase().includes(filters.search.toLowerCase())
      )) {
        return false;
      }

      // Statut
      if (filters.status !== 'all' && application.status !== filters.status) {
        return false;
      }

      // Documents
      if (filters.documentsStatus !== 'all' && application.documentsStatus !== filters.documentsStatus) {
        return false;
      }

      // Priorité
      if (filters.priority !== 'all' && application.priority !== filters.priority) {
        return false;
      }

      // Type de propriété
      if (filters.propertyType !== 'all' && application.propertyType !== filters.propertyType) {
        return false;
      }

      // Plage de dates
      if (filters.dateRange.from && application.applicationDate < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && application.applicationDate > filters.dateRange.to) {
        return false;
      }

      // Plage de prix
      if (filters.priceRange.min && application.propertyRent < parseInt(filters.priceRange.min)) {
        return false;
      }
      if (filters.priceRange.max && application.propertyRent > parseInt(filters.priceRange.max)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const aValue = (a as any)[filters.sortBy];
      const bValue = (b as any)[filters.sortBy];
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [applications, filters]);

  const handleViewDetails = (id: number) => {
    console.log('Voir détails de la candidature:', id);
    // Navigation vers les détails
  };

  const handleContact = (id: number) => {
    console.log('Contacter pour la candidature:', id);
    // Ouvrir modal de contact
  };

  const handleDownload = (id: number, fileId: string) => {
    console.log('Télécharger document:', id, fileId);
    // Télécharger le document
  };

  const handleUpdateStatus = (id: number, status: string) => {
    console.log('Mettre à jour statut:', id, status);
    // Mettre à jour le statut
  };

  const handleSelectApplication = (id: number, selected: boolean) => {
    if (selected) {
      setSelectedApplications(prev => [...prev, id]);
    } else {
      setSelectedApplications(prev => prev.filter(appId => appId !== id));
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      documentsStatus: 'all',
      priority: 'all',
      propertyType: 'all',
      propertyAddress: '',
      dateRange: { from: '', to: '' },
      priceRange: { min: '', max: '' },
      hasVisited: null,
      creditScoreRange: { min: '', max: '' },
      sortBy: 'applicationDate',
      sortOrder: 'desc'
    });
  };

  const handleCreateApplication = () => {
    console.log('Créer nouvelle candidature');
    // Ouvrir modal de création
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Mes Candidatures</h2>
          <p className="text-neutral-600">
            Gérez vos candidatures de location en cours et suivez leur statut
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-lg transition-colors duration-200 ${
              showFilters 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </button>
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
          <button
            onClick={handleCreateApplication}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle candidature
          </button>
        </div>
      </div>

      {/* Statistics */}
      <ApplicationStats
        stats={stats}
        role="tenant"
        timeFrame="month"
        showTrends={true}
      />

      {/* Filters */}
      {showFilters && (
        <ApplicationFilters
          filters={filters}
          onFiltersChange={setFilters}
          role="tenant"
          onClearFilters={handleClearFilters}
          totalResults={filteredApplications.length}
        />
      )}

      {/* Bulk Actions */}
      {selectedApplications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-blue-800">
                {selectedApplications.length} candidature{selectedApplications.length > 1 ? 's' : ''} sélectionnée{selectedApplications.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Exporter
              </button>
              <button
                onClick={() => setSelectedApplications([])}
                className="px-3 py-1.5 text-sm bg-neutral-600 text-white rounded-lg hover:bg-neutral-700"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applications Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              role="tenant"
              onViewDetails={handleViewDetails}
              onContact={handleContact}
              onDownload={handleDownload}
              isSelected={selectedApplications.includes(application.id)}
              onSelect={handleSelectApplication}
              showBulkActions={true}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="divide-y divide-neutral-200">
            {filteredApplications.map((application) => (
              <div key={application.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(application.id)}
                      onChange={(e) => handleSelectApplication(application.id, e.target.checked)}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    
                    <div className="w-16 h-16 bg-neutral-200 rounded-lg flex-shrink-0" />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-neutral-900">
                          {application.propertyTitle}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          application.status === 'en_attente' ? 'bg-amber-100 text-amber-800' :
                          application.status === 'accepte' ? 'bg-green-100 text-green-800' :
                          application.status === 'refuse' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {application.status === 'en_attente' ? 'En attente' :
                           application.status === 'accepte' ? 'Accepté' :
                           application.status === 'refuse' ? 'Refusé' : 'En cours'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          application.documentsStatus === 'complet' ? 'bg-green-100 text-green-800' :
                          application.documentsStatus === 'en_verification' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.documentsStatus === 'complet' ? 'Complet' :
                           application.documentsStatus === 'en_verification' ? 'En vérification' : 'Incomplet'}
                        </span>
                      </div>
                      
                      <p className="text-neutral-600 mb-2">{application.propertyAddress}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-neutral-700">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-neutral-500" />
                          <span className="capitalize">{application.propertyType}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-neutral-500" />
                          <span>{formatCurrency(application.propertyRent)}/mois</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-neutral-500" />
                          <span>{new Date(application.applicationDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-neutral-500" />
                          <span>{application.files?.length || 0} document{application.files?.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(application.id)}
                      className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
                      title="Voir détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleContact(application.id)}
                      className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
                      title="Suivi"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    {application.documentsStatus === 'incomplet' && (
                      <button className="px-3 py-1 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                        Compléter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            {hasActiveFilters() ? 'Aucune candidature trouvée' : 'Aucune candidature'}
          </h3>
          <p className="text-neutral-600 mb-4">
            {hasActiveFilters() 
              ? 'Essayez de modifier vos filtres de recherche' 
              : 'Commencez par créer votre première candidature'
            }
          </p>
          {!hasActiveFilters() && (
            <button
              onClick={handleCreateApplication}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une candidature
            </button>
          )}
        </div>
      )}
    </div>
  );

  function hasActiveFilters() {
    return filters.search || 
           filters.status !== 'all' || 
           filters.documentsStatus !== 'all' || 
           filters.priority !== 'all' || 
           filters.propertyType !== 'all' ||
           filters.dateRange.from ||
           filters.dateRange.to ||
           filters.priceRange.min ||
           filters.priceRange.max;
  }
};

export default TenantApplicationsSection;