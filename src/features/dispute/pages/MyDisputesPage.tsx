import { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  ArrowUpCircle,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Dispute {
  id: string;
  dispute_number: string;
  category: string;
  subject: string;
  status: string | null;
  priority: string | null;
  created_at: string | null;
  resolved_at: string | null;
  complainant_id: string;
  respondent_id: string;
  unread_count?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: 'Ouvert', color: 'bg-blue-100 text-blue-800', icon: Clock },
  under_review: { label: 'En examen', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  mediation: { label: 'En médiation', color: 'bg-orange-100 text-orange-800', icon: MessageSquare },
  resolved: { label: 'Résolu', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  escalated: { label: 'Escaladé', color: 'bg-red-100 text-red-800', icon: ArrowUpCircle },
  closed: { label: 'Fermé', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
};

const CATEGORY_LABELS: Record<string, string> = {
  payment: 'Paiement',
  deposit: 'Caution',
  maintenance: 'Maintenance',
  noise: 'Nuisances',
  damages: 'Dégâts',
  lease_violation: 'Violation bail',
  other: 'Autre'
};

export default function MyDisputesPage() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadDisputes();
    }
  }, [user, filter]);

  const loadDisputes = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      let query = supabase
        .from('disputes')
        .select('*')
        .or(`complainant_id.eq.${user.id},respondent_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map data with proper types
      const mappedDisputes: Dispute[] = (data || []).map(d => ({
        id: d.id,
        dispute_number: d.dispute_number,
        category: d.category,
        subject: d.subject,
        status: d.status,
        priority: d.priority,
        created_at: d.created_at,
        resolved_at: d.resolved_at,
        complainant_id: d.complainant_id,
        respondent_id: d.respondent_id
      }));
      
      setDisputes(mappedDisputes);
    } catch (error) {
      console.error('Erreur chargement litiges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDisputes = disputes.filter(d =>
    d.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.dispute_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: disputes.length,
    active: disputes.filter(d => ['open', 'under_review', 'mediation'].includes(d.status || '')).length,
    resolved: disputes.filter(d => d.status === 'resolved').length
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F4]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2C1810]">Mes litiges</h1>
            <p className="text-muted-foreground mt-1">
              Suivez l'état de vos différends et médiations
            </p>
          </div>
          <Link to="/creer-litige">
            <Button className="bg-[#F16522] hover:bg-[#F16522]/90">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau litige
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-[#EFEBE9] p-4 text-center">
            <p className="text-3xl font-bold text-[#2C1810]">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#EFEBE9] p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{stats.active}</p>
            <p className="text-sm text-muted-foreground">En cours</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#EFEBE9] p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-sm text-muted-foreground">Résolus</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro ou sujet..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="open">Ouvert</SelectItem>
              <SelectItem value="under_review">En examen</SelectItem>
              <SelectItem value="mediation">En médiation</SelectItem>
              <SelectItem value="resolved">Résolu</SelectItem>
              <SelectItem value="escalated">Escaladé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Disputes List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#EFEBE9] p-6 animate-pulse">
                <div className="h-6 bg-[#EFEBE9] rounded w-1/3 mb-3" />
                <div className="h-4 bg-[#EFEBE9] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EFEBE9] p-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-[#2C1810] mb-2">Aucun litige</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Aucun résultat pour votre recherche' : 'Vous n\'avez pas encore de litige'}
            </p>
            <Link to="/creer-litige">
              <Button className="bg-[#F16522] hover:bg-[#F16522]/90">
                <Plus className="w-4 h-4 mr-2" />
                Créer un litige
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDisputes.map((dispute) => {
              const statusConfig = STATUS_CONFIG[dispute.status || 'open'] || STATUS_CONFIG.open;
              const StatusIcon = statusConfig.icon;
              const isComplainant = dispute.complainant_id === user?.id;

              return (
                <Link
                  key={dispute.id}
                  to={`/litige/${dispute.id}`}
                  className="block bg-white rounded-2xl border border-[#EFEBE9] p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-muted-foreground">
                          {dispute.dispute_number}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                        {dispute.priority === 'urgent' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Urgent
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-[#2C1810] truncate mb-1">
                        {dispute.subject}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#F16522]" />
                          {CATEGORY_LABELS[dispute.category] || dispute.category}
                        </span>
                        <span>
                          {dispute.created_at && format(new Date(dispute.created_at), 'dd MMM yyyy', { locale: fr })}
                        </span>
                        <span className={isComplainant ? 'text-blue-600' : 'text-orange-600'}>
                          {isComplainant ? 'Plaignant' : 'Mis en cause'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {dispute.unread_count && dispute.unread_count > 0 && (
                        <span className="bg-[#F16522] text-white text-xs rounded-full px-2 py-1">
                          {dispute.unread_count}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}