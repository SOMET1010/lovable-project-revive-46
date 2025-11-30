/**
 * Page OwnerAnalyticsPage
 * Dashboard d'analytics pour propriétaires
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { analyticsService } from '@/services/analyticsService';
import { exportToPDF, formatCurrency, formatNumber } from '@/services/exportService';
import { MetricCard } from '../components/MetricCard';
import { TimeSeriesChart } from '../components/TimeSeriesChart';
import { ArrowLeft, Download, Eye, Heart, Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OwnerAnalyticsPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'30days' | '90days' | '180days'>('30days');

  const [stats, setStats] = useState({
    totalViews: 0,
    totalApplications: 0,
    totalFavorites: 0,
    avgConversionRate: 0,
    properties: 0,
  });

  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [propertiesData, setPropertiesData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      window.location.href = '/connexion';
      return;
    }

    loadAnalytics();
  }, [period, user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const { startDate, endDate } = getPeriodDates();

      // Charger les stats du propriétaire
      const ownerStats = await analyticsService.getOwnerPropertiesStats(
        user!.id,
        startDate,
        endDate
      );

      setStats(ownerStats);

      // Charger les propriétés
      const { data: properties } = await import('@/services/supabase/client').then((m) =>
        m.supabase.from('properties').select('id, title').eq('owner_id', user!.id)
      );

      if (properties) {
        // Charger stats pour chaque propriété
        const propertyStatsPromises = properties.map(async (prop: any) => {
          const propStats = await analyticsService.getPropertyStats(
            prop.id,
            startDate,
            endDate
          );

          const totalViews = propStats.reduce((sum, s) => sum + s.totalViews, 0);
          const totalApps = propStats.reduce((sum, s) => sum + s.applications, 0);

          return {
            id: prop.id,
            title: prop.title,
            views: totalViews,
            applications: totalApps,
            conversionRate: totalViews > 0 ? (totalApps / totalViews) * 100 : 0,
          };
        });

        const propsData = await Promise.all(propertyStatsPromises);
        setPropertiesData(
          propsData.sort((a, b) => b.views - a.views).map((p) => ({
            name: p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title,
            Vues: p.views,
            Candidatures: p.applications,
          }))
        );

        // Préparer données séries temporelles (agrégées)
        if (properties.length > 0) {
          const allStats = await Promise.all(
            properties.map((p: any) =>
              analyticsService.getPropertyStats(p.id, startDate, endDate)
            )
          );

          // Agréger par date
          const dateMap: any = {};
          allStats.flat().forEach((stat) => {
            if (!dateMap[stat.date]) {
              dateMap[stat.date] = { views: 0, applications: 0, favorites: 0 };
            }
            dateMap[stat.date].views += stat.totalViews;
            dateMap[stat.date].applications += stat.applications;
            dateMap[stat.date].favorites += stat.favoritesAdded;
          });

          const chartData = Object.keys(dateMap)
            .sort()
            .map((date) => ({
              date: new Date(date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              }),
              Vues: dateMap[date].views,
              Candidatures: dateMap[date].applications,
              Favoris: dateMap[date].favorites,
            }));

          setTimeSeriesData(chartData);
        }
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const { startDate, endDate } = getPeriodDates();

    exportToPDF(
      {
        title: 'Rapport Analytics Propriétaire',
        subtitle: profile?.full_name || '',
        period: { startDate, endDate },
        summary: [
          { label: 'Nombre de propriétés', value: formatNumber(stats.properties) },
          { label: 'Vues totales', value: formatNumber(stats.totalViews) },
          { label: 'Candidatures', value: formatNumber(stats.totalApplications) },
          { label: 'Favoris', value: formatNumber(stats.totalFavorites) },
          { label: 'Taux de conversion', value: `${stats.avgConversionRate}%` },
        ],
        tables: [
          {
            title: 'Performance par propriété',
            headers: ['Propriété', 'Vues', 'Candidatures'],
            rows: propertiesData.map((p) => [p.name, p.Vues.toString(), p.Candidatures.toString()]),
          },
        ],
      },
      `analytics-proprietaire-${new Date().toISOString().split('T')[0]}.pdf`
    );
  };

  const getDays = (): number => {
    switch (period) {
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
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard/proprietaire"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Retour</span>
              </Link>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Mes Analytics</h1>
                <p className="text-gray-600 text-sm mt-1">Performance de vos propriétés</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="30days">30 derniers jours</option>
                <option value="90days">90 derniers jours</option>
                <option value="180days">6 derniers mois</option>
              </select>

              <button
                onClick={handleExportPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Exporter PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Propriétés"
            value={formatNumber(stats.properties)}
            icon={FileText}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />

          <MetricCard
            title="Vues totales"
            value={formatNumber(stats.totalViews)}
            subtitle="Toutes propriétés"
            icon={Eye}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
          />

          <MetricCard
            title="Candidatures"
            value={formatNumber(stats.totalApplications)}
            icon={Calendar}
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
          />

          <MetricCard
            title="Taux de conversion"
            value={`${stats.avgConversionRate}%`}
            subtitle="Vues → Candidatures"
            icon={Heart}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
          />
        </div>

        {/* Charts */}
        <div className="space-y-8">
          {timeSeriesData.length > 0 && (
            <TimeSeriesChart
              data={timeSeriesData}
              xKey="date"
              lines={[
                { key: 'Vues', name: 'Vues', color: '#8b5cf6' },
                { key: 'Candidatures', name: 'Candidatures', color: '#10b981' },
                { key: 'Favoris', name: 'Favoris', color: '#f59e0b' },
              ]}
              height={350}
              title="Évolution de la performance"
            />
          )}

          {propertiesData.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Performance par propriété
              </h3>
              <div className="space-y-3">
                {propertiesData.map((prop, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{prop.name}</span>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">{formatNumber(prop.Vues)} vues</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          {formatNumber(prop.Candidatures)} candidatures
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
