/**
 * Owner Stats Section - Statistiques et KPIs du dashboard propriétaire
 */

import { Progress } from '../../ui/Progress';

interface OwnerStatsSectionProps {
  stats?: {
    totalProperties: number;
    occupiedProperties: number;
    monthlyRevenue: number;
    occupancyRate: number;
    yearlyGrowth: {
      revenue: number;
      occupancy: number;
      applications: number;
    };
  };
  loading: boolean;
}

export function OwnerStatsSection({ stats, loading }: OwnerStatsSectionProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-background-page p-6 rounded-xl border border-neutral-100 animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-neutral-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-neutral-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  const kpiItems = [
    {
      title: 'Total Propriétés',
      value: stats.totalProperties,
      unit: 'biens',
      growth: '+2 ce mois',
      trend: 'up' as const,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'Propriétés Occupées',
      value: stats.occupiedProperties,
      unit: 'occupées',
      growth: `${stats.totalProperties - stats.occupiedProperties} libres`,
      trend: 'stable' as const,
      color: 'text-semantic-success',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Revenus Mensuels',
      value: stats.monthlyRevenue,
      unit: 'FCFA',
      growth: `+${stats.yearlyGrowth.revenue}% cette année`,
      trend: 'up' as const,
      color: 'text-semantic-info',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Taux d\'Occupation',
      value: stats.occupancyRate,
      unit: '%',
      growth: `+${stats.yearlyGrowth.occupancy}% vs l'an dernier`,
      trend: 'up' as const,
      color: 'text-semantic-success',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Tableau de bord</h2>
          <p className="text-text-secondary">Vue d'ensemble de votre portefeuille immobilier</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-semantic-success/10 rounded-lg">
            <div className="w-2 h-2 bg-semantic-success rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-semantic-success">Performance excellente</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiItems.map((item, index) => (
          <div 
            key={index}
            className="bg-background-page p-6 rounded-xl border border-neutral-100 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${item.bgColor}`}>
                <div className={`text-2xl ${item.color}`}>
                  {index === 0 && '🏠'}
                  {index === 1 && '✅'}
                  {index === 2 && '💰'}
                  {index === 3 && '📈'}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-sm ${
                  item.trend === 'up' ? 'text-semantic-success' : 
                  item.trend === 'down' ? 'text-semantic-error' : 'text-text-secondary'
                }`}>
                  {item.trend === 'up' && '↗️'}
                  {item.trend === 'down' && '↘️'}
                  {item.trend === 'stable' && '➡️'}
                </span>
              </div>
            </div>
            
            <div className="mb-3">
              <h3 className="text-sm font-medium text-text-secondary mb-1">{item.title}</h3>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${item.color}`}>
                  {index === 2 ? item.value.toLocaleString() : item.value}
                </span>
                <span className="text-sm text-text-secondary">{item.unit}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">{item.growth}</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  item.trend === 'up' ? 'bg-semantic-success' : 
                  item.trend === 'down' ? 'bg-semantic-error' : 'bg-neutral-400'
                }`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique Revenus Mensuels */}
        <div className="bg-background-page p-6 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Revenus Mensuels</h3>
              <p className="text-sm text-text-secondary">Évolution des 6 derniers mois</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-semantic-success/10 rounded-lg">
              <span className="text-sm font-medium text-semantic-success">+18%</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { month: 'Juin', amount: 385000, growth: 12 },
              { month: 'Juillet', amount: 405000, growth: 5 },
              { month: 'Août', amount: 395000, growth: -2 },
              { month: 'Septembre', amount: 415000, growth: 5 },
              { month: 'Octobre', amount: 420000, growth: 1 },
              { month: 'Novembre', amount: 425000, growth: 1 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium text-text-secondary w-16">{item.month}</span>
                  <div className="flex-1">
                    <Progress 
                      value={item.amount} 
                      max={450000} 
                      variant="success"
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 w-24">
                  <span className="text-sm font-semibold text-text-primary">
                    {(item.amount / 1000).toFixed(0)}k
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.growth >= 0 
                      ? 'bg-green-50 text-semantic-success' 
                      : 'bg-red-50 text-semantic-error'
                  }`}>
                    {item.growth >= 0 ? '+' : ''}{item.growth}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statut Global */}
        <div className="bg-background-page p-6 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Statut Global</h3>
              <p className="text-sm text-text-secondary">Santé de votre portefeuille</p>
            </div>
            <div className="w-12 h-12 bg-semantic-success/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Taux d'occupation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">Taux d'Occupation</span>
                <span className="text-sm font-semibold text-semantic-success">{stats.occupancyRate}%</span>
              </div>
              <Progress 
                value={stats.occupancyRate} 
                max={100}
                variant="success"
                showValue={true}
                label="Excellent"
                animated
              />
            </div>

            {/* Revenus vs Objectifs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">Objectif Revenus</span>
                <span className="text-sm font-semibold text-semantic-info">98%</span>
              </div>
              <Progress 
                value={98} 
                max={100}
                variant="info"
                showValue={true}
                label="Presque atteint"
              />
            </div>

            {/* Satisfecit locataire */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">Satisfaction Locataires</span>
                <span className="text-sm font-semibold text-semantic-success">95%</span>
              </div>
              <Progress 
                value={95} 
                max={100}
                variant="success"
                showValue={true}
                label="Excellent"
              />
            </div>
          </div>

          {/* Alertes */}
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <h4 className="text-sm font-medium text-text-primary mb-3">Points d'attention</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                <span className="text-amber-600">⚠️</span>
                <span className="text-sm text-amber-700">2 loyers en retard</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <span className="text-blue-600">📋</span>
                <span className="text-sm text-blue-700">3 candidatures en attente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}