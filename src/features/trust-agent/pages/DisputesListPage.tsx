import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { 
  Search, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  ArrowUpCircle,
  MessageSquare,
  ChevronRight,
  Users,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Dispute {
  id: string;
  dispute_number: string;
  category: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  complainant_id: string;
  respondent_id: string;
  assigned_agent_id: string | null;
}

interface DisputeStats {
  total: number;
  open: number;
  under_review: number;
  mediation: number;
  resolved: number;
  escalated: number;
  avg_resolution_days: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: 'Ouvert', color: 'bg-blue-100 text-blue-800', icon: Clock },
  under_review: { label: 'En examen', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  mediation: { label: 'En médiation', color: 'bg-orange-100 text-orange-800', icon: MessageSquare },
  resolved: { label: 'Résolu', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  escalated: { label: 'Escaladé', color: 'bg-red-100 text-red-800', icon: ArrowUpCircle },
  closed: { label: 'Fermé', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Basse', color: 'bg-gray-100 text-gray-700' },
  normal: { label: 'Normale', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Haute', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-700' }
};

export default function DisputesListPage() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<DisputeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'assigned' | 'all'>('assigned');

  useEffect(() => {
    if (user) {
      loadDisputes();
      loadStats();
    }
  }, [user, filter, priorityFilter, viewMode]);

  const loadDisputes = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      let query = supabase
        .from('disputes')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (viewMode === 'assigned') {
        query = query.eq('assigned_agent_id', user.id);
      }

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDisputes(data || []);
    } catch (error) {
      console.error('Erreur chargement litiges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await supabase.rpc('get_dispute_stats', { p_user_id: user?.id });
      if (data) {
        setStats(data as unknown as DisputeStats);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const filteredDisputes = disputes.filter(d =>
    d.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.dispute_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2C1810]">Gestion des litiges</h1>
          <p className="text-muted-foreground">
            Tableau de bord de médiation et résolution
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'assigned' ? 'default' : 'outline'}
            onClick={() => setViewMode('assigned')}
            className={viewMode === 'assigned' ? 'bg-[#F16522]' : ''}
          >
            Mes litiges
          </Button>
          <Button
            variant={viewMode === 'all' ? 'default' : 'outline'}
            onClick={() => setViewMode('all')}
            className={viewMode === 'all' ? 'bg-[#F16522]' : ''}
          >
            Tous les litiges
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-[#EFEBE9] p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2C1810]">{stats.open + stats.under_review + stats.mediation}</p>
                <p className="text-sm text-muted-foreground">En cours</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#EFEBE9] p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <MessageSquare className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2C1810]">{stats.mediation}</p>
                <p className="text-sm text-muted-foreground">En médiation</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#EFEBE9] p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <ArrowUpCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2C1810]">{stats.escalated}</p>
                <p className="text-sm text-muted-foreground">Escaladés</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#EFEBE9] p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2C1810]">{Math.round(stats.avg_resolution_days)}j</p>
                <p className="text-sm text-muted-foreground">Délai moyen</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="open">Ouvert</SelectItem>
            <SelectItem value="under_review">En examen</SelectItem>
            <SelectItem value="mediation">En médiation</SelectItem>
            <SelectItem value="escalated">Escaladé</SelectItem>
            <SelectItem value="resolved">Résolu</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Priorité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes priorités</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
            <SelectItem value="high">Haute</SelectItem>
            <SelectItem value="normal">Normale</SelectItem>
            <SelectItem value="low">Basse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Disputes List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#EFEBE9] p-4 animate-pulse">
              <div className="h-5 bg-[#EFEBE9] rounded w-1/4 mb-2" />
              <div className="h-4 bg-[#EFEBE9] rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredDisputes.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#EFEBE9] p-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-[#2C1810] mb-2">Aucun litige</h3>
          <p className="text-muted-foreground">
            {viewMode === 'assigned' ? 'Aucun litige ne vous est assigné' : 'Aucun litige trouvé'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDisputes.map((dispute) => {
            const statusConfig = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.open;
            const priorityConfig = PRIORITY_CONFIG[dispute.priority] || PRIORITY_CONFIG.normal;
            const StatusIcon = statusConfig.icon;

            return (
              <Link
                key={dispute.id}
                to={`/trust-agent/mediation/${dispute.id}`}
                className="block bg-white rounded-xl border border-[#EFEBE9] p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-muted-foreground">
                        {dispute.dispute_number}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                    </div>
                    <h3 className="font-medium text-[#2C1810] truncate">{dispute.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(dispute.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
