import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Shield, 
  Monitor, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  Memory,
  Activity,
  Download,
  Upload,
  RefreshCw,
  Save,
  Trash2,
  Eye,
  Filter,
  Calendar,
  Globe,
  Key,
  Mail,
  Bell,
  Lock,
  Users,
  FileText,
  Terminal,
  Zap,
  WifiOff
} from 'lucide-react';

const AdminSystemSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Données système
  const systemStats = {
    uptime: '99.8%',
    cpuUsage: 23,
    memoryUsage: 67,
    diskUsage: 45,
    networkIn: '1.2 GB/s',
    networkOut: '0.8 GB/s',
    activeConnections: 1247,
    responseTime: '145ms'
  };

  // État des services
  const services = [
    {
      name: 'Base de données PostgreSQL',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '12ms',
      lastCheck: '2024-11-30 18:15'
    },
    {
      name: 'Service API ANSUT',
      status: 'healthy',
      uptime: '99.7%',
      responseTime: '89ms',
      lastCheck: '2024-11-30 18:15'
    },
    {
      name: 'Service de Notifications',
      status: 'warning',
      uptime: '98.2%',
      responseTime: '245ms',
      lastCheck: '2024-11-30 18:14'
    },
    {
      name: 'Service de Paiement',
      status: 'healthy',
      uptime: '99.8%',
      responseTime: '156ms',
      lastCheck: '2024-11-30 18:15'
    },
    {
      name: 'Service de Stockage',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '23ms',
      lastCheck: '2024-11-30 18:15'
    }
  ];

  // Logs récents
  const recentLogs = [
    {
      timestamp: '2024-11-30 18:15:23',
      level: 'info',
      service: 'API',
      message: 'Utilisateur connecté: jean.mukendi@email.com',
      user: 'system'
    },
    {
      timestamp: '2024-11-30 18:14:45',
      level: 'warning',
      service: 'Notifications',
      message: 'Retard dans l\'envoi des emails de notification',
      user: 'system'
    },
    {
      timestamp: '2024-11-30 18:13:12',
      level: 'error',
      service: 'Security',
      message: 'Tentative de connexion échouée depuis IP 192.168.1.100',
      user: 'system'
    },
    {
      timestamp: '2024-11-30 18:12:33',
      level: 'info',
      service: 'Database',
      message: 'Sauvegarde automatique terminée avec succès',
      user: 'cron'
    },
    {
      timestamp: '2024-11-30 18:11:45',
      level: 'info',
      service: 'API',
      message: 'Nouvelle propriété ajoutée: Villa Cocody',
      user: 'marie.kouassi@immoPlus.ci'
    }
  ];

  // Configuration système
  const systemConfig = {
    general: {
      platformName: 'ANSUT Platform',
      environment: 'Production',
      timezone: 'Africa/Abidjan',
      language: 'Français',
      maintenanceMode: false
    },
    security: {
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      passwordPolicy: 'Strong',
      twoFactorRequired: true,
      sslEnabled: true
    },
    email: {
      smtpHost: 'smtp.ansut.ci',
      smtpPort: 587,
      smtpUser: 'noreply@ansut.ci',
      notificationsEnabled: true
    },
    storage: {
      maxFileSize: 10485760, // 10MB
      allowedTypes: ['jpg', 'png', 'pdf', 'doc'],
      storageProvider: 'Local'
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-semantic-success';
      case 'warning':
        return 'text-semantic-warning';
      case 'error':
        return 'text-semantic-error';
      default:
        return 'text-neutral-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-semantic-success" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-semantic-warning" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-semantic-error" />;
      default:
        return <Clock className="w-5 h-5 text-neutral-600" />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-semantic-error bg-red-50';
      case 'warning':
        return 'text-semantic-warning bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-neutral-600 bg-neutral-50';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Monitor },
    { id: 'services', label: 'Services', icon: Server },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'security', label: 'Sécurité', icon: Shield }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Status global */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              État Système Global
            </h3>
            <p className="text-green-700">
              Tous les services fonctionnent normalement
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-900">{systemStats.uptime}</p>
            <p className="text-sm text-green-700">Temps de fonctionnement</p>
          </div>
        </div>
      </div>

      {/* Métriques système */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">CPU</p>
              <p className="text-2xl font-bold text-neutral-900">{systemStats.cpuUsage}%</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Cpu className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${systemStats.cpuUsage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">Mémoire</p>
              <p className="text-2xl font-bold text-neutral-900">{systemStats.memoryUsage}%</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Memory className="w-6 h-6 text-semantic-success" />
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-semantic-success h-2 rounded-full" 
                style={{ width: `${systemStats.memoryUsage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">Disque</p>
              <p className="text-2xl font-bold text-neutral-900">{systemStats.diskUsage}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <HardDrive className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full" 
                style={{ width: `${systemStats.diskUsage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">Réseau</p>
              <p className="text-lg font-bold text-neutral-900">{systemStats.responseTime}</p>
              <p className="text-xs text-neutral-600">Temps de réponse</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Wifi className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Activité réseau */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Activité Réseau
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg mr-4">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-700">Entrant</p>
              <p className="text-lg font-semibold text-neutral-900">{systemStats.networkIn}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg mr-4">
              <Upload className="w-5 h-5 text-semantic-success" />
            </div>
            <div>
              <p className="text-sm text-neutral-700">Sortant</p>
              <p className="text-lg font-semibold text-neutral-900">{systemStats.networkOut}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-lg mr-4">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-700">Connexions</p>
              <p className="text-lg font-semibold text-neutral-900">{systemStats.activeConnections}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            État des Services
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Uptime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Temps de Réponse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Dernière Vérification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {services.map((service, index) => (
                <tr key={index} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Database className="w-5 h-5 text-neutral-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {service.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(service.status)}
                      <span className={`ml-2 ${getStatusColor(service.status)} font-medium`}>
                        {service.status === 'healthy' ? 'Sain' : 
                         service.status === 'warning' ? 'Attention' : 'Erreur'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {service.uptime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {service.responseTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {service.lastCheck}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 mr-3">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      {/* Filtres logs */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <select className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Tous les niveaux</option>
            <option value="error">Erreurs</option>
            <option value="warning">Avertissements</option>
            <option value="info">Informations</option>
          </select>
          <select className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Tous les services</option>
            <option value="API">API</option>
            <option value="Database">Base de données</option>
            <option value="Security">Sécurité</option>
            <option value="Notifications">Notifications</option>
          </select>
          <input
            type="datetime-local"
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </button>
        </div>
      </div>

      {/* Liste des logs */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Logs Système ({recentLogs.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Horodatage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Niveau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Utilisateur
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {recentLogs.map((log, index) => (
                <tr key={index} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLogLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {log.service}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    {log.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {log.user}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderConfig = () => (
    <div className="space-y-6">
      {/* Configuration générale */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Configuration Générale
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Nom de la Plateforme
            </label>
            <input
              type="text"
              value={systemConfig.general.platformName}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Environnement
            </label>
            <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
              <option value="Development">Développement</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Fuseau Horaire
            </label>
            <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Africa/Abidjan">Africa/Abidjan</option>
              <option value="Europe/Paris">Europe/Paris</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Langue
            </label>
            <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Français">Français</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder la Configuration
          </button>
        </div>
      </div>

      {/* Configuration sécurité */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Configuration Sécurité
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Délai d'expiration de session (secondes)
            </label>
            <input
              type="number"
              value={systemConfig.security.sessionTimeout}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Tentatives de connexion max
            </label>
            <input
              type="number"
              value={systemConfig.security.maxLoginAttempts}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Politique de mot de passe
            </label>
            <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Strong">Fort</option>
              <option value="Medium">Moyen</option>
              <option value="Basic">Basique</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={systemConfig.security.twoFactorRequired}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
            />
            <label className="ml-2 block text-sm text-neutral-700">
              Authentification à deux facteurs requise
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      {/* Alertes de sécurité */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">
            Alertes de Sécurité
          </h3>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={systemAlerts}
              onChange={(e) => setSystemAlerts(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
            />
            <label className="ml-2 text-sm text-neutral-700">
              Activer les alertes système
            </label>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { type: 'login_attempts', count: 5, message: 'Tentatives de connexion échouées aujourd\'hui' },
            { type: 'suspicious_ips', count: 2, message: 'IPs suspectes détectées' },
            { type: 'failed_access', count: 1, message: 'Accès non autorisé tenté' }
          ].map((alert, index) => (
            <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-semantic-warning mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">{alert.message}</p>
                <p className="text-xs text-neutral-600">{alert.count} événement(s)</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Voir détails
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Certificats SSL */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Certificats SSL/TLS
        </h3>
        <div className="space-y-4">
          {[
            { domain: 'ansut.ci', expires: '2025-06-15', status: 'Valid', issuer: 'Let\'s Encrypt' },
            { domain: 'api.ansut.ci', expires: '2025-06-15', status: 'Valid', issuer: 'Let\'s Encrypt' },
            { domain: 'admin.ansut.ci', expires: '2025-06-15', status: 'Valid', issuer: 'Let\'s Encrypt' }
          ].map((cert, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-semantic-success mr-3" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">{cert.domain}</p>
                  <p className="text-xs text-neutral-600">Émis par {cert.issuer}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-900">Expire: {cert.expires}</p>
                <p className="text-xs text-semantic-success">{cert.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Administration Système
            </h2>
            <p className="text-neutral-700">
              Configuration, monitoring et maintenance de l'infrastructure ANSUT
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
              <Download className="w-4 h-4 mr-2" />
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="border-b border-neutral-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'services' && renderServices()}
          {activeTab === 'logs' && renderLogs()}
          {activeTab === 'config' && renderConfig()}
          {activeTab === 'security' && renderSecurity()}
        </div>
      </div>
    </div>
  );
};

export default AdminSystemSection;