import React from 'react';
import { TenantDashboard } from './tenant';
import { OwnerApplicationsSection } from './owner/sections';
import { AgencyApplicationsSection } from './agency/sections';
import { ApplicationCard, ApplicationFilters, ApplicationStats, type FilterOptions } from './shared';

/**
 * Démonstration de l'intégration des candidatures dans les dashboards
 * 
 * Ce fichier montre comment utiliser les nouveaux composants dans différents contextes
 */

const DemoApplicationsIntegration: React.FC = () => {
  // Exemple de filtres pour démonstration
  const demoFilters: FilterOptions = {
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
  };

  // Exemple de statistiques pour démonstration
  const demoStats = {
    total: 24,
    pending: 8,
    inProgress: 3,
    accepted: 12,
    rejected: 1,
    withIncompleteDocs: 5,
    withCompleteDocs: 16,
    underReview: 3,
    totalValue: 8500000,
    averageRent: 354167,
    conversionRate: 50,
    responseTime: 2.3,
    recentActivity: [
      { date: '2025-11-29', count: 3, type: 'Nouvelles candidatures' },
      { date: '2025-11-28', count: 2, type: 'Candidatures acceptées' },
      { date: '2025-11-27', count: 1, type: 'Documents vérifiés' }
    ],
    statusTrend: [
      { period: 'Nov', applications: 24, change: 15 },
      { period: 'Oct', applications: 21, change: -8 },
      { period: 'Sep', applications: 18, change: 12 }
    ]
  };

  // Handlers pour les actions
  const handleViewDetails = (id: number) => {
    console.log('Voir détails candidature:', id);
  };

  const handleContact = (id: number) => {
    console.log('Contacter candidat:', id);
  };

  const handleUpdateStatus = (id: number, status: string) => {
    console.log('Mettre à jour statut:', id, status);
  };

  const handleDownload = (id: number, fileId: string) => {
    console.log('Télécharger document:', id, fileId);
  };

  const handleFiltersChange = (filters: FilterOptions) => {
    console.log('Nouveaux filtres:', filters);
  };

  const handleExport = () => {
    console.log('Export des données');
  };

  const handleImport = () => {
    console.log('Import de données');
  };

  const handleClearFilters = () => {
    console.log('Effacer filtres');
  };

  // Exemples d'utilisation des composants

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header de démonstration */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Intégration des Candidatures - Démonstration
          </h1>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Découvrez les nouvelles fonctionnalités de gestion des candidatures 
            intégrées dans les dashboards Tenant, Owner et Agency.
          </p>
        </div>

        {/* Section 1: Composants individuels */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Composants Partagés
          </h2>
          
          {/* ApplicationStats Demo */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-800 mb-4">
              Statistiques des Candidatures
            </h3>
            <ApplicationStats
              stats={demoStats}
              role="owner"
              timeFrame="month"
              showTrends={true}
            />
          </div>

          {/* ApplicationFilters Demo */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-800 mb-4">
              Filtres de Recherche
            </h3>
            <ApplicationFilters
              filters={demoFilters}
              onFiltersChange={handleFiltersChange}
              role="owner"
              onExport={handleExport}
              onImport={handleImport}
              onClearFilters={handleClearFilters}
              totalResults={24}
            />
          </div>

          {/* ApplicationCard Demo */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-800 mb-4">
              Carte de Candidature
            </h3>
            <div className="max-w-2xl">
              <ApplicationCard
                application={{
                  id: 1,
                  propertyId: 101,
                  propertyTitle: "Villa Moderne Cocody",
                  propertyAddress: "Cocody, Riviera Golf",
                  propertyType: "villa",
                  propertyRent: 450000,
                  applicantName: "Jean Kouassi",
                  applicantEmail: "jean.kouassi@email.com",
                  applicantPhone: "+225 07 11 22 33",
                  applicantAge: 32,
                  applicantIncome: 850000,
                  applicationDate: "2025-11-28",
                  status: "en_attente",
                  documentsStatus: "complet",
                  message: "Très intéressé par cette villa, j'ai un emploi stable.",
                  priority: "haute",
                  lastUpdate: "2025-11-29",
                  creditScore: 85,
                  employmentType: "CDI",
                  references: 2,
                  files: [
                    { id: 'doc1', name: 'PieceIdentite.pdf', type: 'pdf', size: 2048000, url: '/docs/piece-identite.pdf' },
                    { id: 'doc2', name: 'BulletinSalaire.pdf', type: 'pdf', size: 1536000, url: '/docs/bulletin-salaire.pdf' }
                  ]
                }}
                role="owner"
                onViewDetails={handleViewDetails}
                onContact={handleContact}
                onUpdateStatus={handleUpdateStatus}
                onDownload={handleDownload}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Sections complètes par rôle */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Sections Complètes par Rôle
          </h2>

          {/* Owner Applications Section */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-neutral-800 mb-4">
              Dashboard Propriétaire
            </h3>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <OwnerApplicationsSection
                ownerId={1}
                ownerName="Marie DUPONT"
              />
            </div>
          </div>

          {/* Agency Applications Section */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-neutral-800 mb-4">
              Dashboard Agence
            </h3>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <AgencyApplicationsSection
                agencyId={1}
                agencyName="Immobilier Premium Abidjan"
              />
            </div>
          </div>

          {/* Tenant Dashboard */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-neutral-800 mb-4">
              Dashboard Locataire
            </h3>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <TenantDashboard
                tenantId={1}
                tenantName="Jean Dupont"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Fonctionnalités avancées */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Fonctionnalités Avancées
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="text-lg font-semibold text-neutral-900">
                  Filtrage Avancé
                </h4>
              </div>
              <p className="text-neutral-600 text-sm">
                Filtres multi-critères avec recherche textuelle, 
                plages de valeurs et tri dynamique.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h4 className="text-lg font-semibold text-neutral-900">
                  Actions en Masse
                </h4>
              </div>
              <p className="text-neutral-600 text-sm">
                Sélection multiple avec actions groupées 
                pour optimiser le traitement des candidatures.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="text-lg font-semibold text-neutral-900">
                  Analytics & Stats
                </h4>
              </div>
              <p className="text-neutral-600 text-sm">
                Tableaux de bord avec métriques de performance, 
                tendances et conversions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-amber-600 font-bold">4</span>
                </div>
                <h4 className="text-lg font-semibold text-neutral-900">
                  Export/Import
                </h4>
              </div>
              <p className="text-neutral-600 text-sm">
                Export CSV/PDF et import de données pour 
                intégration avec d'autres systèmes.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-red-600 font-bold">5</span>
                </div>
                <h4 className="text-lg font-semibold text-neutral-900">
                  Responsive Design
                </h4>
              </div>
              <p className="text-neutral-600 text-sm">
                Interface adaptative pour mobile, tablette 
                et desktop avec navigation optimisée.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-cyan-600 font-bold">6</span>
                </div>
                <h4 className="text-lg font-semibold text-neutral-900">
                  Workflow Personnalisé
                </h4>
              </div>
              <p className="text-neutral-600 text-sm">
                Processus adaptés selon le rôle avec 
                actions contextuelles et permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Code examples */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Exemples d'Intégration
          </h2>
          
          <div className="bg-neutral-900 rounded-lg p-6 text-green-400 font-mono text-sm overflow-x-auto">
            <pre>{`// Import des composants
import { 
  ApplicationCard, 
  ApplicationFilters, 
  ApplicationStats 
} from '@/components/dashboard/shared';

// Usage dans un composant
const MyComponent = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    // ... autres filtres
  });

  return (
    <div>
      <ApplicationStats 
        stats={stats} 
        role="owner" 
        showTrends={true} 
      />
      <ApplicationFilters
        filters={filters}
        onFiltersChange={setFilters}
        role="owner"
        onExport={handleExport}
      />
      {applications.map(app => (
        <ApplicationCard
          key={app.id}
          application={app}
          role="owner"
          onViewDetails={handleView}
          onUpdateStatus={handleUpdate}
        />
      ))}
    </div>
  );
};`}</pre>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-neutral-500 border-t border-neutral-200 pt-8">
          <p className="mb-2">
            © 2025 LocatHub - Intégration des Candidatures
          </p>
          <p className="text-sm">
            Documentation complète disponible dans 
            <code className="bg-neutral-100 px-2 py-1 rounded mx-1">
              /src/components/dashboard/APPLICATIONS_INTEGRATION.md
            </code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoApplicationsIntegration;