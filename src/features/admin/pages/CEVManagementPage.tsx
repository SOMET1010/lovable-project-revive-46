import { useState, useEffect } from 'react';
import {
  Shield, Search, Download, CheckCircle, XCircle, Clock, AlertCircle,
  Eye, Coins, FileText, Calendar, CreditCard,
  RefreshCw, Plus, BarChart3, ArrowUpRight, Globe
} from 'lucide-react';

interface CEVRequest {
  id: string;
  cev_number: string;
  oneci_reference_number: string;
  landlord: {
    full_name: string;
    email: string;
  };
  tenant: {
    full_name: string;
    email: string;
  };
  property: {
    title: string;
    address: string;
  };
  status: 'pending_documents' | 'submitted' | 'under_review' | 'documents_requested' | 'approved' | 'issued' | 'rejected';
  created_at: string;
  cev_fee_amount: number;
  cev_fee_paid: boolean;
  processing_time?: number;
}

interface CEVStats {
  total: number;
  pending: number;
  in_progress: number;
  issued: number;
  rejected: number;
  total_revenue: number;
  avg_processing_time: number;
  approval_rate: number;
}

export default function AdminCEVManagement() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<CEVRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<CEVRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('30d');
  const [stats, setStats] = useState<CEVStats | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  const statusConfig = {
    pending_documents: { 
      label: 'Documents en attente', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Clock,
      bgColor: 'bg-yellow-50'
    },
    submitted: { 
      label: 'Soumis', 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: FileText,
      bgColor: 'bg-blue-50'
    },
    under_review: { 
      label: 'En révision', 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Clock,
      bgColor: 'bg-purple-50'
    },
    documents_requested: { 
      label: 'Documents requis', 
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: AlertCircle,
      bgColor: 'bg-orange-50'
    },
    approved: { 
      label: 'Approuvé', 
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      bgColor: 'bg-green-50'
    },
    issued: { 
      label: 'Émis', 
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: Shield,
      bgColor: 'bg-green-50'
    },
    rejected: { 
      label: 'Rejeté', 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
      bgColor: 'bg-red-50'
    },
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter, dateFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Données simulées pour la démonstration
      const mockRequests: CEVRequest[] = [
        {
          id: '1',
          cev_number: 'CEV-2024-001234',
          oneci_reference_number: 'ONECI-2024-567890',
          landlord: {
            full_name: 'Kouame Jean-Baptiste',
            email: 'kouame.jb@email.com'
          },
          tenant: {
            full_name: 'Aya Fatoumata',
            email: 'aya.fatoumata@email.com'
          },
          property: {
            title: 'Appartement 3 pièces Plateau',
            address: 'Rue des Jardins, Plateau, Abidjan'
          },
          status: 'issued',
          created_at: '2024-11-15T10:30:00Z',
          cev_fee_amount: 50000,
          cev_fee_paid: true,
          processing_time: 5
        },
        {
          id: '2',
          cev_number: '',
          oneci_reference_number: 'ONECI-2024-567891',
          landlord: {
            full_name: 'Diabaté Mamadou',
            email: 'diabate.m@email.com'
          },
          tenant: {
            full_name: 'Traoré Aminata',
            email: 'traore.a@email.com'
          },
          property: {
            title: 'Maison familiale Yopougon',
            address: 'Avenue 7, Yopougon, Abidjan'
          },
          status: 'under_review',
          created_at: '2024-11-25T14:20:00Z',
          cev_fee_amount: 50000,
          cev_fee_paid: true,
          processing_time: 2
        },
        {
          id: '3',
          cev_number: '',
          oneci_reference_number: 'ONECI-2024-567892',
          landlord: {
            full_name: 'Yao Prosper',
            email: 'yao.prosper@email.com'
          },
          tenant: {
            full_name: 'Koffi Marcel',
            email: 'koffi.m@email.com'
          },
          property: {
            title: 'Studio meublé Cocody',
            address: 'Boulevard Lagunaire, Cocody, Abidjan'
          },
          status: 'pending_documents',
          created_at: '2024-11-28T09:15:00Z',
          cev_fee_amount: 50000,
          cev_fee_paid: false,
          processing_time: 0
        },
        {
          id: '4',
          cev_number: 'CEV-2024-001235',
          oneci_reference_number: 'ONECI-2024-567893',
          landlord: {
            full_name: 'Ballo Adjoua',
            email: 'ballo.adjoua@email.com'
          },
          tenant: {
            full_name: 'Sanogo Ibrahim',
            email: 'sanogo.i@email.com'
          },
          property: {
            title: 'Villa 4 chambres Bingerville',
            address: 'Zone Résidentielle, Bingerville'
          },
          status: 'rejected',
          created_at: '2024-11-20T16:45:00Z',
          cev_fee_amount: 50000,
          cev_fee_paid: true,
          processing_time: 8
        }
      ];

      setRequests(mockRequests);

      // Calculer les statistiques
      const mockStats: CEVStats = {
        total: mockRequests.length,
        pending: mockRequests.filter(r => ['pending_documents'].includes(r.status)).length,
        in_progress: mockRequests.filter(r => ['submitted', 'under_review', 'documents_requested', 'approved'].includes(r.status)).length,
        issued: mockRequests.filter(r => r.status === 'issued').length,
        rejected: mockRequests.filter(r => r.status === 'rejected').length,
        total_revenue: mockRequests.filter(r => r.cev_fee_paid).reduce((sum, r) => sum + r.cev_fee_amount, 0),
        avg_processing_time: mockRequests.filter(r => r.processing_time && r.processing_time > 0)
          .reduce((sum, r, _, arr) => sum + (r.processing_time || 0) / arr.length, 0),
        approval_rate: (mockRequests.filter(r => ['issued', 'rejected'].includes(r.status)).length > 0) 
          ? (mockRequests.filter(r => r.status === 'issued').length / 
             mockRequests.filter(r => ['issued', 'rejected'].includes(r.status)).length) * 100 
          : 0
      };

      setStats(mockStats);
    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.cev_number?.toLowerCase().includes(term) ||
          req.oneci_reference_number?.toLowerCase().includes(term) ||
          req.landlord?.full_name?.toLowerCase().includes(term) ||
          req.tenant?.full_name?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Filtrer par date
    if (dateFilter !== 'all') {
      const now = new Date();
      const daysAgo = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(req => new Date(req.created_at) >= cutoffDate);
    }

    setFilteredRequests(filtered);
  };

  const getStatusBadge = (status: CEVRequest['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    setSelectedRequests(prev => 
      prev.length === filteredRequests.length ? [] : filteredRequests.map(r => r.id)
    );
  };

  const exportData = () => {
    // Simulation d'export
    if (import.meta.env.DEV) console.log('Export des données CEV...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
          <span className="text-gray-600">Chargement des données CEV...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des CEV ONECI</h1>
          <p className="text-sm text-gray-600 mt-1">
            Administration des Certifications Électroniques Validées
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nouvelle Demande</span>
          </button>
          <button 
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Demandes Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12% ce mois
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CEV Émis</p>
              <p className="text-2xl font-bold text-green-600">{stats?.issued || 0}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Certifiés validés
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Traitement</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.in_progress || 0}</p>
              <p className="text-xs text-purple-600 mt-1 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                En cours
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus (30j)</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats?.total_revenue.toLocaleString('fr-FR') || 0} F
              </p>
              <p className="text-xs text-orange-600 mt-1 flex items-center">
                <Coins className="w-3 h-3 mr-1" />
                Frais CEV
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Numéro CEV, référence, nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(statusConfig).map(([status, config]) => (
                <option key={status} value={status}>{config.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="all">Toutes les périodes</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadData}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-800">
              {selectedRequests.length} demande(s) sélectionnée(s)
            </span>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                Approuver
              </button>
              <button className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200">
                Rejeter
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200">
                Exporter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propriétaire
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Locataire
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propriété
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro CEV
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune demande CEV trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id)}
                        onChange={() => handleSelectRequest(request.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-mono font-medium text-gray-900">
                          {request.oneci_reference_number || 'En attente'}
                        </p>
                        <p className="text-xs text-gray-500">{request.id.slice(0, 8)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{request.landlord?.full_name}</p>
                        <p className="text-xs text-gray-500">{request.landlord?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{request.tenant?.full_name}</p>
                        <p className="text-xs text-gray-500">{request.tenant?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{request.property?.title}</p>
                        <p className="text-xs text-gray-500 max-w-xs truncate">
                          {request.property?.address}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(request.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.cev_number ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-medium bg-green-100 text-green-800">
                          {request.cev_number}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => window.open(`/admin/cev/${request.id}`, '_blank')}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => window.open(`/cev-request/${request.id}`, '_blank')}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                          title="Ouvrir"
                        >
                          <Globe className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}