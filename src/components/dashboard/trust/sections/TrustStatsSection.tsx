import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Award,
  Calendar,
  BarChart3,
  Target,
  Activity,
  Users
} from 'lucide-react';

interface TrustStatsData {
  totalInspections: number;
  validatedReports: number;
  pendingValidation: number;
  conformityRate: number;
  certificationsIssued: number;
  averageValidationTime: number;
  weeklyInspections: number[];
  monthlyTrend: string;
}

interface TrustStatsSectionProps {
  data: TrustStatsData;
}

const TrustStatsSection: React.FC<TrustStatsSectionProps> = ({ data }) => {
  // Calculs dérivés
  const conformityColor = data.conformityRate >= 95 ? 'text-semantic-success' : 
                         data.conformityRate >= 85 ? 'text-semantic-warning' : 'text-semantic-error';
  
  const performanceScore = Math.round((data.validatedReports / data.totalInspections) * 100);
  
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Tableau de Bord ANSUT
            </h2>
            <p className="text-neutral-700">
              Vue d'ensemble des performances de certification et validation
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-center">
              <p className="text-sm text-neutral-600">Performance</p>
              <p className="text-2xl font-bold text-primary-600">{performanceScore}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-neutral-600">Trend</p>
              <p className="text-lg font-semibold text-semantic-success">{data.monthlyTrend}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Inspections */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">
                Inspections Totales
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {data.totalInspections}
              </p>
              <p className="text-sm text-semantic-success mt-1">
                +12% ce mois
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Validated Reports */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">
                Rapports Validés
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {data.validatedReports}
              </p>
              <p className="text-sm text-semantic-success mt-1">
                82% du total
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-semantic-success" />
            </div>
          </div>
        </div>

        {/* Pending Validation */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">
                En Attente
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {data.pendingValidation}
              </p>
              <p className="text-sm text-semantic-warning mt-1">
                À traiter
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock className="w-6 h-6 text-semantic-warning" />
            </div>
          </div>
        </div>

        {/* Conformity Rate */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">
                Taux de Conformité
              </p>
              <p className={`text-3xl font-bold ${conformityColor}`}>
                {data.conformityRate}%
              </p>
              <p className="text-sm text-semantic-success mt-1">
                Excellent
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Target className="w-6 h-6 text-semantic-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Inspections Chart */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">
              Inspections Hebdomadaires
            </h3>
            <BarChart3 className="w-5 h-5 text-neutral-500" />
          </div>
          
          <div className="space-y-4">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => {
              const value = data.weeklyInspections[index];
              const maxValue = Math.max(...data.weeklyInspections);
              const percentage = (value / maxValue) * 100;
              
              return (
                <div key={day} className="flex items-center">
                  <span className="w-8 text-sm text-neutral-700">{day}</span>
                  <div className="flex-1 mx-3">
                    <div className="bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-sm font-medium text-neutral-900 text-right">
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validation Metrics */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">
              Métriques de Validation
            </h3>
            <Activity className="w-5 h-5 text-neutral-500" />
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-neutral-700">
                  Temps Moyen de Validation
                </span>
                <span className="text-sm font-bold text-neutral-900">
                  {data.averageValidationTime} jours
                </span>
              </div>
              <div className="bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(data.averageValidationTime / 7) * 100}%` }}
                />
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                Objectif: 3 jours
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-neutral-700">
                  Certificats Émis
                </span>
                <span className="text-sm font-bold text-neutral-900">
                  {data.certificationsIssued}
                </span>
              </div>
              <div className="bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(data.certificationsIssued / data.totalInspections) * 100}%` }}
                />
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                Sur {data.totalInspections} inspections
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-neutral-700">
                  Score de Performance
                </span>
                <span className="text-sm font-bold text-semantic-success">
                  {performanceScore}/100
                </span>
              </div>
              <div className="bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${performanceScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">
            Activité Récente ANSUT
          </h3>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Voir tout
          </button>
        </div>
        
        <div className="space-y-4">
          {[
            {
              action: 'Rapport validé',
              property: 'Villa Bellevue, Cocody',
              time: 'Il y a 2h',
              icon: CheckCircle,
              color: 'text-semantic-success',
              bgColor: 'bg-green-50'
            },
            {
              action: 'Inspection programmée',
              property: 'Appartement Riviera, Marcory',
              time: 'Il y a 4h',
              icon: Calendar,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              action: 'Certificat émis',
              property: 'Résidence Les Palmiers, Abidjan',
              time: 'Il y a 6h',
              icon: Award,
              color: 'text-amber-600',
              bgColor: 'bg-amber-50'
            },
            {
              action: 'Rapport en attente',
              property: 'Immeuble Plateau Centre',
              time: 'Il y a 8h',
              icon: Clock,
              color: 'text-semantic-warning',
              bgColor: 'bg-yellow-50'
            }
          ].map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-center p-3 bg-neutral-50 rounded-lg">
                <div className={`p-2 ${activity.bgColor} rounded-lg mr-4`}>
                  <Icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-neutral-700">
                    {activity.property}
                  </p>
                </div>
                <span className="text-xs text-neutral-500">
                  {activity.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrustStatsSection;