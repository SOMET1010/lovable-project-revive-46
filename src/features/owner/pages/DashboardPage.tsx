import { useState, useEffect } from 'react';
import { 
  Plus, Home, Eye, Calendar, TrendingUp, Edit, ExternalLink, Award, Filter, 
  Coins, MessageSquare, Users, Clock, BarChart3, TrendingDown, Wrench, 
  FileText, MoreVertical, AlertTriangle, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Building2, Activity, DollarSign, Percent
} from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { ScoringService } from '@/services/scoringService';
import type { Database } from '@/shared/lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];
type Application = Database['public']['Tables']['rental_applications']['Row'];
type Lease = Database['public']['Tables']['leases']['Row'];
type MaintenanceRequest = Database['public']['Tables']['maintenance_requests']['Row'];

export default function OwnerDashboard() {
  const { user, profile } = useAuth();
  
  // État principal
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  
  // État interface
  const [loading, setLoading] = useState(true);
  const [propertiesPage, setPropertiesPage] = useState(1);
  const [propertiesPerPage] = useState(8);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);
  const [occupancyRate, setOccupancyRate] = useState(0);
  
  // Stats principales
  const [stats, setStats] = useState({
    activeProperties: 0,
    totalTenants: 0,
    monthlyRevenue: 0,
    occupancyRate: 0,
    pendingApplications: 0,
    urgentMaintenance: 0,
    upcomingPayments: 0,
    monthlyGrowth: 0,
  });

  useEffect(() => {
    if (!user) {
      window.location.href = '/connexion';
      return;
    }

    if (profile && profile.user_type !== 'proprietaire' && profile.user_type !== 'agence') {
      window.location.href = '/';
      return;
    }

    loadDashboardData();
  }, [user, profile]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Charger les propriétés
      const { data: propsData, error: propsError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (propsError) throw propsError;
      setProperties(propsData || []);

      const propertyIds = (propsData || []).map(p => p.id);
      const activeProps = (propsData || []).filter(p => p.status === 'disponible').length;
      const rentedProps = (propsData || []).filter(p => p.status === 'loue').length;
      const occupancyRate = propertyIds.length > 0 ? (rentedProps / propertyIds.length) * 100 : 0;

      if (propertyIds.length > 0) {
        // Charger les candidatures
        const { data: appsData } = await supabase
          .from('rental_applications')
          .select('*')
          .in('property_id', propertyIds)
          .order('application_score', { ascending: false });

        setApplications(appsData || []);
        const pendingApps = (appsData || []).filter(app => app.status === 'en_attente').length;

        // Charger les baux actifs
        const { data: leasesData } = await supabase
          .from('leases')
          .select(`
            *,
            property:properties(title, monthly_rent),
            tenant:profiles!leases_tenant_id_fkey(full_name)
          `)
          .in('property_id', propertyIds)
          .eq('status', 'actif')
          .order('end_date', { ascending: true });

        setLeases(leasesData || []);
        const activeLeases = leasesData || [];
        const totalTenants = activeLeases.length;

        // Calculer le revenu mensuel
        const monthlyRevenue = activeLeases.reduce((sum, lease) => {
          return sum + (lease.property as any)?.monthly_rent || 0;
        }, 0);

        // Charger les demandes de maintenance
        const { data: maintenanceData } = await supabase
          .from('maintenance_requests')
          .select(`
            *,
            property:properties(title),
            tenant:profiles!maintenance_requests_tenant_id_fkey(full_name)
          `)
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false });

        setMaintenanceRequests(maintenanceData || []);
        const urgentMaintenance = (maintenanceData || []).filter(
          req => req.urgency === 'urgent' && !['resolue', 'refusee'].includes(req.status)
        ).length;

        // Calculer la croissance mensuelle (simulation)
        const lastMonthRevenue = monthlyRevenue * 0.92; // Simulation -2% du mois dernier
        const monthlyGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

        setStats({
          activeProperties,
          totalTenants,
          monthlyRevenue,
          occupancyRate: Math.round(occupancyRate),
          pendingApplications: pendingApps,
          urgentMaintenance,
          upcomingPayments: activeLeases.filter(lease => {
            const endDate = new Date(lease.end_date);
            const now = new Date();
            const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 30 && diffDays > 0;
          }).length,
          monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
        });

        setCurrentMonthRevenue(monthlyRevenue);
        setOccupancyRate(Math.round(occupancyRate));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination pour les propriétés
  const totalPropertiesPages = Math.ceil(properties.length / propertiesPerPage);
  const paginatedProperties = properties.slice(
    (propertiesPage - 1) * propertiesPerPage,
    propertiesPage * propertiesPerPage
  );

  // Helper pour formater les dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Helper pour calculer les jours restants
  const getDaysRemaining = (dateString: string) => {
    const endDate = new Date(dateString);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Actions pour les propriétés
  const handlePropertyAction = async (propertyId: string, action: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: action === 'active' ? 'disponible' : 'inactif' })
        .eq('id', propertyId);

      if (error) throw error;
      
      // Recharger les données
      loadDashboardData();
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Erreur lors de la mise à jour de la propriété');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-surface">
      {/* Header Dashboard */}
      <div className="bg-background-page border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-6 lg:space-y-0">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2 flex items-center space-x-4">
                <Building2 className="h-10 w-10 text-primary-500" />
                <span>Mes Propriétés</span>
              </h1>
              <p className="text-neutral-700 text-lg">
                Gérez votre portefeuille immobilier en toute simplicité
              </p>
              <div className="flex items-center space-x-6 mt-4 text-sm text-neutral-600">
                <span className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>{stats.activeProperties} propriétés actives</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{stats.totalTenants} locataires</span>
                </span>
              </div>
            </div>
            
            <a
              href="/dashboard/ajouter-propriete"
              className="btn-primary px-6 py-3 flex items-center space-x-3 whitespace-nowrap hover:scale-105 transition-transform"
            >
              <Plus className="h-5 w-5" />
              <span>Ajouter une propriété</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grille de Statistiques - 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Propriétés Actives */}
          <div className="bg-background-page rounded-lg border border-neutral-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Home className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Propriétés
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 mb-1">
                {stats.activeProperties}
              </p>
              <p className="text-sm text-neutral-600">
                Actives sur {properties.length} totales
              </p>
            </div>
          </div>

          {/* Locataires */}
          <div className="bg-background-page rounded-lg border border-neutral-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Locataires
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 mb-1">
                {stats.totalTenants}
              </p>
              <p className="text-sm text-neutral-600">
                Baux actifs
              </p>
            </div>
          </div>

          {/* Revenus du Mois */}
          <div className="bg-background-page rounded-lg border border-neutral-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Revenus
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 mb-1">
                {currentMonthRevenue.toLocaleString('fr-FR')}
              </p>
              <p className="text-sm text-neutral-600">
                FCFA/mois
                {stats.monthlyGrowth !== 0 && (
                  <span className={`ml-2 inline-flex items-center ${stats.monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.monthlyGrowth > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {Math.abs(stats.monthlyGrowth)}%
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Taux d'Occupation */}
          <div className="bg-background-page rounded-lg border border-neutral-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Percent className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Occupation
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 mb-1">
                {stats.occupancyRate}%
              </p>
              <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.occupancyRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Analytics Rapides */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 flex items-center space-x-3">
              <BarChart3 className="h-7 w-7 text-primary-500" />
              <span>Analytics Rapides</span>
            </h2>
            <a 
              href="/dashboard/proprietaire/analytics"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1"
            >
              <span>Voir tous les analytics</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-background-page rounded-lg border border-neutral-100 p-6">
              <h3 className="font-semibold text-neutral-900 mb-3">Performance Mensuelle</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Vues propriétés</span>
                  <span className="font-medium">+12%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Candidatures</span>
                  <span className="font-medium">+8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Taux conversion</span>
                  <span className="font-medium">3.2%</span>
                </div>
              </div>
            </div>

            <div className="bg-background-page rounded-lg border border-neutral-100 p-6">
              <h3 className="font-semibold text-neutral-900 mb-3">Revenus Projets</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Ce mois</span>
                  <span className="font-medium">{currentMonthRevenue.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Mois dernier</span>
                  <span className="font-medium">{Math.round(currentMonthRevenue * 0.92).toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Prévisionnel</span>
                  <span className="font-medium text-green-600">+{stats.monthlyGrowth}%</span>
                </div>
              </div>
            </div>

            <div className="bg-background-page rounded-lg border border-neutral-100 p-6">
              <h3 className="font-semibold text-neutral-900 mb-3">Activités Récentes</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Nouvelles candidatures</span>
                  <span className="font-medium">{stats.pendingApplications}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Maintenance urgente</span>
                  <span className="font-medium text-red-600">{stats.urgentMaintenance}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Échéances 30j</span>
                  <span className="font-medium">{stats.upcomingPayments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tableau des Propriétés Actives */}
        <div className="bg-background-page rounded-lg border border-neutral-100 mb-8">
          <div className="p-6 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 flex items-center space-x-3">
                <Home className="h-7 w-7 text-primary-500" />
                <span>Propriétés Actives</span>
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-neutral-600">
                  {properties.length} propriété{properties.length > 1 ? 's' : ''}
                </span>
                <select className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option value="all">Tous les statuts</option>
                  <option value="disponible">Disponible</option>
                  <option value="loue">Loué</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-neutral-900">Propriété</th>
                  <th className="text-left p-4 font-semibold text-neutral-900">Statut</th>
                  <th className="text-left p-4 font-semibold text-neutral-900">Loyer</th>
                  <th className="text-left p-4 font-semibold text-neutral-900">Vues</th>
                  <th className="text-left p-4 font-semibold text-neutral-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProperties.map((property, index) => (
                  <tr key={property.id} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-neutral-900">{property.title}</p>
                        <p className="text-sm text-neutral-600">{property.city}{property.neighborhood && ` • ${property.neighborhood}`}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        property.status === 'disponible' 
                          ? 'bg-green-100 text-green-800'
                          : property.status === 'loue'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.status === 'disponible' ? 'Disponible' : 
                         property.status === 'loue' ? 'Loué' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-neutral-900">
                        {property.monthly_rent.toLocaleString('fr-FR')} FCFA
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-neutral-500" />
                        <span className="text-sm text-neutral-600">{property.view_count}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <a
                          href={`/dashboard/propriete/${property.id}/modifier`}
                          className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </a>
                        <a
                          href={`/propriete/${property.id}`}
                          className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handlePropertyAction(property.id, property.status === 'disponible' ? 'inactive' : 'active')}
                          className={`p-2 rounded-lg transition-colors ${
                            property.status === 'disponible'
                              ? 'text-neutral-600 hover:text-red-600 hover:bg-red-50'
                              : 'text-neutral-600 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={property.status === 'disponible' ? 'Désactiver' : 'Activer'}
                        >
                          {property.status === 'disponible' ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPropertiesPages > 1 && (
            <div className="p-6 border-t border-neutral-100 flex items-center justify-between">
              <p className="text-sm text-neutral-600">
                Affichage de {(propertiesPage - 1) * propertiesPerPage + 1} à {Math.min(propertiesPage * propertiesPerPage, properties.length)} sur {properties.length} propriétés
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPropertiesPage(Math.max(1, propertiesPage - 1))}
                  disabled={propertiesPage === 1}
                  className="p-2 rounded-lg border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-2 text-sm font-medium">
                  {propertiesPage} / {totalPropertiesPages}
                </span>
                <button
                  onClick={() => setPropertiesPage(Math.min(totalPropertiesPages, propertiesPage + 1))}
                  disabled={propertiesPage === totalPropertiesPages}
                  className="p-2 rounded-lg border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section Contrats Actifs et Maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Contrats Actifs */}
          <div className="bg-background-page rounded-lg border border-neutral-100">
            <div className="p-6 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-900 flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-primary-500" />
                  <span>Contrats Actifs</span>
                </h2>
                <a 
                  href="/dashboard/proprietaire/contrats"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Voir tout
                </a>
              </div>
            </div>
            <div className="p-6">
              {leases.length > 0 ? (
                <div className="space-y-4">
                  {leases.slice(0, 4).map((lease) => {
                    const daysRemaining = getDaysRemaining(lease.end_date);
                    const isExpiring = daysRemaining <= 30;
                    
                    return (
                      <div key={lease.id} className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                        isExpiring ? 'border-yellow-200 bg-yellow-50' : 'border-neutral-200 bg-neutral-50'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-neutral-900 mb-1">
                              {(lease.property as any)?.title}
                            </p>
                            <p className="text-sm text-neutral-600 mb-2">
                              Locataire: {(lease.tenant as any)?.full_name}
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-neutral-600">
                                Loyer: <span className="font-semibold">{(lease.property as any)?.monthly_rent?.toLocaleString('fr-FR')} FCFA</span>
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              isExpiring ? 'text-yellow-700' : 'text-neutral-700'
                            }`}>
                              {isExpiring ? 'Expire bientôt' : 'Actif'}
                            </p>
                            <p className="text-xs text-neutral-600 mt-1">
                              {daysRemaining > 0 ? `${daysRemaining} jours` : 'Expiré'}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {formatDate(lease.end_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-600">Aucun contrat actif</p>
                </div>
              )}
            </div>
          </div>

          {/* Demandes de Maintenance */}
          <div className="bg-background-page rounded-lg border border-neutral-100">
            <div className="p-6 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-900 flex items-center space-x-3">
                  <Wrench className="h-6 w-6 text-primary-500" />
                  <span>Maintenance</span>
                  {stats.urgentMaintenance > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                      {stats.urgentMaintenance} urgent{stats.urgentMaintenance > 1 ? 's' : ''}
                    </span>
                  )}
                </h2>
                <a 
                  href="/maintenance/proprietaire"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Gérer
                </a>
              </div>
            </div>
            <div className="p-6">
              {maintenanceRequests.length > 0 ? (
                <div className="space-y-4">
                  {maintenanceRequests.slice(0, 4).map((request) => (
                    <div key={request.id} className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                      request.urgency === 'urgent' ? 'border-red-200 bg-red-50' : 'border-neutral-200 bg-neutral-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="font-semibold text-neutral-900">
                              {(request.property as any)?.title}
                            </p>
                            {request.urgency === 'urgent' && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 mb-2">
                            {request.description}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Par: {(request.tenant as any)?.full_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'resolue' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {request.status === 'en_attente' ? 'En attente' :
                             request.status === 'en_cours' ? 'En cours' :
                             request.status === 'resolue' ? 'Résolue' : request.status}
                          </span>
                          <p className="text-xs text-neutral-500 mt-1">
                            {formatDate(request.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-600">Aucune demande de maintenance</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions Rapides et Candidatures */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Actions Rapides - Pleine largeur sur mobile, 2/3 sur desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* Actions Rapides */}
            <div className="bg-background-page rounded-lg border border-neutral-100 p-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Actions Rapides</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a
                  href="/dashboard/ajouter-propriete"
                  className="flex flex-col items-center p-4 border-2 border-dashed border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group"
                >
                  <Plus className="h-8 w-8 text-neutral-400 group-hover:text-primary-500 mb-2" />
                  <span className="text-sm font-medium text-neutral-600 group-hover:text-primary-700">Ajouter propriété</span>
                </a>
                
                <a
                  href="/maintenance/proprietaire"
                  className="flex flex-col items-center p-4 border border-neutral-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <Wrench className="h-8 w-8 text-neutral-400 group-hover:text-blue-500 mb-2" />
                  <span className="text-sm font-medium text-neutral-600 group-hover:text-blue-700">Maintenance</span>
                  {stats.urgentMaintenance > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full mt-1">
                      {stats.urgentMaintenance}
                    </span>
                  )}
                </a>
                
                <a
                  href="/dashboard/proprietaire/contrats"
                  className="flex flex-col items-center p-4 border border-neutral-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
                >
                  <FileText className="h-8 w-8 text-neutral-400 group-hover:text-green-500 mb-2" />
                  <span className="text-sm font-medium text-neutral-600 group-hover:text-green-700">Contrats</span>
                </a>
                
                <a
                  href="/dashboard/proprietaire/analytics"
                  className="flex flex-col items-center p-4 border border-neutral-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                >
                  <BarChart3 className="h-8 w-8 text-neutral-400 group-hover:text-purple-500 mb-2" />
                  <span className="text-sm font-medium text-neutral-600 group-hover:text-purple-700">Analytics</span>
                </a>
              </div>
            </div>

            {/* Candidatures Récentes */}
            <div className="bg-background-page rounded-lg border border-neutral-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900 flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-primary-500" />
                  <span>Candidatures Récentes</span>
                </h3>
                <span className="bg-primary-100 text-primary-700 text-sm font-medium px-3 py-1 rounded-full">
                  {stats.pendingApplications} en attente
                </span>
              </div>

              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((application) => {
                    const property = properties.find(p => p.id === application.property_id);
                    const scoreBadge = ScoringService.getScoreBadge(application.application_score);
                    
                    return (
                      <div key={application.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-neutral-900">
                              {property?.title || 'Propriété inconnue'}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${scoreBadge.color}`}>
                              Score: {application.application_score}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600">
                            Candidature du {formatDate(application.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            application.status === 'en_attente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : application.status === 'acceptee'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {application.status === 'en_attente' ? 'En attente' :
                             application.status === 'acceptee' ? 'Acceptée' : application.status}
                          </span>
                          <a
                            href={`/dashboard/candidature/${application.id}`}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                          >
                            Voir
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-600">Aucune candidature récente</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Statuts et Infos */}
          <div className="space-y-6">
            {/* Résumé Statuts */}
            <div className="bg-background-page rounded-lg border border-neutral-100 p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Résumé Global</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Taux d'occupation</span>
                  <span className="font-semibold text-neutral-900">{stats.occupancyRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Revenus mensuels</span>
                  <span className="font-semibold text-neutral-900">
                    {currentMonthRevenue.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Croissance</span>
                  <span className={`font-semibold ${stats.monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Maintenance urgente</span>
                  <span className={`font-semibold ${stats.urgentMaintenance > 0 ? 'text-red-600' : 'text-neutral-900'}`}>
                    {stats.urgentMaintenance}
                  </span>
                </div>
              </div>
            </div>

            {/* Conseil du Jour */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200 p-6">
              <h3 className="font-bold text-primary-900 mb-3 text-lg flex items-center space-x-2">
                <span>💡</span>
                <span>Conseil du jour</span>
              </h3>
              <p className="text-sm text-primary-800 leading-relaxed">
                Maintenez vos propriétés en excellent état pour attirer des locataires de qualité. 
                Les propriétés bien entretenues se louent 15% plus rapidement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
