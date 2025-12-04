import { useState, useEffect } from 'react';
import { Home, Coins, MessageSquare, Clock, Heart, Search, CheckCircle, FileText, Wrench, Award } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';

interface LeaseContract {
  id: string;
  property_id: string;
  tenant_id: string;
  owner_id: string;
  contract_number: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount: number;
  status: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function TenantDashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeLease, setActiveLease] = useState<(LeaseContract & { property?: any }) | null>(null);
  const [nextPayment, setNextPayment] = useState<{
    amount: number;
    dueDate: string;
    daysRemaining: number;
  } | null>(null);
  const [stats, setStats] = useState({
    unreadMessages: 0,
    maintenanceRequests: 0,
    paymentStatus: 'up_to_date' as 'up_to_date' | 'late',
  });
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [recentFavorites, setRecentFavorites] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      window.location.href = '/connexion';
      return;
    }

    if (profile && profile.user_type !== 'locataire') {
      window.location.href = '/';
      return;
    }

    loadDashboardData();
  }, [user, profile]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load active lease contract
      const { data: leaseData } = await supabase
        .from('lease_contracts')
        .select('*')
        .eq('tenant_id', user.id)
        .eq('status', 'actif')
        .maybeSingle();

      if (leaseData) {
        const lease = leaseData as unknown as LeaseContract;
        
        // Load property data
        const { data: propertyData } = await supabase
          .from('properties')
          .select('*')
          .eq('id', lease.property_id)
          .single();

        setActiveLease({ ...lease, property: propertyData });

        const today = new Date();
        const nextPaymentDate = new Date(lease.start_date);

        while (nextPaymentDate < today) {
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }

        const daysRemaining = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        setNextPayment({
          amount: lease.monthly_rent,
          dueDate: nextPaymentDate.toISOString(),
          daysRemaining,
        });

        // Load payments
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('*')
          .eq('payer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentPayments((paymentsData || []) as unknown as Payment[]);

        const lastPayment = (paymentsData as unknown as Payment[] | null)?.[0];
        const isLate = lastPayment && lastPayment.created_at && new Date(lastPayment.created_at) < new Date(nextPaymentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        setStats(prev => ({
          ...prev,
          paymentStatus: isLate ? 'late' : 'up_to_date',
        }));
      }

      // Load unread messages count
      const { data: messagesData } = await supabase
        .from('messages' as any)
        .select('id')
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      setStats(prev => ({ ...prev, unreadMessages: messagesData?.length || 0 }));

      // Load maintenance requests count
      const { data: maintenanceData } = await supabase
        .from('maintenance_requests' as any)
        .select('id')
        .eq('tenant_id', user.id)
        .in('status', ['ouverte', 'en_cours']);

      setStats(prev => ({ ...prev, maintenanceRequests: maintenanceData?.length || 0 }));

      // Load favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('*, properties(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setRecentFavorites(favoritesData || []);

      // Load saved searches
      const { data: searchesData } = await supabase
        .from('saved_searches' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setSavedSearches((searchesData || []) as any[]);

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
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 flex items-center gap-3">
            <Home className="h-8 w-8 text-primary-500" />
            <span>Mon Tableau de Bord</span>
          </h1>
          <p className="text-neutral-600 mt-2 text-lg">Bienvenue, {profile?.full_name || 'Locataire'}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Lease Card */}
            {activeLease ? (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <Home className="h-6 w-6 text-primary-500" />
                  <span>Mon Logement Actuel</span>
                </h2>
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    {activeLease.property?.title}
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {activeLease.property?.city} • {activeLease.property?.neighborhood}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-500">Loyer mensuel</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {activeLease.monthly_rent.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Durée du bail</p>
                      <p className="text-2xl font-bold text-neutral-900">
                        {Math.ceil((new Date(activeLease.end_date).getTime() - new Date(activeLease.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} mois
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a 
                      href={`/contrat/${activeLease.id}`} 
                      className="inline-flex items-center border border-neutral-200 hover:border-primary-200 text-neutral-700 font-medium py-2 px-4 rounded-xl transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Voir le bail
                    </a>
                    <a 
                      href={`/propriete/${activeLease.property_id}`} 
                      className="inline-flex items-center border border-neutral-200 hover:border-primary-200 text-neutral-700 font-medium py-2 px-4 rounded-xl transition-colors"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Détails du logement
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-card text-center">
                <div className="bg-primary-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Home className="h-12 w-12 text-primary-500" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">Aucun logement actif</h3>
                <p className="text-neutral-600 mb-6">
                  Vous n'avez pas encore de bail actif. Commencez votre recherche dès maintenant!
                </p>
                <a 
                  href="/recherche" 
                  className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors inline-flex items-center"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Rechercher un logement
                </a>
              </div>
            )}

            {/* Next Payment Card */}
            {nextPayment && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <Coins className="h-6 w-6 text-primary-500" />
                  <span>Prochain Paiement</span>
                </h2>
                <div className={`rounded-xl p-6 border ${
                  stats.paymentStatus === 'late'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Montant dû</p>
                      <p className="text-3xl font-bold text-primary-600">
                        {nextPayment.amount.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-600 mb-1">Date limite</p>
                      <p className="text-xl font-bold text-neutral-900">
                        {new Date(nextPayment.dueDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className={`h-5 w-5 ${stats.paymentStatus === 'late' ? 'text-red-600' : 'text-green-600'}`} />
                      <span className={`font-semibold ${stats.paymentStatus === 'late' ? 'text-red-700' : 'text-green-700'}`}>
                        {nextPayment.daysRemaining > 0
                          ? `${nextPayment.daysRemaining} jours restants`
                          : 'Paiement en retard'
                        }
                      </span>
                    </div>
                    <a 
                      href="/effectuer-paiement" 
                      className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
                    >
                      Payer maintenant
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Payment History */}
            {recentPayments.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-neutral-900">Historique des Paiements</h2>
                  <a href="/mes-paiements" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                    Voir tout →
                  </a>
                </div>
                <div className="space-y-3">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {payment.status === 'complete' ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <Clock className="h-6 w-6 text-amber-600" />
                        )}
                        <div>
                          <p className="font-semibold text-neutral-900">
                            {payment.amount.toLocaleString()} FCFA
                          </p>
                          <p className="text-xs text-neutral-500">
                            {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        payment.status === 'complete'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {payment.status === 'complete' ? 'Payé' : 'En attente'}
                      </span>
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
                {activeLease && (
                  <>
                    <a 
                      href="/effectuer-paiement" 
                      className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors w-full flex items-center justify-center"
                    >
                      <Coins className="h-5 w-5 mr-2" />
                      Payer mon loyer
                    </a>
                    <a 
                      href="/maintenance/nouvelle" 
                      className="border border-neutral-200 hover:border-primary-200 text-neutral-700 font-medium py-3 px-4 rounded-xl transition-colors w-full flex items-center justify-center"
                    >
                      <Wrench className="h-5 w-5 mr-2" />
                      Demander une réparation
                    </a>
                    <a 
                      href={`/contrat/${activeLease.id}`} 
                      className="border border-neutral-200 hover:border-primary-200 text-neutral-700 font-medium py-3 px-4 rounded-xl transition-colors w-full flex items-center justify-center"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Voir mon bail
                    </a>
                  </>
                )}
                <a 
                  href="/mon-score" 
                  className="border border-neutral-200 hover:border-primary-200 text-neutral-700 font-medium py-3 px-4 rounded-xl transition-colors w-full flex items-center justify-center"
                >
                  <Award className="h-5 w-5 mr-2" />
                  Mon Trust Score
                </a>
                <a 
                  href="/recherche" 
                  className="border border-neutral-200 hover:border-primary-200 text-neutral-700 font-medium py-3 px-4 rounded-xl transition-colors w-full flex items-center justify-center"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Rechercher un logement
                </a>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-700">Messages non lus</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.unreadMessages}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-700">Demandes en cours</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.maintenanceRequests}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Favorites Preview */}
            {recentFavorites.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-neutral-900">Mes Favoris</h3>
                  <a href="/favoris" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                    Voir tout →
                  </a>
                </div>
                <div className="space-y-3">
                  {recentFavorites.map((fav: any) => (
                    <a 
                      key={fav.id}
                      href={`/propriete/${fav.property_id}`}
                      className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">
                          {fav.properties?.title}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {fav.properties?.city}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Searches Preview */}
            {savedSearches.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-neutral-900">Recherches Sauvegardées</h3>
                  <a href="/recherches-sauvegardees" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                    Voir tout →
                  </a>
                </div>
                <div className="space-y-3">
                  {savedSearches.map((search: any) => (
                    <div 
                      key={search.id}
                      className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      <Search className="h-5 w-5 text-primary-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">
                          {search.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {search.notifications_enabled ? 'Alertes activées' : 'Pas d\'alertes'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
