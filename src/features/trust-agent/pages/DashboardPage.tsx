import { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  MessageSquare, 
  FileText,
  AlertTriangle,
  Star,
  Activity,
  Send,
  Eye,
  Search,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings
} from 'lucide-react';
// Trust validation service available if needed
// import { trustValidationService } from '@/services/trustValidationService';
import { useAuth } from '@/app/providers/AuthProvider';

interface MediationStats {
  activeDisputes: number;
  resolvedDisputes: number;
  avgResolutionTime: number;
  satisfactionScore: number;
  pendingValidations: number;
  underReview: number;
  escalationRate: number;
  successRate: number;
}

interface Dispute {
  id: string;
  dispute_number: string;
  description: string;
  status: 'assigned' | 'under_mediation' | 'awaiting_response' | 'resolved' | 'escalated';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  amount_disputed: number;
  opened_at: string;
  mediation_stage: 'initial' | 'negotiation' | 'proposal' | 'agreement' | 'closure';
  parties: {
    opener: { first_name: string; last_name: string; role: string };
    opponent: { first_name: string; last_name: string; role: string };
  };
  property: { title: string; address: string };
}

interface ValidationRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  requested_at: string;
  urgency: 'normal' | 'high';
  profile: {
    first_name: string;
    last_name: string;
    email: string;
    tenant_score?: number;
    ansut_verified: boolean;
  };
}

