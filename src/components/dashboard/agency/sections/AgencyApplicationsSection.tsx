import React, { useState, useMemo } from 'react';
import {
  Building,
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
  Archive,
  MapPin,
  TrendingUp,
  Briefcase,
  UserX,
  UserPlus,
  Settings,
  PieChart,
  Activity
} from 'lucide-react';
import { ApplicationCard, ApplicationFilters, ApplicationStats, FilterOptions } from '../shared';

interface AgencyApplicationsSectionProps {
  agencyId: number;
  agencyName: string;
}

const AgencyApplicationsSection: React.FC<AgencyApplicationsSectionProps> = ({
  agencyId,
  agencyName
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
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

  // Données mock des candidatures gérées par l'agence
  const applications = [
    {
      id: 1,
      propertyId: 201,
      propertyTitle: "Villa Moderne Cocody",
      propertyAddress: "Cocody, Riviera Golf",
      propertyType: "villa" as const,
      propertyRent: 650000,
      applicantName: "Jean Kouassi",
      applicantEmail: "jean.kouassi@email.com",
      applicantPhone: "+225 07 11 22 33",
      applicantAge: 32,
      applicantIncome: 1200000,
      applicationDate: "2025-11-28",
      status: "en_attente" as const,
      documentsStatus: "complet" as const,
      message: "Très intéressé par cette villa, j'ai un emploi stable chez Total Energies.",
      notes: "Candidat premium, dossier complet",
      priority: "haute" as const,
      lastUpdate: "2025-11-29",
      visited: false,
      creditScore: 95,
      employmentType: "CDI",
      references: 3,
      agent: "M. Traoré",
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' },
        { id: 'doc2', name: 'BulletinSalaire.pdf', type: 'pdf', size: 1536000, url: '/docs/bulletin-salaire.pdf' },
        { id: 'doc3', name: 'JustificatifDomicile.pdf', type: 'pdf', size: 1024000, url: '/docs/justificatif-domicile.pdf' }
      ]
    },
    {
      id: 2,
      propertyId: 202,
      propertyTitle: "Appartement Luxe Plateau",
      propertyAddress: "Plateau, Centre des affaires",
      propertyType: "appartement" as const,
      propertyRent: 480000,
      applicantName: "Marie Traoré",
      applicantEmail: "marie.traore@email.com",
      applicantPhone: "+225 05 44 55 66",
      applicantAge: 28,
      applicantIncome: 980000,
      applicationDate: "2025-11-27",
      status: "en_cours" as const,
      documentsStatus: "en_verification" as const,
      message: "Cadre dans une banque internationale, très sérieux.",
      notes: "Profil premium, vérification en cours",
      priority: "haute" as const,
      lastUpdate: "2025-11-29",
      visited: true,
      creditScore: 92,
      employmentType: "CDI",
      references: 2,
      agent: "Mme Bakayoko",
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' },
        { id: 'doc2', name: 'BulletinSalaire.pdf', type: 'pdf', size: 1536000, url: '/docs/bulletin-salaire.pdf' }
      ]
    },
    {
      id: 3,
      propertyId: 203,
      propertyTitle: "Maison Familiale Marcory",
      propertyAddress: "Marcory, Zone 4A",
      propertyType: "maison" as const,
      propertyRent: 380000,
      applicantName: "Paul Akissi",
      applicantEmail: "paul.akissi@email.com",
      applicantPhone: "+225 01 77 88 99",
      applicantAge: 35,
      applicantIncome: 720000,
      applicationDate: "2025-11-26",
      status: "accepte" as const,
      documentsStatus: "complet" as const,
      message: "Famille avec enfants, recherchons une maison spacieuse.",
      notes: "Recommandé par client satisfait",
      priority: "normale" as const,
      lastUpdate: "2025-11-29",
      visited: true,
      creditScore: 88,
      employmentType: "CDI",
      references: 4,
      agent: "M. Koné",
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' },
        { id: 'doc2', name: 'BulletinSalaire.pdf', type: 'pdf', size: 1536000, url: '/docs/bulletin-salaire.pdf' },
        { id: 'doc3', name: 'JustificatifDomicile.pdf', type: 'pdf', size: 1024000, url: '/docs/justificatif-domicile.pdf' }
      ]
    },
    {
      id: 4,
      propertyId: 204,
      propertyTitle: "Studio Jeune Professionnel",
      propertyAddress: "Yopougon, Niangon",
      propertyType: "studio" as const,
      propertyRent: 150000,
      applicantName: "Aya Kone",
      applicantEmail: "aya.kone@email.com",
      applicantPhone: "+225 07 22 33 44",
      applicantAge: 24,
      applicantIncome: 350000,
      applicationDate: "2025-11-25",
      status: "refuse" as const,
      documentsStatus: "incomplet" as const,
      message: "Étudiante en médecine, premier appartement.",
      notes: "Revenus insuffisants",
      priority: "basse" as const,
      lastUpdate: "2025-11-27",
      creditScore: 65,
      employmentType: "Étudiante",
      references: 0,
      agent: "Mme Fofana",
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' }
      ]
    },
    {
      id: 5,
      propertyId: 205,
      propertyTitle: "Immeuble Commercial",
      propertyAddress: "Plateau, Rue des Hôtels",
      propertyType: "immeuble" as const,
      propertyRent: 2500000,
      applicantName: "SCI Investissement Plus",
      applicantEmail: "contact@sci-plus.ci",
      applicantPhone: "+225 20 22 33 44",
      applicantAge: null,
      applicantIncome: 5000000,
      applicationDate: "2025-11-24",
      status: "en_attente" as const,
      documentsStatus: "complet" as const,
      message: "Société d'investissement, recherche d'immeuble commercial.",
      notes: "Dossier société, analyse approfondie requise",
      priority: "haute" as const,
      lastUpdate: "2025-11-28",
      creditScore: 100,
      employmentType: "Société",
      references: 5,
      agent: "M. Diabaté",
      files: [
        { id: 'doc1', name: 'RegistreCommerce.pdf', type: 'pdf', size: 4096000, url: '/docs/registre-commerce.pdf' },
        { id: 'doc2', name: 'BilanFinancier.pdf', type: 'pdf', size: 6144000, url: '/docs/bilan-financier.pdf' },
        { id: 'doc3', name: 'JustificatifDomicile.pdf', type: 'pdf', size: 1024000, url: '/docs/justificatif-domicile.pdf' }
      ]
    },
    {
      id: 6,
      propertyId: 206,
      propertyTitle: "Appartement Moderne Adjamé",
      propertyAddress: "Adjamé, Marché central",
      propertyType: "appartement" as const,
      propertyRent: 220000,
      applicantName: "Ousmane Diallo",
      applicantEmail: "ousmane.diallo@email.com",
      applicantPhone: "+225 05 66 77 88",
      applicantAge: 30,
      applicantIncome: 480000,
      applicationDate: "2025-11-23",
      status: "en_cours" as const,
      documentsStatus: "en_verification" as const,
      message: "Commerçant, budget serré mais sérieux.",
      notes: "À vérifier les revenus commerciaux",
      priority: "normale" as const,
      lastUpdate: "2025-11-29",
      visited: false,
      creditScore: 72,
      employmentType: "Commerçant",
      references: 2,
      agent: "M. Traoré",
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' },
        { id: 'doc2', name: 'AttestationRevenus.pdf', type: 'pdf', size: 1536000, url: '/docs/attestation-revenus.pdf' }
      ]
    },
    {
      id: 7,
      propertyId: 201,
      propertyTitle: "Villa Moderne Cocody",
      propertyAddress: "Cocody, Riviera Golf",
      propertyType: "villa" as const,
      propertyRent: 650000,
      applicantName: "Sarah Mensah",
      applicantEmail: "sarah.mensah@email.com",
      applicantPhone: "+225 01 88 99 00",
      applicantAge: 29,
      applicantIncome: 1100000,
      applicationDate: "2025-11-22",
      status: "en_attente" as const,
      documentsStatus: "complet" as const,
      message: "Directrice commerciale, références solides.",
      notes: "Très bon profil, dossier premium",
      priority: "haute" as const,
      lastUpdate: "2025-11-29",
      visited: true,
      creditScore: 98,
      employmentType: "CDI",
      references: 3,
      guarantor: "M. Mensah (père)",
      agent: "Mme Bakayoko",
      files: [
        { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' },
        { id: 'doc2', name: 'BulletinSalaire.pdf', type: 'pdf', size: 1536000, url: '/docs/bulletin-salaire.pdf' },
        { id: 'doc3', name: 'JustificatifDomicile.pdf', type: 'pdf', size: 1024000, url: '/docs/justificatif-domicile.pdf' },
        { id: 'doc4', name: 'BilanBancaire.pdf', type: 'pdf', size: 2560000, url: '/docs/bilan-bancaire.pdf' }
      ]
    }
  ];

  // Agents de l'agence pour les filtres
  const agencyAgents = [
    { value: 'M. Traoré', label: 'M. Traoré' },
    { value: 'Mme Bakayoko', label: 'Mme Bakayoko' },
    { value: 'M. Koné', label: 'M. Koné' },
    { value: 'Mme Fofana', label: 'Mme Fofana' },
    { value: 'M. Diabaté', label: 'M. Diabaté' }
  ];

  // Propriétés de l'agence pour les filtres
  const agencyProperties = [
    { value: '201', label: 'Villa Moderne Cocody' },
    { value: '202', label: 'Appartement Luxe Plateau' },
    { value: '203', label: 'Maison Familiale Marcory' },
    { value: '204', label: 'Studio Jeune Professionnel' },
    { value: '205', label: 'Immeuble Commercial' },
    { value: '206', label: 'Appartement Moderne Adjamé' }
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
    responseTime: 1.8,
    topProperty: {
      title: 'Villa Moderne Cocody',
      applications: 2
    },
    priorityBreakdown: {
      haute: applications.filter(app => app.priority === 'haute').length,
      normale: applications.filter(app => app.priority === 'normale').length,
      basse: applications.filter(app => app.priority === 'basse').length
    },
    recentActivity: [
      { date: '2025-11-29', count: 3, type: 'Nouvelles candidatures' },
      { date: '2025-11-28', count: 2, type: 'Candidatures traitées' },
      { date: '2025-11-27', count: 1, type: 'Documents vérifiés' }
    ],
    statusTrend: [
      { period: 'Nov', applications: 7, change: 22 },
      { period: 'Oct', applications: 6, change: -15 },
      { period: 'Sep', applications: 5, change: 12 }
    ],
    agentStats: [
      { agent: 'M. Traoré', applications: 2, conversionRate: 75 },
      { agent: 'Mme Bakayoko', applications: 2, conversionRate: 85 },
      { agent: 'M. Koné', applications: 1, conversionRate: 100 },
      { agent: 'Mme Fofana', applications: 1, conversionRate: 0 },
      { agent: 'M. Diabaté', applications: 1, conversionRate: 60 }
    ]
  };

  // Filtrage des candidatures
  const filteredApplications = useMemo(() => {
    return applications.filter(application => {
      // Recherche textuelle
      if (filters.search && !(
        application.applicantName.toLowerCase().includes(filters.search.toLowerCase()) ||
        application.propertyTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
        application.propertyAddress.toLowerCase().includes(filters.search.toLowerCase()) ||
        (application.agent && application.agent.toLowerCase().includes(filters.search.toLowerCase()))
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

      // Agent spécifique (utilise propertyAddress comme filtre temporaire pour les agents)
      if (selectedAgent !== 'all' && application.agent !== selectedAgent) {
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
  }, [applications, filters, selectedAgent]);

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

  const handleAssignAgent = (applicationId: number, agentName: string) => {
    console.log('Assigner agent:', agentName, 'à la candidature', applicationId);
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
    setSelectedAgent('all');
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
           selectedAgent !== 'all' ||
           filters.dateRange.from ||
           filters.dateRange.to ||
           filters.priceRange.min ||
           filters.priceRange.max ||
           filters.creditScoreRange.min ||
           filters.creditScoreRange.max ||
           filters.hasVisited !== null;
  };

  const renderAgentStats = () => (
    <div className="bg-white rounded-lg p-6 border border-neutral-200">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Performance par agent</h3>
      <div className="space-y-3">
        {stats.agentStats.map((agentStat, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
            <div className="flex items-center">
              <UserCheck className="w-5 h-5 text-neutral-600 mr-3" />
              <div>
                <p className="font-medium text-neutral-900">{agentStat.agent}</p>
                <p className="text-sm text-neutral-600">{agentStat.applications} candidatures</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${
                agentStat.conversionRate >= 80 ? 'text-green-600' :
                agentStat.conversionRate >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {agentStat.conversionRate}%
              </p>
              <p className="text-xs text-neutral-500">Conversion</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Gestion des Candidatures</h2>
          <p className="text-neutral-600">
            Gérez centralement toutes les candidatures de {agencyName}
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
        role="agency"
        timeFrame="month"
        showTrends={true}
      />

      {/* Agent Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderAgentStats()}
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
              <UserPlus className="w-5 h-5 mr-2" />
              Assigner agent
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200">
              <CheckCircle className="w-5 h-5 mr-2" />
              Validation lot
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-200">
              <MessageSquare className="w-5 h-5 mr-2" />
              Communication
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors duration-200">
              <BarChart3 className="w-5 h-5 mr-2" />
              Rapports
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <ApplicationFilters
          filters={filters}
          onFiltersChange={setFilters}
          role="agency"
          onClearFilters={handleClearFilters}
          onExport={handleExport}
          onImport={handleImport}
          propertyOptions={agencyProperties}
          agentOptions={agencyAgents}
          totalResults={filteredApplications.length}
        />
      )}

      {/* Agent Filter Bar */}
      <div className="flex items-center space-x-4 bg-white rounded-lg p-4 border border-neutral-200">
        <span className="text-sm font-medium text-neutral-700">Filtrer par agent:</span>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">Tous les agents</option>
          {agencyAgents.map(agent => (
            <option key={agent.value} value={agent.value}>
              {agent.label}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <div className="text-sm text-neutral-600">
          {filteredApplications.length} candidature{filteredApplications.length !== 1 ? 's' : ''} 
          {selectedAgent !== 'all' && ` pour ${selectedAgent}`}
        </div>
      </div>

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
                <option value="assign">Assigner agent</option>
                <option value="accept">Accepter</option>
                <option value="reject">Refuser</option>
                <option value="contact">Contacter</option>
                <option value="export">Exporter</option>
                <option value="archive">Archiver</option>
                <option value="transfer">Transférer</option>
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

      {/* Applications Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              role="agency"
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {application.agent}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-neutral-700 mb-2">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-neutral-500" />
                          <span>{application.applicantName}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-neutral-500" />
                          <span>{application.propertyAddress}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-neutral-500" />
                          <span>{formatCurrency(application.propertyRent)}/mois</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-neutral-500" />
                          <span>{new Date(application.applicationDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-neutral-500">
                        <span>Score: {application.creditScore}/100</span>
                        <span>{application.files?.length || 0} documents</span>
                        <span>{application.references} références</span>
                        {application.priority === 'haute' && (
                          <Star className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(application.id)}
                      className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
                      title="Gérer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleContact(application.id)}
                      className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
                      title="Assigner"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
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
          <Building className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            {hasActiveFilters() ? 'Aucune candidature trouvée' : 'Aucune candidature'}
          </h3>
          <p className="text-neutral-600">
            {hasActiveFilters() 
              ? 'Essayez de modifier vos filtres de recherche' 
              : 'Les candidatures apparaîtront ici une fois soumises'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AgencyApplicationsSection;