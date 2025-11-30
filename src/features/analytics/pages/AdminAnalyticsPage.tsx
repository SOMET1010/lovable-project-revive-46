/**
 * Page AdminAnalyticsPage
 * Dashboard d'analytics administrateur avec KPIs et visualisations
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { analyticsService } from '@/services/analyticsService';
import { exportToPDF, exportToExcel, formatCurrency, formatNumber } from '@/services/exportService';
import { MetricCard } from '../components/MetricCard';
import { TimeSeriesChart } from '../components/TimeSeriesChart';
import { BarChartComponent } from '../components/BarChartComponent';
import { FunnelChart } from '../components/FunnelChart';
import {
  Users,
  Building2,
  Eye,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  RefreshCw,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7days' | '30days' | '90days' | '180days'>('30days');
  const [refreshing, setRefreshing] = useState(false);

  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalProperties: 0,
    totalViews: 0,
    totalRevenue: 0,
    avgConversionRate: 0,
  });

  const [trends, setTrends] = useState<any>({});
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [topCities, setTopCities] = useState<any[]>([]);

  useEffect(() => {
    // Vérifier que l'utilisateur est admin
    if (!profile?.is_admin) {
      window.location.href = '/dashboard';
      return;
    }

    loadAnalytics();
  }, [period, profile]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const { startDate, endDate } = getPeriodDates();

      // Charger les métriques de plateforme
      const platformMetrics = await analyticsService.getPlatformMetrics(startDate, endDate);

      if (platformMetrics.length > 0) {
        const latest = platformMetrics[platformMetrics.length - 1];
        setMetrics({
          totalUsers: latest.totalUsers,
          newUsers: platformMetrics.reduce((sum, m) => sum + m.newUsers, 0),
          totalProperties: latest.totalProperties,
          totalViews: platformMetrics.reduce((sum, m) => sum + m.totalViews, 0),
          totalRevenue: latest.totalRevenue,
          avgConversionRate: latest.viewToApplicationRate,
        });

        // Préparer données séries temporelles
        const chartData = platformMetrics.map((m) => ({
          date: new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          'Nouveaux utilisateurs': m.newUsers,
          'Nouvelles propriétés': m.newProperties,
          Vues: m.totalViews,
        }));
        setTimeSeriesData(chartData);
      }

      // Charger le funnel de conversion
      const funnel = await analyticsService.getAggregatedFunnel(startDate, endDate);
      setFunnelData(funnel);

      // Charger analytics géographiques
      const geoData = await analyticsService.getTopDemandZones(10);
      const citiesData = geoData.map((g) => ({
        name: g.city,
        'Score demande': g.demandScore,
        'Nombre de propriétés': g.propertyCount,
        'Prix moyen': g.avgPrice,
      }));
      setTopCities(citiesData);

      // Charger tendances
      const userTrend = await analyticsService.getMetricTrend('platform_metrics', 'new_users', getDays());
      const viewTrend = await analyticsService.getMetricTrend('platform_metrics', 'total_views', getDays());
      setTrends({
        users: userTrend,
        views: viewTrend,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await analyticsService.calculateDailyMetrics();
      await loadAnalytics();
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportPDF = () => {
    const { startDate, endDate } = getPeriodDates();

    exportToPDF(
      {
        title: 'Rapport Analytics MONTOIT',
        subtitle: 'Vue d\'ensemble de la plateforme',
        period: { startDate, endDate },
        summary: [
          { label: 'Utilisateurs totaux', value: formatNumber(metrics.totalUsers) },
          { label: 'Nouveaux utilisateurs', value: formatNumber(metrics.newUsers) },
          { label: 'Propriétés totales', value: formatNumber(metrics.totalProperties) },
          { label: 'Vues totales', value: formatNumber(metrics.totalViews) },
          { label: 'Revenu total', value: formatCurrency(metrics.totalRevenue) },
          { label: 'Taux de conversion', value: `${metrics.avgConversionRate.toFixed(2)}%` },
        ],
        tables: [
          {
            title: 'Top 10 villes par demande',
            headers: ['Ville', 'Score demande', 'Propriétés', 'Prix moyen'],
            rows: topCities.map((city) => [
              city.name,
              city['Score demande'].toString(),
              city['Nombre de propriétés'].toString(),
              formatCurrency(city['Prix moyen']),
            ]),
          },
        ],
      },
      `montoit-analytics-${new Date().toISOString().split('T')[0]}.pdf`
    );
  };

  const handleExportExcel = () => {
    exportToExcel({
      filename: `montoit-analytics-${new Date().toISOString().split('T')[0]}.xlsx`,
      sheets: [
        {
          name: 'Métriques',
          headers: ['Métrique', 'Valeur'],
          data: [
            ['Utilisateurs totaux', metrics.totalUsers],
            ['Nouveaux utilisateurs', metrics.newUsers],
            ['Propriétés totales', metrics.totalProperties],
            ['Vues totales', metrics.totalViews],
            ['Revenu total', metrics.totalRevenue],
            ['Taux de conversion moyen', `${metrics.avgConversionRate.toFixed(2)}%`],
          ],
        },
        {
          name: 'Top Villes',
          headers: ['Ville', 'Score demande', 'Propriétés', 'Prix moyen'],
          data: topCities.map((city) => [
            city.name,
            city['Score demande'],
            city['Nombre de propriétés'],
            city['Prix moyen'],
          ]),
        },
        {
          name: 'Séries temporelles',
          headers: ['Date', 'Nouveaux utilisateurs', 'Nouvelles propriétés', 'Vues'],
          data: timeSeriesData.map((d) => [
            d.date,
            d['Nouveaux utilisateurs'],
            d['Nouvelles propriétés'],
            d.Vues,
          ]),
        },
      ],
    });
  };

  const getDays = (): number => {
    switch (period) {
      case '7days':
        return 7;
      case '30days':
        return 30;
      case '90days':
        return 90;
      case '180days':
        return 180;
      default:
        return 30;
    }
  };

  const getPeriodDates = () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - getDays() * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    return { startDate, endDate };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient">Analytics Administrateur</h1>
              <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme MONTOIT</p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Sélecteur de période */}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="7days">7 derniers jours</option>
                <option value="30days">30 derniers jours</option>
                <option value="90days">90 derniers jours</option>
                <option value="180days">6 derniers mois</option>
              </select>

              {/* Bouton Refresh */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>

              {/* Boutons Export */}
              <button
                onClick={handleExportPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>PDF</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Utilisateurs totaux"
            value={formatNumber(metrics.totalUsers)}
            subtitle={`+${formatNumber(metrics.newUsers)} ce mois`}
            trend={trends.users ? {
              value: trends.users.change_percent,
              direction: trends.users.trend,
            } : undefined}
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />

          <MetricCard
            title="Propriétés"
            value={formatNumber(metrics.totalProperties)}
            icon={Building2}
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
          />

          <MetricCard
            title="Vues totales"
            value={formatNumber(metrics.totalViews)}
            trend={trends.views ? {
              value: trends.views.change_percent,
              direction: trends.views.trend,
            } : undefined}
            icon={Eye}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
          />

          <MetricCard
            title="Taux de conversion"
            value={`${metrics.avgConversionRate.toFixed(2)}%`}
            subtitle="Vues → Candidatures"
            icon={TrendingUp}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
          />

          <MetricCard
            title="Revenu total"
            value={formatCurrency(metrics.totalRevenue)}
            subtitle="Baux actifs"
            icon={DollarSign}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
          />

          <MetricCard
            title="Prix moyen"
            value={formatCurrency(metrics.totalRevenue / (metrics.totalProperties || 1))}
            subtitle="Par propriété"
            icon={Calendar}
            iconColor="text-pink-600"
            iconBgColor="bg-pink-50"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Séries temporelles */}
          <TimeSeriesChart
            data={timeSeriesData}
            xKey="date"
            lines={[
              { key: 'Nouveaux utilisateurs', name: 'Utilisateurs', color: '#3b82f6' },
              { key: 'Nouvelles propriétés', name: 'Propriétés', color: '#10b981' },
            ]}
            height={350}
            title="Évolution utilisateurs et propriétés"
          />

          {/* Vues */}
          <TimeSeriesChart
            data={timeSeriesData}
            xKey="date"
            lines={[{ key: 'Vues', name: 'Vues totales', color: '#8b5cf6' }]}
            height={350}
            title="Évolution des vues"
          />
        </div>

        {/* Funnel et Top Cities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Funnel de conversion */}
          {funnelData && (
            <FunnelChart
              title="Funnel de conversion utilisateur"
              steps={[
                {
                  name: 'Visiteurs',
                  value: funnelData.step1Visitors,
                  color: '#3b82f6',
                },
                {
                  name: 'Recherches',
                  value: funnelData.step2Searches,
                  rate: funnelData.visitorToSearchRate,
                  color: '#10b981',
                },
                {
                  name: 'Vues propriétés',
                  value: funnelData.step3Views,
                  rate: funnelData.searchToViewRate,
                  color: '#f59e0b',
                },
                {
                  name: 'Favoris',
                  value: funnelData.step4Favorites,
                  rate: funnelData.viewToFavoriteRate,
                  color: '#ef4444',
                },
                {
                  name: 'Candidatures',
                  value: funnelData.step5Applications,
                  rate: funnelData.favoriteToApplicationRate,
                  color: '#8b5cf6',
                },
                {
                  name: 'Visites',
                  value: funnelData.step6Visits,
                  rate: funnelData.applicationToVisitRate,
                  color: '#ec4899',
                },
                {
                  name: 'Baux signés',
                  value: funnelData.step7Leases,
                  rate: funnelData.visitToLeaseRate,
                  color: '#14b8a6',
                },
              ]}
            />
          )}

          {/* Top villes */}
          <BarChartComponent
            data={topCities}
            xKey="name"
            bars={[
              { key: 'Score demande', name: 'Demande', color: '#FF6C2F' },
            ]}
            height={400}
            title="Top 10 villes par demande"
            layout="vertical"
          />
        </div>
      </div>
    </div>
  );
}