export default function TrustAgentMediationDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<MediationStats>({
    activeDisputes: 0,
    resolvedDisputes: 0,
    avgResolutionTime: 0,
    satisfactionScore: 0,
    pendingValidations: 0,
    underReview: 0,
    escalationRate: 0,
    successRate: 0
  });
  
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [validations, setValidations] = useState<ValidationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [disputeFilter, setDisputeFilter] = useState<'all' | 'assigned' | 'under_mediation' | 'urgent'>('assigned');
  const [validationFilter, _setValidationFilter] = useState<'all' | 'pending' | 'high'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (profile && (profile.available_roles?.includes('trust_agent') || profile.active_role === 'trust_agent')) {
      loadDashboardData();
    }
  }, [profile, disputeFilter, validationFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMediationStats(),
        loadDisputes(),
        loadValidationRequests()
      ]);
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMediationStats = async () => {
    // Simulation des données de médiation
    setStats({
      activeDisputes: 23,
      resolvedDisputes: 147,
      avgResolutionTime: 4.2,
      satisfactionScore: 4.7,
      pendingValidations: 8,
      underReview: 3,
      escalationRate: 12,
      successRate: 87
    });
  };

  const loadDisputes = async () => {
    // Simulation des données de litiges
    const mockDisputes: Dispute[] = [
      {
        id: '1',
        dispute_number: 'LIT-2025-001',
        description: 'Litige concernant la restitution du dépôt de garantie - Propriétaire refuse de restituer',
        status: 'under_mediation',
        urgency: 'high',
        amount_disputed: 300000,
        opened_at: '2025-11-28T10:00:00Z',
        mediation_stage: 'negotiation',
        parties: {
          opener: { first_name: 'Jean', last_name: 'Kouassi', role: 'locataire' },
          opponent: { first_name: 'Marie', last_name: 'Bamba', role: 'propriétaire' }
        },
        property: { title: 'Appartement Cocody', address: 'Cocody, Abidjan' }
      },
      {
        id: '2',
        dispute_number: 'LIT-2025-002',
        description: 'Réparations non effectuées par le propriétaire avant l\'entrée dans les lieux',
        status: 'assigned',
        urgency: 'urgent',
        amount_disputed: 0,
        opened_at: '2025-11-29T14:30:00Z',
        mediation_stage: 'initial',
        parties: {
          opener: { first_name: 'Paul', last_name: 'Ouattara', role: 'locataire' },
          opponent: { first_name: 'Sophie', last_name: 'Traore', role: 'propriétaire' }
        },
        property: { title: 'Studio Plateau', address: 'Plateau, Abidjan' }
      },
      {
        id: '3',
        dispute_number: 'LIT-2025-003',
        description: 'Augmentation de loyer non notifiée selon la réglementation en vigueur',
        status: 'resolved',
        urgency: 'medium',
        amount_disputed: 150000,
        opened_at: '2025-11-25T09:15:00Z',
        mediation_stage: 'closure',
        parties: {
          opener: { first_name: 'Aminata', last_name: 'Diallo', role: 'locataire' },
          opponent: { first_name: 'Ibrahim', last_name: 'Koné', role: 'propriétaire' }
        },
        property: { title: 'Villa Yopougon', address: 'Yopougon, Abidjan' }
      }
    ];

    let filteredDisputes = mockDisputes;
    
    if (disputeFilter !== 'all') {
      if (disputeFilter === 'urgent') {
        filteredDisputes = mockDisputes.filter(d => d.urgency === 'urgent');
      } else {
        filteredDisputes = mockDisputes.filter(d => d.status === disputeFilter);
      }
    }

    setDisputes(filteredDisputes);
  };

  const loadValidationRequests = async () => {
    // Simulation des demandes de validation
    const mockValidations: ValidationRequest[] = [
      {
        id: '1',
        user_id: 'user1',
        status: 'pending',
        requested_at: '2025-11-30T08:00:00Z',
        urgency: 'high',
        profile: {
          first_name: 'Fatou',
          last_name: 'Keita',
          email: 'fatou.keita@email.com',
          tenant_score: 720,
          ansut_verified: true
        }
      },
      {
        id: '2',
        user_id: 'user2',
        status: 'pending',
        requested_at: '2025-11-29T16:45:00Z',
        urgency: 'normal',
        profile: {
          first_name: 'Mamadou',
          last_name: 'Toure',
          email: 'mamadou.toure@email.com',
          tenant_score: 650,
          ansut_verified: false
        }
      },
      {
        id: '3',
        user_id: 'user3',
        status: 'under_review',
        requested_at: '2025-11-28T11:20:00Z',
        urgency: 'high',
        profile: {
          first_name: 'Aicha',
          last_name: 'Bamba',
          email: 'aicha.bamba@email.com',
          tenant_score: 580,
          ansut_verified: true
        }
      }
    ];

    let filteredValidations = mockValidations;
    
    if (validationFilter === 'high') {
      filteredValidations = mockValidations.filter(v => v.urgency === 'high');
    } else if (validationFilter === 'pending') {
      filteredValidations = mockValidations.filter(v => v.status === 'pending');
    }

    setValidations(filteredValidations);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_mediation': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'awaiting_response': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'escalated': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Il y a moins d\'1h';
    if (diffHours === 1) return 'Il y a 1h';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  const filteredDisputes = disputes.filter(dispute => 
    dispute.dispute_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispute.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispute.property.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredValidations = validations.filter(validation =>
    validation.profile.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    validation.profile.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    validation.profile.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!profile || (!profile.available_roles?.includes('trust_agent') && profile.active_role !== 'trust_agent')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès réservé</h2>
          <p className="text-gray-600">
            Cette page est réservée aux agents Tiers de Confiance spécialisés en médiation.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard de médiation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Agent de Confiance */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Dashboard Médiation & Confiance
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <span>Agent tiers de confiance certifié</span>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-green-700 font-medium">En ligne</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name || 'Agent'}
                </p>
                <p className="text-xs text-gray-600">Agent Certifié Niv. 3</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8 space-y-8">
        {/* Stats Grid - 4 cartes principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Activity}
            label="Litiges en cours"
            value={stats.activeDisputes}
            change="+12%"
            trend="up"
            color="blue"
            subtitle="3 urgents"
            badge="high"
          />
          <StatCard
            icon={CheckCircle}
            label="Litiges résolus"
            value={stats.resolvedDisputes}
            change="+8%"
            trend="up"
            color="green"
            subtitle="Ce mois"
          />
          <StatCard
            icon={Clock}
            label="Temps moyen"
            value={`${stats.avgResolutionTime}j`}
            change="-0.3j"
            trend="down"
            color="orange"
            subtitle="Résolution"
          />
          <StatCard
            icon={Star}
            label="Satisfaction"
            value={`${stats.satisfactionScore}/5`}
            change="+0.2"
            trend="up"
            color="purple"
            subtitle="Note moyenne"
          />
        </div>

        {/* Workflow Cards de Médiation */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Workflow de Médiation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <WorkflowCard
              stage="Réception"
              count={5}
              color="blue"
              description="Nouveaux litiges reçus"
            />
            <WorkflowCard
              stage="Analyse"
              count={8}
              color="yellow"
              description="En cours d'analyse"
            />
            <WorkflowCard
              stage="Négociation"
              count={6}
              color="orange"
              description="Discussions en cours"
            />
            <WorkflowCard
              stage="Proposition"
              count={4}
              color="purple"
              description="Propositions envoyées"
            />
            <WorkflowCard
              stage="Résolution"
              count={12}
              color="green"
              description="Accords trouvés"
            />
          </div>
        </div>

        {/* Section principale avec disputes et validations */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Gestion des Litiges */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Gestion des Litiges
                  </h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nouveau Litige
                  </button>
                </div>
                
                {/* Filtres et recherche */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-2">
                    <FilterButton
                      label="Tous"
                      active={disputeFilter === 'all'}
                      onClick={() => setDisputeFilter('all')}
                    />
                    <FilterButton
                      label="Assignés"
                      active={disputeFilter === 'assigned'}
                      onClick={() => setDisputeFilter('assigned')}
                    />
                    <FilterButton
                      label="En médiation"
                      active={disputeFilter === 'under_mediation'}
                      onClick={() => setDisputeFilter('under_mediation')}
                    />
                    <FilterButton
                      label="Urgents"
                      active={disputeFilter === 'urgent'}
                      onClick={() => setDisputeFilter('urgent')}
                    />
                  </div>
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Rechercher un litige..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Litige</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Parties</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Montant</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDisputes.map((dispute) => (
                      <DisputeTableRow
                        key={dispute.id}
                        dispute={dispute}
                        getStatusColor={getStatusColor}
                        getUrgencyColor={getUrgencyColor}
                        formatTimeAgo={formatTimeAgo}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredDisputes.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun litige trouvé</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Validations et Analytics */}
          <div className="space-y-6">
            {/* Demandes de Validation */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                Validations en Attente
              </h3>
              <div className="space-y-4">
                {filteredValidations.slice(0, 3).map((validation) => (
                  <ValidationCard
                    key={validation.id}
                    validation={validation}
                    getStatusColor={getStatusColor}
                    formatTimeAgo={formatTimeAgo}
                  />
                ))}
                {filteredValidations.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucune validation en attente
                  </p>
                )}
              </div>
              <button className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                Voir toutes les validations →
              </button>
            </div>

            {/* Chart Analytics de Médiation */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Analytics Médiation
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="#e5e7eb"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="#3b82f6"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - stats.successRate / 100)}`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">{stats.successRate}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Taux de résolution</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Temps moyen</span>
                    <span className="font-medium">{stats.avgResolutionTime} jours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Escalades</span>
                    <span className="font-medium">{stats.escalationRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Satisfaction</span>
                    <span className="font-medium">{stats.satisfactionScore}/5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Rapides */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <QuickActionButton
                  icon={Send}
                  label="Envoyer proposition"
                  color="blue"
                  count={4}
                />
                <QuickActionButton
                  icon={MessageSquare}
                  label="Contacter parties"
                  color="green"
                  count={7}
                />
                <QuickActionButton
                  icon={AlertTriangle}
                  label="Escalader litige"
                  color="red"
                  count={2}
                />
                <QuickActionButton
                  icon={CheckCircle}
                  label="Marquer résolu"
                  color="purple"
                  count={5}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composants réutilisables
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  trend, 
  color, 
  subtitle, 
  badge 
}: {
  icon: any;
  label: string;
  value: number | string;
  change?: string;
  trend?: 'up' | 'down';
  color: 'blue' | 'green' | 'orange' | 'purple';
  subtitle?: string;
  badge?: string;
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600'
  };

  const trendIcons: Record<string, any> = {
    up: ArrowUpRight,
    down: ArrowDownRight
  };

  const TrendIcon = trend ? trendIcons[trend] : null;
  const colorClass = colors[color as keyof typeof colors];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-full`}></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <Icon className={`w-8 h-8 bg-gradient-to-r ${colorClass} text-white p-1.5 rounded-lg`} />
          {badge && (
            <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600 mb-2">{label}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
        {change && TrendIcon && (
          <div className={`flex items-center gap-1 text-sm mt-2 ${trendColors[trend as keyof typeof trendColors]}`}>
            <TrendIcon className="w-4 h-4" />
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkflowCard({ stage, count, color, description }: {
  stage: string;
  count: number;
  color: string;
  description: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    green: 'bg-green-50 border-green-200 text-green-800'
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color as keyof typeof colorClasses]} text-center`}>
      <p className="text-sm font-medium mb-1">{stage}</p>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs opacity-75">{description}</p>
    </div>
  );
}

function DisputeTableRow({ dispute, getStatusColor, getUrgencyColor, formatTimeAgo }: {
  dispute: Dispute;
  getStatusColor: (status: string) => string;
  getUrgencyColor: (urgency: string) => string;
  formatTimeAgo: (date: string) => string;
}) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="py-4 px-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{dispute.dispute_number}</span>
            <div className={`w-2 h-2 rounded-full ${getUrgencyColor(dispute.urgency)}`}></div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{dispute.description}</p>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="text-sm">
          <p className="font-medium text-gray-900">
            {dispute.parties.opener.first_name} {dispute.parties.opener.last_name}
          </p>
          <p className="text-gray-600">vs</p>
          <p className="font-medium text-gray-900">
            {dispute.parties.opponent.first_name} {dispute.parties.opponent.last_name}
          </p>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(dispute.status)}`}>
          {dispute.status.replace('_', ' ')}
        </span>
      </td>
      <td className="py-4 px-6">
        {dispute.amount_disputed > 0 ? (
          <span className="text-sm font-medium text-gray-900">
            {new Intl.NumberFormat('fr-FR').format(dispute.amount_disputed)} FCFA
          </span>
        ) : (
          <span className="text-sm text-gray-500">N/A</span>
        )}
      </td>
      <td className="py-4 px-6">
        <span className="text-sm text-gray-600">{formatTimeAgo(dispute.opened_at)}</span>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          <button className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded">
            <MessageSquare className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ValidationCard({ validation, getStatusColor, formatTimeAgo }: {
  validation: ValidationRequest;
  getStatusColor: (status: string) => string;
  formatTimeAgo: (date: string) => string;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900">
            {validation.profile.first_name} {validation.profile.last_name}
          </p>
          <p className="text-sm text-gray-600">{validation.profile.email}</p>
        </div>
        {validation.urgency === 'high' && (
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            Urgent
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(validation.status)}`}>
          {validation.status.replace('_', ' ')}
        </span>
        <span className="text-xs text-gray-500">{formatTimeAgo(validation.requested_at)}</span>
      </div>
      {validation.profile.tenant_score && (
        <div className="mt-2 text-xs text-gray-600">
          Score ANSUT: {validation.profile.tenant_score}/850
        </div>
      )}
    </div>
  );
}

function FilterButton({ label, active, onClick }: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

function QuickActionButton({ icon: Icon, label, color, count }: {
  icon: any;
  label: string;
  color: 'blue' | 'green' | 'red' | 'purple';
  count?: number;
}) {
  const colorClasses = {
    blue: 'text-blue-600 hover:bg-blue-50',
    green: 'text-green-600 hover:bg-green-50',
    red: 'text-red-600 hover:bg-red-50',
    purple: 'text-purple-600 hover:bg-purple-50'
  };

  return (
    <button className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${colorClasses[color]}`}>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
      {count && (
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
          {count}
        </span>
      )}
    </button>
  );
}