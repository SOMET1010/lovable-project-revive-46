/**
 * Dashboard Locataire - MONTOIT
 * Refonte complète selon Modern Minimalism
 */

import { useState, useEffect } from 'react';
import { 
  User, 
  Heart, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Star,
  MapPin,
  Clock,
  ChevronRight,
  TrendingUp,
  Bell,
  Eye
} from 'lucide-react';
import {
  getUserProfile,
  getDashboardStats,
  getFavorites,
  getNotifications,
  type UserProfile,
  type DashboardStats,
  type FavoriteProperty,
  type NotificationItem,
} from '@/services/userDashboardService';
import { supabase } from '@/services/supabase/client';

// Types pour les nouvelles fonctionnalités
interface Visit {
  id: string;
  property_id: string;
  visit_date: string;
  visit_time: string;
  status: 'en_attente' | 'confirmee' | 'annulee' | 'terminee';
  visit_type: 'physique' | 'virtuelle';
  property: {
    id: string;
    title: string;
    city: string;
    main_image: string | null;
  };
}

interface Application {
  id: string;
  property_id: string;
  status: 'en_attente' | 'acceptee' | 'refusee' | 'en_cours';
  created_at: string;
  property: {
    id: string;
    title: string;
    city: string;
    monthly_rent: number;
    main_image: string | null;
  };
}

interface Recommendation {
  id: string;
  title: string;
  city: string;
  neighborhood: string | null;
  property_type: string;
  monthly_rent: number;
  bedrooms: number;
  bathrooms: number;
  main_image: string | null;
  status: string;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [profileResult, statsResult, favoritesResult] = await Promise.all([
        getUserProfile(),
        getDashboardStats(),
        getFavorites(),
      ]);

      if (profileResult.error) {
        throw profileResult.error;
      }

      if (statsResult.error) {
        console.error('Erreur stats:', statsResult.error);
      }

      setProfile(profileResult.data || null);
      setStats(statsResult.data || null);
      setFavorites(favoritesResult.data || []);

