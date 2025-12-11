import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { 
  Coins, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Download,
  Send,
  Filter,
  Calendar,
  Building2,
  User,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/shared/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { Badge } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_type: string;
  payment_method: string | null;
  due_date: string | null;
  paid_date: string | null;
  transaction_ref: string | null;
  receipt_url: string | null;
  receipt_number: string | null;
  late_fee_amount: number;
  payer_id: string;
  contract_id: string | null;
  property_id: string | null;
  created_at: string;
  contract?: {
    contract_number: string;
    property?: {
      title: string;
      city: string;
    };
  };
  payer?: {
    full_name: string;
    phone: string;
  };
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle }> = {
  paye: { label: 'Payé', variant: 'default', icon: CheckCircle },
  en_attente: { label: 'En attente', variant: 'secondary', icon: Clock },
  en_retard: { label: 'En retard', variant: 'destructive', icon: AlertTriangle },
  annule: { label: 'Annulé', variant: 'outline', icon: XCircle },
};

export default function OwnerPaymentsPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch owner's payments
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['owner-payments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get contracts where user is owner
      const { data: contracts } = await supabase
        .from('lease_contracts')
        .select('id')
        .eq('owner_id', user.id);

      if (!contracts?.length) return [];

      const contractIds = contracts.map(c => c.id);

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          contract:lease_contracts(
            contract_number,
            property:properties(title, city)
          )
        `)
        .in('contract_id', contractIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get payer profiles
      const payerIds = [...new Set((data || []).map(p => p.payer_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone')
        .in('user_id', payerIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return (data || []).map(payment => ({
        ...payment,
        payer: profileMap.get(payment.payer_id)
      })) as Payment[];
    },
    enabled: !!user?.id
  });

  // Fetch properties for filter
  const { data: properties = [] } = useQuery({
    queryKey: ['owner-properties-filter', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('properties')
        .select('id, title')
        .eq('owner_id', user.id);
      return data || [];
    },
    enabled: !!user?.id
  });

  // Calculate statistics
  const stats = {
    totalReceived: payments.filter(p => p.status === 'paye').reduce((sum, p) => sum + (p.amount || 0), 0),
    pending: payments.filter(p => p.status === 'en_attente').length,
    overdue: payments.filter(p => {
      if (p.status !== 'en_attente' || !p.due_date) return false;
      return new Date(p.due_date) < new Date();
    }).length,
    recoveryRate: payments.length > 0 
      ? Math.round((payments.filter(p => p.status === 'paye').length / payments.length) * 100) 
      : 0
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    if (statusFilter !== 'all' && payment.status !== statusFilter) return false;
    if (propertyFilter !== 'all' && payment.property_id !== propertyFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        payment.payer?.full_name?.toLowerCase().includes(search) ||
        payment.transaction_ref?.toLowerCase().includes(search) ||
        payment.contract?.contract_number?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const sendManualReminder = async (payment: Payment) => {
    try {
      await supabase.functions.invoke('send-sms-hybrid', {
        body: {
          phoneNumber: payment.payer?.phone,
          message: `Rappel: Votre loyer de ${payment.amount?.toLocaleString('fr-CI')} FCFA est en attente. Veuillez effectuer votre paiement sur Mon Toit.`
        }
      });
      toast.success('Rappel envoyé avec succès');
    } catch {
      toast.error('Erreur lors de l\'envoi du rappel');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F4] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/proprietaire">
              <Button variant="ghost" size="small" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#2C1810]">Mes Paiements</h1>
              <p className="text-muted-foreground">Suivi des loyers et revenus</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border-[#EFEBE9]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <Coins className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total reçu</p>
                  <p className="text-xl font-bold text-[#2C1810]">
                    {stats.totalReceived.toLocaleString('fr-CI')} <span className="text-sm font-normal">FCFA</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#EFEBE9]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-xl font-bold text-[#2C1810]">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#EFEBE9]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En retard</p>
                  <p className="text-xl font-bold text-[#2C1810]">{stats.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#EFEBE9]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taux recouvrement</p>
                  <p className="text-xl font-bold text-[#2C1810]">{stats.recoveryRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white border-[#EFEBE9]">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par nom, référence..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="border-[#EFEBE9]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] border-[#EFEBE9]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="paye">Payé</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                </SelectContent>
              </Select>
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="w-full md:w-[200px] border-[#EFEBE9]">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Propriété" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les propriétés</SelectItem>
                  {properties.map(prop => (
                    <SelectItem key={prop.id} value={prop.id}>{prop.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <Card className="bg-white border-[#EFEBE9]">
          <CardHeader>
            <CardTitle className="text-[#2C1810]">Historique des paiements</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun paiement trouvé
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPayments.map((payment) => {
                  const config = statusConfig[payment.status] || statusConfig['en_attente'];
                  const StatusIcon = config?.icon || Clock;
                  const isOverdue = payment.status === 'en_attente' && payment.due_date && new Date(payment.due_date) < new Date();

                  return (
                    <div
                      key={payment.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-[#EFEBE9] hover:border-[#F16522]/30 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${
                          payment.status === 'paye' ? 'bg-green-100' :
                          isOverdue ? 'bg-red-100' : 'bg-amber-100'
                        }`}>
                          <StatusIcon className={`h-5 w-5 ${
                            payment.status === 'paye' ? 'text-green-600' :
                            isOverdue ? 'text-red-600' : 'text-amber-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#2C1810]">
                              {payment.amount?.toLocaleString('fr-CI')} FCFA
                            </span>
                            {payment.late_fee_amount > 0 && (
                              <span className="text-sm text-red-600">
                                (+{payment.late_fee_amount.toLocaleString('fr-CI')} pénalités)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{payment.payer?.full_name || 'Locataire'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span>{payment.contract?.property?.title || 'Propriété'}</span>
                          </div>
                          {payment.due_date && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>Échéance: {format(new Date(payment.due_date), 'dd MMM yyyy', { locale: fr })}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <Badge variant={isOverdue ? 'destructive' : config?.variant || 'secondary'}>
                          {isOverdue ? 'En retard' : config?.label || 'En attente'}
                        </Badge>
                        
                        {payment.status === 'paye' && payment.receipt_url && (
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => window.open(payment.receipt_url!, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Reçu
                          </Button>
                        )}
                        
                        {payment.status === 'en_attente' && payment.payer?.phone && (
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => sendManualReminder(payment)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Rappel
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
