import React, { useState } from 'react';
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign,
  MessageSquare,
  Star,
  MoreVertical,
  Edit,
  Eye,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  Building
} from 'lucide-react';

interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  property: string;
  propertyAddress: string;
  propertyType: string;
  rent: number;
  leaseStart: string;
  leaseEnd: string;
  status: 'actif' | 'prochain_expire' | 'expire' | 'retard';
  paymentHistory: {
    date: string;
    amount: number;
    status: 'paye' | 'retard' | 'en_cours';
  }[];
  rating: number;
  description: string;
  avatar?: string;
  emergencyContact?: string;
  documents: string[];
}

const OwnerTenantsSection: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Données mock réalistes pour les locataires
  const tenants: Tenant[] = [
    {
      id: 1,
      name: "Jean Kouassi",
      email: "jean.kouassi@email.com",
      phone: "+225 01 02 03 04",
      property: "Villa Bellevue",
      propertyAddress: "Cocody, Riviera Golf",
      propertyType: "villa",
      rent: 450000,
      leaseStart: "2024-03-01",
      leaseEnd: "2025-02-28",
      status: "actif",
      paymentHistory: [
        { date: "2024-11-01", amount: 450000, status: "paye" },
        { date: "2024-10-01", amount: 450000, status: "paye" },
        { date: "2024-09-01", amount: 450000, status: "paye" },
        { date: "2024-08-01", amount: 450000, status: "paye" }
      ],
      rating: 4.8,
      description: "Excellent locataire, ponctuel et respectueux",
      emergencyContact: "+225 05 06 07 08",
      documents: ["Bail", "Justificatifs revenus", "Assurance"]
    },
    {
      id: 2,
      name: "Sarah Mensah",
      email: "sarah.mensah@email.com",
      phone: "+225 02 03 04 05",
      property: "Appartement Riviera",
      propertyAddress: "Cocody, Riviera 2",
      propertyType: "appartement",
      rent: 380000,
      leaseStart: "2024-06-15",
      leaseEnd: "2025-06-14",
      status: "actif",
      paymentHistory: [
        { date: "2024-11-15", amount: 380000, status: "paye" },
        { date: "2024-10-15", amount: 380000, status: "paye" },
        { date: "2024-09-15", amount: 380000, status: "paye" },
        { date: "2024-08-15", amount: 380000, status: "paye" }
      ],
      rating: 4.5,
      description: "Locataire fiable, garde bien l'appartement",
      emergencyContact: "+225 07 08 09 10",
      documents: ["Bail", "Justificatifs revenus", "Assurance"]
    },
    {
      id: 3,
      name: "Paul Akissi",
      email: "paul.akissi@email.com",
      phone: "+225 03 04 05 06",
      property: "Appartement Marcory",
      propertyAddress: "Marcory, Zone 4A",
      propertyType: "appartement",
      rent: 420000,
      leaseStart: "2024-09-01",
      leaseEnd: "2025-08-31",
      status: "prochain_expire",
      paymentHistory: [
        { date: "2024-11-01", amount: 420000, status: "paye" },
        { date: "2024-10-01", amount: 420000, status: "paye" },
        { date: "2024-09-01", amount: 420000, status: "paye" }
      ],
      rating: 4.2,
      description: "Nouveau locataire, everything goes well so far",
      documents: ["Bail", "Justificatifs revenus"]
    },
    {
      id: 4,
      name: "Marie Yao",
      email: "marie.yao@email.com",
      phone: "+225 04 05 06 07",
      property: "Studio Plateau",
      propertyAddress: "Plateau, Centre-ville",
      propertyType: "studio",
      rent: 180000,
      leaseStart: "2024-01-15",
      leaseEnd: "2024-01-14",
      status: "expire",
      paymentHistory: [
        { date: "2024-11-01", amount: 180000, status: "paye" },
        { date: "2024-10-01", amount: 180000, status: "paye" },
        { date: "2024-09-01", amount: 180000, status: "paye" }
      ],
      rating: 3.8,
      description: "Bail expiré, en attente de renouvellement",
      documents: ["Ancien bail"]
    }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'actif':
        return { 
          label: 'Actif', 
          color: 'bg-green-100 text-green-800', 
          icon: CheckCircle,
          bgColor: 'bg-green-50'
        };
      case 'prochain_expire':
        return { 
          label: 'Expire bientôt', 
          color: 'bg-amber-100 text-amber-800', 
          icon: Clock,
          bgColor: 'bg-amber-50'
        };
      case 'expire':
        return { 
          label: 'Expiré', 
          color: 'bg-red-100 text-red-800', 
          icon: AlertCircle,
          bgColor: 'bg-red-50'
        };
      case 'retard':
        return { 
          label: 'En retard', 
          color: 'bg-red-100 text-red-800', 
          icon: AlertCircle,
          bgColor: 'bg-red-50'
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paye':
        return 'text-semantic-success';
      case 'retard':
        return 'text-semantic-error';
      case 'en_cours':
        return 'text-semantic-warning';
      default:
        return 'text-neutral-600';
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const statusMatch = selectedStatus === 'all' || tenant.status === selectedStatus;
    const searchMatch = searchTerm === '' || 
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.property.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const TenantCard: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
    const statusConfig = getStatusConfig(tenant.status);
    const StatusIcon = statusConfig.icon;
    
    const onTimePayments = tenant.paymentHistory.filter(p => p.status === 'paye').length;
    const paymentRate = Math.round((onTimePayments / tenant.paymentHistory.length) * 100);

    return (
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-neutral-900">{tenant.name}</h3>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </span>
                  <div className="ml-2 flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-neutral-600 ml-1">{tenant.rating}</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 rounded-lg">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Property info */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-neutral-900">{tenant.property}</h4>
              <div className="flex items-center text-neutral-600 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{tenant.propertyAddress}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-600">Loyer mensuel</p>
              <p className="text-lg font-bold text-neutral-900">{formatCurrency(tenant.rent)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-600">Début du bail</p>
              <p className="font-medium text-neutral-900">{formatDate(tenant.leaseStart)}</p>
            </div>
            <div>
              <p className="text-neutral-600">Fin du bail</p>
              <p className="font-medium text-neutral-900">{formatDate(tenant.leaseEnd)}</p>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="p-6 border-b border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Phone className="w-4 h-4 text-neutral-600 mr-2" />
              <span className="text-sm text-neutral-900">{tenant.phone}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 text-neutral-600 mr-2" />
              <span className="text-sm text-neutral-900 truncate">{tenant.email}</span>
            </div>
          </div>
          {tenant.emergencyContact && (
            <div className="mt-3 text-sm">
              <p className="text-neutral-600">Contact d'urgence: {tenant.emergencyContact}</p>
            </div>
          )}
        </div>

        {/* Payment history */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-neutral-900">Historique des paiements</h4>
            <div className="text-right">
              <p className="text-sm text-neutral-600">Ponctualité</p>
              <p className="text-lg font-bold text-semantic-success">{paymentRate}%</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {tenant.paymentHistory.slice(0, 3).map((payment, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-neutral-400 mr-2" />
                  <span className="text-neutral-900">{formatDate(payment.date)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-neutral-900 mr-3">{formatCurrency(payment.amount)}</span>
                  <span className={`font-medium ${getPaymentStatusColor(payment.status)}`}>
                    {payment.status === 'paye' ? 'Payé' : 
                     payment.status === 'retard' ? 'Retard' : 'En cours'}
                  </span>
                </div>
              </div>
            ))}
            {tenant.paymentHistory.length > 3 && (
              <button className="text-sm text-primary-600 hover:text-primary-800">
                Voir tout l'historique
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6">
          <div className="flex space-x-3">
            <button className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contacter
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors duration-200">
              <Eye className="w-4 h-4 mr-2" />
              Détails
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors duration-200">
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
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Mes Locataires</h2>
          <p className="text-neutral-600">Gérez vos locataires et leurs informations</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
            Nouveau locataire
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher un locataire ou une propriété..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="prochain_expire">Expire bientôt</option>
            <option value="expire">Expiré</option>
            <option value="retard">En retard</option>
          </select>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-700">Total locataires</p>
              <p className="text-2xl font-bold text-neutral-900">{tenants.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <UserCheck className="w-6 h-6 text-semantic-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-700">Locataires actifs</p>
              <p className="text-2xl font-bold text-neutral-900">
                {tenants.filter(t => t.status === 'actif').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="w-6 h-6 text-semantic-warning" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-700">Expirent bientôt</p>
              <p className="text-2xl font-bold text-neutral-900">
                {tenants.filter(t => t.status === 'prochain_expire').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-semantic-info" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-700">Moyenne loyer</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(Math.round(tenants.reduce((sum, t) => sum + t.rent, 0) / tenants.length))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTenants.map((tenant) => (
          <TenantCard key={tenant.id} tenant={tenant} />
        ))}
      </div>

      {filteredTenants.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Aucun locataire trouvé</h3>
          <p className="text-neutral-600">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  );
};

export default OwnerTenantsSection;