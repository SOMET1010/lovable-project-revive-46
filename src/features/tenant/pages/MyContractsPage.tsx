import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Eye, Edit, CheckCircle, Clock, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import TenantDashboardLayout from '../components/TenantDashboardLayout';
import { toast } from 'sonner';

interface Contract {
  id: string;
  contract_number: string;
  property_id: string;
  contract_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  monthly_rent: number;
  deposit_amount: number;
  charges_amount: number;
  owner_signed_at: string | null;
  tenant_signed_at: string | null;
  created_at: string;
  property: {
    title: string;
    address: string;
    city: string;
    main_image: string;
  };
  owner: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  tenant: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

type FilterType = 'all' | 'active' | 'pending' | 'expired';

export default function MyContracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (user) {
      loadContracts();
    }
  }, [user, filter]);

  const loadContracts = async () => {
    try {
      let query = supabase
        .from('lease_contracts')
        .select(`
          id,
          contract_number,
          property_id,
          contract_type,
          status,
          start_date,
          end_date,
          monthly_rent,
          deposit_amount,
          charges_amount,
          owner_signed_at,
          tenant_signed_at,
          created_at,
          properties!inner(title, address, city, main_image),
          owner:profiles!lease_contracts_owner_id_fkey(id, full_name, email, phone),
          tenant:profiles!lease_contracts_tenant_id_fkey(id, full_name, email, phone)
        `)
        .or(`owner_id.eq.${user?.id},tenant_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (filter === 'active') {
        query = query.eq('status', 'actif');
      } else if (filter === 'pending') {
        query = query.in('status', ['brouillon', 'en_attente_signature', 'partiellement_signe']);
      } else if (filter === 'expired') {
        query = query.in('status', ['expire', 'resilie', 'annule']);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedContracts = (data || []).map((contract: any) => ({
        id: contract.id,
        contract_number: contract.contract_number,
        property_id: contract.property_id,
        contract_type: contract.contract_type,
        status: contract.status,
        start_date: contract.start_date,
        end_date: contract.end_date,
        monthly_rent: contract.monthly_rent,
        deposit_amount: contract.deposit_amount,
        charges_amount: contract.charges_amount,
        owner_signed_at: contract.owner_signed_at,
        tenant_signed_at: contract.tenant_signed_at,
        created_at: contract.created_at,
        property: contract.properties,
        owner: contract.owner,
        tenant: contract.tenant
      }));

      setContracts(formattedContracts);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast.error('Erreur lors du chargement des contrats');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; icon: any; className: string }> = {
      brouillon: { label: 'Brouillon', icon: AlertCircle, className: 'bg-[#FAF7F4] text-[#6B5A4E] border border-[#EFEBE9]' },
      en_attente_signature: { label: 'En attente', icon: Clock, className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
      partiellement_signe: { label: 'Partiellement signé', icon: Clock, className: 'bg-blue-100 text-blue-700 border border-blue-200' },
      actif: { label: 'Actif', icon: CheckCircle, className: 'bg-green-100 text-green-700 border border-green-200' },
      expire: { label: 'Expiré', icon: XCircle, className: 'bg-red-100 text-red-700 border border-red-200' },
      resilie: { label: 'Résilié', icon: XCircle, className: 'bg-red-100 text-red-700 border border-red-200' },
      annule: { label: 'Annulé', icon: XCircle, className: 'bg-red-100 text-red-700 border border-red-200' }
    };
    return configs[status] || { label: status, icon: AlertCircle, className: 'bg-[#FAF7F4] text-[#6B5A4E] border border-[#EFEBE9]' };
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const isOwner = (contract: Contract) => contract.owner?.id === user?.id;

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'actif').length,
    pending: contracts.filter(c => ['brouillon', 'en_attente_signature', 'partiellement_signe'].includes(c.status)).length,
    expired: contracts.filter(c => ['expire', 'resilie', 'annule'].includes(c.status)).length
  };

  if (!user) {
    return (
      <TenantDashboardLayout title="Mes Contrats">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#FAF7F4] flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-[#A69B95]" />
            </div>
            <h2 className="text-xl font-semibold text-[#2C1810] mb-2">Connexion requise</h2>
            <p className="text-[#6B5A4E]">Veuillez vous connecter pour voir vos contrats</p>
          </div>
        </div>
      </TenantDashboardLayout>
    );
  }

  return (
    <TenantDashboardLayout title="Mes Contrats">
      <div className="max-w-7xl mx-auto">
        {/* Header Premium */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F16522] to-[#D95318] flex items-center justify-center shadow-lg shadow-[#F16522]/20">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2C1810]">Mes contrats de bail</h1>
              <p className="text-[#6B5A4E]">Gérez vos baux et contrats de location</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-[20px] border border-[#EFEBE9] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F4] flex items-center justify-center">
                  <FileText className="h-5 w-5 text-[#6B5A4E]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2C1810]">{stats.total}</p>
                  <p className="text-xs text-[#A69B95]">Total</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[20px] border border-[#EFEBE9] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2C1810]">{stats.active}</p>
                  <p className="text-xs text-[#A69B95]">Actifs</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[20px] border border-[#EFEBE9] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2C1810]">{stats.pending}</p>
                  <p className="text-xs text-[#A69B95]">En attente</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[20px] border border-[#EFEBE9] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F4] flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-[#A69B95]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2C1810]">{stats.expired}</p>
                  <p className="text-xs text-[#A69B95]">Terminés</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Tous' },
              { value: 'active', label: 'Actifs' },
              { value: 'pending', label: 'En attente' },
              { value: 'expired', label: 'Expirés' }
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
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F16522]"></div>
          </div>
        ) : contracts.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-[#EFEBE9] shadow-lg shadow-[#2C1810]/5 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-[#FAF7F4] flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-[#A69B95]" />
            </div>
            <h3 className="text-xl font-semibold text-[#2C1810] mb-2">Aucun contrat</h3>
            <p className="text-[#6B5A4E] mb-6">Vous n'avez pas encore de contrat de bail</p>
            <Link
              to="/recherche"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F16522] hover:bg-[#D95318] text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-[#F16522]/20"
            >
              Trouver un logement
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract) => {
              const statusConfig = getStatusConfig(contract.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={contract.id} className="bg-white rounded-[24px] border border-[#EFEBE9] shadow-lg shadow-[#2C1810]/5 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-40 md:h-auto">
                      <img
                        src={contract.property.main_image || '/placeholder-property.jpg'}
                        alt={contract.property.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-[#2C1810]">{contract.contract_number}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConfig.className}`}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-[#2C1810] font-semibold mb-1">{contract.property.title}</p>
                          <p className="text-sm text-[#6B5A4E]">{contract.property.address}, {contract.property.city}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#F16522]">{contract.monthly_rent.toLocaleString()} FCFA</p>
                          <p className="text-sm text-[#A69B95]">/mois</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-xs text-[#A69B95] uppercase tracking-wider mb-1">Date de début</p>
                          <p className="font-semibold text-[#2C1810]">{formatDate(contract.start_date)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#A69B95] uppercase tracking-wider mb-1">Loyer</p>
                          <p className="font-semibold text-[#2C1810]">{contract.monthly_rent.toLocaleString()} FCFA</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#A69B95] uppercase tracking-wider mb-1">Caution</p>
                          <p className="font-semibold text-[#2C1810]">{contract.deposit_amount.toLocaleString()} FCFA</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#A69B95] uppercase tracking-wider mb-1">{isOwner(contract) ? 'Locataire' : 'Propriétaire'}</p>
                          <p className="font-semibold text-[#2C1810]">{isOwner(contract) ? contract.tenant?.full_name : contract.owner?.full_name}</p>
                        </div>
                      </div>

                      <div className="bg-[#FAF7F4] rounded-xl p-3 border border-[#EFEBE9] mb-4">
                        <p className="text-xs font-medium text-[#A69B95] uppercase tracking-wider mb-2">Signatures</p>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1.5">
                            {contract.owner_signed_at ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-yellow-500" />
                            )}
                            <span className="text-sm text-[#6B5A4E]">Propriétaire</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {contract.tenant_signed_at ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-yellow-500" />
                            )}
                            <span className="text-sm text-[#6B5A4E]">Locataire</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`/contrat/${contract.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#F16522] hover:bg-[#D95318] text-white font-medium rounded-xl transition-all duration-200 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Voir le contrat
                        </Link>
                        {contract.status === 'brouillon' && isOwner(contract) && (
                          <Link
                            to={`/contrat/${contract.id}/editer`}
                            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#F16522] text-[#F16522] hover:bg-[#F16522] hover:text-white font-medium rounded-xl transition-all duration-200 text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            Modifier
                          </Link>
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