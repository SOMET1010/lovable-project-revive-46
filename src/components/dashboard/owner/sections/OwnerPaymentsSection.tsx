/**
 * Owner Payments Section - Gestion des revenus et paiements
 */

import { Badge } from '../../ui/Badge';
import { Table, Column } from '../../ui/Table';

interface Payment {
  id: string;
  tenant_name: string;
  property_title: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: 'reçu' | 'en_attente' | 'en_retard';
  month: string;
}

interface OwnerPaymentsSectionProps {
  payments: Payment[];
  monthlyRevenue: number;
  yearlyRevenue: number;
}

export function OwnerPaymentsSection({ payments, monthlyRevenue, yearlyRevenue }: OwnerPaymentsSectionProps) {
  const getStatusBadge = (status: Payment['status']) => {
    switch (status) {
      case 'reçu':
        return <Badge variant="success" size="small">Reçu</Badge>;
      case 'en_attente':
        return <Badge variant="info" size="small">En attente</Badge>;
      case 'en_retard':
        return <Badge variant="error" size="small">En retard</Badge>;
      default:
        return <Badge variant="default" size="small">Inconnu</Badge>;
    }
  };

  const columns: Column<Payment>[] = [
    {
      key: 'tenant',
      title: 'Locataire',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {record.tenant_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-text-primary">{record.tenant_name}</div>
            <div className="text-sm text-text-secondary">{record.property_title}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'month',
      title: 'Période',
      dataIndex: 'month',
      render: (value: string, record) => (
        <div>
          <div className="font-medium text-text-primary">{value}</div>
          <div className="text-sm text-text-secondary">
            Échéance: {new Date(record.due_date).toLocaleDateString('fr-FR')}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      title: 'Montant',
      dataIndex: 'amount',
      align: 'right',
      render: (value: number) => (
        <div className="font-semibold text-text-primary">
          {value.toLocaleString()} FCFA
        </div>
      ),
    },
    {
      key: 'paid_date',
      title: 'Paiement',
      render: (_, record) => (
        <div>
          {record.paid_date ? (
            <div>
              <div className="text-sm font-medium text-semantic-success">Reçu</div>
              <div className="text-xs text-text-secondary">
                {new Date(record.paid_date).toLocaleDateString('fr-FR')}
              </div>
            </div>
          ) : (
            <div className="text-sm text-text-secondary">Non reçu</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Statut',
      dataIndex: 'status',
      render: (value: Payment['status']) => getStatusBadge(value),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.status === 'en_retard' && (
            <button 
              className="px-3 py-1 bg-semantic-warning text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors"
              title="Envoyer relance"
            >
              Relancer
            </button>
          )}
          {record.status === 'en_attente' && (
            <button 
              className="px-3 py-1 bg-semantic-info text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
              title="Confirmer réception"
            >
              Confirmer
            </button>
          )}
          <button 
            className="p-2 text-text-secondary hover:bg-neutral-100 rounded-lg transition-colors"
            title="Voir détails"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  // Calculs pour les statistiques
  const receivedPayments = payments.filter(p => p.status === 'reçu');
  const pendingPayments = payments.filter(p => p.status === 'en_attente');
  const overduePayments = payments.filter(p => p.status === 'en_retard');
  const totalReceived = receivedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  // Données pour les graphiques (6 derniers mois)
  const monthlyData = [
    { month: 'Juin', amount: 385000, paid: 385000 },
    { month: 'Juillet', amount: 405000, paid: 405000 },
    { month: 'Août', amount: 395000, paid: 395000 },
    { month: 'Septembre', amount: 415000, paid: 415000 },
    { month: 'Octobre', amount: 420000, paid: 420000 },
    { month: 'Novembre', amount: monthlyRevenue, paid: totalReceived },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Revenus & Paiements</h2>
          <p className="text-text-secondary">Suivi de vos revenus locatifs</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-3 py-2 border border-neutral-200 rounded-lg text-sm">
            <option value="">Tous les statuts</option>
            <option value="reçu">Reçu</option>
            <option value="en_attente">En attente</option>
            <option value="en_retard">En retard</option>
          </select>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background-page p-6 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <span className="text-primary-600">💰</span>
            </div>
            <Badge variant="success" size="small">+18%</Badge>
          </div>
          <div className="mb-2">
            <div className="text-sm font-medium text-text-secondary">Revenus Mensuels</div>
            <div className="text-3xl font-bold text-text-primary">
              {monthlyRevenue.toLocaleString()}
            </div>
          </div>
          <div className="text-sm text-text-secondary">FCFA</div>
        </div>

        <div className="bg-background-page p-6 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <span className="text-green-600">✅</span>
            </div>
          </div>
          <div className="mb-2">
            <div className="text-sm font-medium text-text-secondary">Reçu ce mois</div>
            <div className="text-3xl font-bold text-semantic-success">
              {totalReceived.toLocaleString()}
            </div>
          </div>
          <div className="text-sm text-text-secondary">{receivedPayments.length} paiements</div>
        </div>

        <div className="bg-background-page p-6 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
              <span className="text-amber-600">⏳</span>
            </div>
          </div>
          <div className="mb-2">
            <div className="text-sm font-medium text-text-secondary">En attente</div>
            <div className="text-3xl font-bold text-semantic-warning">
              {totalPending.toLocaleString()}
            </div>
          </div>
          <div className="text-sm text-text-secondary">{pendingPayments.length} paiements</div>
        </div>

        <div className="bg-background-page p-6 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <span className="text-red-600">⚠️</span>
            </div>
          </div>
          <div className="mb-2">
            <div className="text-sm font-medium text-text-secondary">En retard</div>
            <div className="text-3xl font-bold text-semantic-error">
              {totalOverdue.toLocaleString()}
            </div>
          </div>
          <div className="text-sm text-text-secondary">{overduePayments.length} paiements</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolution des revenus */}
        <div className="bg-background-page p-6 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Évolution des Revenus</h3>
              <p className="text-sm text-text-secondary">6 derniers mois</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">Projection annuelle</div>
              <div className="text-xl font-bold text-text-primary">
                {yearlyRevenue.toLocaleString()} FCFA
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {monthlyData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-text-primary">{item.month}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary">
                      {(item.amount / 1000).toFixed(0)}k FCFA
                    </span>
                    <div className="w-2 h-2 bg-semantic-success rounded-full"></div>
                  </div>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(item.amount / 450000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition des paiements */}
        <div className="bg-background-page p-6 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Répartition des Paiements</h3>
              <p className="text-sm text-text-secondary">Statut des paiements actuels</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-semantic-success rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Reçus</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-green-700">
                  {totalReceived.toLocaleString()} FCFA
                </div>
                <div className="text-xs text-green-600">
                  {receivedPayments.length} paiements
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-semantic-warning rounded-full"></div>
                <span className="text-sm font-medium text-amber-700">En attente</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-amber-700">
                  {totalPending.toLocaleString()} FCFA
                </div>
                <div className="text-xs text-amber-600">
                  {pendingPayments.length} paiements
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-semantic-error rounded-full"></div>
                <span className="text-sm font-medium text-red-700">En retard</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-red-700">
                  {totalOverdue.toLocaleString()} FCFA
                </div>
                <div className="text-xs text-red-600">
                  {overduePayments.length} paiements
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">Total attendu</span>
              <span className="text-lg font-bold text-text-primary">
                {(totalReceived + totalPending + totalOverdue).toLocaleString()} FCFA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <Table
        columns={columns}
        data={payments}
        emptyMessage="Aucun paiement trouvé"
        rowKey="id"
      />

      {/* Overdue payments alert */}
      {overduePayments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-800">
                {overduePayments.length} paiement{overduePayments.length > 1 ? 's' : ''} en retard
              </h4>
              <p className="text-sm text-red-700">
                Total en retard: {totalOverdue.toLocaleString()} FCFA
              </p>
            </div>
            <div className="ml-auto">
              <button className="text-sm font-medium text-red-800 hover:text-red-900 bg-red-100 px-3 py-1 rounded-lg">
                Relancer tous
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success notification */}
      {receivedPayments.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-800">
                Excellent ! {receivedPayments.length} paiement{receivedPayments.length > 1 ? 's' : ''} reçu{receivedPayments.length > 1 ? 's' : ''}
              </h4>
              <p className="text-sm text-green-700">
                {totalReceived.toLocaleString()} FCFA déjà perçus ce mois
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}