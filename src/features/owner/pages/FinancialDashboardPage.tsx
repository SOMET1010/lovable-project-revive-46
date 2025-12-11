import { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, Calendar, 
  FileSpreadsheet, FileText, PieChart
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';

interface MonthlyStats {
  month: string;
  expected: number;
  received: number;
  pending: number;
}

interface PropertyFinancials {
  id: string;
  title: string;
  city: string;
  monthly_rent: number;
  total_received: number;
  total_pending: number;
  collection_rate: number;
}

export default function FinancialDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [yearlyStats, setYearlyStats] = useState({
    totalExpected: 0,
    totalReceived: 0,
    totalPending: 0,
    collectionRate: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);
  const [propertyFinancials, setPropertyFinancials] = useState<PropertyFinancials[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user?.id) {
      loadFinancialData();
    }
  }, [user?.id, selectedYear]);

  const loadFinancialData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Get all payments for the year
      const startOfYear = new Date(selectedYear, 0, 1).toISOString();
      const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();

      const { data: payments } = await supabase
        .from('payments')
        .select('*, properties(id, title, city, monthly_rent)')
        .eq('receiver_id', user.id)
        .gte('created_at', startOfYear)
        .lte('created_at', endOfYear);

      // Get active leases for expected revenue
      const { data: leases } = await supabase
        .from('lease_contracts')
        .select('id, monthly_rent, property_id, properties(title, city)')
        .eq('owner_id', user.id)
        .eq('status', 'active');

      // Calculate yearly totals
      const monthlyExpected = leases?.reduce((sum, l) => sum + (l.monthly_rent || 0), 0) || 0;
      const yearlyExpected = monthlyExpected * 12;
      const yearlyReceived = payments?.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const yearlyPending = payments?.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      setYearlyStats({
        totalExpected: yearlyExpected,
        totalReceived: yearlyReceived,
        totalPending: yearlyPending,
        collectionRate: yearlyExpected > 0 ? (yearlyReceived / yearlyExpected) * 100 : 0,
      });

      // Calculate monthly data
      const monthlyStats: MonthlyStats[] = [];
      for (let month = 0; month < 12; month++) {
        const monthPayments = payments?.filter(p => {
          const paymentDate = new Date(p.created_at || '');
          return paymentDate.getMonth() === month;
        }) || [];

        monthlyStats.push({
          month: new Date(selectedYear, month).toLocaleDateString('fr-FR', { month: 'short' }),
          expected: monthlyExpected,
          received: monthPayments.filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0),
          pending: monthPayments.filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + (p.amount || 0), 0),
        });
      }
      setMonthlyData(monthlyStats);

      // Calculate per-property financials
      const propertyMap = new Map<string, PropertyFinancials>();
      
      leases?.forEach(lease => {
        const propId = lease.property_id;
        if (!propertyMap.has(propId)) {
          propertyMap.set(propId, {
            id: propId,
            title: (lease.properties as { title: string })?.title || 'Sans titre',
            city: (lease.properties as { city: string })?.city || '',
            monthly_rent: lease.monthly_rent || 0,
            total_received: 0,
            total_pending: 0,
            collection_rate: 0,
          });
        }
      });

      payments?.forEach(payment => {
        const propId = payment.property_id;
        if (propId && propertyMap.has(propId)) {
          const prop = propertyMap.get(propId)!;
          if (payment.status === 'completed') {
            prop.total_received += payment.amount || 0;
          } else if (payment.status === 'pending') {
            prop.total_pending += payment.amount || 0;
          }
        }
      });

      propertyMap.forEach(prop => {
        const expected = prop.monthly_rent * 12;
        prop.collection_rate = expected > 0 ? (prop.total_received / expected) * 100 : 0;
      });

      setPropertyFinancials(Array.from(propertyMap.values()));
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = (format: 'csv' | 'excel' | 'pdf') => {
    // Create CSV data
    const headers = ['Bien', 'Ville', 'Loyer mensuel', 'Total reçu', 'En attente', 'Taux recouvrement'];
    const rows = propertyFinancials.map(p => [
      p.title,
      p.city,
      p.monthly_rent,
      p.total_received,
      p.total_pending,
      `${Math.round(p.collection_rate)}%`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `finances_${selectedYear}.${format === 'excel' ? 'csv' : format}`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Dashboard Financier
            </h1>
            <p className="text-muted-foreground mt-1">
              Vue d'ensemble de vos revenus locatifs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <Button variant="outline" size="small" onClick={() => exportData('csv')}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="small" onClick={() => exportData('pdf')}>
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Yearly Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attendu {selectedYear}</p>
                  <p className="text-xl font-bold">
                    {yearlyStats.totalExpected.toLocaleString()} F
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reçu</p>
                  <p className="text-xl font-bold text-green-600">
                    {yearlyStats.totalReceived.toLocaleString()} F
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-xl font-bold text-orange-600">
                    {yearlyStats.totalPending.toLocaleString()} F
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <PieChart className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taux recouvrement</p>
                  <p className={`text-xl font-bold ${
                    yearlyStats.collectionRate >= 90 ? 'text-green-600' :
                    yearlyStats.collectionRate >= 70 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {Math.round(yearlyStats.collectionRate)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-2">
              {monthlyData.map((month, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col gap-1">
                    <div
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${(month.received / (yearlyStats.totalExpected / 12)) * 150}px` }}
                      title={`Reçu: ${month.received.toLocaleString()} F`}
                    />
                    <div
                      className="w-full bg-orange-400 rounded-b"
                      style={{ height: `${(month.pending / (yearlyStats.totalExpected / 12)) * 150}px` }}
                      title={`En attente: ${month.pending.toLocaleString()} F`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-sm text-muted-foreground">Reçu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded" />
                <span className="text-sm text-muted-foreground">En attente</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Per-Property Table */}
        <Card>
          <CardHeader>
            <CardTitle>Détail par bien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Bien</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Loyer</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Reçu</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">En attente</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Taux</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyFinancials.map(prop => (
                    <tr key={prop.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{prop.title}</p>
                          <p className="text-sm text-muted-foreground">{prop.city}</p>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2">
                        {prop.monthly_rent.toLocaleString()} F
                      </td>
                      <td className="text-right py-3 px-2 text-green-600">
                        {prop.total_received.toLocaleString()} F
                      </td>
                      <td className="text-right py-3 px-2 text-orange-600">
                        {prop.total_pending.toLocaleString()} F
                      </td>
                      <td className="text-right py-3 px-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          prop.collection_rate >= 90 ? 'bg-green-100 text-green-700' :
                          prop.collection_rate >= 70 ? 'bg-orange-100 text-orange-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {Math.round(prop.collection_rate)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
