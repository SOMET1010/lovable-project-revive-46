<<<<<<< HEAD
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
=======
/**
 * Tenant Applications Section - Gestion des candidatures du locataire
 */

import { useState } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash2,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  User,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';

interface Application {
  id: string;
  property_id: string;
  property_title: string;
  property_city: string;
  property_image?: string;
  monthly_rent: number;
  status: 'en_attente' | 'en_cours' | 'acceptee' | 'refusee';
  created_at: string;
  updated_at: string;
  applicant_message?: string;
  documents_submitted: string[];
  priority: 'normale' | 'haute' | 'urgente';
}

interface TenantApplicationsSectionProps {
  applications?: Application[];
  showHeader?: boolean;
}

export function TenantApplicationsSection({ applications = [], showHeader = false }: TenantApplicationsSectionProps) {
  const [filter, setFilter] = useState<'all' | Application['status']>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'rent'>('date');

  // Données mock pour la démo
  const mockApplications: Application[] = [
    {
      id: '1',
      property_id: 'prop1',
      property_title: 'Appartement moderne Cocody',
      property_city: 'Cocody',
      property_image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      monthly_rent: 180000,
      status: 'en_cours',
      created_at: '2025-11-28',
      updated_at: '2025-11-29',
      applicant_message: 'Je suis très intéressé par cet appartement et j\'ai tous les documents requis.',
      documents_submitted: ['piece_identite', 'revenus', 'garant'],
      priority: 'haute',
    },
    {
      id: '2',
      property_id: 'prop2',
      property_title: 'Studio Plateau Centre',
      property_city: 'Abidjan Plateau',
      property_image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      monthly_rent: 120000,
      status: 'en_attente',
      created_at: '2025-11-25',
      updated_at: '2025-11-25',
      applicant_message: 'Étudiant cherche un studio pour la durée de mes études.',
      documents_submitted: ['piece_identite', 'revenus'],
      priority: 'normale',
    },
    {
      id: '3',
      property_id: 'prop3',
      property_title: 'Villa familiale Bingerville',
      property_city: 'Bingerville',
      property_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
      monthly_rent: 350000,
      status: 'acceptee',
      created_at: '2025-11-20',
      updated_at: '2025-11-27',
      applicant_message: 'Famille avec enfants cherche une grande villa.',
      documents_submitted: ['piece_identite', 'revenus', 'garant', 'avis_imposition'],
      priority: 'normale',
    },
    {
      id: '4',
      property_id: 'prop4',
      property_title: 'Appartement 2 pièces Yopougon',
      property_city: 'Yopougon',
      property_image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      monthly_rent: 85000,
      status: 'refusee',
      created_at: '2025-11-15',
      updated_at: '2025-11-22',
      applicant_message: 'Premier appartement, garanties limitées.',
      documents_submitted: ['piece_identite'],
      priority: 'normale',
    },
  ];

  const allApplications = applications.length > 0 ? applications : mockApplications;

  const filteredApplications = allApplications.filter(app => 
    filter === 'all' || app.status === filter
  );

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'status':
        const statusOrder = { 'en_attente': 0, 'en_cours': 1, 'acceptee': 2, 'refusee': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'rent':
        return b.monthly_rent - a.monthly_rent;
      default:
        return 0;
    }
  });

  const getStatusInfo = (status: Application['status']) => {
    switch (status) {
      case 'en_attente':
        return {
          label: 'En attente',
          color: 'amber',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          icon: Clock,
        };
      case 'en_cours':
        return {
          label: 'En cours',
          color: 'blue',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          icon: FileText,
        };
      case 'acceptee':
        return {
          label: 'Acceptée',
          color: 'green',
          bg: 'bg-green-50',
          text: 'text-green-700',
          icon: CheckCircle,
        };
      case 'refusee':
        return {
          label: 'Refusée',
          color: 'red',
          bg: 'bg-red-50',
          text: 'text-red-700',
          icon: XCircle,
        };
    }
  };

  const getPriorityInfo = (priority: Application['priority']) => {
    switch (priority) {
      case 'haute':
        return { label: 'Haute', color: 'orange' };
      case 'urgente':
        return { label: 'Urgente', color: 'red' };
      default:
        return { label: 'Normale', color: 'gray' };
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price).replace('XOF', 'FCFA');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleWithdrawApplication = (applicationId: string) => {
    // TODO: Implémenter le retrait de candidature
    console.log('Retirer candidature:', applicationId);
  };

  const handleViewDetails = (applicationId: string) => {
    // TODO: Implémenter la navigation vers les détails
    console.log('Voir détails:', applicationId);
  };

  const stats = {
    total: allApplications.length,
    pending: allApplications.filter(app => app.status === 'en_attente').length,
    active: allApplications.filter(app => app.status === 'en_cours').length,
    accepted: allApplications.filter(app => app.status === 'acceptee').length,
    rejected: allApplications.filter(app => app.status === 'refusee').length,
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
  };

  return (
    <div className="space-y-6">
      {/* Header */}
<<<<<<< HEAD
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
=======
      {(showHeader || applications.length === 0) && (
        <div>
          <h2 className="text-h3 font-bold text-text-primary mb-2">
            Mes candidatures
          </h2>
          <p className="text-body text-text-secondary">
            Gérez et suivez l'état de vos candidatures de location
          </p>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card variant="bordered" className="text-center">
          <CardBody className="py-4">
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
            <p className="text-sm text-text-secondary">Total</p>
          </CardBody>
        </Card>
        <Card variant="bordered" className="text-center">
          <CardBody className="py-4">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-sm text-text-secondary">En attente</p>
          </CardBody>
        </Card>
        <Card variant="bordered" className="text-center">
          <CardBody className="py-4">
            <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            <p className="text-sm text-text-secondary">En cours</p>
          </CardBody>
        </Card>
        <Card variant="bordered" className="text-center">
          <CardBody className="py-4">
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            <p className="text-sm text-text-secondary">Acceptées</p>
          </CardBody>
        </Card>
        <Card variant="bordered" className="text-center">
          <CardBody className="py-4">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-text-secondary">Refusées</p>
          </CardBody>
        </Card>
      </div>

      {/* Filtres et tri */}
      <Card variant="bordered">
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === 'all' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setFilter('all')}
              >
                Toutes ({stats.total})
              </Button>
              <Button
                variant={filter === 'en_attente' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setFilter('en_attente')}
              >
                En attente ({stats.pending})
              </Button>
              <Button
                variant={filter === 'en_cours' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setFilter('en_cours')}
              >
                En cours ({stats.active})
              </Button>
              <Button
                variant={filter === 'acceptee' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setFilter('acceptee')}
              >
                Acceptées ({stats.accepted})
              </Button>
              <Button
                variant={filter === 'refusee' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setFilter('refusee')}
              >
                Refusées ({stats.rejected})
              </Button>
            </div>
            
            <div className="flex gap-2 ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 border border-neutral-200 rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="date">Trier par date</option>
                <option value="status">Trier par statut</option>
                <option value="rent">Trier par loyer</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Liste des candidatures */}
      {sortedApplications.length > 0 ? (
        <div className="space-y-4">
          {sortedApplications.map((application) => {
            const statusInfo = getStatusInfo(application.status);
            const priorityInfo = getPriorityInfo(application.priority);
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={application.id} variant="bordered" hoverable>
                <CardBody>
                  <div className="flex gap-4">
                    {/* Image de la propriété */}
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={application.property_image || 'https://via.placeholder.com/80'}
                        alt={application.property_title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-text-primary mb-1">
                            {application.property_title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-text-secondary">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {application.property_city}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatPrice(application.monthly_rent)}/mois
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Candidature du {formatDate(application.created_at)}
                            </div>
                          </div>
                        </div>

                        {/* Badge de statut */}
                        <div className="flex items-center gap-2">
                          <span className={`
                            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                            ${statusInfo.bg} ${statusInfo.text}
                          `}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </span>
                          {application.priority !== 'normale' && (
                            <span className={`
                              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                              ${priorityInfo.color === 'orange' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'}
                            `}>
                              {priorityInfo.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Message du candidat */}
                      {application.applicant_message && (
                        <div className="mb-3">
                          <p className="text-sm text-text-secondary italic">
                            "{application.applicant_message}"
                          </p>
                        </div>
                      )}

                      {/* Documents soumis */}
                      <div className="flex items-center gap-2 mb-4">
                        <User className="h-4 w-4 text-text-disabled" />
                        <span className="text-sm text-text-secondary">
                          Documents: {application.documents_submitted.length} soumis
                        </span>
                        <div className="flex gap-1">
                          {application.documents_submitted.map((doc, index) => (
                            <span
                              key={index}
                              className="inline-block w-2 h-2 bg-primary-500 rounded-full"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-text-disabled">
                          Dernière mise à jour: {formatDate(application.updated_at)}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => handleViewDetails(application.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                          {(application.status === 'en_attente' || application.status === 'en_cours') && (
                            <Button
                              variant="ghost"
                              size="small"
                              onClick={() => handleWithdrawApplication(application.id)}
                              className="text-semantic-error hover:bg-semantic-error hover:text-white"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Retirer
                            </Button>
                          )}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
                        </div>
                      </div>
                    </div>
                  </div>
<<<<<<< HEAD
                  
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
=======
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card variant="bordered">
          <CardBody className="text-center py-12">
            <FileText className="h-16 w-16 text-text-disabled mx-auto mb-4" />
            <h3 className="text-h5 font-semibold text-text-primary mb-2">
              {filter === 'all' ? 'Aucune candidature' : `Aucune candidature ${filter}`}
            </h3>
            <p className="text-body text-text-secondary mb-6">
              {filter === 'all' 
                ? 'Vous n\'avez pas encore soumis de candidatures.'
                : `Vous n'avez pas de candidatures avec le statut "${filter}".`
              }
            </p>
            <Button variant="primary">
              Rechercher des propriétés
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
