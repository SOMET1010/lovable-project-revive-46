/**
 * Owner Tenants Section - Gestion des locataires actuels
 */

import { Badge } from '../../ui/Badge';
import { Table, Column } from '../../ui/Table';

interface Tenant {
  id: string;
  name: string;
  property_title: string;
  property_city: string;
  monthly_rent: number;
  lease_end: string;
  phone: string;
  status: 'actif' | 'en_retard' | 'fin_contrat';
  payment_status: 'à_jour' | 'en_retard' | 'reçu';
}

interface OwnerTenantsSectionProps {
  tenants: Tenant[];
}

export function OwnerTenantsSection({ tenants }: OwnerTenantsSectionProps) {
  const getStatusBadge = (status: Tenant['status']) => {
    switch (status) {
      case 'actif':
        return <Badge variant="success" size="small">Actif</Badge>;
      case 'en_retard':
        return <Badge variant="warning" size="small">En retard</Badge>;
      case 'fin_contrat':
        return <Badge variant="info" size="small">Fin contrat</Badge>;
      default:
        return <Badge variant="default" size="small">Inconnu</Badge>;
    }
  };

  const getPaymentBadge = (paymentStatus: Tenant['payment_status']) => {
    switch (paymentStatus) {
      case 'à_jour':
        return <Badge variant="success" size="small">À jour</Badge>;
      case 'en_retard':
        return <Badge variant="error" size="small">En retard</Badge>;
      case 'reçu':
        return <Badge variant="info" size="small">Reçu</Badge>;
      default:
        return <Badge variant="default" size="small">Inconnu</Badge>;
    }
  };

  const columns: Column<Tenant>[] = [
    {
      key: 'name',
      title: 'Locataire',
      dataIndex: 'name',
      render: (value, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {record.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-text-primary">{record.name}</div>
            <div className="text-sm text-text-secondary">{record.phone}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'property',
      title: 'Propriété',
      dataIndex: 'property_title',
      render: (value, record) => (
        <div>
          <div className="font-medium text-text-primary">{value}</div>
          <div className="text-sm text-text-secondary">{record.property_city}</div>
        </div>
      ),
    },
    {
      key: 'monthly_rent',
      title: 'Loyer',
      dataIndex: 'monthly_rent',
      align: 'right',
      render: (value: number) => (
        <div className="font-semibold text-text-primary">
          {value.toLocaleString()} FCFA
        </div>
      ),
    },
    {
      key: 'lease_end',
      title: 'Échéance',
      dataIndex: 'lease_end',
      render: (value: string) => {
        const date = new Date(value);
        const isNear = (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 30;
        return (
          <div className={`${isNear ? 'text-semantic-warning font-medium' : 'text-text-primary'}`}>
            {date.toLocaleDateString('fr-FR')}
            {isNear && (
              <div className="text-xs text-semantic-warning mt-1">
                Bientôt disponible
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'Statut',
      dataIndex: 'status',
      render: (value: Tenant['status']) => getStatusBadge(value),
    },
    {
      key: 'payment_status',
      title: 'Paiement',
      dataIndex: 'payment_status',
      render: (value: Tenant['payment_status']) => getPaymentBadge(value),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <button 
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Contacter"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button 
            className="p-2 text-text-secondary hover:bg-neutral-100 rounded-lg transition-colors"
            title="Voir détails"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button 
            className="p-2 text-semantic-warning hover:bg-amber-50 rounded-lg transition-colors"
            title="Relancer paiement"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const activeTenants = tenants.filter(t => t.status === 'actif');
  const tenantsWithPaymentIssues = tenants.filter(t => t.payment_status === 'en_retard');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Mes Locataires</h2>
          <p className="text-text-secondary">Suivi de vos locataires actuels</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-semantic-success rounded-full"></div>
              <span className="text-text-secondary">Actifs: {activeTenants.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-semantic-warning rounded-full"></div>
              <span className="text-text-secondary">En retard: {tenantsWithPaymentIssues.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background-page p-4 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-semantic-success">{activeTenants.length}</div>
              <div className="text-sm text-text-secondary">Locataires actifs</div>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <span className="text-green-600">✅</span>
            </div>
          </div>
        </div>
        
        <div className="bg-background-page p-4 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-semantic-warning">{tenantsWithPaymentIssues.length}</div>
              <div className="text-sm text-text-secondary">Loyers en retard</div>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
              <span className="text-amber-600">⚠️</span>
            </div>
          </div>
        </div>
        
        <div className="bg-background-page p-4 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-text-primary">
                {tenants.reduce((sum, t) => sum + t.monthly_rent, 0).toLocaleString()}
              </div>
              <div className="text-sm text-text-secondary">Revenus mensuels (FCFA)</div>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <span className="text-primary-600">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <Table
        columns={columns}
        data={tenants}
        emptyMessage="Aucun locataire trouvé"
        rowKey="id"
      />

      {/* Alerts */}
      {tenantsWithPaymentIssues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-800">
                {tenantsWithPaymentIssues.length} loyer{tenantsWithPaymentIssues.length > 1 ? 's' : ''} en retard
              </h4>
              <p className="text-sm text-red-700">
                {tenantsWithPaymentIssues.map(t => t.name).join(', ')} n'ont pas réglé leur loyer
              </p>
            </div>
            <div className="ml-auto">
              <button className="text-sm font-medium text-red-800 hover:text-red-900 bg-red-100 px-3 py-1 rounded-lg">
                Relancer maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contracts expiring soon */}
      {tenants.filter(t => {
        const daysLeft = (new Date(t.lease_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
        return daysLeft <= 30 && daysLeft > 0;
      }).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800">
                Contrats bientôt échus
              </h4>
              <p className="text-sm text-blue-700">
                {tenants.filter(t => {
                  const daysLeft = (new Date(t.lease_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
                  return daysLeft <= 30 && daysLeft > 0;
                }).length} locataire{tenants.filter(t => {
                  const daysLeft = (new Date(t.lease_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
                  return daysLeft <= 30 && daysLeft > 0;
                }).length > 1 ? 's' : ''} ont un bail qui se termine dans les 30 jours
              </p>
            </div>
            <div className="ml-auto">
              <button className="text-sm font-medium text-blue-800 hover:text-blue-900 bg-blue-100 px-3 py-1 rounded-lg">
                Renouveler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}