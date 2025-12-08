import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Coins, Download, Eye, Calendar, CheckCircle, XCircle, Clock, CreditCard, Plus, ArrowRight } from 'lucide-react';
import TenantDashboardLayout from '../components/TenantDashboardLayout';
import { toast } from 'sonner';

interface Payment {
  id: string;
  amount: number;
  payment_type: string;
  payment_method: string | null;
  status: string | null;
  created_at: string | null;
  payer_name: string;
  receiver_name: string;
  property_title: string;
  property_address: string;
  property_city: string;
}

type FilterType = 'all' | 'sent' | 'received';
type StatusFilterType = 'all' | 'en_attente' | 'complete' | 'echoue';

export default function PaymentHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user, filter, statusFilter]);

  const loadPayments = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'sent') {
        query = query.eq('payer_id', user.id);
      } else if (filter === 'received') {
        query = query.eq('receiver_id', user.id);
      } else {
        query = query.or(`payer_id.eq.${user.id},receiver_id.eq.${user.id}`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedPayments: Payment[] = (data || []).map((payment: any) => ({
        id: payment.id,
        amount: payment.amount,
        payment_type: payment.payment_type,
        payment_method: payment.payment_method,
        status: payment.status,
        created_at: payment.created_at,
        payer_name: 'Payeur',
        receiver_name: 'Destinataire',
        property_title: 'Paiement',
        property_address: '',
        property_city: ''
      }));

      setPayments(formattedPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string | null) => {
    const configs: Record<string, { label: string; icon: any; className: string }> = {
      en_attente: { label: 'En attente', icon: Clock, className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
      complete: { label: 'Complété', icon: CheckCircle, className: 'bg-green-100 text-green-700 border border-green-200' },
      echoue: { label: 'Échoué', icon: XCircle, className: 'bg-red-100 text-red-700 border border-red-200' },
      annule: { label: 'Annulé', icon: XCircle, className: 'bg-[#FAF7F4] text-[#6B5A4E] border border-[#EFEBE9]' }
    };
    return configs[status || 'en_attente'] || configs['en_attente'];
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      loyer: 'Loyer',
      depot_garantie: 'Dépôt de garantie',
      charges: 'Charges',
      frais_agence: "Frais d'agence"
    };
    return labels[type] || type;
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Date inconnue';
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const stats = {
    total: payments.filter(p => p.status === 'complete').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'en_attente').reduce((sum, p) => sum + p.amount, 0),
    count: payments.length,
    pendingCount: payments.filter(p => p.status === 'en_attente').length
  };

  if (!user) {
    return (
      <TenantDashboardLayout title="Mes Paiements">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#FAF7F4] flex items-center justify-center mx-auto mb-6">
              <Coins className="w-10 h-10 text-[#A69B95]" />
            </div>
            <h2 className="text-xl font-semibold text-[#2C1810] mb-2">Connexion requise</h2>
            <p className="text-[#6B5A4E]">Veuillez vous connecter pour voir votre historique</p>
          </div>
        </div>
      </TenantDashboardLayout>
    );
  }

  return (
    <TenantDashboardLayout title="Mes Paiements">
      <div className="max-w-7xl mx-auto">
        {/* Header Premium */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F16522] to-[#D95318] flex items-center justify-center shadow-lg shadow-[#F16522]/20">
                <Coins className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#2C1810]">Historique des paiements</h1>
                <p className="text-[#6B5A4E]">Gérez et consultez tous vos paiements</p>
              </div>
            </div>
            <Link
              to="/effectuer-paiement"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#F16522] hover:bg-[#D95318] text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-[#F16522]/20"
            >
              <Plus className="h-5 w-5" />
              Nouveau paiement
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-[20px] border border-[#EFEBE9] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#F16522]">{stats.total.toLocaleString()} F</p>
                  <p className="text-xs text-[#A69B95]">Total payé</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[20px] border border-[#EFEBE9] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#F16522]">{stats.pending.toLocaleString()} F</p>
                  <p className="text-xs text-[#A69B95]">En attente</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[20px] border border-[#EFEBE9] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#2C1810]">{stats.count}</p>
                  <p className="text-xs text-[#A69B95]">Transactions</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[20px] border border-[#EFEBE9] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F4] flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#6B5A4E]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#2C1810]">{stats.pendingCount}</p>
                  <p className="text-xs text-[#A69B95]">À payer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Tous' },
                { value: 'sent', label: 'Envoyés' },
                { value: 'received', label: 'Reçus' }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value as FilterType)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === item.value
                      ? 'bg-[#F16522] text-white shadow-lg shadow-[#F16522]/20'
                      : 'bg-white text-[#6B5A4E] border border-[#EFEBE9] hover:border-[#F16522] hover:text-[#F16522]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white text-[#6B5A4E] border border-[#EFEBE9] focus:outline-none focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522]"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="complete">Complété</option>
              <option value="echoue">Échoué</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F16522]"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-[#EFEBE9] shadow-lg shadow-[#2C1810]/5 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-[#FAF7F4] flex items-center justify-center mx-auto mb-6">
              <Coins className="w-10 h-10 text-[#A69B95]" />
            </div>
            <h3 className="text-xl font-semibold text-[#2C1810] mb-2">Aucun paiement</h3>
            <p className="text-[#6B5A4E] mb-6">Vous n'avez pas encore effectué de paiement</p>
            <Link
              to="/effectuer-paiement"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F16522] hover:bg-[#D95318] text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-[#F16522]/20"
            >
              Effectuer un paiement
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => {
              const statusConfig = getStatusConfig(payment.status) ?? { label: 'Inconnu', icon: Clock, className: 'bg-[#FAF7F4] text-[#6B5A4E] border border-[#EFEBE9]' };
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={payment.id} className="bg-white rounded-[24px] border border-[#EFEBE9] shadow-sm hover:shadow-lg hover:shadow-[#2C1810]/5 transition-all duration-300 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF7F4] flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-[#F16522]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#2C1810]">{getPaymentTypeLabel(payment.payment_type)}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.className}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-[#6B5A4E]">{payment.property_title}</p>
                        <p className="text-xs text-[#A69B95] mt-1">{formatDate(payment.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#F16522]">{payment.amount.toLocaleString()} FCFA</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/paiement/${payment.id}`)}
                          className="w-10 h-10 rounded-xl border border-[#EFEBE9] flex items-center justify-center text-[#6B5A4E] hover:bg-[#F16522] hover:text-white hover:border-[#F16522] transition-all duration-200"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {payment.status === 'complete' && (
                          <button className="w-10 h-10 rounded-xl border border-[#EFEBE9] flex items-center justify-center text-[#6B5A4E] hover:bg-[#F16522] hover:text-white hover:border-[#F16522] transition-all duration-200">
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </TenantDashboardLayout>
  );
}