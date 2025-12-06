import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import Layout from '@/app/layout/Layout';
import AdminLayout from '@/app/layout/AdminLayout';
import ErrorBoundary from '@/shared/ui/ErrorBoundary';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import SearchErrorBoundary from '@/features/tenant/components/SearchErrorBoundary';

// Lazy loading with retry for chunk loading errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lazyWithRetry = (
  componentImport: () => Promise<{ default: React.ComponentType<any> }>,
  retries = 3,
  delay = 1000
) => {
  return lazy(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        return await componentImport();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return componentImport();
  });
};

// Auth pages
const Home = lazyWithRetry(() => import('@/features/property/pages/HomePage'));
const NotFound = lazyWithRetry(() => import('@/features/property/pages/NotFoundPage'));
const AddPropertyLanding = lazyWithRetry(() => import('@/features/property/pages/AddPropertyLandingPage'));
const ModernAuth = lazyWithRetry(() => import('@/features/auth/pages/ModernAuthPage'));
const AuthCallback = lazyWithRetry(() => import('@/features/auth/pages/CallbackPage'));
const ForgotPassword = lazyWithRetry(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ProfileSelection = lazyWithRetry(() => import('@/features/auth/pages/ProfileSelectionPage'));
const ProfileCompletion = lazyWithRetry(() => import('@/features/auth/pages/ProfileCompletionPage'));

// Property pages
const SearchProperties = lazyWithRetry(() => import('@/features/tenant/pages/SearchPropertiesPage'));
const PropertyDetail = lazyWithRetry(() => import('@/features/tenant/pages/PropertyDetailPage'));
const Favorites = lazyWithRetry(() => import('@/features/tenant/pages/FavoritesPage'));
const SavedSearches = lazyWithRetry(() => import('@/features/tenant/pages/SavedSearchesPage'));

// Application & Visit pages
const ApplicationForm = lazyWithRetry(() => import('@/features/tenant/pages/ApplicationFormPage'));
const ScheduleVisit = lazyWithRetry(() => import('@/features/tenant/pages/ScheduleVisitPage'));
const MyVisits = lazyWithRetry(() => import('@/features/tenant/pages/MyVisitsPage'));

// Tenant dashboard pages
const TenantDashboard = lazyWithRetry(() => import('@/features/tenant/pages/DashboardPage'));
const TenantCalendar = lazyWithRetry(() => import('@/features/tenant/pages/CalendarPage'));
const TenantMaintenance = lazyWithRetry(() => import('@/features/tenant/pages/MaintenancePage'));
const TenantScorePage = lazyWithRetry(() => import('@/features/tenant/pages/ScorePage'));
const MaintenanceRequest = lazyWithRetry(() => import('@/features/tenant/pages/MaintenanceRequestPage'));

// Profile page
const ProfilePage = lazyWithRetry(() => import('@/features/tenant/pages/ProfilePage'));

// Contract pages
const ContractDetail = lazyWithRetry(() => import('@/features/tenant/pages/ContractDetailPage'));
const MyContracts = lazyWithRetry(() => import('@/features/tenant/pages/MyContractsPage'));
const SignLease = lazyWithRetry(() => import('@/features/tenant/pages/SignLeasePage'));

// Payment pages
const MakePayment = lazyWithRetry(() => import('@/features/tenant/pages/MakePaymentPage'));
const PaymentHistory = lazyWithRetry(() => import('@/features/tenant/pages/PaymentHistoryPage'));

// Owner pages
const AddProperty = lazyWithRetry(() => import('@/features/owner/pages/AddPropertyPage'));
const OwnerDashboard = lazyWithRetry(() => import('@/features/owner/pages/DashboardPage'));
const CreateContract = lazyWithRetry(() => import('@/features/owner/pages/CreateContractPage'));
const OwnerContracts = lazyWithRetry(() => import('@/features/owner/pages/OwnerContractsPage'));

// Agency pages
const AgencyDashboard = lazyWithRetry(() => import('@/features/agency/pages/DashboardPage'));

// Admin pages
const AdminDashboard = lazyWithRetry(() => import('@/features/admin/pages/DashboardPage'));
const AdminUsers = lazyWithRetry(() => import('@/features/admin/pages/UsersPage'));
const AdminUserRoles = lazyWithRetry(() => import('@/features/admin/pages/UserRolesPage'));
const AdminApiKeys = lazyWithRetry(() => import('@/features/admin/pages/ApiKeysPage'));
const AdminCEVManagement = lazyWithRetry(() => import('@/features/admin/pages/CEVManagementPage'));
const AdminTrustAgents = lazyWithRetry(() => import('@/features/admin/pages/TrustAgentsPage'));

// Trust Agent pages
const TrustAgentLayout = lazyWithRetry(() => import('@/features/trust-agent/layouts/TrustAgentLayout'));
const TrustAgentDashboard = lazyWithRetry(() => import('@/features/trust-agent/pages/DashboardPage'));
const MissionDetail = lazyWithRetry(() => import('@/features/trust-agent/pages/MissionDetailPage'));
const PhotoVerification = lazyWithRetry(() => import('@/features/trust-agent/pages/PhotoVerificationPage'));
const DocumentValidation = lazyWithRetry(() => import('@/features/trust-agent/pages/DocumentValidationPage'));
const EtatDesLieux = lazyWithRetry(() => import('@/features/trust-agent/pages/EtatDesLieuxPage'));

// Static pages
const AboutPage = lazyWithRetry(() => import('@/features/auth/pages/AboutPage'));
const TermsOfServicePage = lazyWithRetry(() => import('@/features/auth/pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazyWithRetry(() => import('@/features/auth/pages/PrivacyPolicyPage'));
const ContactPage = lazyWithRetry(() => import('@/features/auth/pages/ContactPage'));
const HelpPage = lazyWithRetry(() => import('@/features/auth/pages/HelpPage'));
const FAQPage = lazyWithRetry(() => import('@/features/auth/pages/FAQPage'));
const HowItWorksPage = lazyWithRetry(() => import('@/features/auth/pages/HowItWorksPage'));

// Messaging
const MessagesPage = lazyWithRetry(() => import('@/features/messaging/pages/MessagesPage'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      // Home
      { index: true, element: <Home /> },

      // Auth routes
      { path: 'connexion', element: <ModernAuth /> },
      { path: 'inscription', element: <ModernAuth /> },
      { path: 'login', element: <Navigate to="/connexion" replace /> },
      { path: 'auth', element: <ModernAuth /> },
      { path: 'auth/callback', element: <AuthCallback /> },
      { path: 'mot-de-passe-oublie', element: <ForgotPassword /> },
      { path: 'choix-profil', element: <ProtectedRoute><ProfileSelection /></ProtectedRoute> },
      { path: 'completer-profil', element: <ProtectedRoute><ProfileCompletion /></ProtectedRoute> },

      // Static pages
      { path: 'a-propos', element: <AboutPage /> },
      { path: 'conditions-utilisation', element: <TermsOfServicePage /> },
      { path: 'politique-confidentialite', element: <PrivacyPolicyPage /> },
      { path: 'mentions-legales', element: <TermsOfServicePage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'aide', element: <HelpPage /> },
      { path: 'faq', element: <FAQPage /> },
      { path: 'comment-ca-marche', element: <HowItWorksPage /> },
      { path: 'guide', element: <HowItWorksPage /> },

      // Property landing pages
      { path: 'ajouter-propriete', element: <AddPropertyLanding /> },
      { path: 'louer-mon-bien', element: <AddPropertyLanding /> },

      // User dashboard
      { path: 'dashboard', element: <ProtectedRoute><TenantDashboard /></ProtectedRoute> },

      // Profile
      { path: 'profil', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: 'verification', element: <Navigate to="/profil?tab=verification" replace /> },

      // Property search & details
      { path: 'recherche', element: <SearchErrorBoundary><SearchProperties /></SearchErrorBoundary> },
      { path: 'propriete/:id', element: <PropertyDetail /> },
      { path: 'properties/:id', element: <PropertyDetail /> },
      { path: 'proprietes/:id', element: <PropertyDetail /> },

      // Favorites & saved searches
      { path: 'favoris', element: <ProtectedRoute><Favorites /></ProtectedRoute> },
      { path: 'recherches-sauvegardees', element: <ProtectedRoute><SavedSearches /></ProtectedRoute> },

      // Messaging
      { path: 'messages', element: <ProtectedRoute><MessagesPage /></ProtectedRoute> },

      // Applications
      { path: 'candidature/:id', element: <ProtectedRoute><ApplicationForm /></ProtectedRoute> },
      { path: 'dashboard/candidature/:id', element: <ProtectedRoute allowedRoles={['proprietaire', 'agence']}><ApplicationForm /></ProtectedRoute> },

      // Visits
      { path: 'visiter/:id', element: <ProtectedRoute><ScheduleVisit /></ProtectedRoute> },
      { path: 'visites/planifier/:id', element: <Navigate to="/visiter/:id" replace /> },
      { path: 'mes-visites', element: <ProtectedRoute><MyVisits /></ProtectedRoute> },

      // Contracts
      { path: 'contrat/:id', element: <ProtectedRoute><ContractDetail /></ProtectedRoute> },
      { path: 'mes-contrats', element: <ProtectedRoute><MyContracts /></ProtectedRoute> },
      { path: 'signer-bail/:id', element: <ProtectedRoute><SignLease /></ProtectedRoute> },

      // Payments
      { path: 'effectuer-paiement', element: <ProtectedRoute><MakePayment /></ProtectedRoute> },
      { path: 'mes-paiements', element: <ProtectedRoute><PaymentHistory /></ProtectedRoute> },

      // Tenant specific routes
      { path: 'dashboard/locataire', element: <ProtectedRoute allowedRoles={['locataire']}><TenantDashboard /></ProtectedRoute> },
      { path: 'dashboard/locataire/calendrier', element: <ProtectedRoute allowedRoles={['locataire']}><TenantCalendar /></ProtectedRoute> },
      { path: 'maintenance/locataire', element: <ProtectedRoute allowedRoles={['locataire']}><TenantMaintenance /></ProtectedRoute> },
      { path: 'mon-score', element: <ProtectedRoute allowedRoles={['locataire']}><TenantScorePage /></ProtectedRoute> },
      { path: 'maintenance/nouvelle', element: <ProtectedRoute><MaintenanceRequest /></ProtectedRoute> },

      // Owner routes
      { path: 'dashboard/proprietaire', element: <ProtectedRoute allowedRoles={['proprietaire', 'owner']}><OwnerDashboard /></ProtectedRoute> },
      { path: 'dashboard/ajouter-propriete', element: <ProtectedRoute allowedRoles={['proprietaire', 'agence', 'owner', 'agent']}><AddProperty /></ProtectedRoute> },
      { path: 'add-property', element: <ProtectedRoute allowedRoles={['proprietaire', 'agence', 'owner', 'agent']}><AddProperty /></ProtectedRoute> },
      { path: 'dashboard/creer-contrat', element: <ProtectedRoute allowedRoles={['proprietaire', 'owner']}><CreateContract /></ProtectedRoute> },
      { path: 'dashboard/mes-contrats', element: <ProtectedRoute allowedRoles={['proprietaire', 'owner']}><OwnerContracts /></ProtectedRoute> },

      // Agency routes
      { path: 'dashboard/agence', element: <ProtectedRoute allowedRoles={['agence', 'agent']}><AgencyDashboard /></ProtectedRoute> },

      // Trust Agent routes
      {
        path: 'trust-agent',
        element: <ProtectedRoute allowedRoles={['trust_agent']}><TrustAgentLayout /></ProtectedRoute>,
        children: [
          { index: true, element: <Navigate to="/trust-agent/dashboard" replace /> },
          { path: 'dashboard', element: <TrustAgentDashboard /> },
          { path: 'mission/:id', element: <MissionDetail /> },
          { path: 'photos/:id', element: <PhotoVerification /> },
          { path: 'documents/:id', element: <DocumentValidation /> },
          { path: 'etat-des-lieux/:id', element: <EtatDesLieux /> },
        ]
      },

      // Admin routes
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>,
        children: [
          { path: 'tableau-de-bord', element: <AdminDashboard /> },
          { path: 'utilisateurs', element: <AdminUsers /> },
          { path: 'gestion-roles', element: <AdminUserRoles /> },
          { path: 'api-keys', element: <AdminApiKeys /> },
          { path: 'cev-management', element: <AdminCEVManagement /> },
          { path: 'cev/:id', element: <AdminCEVManagement /> },
          { path: 'trust-agents', element: <AdminTrustAgents /> },
        ]
      },

      // 404 fallback
      { path: '*', element: <NotFound /> },
    ],
  },
];
