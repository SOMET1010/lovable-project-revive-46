import React from 'react';
import { 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  Building,
  Eye,
  Download,
  Star,
  Target,
  Award,
  BarChart3,
  PieChart
} from 'lucide-react';

export interface ApplicationStats {
  total: number;
  pending: number;
  inProgress: number;
  accepted: number;
  rejected: number;
  cancelled?: number;
  withIncompleteDocs: number;
  withCompleteDocs: number;
  underReview: number;
  totalValue?: number;
  averageRent?: number;
  conversionRate?: number;
  responseTime?: number;
  topProperty?: {
    title: string;
    applications: number;
  };
  recentActivity?: {
    date: string;
    count: number;
    type: string;
  }[];
  priorityBreakdown?: {
    haute: number;
    normale: number;
    basse: number;
  };
  statusTrend?: {
    period: string;
    applications: number;
    change: number;
  }[];
}

interface ApplicationStatsProps {
  stats: ApplicationStats;
  role: 'tenant' | 'owner' | 'agency';
  timeFrame?: 'week' | 'month' | 'quarter' | 'year';
  onTimeFrameChange?: (timeFrame: 'week' | 'month' | 'quarter' | 'year') => void;
  showTrends?: boolean;
  compact?: boolean;
}

const ApplicationStats: React.FC<ApplicationStatsProps> = ({
  stats,
  role,
  timeFrame = 'month',
  onTimeFrameChange,
  showTrends = true,
  compact = false
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const getConversionRate = () => {
    if (stats.total === 0) return 0;
    return ((stats.accepted / stats.total) * 100);
  };

  const getRejectionRate = () => {
    if (stats.total === 0) return 0;
    return ((stats.rejected / stats.total) * 100);
  };

  const getProcessingTime = () => {
    if (stats.responseTime) {
      return `${stats.responseTime}j en moyenne`;
    }
    return 'N/A';
  };

  const getTimeFrameLabel = () => {
    switch (timeFrame) {
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      case 'quarter': return 'Ce trimestre';
      case 'year': return 'Cette année';
      default: return 'Ce mois';
    }
  };

  const renderMainStats = () => {
    if (compact) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Total Applications */}
          <div className="bg-white rounded-lg p-3 border border-neutral-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-neutral-600">Total</p>
                <p className="text-lg font-bold text-neutral-900">{stats.total}</p>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-lg p-3 border border-neutral-200">
            <div className="flex items-center">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-neutral-600">En attente</p>
                <p className="text-lg font-bold text-neutral-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          {/* Accepted */}
          <div className="bg-white rounded-lg p-3 border border-neutral-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-neutral-600">Acceptées</p>
                <p className="text-lg font-bold text-neutral-900">{stats.accepted}</p>
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-lg p-3 border border-neutral-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-neutral-600">Taux conversion</p>
                <p className="text-lg font-bold text-neutral-900">{getConversionRate().toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Applications */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-600">Total candidatures</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                {showTrends && stats.statusTrend && (
                  <div className={`ml-2 flex items-center text-xs ${
                    stats.statusTrend[0]?.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.statusTrend[0]?.change > 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(stats.statusTrend[0]?.change || 0)}%
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-500">{getTimeFrameLabel()}</p>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-600">En attente</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.pending}</p>
              <p className="text-xs text-neutral-500">
                {stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : 0}% du total
              </p>
            </div>
          </div>
        </div>

        {/* Accepted */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-600">Acceptées</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.accepted}</p>
              <p className="text-xs text-neutral-500">
                {getConversionRate().toFixed(1)}% de conversion
              </p>
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-red-50 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-600">Refusées</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.rejected}</p>
              <p className="text-xs text-neutral-500">
                {getRejectionRate().toFixed(1)}% de rejet
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSecondaryStats = () => {
    if (compact) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* In Progress */}
        {stats.inProgress > 0 && (
          <div className="bg-white rounded-lg p-4 border border-neutral-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-neutral-600">En cours</p>
                <p className="text-xl font-bold text-neutral-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>
        )}

        {/* Documents Status */}
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-600">Docs complets</p>
              <p className="text-xl font-bold text-neutral-900">{stats.withCompleteDocs}</p>
              <p className="text-xs text-neutral-500">
                {stats.total > 0 ? ((stats.withCompleteDocs / stats.total) * 100).toFixed(0) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Average Rent (for tenants) or Total Value (for owners/agencies) */}
        {(stats.averageRent || stats.totalValue) && (
          <div className="bg-white rounded-lg p-4 border border-neutral-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-neutral-600">
                  {role === 'tenant' ? 'Loyer moyen' : 'Valeur totale'}
                </p>
                <p className="text-xl font-bold text-neutral-900">
                  {role === 'tenant' && stats.averageRent
                    ? formatCurrency(stats.averageRent)
                    : stats.totalValue
                    ? formatNumber(stats.totalValue)
                    : 'N/A'
                  }
                </p>
                {role === 'tenant' && <p className="text-xs text-neutral-500">par mois</p>}
              </div>
            </div>
          </div>
        )}

        {/* Response Time */}
        {stats.responseTime && (
          <div className="bg-white rounded-lg p-4 border border-neutral-200">
            <div className="flex items-center">
              <div className="p-2 bg-cyan-50 rounded-lg">
                <Clock className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-neutral-600">Temps de réponse</p>
                <p className="text-xl font-bold text-neutral-900">{getProcessingTime()}</p>
                <p className="text-xs text-neutral-500">temps moyen</p>
              </div>
            </div>
          </div>
        )}

        {/* Top Property (for owners/agencies) */}
        {stats.topProperty && (role === 'owner' || role === 'agency') && (
          <div className="bg-white rounded-lg p-4 border border-neutral-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Building className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-neutral-600">Top propriété</p>
                <p className="text-sm font-bold text-neutral-900 truncate">
                  {stats.topProperty.title}
                </p>
                <p className="text-xs text-neutral-500">
                  {stats.topProperty.applications} candidatures
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Priority Breakdown (for owners/agencies) */}
        {stats.priorityBreakdown && (role === 'owner' || role === 'agency') && (
          <div className="bg-white rounded-lg p-4 border border-neutral-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-neutral-600">Priorités</p>
                <div className="text-xs text-neutral-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Haute:</span>
                    <span className="font-medium">{stats.priorityBreakdown.haute}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Normale:</span>
                    <span className="font-medium">{stats.priorityBreakdown.normale}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Basse:</span>
                    <span className="font-medium">{stats.priorityBreakdown.basse}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTrends = () => {
    if (!showTrends || !stats.statusTrend || stats.statusTrend.length === 0) {
      return null;
    }

    return (
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Tendances</h3>
          {onTimeFrameChange && (
            <div className="flex space-x-2">
              {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => onTimeFrameChange(period)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
                    timeFrame === period
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {period === 'week' ? 'Semaine' : 
                   period === 'month' ? 'Mois' :
                   period === 'quarter' ? 'Trimestre' : 'Année'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {stats.statusTrend.map((trend, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-sm text-neutral-600 w-20">{trend.period}</div>
                <div className="flex items-center ml-4">
                  <BarChart3 className="w-4 h-4 text-neutral-500 mr-2" />
                  <span className="text-sm font-medium">{trend.applications} candidatures</span>
                </div>
              </div>
              <div className={`flex items-center text-sm ${
                trend.change > 0 ? 'text-green-600' : trend.change < 0 ? 'text-red-600' : 'text-neutral-500'
              }`}>
                {trend.change > 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : trend.change < 0 ? (
                  <TrendingDown className="w-4 h-4 mr-1" />
                ) : null}
                {trend.change !== 0 ? `${Math.abs(trend.change)}%` : 'stable'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecentActivity = () => {
    if (!stats.recentActivity || stats.recentActivity.length === 0) {
      return null;
    }

    return (
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Activité récente</h3>
        <div className="space-y-3">
          {stats.recentActivity.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                <span className="text-sm text-neutral-700">
                  {activity.type} - {activity.count} candidature{activity.count !== 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-xs text-neutral-500">
                {new Date(activity.date).toLocaleDateString('fr-FR')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Time Frame Selector */}
      {onTimeFrameChange && !compact && (
        <div className="flex justify-end">
          <div className="flex space-x-2">
            {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => onTimeFrameChange(period)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
                  timeFrame === period
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {period === 'week' ? 'Semaine' : 
                 period === 'month' ? 'Mois' :
                 period === 'quarter' ? 'Trimestre' : 'Année'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Stats */}
      {renderMainStats()}

      {/* Secondary Stats */}
      {renderSecondaryStats()}

      {/* Trends and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderTrends()}
        {renderRecentActivity()}
      </div>
    </div>
  );
};

export default ApplicationStats;