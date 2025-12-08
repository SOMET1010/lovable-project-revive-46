import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, Search, Building, CheckCircle, Clock, 
  XCircle, Calendar, Eye, Phone, MessageSquare, ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { toast } from '@/shared/hooks/useSafeToast';
import ScheduleMaintenanceModal from '../components/ScheduleMaintenanceModal';
import RejectMaintenanceModal from '../components/RejectMaintenanceModal';

interface MaintenanceRequest {
  id: string;
  issue_type: string;
  description: string | null;
  priority: string | null;
  urgency: string | null;
  status: string | null;
  images: string[] | null;
  scheduled_date: string | null;
  resolved_at: string | null;
  rejection_reason: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  created_at: string | null;
  property_id: string | null;
  tenant_id: string;
  property: {
    id: string;
    title: string;
    city: string;
    main_image: string | null;
  } | null;
  tenant_profile: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

interface Stats {
  total: number;
  ouverte: number;
  acceptee: number;
  en_cours: number;
  planifiee: number;
  resolue: number;
  refusee: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Wrench }> = {
  ouverte: { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: Clock },
  acceptee: { label: 'Acceptée', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  en_cours: { label: 'En cours', color: 'bg-purple-100 text-purple-700', icon: Wrench },
  planifiee: { label: 'Planifiée', color: 'bg-indigo-100 text-indigo-700', icon: Calendar },
  resolue: { label: 'Résolue', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  refusee: { label: 'Refusée', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const URGENCY_CONFIG: Record<string, { label: string; color: string }> = {
  emergency: { label: '🔴 URGENT', color: 'text-red-600 font-bold' },
  high: { label: '🟠 Haute', color: 'text-orange-600' },
  normal: { label: '🟡 Normale', color: 'text-amber-600' },
  normale: { label: '🟡 Normale', color: 'text-amber-600' },
  low: { label: '🟢 Basse', color: 'text-green-600' },
};

const ISSUE_TYPE_LABELS: Record<string, string> = {
  plomberie: '🔧 Plomberie',
  electricite: '⚡ Électricité',
  chauffage: '🔥 Chauffage/Climatisation',
  serrurerie: '🔐 Serrurerie',
  peinture: '🎨 Peinture',
  menuiserie: '🪵 Menuiserie',
  autre: '📦 Autre',
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'Toutes' },
  { value: 'ouverte', label: 'En attente' },
  { value: 'acceptee', label: 'Acceptées' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'planifiee', label: 'Planifiées' },
  { value: 'resolue', label: 'Résolues' },
  { value: 'refusee', label: 'Refusées' },
];

export default function OwnerMaintenancePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, ouverte: 0, acceptee: 0, en_cours: 0, planifiee: 0, resolue: 0, refusee: 0 });
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;
    
    try {
      // First get owner's properties
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', user.id);

      if (propError) throw propError;

      const propertyIds = (properties || []).map(p => p.id);
      
      if (propertyIds.length === 0) {
        setRequests([]);
        setStats({ total: 0, ouverte: 0, acceptee: 0, en_cours: 0, planifiee: 0, resolue: 0, refusee: 0 });
        setLoading(false);
        return;
      }

      // Get maintenance requests for owner's properties
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          issue_type,
          description,
          priority,
          urgency,
          status,
          images,
          scheduled_date,
          resolved_at,
          rejection_reason,
          estimated_cost,
          actual_cost,
          created_at,
          property_id,
          tenant_id,
          properties!maintenance_requests_property_id_fkey (
            id,
            title,
            city,
            main_image
          )
        `)
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch tenant profiles
      const tenantIds = [...new Set((data || []).map(r => r.tenant_id))];
      const { data: profiles } = await supabase
        .rpc('get_public_profiles', { profile_user_ids: tenantIds });

      const profilesMap = new Map((profiles || []).map(p => [p.user_id, p]));

      const requestsWithTenants = (data || []).map(request => ({
        ...request,
        property: request.properties as MaintenanceRequest['property'],
        tenant_profile: profilesMap.get(request.tenant_id) || null
      })) as MaintenanceRequest[];

      setRequests(requestsWithTenants);

      // Calculate stats
      const newStats: Stats = { total: requestsWithTenants.length, ouverte: 0, acceptee: 0, en_cours: 0, planifiee: 0, resolue: 0, refusee: 0 };
      requestsWithTenants.forEach(r => {
        const status = r.status as keyof Stats;
        if (status in newStats && status !== 'total') {
          newStats[status]++;
        }
      });
      setStats(newStats);

    } catch (error) {
      console.error('Error loading maintenance requests:', error);
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesFilter = filter === 'all' || request.status === filter;
      const matchesSearch = searchQuery === '' || 
        request.issue_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.property?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.tenant_profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [requests, filter, searchQuery]);

  const updateStatus = async (requestId: string, newStatus: string, additionalFields: Record<string, unknown> = {}) => {
    setActionLoading(requestId);
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          status: newStatus,
          ...additionalFields
        })
        .eq('id', requestId);

      if (error) throw error;
      
      toast.success('Statut mis à jour');
      loadRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = (request: MaintenanceRequest) => {
    updateStatus(request.id, 'acceptee');
  };

  const handleResolve = (request: MaintenanceRequest) => {
    updateStatus(request.id, 'resolue', { resolved_at: new Date().toISOString() });
  };

  const handleSchedule = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setScheduleModalOpen(true);
  };

  const handleReject = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };

  const onScheduleConfirm = async (scheduledDate: string, estimatedCost?: number) => {
    if (!selectedRequest) return;
    
    await updateStatus(selectedRequest.id, 'planifiee', { 
      scheduled_date: scheduledDate,
      ...(estimatedCost !== undefined && { estimated_cost: estimatedCost })
    });
    setScheduleModalOpen(false);
    setSelectedRequest(null);
  };

  const onRejectConfirm = async (reason: string) => {
    if (!selectedRequest) return;
    
    await updateStatus(selectedRequest.id, 'refusee', { rejection_reason: reason });
    setRejectModalOpen(false);
    setSelectedRequest(null);
  };

  const getStatusConfig = (status: string | null) => {
    return STATUS_CONFIG[status || ''] || { label: status || 'Inconnu', color: 'bg-gray-100 text-gray-700', icon: Wrench };
  };

  const getUrgencyConfig = (urgency: string | null) => {
    return URGENCY_CONFIG[urgency || 'normale'] || URGENCY_CONFIG['normale'];
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#2C1810]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
              <Wrench className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Demandes de Maintenance</h1>
              <p className="text-[#E8D4C5] mt-1">Gérez les réparations de vos biens</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">En attente</p>
            <p className="text-2xl font-bold text-amber-600">{stats.ouverte}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Acceptées</p>
            <p className="text-2xl font-bold text-blue-600">{stats.acceptee}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">En cours</p>
            <p className="text-2xl font-bold text-purple-600">{stats.en_cours}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Planifiées</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.planifiee}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Résolues</p>
            <p className="text-2xl font-bold text-green-600">{stats.resolue}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Refusées</p>
            <p className="text-2xl font-bold text-red-600">{stats.refusee}</p>
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

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Aucune demande</h3>
            <p className="text-muted-foreground">
              {filter !== 'all' ? 'Aucune demande ne correspond à ce filtre' : 'Aucune demande de maintenance pour vos biens'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(request => {
              const statusConfig = getStatusConfig(request.status);
              const StatusIcon = statusConfig.icon;
              const urgencyConfig = getUrgencyConfig(request.urgency);
              const isLoading = actionLoading === request.id;
              const isExpanded = expandedRequest === request.id;

              return (
                <div 
                  key={request.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Property Image */}
                      <div className="w-full sm:w-24 h-32 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                        {request.property?.main_image ? (
                          <img 
                            src={request.property.main_image} 
                            alt={request.property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Request Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-semibold text-foreground">
                            {ISSUE_TYPE_LABELS[request.issue_type] || request.issue_type}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </span>
                          <span className={`text-xs ${urgencyConfig?.color || 'text-amber-600'}`}>
                            {urgencyConfig?.label || '🟡 Normale'}
                          </span>
                        </div>
                        
                        <h3 className="font-medium text-foreground truncate">
                          {request.property?.title || 'Propriété inconnue'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {request.property?.city} • Locataire: {request.tenant_profile?.full_name || 'Non renseigné'}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Créée le {formatDate(request.created_at)}</span>
                          {request.scheduled_date && (
                            <span className="text-indigo-600">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              Prévue le {formatDate(request.scheduled_date)}
                            </span>
                          )}
                          {request.estimated_cost && (
                            <span className="text-primary font-medium">
                              Estimation: {request.estimated_cost.toLocaleString()} FCFA
                            </span>
                          )}
                        </div>

                        {/* Problem Images */}
                        {request.images && request.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {request.images.slice(0, 4).map((img, idx) => (
                              <a 
                                key={idx}
                                href={img}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border hover:border-primary transition-colors"
                              >
                                <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                              </a>
                            ))}
                            {request.images.length > 4 && (
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                +{request.images.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => setExpandedRequest(isExpanded ? null : request.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-medium text-foreground transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        
                        {request.status === 'ouverte' && (
                          <>
                            <button
                              onClick={() => handleAccept(request)}
                              className="flex-1 sm:flex-none px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-xl text-sm font-medium text-blue-700 transition-colors flex items-center justify-center gap-2"
                              disabled={isLoading}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="hidden sm:inline">Accepter</span>
                            </button>
                            <button
                              onClick={() => handleReject(request)}
                              className="flex-1 sm:flex-none px-4 py-2 bg-red-100 hover:bg-red-200 rounded-xl text-sm font-medium text-red-700 transition-colors flex items-center justify-center gap-2"
                              disabled={isLoading}
                            >
                              <XCircle className="h-4 w-4" />
                              <span className="hidden sm:inline">Refuser</span>
                            </button>
                          </>
                        )}
                        
                        {(request.status === 'acceptee' || request.status === 'en_cours') && (
                          <>
                            <button
                              onClick={() => handleSchedule(request)}
                              className="flex-1 sm:flex-none px-4 py-2 bg-indigo-100 hover:bg-indigo-200 rounded-xl text-sm font-medium text-indigo-700 transition-colors flex items-center justify-center gap-2"
                              disabled={isLoading}
                            >
                              <Calendar className="h-4 w-4" />
                              <span className="hidden sm:inline">Planifier</span>
                            </button>
                            <button
                              onClick={() => handleResolve(request)}
                              className="flex-1 sm:flex-none px-4 py-2 bg-green-100 hover:bg-green-200 rounded-xl text-sm font-medium text-green-700 transition-colors flex items-center justify-center gap-2"
                              disabled={isLoading}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="hidden sm:inline">Résolu</span>
                            </button>
                          </>
                        )}
                        
                        {request.status === 'planifiee' && (
                          <button
                            onClick={() => handleResolve(request)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-green-100 hover:bg-green-200 rounded-xl text-sm font-medium text-green-700 transition-colors flex items-center justify-center gap-2"
                            disabled={isLoading}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Marquer résolu</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/50 p-4 sm:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Description du problème</h4>
                          <p className="text-muted-foreground text-sm">
                            {request.description || 'Aucune description fournie'}
                          </p>
                          
                          {request.rejection_reason && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                              <p className="text-sm font-medium text-red-700">Raison du refus:</p>
                              <p className="text-sm text-red-600">{request.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Contact locataire</h4>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {request.tenant_profile?.full_name || 'Nom non renseigné'}
                            </p>
                            {request.tenant_profile?.phone && (
                              <a 
                                href={`tel:${request.tenant_profile.phone}`}
                                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                              >
                                <Phone className="h-4 w-4" />
                                {request.tenant_profile.phone}
                              </a>
                            )}
                            <Link
                              to={`/messages?to=${request.tenant_id}`}
                              className="inline-flex items-center gap-2 text-sm text-primary hover:underline ml-4"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Envoyer un message
                            </Link>
                          </div>
                          
                          {request.actual_cost !== null && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-foreground">Coût final:</p>
                              <p className="text-lg font-bold text-primary">{request.actual_cost.toLocaleString()} FCFA</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <ScheduleMaintenanceModal
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false);
          setSelectedRequest(null);
        }}
        onConfirm={onScheduleConfirm}
        loading={actionLoading !== null}
      />
      
      <RejectMaintenanceModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedRequest(null);
        }}
        onConfirm={onRejectConfirm}
        loading={actionLoading !== null}
      />
    </div>
  );
}
