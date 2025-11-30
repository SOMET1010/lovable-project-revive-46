import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/services/supabase/client';
import {
  Building2, Users, Home, TrendingUp, Coins, UserPlus, Calendar,
  Phone, Mail, CheckCircle, Clock, AlertCircle, XCircle, 
  Target, Award, ArrowUpRight, ArrowDownRight, Menu, X,
  Eye, Filter, Download, Settings, Bell, Search
} from 'lucide-react';
import SimpleBarChart from '@/shared/ui/charts/SimpleBarChart';
import SimpleLineChart from '@/shared/ui/charts/SimpleLineChart';

interface Agency {
  id: string;
  name: string;
  verification_status: string;
  commission_rate: number;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface AgencyStats {
  portfolioProperties: number;
  activeAgents: number;
  totalCommissions: number;
  conversionRate: number;
  monthlyCommissions: number;
  pendingRegistrations: number;
  conversionsThisMonth: number;
  avgDealValue: number;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  status: string;
  commission_rate: number;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
    avatar_url?: string;
  };
}

interface PropertyAssignment {
  id: string;
  property_id: string;
  agent_id: string;
  assigned_at: string;
  status: string;
  properties: {
    title: string;
    price: number;
    status: string;
    type: string;
  };
  profiles: {
    full_name: string;
  };
}

interface Commission {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  agent_id: string;
  transaction_type: string;
  profiles: {
    full_name: string;
  };
}

