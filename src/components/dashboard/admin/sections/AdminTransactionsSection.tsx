/**
 * Admin Transactions Section - Suivi financier et transactions
 */

import { useState } from 'react';

interface Transaction {
  id: string;
  type: 'paiement' | 'commission' | 'abonnement';
  amount: number;
  user_name: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  payment_method?: string;
  reference?: string;
  fee?: number;
  currency?: string;
}

interface AdminTransactionsSectionProps {
  transactions: Transaction[];
}

export function AdminTransactionsSection({ transactions }: AdminTransactionsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'paiement' | 'commission' | 'abonnement'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed' | 'cancelled'>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  // Générer des données mock réalistes pour simuler 567 transactions
  const mockTransactions = [
    ...transactions,
    // Ajout de transactions mock pour atteindre un nombre réaliste
    {
      id: 'txn-004',
      type: 'paiement' as const,
      amount: 75000,
      user_name: 'Marie Kouassi',
      status: 'completed' as const,
      created_at: '2025-11-30T19:30:00Z',
      payment_method: 'Mobile Money',
      reference: 'MM-2025-11-30-001',
      fee: 2250,
      currency: 'XOF',
    },
    {
      id: 'txn-005',
      type: 'commission' as const,
      amount: 25000,
      user_name: 'Kouassi Immobilier',
      status: 'pending' as const,
      created_at: '2025-11-30T18:45:00Z',
      payment_method: 'Virement bancaire',
      reference: 'VB-2025-11-30-002',
      fee: 750,
      currency: 'XOF',
    },
    {
      id: 'txn-006',
      type: 'abonnement' as const,
      amount: 15000,
      user_name: 'Immobilière Elite',
      status: 'failed' as const,
      created_at: '2025-11-30T17:20:00Z',
      payment_method: 'Carte bancaire',
      reference: 'CB-2025-11-30-003',
      fee: 450,
      currency: 'XOF',
    },
    {
      id: 'txn-007',
      type: 'paiement' as const,
      amount: 120000,
      user_name: 'Jean-Baptiste Yao',
      status: 'completed' as const,
      created_at: '2025-11-30T16:15:00Z',
      payment_method: 'Mobile Money',
      reference: 'MM-2025-11-30-004',
      fee: 3600,
      currency: 'XOF',
    },
    {
      id: 'txn-008',
      type: 'commission' as const,
      amount: 18000,
      user_name: 'Fatou Diallo',
      status: 'cancelled' as const,
      created_at: '2025-11-30T15:00:00Z',
      payment_method: 'Espèces',
      reference: 'ESP-2025-11-30-005',
      fee: 540,
      currency: 'XOF',
    },
  ];

  const filteredTransactions = mockTransactions
    .filter(transaction => {
      const matchesSearch = transaction.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || transaction.type === filterType;
      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
      
      let matchesPeriod = true;
      if (filterPeriod !== 'all') {
        const now = new Date();
        const transactionDate = new Date(transaction.created_at);
        switch (filterPeriod) {
          case 'today':
            matchesPeriod = transactionDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesPeriod = transactionDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesPeriod = transactionDate >= monthAgo;
            break;
        }
      }
      
      return matchesSearch && matchesType && matchesStatus && matchesPeriod;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleTransactionAction = (transactionId: string, action: 'verify' | 'cancel' | 'view') => {
    console.log(`${action} transaction:`, transactionId);
    // TODO: Implémenter les actions réelles
  };

  const handleBulkAction = (action: 'verify' | 'cancel') => {
    console.log(`Bulk ${action}:`, selectedTransactions);
    setSelectedTransactions([]);
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'paiement': return 'Paiement';
      case 'commission': return 'Commission';
      case 'abonnement': return 'Abonnement';
      default: return type;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'paiement': return 'bg-success-100 text-success-700';
      case 'commission': return 'bg-blue-100 text-semantic-info';
      case 'abonnement': return 'bg-purple-100 text-purple-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success-100 text-success-700';
      case 'pending': return 'bg-yellow-100 text-semantic-warning';
      case 'failed': return 'bg-red-100 text-semantic-error';
      case 'cancelled': return 'bg-gray-100 text-neutral-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number, currency = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'XOF' ? 'XOF' : 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculs financiers
  const transactionStats = {
    total: 567,
    totalAmount: 45600000, // 45.6M XOF
    completed: 423,
    pending: 98,
    failed: 31,
    cancelled: 15,
    totalFees: 1368000, // 1.368M XOF
  };

  const todayStats = mockTransactions.filter(t => {
    const today = new Date().toDateString();
    return new Date(t.created_at).toDateString() === today;
  });

  const todayAmount = todayStats.reduce((sum, t) => sum + t.amount, 0);
  const todayFees = todayStats.reduce((sum, t) => sum + (t.fee || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header avec statistiques financières */}
      <div className="bg-background-page rounded-2xl border border-neutral-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-h4 font-bold text-text-primary">Suivi Financier</h2>
            <p className="text-text-secondary mt-1">
              Gestion et contrôle des transactions ({transactionStats.total.toLocaleString()} total)
            </p>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-success-50 border border-success-200 rounded-lg">
            <div className="text-success-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <div className="text-success-700 font-semibold">{formatAmount(transactionStats.totalAmount)}</div>
              <div className="text-success-600 text-sm">Volume total</div>
            </div>
          </div>
        </div>

        {/* KPIs Financiers */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-success-50 border border-success-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-success-500 p-2 rounded-lg">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-success-700 font-semibold">{transactionStats.completed}</div>
                <div className="text-success-600 text-sm">Transactions réussies</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-semantic-warning p-2 rounded-lg">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-yellow-700 font-semibold">{transactionStats.pending}</div>
                <div className="text-yellow-600 text-sm">En attente</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-semantic-info p-2 rounded-lg">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="text-blue-700 font-semibold">{formatAmount(todayAmount)}</div>
                <div className="text-blue-600 text-sm">Aujourd'hui</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <div className="text-purple-700 font-semibold">{formatAmount(transactionStats.totalFees)}</div>
                <div className="text-purple-600 text-sm">Commissions totales</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-background-page rounded-2xl border border-neutral-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher par utilisateur ou référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les types</option>
              <option value="paiement">Paiements</option>
              <option value="commission">Commissions</option>
              <option value="abonnement">Abonnements</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Complétées</option>
              <option value="pending">En attente</option>
              <option value="failed">Échouées</option>
              <option value="cancelled">Annulées</option>
            </select>

            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as any)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Toutes les périodes</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTransactions.length > 0 && (
          <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-700">
                {selectedTransactions.length} transaction(s) sélectionnée(s)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('verify')}
                  className="px-3 py-1 bg-success-600 text-white text-sm rounded-lg hover:bg-success-700"
                >
                  Vérifier
                </button>
                <button
                  onClick={() => handleBulkAction('cancel')}
                  className="px-3 py-1 bg-semantic-error text-white text-sm rounded-lg hover:bg-red-600"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-background-page rounded-2xl border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.length === filteredTransactions.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTransactions(filteredTransactions.map(t => t.id));
                      } else {
                        setSelectedTransactions([]);
                      }
                    }}
                    className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTransactions([...selectedTransactions, transaction.id]);
                        } else {
                          setSelectedTransactions(selectedTransactions.filter(id => id !== transaction.id));
                        }
                      }}
                      className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-mono text-text-primary">{transaction.reference || transaction.id}</div>
                    <div className="text-xs text-neutral-500">{transaction.payment_method}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-text-primary">{formatAmount(transaction.amount, transaction.currency)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-text-primary">{transaction.user_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status === 'completed' ? 'Complétée' :
                       transaction.status === 'pending' ? 'En attente' :
                       transaction.status === 'failed' ? 'Échouée' : 'Annulée'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {transaction.fee ? formatAmount(transaction.fee, transaction.currency) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {formatDate(transaction.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleTransactionAction(transaction.id, 'view')}
                        className="p-2 text-neutral-500 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Voir détails"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {transaction.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleTransactionAction(transaction.id, 'verify')}
                            className="p-2 text-neutral-500 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                            title="Vérifier"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleTransactionAction(transaction.id, 'cancel')}
                            className="p-2 text-neutral-500 hover:text-semantic-error hover:bg-red-50 rounded-lg transition-colors"
                            title="Annuler"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              Affichage de {filteredTransactions.length} sur {transactionStats.total.toLocaleString()} transactions
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
                Précédent
              </button>
              <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
                2
              </button>
              <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
                3
              </button>
              <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}