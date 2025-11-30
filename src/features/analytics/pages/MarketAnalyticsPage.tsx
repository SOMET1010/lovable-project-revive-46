/**
 * Page MarketAnalyticsPage
 * Analytics de marché avec heatmap géographique
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { analyticsService } from '@/services/analyticsService';
import { formatCurrency, formatNumber } from '@/services/exportService';
import { GeographicHeatmap } from '../components/GeographicHeatmap';
import { BarChartComponent } from '../components/BarChartComponent';
import { ArrowLeft, MapPin, TrendingUp, DollarSign, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MarketAnalyticsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [geoData, setGeoData] = useState<any[]>([]);
  const [topZones, setTopZones] = useState<any[]>([]);
  const [period, setPeriod] = useState<'30days' | '90days'>('30days');

  useEffect(() => {
    // Vérifier que l'utilisateur est admin ou propriétaire
    if (!profile?.is_admin && profile?.active_role !== 'proprietaire') {
      window.location.href = '/dashboard';
      return;
    }

    loadMarketAnalytics();
  }, [period, profile]);

  const loadMarketAnalytics = async () => {
    try {
      setLoading(true);

      const { startDate, endDate } = getPeriodDates();

      // Charger analytics géographiques
      const geoAnalytics = await analyticsService.getGeographicAnalytics(startDate, endDate);

      // Agréger par ville
      const cityMap: any = {};
      geoAnalytics.forEach((geo) => {
        if (!cityMap[geo.city]) {
          cityMap[geo.city] = {
            city: geo.city,
            latitude: geo.latitude,
            longitude: geo.longitude,
            searchCount: 0,
            viewCount: 0,
            propertyCount: 0,
            avgPrice: 0,
            demandScore: 0,
            supplyScore: 0,
            competitionScore: 0,
            count: 0,
          };
        }

        const entry = cityMap[geo.city];
        entry.searchCount += geo.searchCount;
        entry.viewCount += geo.viewCount;
        entry.propertyCount += geo.propertyCount;
        entry.avgPrice += geo.avgPrice;
        entry.demandScore += geo.demandScore;
        entry.supplyScore += geo.supplyScore;
        entry.competitionScore += geo.competitionScore;
        entry.count += 1;
      });

      // Calculer moyennes
      const cities = Object.values(cityMap).map((city: any) => ({
        ...city,
        avgPrice: Math.round(city.avgPrice / city.count),
        demandScore: Math.round(city.demandScore / city.count),
        supplyScore: Math.round(city.supplyScore / city.count),
        competitionScore: Math.round(city.competitionScore / city.count),
      }));

      setGeoData(cities);

      // Top zones
      const top = cities
        .sort((a, b) => b.demandScore - a.demandScore)
        .slice(0, 10)
        .map((c) => ({
          name: c.city,
          'Score demande': c.demandScore,
          'Score offre': c.supplyScore,
          'Score competition': c.competitionScore,
        }));

      setTopZones(top);
    } catch (error) {
      console.error('Error loading market analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDays = (): number => {
    return period === '30days' ? 30 : 90;
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
                to={profile?.is_admin ? '/admin/analytics' : '/dashboard/proprietaire/analytics'}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Retour</span>
              </Link>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Analyse de Marché</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Tendances géographiques et zones de forte demande
                </p>
              </div>
            </div>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="30days">30 derniers jours</option>
              <option value="90days">90 derniers jours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Zones analysées</h3>
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{geoData.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Recherches totales</h3>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(geoData.reduce((sum, g) => sum + g.searchCount, 0))}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Prix moyen</h3>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                Math.round(
                  geoData.reduce((sum, g) => sum + g.avgPrice, 0) / (geoData.length || 1)
                )
              )}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Propriétés</h3>
              <Building2 className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(geoData.reduce((sum, g) => sum + g.propertyCount, 0))}
            </p>
          </div>
        </div>

        {/* Heatmap */}
        <div className="mb-8">
          <GeographicHeatmap data={geoData} height={500} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BarChartComponent
            data={topZones}
            xKey="name"
            bars={[
              { key: 'Score demande', name: 'Demande', color: '#FF6C2F' },
              { key: 'Score offre', name: 'Offre', color: '#3b82f6' },
            ]}
            height={400}
            title="Top 10 zones par demande vs offre"
          />

          <BarChartComponent
            data={topZones}
            xKey="name"
            bars={[{ key: 'Score competition', name: 'Compétition', color: '#8b5cf6' }]}
            height={400}
            title="Niveau de compétition par zone"
          />
        </div>

        {/* Tableau détaillé */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Détails par zone</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Recherches
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Vues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Propriétés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Prix moyen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Demande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Compétition
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {geoData
                  .sort((a, b) => b.demandScore - a.demandScore)
                  .slice(0, 20)
                  .map((zone, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {zone.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatNumber(zone.searchCount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatNumber(zone.viewCount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatNumber(zone.propertyCount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatCurrency(zone.avgPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            zone.demandScore >= 70
                              ? 'bg-red-100 text-red-800'
                              : zone.demandScore >= 40
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {zone.demandScore}/100
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            zone.competitionScore >= 70
                              ? 'bg-purple-100 text-purple-800'
                              : zone.competitionScore >= 40
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {zone.competitionScore}/100
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
