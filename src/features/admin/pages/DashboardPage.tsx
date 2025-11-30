import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/services/supabase/client';
import {
  Users, Home, FileText, CreditCard, AlertTriangle, CheckCircle,
  TrendingUp, Activity, Shield, Settings, Key, BarChart3,
  ArrowUpRight, ArrowDownRight, Eye, Clock, Globe, Smartphone,
  AlertCircle, Info, Zap, DollarSign, UserPlus, Building,
  Calendar, MessageSquare, RefreshCw, Download
} from 'lucide-react';
import { FormatService } from '@/services/format/formatService';

interface PlatformStats {
  total_users: number;
  total_properties: number;
  total_leases: number;
  active_leases: number;
  total_payments: number;
  total_visits: number;
  pending_verifications: number;
  pending_maintenance: number;
  total_revenue: number;
  monthly_growth: number;
  error_rate: number;
  uptime: number;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  isFormatted?: boolean;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface RecentActivity {
  id: string;
  action: string;
  entity_type: string;
  user: string;
  created_at: string;
  details: any;
}

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        window.location.href = '/';
        return;
      }

      setIsAdmin(true);
      loadDashboardData();
    } catch (err) {
      console.error('Error checking admin access:', err);
      window.location.href = '/';
    }
  };

  const loadDashboardData = async () => {
    try {
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_platform_stats');

      if (statsError) throw statsError;

      setStats(statsData);

      const { data: activitiesData } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setActivities(activitiesData || []);

      // Simulate system alerts
      setAlerts([
        {
          id: '1',
          type: 'warning',
          title: 'Pic de charge détecté',
          message: 'Temps de réponse moyen > 2s sur les 15 dernières minutes',
          timestamp: new Date().toISOString(),
          resolved: false
        },
        {
          id: '2',
          type: 'error',
          title: 'Échec de paiement Stripe',
          message: '3 échecs de paiement dans les 10 dernières minutes',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: '3',
          type: 'info',
          title: 'Nouvelle version déployée',
          message: 'Version 2.1.3 déployée avec succès',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          resolved: true
        }
      ]);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  // Metric Cards Data
  const metricCards: MetricCard[] = [
    {
      title: 'Utilisateurs Actifs',
      value: stats?.total_users || 0,
      change: 12.5,
      changeType: 'increase',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Propriétés Totales',
      value: stats?.total_properties || 0,
      change: 8.3,
      changeType: 'increase',
      icon: Home,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Transactions (30j)',
      value: stats?.total_leases || 0,
      change: -2.1,
      changeType: 'decrease',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Revenus Mensuels',
      value: FormatService.formatCurrency(stats?.total_revenue || 0),
      change: 15.7,
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      isFormatted: true
    },
    {
      title: 'Erreurs Système',
      value: Math.floor((stats?.error_rate || 0) * 100) / 100,
      change: -45.2,
      changeType: 'decrease',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Uptime Platform',
      value: `${(stats?.uptime || 99.9).toFixed(1)}%`,
      change: 0.1,
      changeType: 'increase',
      icon: Activity,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      title: 'Vérifications En Attente',
      value: stats?.pending_verifications || 0,
      change: 5.8,
      changeType: 'increase',
      icon: CheckCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Nouveaux Comptes (24h)',
      value: 47,
      change: 23.1,
      changeType: 'increase',
      icon: UserPlus,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrateur</h1>
          <p className="text-sm text-gray-600 mt-1">
            Vue d'ensemble en temps réel de votre plateforme immobilière
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="1h">Dernière heure</option>
            <option value="24h">24 heures</option>
            <option value="7d">7 jours</option>
            <option value="30d">30 jours</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Stats Grid Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          const isPositive = card.changeType === 'increase';
          const isNegative = card.changeType === 'decrease';
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : isNegative ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : null}
                  <span>{Math.abs(card.change)}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.isFormatted ? card.value : typeof card.value === 'number' ? card.value.toLocaleString('fr-FR') : card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Monitoring Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Performance Système</h2>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">CPU</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Mémoire</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">Réseau</span>
                </div>
              </div>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Graphique de performance en temps réel</p>
                <p className="text-sm text-gray-400">CPU: 23% | Mémoire: 67% | Réseau: 145 Mbps</p>
              </div>
            </div>
          </div>

          {/* API Response Times */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Temps de Réponse API</h2>
            <div className="space-y-4">
              {[
                { name: '/api/auth/login', avgTime: '245ms', status: 'good' },
                { name: '/api/properties/search', avgTime: '1.2s', status: 'warning' },
                { name: '/api/payments/process', avgTime: '567ms', status: 'good' },
                { name: '/api/notifications/send', avgTime: '2.1s', status: 'error' }
              ].map((api, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{api.name}</p>
                    <p className="text-sm text-gray-600">Moyenne sur 24h</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      api.status === 'good' ? 'bg-green-100 text-green-800' :
                      api.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {api.avgTime}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      api.status === 'good' ? 'bg-green-500' :
                      api.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Activity Feed */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Activité en Temps Réel</h2>
              <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                Voir tout
              </button>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {activities.length > 0 ? activities.map(activity => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.entity_type} • {activity.user}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {FormatService.formatRelativeTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Aucune activité récente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* System Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Alertes Système</h2>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {alerts.filter(a => !a.resolved).length} actifs
              </span>
            </div>
            <div className="space-y-4">
              {alerts.map(alert => {
                const AlertIcon = getAlertIcon(alert.type);
                return (
                  <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)} ${alert.resolved ? 'opacity-60' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <AlertIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-xs mt-1 opacity-80">{alert.message}</p>
                        <p className="text-xs mt-2 opacity-60">
                          {FormatService.formatRelativeTime(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Actions Rapides</h2>
            <div className="space-y-3">
              {[
                { name: 'Gérer Utilisateurs', icon: Users, href: '/admin/utilisateurs', color: 'bg-blue-50 text-blue-700' },
                { name: 'Voir Propriétés', icon: Home, href: '/admin/properties', color: 'bg-green-50 text-green-700' },
                { name: 'Monitoring API', icon: Activity, href: '/admin/service-monitoring', color: 'bg-red-50 text-red-700' },
                { name: 'Gestion CEV', icon: CheckCircle, href: '/admin/cev-management', color: 'bg-purple-50 text-purple-700' },
                { name: 'Config Services', icon: Settings, href: '/admin/service-configuration', color: 'bg-gray-50 text-gray-700' },
                { name: 'Générer Données', icon: Eye, href: '/admin/test-data-generator', color: 'bg-orange-50 text-orange-700' }
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => window.location.href = action.href}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${action.color} hover:opacity-80`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{action.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Santé Système</h2>
            <div className="space-y-4">
              {[
                { service: 'Base de données', status: 'healthy', uptime: '99.9%', response: '45ms' },
                { service: 'API Authentification', status: 'healthy', uptime: '99.8%', response: '120ms' },
                { service: 'Service Paiement', status: 'warning', uptime: '98.2%', response: '890ms' },
                { service: 'Notifications', status: 'healthy', uptime: '99.9%', response: '67ms' }
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      service.status === 'healthy' ? 'bg-green-500' :
                      service.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{service.service}</p>
                      <p className="text-xs text-gray-600">{service.uptime} uptime</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{service.response}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}