interface RegistrationRequest {
  id: string;
  agent_name: string;
  agent_email: string;
  agent_phone: string;
  requested_role: string;
  status: string;
  submitted_at: string;
  experience_years?: number;
  certifications?: string[];
}

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // États pour les données
  const [stats, setStats] = useState<AgencyStats>({
    portfolioProperties: 0,
    activeAgents: 0,
    totalCommissions: 0,
    conversionRate: 0,
    monthlyCommissions: 0,
    pendingRegistrations: 0,
    conversionsThisMonth: 0,
    avgDealValue: 0
  });
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [propertyAssignments, setPropertyAssignments] = useState<PropertyAssignment[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  
  // États pour les filtres
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) {
      window.location.href = '/connexion';
      return;
    }
    loadAgencyData();
  }, [user]);

  const loadAgencyData = async () => {
    if (!user) return;

    try {
      // Charger les données de l'agence
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (agencyError) {
        if (agencyError.code === 'PGRST116') {
          window.location.href = '/agence/inscription';
          return;
        }
        throw agencyError;
      }

      setAgency(agencyData);

      // Charger les membres de l'équipe
      const { data: teamData } = await supabase
        .from('agency_team_members')
        .select('*, profiles(full_name, email, phone)')
        .eq('agency_id', agencyData.id)
        .eq('status', 'active');

      // Charger les attributions de propriétés
      const { data: assignmentsData } = await supabase
        .from('property_assignments')
        .select('*, properties(title, price, status, type), profiles(full_name)')
        .eq('agency_id', agencyData.id);

      // Charger les commissions
      const { data: commissionsData } = await supabase
        .from('agency_commissions')
        .select('*, profiles(full_name)')
        .eq('agency_id', agencyData.id)
        .order('created_at', { ascending: false });

      // Charger les demandes d'inscription
      const { data: registrationsData } = await supabase
        .from('agency_registrations')
        .select('*')
        .eq('agency_id', agencyData.id)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      // Calculer les statistiques
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      const monthlyCommissions = (commissionsData || []).filter(c => 
        new Date(c.created_at) >= startOfMonth
      ).reduce((sum, c) => sum + c.amount, 0);

      const conversionsThisMonth = (commissionsData || []).filter(c => 
        new Date(c.created_at) >= startOfMonth
      ).length;

      const avgDealValue = conversionsThisMonth > 0 ? monthlyCommissions / conversionsThisMonth : 0;

      setStats({
        portfolioProperties: (assignmentsData || []).length,
        activeAgents: (teamData || []).length,
        totalCommissions: (commissionsData || []).reduce((sum, c) => sum + c.amount, 0),
        conversionRate: (teamData || []).length > 0 ? (conversionsThisMonth / (teamData || []).length) * 10 : 0,
        monthlyCommissions,
        pendingRegistrations: (registrationsData || []).length,
        conversionsThisMonth,
        avgDealValue
      });

      setTeamMembers(teamData || []);
      setPropertyAssignments(assignmentsData || []);
      setCommissions(commissionsData || []);
      setRegistrationRequests(registrationsData || []);

      // Générer les données de performance
      const performanceChartData = Array.from({ length: 6 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - (5 - i));
        return {
          label: month.toLocaleDateString('fr-FR', { month: 'short' }),
          value: Math.floor(Math.random() * 100) + 20
        };
      });
      setPerformanceData(performanceChartData);

    } catch (err) {
      console.error('Error loading agency data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getLeadStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      nouveau: 'bg-blue-100 text-blue-800',
      contacte: 'bg-purple-100 text-purple-800',
      qualifie: 'bg-indigo-100 text-indigo-800',
      visite_planifiee: 'bg-cyan-100 text-cyan-800',
      offre_envoyee: 'bg-orange-100 text-orange-800',
      negociation: 'bg-yellow-100 text-yellow-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-surface-gradient flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-neutral-500 mx-auto mb-4" />
          <p className="text-xl text-neutral-700">Agence non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-gradient">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et toggle sidebar */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 lg:hidden"
                aria-label="Toggle navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                {agency.logo ? (
                  <img src={agency.logo} alt={agency.name} className="w-8 h-8 rounded-lg" />
                ) : (
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="font-bold text-lg text-neutral-900">{agency.name}</h1>
                  <p className="text-xs text-neutral-500">Dashboard d'agence</p>
                </div>
              </div>
            </div>

            {/* Navigation principale */}
            <nav className="hidden lg:flex space-x-6">
              <a href="/agence/dashboard" className="text-primary-600 font-medium border-b-2 border-primary-600 pb-1">
                Dashboard
              </a>
              <a href="/agence/equipe" className="text-neutral-700 hover:text-primary-600 transition-colors">
                Équipe
              </a>
              <a href="/agence/proprietes" className="text-neutral-700 hover:text-primary-600 transition-colors">
                Propriétés
              </a>
              <a href="/agence/commissions" className="text-neutral-700 hover:text-primary-600 transition-colors">
                Commissions
              </a>
            </nav>

            {/* Actions header */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg relative" aria-label="Notifications">
                <Bell className="w-5 h-5" />
                {stats.pendingRegistrations > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {stats.pendingRegistrations}
                  </span>
                )}
              </button>
              <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg" aria-label="Settings">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full pt-16 lg:pt-0">
          <div className="flex-1 px-4 py-6 space-y-2">
            <a href="/agence/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary-50 text-primary-700">
              <Building2 className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </a>
            <a href="/agence/equipe" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50">
              <Users className="w-5 h-5" />
              <span>Gestion équipe</span>
            </a>
            <a href="/agence/proprietes" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50">
              <Home className="w-5 h-5" />
              <span>Propriétés</span>
            </a>
            <a href="/agence/commissions" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50">
              <Coins className="w-5 h-5" />
              <span>Commissions</span>
            </a>
            <a href="/agence/inscriptions" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50">
              <UserPlus className="w-5 h-5" />
              <span>Demandes</span>
            </a>
          </div>
        </div>
      </div>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Contenu principal */}
      <main className="lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header de section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900">Tableau de bord</h2>
                <p className="text-neutral-600 mt-1">Vue d'ensemble de votre agence</p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="quarter">Ce trimestre</option>
                  <option value="year">Cette année</option>
                </select>
                <button className="btn-secondary flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Exporter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid - 4 cartes principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Propriétés Portefeuille */}
            <div className="card-scrapbook p-6 group hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">+12%</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-neutral-900 mb-1">
                  {stats.portfolioProperties.toLocaleString()}
                </p>
                <p className="text-sm text-neutral-600 mb-3">Propriétés au portefeuille</p>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Actives: {(stats.portfolioProperties * 0.8).toFixed(0)}</span>
                  <span>En vente: {(stats.portfolioProperties * 0.6).toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Équipes */}
            <div className="card-scrapbook p-6 group hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">+{Math.max(0, 3 - (stats.pendingRegistrations || 0))}</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-neutral-900 mb-1">
                  {stats.activeAgents}
                </p>
                <p className="text-sm text-neutral-600 mb-3">Agents actifs</p>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>En attente: {stats.pendingRegistrations}</span>
                  <span>Taux: {((stats.activeAgents / Math.max(1, stats.activeAgents + stats.pendingRegistrations)) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Commissions */}
            <div className="card-scrapbook p-6 group hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Coins className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">+18%</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-neutral-900 mb-1">
                  {(stats.monthlyCommissions / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-neutral-600 mb-3">Commissions ce mois</p>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Moy/agent: {(stats.monthlyCommissions / Math.max(1, stats.activeAgents) / 1000).toFixed(0)}k</span>
                  <span>Total: {(stats.totalCommissions / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>

            {/* Conversions */}
            <div className="card-scrapbook p-6 group hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">+5%</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-neutral-900 mb-1">
                  {stats.conversionRate.toFixed(1)}%
                </p>
                <p className="text-sm text-neutral-600 mb-3">Taux de conversion</p>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Ce mois: {stats.conversionsThisMonth}</span>
                  <span>Valeur moy: {(stats.avgDealValue / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sections principales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Performance Graphique */}
            <div className="lg:col-span-2">
              <div className="card-scrapbook p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-neutral-900">Performance mensuelle</h3>
                  <div className="flex items-center space-x-2 text-sm text-neutral-500">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    <span>Commissions</span>
                  </div>
                </div>
                <SimpleLineChart data={performanceData} height={200} color="#FF6C2F" />
              </div>
            </div>

            {/* Demandes d'inscription */}
            <div className="card-scrapbook p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-neutral-900">Demandes récentes</h3>
                <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                  {stats.pendingRegistrations} en attente
                </span>
              </div>
              <div className="space-y-4">
                {registrationRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-900 truncate">
                        {request.agent_name}
                      </p>
                      <p className="text-xs text-neutral-600 truncate">{request.agent_email}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {new Date(request.submitted_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
                {registrationRequests.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-neutral-600">Aucune demande en attente</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tableau Propriétés avec Attribution Agents */}
          <div className="card-scrapbook p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Propriétés et attributions</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Gestion des propriétés et attribution aux agents
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <button className="btn-secondary flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filtrer</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Propriété</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Agent assigné</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Prix</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Attribuée le</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyAssignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Home className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{assignment.properties.title}</p>
                            <p className="text-sm text-neutral-600">ID: {assignment.property_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-sm">
                              {assignment.profiles.full_name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <span className="text-sm text-neutral-900">{assignment.profiles.full_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-neutral-900">
                          {(assignment.properties.price / 1000000).toFixed(1)}M FCFA
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-1 bg-neutral-100 text-neutral-800 text-xs font-medium rounded-full">
                          {assignment.properties.type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          assignment.properties.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {assignment.properties.status === 'active' ? 'Actif' : 'En attente'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-neutral-600">
                          {new Date(assignment.assigned_at).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-neutral-600 hover:text-primary-600" title="Voir détails">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-neutral-600 hover:text-primary-600" title="Modifier">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {propertyAssignments.length === 0 && (
                <div className="text-center py-12">
                  <Home className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                  <p className="text-xl text-neutral-600 mb-2">Aucune propriété attribuée</p>
                  <p className="text-neutral-500">Commencez par attribuer des propriétés à vos agents</p>
                </div>
              )}
            </div>
          </div>

          {/* Commissions Tracking Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Commissions ce mois */}
            <div className="card-scrapbook p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-neutral-900">
                    {(stats.monthlyCommissions / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-neutral-600">FCFA ce mois</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Progression</span>
                <div className="flex items-center space-x-1 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">+15%</span>
                </div>
              </div>
              <div className="mt-3 bg-orange-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
            </div>

            {/* Performance équipe */}
            <div className="card-scrapbook p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-neutral-900">
                    {(stats.avgDealValue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-neutral-600">Valeur moy. deal</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Meilleur agent:</span>
                  <span className="font-medium text-neutral-900">
                    {teamMembers[0]?.profiles?.full_name?.split(' ')[0] || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Conversions:</span>
                  <span className="font-medium text-neutral-900">{stats.conversionsThisMonth}</span>
                </div>
              </div>
            </div>

            {/* Activité récente */}
            <div className="card-scrapbook p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-neutral-900">
                    {commissions.length}
                  </p>
                  <p className="text-sm text-neutral-600">Transactions</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Cette semaine:</span>
                  <span className="font-medium text-neutral-900">
                    {commissions.filter(c => {
                      const date = new Date(c.created_at);
                      const now = new Date();
                      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                      return date >= weekAgo;
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">En attente:</span>
                  <span className="font-medium text-neutral-900">
                    {commissions.filter(c => c.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Demandes d'inscription */}
          <div className="card-scrapbook p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Demandes d'inscription en attente</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Gestion des nouvelles demandes d'agents
                </p>
              </div>
              <a href="/agence/inscriptions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Voir tout
              </a>
            </div>

            <div className="space-y-4">
              {registrationRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-bold">
                        {request.agent_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{request.agent_name}</p>
                      <div className="flex items-center space-x-4 text-sm text-neutral-600">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{request.agent_email}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{request.agent_phone}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-neutral-500">
                          Rôle: {request.requested_role}
                        </span>
                        {request.experience_years && (
                          <span className="text-xs text-neutral-500">
                            • {request.experience_years} ans d'expérience
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right text-sm">
                      <p className="text-neutral-600">Soumise le</p>
                      <p className="font-medium text-neutral-900">
                        {new Date(request.submitted_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleRegistrationResponse(request.id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Approuver
                      </button>
                      <button 
                        onClick={() => handleRegistrationResponse(request.id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Rejeter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {registrationRequests.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-xl text-neutral-600 mb-2">Aucune demande en attente</p>
                  <p className="text-neutral-500">Toutes les demandes ont été traitées</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  // Fonction pour gérer les réponses aux demandes d'inscription
  async function handleRegistrationResponse(requestId: string, status: 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from('agency_registrations')
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      // Recharger les données
      await loadAgencyData();
      
    } catch (err) {
      console.error('Error updating registration request:', err);
    }
  }
}
