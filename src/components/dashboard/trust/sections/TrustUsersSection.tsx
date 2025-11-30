import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  FileText,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Eye,
  Download,
  Upload,
  Filter,
  Search,
  Star,
  Award,
  Home,
  PhoneCall,
  MessageSquare
} from 'lucide-react';

const TrustUsersSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Données mock des utilisateurs à valider
  const usersToValidate = [
    {
      id: 'USR-001',
      name: 'KOUASSI Jean-Baptiste',
      email: 'jean.kouassi@email.com',
      phone: '+225 07 12 34 56',
      address: 'Cocody, Deux Plateaux',
      type: 'Propriétaire',
      property: 'Villa Bellevue',
      registrationDate: '2024-11-25',
      status: 'pending',
      kyc: {
        identity: { status: 'pending', document: 'CNI', verified: false },
        address: { status: 'completed', document: 'Facture Électricité', verified: true },
        income: { status: 'warning', document: 'Bulletin Salaire', verified: false },
        employment: { status: 'completed', document: 'Attestation Employer', verified: true }
      },
      ansutVerification: {
        member: true,
        score: 85,
        level: 'Standard',
        lastVerification: '2024-11-20'
      },
      validationHistory: [
        { date: '2024-11-25', action: 'Inscription', status: 'completed' },
        { date: '2024-11-26', action: 'Soumission documents', status: 'completed' },
        { date: '2024-11-27', action: 'Vérification KYC', status: 'in_progress' }
      ]
    },
    {
      id: 'USR-002',
      name: 'ADJOUNI Aminata',
      email: 'aminata.adjouni@email.com',
      phone: '+225 01 98 76 54',
      address: 'Plateau, Rue des Hôtels',
      type: 'Locataire',
      property: 'Appartement Riviera',
      registrationDate: '2024-11-24',
      status: 'validated',
      kyc: {
        identity: { status: 'completed', document: 'Passeport', verified: true },
        address: { status: 'completed', document: 'Contrat Bail', verified: true },
        income: { status: 'completed', document: 'Bulletin Salaire', verified: true },
        employment: { status: 'completed', document: 'Attestation Employer', verified: true }
      },
      ansutVerification: {
        member: true,
        score: 92,
        level: 'Premium',
        lastVerification: '2024-11-24'
      },
      validationHistory: [
        { date: '2024-11-24', action: 'Inscription', status: 'completed' },
        { date: '2024-11-24', action: 'Soumission documents', status: 'completed' },
        { date: '2024-11-25', action: 'Vérification KYC', status: 'completed' },
        { date: '2024-11-25', action: 'Validation ANSUT', status: 'completed' }
      ]
    },
    {
      id: 'USR-003',
      name: 'YAO Michel',
      email: 'michel.yao@email.com',
      phone: '+225 05 11 22 33',
      address: 'Yopougon, Siporex',
      type: 'Propriétaire',
      property: 'Maison Yopougon',
      registrationDate: '2024-11-23',
      status: 'rejected',
      kyc: {
        identity: { status: 'completed', document: 'CNI', verified: true },
        address: { status: 'completed', document: 'Facture Eau', verified: true },
        income: { status: 'rejected', document: 'Bulletin Salaire', verified: false },
        employment: { status: 'warning', document: 'Attestation Employer', verified: false }
      },
      ansutVerification: {
        member: false,
        score: 45,
        level: 'Non-membre',
        lastVerification: null
      },
      validationHistory: [
        { date: '2024-11-23', action: 'Inscription', status: 'completed' },
        { date: '2024-11-23', action: 'Soumission documents', status: 'completed' },
        { date: '2024-11-24', action: 'Vérification KYC', status: 'rejected' },
        { date: '2024-11-24', action: 'Demande corrections', status: 'pending' }
      ]
    },
    {
      id: 'USR-004',
      name: 'KONE Fatou',
      email: 'fatou.kone@email.com',
      phone: '+225 03 44 55 66',
      address: 'Abobo, Té',
      type: 'Locataire',
      property: 'Résidence Les Palmiers',
      registrationDate: '2024-11-22',
      status: 'in_progress',
      kyc: {
        identity: { status: 'completed', document: 'CNI', verified: true },
        address: { status: 'completed', document: 'Contrat Bail', verified: true },
        income: { status: 'in_progress', document: 'Bulletin Salaire', verified: false },
        employment: { status: 'pending', document: 'Attestation Employer', verified: false }
      },
      ansutVerification: {
        member: true,
        score: 78,
        level: 'Standard',
        lastVerification: '2024-11-22'
      },
      validationHistory: [
        { date: '2024-11-22', action: 'Inscription', status: 'completed' },
        { date: '2024-11-23', action: 'Soumission documents', status: 'completed' },
        { date: '2024-11-24', action: 'Vérification KYC', status: 'in_progress' }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-800', icon: Clock, label: 'En attente' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'En cours' },
      validated: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Validé' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: UserX, label: 'Rejeté' }
    };

    const config = styles[status as keyof typeof styles];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    );
  };

  const getKycStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'rejected':
        return <UserX className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getAnsutLevelColor = (level: string) => {
    const colors = {
      'Premium': 'bg-purple-100 text-purple-800',
      'Standard': 'bg-blue-100 text-blue-800',
      'Basic': 'bg-green-100 text-green-800',
      'Non-membre': 'bg-neutral-100 text-neutral-800'
    };
    return colors[level as keyof typeof colors] || colors['Non-membre'];
  };

  const filteredUsers = usersToValidate.filter(user => {
    const matchesFilter = activeFilter === 'all' || user.status === activeFilter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const UserCard: React.FC<{ user: any }> = ({ user }) => (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-neutral-900">{user.name}</h3>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-neutral-700 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-neutral-400" />
              {user.email}
            </p>
            <p className="text-sm text-neutral-700 flex items-center">
              <Phone className="w-4 h-4 mr-2 text-neutral-400" />
              {user.phone}
            </p>
            <p className="text-sm text-neutral-700 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-neutral-400" />
              {user.address}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(user.status)}
          <span className="text-xs text-neutral-500">ID: {user.id}</span>
        </div>
      </div>

      {/* Property info */}
      <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Home className="w-4 h-4 text-neutral-600 mr-2" />
            <span className="text-sm font-medium text-neutral-900">{user.property}</span>
          </div>
          <span className="text-sm text-neutral-600">{user.type}</span>
        </div>
      </div>

      {/* KYC Status */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-neutral-900 mb-3">Vérification KYC</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
            <span className="text-sm text-neutral-700">Identité</span>
            {getKycStatusIcon(user.kyc.identity.status)}
          </div>
          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
            <span className="text-sm text-neutral-700">Adresse</span>
            {getKycStatusIcon(user.kyc.address.status)}
          </div>
          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
            <span className="text-sm text-neutral-700">Revenus</span>
            {getKycStatusIcon(user.kyc.income.status)}
          </div>
          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
            <span className="text-sm text-neutral-700">Emploi</span>
            {getKycStatusIcon(user.kyc.employment.status)}
          </div>
        </div>
      </div>

      {/* ANSUT Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-4 h-4 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-neutral-700">Vérification ANSUT</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAnsutLevelColor(user.ansutVerification.level)}`}>
              {user.ansutVerification.level}
            </span>
            <span className="text-sm font-medium text-neutral-900">{user.ansutVerification.score}%</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-neutral-600">
          <Calendar className="w-4 h-4 mr-1" />
          <span>Inscrit le {new Date(user.registrationDate).toLocaleDateString('fr-FR')}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedUser(user)}
            className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 rounded-lg"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-neutral-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
            <MessageSquare className="w-4 h-4" />
          </button>
          {user.status === 'pending' && (
            <>
              <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Valider
              </button>
              <button className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center">
                <UserX className="w-3 h-3 mr-1" />
                Rejeter
              </button>
            </>
          )}
          {user.status === 'in_progress' && (
            <button className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
              Finaliser
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Validation des Utilisateurs</h2>
          <p className="text-neutral-700 mt-1">Vérifiez les identités et documents KYC des locataires et propriétaires</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select 
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="validated">Validés</option>
            <option value="rejected">Rejetés</option>
          </select>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">En attente</p>
              <p className="text-xl font-bold text-neutral-900">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">En cours</p>
              <p className="text-xl font-bold text-neutral-900">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Validés</p>
              <p className="text-xl font-bold text-neutral-900">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Taux validation</p>
              <p className="text-xl font-bold text-neutral-900">75%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {/* Modal de détails utilisateur */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900">
                  Détails utilisateur - {selectedUser.id}
                </h3>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <UserX className="w-5 h-5" />
                </button>
              </div>

              {/* Informations personnelles */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">Informations Personnelles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Nom complet</label>
                    <p className="text-neutral-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Email</label>
                    <p className="text-neutral-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Téléphone</label>
                    <p className="text-neutral-900">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Adresse</label>
                    <p className="text-neutral-900">{selectedUser.address}</p>
                  </div>
                </div>
              </div>

              {/* KYC détaillé */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">Vérification KYC Détaillée</h4>
                <div className="space-y-4">
                  {Object.entries(selectedUser.kyc).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div className="flex items-center">
                        {getKycStatusIcon(value.status)}
                        <span className="ml-3 font-medium text-neutral-900 capitalize">{key}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-700">{value.document}</span>
                        <button className="p-1 text-neutral-600 hover:text-primary-600">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historique de validation */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">Historique de Validation</h4>
                <div className="space-y-3">
                  {selectedUser.validationHistory.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center">
                        {getKycStatusIcon(item.status)}
                        <span className="ml-3 font-medium text-neutral-900">{item.action}</span>
                      </div>
                      <span className="text-sm text-neutral-600">{new Date(item.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300">
                  Contacter
                </button>
                {selectedUser.status === 'pending' && (
                  <>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
                      <UserX className="w-4 h-4 mr-2" />
                      Rejeter
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Valider
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustUsersSection;