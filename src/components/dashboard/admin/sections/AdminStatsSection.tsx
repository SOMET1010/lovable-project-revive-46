/**
 * Admin Stats Section - Statistiques globales et KPIs système
 */

interface AdminStatsSectionProps {
  stats?: {
    totalUsers: number;
    totalProperties: number;
    totalTransactions: number;
    systemUptime: string;
    monthlyGrowth: {
      users: number;
      properties: number;
      transactions: number;
      revenue: number;
    };
    criticalAlerts: number;
    pendingModerations: number;
  };
  alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  loading: boolean;
}

export function AdminStatsSection({ stats, alerts, loading }: AdminStatsSectionProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-background-page rounded-2xl border border-neutral-100 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-neutral-200 rounded w-24"></div>
              <div className="h-8 w-8 bg-neutral-200 rounded-lg"></div>
            </div>
            <div className="h-8 bg-neutral-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-neutral-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value}%`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-success-600' : 'text-semantic-error';
  };

  const getGrowthBg = (growth: number) => {
    return growth >= 0 ? 'bg-success-50 border-success-200' : 'bg-red-50 border-red-200';
  };

  const kpiCards = [
    {
      title: 'Utilisateurs Totaux',
      value: formatNumber(stats.totalUsers),
      growth: stats.monthlyGrowth.users,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'Propriétés',
      value: formatNumber(stats.totalProperties),
      growth: stats.monthlyGrowth.properties,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      title: 'Transactions',
      value: formatNumber(stats.totalTransactions),
      growth: stats.monthlyGrowth.transactions,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: 'text-semantic-info',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Uptime Système',
      value: stats.systemUptime,
      growth: 0.2, // Static small growth
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'text-semantic-warning',
      bgColor: 'bg-yellow-50',
    },
  ];

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high');
  const recentAlerts = alerts.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="bg-background-page rounded-2xl border border-neutral-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-text-secondary">{kpi.title}</h3>
              <div className={`${kpi.bgColor} p-2 rounded-lg`}>
                <div className={kpi.color}>{kpi.icon}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-text-primary">{kpi.value}</div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getGrowthBg(kpi.growth)}`}>
                  <span className={`mr-1 ${getGrowthColor(kpi.growth)}`}>
                    {kpi.growth > 0 ? '↗' : kpi.growth < 0 ? '↘' : '→'}
                  </span>
                  {kpi.growth !== 0 ? formatPercentage(kpi.growth) : 'Stable'}
                </span>
                <span className="text-xs text-neutral-500">vs mois dernier</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Status & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="lg:col-span-2 bg-background-page rounded-2xl border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-h6 font-semibold text-text-primary">Santé du Système</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-success-50 border border-success-200 rounded-full">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-success-700">Opérationnel</span>
            </div>
          </div>

          {/* Simple Chart Simulation */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Performance serveur</span>
                <span className="font-medium text-text-primary">78%</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div className="bg-success-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Utilisation mémoire</span>
                <span className="font-medium text-text-primary">65%</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div className="bg-semantic-info h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Base de données</span>
                <span className="font-medium text-text-primary">92%</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div className="bg-semantic-warning h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-text-primary">2.3s</div>
                <div className="text-xs text-neutral-500">Temps réponse moyen</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">99.9%</div>
                <div className="text-xs text-neutral-500">Disponibilité 30j</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">1.2M</div>
                <div className="text-xs text-neutral-500">Requêtes/jour</div>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-background-page rounded-2xl border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-h6 font-semibold text-text-primary">Alertes Critiques</h3>
            <span className="bg-semantic-error text-white text-xs px-2 py-1 rounded-full font-semibold">
              {criticalAlerts.length}
            </span>
          </div>

          <div className="space-y-3">
            {criticalAlerts.length > 0 ? (
              criticalAlerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg border border-red-200 bg-red-50">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">
                      {alert.type === 'error' ? '❌' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-800 truncate">
                        {alert.message}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {new Date(alert.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-success-600 mb-2">
                  <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-neutral-500">Aucune alerte critique</p>
              </div>
            )}
          </div>

          {alerts.length > criticalAlerts.length && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                Voir toutes les alertes ({alerts.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-background-page rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-h6 font-semibold text-text-primary mb-6">Activité Récente</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">47</div>
            <div className="text-sm text-neutral-600">Nouveaux utilisateurs aujourd'hui</div>
            <div className="text-xs text-success-600 mt-1">+23% vs hier</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600 mb-2">12</div>
            <div className="text-sm text-neutral-600">Propriétés en attente</div>
            <div className="text-xs text-neutral-500 mt-1">Modération requise</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-semantic-info mb-2">156</div>
            <div className="text-sm text-neutral-600">Transactions aujourd'hui</div>
            <div className="text-xs text-success-600 mt-1">+31% vs semaine dernière</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-semantic-warning mb-2">98.5%</div>
            <div className="text-sm text-neutral-600">Uptime système</div>
            <div className="text-xs text-neutral-500 mt-1">30 derniers jours</div>
          </div>
        </div>
      </div>
    </div>
  );
}