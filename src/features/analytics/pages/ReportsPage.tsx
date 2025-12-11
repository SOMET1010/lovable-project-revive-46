import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { 
  FileText, Download, Calendar, TrendingUp, Building, 
  Coins, Loader2
} from 'lucide-react';
import { format, startOfYear } from 'date-fns';

interface OwnerAnalytics {
  total_properties: number;
  rented_properties: number;
  occupancy_rate: number;
  collected_revenue: number;
  pending_payments: number;
  maintenance_costs: number;
  late_payments_count: number;
  avg_payment_delay: number;
  pending_maintenance: number;
}

type ReportType = 'financial' | 'occupancy' | 'maintenance' | 'payments';

interface ReportConfig {
  id: ReportType;
  title: string;
  description: string;
  icon: typeof FileText;
  color: string;
}

const REPORT_TYPES: ReportConfig[] = [
  {
    id: 'financial',
    title: 'Rapport financier',
    description: 'Revenus, dépenses et rentabilité',
    icon: Coins,
    color: 'text-green-600'
  },
  {
    id: 'occupancy',
    title: 'Rapport d\'occupation',
    description: 'Taux d\'occupation et vacances',
    icon: Building,
    color: 'text-blue-600'
  },
  {
    id: 'maintenance',
    title: 'Rapport maintenance',
    description: 'Interventions et coûts',
    icon: FileText,
    color: 'text-purple-600'
  },
  {
    id: 'payments',
    title: 'Rapport paiements',
    description: 'Historique et retards',
    icon: TrendingUp,
    color: 'text-amber-600'
  }
];

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<ReportType>('financial');
  const [dateRange, setDateRange] = useState({
    start: format(startOfYear(new Date()), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: analytics } = useQuery({
    queryKey: ['owner-analytics-report', user?.id, dateRange],
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

  const handleGenerateReport = async (reportType: ReportType, exportFormat: 'pdf' | 'excel') => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-owner-report', {
        body: {
          reportType,
          format: exportFormat,
          startDate: dateRange.start,
          endDate: dateRange.end,
          ownerId: user?.id
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF' }).format(amount || 0);

  return (
    <div className="min-h-screen bg-[#FAF7F4] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#2C1810]">Rapports</h1>
            <p className="text-[#2C1810]/60">Générez et exportez vos rapports d'activité</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-[#EFEBE9]">
              <Calendar className="h-4 w-4 text-[#2C1810]/40" />
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
          </div>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORT_TYPES.map((report) => (
            <Card 
              key={report.id}
              className={`rounded-[24px] border-2 cursor-pointer transition-all ${
                selectedReport === report.id 
                  ? 'border-[#F16522] bg-[#F16522]/5' 
                  : 'border-[#EFEBE9] hover:border-[#F16522]/50'
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${
                  selectedReport === report.id ? 'bg-[#F16522]/10' : 'bg-gray-100'
                } w-fit`}>
                  <report.icon className={`h-6 w-6 ${
                    selectedReport === report.id ? 'text-[#F16522]' : report.color
                  }`} />
                </div>
                <h3 className="font-semibold text-[#2C1810] mt-4">{report.title}</h3>
                <p className="text-sm text-[#2C1810]/60 mt-1">{report.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report Preview & Export */}
        <Card className="rounded-[24px] border-[#EFEBE9]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#2C1810]">
              {REPORT_TYPES.find(r => r.id === selectedReport)?.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="rounded-xl"
                onClick={() => handleGenerateReport(selectedReport, 'excel')}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Excel
              </Button>
              <Button 
                className="bg-[#F16522] hover:bg-[#F16522]/90 rounded-xl"
                onClick={() => handleGenerateReport(selectedReport, 'pdf')}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Preview based on selected report type */}
            {selectedReport === 'financial' && analytics && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-600">Revenus collectés</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(analytics.collected_revenue)}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <p className="text-sm text-amber-600">En attente</p>
                    <p className="text-2xl font-bold text-amber-700">{formatCurrency(analytics.pending_payments)}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl">
                    <p className="text-sm text-red-600">Coûts maintenance</p>
                    <p className="text-2xl font-bold text-red-700">{formatCurrency(analytics.maintenance_costs)}</p>
                  </div>
                </div>
                <div className="p-4 bg-[#F16522]/10 rounded-xl">
                  <p className="text-sm text-[#F16522]">Résultat net estimé</p>
                  <p className="text-3xl font-bold text-[#2C1810]">
                    {formatCurrency((analytics.collected_revenue || 0) - (analytics.maintenance_costs || 0))}
                  </p>
                </div>
              </div>
            )}

            {selectedReport === 'occupancy' && analytics && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-600">Total propriétés</p>
                    <p className="text-2xl font-bold text-blue-700">{analytics.total_properties}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-600">Louées</p>
                    <p className="text-2xl font-bold text-green-700">{analytics.rented_properties}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <p className="text-sm text-amber-600">Vacantes</p>
                    <p className="text-2xl font-bold text-amber-700">
                      {(analytics.total_properties || 0) - (analytics.rented_properties || 0)}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-[#F16522]/10 rounded-xl">
                  <p className="text-sm text-[#F16522]">Taux d'occupation</p>
                  <p className="text-3xl font-bold text-[#2C1810]">{analytics.occupancy_rate || 0}%</p>
                </div>
              </div>
            )}

            {selectedReport === 'payments' && analytics && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-600">Paiements reçus</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(analytics.collected_revenue)}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl">
                    <p className="text-sm text-red-600">Retards</p>
                    <p className="text-2xl font-bold text-red-700">{analytics.late_payments_count || 0}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <p className="text-sm text-amber-600">Délai moyen</p>
                    <p className="text-2xl font-bold text-amber-700">{analytics.avg_payment_delay || 0}j</p>
                  </div>
                </div>
              </div>
            )}

            {selectedReport === 'maintenance' && analytics && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <p className="text-sm text-purple-600">Demandes en attente</p>
                    <p className="text-2xl font-bold text-purple-700">{analytics.pending_maintenance || 0}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl">
                    <p className="text-sm text-red-600">Coûts totaux</p>
                    <p className="text-2xl font-bold text-red-700">{formatCurrency(analytics.maintenance_costs)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
