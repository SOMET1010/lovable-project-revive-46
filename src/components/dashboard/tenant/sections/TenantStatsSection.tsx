/**
 * Tenant Stats Section - Statistiques et KPIs du dashboard
 */

import { 
  Eye, 
  FileText, 
  Calendar, 
  CreditCard, 
  TrendingUp,
  TrendingDown,
  BarChart3 
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';

interface Stats {
  propertiesViewed: number;
  applicationsSubmitted: number;
  visitsScheduled: number;
  paymentsMade: number;
  monthlyGrowth: {
    properties: number;
    applications: number;
    visits: number;
    payments: number;
  };
}

interface TenantStatsSectionProps {
  stats?: Stats;
  loading?: boolean;
}

export function TenantStatsSection({ stats, loading = false }: TenantStatsSectionProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-24"></div>
                  <div className="h-8 bg-neutral-200 rounded w-16"></div>
                  <div className="h-3 bg-neutral-200 rounded w-20"></div>
                </div>
                <div className="h-12 w-12 bg-neutral-200 rounded-xl"></div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: 'Propriétés consultées',
      value: stats?.propertiesViewed || 0,
      growth: stats?.monthlyGrowth.properties || 0,
      icon: Eye,
      color: 'blue',
      description: 'Ce mois-ci',
    },
    {
      title: 'Candidatures envoyées',
      value: stats?.applicationsSubmitted || 0,
      growth: stats?.monthlyGrowth.applications || 0,
      icon: FileText,
      color: 'amber',
      description: 'Total envoyé',
    },
    {
      title: 'Visites programmées',
      value: stats?.visitsScheduled || 0,
      growth: stats?.monthlyGrowth.visits || 0,
      icon: Calendar,
      color: 'green',
      description: 'À venir',
    },
    {
      title: 'Paiements effectués',
      value: stats?.paymentsMade || 0,
      growth: stats?.monthlyGrowth.payments || 0,
      icon: CreditCard,
      color: 'purple',
      description: 'Historique',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-500',
        trend: 'text-green-600',
      },
      amber: {
        bg: 'bg-amber-50',
        icon: 'text-amber-500',
        trend: 'text-green-600',
      },
      green: {
        bg: 'bg-green-50',
        icon: 'text-green-500',
        trend: 'text-green-600',
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'text-purple-500',
        trend: 'text-green-600',
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header avec titre et actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-h3 font-bold text-text-primary mb-2">
            Vue d'ensemble
          </h2>
          <p className="text-body text-text-secondary">
            Suivez votre activité immobilière en temps réel
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="small">
            <BarChart3 className="h-4 w-4 mr-2" />
            Détails
          </Button>
          <Button variant="ghost" size="small">
            Exporter
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          const colors = getColorClasses(item.color);
          const isPositiveGrowth = item.growth >= 0;

          return (
            <Card 
              key={index}
              variant="elevated"
              hoverable
              className="group cursor-default"
            >
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-2 rounded-xl ${colors.bg}`}>
                        <Icon className={`h-5 w-5 ${colors.icon}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-small font-medium text-text-secondary">
                          {item.title}
                        </p>
                        <p className="text-xs text-text-disabled">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-text-primary">
                          {item.value.toLocaleString()}
                        </span>
                        {item.growth !== 0 && (
                          <div className={`
                            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                            ${isPositiveGrowth 
                              ? 'bg-green-50 text-green-700' 
                              : 'bg-red-50 text-red-700'
                            }
                          `}>
                            {isPositiveGrowth ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {Math.abs(item.growth)}%
                          </div>
                        )}
                      </div>
                      
                      {/* Mini graphique inline (placeholder) */}
                      <div className="h-8 flex items-end gap-1 opacity-60">
                        {Array.from({ length: 12 }).map((_, i) => {
                          const height = Math.random() * 24 + 8;
                          return (
                            <div
                              key={i}
                              className={`
                                w-1 rounded-full transition-all duration-300
                                ${i < 8 
                                  ? 'bg-current opacity-40 group-hover:opacity-60' 
                                  : 'bg-current opacity-20'
                                }
                              `}
                              style={{ height: `${height}px` }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Graphique principal - Mock Chart.js/Recharts placeholder */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Évolution mensuelle</CardTitle>
              <CardDescription>
                Suivi de votre activité sur les 4 derniers mois
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="small">
                3M
              </Button>
              <Button variant="ghost" size="small" className="bg-primary-50 text-primary-700">
                6M
              </Button>
              <Button variant="ghost" size="small">
                1A
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {/* Placeholder pour le graphique */}
          <div className="h-64 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-text-disabled mx-auto mb-3" />
              <p className="text-text-secondary font-medium">Graphique en temps réel</p>
              <p className="text-small text-text-disabled">
                Intégration Chart.js ou Recharts à venir
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}