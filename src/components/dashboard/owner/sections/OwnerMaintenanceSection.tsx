import React, { useState } from 'react';
import { 
  Wrench, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  DollarSign,
  User,
  MapPin,
  Phone,
  FileText,
  Plus,
  Eye,
  Edit,
  MoreVertical,
  Building,
  Users,
  Timer,
  Tool
} from 'lucide-react';

interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  property: string;
  propertyAddress: string;
  tenant: string;
  tenantPhone: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'nouveau' | 'en_cours' | 'en_attente_pieces' | 'termine' | 'annule';
  category: 'plomberie' | 'electricite' | 'menuiserie' | 'menage' | 'climatisation' | 'autre';
  createdAt: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  technician?: string;
  technicianPhone?: string;
  images?: string[];
  notes?: string;
}

interface MaintenanceProvider {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  rating: number;
  hourlyRate: number;
  available: boolean;
  completedJobs: number;
}

const OwnerMaintenanceSection: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Données mock pour les demandes de maintenance
  const maintenanceRequests: MaintenanceRequest[] = [
    {
      id: 1,
      title: "Fuite d'eau dans la cuisine",
      description: "Il y a une fuite d'eau sous l'évier de la cuisine qui s'aggrave",
      property: "Villa Bellevue",
      propertyAddress: "Cocody, Riviera Golf",
      tenant: "Jean Kouassi",
      tenantPhone: "+225 01 02 03 04",
      priority: "urgent",
      status: "en_cours",
      category: "plomberie",
      createdAt: "2024-11-29",
      scheduledDate: "2024-11-30",
      estimatedCost: 85000,
      technician: "Service Plomberie Pro",
      technicianPhone: "+225 05 06 07 08",
      notes: "Réparation de la canalisation sous l'évier"
    },
    {
      id: 2,
      title: "Climatisation ne fonctionne pas",
      description: "L'AC de la chambre principale ne cooling plus correctement",
      property: "Appartement Riviera",
      propertyAddress: "Cocody, Riviera 2",
      tenant: "Sarah Mensah",
      tenantPhone: "+225 02 03 04 05",
      priority: "high",
      status: "en_attente_pieces",
      category: "climatisation",
      createdAt: "2024-11-28",
      scheduledDate: "2024-12-02",
      estimatedCost: 120000,
      technician: "Clim Expert",
      technicianPhone: "+225 07 08 09 10",
      notes: "Commande de pièces détachées en cours"
    },
    {
      id: 3,
      title: "Porte de garage cassée",
      description: "La porte de garage électrique ne s'ouvre plus",
      property: "Villa Bellevue",
      propertyAddress: "Cocody, Riviera Golf",
      tenant: "Jean Kouassi",
      tenantPhone: "+225 01 02 03 04",
      priority: "medium",
      status: "termine",
      category: "menuiserie",
      createdAt: "2024-11-25",
      completedDate: "2024-11-27",
      actualCost: 75000,
      technician: "Menuiserie Moderne",
      technicianPhone: "+225 11 12 13 14",
      notes: "Remplacement du moteur de la porte de garage"
    },
    {
      id: 4,
      title: "Problème électrique prises",
      description: "Quelques prises électriques ne fonctionnent plus dans le salon",
      property: "Studio Plateau",
      propertyAddress: "Plateau, Centre-ville",
      tenant: "Marie Yao",
      tenantPhone: "+225 04 05 06 07",
      priority: "low",
      status: "nouveau",
      category: "electricite",
      createdAt: "2024-11-30",
      estimatedCost: 45000,
      notes: "Vérification du circuit électrique"
    }
  ];

  // Données mock pour les prestataires
  const maintenanceProviders: MaintenanceProvider[] = [
    {
      id: 1,
      name: "Service Plomberie Pro",
      specialty: "Plomberie",
      phone: "+225 05 06 07 08",
      rating: 4.8,
      hourlyRate: 15000,
      available: true,
      completedJobs: 24
    },
    {
      id: 2,
      name: "Clim Expert",
      specialty: "Climatisation",
      phone: "+225 07 08 09 10",
      rating: 4.6,
      hourlyRate: 18000,
      available: false,
      completedJobs: 18
    },
    {
      id: 3,
      name: "Menuiserie Moderne",
      specialty: "Menuiserie",
      phone: "+225 11 12 13 14",
      rating: 4.9,
      hourlyRate: 12000,
      available: true,
      completedJobs: 31
    },
    {
      id: 4,
      name: "Électric Plus",
      specialty: "Électricité",
      phone: "+225 15 16 17 18",
      rating: 4.7,
      hourlyRate: 14000,
      available: true,
      completedJobs: 22
    }
  ];

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { 
          label: 'Urgent', 
          color: 'bg-red-100 text-red-800', 
          icon: AlertCircle,
          bgColor: 'bg-red-50'
        };
      case 'high':
        return { 
          label: 'Haute', 
          color: 'bg-amber-100 text-amber-800', 
          icon: AlertCircle,
          bgColor: 'bg-amber-50'
        };
      case 'medium':
        return { 
          label: 'Moyenne', 
          color: 'bg-blue-100 text-blue-800', 
          icon: Clock,
          bgColor: 'bg-blue-50'
        };
      case 'low':
        return { 
          label: 'Faible', 
          color: 'bg-green-100 text-green-800', 
          icon: CheckCircle,
          bgColor: 'bg-green-50'
        };
      default:
        return { 
          label: 'Inconnu', 
          color: 'bg-neutral-100 text-neutral-800', 
          icon: AlertCircle,
          bgColor: 'bg-neutral-50'
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'nouveau':
        return { 
          label: 'Nouveau', 
          color: 'bg-blue-100 text-blue-800',
          bgColor: 'bg-blue-50'
        };
      case 'en_cours':
        return { 
          label: 'En cours', 
          color: 'bg-amber-100 text-amber-800',
          bgColor: 'bg-amber-50'
        };
      case 'en_attente_pieces':
        return { 
          label: 'Attente pièces', 
          color: 'bg-purple-100 text-purple-800',
          bgColor: 'bg-purple-50'
        };
      case 'termine':
        return { 
          label: 'Terminé', 
          color: 'bg-green-100 text-green-800',
          bgColor: 'bg-green-50'
        };
      case 'annule':
        return { 
          label: 'Annulé', 
          color: 'bg-red-100 text-red-800',
          bgColor: 'bg-red-50'
        };
      default:
        return { 
          label: 'Inconnu', 
          color: 'bg-neutral-100 text-neutral-800',
          bgColor: 'bg-neutral-50'
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'plomberie':
        return <Wrench className="w-5 h-5 text-blue-600" />;
      case 'electricite':
        return <Tool className="w-5 h-5 text-yellow-600" />;
      case 'menuiserie':
        return <Building className="w-5 h-5 text-amber-600" />;
      case 'menage':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'climatisation':
        return <Timer className="w-5 h-5 text-purple-600" />;
      default:
        return <Wrench className="w-5 h-5 text-neutral-600" />;
    }
  };

  const filteredRequests = maintenanceRequests.filter(request => {
    const statusMatch = selectedStatus === 'all' || request.status === selectedStatus;
    const priorityMatch = selectedPriority === 'all' || request.priority === selectedPriority;
    const searchMatch = searchTerm === '' || 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tenant.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && priorityMatch && searchMatch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const MaintenanceCard: React.FC<{ request: MaintenanceRequest }> = ({ request }) => {
    const priorityConfig = getPriorityConfig(request.priority);
    const statusConfig = getStatusConfig(request.status);
    const PriorityIcon = priorityConfig.icon;

    return (
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="p-2 bg-primary-50 rounded-lg mr-3">
                {getCategoryIcon(request.category)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">{request.title}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                    <PriorityIcon className="w-3 h-3 mr-1" />
                    {priorityConfig.label}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
                <div className="flex items-center text-neutral-600 text-sm">
                  <Building className="w-4 h-4 mr-1" />
                  <span>{request.property}</span>
                </div>
              </div>
            </div>
            <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 rounded-lg">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 border-b border-neutral-200">
          <p className="text-neutral-700 text-sm">{request.description}</p>
          <div className="flex items-center text-neutral-600 text-sm mt-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{request.propertyAddress}</span>
          </div>
        </div>

        {/* Tenant info */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-4 h-4 text-neutral-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-neutral-900">{request.tenant}</p>
                <p className="text-xs text-neutral-600">Locataire</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-neutral-600 mr-1" />
                <span className="text-sm text-neutral-900">{request.tenantPhone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduling and cost */}
        <div className="p-4 border-b border-neutral-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-600">Créé le</p>
              <p className="text-sm font-medium text-neutral-900">{formatDate(request.createdAt)}</p>
            </div>
            {request.scheduledDate && (
              <div>
                <p className="text-xs text-neutral-600">Programmé</p>
                <p className="text-sm font-medium text-neutral-900">{formatDate(request.scheduledDate)}</p>
              </div>
            )}
            {request.completedDate && (
              <div>
                <p className="text-xs text-neutral-600">Terminé</p>
                <p className="text-sm font-medium text-neutral-900">{formatDate(request.completedDate)}</p>
              </div>
            )}
            {(request.estimatedCost || request.actualCost) && (
              <div>
                <p className="text-xs text-neutral-600">Coût</p>
                <p className="text-sm font-medium text-neutral-900">
                  {formatCurrency(request.actualCost || request.estimatedCost || 0)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Technician info */}
        {request.technician && (
          <div className="p-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">{request.technician}</p>
                <p className="text-xs text-neutral-600">Technicien</p>
              </div>
              {request.technicianPhone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-neutral-600 mr-1" />
                  <span className="text-sm text-neutral-900">{request.technicianPhone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {request.notes && (
          <div className="p-4 border-b border-neutral-200">
            <p className="text-xs text-neutral-600 mb-1">Notes</p>
            <p className="text-sm text-neutral-900">{request.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="p-4">
          <div className="flex space-x-2">
            <button className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
              <Eye className="w-4 h-4 mr-2" />
              Détails
            </button>
            <button className="flex items-center justify-center px-3 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors duration-200">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Maintenance & Entretien</h2>
          <p className="text-neutral-600">Gérez les demandes et interventions</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors duration-200">
            <Calendar className="w-4 h-4 mr-2 inline" />
            Planifier
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
            <Plus className="w-4 h-4 mr-2 inline" />
            Nouvelle demande
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher une demande, propriété ou locataire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex space-x-4">
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tous statuts</option>
            <option value="nouveau">Nouveau</option>
            <option value="en_cours">En cours</option>
            <option value="en_attente_pieces">Attente pièces</option>
            <option value="termine">Terminé</option>
            <option value="annule">Annulé</option>
          </select>
          <select 
            value={selectedPriority} 
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Toutes priorités</option>
            <option value="urgent">Urgent</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Faible</option>
          </select>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="w-6 h-6 text-semantic-warning" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-700">En attente</p>
              <p className="text-2xl font-bold text-neutral-900">
                {maintenanceRequests.filter(r => r.status === 'nouveau').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Wrench className="w-6 h-6 text-semantic-info" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-700">En cours</p>
              <p className="text-2xl font-bold text-neutral-900">
                {maintenanceRequests.filter(r => r.status === 'en_cours').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Timer className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-700">En attente pièces</p>
              <p className="text-2xl font-bold text-neutral-900">
                {maintenanceRequests.filter(r => r.status === 'en_attente_pieces').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-semantic-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-700">Ce mois</p>
              <p className="text-2xl font-bold text-neutral-900">
                {maintenanceRequests.filter(r => r.status === 'termine').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRequests.map((request) => (
          <MaintenanceCard key={request.id} request={request} />
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Aucune demande trouvée</h3>
          <p className="text-neutral-600">Essayez de modifier vos critères de recherche</p>
        </div>
      )}

      {/* Maintenance providers */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Prestataires partenaires</h3>
          <p className="text-sm text-neutral-600 mt-1">Techniciens de confiance</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {maintenanceProviders.map((provider) => (
              <div key={provider.id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Tool className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    provider.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {provider.available ? 'Disponible' : 'Occupé'}
                  </div>
                </div>
                <h4 className="font-medium text-neutral-900 mb-1">{provider.name}</h4>
                <p className="text-sm text-neutral-600 mb-2">{provider.specialty}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-neutral-900">{provider.rating}</span>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600">Taux horaire</p>
                    <p className="font-medium text-neutral-900">{formatCurrency(provider.hourlyRate)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-neutral-600">
                  <span>{provider.completedJobs} travaux</span>
                  <button className="text-primary-600 hover:text-primary-800">
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerMaintenanceSection;