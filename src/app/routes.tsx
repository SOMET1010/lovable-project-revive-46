import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import Layout from '@/app/layout/Layout';
import AdminLayout from '@/app/layout/AdminLayout';
import ErrorBoundary from '@/shared/ui/ErrorBoundary';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import SearchErrorBoundary from '@/features/tenant/components/SearchErrorBoundary';

// Auth pages
const Home = lazy(() => import('@/features/property/pages/HomePage'));
const NotFound = lazy(() => import('@/features/property/pages/NotFoundPage'));
const AddPropertyLanding = lazy(() => import('@/features/property/pages/AddPropertyLandingPage'));
const ModernAuth = lazy(() => import('@/features/auth/pages/ModernAuthPage'));
const AuthCallback = lazy(() => import('@/features/auth/pages/CallbackPage'));
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ProfileSelection = lazy(() => import('@/features/auth/pages/ProfileSelectionPage'));
const ProfileCompletion = lazy(() => import('@/features/auth/pages/ProfileCompletionPage'));

// Property pages
const SearchProperties = lazy(() => import('@/features/tenant/pages/SearchPropertiesPage'));
const PropertyDetail = lazy(() => import('@/features/tenant/pages/PropertyDetailPage'));
const Favorites = lazy(() => import('@/features/tenant/pages/FavoritesPage'));
const SavedSearches = lazy(() => import('@/features/tenant/pages/SavedSearchesPage'));

// Application & Visit pages
const ApplicationForm = lazy(() => import('@/features/tenant/pages/ApplicationFormPage'));
const ScheduleVisit = lazy(() => import('@/features/tenant/pages/ScheduleVisitPage'));
const MyVisits = lazy(() => import('@/features/tenant/pages/MyVisitsPage'));

// Tenant dashboard pages
const TenantDashboard = lazy(() => import('@/features/tenant/pages/DashboardPage'));
const TenantCalendar = lazy(() => import('@/features/tenant/pages/CalendarPage'));
const TenantMaintenance = lazy(() => import('@/features/tenant/pages/MaintenancePage'));
const TenantScorePage = lazy(() => import('@/features/tenant/pages/ScorePage'));
const MaintenanceRequest = lazy(() => import('@/features/tenant/pages/MaintenanceRequestPage'));

// Profile page
const ProfilePage = lazy(() => import('@/features/tenant/pages/ProfilePage'));

// Contract pages
const ContractDetail = lazy(() => import('@/features/tenant/pages/ContractDetailPage'));
const MyContracts = lazy(() => import('@/features/tenant/pages/MyContractsPage'));
const SignLease = lazy(() => import('@/features/tenant/pages/SignLeasePage'));

// Payment pages
const MakePayment = lazy(() => import('@/features/tenant/pages/MakePaymentPage'));
const PaymentHistory = lazy(() => import('@/features/tenant/pages/PaymentHistoryPage'));

// Owner pages
const AddProperty = lazy(() => import('@/features/owner/pages/AddPropertyPage'));

// Admin pages
const AdminDashboard = lazy(() => import('@/features/admin/pages/DashboardPage'));
const AdminUsers = lazy(() => import('@/features/admin/pages/UsersPage'));
const AdminUserRoles = lazy(() => import('@/features/admin/pages/UserRolesPage'));
const AdminApiKeys = lazy(() => import('@/features/admin/pages/ApiKeysPage'));
const AdminCEVManagement = lazy(() => import('@/features/admin/pages/CEVManagementPage'));
const AdminTrustAgents = lazy(() => import('@/features/admin/pages/TrustAgentsPage'));

// Static pages
const AboutPage = lazy(() => import('@/features/auth/pages/AboutPage'));
const TermsOfServicePage = lazy(() => import('@/features/auth/pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('@/features/auth/pages/PrivacyPolicyPage'));
const ContactPage = lazy(() => import('@/features/auth/pages/ContactPage'));
const HelpPage = lazy(() => import('@/features/auth/pages/HelpPage'));
const FAQPage = lazy(() => import('@/features/auth/pages/FAQPage'));
const HowItWorksPage = lazy(() => import('@/features/auth/pages/HowItWorksPage'));

// Messaging
const MessagesPage = lazy(() => import('@/features/messaging/pages/MessagesPage'));

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
      { path: 'dashboard/ajouter-propriete', element: <ProtectedRoute allowedRoles={['proprietaire', 'agence']}><AddProperty /></ProtectedRoute> },
      { path: 'add-property', element: <ProtectedRoute allowedRoles={['proprietaire', 'agence']}><AddProperty /></ProtectedRoute> },

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
