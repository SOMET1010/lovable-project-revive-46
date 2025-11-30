import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  Filter,
  BarChart3,
  PieChart,
  Building,
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical
} from 'lucide-react';

interface Transaction {
  id: number;
  date: string;
  description: string;
  type: 'revenu' | 'depense';
  category: string;
  amount: number;
  property?: string;
  status: 'complete' | 'pending' | 'cancelled';
}

interface FinanceData {
  monthly: {
    revenue: number;
    expenses: number;
    netIncome: number;
    growth: number;
  };
  yearly: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    margin: number;
  };
  properties: {
    totalRevenue: number;
    occupancyRate: number;
    averageRent: number;
  };
}

const OwnerFinancesSection: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Données mock réalistes pour les finances
  const financeData: FinanceData = {
    monthly: {
      revenue: 2850000,
      expenses: 325000,
      netIncome: 2525000,
      growth: 8.5
    },
    yearly: {
      totalRevenue: 34200000,
      totalExpenses: 3900000,
      netProfit: 30300000,
      margin: 88.6
    },
    properties: {
      totalRevenue: 34200000,
      occupancyRate: 75,
      averageRent: 475000
    }
  };

  const transactions: Transaction[] = [
    {
      id: 1,
      date: "2024-11-01",
      description: "Loyer Villa Bellevue - Jean Kouassi",
      type: "revenu",
      category: "loyer",
      amount: 450000,
      property: "Villa Bellevue",
      status: "complete"
    },
    {
      id: 2,
      date: "2024-11-01",
      description: "Loyer Appartement Riviera - Sarah Mensah",
      type: "revenu",
      category: "loyer",
      amount: 380000,
      property: "Appartement Riviera",
      status: "complete"
    },
    {
      id: 3,
      date: "2024-10-30",
      description: "Réparation plomberie - Villa Bellevue",
      type: "depense",
      category: "maintenance",
      amount: 85000,
      property: "Villa Bellevue",
      status: "complete"
    },
    {
      id: 4,
      date: "2024-10-28",
      description: "Assurance propriétés",
      type: "depense",
      category: "assurance",
      amount: 120000,
      status: "complete"
    },
    {
      id: 5,
      date: "2024-11-15",
      description: "Loyer Appartement Marcory - Paul Akissi",
      type: "revenu",
      category: "loyer",
      amount: 420000,
      property: "Appartement Marcory",
      status: "pending"
    },
    {
      id: 6,
      date: "2024-10-25",
      description: "Peinture intérieure - Studio Plateau",
      type: "depense",
      category: "maintenance",
      amount: 45000,
      property: "Studio Plateau",
      status: "complete"
    },
    {
      id: 7,
      date: "2024-10-20",
      description: "Taxes foncières",
      type: "depense",
      category: "taxes",
      amount: 75000,
      status: "complete"
    },
    {
      id: 8,
      date: "2024-10-15",
      description: "Frais de gestion immobilière",
      type: "depense",
      category: "gestion",
      amount: 150000,
      status: "complete"
    }
  ];

  const expenseCategories = [
    { name: 'maintenance', label: 'Maintenance', amount: 130000, color: 'bg-red-500' },
    { name: 'assurance', label: 'Assurance', amount: 120000, color: 'bg-blue-500' },
    { name: 'taxes', label: 'Taxes', amount: 75000, color: 'bg-yellow-500' },
    { name: 'gestion', label: 'Gestion', amount: 150000, color: 'bg-purple-500' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const categoryMatch = selectedCategory === 'all' || transaction.category === selectedCategory;
    return categoryMatch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-semantic-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-semantic-warning" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-semantic-error" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-semantic-success';
      case 'pending':
        return 'text-semantic-warning';
      case 'cancelled':
        return 'text-semantic-error';
      default:
        return 'text-neutral-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Gestion Financière</h2>
          <p className="text-neutral-600">Suivez vos revenus et dépenses</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors duration-200">
            <Download className="w-4 h-4 mr-2 inline" />
            Exporter
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
            Nouveau rapport
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex space-x-4">
        {[
          { value: 'week', label: 'Semaine' },
          { value: 'month', label: 'Mois' },
          { value: 'quarter', label: 'Trimestre' },
          { value: 'year', label: 'Année' }
        ].map((period) => (
          <button
            key={period.value}
            onClick={() => setSelectedPeriod(period.value)}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              selectedPeriod === period.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-300'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Revenus du mois</p>
              <p className="text-3xl font-bold text-neutral-900">
                {formatCurrency(financeData.monthly.revenue)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-semantic-success mr-1" />
                <span className="text-sm text-semantic-success">+{financeData.monthly.growth}%</span>
                <span className="text-sm text-neutral-600 ml-1">vs mois dernier</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-semantic-success" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Dépenses du mois</p>
              <p className="text-3xl font-bold text-neutral-900">
                {formatCurrency(financeData.monthly.expenses)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 text-semantic-error mr-1" />
                <span className="text-sm text-semantic-error">+5.2%</span>
                <span className="text-sm text-neutral-600 ml-1">vs mois dernier</span>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <CreditCard className="w-8 h-8 text-semantic-error" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Revenu net</p>
              <p className="text-3xl font-bold text-semantic-success">
                {formatCurrency(financeData.monthly.netIncome)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-semantic-success mr-1" />
                <span className="text-sm text-semantic-success">88.6%</span>
                <span className="text-sm text-neutral-600 ml-1">marge nette</span>
              </div>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <BarChart3 className="w-8 h-8 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart placeholder */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Évolution des revenus</h3>
            <button className="p-2 text-neutral-400 hover:text-neutral-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <p className="text-neutral-600">Graphique des revenus</p>
              <p className="text-sm text-neutral-500">Intégration chart.js requise</p>
            </div>
          </div>
        </div>

        {/* Expense breakdown */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Répartition des dépenses</h3>
            <button className="p-2 text-neutral-400 hover:text-neutral-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            {expenseCategories.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full ${category.color} mr-3`} />
                  <span className="text-sm text-neutral-900">{category.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-900">{formatCurrency(category.amount)}</p>
                  <p className="text-xs text-neutral-600">
                    {Math.round((category.amount / expenseCategories.reduce((sum, c) => sum + c.amount, 0)) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Property performance */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Performance par propriété</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="p-3 bg-primary-50 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <Building className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">8</p>
            <p className="text-sm text-neutral-600">Propriétés</p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-green-50 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-semantic-success" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">75%</p>
            <p className="text-sm text-neutral-600">Taux d'occupation</p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-blue-50 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-6 h-6 text-semantic-info" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {formatCurrency(financeData.properties.averageRent)}
            </p>
            <p className="text-sm text-neutral-600">Loyer moyen</p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-amber-50 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-semantic-warning" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {formatCurrency(financeData.properties.totalRevenue)}
            </p>
            <p className="text-sm text-neutral-600">Revenus annuels</p>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">Transactions récentes</h3>
            <div className="flex space-x-2">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="all">Toutes catégories</option>
                <option value="loyer">Loyer</option>
                <option value="maintenance">Maintenance</option>
                <option value="assurance">Assurance</option>
                <option value="taxes">Taxes</option>
                <option value="gestion">Gestion</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      {transaction.property && (
                        <p className="text-neutral-600 text-xs">{transaction.property}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'revenu' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'revenu' ? 'Revenu' : 'Dépense'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 capitalize">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={transaction.type === 'revenu' ? 'text-semantic-success' : 'text-semantic-error'}>
                      {transaction.type === 'revenu' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      {getStatusIcon(transaction.status)}
                      <span className={`ml-1 ${getStatusColor(transaction.status)} capitalize`}>
                        {transaction.status === 'complete' ? 'Complété' : 
                         transaction.status === 'pending' ? 'En attente' : 'Annulé'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600">Aucune transaction trouvée pour cette catégorie</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerFinancesSection;