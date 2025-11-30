import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Calendar,
  BarChart3,
  PieChart,
  Users,
  Home,
  Clock,
  CheckCircle,
  AlertTriangle,
  Award,
  Filter,
  RefreshCw,
  Share,
  Eye,
  FileBarChart,
  Activity,
  Target,
  Zap
} from 'lucide-react';

const TrustReportsSection: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportType, setReportType] = useState('overview');

  // Données mock pour les statistiques
  const reportData = {
    overview: {
      totalValidations: 156,
      validatedReports: 142,
      pendingValidations: 8,
      rejectedValidations: 6,
      conformityRate: 96,
      averageValidationTime: 2.8,
      monthlyTrend: '+15%',
      weeklyData: [
        { day: 'Lun', validations: 12, validationsRate: 95 },
        { day: 'Mar', validations: 18, validationsRate: 94 },
        { day: 'Mer', validations: 15, validationsRate: 97 },
        { day: 'Jeu', validations: 22, validationsRate: 96 },
        { day: 'Ven', validations: 20, validationsRate: 98 },
        { day: 'Sam', validations: 8, validationsRate: 93 },
        { day: 'Dim', validations: 5, validationsRate: 100 }
      ]
    },
    performance: {
      agentStats: [
        {
          name: 'Agent Jean MUKENDI',
          validations: 156,
          conformityRate: 96,
          avgTime: 2.8,
          certifications: 142
        }
      ],
      trends: {
        validationSpeed: '+12%',
        qualityScore: '+8%',
        clientSatisfaction: '+5%'
      }
    }
  };

  // Données des certifications émises
  const certificationsData = [
    {
      id: 'CERT-001',
      property: 'Villa Bellevue, Cocody',
      owner: 'M. KOUASSI Jean',
      type: 'Certification Standard ANSUT',
      issueDate: '2024-11-28',
      validUntil: '2025-11-28',
      status: 'active',
      score: 96
    },
    {
      id: 'CERT-002',
      property: 'Appartement Riviera, Plateau',
      owner: 'Mme ADJOUNI Aminata',
      type: 'Certification Premium ANSUT',
      issueDate: '2024-11-27',
      validUntil: '2025-11-27',
      status: 'active',
      score: 92
    },
    {
      id: 'CERT-003',
      property: 'Maison Yopougon, Siporex',
      owner: 'M. YAO Michel',
      type: 'Certification Standard ANSUT',
      issueDate: '2024-11-25',
      validUntil: '2025-11-25',
      status: 'active',
      score: 89
    }
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    icon: React.ReactNode;
    color: string;
    description?: string;
  }> = ({ title, value, change, icon, color, description }) => (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 ${color} rounded-lg`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-neutral-700">{title}</p>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change} ce mois
            </p>
          )}
          {description && (
            <p className="text-xs text-neutral-600 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  const CertificationCard: React.FC<{ certification: any }> = ({ certification }) => (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Award className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-neutral-900">{certification.id}</h3>
          </div>
          <p className="text-sm text-neutral-700 mb-1">{certification.property}</p>
          <p className="text-sm text-neutral-600">{certification.owner}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Active
          </span>
          <span className="text-sm font-medium text-neutral-900">Score: {certification.score}%</span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">Progression de conformité</span>
          <span className="text-sm text-neutral-600">{certification.score}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full"
            style={{ width: `${certification.score}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 text-sm text-neutral-600">
        <span>Émise le: {new Date(certification.issueDate).toLocaleDateString('fr-FR')}</span>
        <span>Expire le: {new Date(certification.validUntil).toLocaleDateString('fr-FR')}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          {certification.type}
        </span>
        <div className="flex gap-2">
          <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 rounded-lg">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-neutral-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
            <Share className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Rapports et Statistiques</h2>
          <p className="text-neutral-700 mt-1">Analysez les performances de validation et les certifications émises</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exporter PDF
          </button>
          <button className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 text-sm font-medium flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Validations"
          value={reportData.overview.totalValidations}
          change="+15%"
          icon={<FileBarChart className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          description="Propriétés analysées"
        />
        <StatCard
          title="Taux de Conformité"
          value={`${reportData.overview.conformityRate}%`}
          change="+2%"
          icon={<Target className="w-6 h-6 text-white" />}
          color="bg-green-500"
          description="Propriétés conformes"
        />
        <StatCard
          title="Temps Moyen"
          value={`${reportData.overview.averageValidationTime}j`}
          change="-0.5j"
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-amber-500"
          description="Délai de validation"
        />
        <StatCard
          title="Certifications Émises"
          value={reportData.overview.validatedReports}
          change="+18%"
          icon={<Award className="w-6 h-6 text-white" />}
          color="bg-purple-500"
          description="Certificats ANSUT"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des validations quotidiennes */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Validations Quotidiennes</h3>
            <Activity className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="space-y-4">
            {reportData.overview.weeklyData.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700 w-12">{day.day}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-neutral-200 rounded-full h-3">
                    <div 
                      className="bg-primary-600 h-3 rounded-full"
                      style={{ width: `${(day.validations / 22) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-neutral-900">{day.validations}</div>
                  <div className="text-xs text-neutral-600">{day.validationsRate}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Graphique des tendances */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Tendances de Performance</h3>
            <TrendingUp className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-neutral-700">Vitesse de Validation</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-bold text-green-600 mr-2">
                  {reportData.overview.weeklyData.reduce((acc, day) => acc + day.validations, 0)}
                </span>
                <span className="text-sm text-green-600 font-medium">
                  {reportData.performance.trends.validationSpeed}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-neutral-700">Score Qualité</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-bold text-blue-600 mr-2">96%</span>
                <span className="text-sm text-blue-600 font-medium">
                  {reportData.performance.trends.qualityScore}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-neutral-700">Satisfaction Client</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-bold text-purple-600 mr-2">4.8/5</span>
                <span className="text-sm text-purple-600 font-medium">
                  {reportData.performance.trends.clientSatisfaction}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications émises */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">Certifications ANSUT Émises</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <select className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="all">Toutes les certifications</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="active">Actives</option>
                <option value="expiring">Expirant bientôt</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {certificationsData.map((certification) => (
            <CertificationCard key={certification.id} certification={certification} />
          ))}
        </div>
      </div>

      {/* Rapport mensuel/annuel */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">Rapport Mensuel - Novembre 2024</h3>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Générer Rapport Complet
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-800">Objectif Mensuel</p>
                <p className="text-2xl font-bold text-primary-900">150</p>
                <p className="text-xs text-primary-700">Validations prévues</p>
              </div>
              <div className="p-3 bg-primary-200 rounded-lg">
                <Target className="w-6 h-6 text-primary-800" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary-700">Progression</span>
                <span className="text-primary-900 font-medium">104% (156/150)</span>
              </div>
              <div className="w-full bg-primary-200 rounded-full h-2 mt-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Qualité Moyenne</p>
                <p className="text-2xl font-bold text-green-900">96%</p>
                <p className="text-xs text-green-700">Taux de conformité</p>
              </div>
              <div className="p-3 bg-green-200 rounded-lg">
                <Award className="w-6 h-6 text-green-800" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-green-700">↑ +2% par rapport au mois dernier</p>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Efficacité</p>
                <p className="text-2xl font-bold text-blue-900">2.8j</p>
                <p className="text-xs text-blue-700">Temps moyen</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-lg">
                <Clock className="w-6 h-6 text-blue-800" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-blue-700">↓ -0.5j d'amélioration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustReportsSection;