import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/services/supabase/client';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Download,
  Play,
  Pause,
} from 'lucide-react';

interface ServiceStats {
  service_name: string;
  provider: string;
  success_count: number;
  failure_count: number;
  success_rate: number;
  avg_response_time: number;
}

interface TimeRange {
  label: string;
  value: string;
}

export default function AdminServiceMonitoring() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<ServiceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('24 hours');

  const timeRanges: TimeRange[] = [
    { label: '1 heure', value: '1 hour' },
    { label: '24 heures', value: '24 hours' },
    { label: '7 jours', value: '7 days' },
    { label: '30 jours', value: '30 days' },
  ];

  useEffect(() => {
    if (user && profile?.user_type === 'admin') {
      loadStats();
    }
  }, [user, profile, selectedTimeRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_service_stats', {
        service_filter: null,
        time_range: selectedTimeRange,
      });

      if (error) throw error;
      setStats(data || []);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleRunHealthCheck = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/service-health-check`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const result = await response.json();
      alert(result.message);
      await loadStats();
    } catch (error) {
      console.error('Error running health check:', error);
      alert('Erreur lors de la vérification de santé');
    }
  };

  const getStatusColor = (successRate: number) => {
    if (successRate >= 95) return 'text-[var(--color-semantic-success)] bg-[var(--color-semantic-success)]/10';
    if (successRate >= 80) return 'text-[var(--color-semantic-warning)] bg-[var(--color-semantic-warning)]/10';
    return 'text-[var(--color-semantic-error)] bg-[var(--color-semantic-error)]/10';
  };

  const getStatusIcon = (successRate: number) => {
    if (successRate >= 95) return <CheckCircle className="w-5 h-5 text-[var(--color-semantic-success)]" />;
    if (successRate >= 80) return <AlertTriangle className="w-5 h-5 text-[var(--color-semantic-warning)]" />;
    return <AlertTriangle className="w-5 h-5 text-[var(--color-semantic-error)]" />;
  };

  const getTrendIcon = (successRate: number) => {
    if (successRate >= 95) return <TrendingUp className="w-4 h-4 text-[var(--color-semantic-success)]" />;
    return <TrendingDown className="w-4 h-4 text-[var(--color-semantic-error)]" />;
  };

  const exportStats = () => {
    const csv = [
      ['Service', 'Provider', 'Success Rate', 'Success Count', 'Failure Count', 'Avg Response Time (ms)'],
      ...stats.map(s => [
        s.service_name,
        s.provider,
        `${s.success_rate.toFixed(2)}%`,
        s.success_count,
        s.failure_count,
        s.avg_response_time?.toFixed(2) || 'N/A',
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-stats-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (!user || profile?.user_type !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">
            Cette page est réservée aux administrateurs
          </p>
        </div>
      </div>
    );
  }

  const totalCalls = stats.reduce((sum, s) => sum + s.success_count + s.failure_count, 0);
  const totalSuccess = stats.reduce((sum, s) => sum + s.success_count, 0);
  const overallSuccessRate = totalCalls > 0 ? (totalSuccess / totalCalls) * 100 : 0;
  const avgResponseTime = stats.length > 0
    ? stats.reduce((sum, s) => sum + (s.avg_response_time || 0), 0) / stats.length
    : 0;

  return (
    <div className="p-6 space-y-6 bg-[var(--color-neutral-50)] min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-8 h-8 text-[var(--color-primary-600)]" />
            <h1 className="text-3xl font-bold text-[var(--color-neutral-900)]">
              Monitoring Services
            </h1>
          </div>
          <p className="text-[var(--color-neutral-700)]">
            Surveillance temps réel - Services & Providers
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-[var(--color-neutral-300)] rounded-md bg-white text-[var(--color-neutral-900)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-transparent text-sm"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1 px-3 py-2 bg-[var(--color-primary-600)] text-white rounded-md hover:bg-[var(--color-primary-700)] transition disabled:opacity-50 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
          <button
            onClick={handleRunHealthCheck}
            className="flex items-center space-x-1 px-3 py-2 bg-[var(--color-semantic-success)] text-white rounded-md hover:bg-[var(--color-semantic-success)]/90 transition text-sm font-medium"
          >
            <Activity className="w-4 h-4" />
            <span>Vérifier Santé</span>
          </button>
          <button
            onClick={exportStats}
            className="flex items-center space-x-1 px-3 py-2 bg-[var(--color-neutral-600)] text-white rounded-md hover:bg-[var(--color-neutral-700)] transition text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-600)] mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-[var(--color-neutral-200)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[var(--color-neutral-700)] text-sm font-medium">Total Appels</span>
                <BarChart3 className="w-5 h-5 text-[var(--color-primary-600)]" />
              </div>
              <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
                {totalCalls.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-[var(--color-neutral-200)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[var(--color-neutral-700)] text-sm font-medium">Taux Réussite</span>
                {getStatusIcon(overallSuccessRate)}
              </div>
              <p className={`text-2xl font-bold ${
                overallSuccessRate >= 95 ? 'text-[var(--color-semantic-success)]' : 
                overallSuccessRate >= 80 ? 'text-[var(--color-semantic-warning)]' : 
                'text-[var(--color-semantic-error)]'
              }`}>
                {overallSuccessRate.toFixed(1)}%
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-[var(--color-neutral-200)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[var(--color-neutral-700)] text-sm font-medium">Temps Réponse</span>
                <Clock className="w-5 h-5 text-[var(--color-primary-600)]" />
              </div>
              <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
                {avgResponseTime.toFixed(0)}ms
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-[var(--color-neutral-200)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[var(--color-neutral-700)] text-sm font-medium">Services Actifs</span>
                <Activity className="w-5 h-5 text-[var(--color-semantic-success)]" />
              </div>
              <p className="text-2xl font-bold text-[var(--color-neutral-900)]">
                {stats.length}
              </p>
            </div>
          </div>

          {/* Facial Verification Cost Savings Section */}
          {stats.filter(s => s.service_name === 'face_recognition').length > 0 && (
            <div className="bg-gradient-to-br from-[var(--color-semantic-success)]/5 to-[var(--color-semantic-success)]/10 rounded-lg border border-[var(--color-semantic-success)]/20 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-[var(--color-semantic-success)]/10 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-[var(--color-semantic-success)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-neutral-900)]">Reconnaissance Faciale - Économies</h2>
                  <p className="text-xs text-[var(--color-neutral-700)]">Comparaison coûts providers</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {stats.filter(s => s.service_name === 'face_recognition').map((faceStats) => {
                  const costPerVerification = faceStats.provider === 'smileless' ? 0 :
                                              faceStats.provider === 'azure' ? 0.75 : 0.90;
                  const totalCost = (faceStats.success_count + faceStats.failure_count) * costPerVerification;
                  const costSavedVsAzure = (faceStats.success_count + faceStats.failure_count) * 0.75;

                  return (
                    <div key={faceStats.provider} className="bg-white rounded-md border border-[var(--color-neutral-200)] p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-[var(--color-neutral-900)] text-sm capitalize">{faceStats.provider}</span>
                        {faceStats.provider === 'smileless' && (
                          <span className="px-2 py-1 bg-[var(--color-semantic-success)]/10 text-[var(--color-semantic-success)] text-xs font-bold rounded">
                            GRATUIT
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[var(--color-neutral-700)]">Vérifications:</span>
                          <span className="font-semibold">{faceStats.success_count + faceStats.failure_count}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[var(--color-neutral-700)]">Taux réussite:</span>
                          <span className={`font-semibold ${faceStats.success_rate >= 95 ? 'text-[var(--color-semantic-success)]' : 'text-[var(--color-semantic-warning)]'}`}>
                            {faceStats.success_rate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs border-t pt-1">
                          <span className="text-[var(--color-neutral-700)]">Coût total:</span>
                          <span className="font-bold text-sm">
                            {faceStats.provider === 'smileless' ? (
                              <span className="text-[var(--color-semantic-success)]">0 FCFA</span>
                            ) : (
                              <span className="text-[var(--color-neutral-900)]">{totalCost.toFixed(2)} FCFA</span>
                            )}
                          </span>
                        </div>
                        {faceStats.provider === 'smileless' && costSavedVsAzure > 0 && (
                          <div className="bg-[var(--color-semantic-success)]/5 rounded p-1 text-center mt-1">
                            <p className="text-xs text-[var(--color-semantic-success)]/80">Économie vs Azure:</p>
                            <p className="font-bold text-[var(--color-semantic-success)] text-sm">{costSavedVsAzure.toFixed(2)} FCFA</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-[var(--color-neutral-200)] overflow-hidden">
            <div className="px-4 py-3 bg-[var(--color-neutral-50)] border-b border-[var(--color-neutral-200)]">
              <h2 className="text-lg font-bold text-[var(--color-neutral-900)]">
                Détails Services & Providers
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-neutral-50)]">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-neutral-700)] uppercase">
                      Service
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-neutral-700)] uppercase">
                      Provider
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-neutral-700)] uppercase">
                      Taux
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-neutral-700)] uppercase">
                      Succès
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-neutral-700)] uppercase">
                      Échecs
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-neutral-700)] uppercase">
                      Temps
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-neutral-700)] uppercase">
                      Tendance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-neutral-200)]">
                  {stats.map((stat, index) => (
                    <tr key={index} className="hover:bg-[var(--color-neutral-50)]">
                      <td className="px-3 py-2">
                        <span className="font-semibold text-[var(--color-neutral-900)] capitalize text-xs">
                          {stat.service_name.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-[var(--color-neutral-700)] capitalize text-xs">{stat.provider}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(stat.success_rate)}`}>
                          {stat.success_rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[var(--color-semantic-success)] font-semibold text-xs">
                        {stat.success_count.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-[var(--color-semantic-error)] font-semibold text-xs">
                        {stat.failure_count.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-[var(--color-neutral-900)] text-xs">
                        {stat.avg_response_time ? `${stat.avg_response_time.toFixed(0)}ms` : 'N/A'}
                      </td>
                      <td className="px-3 py-2">
                        {getTrendIcon(stat.success_rate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
