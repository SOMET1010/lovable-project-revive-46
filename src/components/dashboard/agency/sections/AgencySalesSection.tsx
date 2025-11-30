/**
 * Agency Sales Section - Suivi des ventes et revenus
 */

import { useState } from 'react';
import { Badge } from '../../ui/Badge';
import { Table } from '../../ui/Table';

interface Sale {
  id: string;
  clientName: string;
  propertyTitle: string;
  amount: number;
  commission: number;
  date: string;
  status: 'en_cours' | 'finalise' | 'annule';
  agentId: string;
}

interface AgencySalesSectionProps {
  sales: Sale[];
  showHeader?: boolean;
}

export function AgencySalesSection({ sales, showHeader = false }: AgencySalesSectionProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'en_cours' | 'finalise' | 'annule'>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('tous');

  const filteredSales = sales.filter(sale => {
    if (filterStatus !== 'all' && sale.status !== filterStatus) return false;
    
    if (filterPeriod !== 'tous') {
      const saleDate = new Date(sale.date);
      const now = new Date();
      const monthsDiff = (now.getFullYear() - saleDate.getFullYear()) * 12 + (now.getMonth() - saleDate.getMonth());
      
      switch (filterPeriod) {
        case '30j':
          return monthsDiff === 0;
        case '3m':
          return monthsDiff <= 3;
        case '6m':
          return monthsDiff <= 6;
        case '1a':
          return monthsDiff <= 12;
        default:
          return true;
      }
    }
    
    return true;
  });

  const statusColors = {
    en_cours: 'info',
    finalise: 'success',
    annule: 'error',
  } as const;

  const statusLabels = {
    en_cours: 'En cours',
    finalise: 'Finalisée',
    annule: 'Annulée',
  };

  // Calculs statistiques
  const totalSales = filteredSales.reduce((acc, sale) => acc + sale.amount, 0);
  const totalCommissions = filteredSales.reduce((acc, sale) => acc + sale.commission, 0);
  const averageSale = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;
  const finalisedSales = filteredSales.filter(s => s.status === 'finalise').length;
  const conversionRate = sales.length > 0 ? (finalisedSales / sales.length) * 100 : 0;

  const columns = [
    {
      key: 'client',
      title: 'Client',
      dataIndex: 'clientName',
      render: (value: string) => (
        <div className="font-medium text-text-primary">{value}</div>
      ),
    },
    {
      key: 'property',
      title: 'Propriété',
      dataIndex: 'propertyTitle',
      render: (value: string) => (
        <div className="text-text-primary">{value}</div>
      ),
    },
    {
      key: 'amount',
      title: 'Montant',
      dataIndex: 'amount',
      align: 'right' as const,
      render: (value: number) => (
        <div className="font-semibold text-text-primary">
          {value.toLocaleString()} FCFA
        </div>
      ),
    },
    {
      key: 'commission',
      title: 'Commission',
      dataIndex: 'commission',
      align: 'right' as const,
      render: (value: number) => (
        <div className="text-semantic-success font-medium">
          {value.toLocaleString()} FCFA
        </div>
      ),
    },
    {
      key: 'date',
      title: 'Date',
      dataIndex: 'date',
      render: (value: string) => (
        <div className="text-text-secondary">
          {new Date(value).toLocaleDateString('fr-FR')}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Statut',
      dataIndex: 'status',
      render: (value: string) => (
        <Badge variant={statusColors[value as keyof typeof statusColors] as any}>
          {statusLabels[value as keyof typeof statusLabels]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record: Sale) => (
        <div className="flex items-center gap-2">
          <button 
            className="px-2 py-1 bg-primary-500 text-white rounded text-xs hover:bg-primary-600 transition-colors"
            title="Voir détails"
          >
            👁️
          </button>
          <button 
            className="px-2 py-1 border border-neutral-200 rounded text-xs hover:bg-neutral-50 transition-colors"
            title="Télécharger facture"
          >
            📄
          </button>
          <button 
            className="px-2 py-1 border border-neutral-200 rounded text-xs hover:bg-neutral-50 transition-colors"
            title="Ajouter note"
          >
            ✏️
          </button>
        </div>
      ),
    },
  ];

  const data = filteredSales.map(sale => ({
    ...sale,
    client: sale.clientName,
  }));

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Ventes et revenus</h2>
            <p className="text-text-secondary">Suivi de {sales.length} transactions</p>
          </div>
          <button className="btn-primary">
            ➕ Nouvelle vente
          </button>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-background-page rounded-xl p-4 border border-neutral-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Statut</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_cours">En cours</option>
              <option value="finalise">Finalisées</option>
              <option value="annule">Annulées</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Période</label>
            <select 
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="tous">Toutes les périodes</option>
              <option value="30j">30 derniers jours</option>
              <option value="3m">3 derniers mois</option>
              <option value="6m">6 derniers mois</option>
              <option value="1a">Dernière année</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
          <span className="text-sm text-text-secondary">
            {filteredSales.length} vente(s) trouvée(s)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Trier par:</span>
            <select className="text-sm px-2 py-1 border border-neutral-200 rounded">
              <option>Date décroissante</option>
              <option>Montant décroissant</option>
              <option>Commission décroissante</option>
              <option>Client A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-background-page rounded-xl p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-text-secondary">CA Total</h4>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-2xl font-bold text-text-primary mb-1">
            {(totalSales / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-text-secondary">FCFA</div>
          <div className="text-xs text-semantic-success mt-2">Chiffre d'affaires</div>
        </div>
        
        <div className="bg-background-page rounded-xl p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-text-secondary">Commissions</h4>
            <span className="text-2xl">💎</span>
          </div>
          <div className="text-2xl font-bold text-semantic-success mb-1">
            {(totalCommissions / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-text-secondary">FCFA</div>
          <div className="text-xs text-text-secondary mt-2">
            {((totalCommissions / totalSales) * 100).toFixed(1)}% du CA
          </div>
        </div>
        
        <div className="bg-background-page rounded-xl p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-text-secondary">Vente moyenne</h4>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-2xl font-bold text-primary-500 mb-1">
            {(averageSale / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-text-secondary">FCFA</div>
          <div className="text-xs text-text-secondary mt-2">Par transaction</div>
        </div>
        
        <div className="bg-background-page rounded-xl p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-text-secondary">Taux conversion</h4>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="text-2xl font-bold text-warning mb-1">
            {conversionRate.toFixed(1)}%
          </div>
          <div className="text-sm text-text-secondary">Opérations</div>
          <div className="text-xs text-semantic-success mt-2">
            {finalisedSales} finalisées
          </div>
        </div>
      </div>

      {/* Tableau des ventes */}
      <Table 
        columns={columns}
        data={data}
        emptyMessage="Aucune vente trouvée pour cette période"
      />

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenus par agent */}
        <div className="bg-background-page rounded-xl p-6 border border-neutral-100">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Revenus par agent</h3>
          
          <div className="space-y-4">
            {[
              { name: 'Marie Kouadio', commission: 3750000, percentage: 35 },
              { name: 'Fatou Camara', commission: 2900000, percentage: 27 },
              { name: 'Jean-Baptiste Assi', commission: 2200000, percentage: 21 },
              { name: 'Aïcha Traoré', commission: 1800000, percentage: 17 },
            ].map((agent, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">{agent.name}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-semantic-success">
                      {(agent.commission / 1000000).toFixed(1)}M FCFA
                    </div>
                    <div className="text-xs text-text-secondary">{agent.percentage}%</div>
                  </div>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-semantic-success h-2 rounded-full transition-all duration-300"
                    style={{ width: `${agent.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Évolution mensuelle */}
        <div className="bg-background-page rounded-xl p-6 border border-neutral-100">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Évolution mensuelle</h3>
          
          <div className="space-y-4">
            {[
              { month: 'Déc 2025', revenue: 1200000, target: 1500000, status: 'en_cours' },
              { month: 'Nov 2025', revenue: 2800000, target: 1500000, status: 'atteint' },
              { month: 'Oct 2025', revenue: 2200000, target: 1500000, status: 'atteint' },
              { month: 'Sep 2025', revenue: 1900000, target: 1500000, status: 'atteint' },
              { month: 'Aoû 2025', revenue: 2500000, target: 1500000, status: 'atteint' },
            ].map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">{data.month}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-text-primary">
                      {(data.revenue / 1000000).toFixed(1)}M FCFA
                    </div>
                    <div className="text-xs text-text-secondary">
                      Objectif: {(data.target / 1000000).toFixed(1)}M FCFA
                    </div>
                  </div>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className={`
                      h-2 rounded-full transition-all duration-300
                      ${data.status === 'atteint' ? 'bg-semantic-success' : 'bg-primary-500'}
                    `}
                    style={{ width: `${Math.min((data.revenue / data.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-background-page rounded-xl p-4 border border-neutral-100">
        <h3 className="font-semibold text-text-primary mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
            <span>📄</span>
            <span>Générer facture</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
            <span>📊</span>
            <span>Rapport commission</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
            <span>📈</span>
            <span>Analyses vente</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
            <span>🎯</span>
            <span>Objectifs équipe</span>
          </button>
        </div>
      </div>
    </div>
  );
}