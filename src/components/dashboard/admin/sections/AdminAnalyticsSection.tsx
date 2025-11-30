import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Home, 
  DollarSign,
  Calendar,
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Globe,
  Award,
  Building
} from 'lucide-react';

interface AdminStatsData {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  inactiveUsers: number;
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  suspendedProperties: number;
  totalRevenue: number;
  monthlyGrowth: string;
  commissionRate: number;
  platformHealth: number;
}

interface AdminAnalyticsSectionProps {
  data: AdminStatsData;
}

const AdminAnalyticsSection: React.FC<AdminAnalyticsSectionProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  // Données de croissance mensuelle
  const monthlyGrowth = [
    { month: 'Jan', users: 1845, properties: 1234, revenue: 28500000 },
    { month: 'Fév', users: 1923, properties: 1289, revenue: 32100000 },
    { month: 'Mar', users: 2034, properties: 1356, revenue: 35800000 },
    { month: 'Avr', users: 2145, properties: 1423, revenue: 38900000 },
    { month: 'Mai', users: 2256, properties: 1498, revenue: 41200000 },
    { month: 'Jun', users: 2345, properties: 1567, revenue: 43800000 },
    { month: 'Jul', users: 2398, properties: 1612, revenue: 45200000 },
    { month: 'Aoû', users: 2412, properties: 1634, revenue: 46100000 },
    { month: 'Sep', users: 2428, properties: 1651, revenue: 46700000 },
    { month: 'Oct', users: 2445, properties: 1678, revenue: 47300000 },
    { month: 'Nov', users: 2456, properties: 1692, revenue: 47900000 },
    { month: 'Déc', users: 2489, properties: 1712, revenue: 48500000 }
  ];

  // Revenus par type de propriété
  const revenueByPropertyType = [
    { type: 'Villas', revenue: 18500000, percentage: 42 },
    { type: 'Appartements', revenue: 15200000, percentage: 35 },
    { type: 'Maisons', revenue: 6100000, percentage: 14 },
    { type: 'Bureaux', revenue: 3900000, percentage: 9 }
  ];

  // Performance des agents
  const agentPerformance = [
    { name: 'Jean MUKENDI', properties: 23, rating: 4.8, revenue: 3500000 },
    { name: 'Marie KOUASSI', properties: 45, rating: 4.6, revenue: 5800000 },
    { name: 'Pierre YAO', properties: 18, rating: 4.4, revenue: 2800000 },
    { name: 'Sarah BAMBA', properties: 31, rating: 4.7, revenue: 4200000 },
    { name: 'Ahmed TRAORE', properties: 12, rating: 4.2, revenue: 1900000 }
  ];

  // Statistiques de commissions
  const commissionStats = {
    totalCommission: 12250000,
    averageCommission: 185000,
    topCommissionProperty: 4850000,
    commissionGrowth: '+15.2%'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthIcon = (growth: string) => {
    return growth.startsWith('+') ? 
      <ArrowUp className="w-4 h-4 text-semantic-success" /> : 
      <ArrowDown className="w-4 h-4 text-semantic-error" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Analytics & Métriques
            </h2>
            <p className="text-neutral-700">
              Vue d'ensemble des performances et statistiques de la plateforme ANSUT
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
              <option value="1y">Dernière année</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Utilisateurs */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center text-sm text-semantic-success">
              {getGrowthIcon(data.monthlyGrowth)}
              <span className="ml-1">{data.monthlyGrowth}</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 mb-1">{data.totalUsers}</p>
          <p className="text-sm text-neutral-700">Utilisateurs totaux</p>
          <div className="mt-4 flex justify-between text-xs text-neutral-600">
            <span>Actifs: {data.activeUsers}</span>
            <span>Nouveaux: {data.newUsers}</span>
          </div>
        </div>

        {/* Propriétés */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center text-sm text-semantic-success">
              <ArrowUp className="w-4 h-4 text-semantic-success" />
              <span className="ml-1">+8%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 mb-1">{data.totalProperties}</p>
          <p className="text-sm text-neutral-700">Propriétés totales</p>
          <div className="mt-4 flex justify-between text-xs text-neutral-600">
            <span>Actives: {data.activeProperties}</span>
            <span>En attente: {data.pendingProperties}</span>
          </div>
        </div>

        {/* Revenus */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-semantic-success" />
            </div>
            <div className="flex items-center text-sm text-semantic-success">
              <ArrowUp className="w-4 h-4 text-semantic-success" />
              <span className="ml-1">+12%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 mb-1">
            {(data.totalRevenue / 1000000).toFixed(0)}M
          </p>
          <p className="text-sm text-neutral-700">Revenus totaux (XOF)</p>
          <div className="mt-4 flex justify-between text-xs text-neutral-600">
            <span>Commission: {data.commissionRate}%</span>
            <span>Mensuel</span>
          </div>
        </div>

        {/* Santé de la plateforme */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex items-center text-sm text-semantic-success">
              <Target className="w-4 h-4 text-semantic-success" />
              <span className="ml-1">Excellent</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 mb-1">{data.platformHealth}%</p>
          <p className="text-sm text-neutral-700">Santé de la plateforme</p>
          <div className="mt-4">
            <div className="bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full" 
                style={{ width: `${data.platformHealth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Croissance mensuelle */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">
              Croissance Mensuelle
            </h3>
            <div className="flex items-center space-x-2">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="text-sm border border-neutral-300 rounded-lg px-3 py-1"
              >
                <option value="users">Utilisateurs</option>
                <option value="properties">Propriétés</option>
                <option value="revenue">Revenus</option>
              </select>
              <LineChart className="w-5 h-5 text-neutral-500" />
            </div>
          </div>
          
          <div className="space-y-4">
            {monthlyGrowth.slice(-6).map((month, index) => {
              const value = selectedMetric === 'users' ? month.users :
                           selectedMetric === 'properties' ? month.properties : 
                           month.revenue / 1000000;
              const maxValue = Math.max(...monthlyGrowth.slice(-6).map(m => 
                selectedMetric === 'users' ? m.users :
                selectedMetric === 'properties' ? m.properties : 
                m.revenue / 1000000
              ));
              const percentage = (value / maxValue) * 100;
              
              return (
                <div key={month.month} className="flex items-center">
                  <span className="w-8 text-sm text-neutral-700">{month.month}</span>
                  <div className="flex-1 mx-3">
                    <div className="bg-neutral-200 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-16 text-sm font-medium text-neutral-900 text-right">
                    {selectedMetric === 'revenue' ? `${value.toFixed(1)}M` : value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Répartition des revenus */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">
              Revenus par Type de Propriété
            </h3>
            <PieChart className="w-5 h-5 text-neutral-500" />
          </div>
          
          <div className="space-y-4">
            {revenueByPropertyType.map((item, index) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-purple-500' :
                    index === 2 ? 'bg-green-500' : 'bg-amber-500'
                  }`}></div>
                  <span className="text-sm font-medium text-neutral-900">{item.type}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900">
                    {formatCurrency(item.revenue)}
                  </p>
                  <p className="text-xs text-neutral-600">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-neutral-700">Total</span>
              <span className="text-lg font-bold text-neutral-900">
                {formatCurrency(revenueByPropertyType.reduce((sum, item) => sum + item.revenue, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance des agents et commissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Agents */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">
              Top Performance Agents
            </h3>
            <Award className="w-5 h-5 text-neutral-500" />
          </div>
          
          <div className="space-y-4">
            {agentPerformance.map((agent, index) => (
              <div key={agent.name} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900">{agent.name}</p>
                    <p className="text-xs text-neutral-600">{agent.properties} propriétés</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900">{agent.rating} ★</p>
                  <p className="text-xs text-neutral-600">{formatCurrency(agent.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistiques de commission */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">
              Statistiques Commissions
            </h3>
            <DollarSign className="w-5 h-5 text-neutral-500" />
          </div>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-neutral-900 mb-1">
                {formatCurrency(commissionStats.totalCommission)}
              </p>
              <p className="text-sm text-neutral-700">Commission Totale</p>
              <div className="flex items-center justify-center text-sm text-semantic-success mt-2">
                <ArrowUp className="w-4 h-4 mr-1" />
                {commissionStats.commissionGrowth}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(commissionStats.averageCommission)}
                </p>
                <p className="text-sm text-neutral-700">Commission Moyenne</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-xl font-bold text-semantic-success">
                  {formatCurrency(commissionStats.topCommissionProperty / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-neutral-700">Plus Grosse Commission</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">
            Activité Récente de la Plateforme
          </h3>
          <button className="flex items-center text-sm text-blue-600 hover:text-blue-700">
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualiser
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              action: 'Nouvel utilisateur inscrit',
              description: 'Agence Immo Plus SARL',
              time: 'Il y a 5 min',
              icon: Users,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              action: 'Propriété validée',
              description: 'Villa Cocody - 150M XOF',
              time: 'Il y a 12 min',
              icon: CheckCircle,
              color: 'text-semantic-success',
              bgColor: 'bg-green-50'
            },
            {
              action: 'Commission payée',
              description: 'Agent Marie KOUASSI - 125K XOF',
              time: 'Il y a 25 min',
              icon: DollarSign,
              color: 'text-semantic-success',
              bgColor: 'bg-green-50'
            }
          ].map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-center p-4 bg-neutral-50 rounded-lg">
                <div className={`p-2 ${activity.bgColor} rounded-lg mr-4`}>
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-neutral-700">
                    {activity.description}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsSection;