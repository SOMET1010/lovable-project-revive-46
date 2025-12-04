import { useState, useEffect } from 'react';
import { Building2, Coins, Users, Wrench, Plus, FileText, TrendingUp, AlertCircle, Calendar, Eye } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import type { Database } from '@/shared/lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];
type Lease = Database['public']['Tables']['leases']['Row'];

interface DashboardStats {
  totalProperties: number;
  activeLeases: number;
  monthlyRevenue: number;
  pendingMaintenance: number;
  pendingApplications: number;
  occupancyRate: number;
}

interface PropertyWithLease extends Property {
  leases?: Lease[];
}

export default function OwnerDashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeLeases: 0,
    monthlyRevenue: 0,
    pendingMaintenance: 0,
    pendingApplications: 0,
    occupancyRate: 0,
  });
  const [properties, setProperties] = useState<PropertyWithLease[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      window.location.href = '/connexion';
      return;
    }

    if (profile && profile.user_type !== 'proprietaire') {
      window.location.href = '/';
      return;
    }

    loadDashboardData();
  }, [user, profile]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch properties
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*, leases(*)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      const ownerProperties = propertiesData || [];
      setProperties(ownerProperties);

      // Calculate stats
      const activeLeases = ownerProperties.reduce((count: number, prop: PropertyWithLease) => {
        const active = (prop.leases || []).filter((l: Lease) => l.status === 'actif');
        return count + active.length;
      }, 0);

      const monthlyRevenue = ownerProperties.reduce((total: number, prop: PropertyWithLease) => {
        const active = (prop.leases || []).filter((l: Lease) => l.status === 'actif');
        return total + (active.length > 0 ? (prop.monthly_rent || 0) : 0);
      }, 0);

      const occupancyRate = ownerProperties.length > 0
        ? Math.round((activeLeases / ownerProperties.length) * 100)
        : 0;

      // Fetch maintenance requests
      const propertyIds = ownerProperties.map((p: PropertyWithLease) => p.id);
      if (propertyIds.length > 0) {
        const { data: maintenanceData } = await supabase
          .from('maintenance_requests')
          .select('*, properties(title)')
          .in('property_id', propertyIds)
          .in('status', ['en_attente', 'en_cours'])
          .order('created_at', { ascending: false })
          .limit(5);

        setMaintenanceRequests(maintenanceData || []);

        // Fetch applications
        const { data: applicationsData } = await supabase
          .from('applications')
          .select('*, properties(title), profiles(full_name)')
          .in('property_id', propertyIds)
          .eq('status', 'en_attente')
          .order('created_at', { ascending: false })
          .limit(5);

        setPendingApplications(applicationsData || []);

        // Fetch recent payments
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('*, properties(title)')
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentPayments(paymentsData || []);

        // Count pending items
        const { count: maintenanceCount } = await supabase
          .from('maintenance_requests')
          .select('id', { count: 'exact', head: true })
          .in('property_id', propertyIds)
          .in('status', ['en_attente', 'en_cours']);

        const { count: applicationsCount } = await supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .in('property_id', propertyIds)
          .eq('status', 'en_attente');

        setStats({
          totalProperties: ownerProperties.length,
          activeLeases,
          monthlyRevenue,
          pendingMaintenance: maintenanceCount || 0,
          pendingApplications: applicationsCount || 0,
          occupancyRate,
        });
      } else {
        setStats({
          totalProperties: 0,
          activeLeases: 0,
          monthlyRevenue: 0,
          pendingMaintenance: 0,
          pendingApplications: 0,
          occupancyRate: 0,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary-500" />
                <span>Tableau de Bord Propriétaire</span>
              </h1>
              <p className="text-neutral-600 mt-2 text-lg">Bienvenue, {profile?.full_name || 'Propriétaire'}</p>
            </div>
            <a
              href="/dashboard/ajouter-propriete"
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors inline-flex items-center justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ajouter une propriété
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary-100 p-3 rounded-xl">
                <Building2 className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900">{stats.totalProperties}</p>
            <p className="text-sm text-neutral-500">Propriétés</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900">{stats.activeLeases}</p>
            <p className="text-sm text-neutral-500">Locataires actifs</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-100 p-3 rounded-xl">
                <Coins className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900">{stats.monthlyRevenue.toLocaleString()}</p>
            <p className="text-sm text-neutral-500">FCFA / mois</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900">{stats.occupancyRate}%</p>
            <p className="text-sm text-neutral-500">Taux d'occupation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Properties List */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary-500" />
                  Mes Propriétés
                </h2>
                <a href="/agence/proprietes" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                  Voir tout →
                </a>
              </div>

              {properties.length > 0 ? (
                <div className="space-y-3">
                  {properties.slice(0, 5).map((property) => {
                    const activeLeaseCount = (property.leases || []).filter((l: Lease) => l.status === 'actif').length;
                    const isOccupied = activeLeaseCount > 0;

                    return (
                      <div key={property.id} className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-neutral-900">{property.title}</h3>
                            <p className="text-sm text-neutral-500">{property.city} • {property.neighborhood}</p>
                            <p className="text-primary-600 font-bold mt-1">
                              {property.monthly_rent?.toLocaleString()} FCFA/mois
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              isOccupied
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {isOccupied ? 'Louée' : 'Disponible'}
                            </span>
                            <a
                              href={`/propriete/${property.id}`}
                              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                              <Eye className="h-4 w-4 text-neutral-500" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Aucune propriété</h3>
                  <p className="text-neutral-600 mb-4">Ajoutez votre première propriété pour commencer</p>
                  <a
                    href="/dashboard/ajouter-propriete"
                    className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une propriété
                  </a>
                </div>
              )}
            </div>

            {/* Recent Payments */}
            {recentPayments.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <Coins className="h-6 w-6 text-primary-500" />
                    Paiements Récents
                  </h2>
                  <a href="/mes-paiements" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                    Voir tout →
                  </a>
                </div>
                <div className="space-y-3">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {payment.amount.toLocaleString()} FCFA
                        </p>
                        <p className="text-sm text-neutral-500">
                          {(payment.properties as any)?.title || 'Propriété'}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        payment.status === 'complete'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {payment.status === 'complete' ? 'Reçu' : 'En attente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Applications */}
            {pendingApplications.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary-500" />
                    Candidatures en Attente
                    <span className="bg-primary-100 text-primary-700 text-sm px-2 py-0.5 rounded-full">
                      {stats.pendingApplications}
                    </span>
                  </h2>
                </div>
                <div className="space-y-3">
                  {pendingApplications.map((application) => (
                    <div key={application.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-neutral-900">
                            {(application.profiles as any)?.full_name || 'Candidat'}
                          </p>
                          <p className="text-sm text-neutral-600">
                            Pour: {(application.properties as any)?.title}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            Reçue le {new Date(application.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <a
                          href={`/dashboard/candidature/${application.id}`}
                          className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors"
                        >
                          Examiner
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <a
                  href="/dashboard/ajouter-propriete"
                  className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors w-full flex items-center justify-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter une propriété
                </a>
                <a
                  href="/tous-les-contrats"
                  className="border border-neutral-200 hover:border-primary-200 text-neutral-700 font-medium py-3 px-4 rounded-xl transition-colors w-full flex items-center justify-center"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Voir mes contrats
                </a>
                <a
                  href="/maintenance/proprietaire"
                  className="border border-neutral-200 hover:border-primary-200 text-neutral-700 font-medium py-3 px-4 rounded-xl transition-colors w-full flex items-center justify-center"
                >
                  <Wrench className="h-5 w-5 mr-2" />
                  Demandes de maintenance
                </a>
                <a
                  href="/messages"
                  className="border border-neutral-200 hover:border-primary-200 text-neutral-700 font-medium py-3 px-4 rounded-xl transition-colors w-full flex items-center justify-center"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Messages
                </a>
              </div>
            </div>

            {/* Maintenance Alerts */}
            {maintenanceRequests.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Maintenance
                  <span className="bg-amber-100 text-amber-700 text-sm px-2 py-0.5 rounded-full">
                    {stats.pendingMaintenance}
                  </span>
                </h3>
                <div className="space-y-3">
                  {maintenanceRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="font-medium text-neutral-900 text-sm">{request.title || 'Demande de maintenance'}</p>
                      <p className="text-xs text-neutral-600">{(request.properties as any)?.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          request.priority === 'urgent'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {request.priority === 'urgent' ? 'Urgent' : 'Normal'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <a
                  href="/maintenance/proprietaire"
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium mt-4 block text-center"
                >
                  Voir toutes les demandes →
                </a>
              </div>
            )}

            {/* Calendar Preview */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-500" />
                Échéances
              </h3>
              <div className="text-center py-4 text-neutral-500 text-sm">
                <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-2" />
                <p>Aucune échéance à venir</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
