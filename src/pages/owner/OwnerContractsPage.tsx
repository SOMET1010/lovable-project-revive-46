import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, Search, Download, Eye, Trash2, 
  RefreshCw, Bell, XCircle, Building, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { downloadContract, regenerateContract, deleteContract, sendSignatureReminder } from '@/services/contracts/contractService';
import { toast } from '@/hooks/shared/useSafeToast';
import OwnerDashboardLayout from '@/features/owner/components/OwnerDashboardLayout';

interface Contract {
  id: string;
  contract_number: string;
  status: string;
  monthly_rent: number;
  charges_amount: number | null;
  deposit_amount: number | null;
  start_date: string;
  end_date: string;
  document_url: string | null;
  landlord_signed_at: string | null;
  tenant_signed_at: string | null;
  created_at: string;
  tenant_id: string;
  properties: {
    id: string;
    title: string;
    city: string;
    main_image: string | null;
  };
  tenant_profile: {
    full_name: string | null;
  } | null;
}

interface Stats {
  total: number;
  brouillon: number;
  en_attente_signature: number;
  partiellement_signe: number;
  actif: number;
  expire: number;
  resilie: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  brouillon: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700', icon: FileText },
  en_attente_signature: { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: Clock },
  partiellement_signe: { label: 'Partiellement signé', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  actif: { label: 'Actif', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  expire: { label: 'Expiré', color: 'bg-red-100 text-red-700', icon: XCircle },
  resilie: { label: 'Résilié', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'brouillon', label: 'Brouillons' },
  { value: 'en_attente_signature', label: 'En attente' },
  { value: 'actif', label: 'Actifs' },
  { value: 'expire', label: 'Expirés' },
];

export default function OwnerContractsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, brouillon: 0, en_attente_signature: 0, partiellement_signe: 0, actif: 0, expire: 0, resilie: 0 });
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadContracts();
    }
  }, [user]);

  const loadContracts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('lease_contracts')
        .select(`
          id,
          contract_number,
          status,
          monthly_rent,
          charges_amount,
          deposit_amount,
          start_date,
          end_at,
          document_url,
          created_at,
          tenant_id,
          properties!lease_contracts_property_id_fkey (
            id,
            title,
            city,
            main_image
          )
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch tenant profiles
      const tenantIds = [...new Set((data || []).map(c => c.tenant_id))];
      const { data: profiles } = await supabase
        .rpc('get_public_profiles', { profile_user_ids: tenantIds });

      const profilesMap = new Map((profiles || []).map(p => [p.user_id, p]));

      const contractsWithTenants = (data || []).map(contract => ({
        ...contract,
        end_date: (contract as any).end_at || (contract as any).end_date,
        properties: contract.properties as Contract['properties'],
        tenant_profile: profilesMap.get(contract.tenant_id) || null
      })) as Contract[];

      setContracts(contractsWithTenants);

      // Calculate stats
      const newStats: Stats = { total: contractsWithTenants.length, brouillon: 0, en_attente_signature: 0, partiellement_signe: 0, actif: 0, expire: 0, resilie: 0 };
      contractsWithTenants.forEach(c => {
        const status = c.status as keyof Stats;
        if (status in newStats && status !== 'total') {
          newStats[status]++;
        }
      });
      setStats(newStats);

    } catch (error) {
      console.error('Error loading contracts:', error);
      toast.error('Erreur lors du chargement des contrats');
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesFilter = filter === 'all' || contract.status === filter;
      const matchesSearch = searchQuery === '' || 
        contract.contract_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.tenant_profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.properties.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [contracts, filter, searchQuery]);

  const handleDownload = async (contract: Contract) => {
    if (!contract.document_url) {
      toast.error('Aucun document disponible');
      return;
    }
    setActionLoading(contract.id);
    try {
      await downloadContract(contract.document_url, `contrat-${contract.contract_number}.pdf`);
      toast.success('Téléchargement démarré');
    } catch {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRegenerate = async (contractId: string) => {
    setActionLoading(contractId);
    try {
      await regenerateContract(contractId);
      toast.success('PDF régénéré avec succès');
      loadContracts();
    } catch {
      toast.error('Erreur lors de la régénération');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (contract: Contract) => {
    if (contract.status !== 'brouillon') {
      toast.error('Seuls les brouillons peuvent être supprimés');
      return;
    }
    
    if (!confirm(`Supprimer le contrat ${contract.contract_number} ?`)) return;
    
    setActionLoading(contract.id);
    try {
      await deleteContract(contract.id);
      toast.success('Contrat supprimé');
      loadContracts();
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendReminder = async (contract: Contract) => {
    setActionLoading(contract.id);
    try {
      await sendSignatureReminder(contract.id, contract.tenant_id);
      toast.success('Rappel envoyé au locataire');
    } catch {
      toast.error('Erreur lors de l\'envoi du rappel');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: FileText };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!user) {
    return (
      <OwnerDashboardLayout title="Mes contrats">
        <div className="min-h-[60vh] bg-background flex items-center justify-center rounded-2xl">Veuillez vous connecter</div>
      </OwnerDashboardLayout>
    );
  }

  if (loading) {
    return (
      <OwnerDashboardLayout title="Mes contrats">
        <div className="min-h-[60vh] bg-background flex items-center justify-center rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </OwnerDashboardLayout>
    );
  }

  return (
    <OwnerDashboardLayout title="Mes contrats">
      {/* Header */}
      <div className="bg-[#2C1810]">
      <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-10 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                <FileText className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Mes Contrats</h1>
                <p className="text-[#E8D4C5] mt-1">Gérez tous vos baux de location</p>
              </div>
            </div>
            <Link
              to="/dashboard/creer-contrat"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Créer un contrat</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-10 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Brouillons</p>
            <p className="text-2xl font-bold text-gray-600">{stats.brouillon}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">En attente</p>
            <p className="text-2xl font-bold text-amber-600">{stats.en_attente_signature}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Actifs</p>
            <p className="text-2xl font-bold text-green-600">{stats.actif}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Expirés</p>
            <p className="text-2xl font-bold text-red-600">{stats.expire}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Résiliés</p>
            <p className="text-2xl font-bold text-red-600">{stats.resilie}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl p-4 border border-border mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filters */}
            <div className="flex flex-wrap gap-2 flex-1">
              {FILTER_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {/* Search */}
            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Contracts List */}
        {filteredContracts.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Aucun contrat</h3>
            <p className="text-muted-foreground mb-4">
              {filter !== 'all' ? 'Aucun contrat ne correspond à ce filtre' : 'Créez votre premier contrat de bail'}
            </p>
            <Link 
              to="/dashboard/creer-contrat"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-colors inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Créer un contrat
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContracts.map(contract => {
              const statusConfig = getStatusConfig(contract.status);
              const StatusIcon = statusConfig.icon;
              const isLoading = actionLoading === contract.id;

              return (
                <div 
                  key={contract.id}
                  className="bg-card rounded-2xl border border-border p-4 sm:p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Property Image */}
                    <div className="w-full sm:w-24 h-32 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                      {contract.properties.main_image ? (
                        <img 
                          src={contract.properties.main_image} 
                          alt={contract.properties.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Contract Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-muted-foreground">{contract.contract_number}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-foreground truncate">{contract.properties.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Locataire: {contract.tenant_profile?.full_name || 'Non renseigné'}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                        <span className="text-primary font-bold">{contract.monthly_rent.toLocaleString()} FCFA/mois</span>
                        <span className="text-muted-foreground">
                          {formatDate(contract.start_date)} → {formatDate(contract.end_date)}
                        </span>
                      </div>

                      {/* Signatures Status */}
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <span className={`flex items-center gap-1 ${contract.landlord_signed_at ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {contract.landlord_signed_at ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          Propriétaire
                        </span>
                        <span className={`flex items-center gap-1 ${contract.tenant_signed_at ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {contract.tenant_signed_at ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          Locataire
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/contrat/${contract.id}`)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-medium text-foreground transition-colors flex items-center justify-center gap-2"
                        disabled={isLoading}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sm:hidden">Voir</span>
                      </button>
                      
                      {contract.document_url && (
                        <button
                          onClick={() => handleDownload(contract)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-xl text-sm font-medium text-primary transition-colors flex items-center justify-center gap-2"
                          disabled={isLoading}
                        >
                          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          <span className="sm:hidden">PDF</span>
                        </button>
                      )}
                      
                      {contract.status === 'brouillon' && (
                        <>
                          <button
                            onClick={() => handleRegenerate(contract.id)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-xl text-sm font-medium text-blue-700 transition-colors flex items-center justify-center gap-2"
                            disabled={isLoading}
                          >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleDelete(contract)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-red-100 hover:bg-red-200 rounded-xl text-sm font-medium text-red-700 transition-colors flex items-center justify-center gap-2"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      {(contract.status === 'en_attente_signature' || contract.status === 'partiellement_signe') && !contract.tenant_signed_at && (
                        <button
                          onClick={() => handleSendReminder(contract)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-amber-100 hover:bg-amber-200 rounded-xl text-sm font-medium text-amber-700 transition-colors flex items-center justify-center gap-2"
                          disabled={isLoading}
                        >
                          <Bell className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </OwnerDashboardLayout>
  );
}
