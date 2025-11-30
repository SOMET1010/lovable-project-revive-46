import React, { useState, useMemo } from 'react';
import {
  Users,
  Filter,
  Download,
  Upload,
  Search,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Send,
  MoreVertical,
  Star,
  Calendar,
  Building,
  DollarSign,
  User,
  FileText,
  Award,
  Target,
  BarChart3,
  AlertCircle,
  Clock,
  UserCheck,
  Trash2,
  Archive
} from 'lucide-react';
import { ApplicationCard, ApplicationFilters, ApplicationStats, FilterOptions } from '../shared';

interface OwnerApplicationsSectionProps {
  ownerId: number;
  ownerName: string;
}

const OwnerApplicationsSection: React.FC<OwnerApplicationsSectionProps> = ({
  ownerId,
  ownerName
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
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

  // Données mock des candidatures reçues
  const applications = [
    {
      id: 1,
      propertyId: 101,
      propertyTitle: "Villa Bellevue",
      propertyAddress: "Cocody, Riviera Golf",
      propertyType: "villa" as const,
      propertyRent: 450000,
      applicantName: "Jean Kouassi",
      applicantEmail: "jean.kouassi@email.com",
      applicantPhone: "+225 07 11 22 33",
      applicantAge: 32,
      applicantIncome: 850000,
      applicationDate: "2025-11-28",
      status: "en_attente" as const,
      documentsStatus: "complet" as const,
      message: "Très intéressé par cette villa, j'ai un emploi stable chez Total Energies.",
      notes: "",
      priority: "haute" as const,
      lastUpdate: "2025-11-29",
      visited: false,
      creditScore: 85,
      employmentType: "CDI",
      references: 2,
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' },
        { id: 'doc2', name: 'BulletinSalaire.pdf', type: 'pdf', size: 1536000, url: '/docs/bulletin-salaire.pdf' },
        { id: 'doc3', name: 'JustificatifDomicile.pdf', type: 'pdf', size: 1024000, url: '/docs/justificatif-domicile.pdf' }
      ]
    },
    {
      id: 2,
      propertyId: 102,
      propertyTitle: "Villa Bellevue",
      propertyAddress: "Cocody, Riviera Golf",
      propertyType: "villa" as const,
      propertyRent: 450000,
      applicantName: "Marie Traoré",
      applicantEmail: "marie.traore@email.com",
      applicantPhone: "+225 05 44 55 66",
      applicantAge: 28,
      applicantIncome: 720000,
      applicationDate: "2025-11-27",
      status: "en_cours" as const,
      documentsStatus: "en_verification" as const,
      message: "Je souhaite déménager avec ma famille. Employée chez Orange CI.",
      notes: "Score de crédit excellent",
      priority: "normale" as const,
      lastUpdate: "2025-11-29",
      visited: true,
      creditScore: 92,
      employmentType: "CDI",
      references: 3,
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' },
        { id: 'doc2', name: 'BulletinSalaire.pdf', type: 'pdf', size: 1536000, url: '/docs/bulletin-salaire.pdf' },
        { id: 'doc4', name: 'AttestationTravail.pdf', type: 'pdf', size: 1536000, url: '/docs/attestation-travail.pdf' }
      ]
    },
    {
      id: 3,
      propertyId: 103,
      propertyTitle: "Appartement Riviera",
      propertyAddress: "Marcory, Zone 4A",
      propertyType: "appartement" as const,
      propertyRent: 380000,
      applicantName: "Paul Akissi",
      applicantEmail: "paul.akissi@email.com",
      applicantPhone: "+225 01 77 88 99",
      applicantAge: 25,
      applicantIncome: 650000,
      applicationDate: "2025-11-26",
      status: "accepte" as const,
      documentsStatus: "complet" as const,
      message: "Premier appartement, très motivé. Travailleur indépendant.",
      notes: "Candidat fiable, recommandé par un ami",
      priority: "normale" as const,
      lastUpdate: "2025-11-29",
      visited: true,
      creditScore: 78,
      employmentType: "Freelance",
      references: 1,
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' },
        { id: 'doc2', name: 'BulletinSalaire.pdf', type: 'pdf', size: 1536000, url: '/docs/bulletin-salaire.pdf' },
        { id: 'doc3', name: 'JustificatifDomicile.pdf', type: 'pdf', size: 1024000, url: '/docs/justificatif-domicile.pdf' }
      ]
    },
    {
      id: 4,
      propertyId: 104,
      propertyTitle: "Studio Plateau",
      propertyAddress: "Plateau, Centre-ville",
      propertyType: "studio" as const,
      propertyRent: 180000,
      applicantName: "Aya Kone",
      applicantEmail: "aya.kone@email.com",
      applicantPhone: "+225 07 22 33 44",
      applicantAge: 24,
      applicantIncome: 350000,
      applicationDate: "2025-11-25",
      status: "refuse" as const,
      documentsStatus: "incomplet" as const,
      message: "Étudiante en médecine, budget limité.",
      notes: "Revenus insuffisants pour le montant du loyer",
      priority: "basse" as const,
      lastUpdate: "2025-11-27",
      creditScore: 45,
      employmentType: "Étudiante",
      references: 0,
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' }
      ]
    },
    {
      id: 5,
      propertyId: 105,
      propertyTitle: "Maison Yopougon",
      propertyAddress: "Yopougon, Toits Rouges",
      propertyType: "maison" as const,
      propertyRent: 320000,
      applicantName: "Ousmane Diallo",
      applicantEmail: "ousmane.diallo@email.com",
      applicantPhone: "+225 05 66 77 88",
      applicantAge: 35,
      applicantIncome: 780000,
      applicationDate: "2025-11-24",
      status: "en_attente" as const,
      documentsStatus: "en_verification" as const,
      message: "Famille nombreuse, cherchons une maison spacieuse.",
      notes: "À vérifier les références",
      priority: "haute" as const,
      lastUpdate: "2025-11-28",
      visited: true,
      creditScore: 82,
      employmentType: "CDI",
      references: 4,
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' },
        { id: 'doc2', name: 'BulletinSalaire.pdf', type: 'pdf', size: 1536000, url: '/docs/bulletin-salaire.pdf' },
        { id: 'doc3', name: 'JustificatifDomicile.pdf', type: 'pdf', size: 1024000, url: '/docs/justificatif-domicile.pdf' },
        { id: 'doc4', name: 'AttestationTravail.pdf', type: 'pdf', size: 1536000, url: '/docs/attestation-travail.pdf' }
      ]
    },
    {
      id: 6,
      propertyId: 103,
      propertyTitle: "Appartement Riviera",
      propertyAddress: "Marcory, Zone 4A",
      propertyType: "appartement" as const,
      propertyRent: 380000,
      applicantName: "Sarah Mensah",
      applicantEmail: "sarah.mensah@email.com",
      applicantPhone: "+225 01 88 99 00",
      applicantAge: 30,
      applicantIncome: 950000,
      applicationDate: "2025-11-23",
      status: "en_attente" as const,
      documentsStatus: "complet" as const,
      message: "Directrice dans une multinationale, très sérieuse.",
      notes: "Profil premium",
      priority: "haute" as const,
      lastUpdate: "2025-11-29",
      visited: false,
      creditScore: 95,
      employmentType: "CDI",
      references: 3,
      guarantor: "M. Mensah (père)",
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' },
        { id: 'doc2', name: 'BulletinSalaire.pdf', type: 'pdf', size: 1536000, url: '/docs/bulletin-salaire.pdf' },
        { id: 'doc3', name: 'JustificatifDomicile.pdf', type: 'pdf', size: 1024000, url: '/docs/justificatif-domicile.pdf' },
        { id: 'doc5', name: 'BilanBancaire.pdf', type: 'pdf', size: 2560000, url: '/docs/bilan-bancaire.pdf' }
      ]
    }
  ];

  // Propriétés du propriétaire pour les filtres
  const ownerProperties = [
    { value: '101', label: 'Villa Bellevue - Cocody' },
    { value: '102', label: 'Appartement Riviera - Marcory' },
    { value: '103', label: 'Studio Plateau' },
    { value: '104', label: 'Maison Yopougon' },
    { value: '105', label: 'Appartement Marcory' }
  ];

  // Calcul des statistiques
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'en_attente').length,
    inProgress: applications.filter(app => app.status === 'en_cours').length,
    accepted: applications.filter(app => app.status === 'accepte').length,
    rejected: applications.filter(app => app.status === 'refuse').length,
    withIncompleteDocs: applications.filter(app => app.documentsStatus === 'incomplet').length,
    withCompleteDocs: applications.filter(app => app.documentsStatus === 'complet').length,
    underReview: applications.filter(app => app.documentsStatus === 'en_verification').length,
    totalValue: applications.reduce((sum, app) => sum + app.propertyRent, 0),
    averageRent: applications.reduce((sum, app) => sum + app.propertyRent, 0) / applications.length,
    conversionRate: applications.length > 0 ? (applications.filter(app => app.status === 'accepte').length / applications.length) * 100 : 0,
    responseTime: 2.5,
    topProperty: {
      title: 'Villa Bellevue',
      applications: 2
    },
    priorityBreakdown: {
      haute: applications.filter(app => app.priority === 'haute').length,
      normale: applications.filter(app => app.priority === 'normale').length,
      basse: applications.filter(app => app.priority === 'basse').length
    },
    recentActivity: [
      { date: '2025-11-29', count: 2, type: 'Nouvelles candidatures' },
      { date: '2025-11-28', count: 1, type: 'Candidature acceptée' },
      { date: '2025-11-27', count: 1, type: 'Document vérifié' }
    ],
    statusTrend: [
      { period: 'Nov', applications: 6, change: 15 },
      { period: 'Oct', applications: 5, change: -12 },
      { period: 'Sep', applications: 4, change: 8 }
    ]
  };

  // Filtrage des candidatures
  const filteredApplications = useMemo(() => {
    return applications.filter(application => {
      // Recherche textuelle
      if (filters.search && !(
        application.applicantName.toLowerCase().includes(filters.search.toLowerCase()) ||
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

      // Propriété spécifique
      if (filters.propertyAddress && application.propertyId.toString() !== filters.propertyAddress) {
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

      // Score de crédit
      if (filters.creditScoreRange.min && application.creditScore && application.creditScore < parseInt(filters.creditScoreRange.min)) {
        return false;
      }
      if (filters.creditScoreRange.max && application.creditScore && application.creditScore > parseInt(filters.creditScoreRange.max)) {
        return false;
      }

      // Visites
      if (filters.hasVisited !== null && application.visited !== filters.hasVisited) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'applicationDate':
          aValue = new Date(a.applicationDate);
          bValue = new Date(b.applicationDate);
          break;
        case 'lastUpdate':
          aValue = new Date(a.lastUpdate);
          bValue = new Date(b.lastUpdate);
          break;
        case 'propertyTitle':
          aValue = a.propertyTitle.toLowerCase();
          bValue = b.propertyTitle.toLowerCase();
          break;
        case 'propertyRent':
          aValue = a.propertyRent;
          bValue = b.propertyRent;
          break;
        case 'applicantName':
          aValue = a.applicantName.toLowerCase();
          bValue = b.applicantName.toLowerCase();
          break;
        case 'creditScore':
          aValue = a.creditScore || 0;
          bValue = b.creditScore || 0;
          break;
        case 'applicantIncome':
          aValue = a.applicantIncome || 0;
          bValue = b.applicantIncome || 0;
          break;
        case 'priority':
          const priorityOrder = { haute: 3, normale: 2, basse: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        default:
          aValue = (a as any)[filters.sortBy];
          bValue = (b as any)[filters.sortBy];
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [applications, filters]);

  const handleViewDetails = (id: number) => {
    console.log('Voir détails de la candidature:', id);
  };

  const handleContact = (id: number) => {
    console.log('Contacter le candidat:', id);
  };

  const handleDownload = (id: number, fileId: string) => {
    console.log('Télécharger document:', id, fileId);
  };

  const handleUpdateStatus = (id: number, status: string) => {
    console.log('Mettre à jour statut:', id, status);
  };

  const handleSelectApplication = (id: number, selected: boolean) => {
    if (selected) {
      setSelectedApplications(prev => [...prev, id]);
    } else {
      setSelectedApplications(prev => prev.filter(appId => appId !== id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log('Action en masse:', action, 'sur', selectedApplications);
    setSelectedApplications([]);
    setBulkAction('');
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

  const handleExport = () => {
    console.log('Exporter les candidatures');
  };

  const handleImport = () => {
    console.log('Importer des candidatures');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const hasActiveFilters = () => {
    return filters.search || 
           filters.status !== 'all' || 
           filters.documentsStatus !== 'all' || 
           filters.priority !== 'all' || 
           filters.propertyType !== 'all' ||
           filters.propertyAddress ||
           filters.dateRange.from ||
           filters.dateRange.to ||
           filters.priceRange.min ||
           filters.priceRange.max ||
           filters.creditScoreRange.min ||
           filters.creditScoreRange.max ||
           filters.hasVisited !== null;
  };

  const renderTableView = () => (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedApplications.length === filteredApplications.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedApplications(filteredApplications.map(app => app.id));
                    } else {
                      setSelectedApplications([]);
                    }
                  }}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Candidat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Propriété
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Loyer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Documents
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {filteredApplications.map((application) => (
              <tr key={application.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedApplications.includes(application.id)}
                    onChange={(e) => handleSelectApplication(application.id, e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{application.applicantName}</div>
                    <div className="text-sm text-neutral-500">{application.applicantPhone}</div>
                    <div className="text-xs text-neutral-400">{application.employmentType}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{application.propertyTitle}</div>
                    <div className="text-sm text-neutral-500">{application.propertyAddress}</div>
                    <div className="text-xs text-neutral-400 capitalize">{application.propertyType}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-900">
                  {formatCurrency(application.propertyRent)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    application.status === 'en_attente' ? 'bg-amber-100 text-amber-800' :
                    application.status === 'accepte' ? 'bg-green-100 text-green-800' :
                    application.status === 'refuse' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {application.status === 'en_attente' ? 'En attente' :
                     application.status === 'accepte' ? 'Accepté' :
                     application.status === 'refuse' ? 'Refusé' : 'En cours'}
                  </span>
                  {application.priority === 'haute' && (
                    <Star className="w-4 h-4 text-yellow-500 inline ml-1" />
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    application.documentsStatus === 'complet' ? 'bg-green-100 text-green-800' :
                    application.documentsStatus === 'en_verification' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {application.documentsStatus === 'complet' ? 'Complet' :
                     application.documentsStatus === 'en_verification' ? 'En vérification' : 'Incomplet'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-900">
                  {application.creditScore ? (
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        application.creditScore >= 80 ? 'bg-green-500' :
                        application.creditScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      {application.creditScore}/100
                    </div>
                  ) : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-500">
                  {new Date(application.applicationDate).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewDetails(application.id)}
                      className="p-1 text-neutral-400 hover:text-primary-600"
                      title="Voir détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleContact(application.id)}
                      className="p-1 text-neutral-400 hover:text-blue-600"
                      title="Contacter"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    {application.status === 'en_attente' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'accepte')}
                          className="p-1 text-neutral-400 hover:text-green-600"
                          title="Accepter"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'refuse')}
                          className="p-1 text-neutral-400 hover:text-red-600"
                          title="Refuser"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button className="p-1 text-neutral-400 hover:text-neutral-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Candidatures Reçues</h2>
          <p className="text-neutral-600">
            Gérez et traitez les candidatures pour vos propriétés
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
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
            >
              Tableau
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
            >
              Grille
            </button>
          </div>
          <button
            onClick={handleImport}
            className="inline-flex items-center px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors duration-200"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Statistics */}
      <ApplicationStats
        stats={stats}
        role="owner"
        timeFrame="month"
        showTrends={true}
      />

      {/* Filters */}
      {showFilters && (
        <ApplicationFilters
          filters={filters}
          onFiltersChange={setFilters}
          role="owner"
          onClearFilters={handleClearFilters}
          onExport={handleExport}
          onImport={handleImport}
          propertyOptions={ownerProperties}
          totalResults={filteredApplications.length}
        />
      )}

      {/* Bulk Actions */}
      {selectedApplications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-800">
                {selectedApplications.length} candidature{selectedApplications.length > 1 ? 's' : ''} sélectionnée{selectedApplications.length > 1 ? 's' : ''}
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="text-sm border border-blue-300 rounded px-3 py-1"
              >
                <option value="">Actions en masse</option>
                <option value="accept">Accepter</option>
                <option value="reject">Refuser</option>
                <option value="contact">Contacter</option>
                <option value="export">Exporter</option>
                <option value="archive">Archiver</option>
              </select>
              {bulkAction && (
                <button
                  onClick={() => handleBulkAction(bulkAction)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Appliquer
                </button>
              )}
            </div>
            <button
              onClick={() => setSelectedApplications([])}
              className="px-3 py-1.5 text-sm bg-neutral-600 text-white rounded hover:bg-neutral-700"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Applications Table/Grid */}
      {viewMode === 'table' ? renderTableView() : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              role="owner"
              onViewDetails={handleViewDetails}
              onContact={handleContact}
              onDownload={handleDownload}
              onUpdateStatus={handleUpdateStatus}
              isSelected={selectedApplications.includes(application.id)}
              onSelect={handleSelectApplication}
              showBulkActions={true}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            {hasActiveFilters() ? 'Aucune candidature trouvée' : 'Aucune candidature reçue'}
          </h3>
          <p className="text-neutral-600">
            {hasActiveFilters() 
              ? 'Essayez de modifier vos filtres de recherche' 
              : 'Les candidatures apparaîtront ici dès qu\'elles seront soumises'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default OwnerApplicationsSection;