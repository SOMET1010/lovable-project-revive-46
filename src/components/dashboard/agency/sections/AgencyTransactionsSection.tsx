import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Building, 
  User, 
  CreditCard,
  Receipt,
  Target,
  Filter,
  Search,
  Plus,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  Activity,
  FileText,
  Award,
  Home,
  MapPin,
  Phone,
  Mail,
  Star,
  RefreshCw
} from 'lucide-react';

interface Transaction {
  id: number;
  type: 'vente' | 'location' | 'gestion' | 'estimation';
  property: {
    id: number;
    title: string;
    address: string;
    type: string;
    price: number;
  };
  client: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  agent: {
    id: number;
    name: string;
    phone: string;
  };
  amount: number;
  commission: number;
  commissionRate: number;
  status: 'en_cours' | 'completed' | 'cancelled' | 'pending_payment';
  date: string;
  completionDate?: string;
  paymentDate?: string;
  description: string;
  documents: string[];
  tags: string[];
  commissionPaid: boolean;
  recurringRevenue?: boolean;
  monthlyAmount?: number;
}

const AgencyTransactionsSection: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Données mock des transactions
  const transactions: Transaction[] = [
    {
      id: 1,
      type: 'vente',
      property: {
        id: 1,
        title: 'Villa Moderne Cocody',
        address: 'Cocody, Riviera Golf',
        type: 'Villa',
        price: 450000000
      },
      client: {
        id: 1,
        name: 'M. KOUASSI Jean-Baptiste',
        email: 'j.kouassi@email.com',
        phone: '+225 07 00 00 01'
      },
      agent: {
        id: 1,
        name: 'A. TRAORE',
        phone: '+225 05 00 00 12'
      },
      amount: 450000000,
      commission: 13500000,
      commissionRate: 3.0,
      status: 'completed',
      date: '2025-11-28',
      completionDate: '2025-11-28',
      paymentDate: '2025-11-29',
      description: 'Vente villa Cocody avec commission standard',
      documents: ['Compromis', 'Acte de vente', 'Relevé commission'],
      tags: ['Vente directe', 'Villa luxe'],
      commissionPaid: true
    },
    {
      id: 2,
      type: 'location',
      property: {
        id: 2,
        title: 'Appartement Riviera',
        address: 'Marcory, Zone 4A',
        type: 'Appartement',
        price: 200000
      },
      client: {
        id: 2,
        name: 'Mme TRAORE Aya',
        email: 'aya.traore@email.com',
        phone: '+225 05 00 00 02'
      },
      agent: {
        id: 2,
        name: 'M. BAKAYOKO',
        phone: '+225 01 00 00 13'
      },
      amount: 2400000,
      commission: 600000,
      commissionRate: 25.0,
      status: 'completed',
      date: '2025-11-25',
      completionDate: '2025-11-25',
      paymentDate: '2025-11-26',
      description: 'Location annuel appartement meublé',
      documents: ['Bail', 'État des lieux', 'Commission'],
      tags: ['Location meublée', 'Renouvellement'],
      commissionPaid: true,
      recurringRevenue: true,
      monthlyAmount: 200000
    },
    {
      id: 3,
      type: 'gestion',
      property: {
        id: 3,
        title: 'Immeuble Commercial Plateau',
        address: 'Plateau, Rue des Hôtels',
        type: 'Immeuble',
        price: 1200000000
      },
      client: {
        id: 3,
        name: 'SCI Plateau Commercial',
        email: 'contact@sciplateau.ci',
        phone: '+225 20 00 00 03'
      },
      agent: {
        id: 3,
        name: 'Mme KONE',
        phone: '+225 07 00 00 14'
      },
      amount: 15000000,
      commission: 1500000,
      commissionRate: 10.0,
      status: 'en_cours',
      date: '2025-11-20',
      description: 'Gestion locative immeuble commercial',
      documents: ['Mandat gestion', 'Assurance', 'Contrats'],
      tags: ['Gestion', 'Commercial'],
      commissionPaid: false,
      recurringRevenue: true,
      monthlyAmount: 1250000
    },
    {
      id: 4,
      type: 'vente',
      property: {
        id: 4,
        title: 'Appartement F3 Yopougon',
        address: 'Yopougon, Siporex',
        type: 'Appartement',
        price: 85000000
      },
      client: {
        id: 4,
        name: 'M. DIALLO Ousmane',
        email: 'ousmane.diallo@email.com',
        phone: '+225 03 00 00 04'
      },
      agent: {
        id: 4,
        name: 'M. TRAORE',
        phone: '+225 01 00 00 15'
      },
      amount: 85000000,
      commission: 2550000,
      commissionRate: 3.0,
      status: 'pending_payment',
      date: '2025-11-26',
      completionDate: '2025-11-26',
      description: 'Vente appartement jeune couple',
      documents: ['Compromis', 'Acte de vente'],
      tags: ['Premier achat', 'Jeune couple'],
      commissionPaid: false
    },
    {
      id: 5,
      type: 'location',
      property: {
        id: 5,
        title: 'Local Commercial Adjamé',
        address: 'Adjamé, Marché Central',
        type: 'Commerce',
        price: 350000
      },
      client: {
        id: 5,
        name: 'SARL Commerce Adjamé',
        email: 'vente@commerceadjame.ci',
        phone: '+225 27 00 00 05'
      },
      agent: {
        id: 5,
        name: 'Mme FOFANA',
        phone: '+225 05 00 00 16'
      },
      amount: 4200000,
      commission: 1050000,
      commissionRate: 25.0,
      status: 'en_cours',
      date: '2025-11-22',
      description: 'Location local commercial',
      documents: ['Bail commercial', 'État des lieux'],
      tags: ['Commercial', 'Urgence'],
      commissionPaid: false,
      recurringRevenue: true,
      monthlyAmount: 350000
    },
    {
      id: 6,
      type: 'estimation',
      property: {
        id: 6,
        title: 'Terrain Bingerville',
        address: 'Bingerville, Zone Résidentielle',
        type: 'Terrain',
        price: 75000000
      },
      client: {
        id: 6,
        name: 'M. KONE Ibrahim',
        email: 'ibrahim.kone@email.com',
        phone: '+225 01 00 00 06'
      },
      agent: {
        id: 2,
        name: 'M. BAKAYOKO',
        phone: '+225 01 00 00 13'
      },
      amount: 500000,
      commission: 500000,
      commissionRate: 100.0,
      status: 'completed',
      date: '2025-11-24',
      completionDate: '2025-11-24',
      paymentDate: '2025-11-25',
      description: 'Estimation terrain constructible',
      documents: ['Rapport estimation', 'Facture'],
      tags: ['Estimation', 'Terrain'],
      commissionPaid: true
    }
  ];

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'completed': { 
        label: 'Terminée', 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle 
      },
      'en_cours': { 
        label: 'En cours', 
        color: 'bg-blue-100 text-blue-800', 
        icon: Clock 
      },
      'pending_payment': { 
        label: 'Paiement pending', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: RefreshCw 
      },
      'cancelled': { 
        label: 'Annulée', 
        color: 'bg-red-100 text-red-800', 
        icon: AlertTriangle 
      }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap['en_cours'];
  };

  const getTypeInfo = (type: string) => {
    const typeMap = {
      'vente': { label: 'Vente', color: 'bg-green-100 text-green-800', icon: TrendingUp },
      'location': { label: 'Location', color: 'bg-blue-100 text-blue-800', icon: Home },
      'gestion': { label: 'Gestion', color: 'bg-purple-100 text-purple-800', icon: Building },
      'estimation': { label: 'Estimation', color: 'bg-orange-100 text-orange-800', icon: FileText }
    };
    return typeMap[type as keyof typeof typeMap] || typeMap['vente'];
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = selectedFilter === 'all' || transaction.type === selectedFilter || transaction.status === selectedFilter;
    const matchesSearch = transaction.property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.property.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const transactionStats = {
    total: transactions.length,
    completes: transactions.filter(t => t.status === 'completed').length,
    enCours: transactions.filter(t => t.status === 'en_cours').length,
    enAttente: transactions.filter(t => t.status === 'pending_payment').length,
    chiffreAffaires: transactions.reduce((sum, t) => sum + t.amount, 0),
    commissions: transactions.reduce((sum, t) => sum + t.commission, 0),
    commissionsRecues: transactions.filter(t => t.commissionPaid).reduce((sum, t) => sum + t.commission, 0),
    commissionsEnAttente: transactions.filter(t => !t.commissionPaid).reduce((sum, t) => sum + t.commission, 0),
    revenueRecurring: transactions.filter(t => t.recurringRevenue).reduce((sum, t) => sum + (t.monthlyAmount || 0), 0) * 12
  };

  const monthlyData = [
    { month: 'Juil', ventes: 12, locations: 8, commissions: 15600000 },
    { month: 'Août', ventes: 15, locations: 6, commissions: 18200000 },
    { month: 'Sept', ventes: 18, locations: 9, commissions: 22400000 },
    { month: 'Oct', ventes: 14, locations: 11, commissions: 19800000 },
    { month: 'Nov', ventes: 20, locations: 12, commissions: 25600000 },
    { month: 'Déc', ventes: 22, locations: 10, commissions: 28400000 }
  ];

  const topAgents = [
    { name: 'A. TRAORE', ventes: 8, commissions: 12500000, performance: 96 },
    { name: 'M. BAKAYOKO', ventes: 6, commissions: 9800000, performance: 89 },
    { name: 'Mme KONE', ventes: 5, commissions: 8600000, performance: 94 },
    { name: 'M. TRAORE', ventes: 4, commissions: 7200000, performance: 87 },
    { name: 'Mme FOFANA', ventes: 3, commissions: 5600000, performance: 91 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Transactions & Commissions
            </h2>
            <p className="text-neutral-700">
              Suivi des ventes, locations et revenus de l'agence
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle transaction
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors duration-200">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Total</p>
              <p className="text-lg font-bold text-neutral-900">{transactionStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-semantic-success" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Terminées</p>
              <p className="text-lg font-bold text-neutral-900">{transactionStats.completes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">En cours</p>
              <p className="text-lg font-bold text-neutral-900">{transactionStats.enCours}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <RefreshCw className="w-5 h-5 text-semantic-warning" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">En attente</p>
              <p className="text-lg font-bold text-neutral-900">{transactionStats.enAttente}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Chiffre d'affaires</p>
              <p className="text-lg font-bold text-neutral-900">
                {(transactionStats.chiffreAffaires / 1000000).toFixed(0)}M F
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Commissions</p>
              <p className="text-lg font-bold text-neutral-900">
                {(transactionStats.commissions / 1000000).toFixed(1)}M F
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Reçues</p>
              <p className="text-lg font-bold text-neutral-900">
                {(transactionStats.commissionsRecues / 1000000).toFixed(1)}M F
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">En attente</p>
              <p className="text-lg font-bold text-neutral-900">
                {(transactionStats.commissionsEnAttente / 1000000).toFixed(1)}M F
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Performance Chart */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Performance Mensuelle</h3>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
              className="px-3 py-1 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="month">6 derniers mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-neutral-900 w-12">{data.month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <div className="w-20 h-2 bg-neutral-200 rounded-full">
                        <div 
                          className="h-2 bg-primary-500 rounded-full"
                          style={{ width: `${(data.ventes / 25) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-600 ml-2">{data.ventes} ventes</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-20 h-2 bg-neutral-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${(data.locations / 15) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-600 ml-2">{data.locations} locations</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900">
                    {(data.commissions / 1000000).toFixed(1)}M F
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Agents Performance */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">Top Performance Agents</h3>
          
          <div className="space-y-4">
            {topAgents.map((agent, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-neutral-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{agent.name}</p>
                    <p className="text-xs text-neutral-600">{agent.ventes} ventes • {agent.performance}% perf.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900">
                    {(agent.commissions / 1000000).toFixed(1)}M F
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Rechercher une transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Toutes les transactions</option>
              <option value="vente">Ventes</option>
              <option value="location">Locations</option>
              <option value="gestion">Gestions</option>
              <option value="estimation">Estimations</option>
              <option value="completed">Terminées</option>
              <option value="en_cours">En cours</option>
              <option value="pending_payment">En attente paiement</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-neutral-700 hover:bg-neutral-50 rounded-lg">
              <Filter className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg border border-primary-200">
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Historique des Transactions</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Propriété
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredTransactions.map((transaction) => {
                const statusInfo = getStatusInfo(transaction.status);
                const typeInfo = getTypeInfo(transaction.type);
                const StatusIcon = statusInfo.icon;
                const TypeIcon = typeInfo.icon;

                return (
                  <tr key={transaction.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color} mr-2`}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {typeInfo.label}
                        </span>
                        <span className="text-sm font-medium text-neutral-900">#{transaction.id.toString().padStart(4, '0')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{transaction.property.title}</div>
                        <div className="text-sm text-neutral-500">{transaction.property.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{transaction.client.name}</div>
                        <div className="text-sm text-neutral-500">{transaction.client.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{transaction.agent.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">
                        {(transaction.amount / 1000000).toFixed(1)}M F
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {(transaction.commission / 1000000).toFixed(1)}M F
                        </div>
                        <div className="text-xs text-neutral-500">{transaction.commissionRate}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{new Date(transaction.date).toLocaleDateString('fr-FR')}</div>
                      {transaction.completionDate && (
                        <div className="text-xs text-neutral-500">
                          Fin: {new Date(transaction.completionDate).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-neutral-600 hover:text-neutral-900">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Projections */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-200">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Projections de Revenus
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 border border-primary-200">
            <h4 className="font-medium text-neutral-900 mb-2">Ce Mois</h4>
            <p className="text-2xl font-bold text-primary-600 mb-1">25.6M F</p>
            <p className="text-sm text-neutral-600">+12% vs mois dernier</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-primary-200">
            <h4 className="font-medium text-neutral-900 mb-2">Mois Prochain</h4>
            <p className="text-2xl font-bold text-blue-600 mb-1">28.4M F</p>
            <p className="text-sm text-neutral-600">Prévisions conservatrices</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-primary-200">
            <h4 className="font-medium text-neutral-900 mb-2">Revenus Récurrents</h4>
            <p className="text-2xl font-bold text-green-600 mb-1">18.2M F/an</p>
            <p className="text-sm text-neutral-600">Gestion locative</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyTransactionsSection;