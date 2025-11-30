/**
 * Agency Stats Section - Statistiques et KPI de l'agence
 */

import { Progress } from '../../ui/Progress';
import { Badge } from '../../ui/Badge';

interface Stats {
  totalProperties: number;
  activeMandates: number;
  monthlyRevenue: number;
  clientSatisfaction: number;
  monthlyGrowth: {
    properties: number;
    mandates: number;
    revenue: number;
    satisfaction: number;
  };
}

interface AgencyStatsSectionProps {
  stats?: Stats;
  loading: boolean;
}

export function AgencyStatsSection({ stats, loading }: AgencyStatsSectionProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-background-page rounded-xl p-6 border border-neutral-100">
            <div className="animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-neutral-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-neutral-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Propriétés',
      value: stats.totalProperties,
      suffix: 'biens',
      growth: stats.monthlyGrowth.properties,
      icon: '🏠',
      color: 'primary',
      target: 60,
    },
    {
      title: 'Mandats actifs',
      value: stats.activeMandates,
      suffix: 'mandats',
      growth: stats.monthlyGrowth.mandates,
      icon: '📋',
      color: 'info',
      target: 35,
    },
    {
      title: 'Revenus mensuels',
      value: stats.monthlyRevenue,
      format: 'currency',
      growth: stats.monthlyGrowth.revenue,
      icon: '💰',
      color: 'success',
      target: 1500000,
    },
    {
      title: 'Satisfaction client',
      value: stats.clientSatisfaction,
      suffix: '%',
      growth: stats.monthlyGrowth.satisfaction,
      icon: '⭐',
      color: 'warning',
      target: 95,
      isPercentage: true,
    },
  ];

  const chartData = [
    { month: 'Jan', sales: 1800000, target: 2000000 },
    { month: 'Fév', sales: 2100000, target: 2000000 },
    { month: 'Mar', sales: 1900000, target: 2000000 },
    { month: 'Avr', sales: 2400000, target: 2000000 },
    { month: 'Mai', sales: 2200000, target: 2000000 },
    { month: 'Jun', sales: 2600000, target: 2000000 },
    { month: 'Jul', sales: 2800000, target: 2000000 },
    { month: 'Aoû', sales: 2500000, target: 2000000 },
    { month: 'Sep', sales: 2700000, target: 2000000 },
    { month: 'Oct', sales: 2900000, target: 2000000 },
    { month: 'Nov', sales: stats.monthlyRevenue, target: 2000000 },
    { month: 'Déc', sales: 0, target: 2000000 },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="bg-background-page rounded-xl p-6 border border-neutral-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-secondary mb-1">{kpi.title}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-text-primary">
                    {kpi.format === 'currency' 
                      ? `${(kpi.value / 1000000).toFixed(1)}M`
                      : kpi.value.toLocaleString()
                    }
                  </h3>
                  {kpi.suffix && (
                    <span className="text-sm text-text-secondary">{kpi.suffix}</span>
                  )}
                </div>
              </div>
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center text-xl
                ${kpi.color === 'primary' ? 'bg-primary-50 text-primary-600' : ''}
                ${kpi.color === 'info' ? 'bg-blue-50 text-blue-600' : ''}
                ${kpi.color === 'success' ? 'bg-green-50 text-green-600' : ''}
                ${kpi.color === 'warning' ? 'bg-amber-50 text-amber-600' : ''}
              `}>
                {kpi.icon}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge 
                  variant={kpi.growth >= 0 ? 'success' : 'error'}
                  size="small"
                >
                  {kpi.growth >= 0 ? '↗️' : '↘️'} {Math.abs(kpi.growth)}%
                </Badge>
                <span className="text-xs text-text-secondary">vs mois dernier</span>
              </div>
              
              {kpi.target && (
                <div>
                  <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                    <span>Progression vers objectif</span>
                    <span>{kpi.isPercentage ? `${kpi.value}%` : `${kpi.value.toLocaleString()}`} / {kpi.target.toLocaleString()}</span>
                  </div>
                  <Progress 
                    value={kpi.isPercentage ? kpi.value : kpi.value} 
                    max={kpi.target}
                    variant={kpi.value >= kpi.target ? 'success' : 'default'}
                    size="small"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ventes mensuelles */}
        <div className="bg-background-page rounded-xl p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Ventes mensuelles</h3>
            <Badge variant="success">+15% vs objectif</Badge>
          </div>
          
          <div className="space-y-4">
            {chartData.slice(-6).map((data, index) => (
              <div key={data.month} className="flex items-center gap-4">
                <div className="w-8 text-sm font-medium text-text-secondary">{data.month}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                    <span>Ventes: {(data.sales / 1000000).toFixed(1)}M FCFA</span>
                    <span>Objectif: {(data.target / 1000000).toFixed(1)}M FCFA</span>
                  </div>
                  <Progress 
                    value={data.sales} 
                    max={data.target}
                    variant={data.sales >= data.target ? 'success' : 'default'}
                    size="small"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance équipe */}
        <div className="bg-background-page rounded-xl p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Performance équipe</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-semantic-success rounded-full"></div>
              <span className="text-sm text-text-secondary">4 agents actifs</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'Marie Kouadio', performance: 95, target: 100 },
              { name: 'Fatou Camara', performance: 92, target: 100 },
              { name: 'Jean-Baptiste Assi', performance: 88, target: 100 },
              { name: 'Aïcha Traoré', performance: 90, target: 100 },
            ].map((agent, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">{agent.name}</span>
                  <span className="text-sm text-text-secondary">{agent.performance}%</span>
                </div>
                <Progress 
                  value={agent.performance} 
                  max={agent.target}
                  variant={agent.performance >= 90 ? 'success' : agent.performance >= 75 ? 'warning' : 'error'}
                  size="small"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion prospects */}
      <div className="bg-background-page rounded-xl p-6 border border-neutral-100">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Conversion des prospects</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-500 mb-2">156</div>
            <div className="text-sm text-text-secondary">Prospects ce mois</div>
            <div className="text-xs text-semantic-success mt-1">+23% vs octobre</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-info mb-2">28</div>
            <div className="text-sm text-text-secondary">Conversions finalisées</div>
            <div className="text-xs text-semantic-success mt-1">17.9% taux conversion</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-warning mb-2">18</div>
            <div className="text-sm text-text-secondary">En cours de négociation</div>
            <div className="text-xs text-text-secondary mt-1">11.5% pipeline actif</div>
          </div>
        </div>
      </div>
    </div>
  );
}