import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { 
  TrendingUp, TrendingDown, Home, Users, Coins, Clock, 
  AlertTriangle, FileText, Calendar, Download, RefreshCw
} from 'lucide-react';
import { format, subMonths } from 'date-fns';

interface OwnerAnalytics {
  total_properties: number;
  rented_properties: number;
  occupancy_rate: number;
  expected_monthly_revenue: number;
  collected_revenue: number;
  pending_payments: number;
  late_payments_count: number;
  avg_payment_delay: number;
  pending_maintenance: number;
  maintenance_costs: number;
  expiring_leases_30d: number;
  expiring_leases_90d: number;
}

export default function OwnerAnalyticsPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['owner-analytics', user?.id, dateRange],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not found');
      const { data, error } = await supabase.rpc('get_owner_analytics', {
        p_owner_id: user.id,
        p_start_date: dateRange.start,
        p_end_date: dateRange.end
      });
      if (error) throw error;
      return data as unknown as OwnerAnalytics;
    },
    enabled: !!user?.id
  });

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF' }).format(amount);

  const kpis = analytics ? [
    {
      title: 'Propriétés',
      value: analytics.total_properties,
      subtitle: `${analytics.rented_properties} louées`,
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Taux d\'occupation',
      value: `${analytics.occupancy_rate}%`,
      trend: analytics.occupancy_rate >= 80 ? 'up' : 'down',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Revenus attendus',
      value: formatCurrency(analytics.expected_monthly_revenue),
      subtitle: '/mois',
      icon: Coins,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Revenus collectés',
      value: formatCurrency(analytics.collected_revenue),
      subtitle: 'période sélectionnée',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Paiements en attente',
      value: formatCurrency(analytics.pending_payments),
      trend: analytics.pending_payments > 0 ? 'warning' : 'up',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Retards de paiement',
      value: analytics.late_payments_count,
      subtitle: `Moy. ${analytics.avg_payment_delay}j`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Maintenance en attente',
      value: analytics.pending_maintenance,
      subtitle: formatCurrency(analytics.maintenance_costs) + ' dépensés',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Baux expirant',
      value: analytics.expiring_leases_30d,
      subtitle: `${analytics.expiring_leases_90d} dans 90j`,
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ] : [];

  return (
    <div className="min-h-screen bg-[#FAF7F4] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#2C1810]">Tableau de bord Analytics</h1>
            <p className="text-[#2C1810]/60">Suivez les performances de vos propriétés</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-[#EFEBE9]">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-transparent text-sm border-none focus:ring-0"
              />
              <span className="text-[#2C1810]/40">→</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-transparent text-sm border-none focus:ring-0"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => refetch()}
              className="rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button className="bg-[#F16522] hover:bg-[#F16522]/90 rounded-xl">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* KPIs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="rounded-[24px] border-[#EFEBE9] animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => (
              <Card key={index} className="rounded-[24px] border-[#EFEBE9] hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                      <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                    </div>
                    {kpi.trend && (
                      <div className={`flex items-center gap-1 text-sm ${
                        kpi.trend === 'up' ? 'text-green-600' : 
                        kpi.trend === 'warning' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {kpi.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : 
                         kpi.trend === 'down' ? <TrendingDown className="h-4 w-4" /> : null}
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-[#2C1810]">{kpi.value}</p>
                    <p className="text-sm text-[#2C1810]/60">{kpi.title}</p>
                    {kpi.subtitle && (
                      <p className="text-xs text-[#2C1810]/40 mt-1">{kpi.subtitle}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Alerts Section */}
        {analytics && (analytics.expiring_leases_30d > 0 || analytics.pending_maintenance > 0 || analytics.late_payments_count > 0) && (
          <Card className="rounded-[24px] border-[#EFEBE9]">
            <CardHeader>
              <CardTitle className="text-[#2C1810] flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Actions requises
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.expiring_leases_30d > 0 && (
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    <span className="text-[#2C1810]">
                      {analytics.expiring_leases_30d} bail(s) expire(nt) dans les 30 prochains jours
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Voir
                  </Button>
                </div>
              )}
              {analytics.pending_maintenance > 0 && (
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span className="text-[#2C1810]">
                      {analytics.pending_maintenance} demande(s) de maintenance en attente
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Traiter
                  </Button>
                </div>
              )}
              {analytics.late_payments_count > 0 && (
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-[#2C1810]">
                      {analytics.late_payments_count} paiement(s) en retard
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Relancer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