      // Charger les données supplémentaires
      if (profileResult.data?.id) {
        await Promise.all([
          loadVisits(profileResult.data.id),
          loadApplications(profileResult.data.id),
          loadRecommendations(),
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadVisits = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('property_visits')
        .select(`
          id,
          property_id,
          visit_date,
          visit_time,
          status,
          visit_type,
          properties!inner(id, title, city, main_image)
        `)
        .eq('visitor_id', userId)
        .gte('visit_date', new Date().toISOString().split('T')[0])
        .in('status', ['en_attente', 'confirmee'])
        .order('visit_date', { ascending: true })
        .order('visit_time', { ascending: true })
        .limit(5);

      if (error) throw error;
      setVisits(data || []);
    } catch (error) {
      console.error('Erreur chargement visites:', error);
    }
  };

  const loadApplications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('rental_applications')
        .select(`
          id,
          property_id,
          status,
          created_at,
          properties!inner(id, title, city, monthly_rent, main_image)
        `)
        .eq('applicant_id', userId)
        .in('status', ['en_attente', 'en_cours'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Erreur chargement candidatures:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'disponible')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Erreur chargement recommandations:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      en_attente: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'En attente' },
      confirmee: { bg: 'bg-green-50', text: 'text-green-700', label: 'Confirmée' },
      annulee: { bg: 'bg-red-50', text: 'text-red-700', label: 'Annulée' },
      terminee: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Terminée' },
      en_cours: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'En cours' },
      acceptee: { bg: 'bg-green-50', text: 'text-green-700', label: 'Acceptée' },
      refusee: { bg: 'bg-red-50', text: 'text-red-700', label: 'Refusée' },
    };
    
    const badge = badges[status as keyof typeof badges] || badges.en_attente;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-500">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-card max-w-md">
          <div className="text-red-500 text-center mb-4">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Erreur</h3>
            <p className="text-neutral-600">{error}</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="w-full bg-primary-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Dashboard Header avec Greeting + Avatar */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
                {getGreeting()}{profile?.full_name ? `, ${profile.full_name}` : ''}
              </h1>
              <p className="text-lg text-neutral-600">
                Voici un aperçu de votre activité immobilière
              </p>
            </div>
            
            {profile && (
              <div className="flex items-center gap-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Avatar'}
                    className="h-16 w-16 rounded-full object-cover border-2 border-primary-100"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary-500" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid - 4 Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Visites</p>
                <p className="text-2xl font-bold text-neutral-900">{visits.length}</p>
                <p className="text-xs text-neutral-500 mt-1">À venir</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Candidatures</p>
                <p className="text-2xl font-bold text-neutral-900">{applications.length}</p>
                <p className="text-xs text-neutral-500 mt-1">En cours</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <FileText className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Favoris</p>
                <p className="text-2xl font-bold text-neutral-900">{favorites.length}</p>
                <p className="text-xs text-neutral-500 mt-1">Propriétés</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <Heart className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Messages</p>
                <p className="text-2xl font-bold text-neutral-900">{stats?.unreadNotifications || 0}</p>
                <p className="text-xs text-neutral-500 mt-1">Non lus</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <MessageSquare className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Prochaines Visites - Timeline Cards */}
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Prochaines visites</h2>
              <button className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center gap-1">
                Voir tout <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {visits.length > 0 ? visits.map((visit) => (
                <div key={visit.id} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                  <div className="flex-shrink-0">
                    <img
                      src={visit.property.main_image || 'https://via.placeholder.com/80x80'}
                      alt={visit.property.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 truncate">{visit.property.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(visit.visit_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(visit.visit_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(visit.status)}
                      <span className="text-xs text-neutral-500">
                        {visit.visit_type === 'physique' ? 'Physique' : 'Virtuelle'}
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500">Aucune visite programmée</p>
                </div>
              )}
            </div>
          </div>

          {/* Candidatures en Cours - Status Cards */}
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Candidatures</h2>
              <button className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center gap-1">
                Gérer <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {applications.length > 0 ? applications.map((application) => (
                <div key={application.id} className="border border-neutral-200 rounded-xl p-4 hover:border-primary-200 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-neutral-900 truncate">{application.property.title}</h3>
                    {getStatusBadge(application.status)}
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">{application.property.city}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">
                      {application.property.monthly_rent.toLocaleString()} FCFA
                    </span>
                    <button className="text-sm text-neutral-500 hover:text-primary-500 flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Voir détails
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500">Aucune candidature active</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Propriétés Favorites - Horizontal Scroll */}
        <div className="bg-white rounded-2xl p-6 shadow-card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900">Mes favoris</h2>
            <button className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center gap-1">
              Voir tout <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-4" style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
            {favorites.length > 0 ? favorites.slice(0, 6).map((favorite) => (
              <div key={favorite.id} className="flex-shrink-0 w-72 group cursor-pointer">
                <div className="relative mb-3">
                  <img
                    src={favorite.property?.main_image || 'https://via.placeholder.com/300x200'}
                    alt={favorite.property?.title || ''}
                    className="w-full h-48 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </button>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-1">{favorite.property?.title}</h3>
                <p className="text-sm text-neutral-600 mb-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {favorite.property?.city}
                </p>
                <p className="text-lg font-bold text-primary-600">
                  {favorite.property?.monthly_rent?.toLocaleString()} FCFA/mois
                </p>
              </div>
            )) : (
              <div className="flex-1 text-center py-8">
                <Heart className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">Aucun favori pour le moment</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommandations - Property Grid */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary-500" />
              <h2 className="text-xl font-bold text-neutral-900">Propriétés recommandées</h2>
            </div>
            <button className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center gap-1">
              Explorer <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.slice(0, 8).map((property) => (
              <div key={property.id} className="group cursor-pointer">
                <div className="relative mb-3">
                  <img
                    src={property.main_image || 'https://via.placeholder.com/300x200'}
                    alt={property.title}
                    className="w-full h-48 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                    <Heart className="h-4 w-4 text-neutral-400 hover:text-red-500 transition-colors" />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                      Disponible
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                  {property.title}
                </h3>
                <p className="text-sm text-neutral-600 mb-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {property.city}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-neutral-600">{property.bedrooms} chambres</span>
                  <span className="text-sm text-neutral-600">{property.bathrooms} SDB</span>
                </div>
                <p className="text-lg font-bold text-primary-600">
                  {property.monthly_rent.toLocaleString()} FCFA/mois
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
