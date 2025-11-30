import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  Building,
  Crown,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const AdminUsersSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Données mock des utilisateurs
  const users = [
    {
      id: 1,
      name: 'Jean MUKENDI',
      email: 'jean.mukendi@email.com',
      phone: '+225 07 12 34 56',
      role: 'Tenant',
      status: 'active',
      avatar: '/images/user1.jpg',
      location: 'Cocody, Abidjan',
      joinDate: '2024-01-15',
      lastActive: '2024-11-30',
      properties: 2,
      totalSpent: 2450000
    },
    {
      id: 2,
      name: 'Marie KOUASSI',
      email: 'marie.kouassi@immoPlus.ci',
      phone: '+225 05 98 76 54',
      role: 'Agency',
      status: 'active',
      avatar: '/images/user2.jpg',
      location: 'Plateau, Abidjan',
      joinDate: '2023-08-22',
      lastActive: '2024-11-30',
      properties: 45,
      totalSpent: 12500000
    },
    {
      id: 3,
      name: 'Pierre YAO',
      email: 'pierre.yao@email.com',
      phone: '+225 01 23 45 67',
      role: 'Owner',
      status: 'inactive',
      avatar: '/images/user3.jpg',
      location: 'Marcory, Abidjan',
      joinDate: '2024-03-10',
      lastActive: '2024-11-15',
      properties: 3,
      totalSpent: 0
    },
    {
      id: 4,
      name: 'Sarah BAMBA',
      email: 'sarah.bamba@trustAnsut.ci',
      phone: '+225 07 89 12 34',
      role: 'Trust Agent',
      status: 'active',
      avatar: '/images/user4.jpg',
      location: 'Treichville, Abidjan',
      joinDate: '2023-05-18',
      lastActive: '2024-11-30',
      properties: 0,
      totalSpent: 0
    },
    {
      id: 5,
      name: 'Ahmed TRAORE',
      email: 'ahmed.traore@email.com',
      phone: '+225 06 45 78 90',
      role: 'Tenant',
      status: 'suspended',
      avatar: '/images/user5.jpg',
      location: 'Abobo, Abidjan',
      joinDate: '2024-11-01',
      lastActive: '2024-11-28',
      properties: 1,
      totalSpent: 850000
    }
  ];

  const roles = [
    { value: 'all', label: 'Tous les rôles', count: users.length },
    { value: 'Tenant', label: 'Locataires', count: users.filter(u => u.role === 'Tenant').length },
    { value: 'Owner', label: 'Propriétaires', count: users.filter(u => u.role === 'Owner').length },
    { value: 'Agency', label: 'Agences', count: users.filter(u => u.role === 'Agency').length },
    { value: 'Trust Agent', label: 'Agents de Confiance', count: users.filter(u => u.role === 'Trust Agent').length }
  ];

  const statuses = [
    { value: 'all', label: 'Tous les statuts', count: users.length },
    { value: 'active', label: 'Actifs', count: users.filter(u => u.status === 'active').length },
    { value: 'inactive', label: 'Inactifs', count: users.filter(u => u.status === 'inactive').length },
    { value: 'suspended', label: 'Suspendus', count: users.filter(u => u.status === 'suspended').length }
  ];

  // Filtrage
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Tenant':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'Owner':
        return <Building className="w-4 h-4 text-green-600" />;
      case 'Agency':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'Trust Agent':
        return <Crown className="w-4 h-4 text-amber-600" />;
      default:
        return <Users className="w-4 h-4 text-neutral-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Tenant':
        return 'bg-blue-100 text-blue-800';
      case 'Owner':
        return 'bg-green-100 text-green-800';
      case 'Agency':
        return 'bg-purple-100 text-purple-800';
      case 'Trust Agent':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-neutral-100 text-neutral-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-semantic-success" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-semantic-warning" />;
      case 'suspended':
        return <Ban className="w-4 h-4 text-semantic-error" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-neutral-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Gestion des Utilisateurs
            </h2>
            <p className="text-neutral-700">
              Administration complète des comptes utilisateurs et rôles ANSUT
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
            <UserPlus className="w-4 h-4 mr-2" />
            Nouvel Utilisateur
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">Total Utilisateurs</p>
              <p className="text-3xl font-bold text-neutral-900">{users.length}</p>
              <p className="text-sm text-semantic-success mt-1">+12% ce mois</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">Utilisateurs Actifs</p>
              <p className="text-3xl font-bold text-neutral-900">
                {users.filter(u => u.status === 'active').length}
              </p>
              <p className="text-sm text-semantic-success mt-1">82% du total</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <UserCheck className="w-6 h-6 text-semantic-success" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">Nouveaux ce Mois</p>
              <p className="text-3xl font-bold text-neutral-900">
                {users.filter(u => new Date(u.joinDate) > new Date('2024-11-01')).length}
              </p>
              <p className="text-sm text-semantic-success mt-1">En croissance</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">Suspendus</p>
              <p className="text-3xl font-bold text-neutral-900">
                {users.filter(u => u.status === 'suspended').length}
              </p>
              <p className="text-sm text-semantic-error mt-1">Attention requise</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <Ban className="w-6 h-6 text-semantic-error" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filtre par rôle */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label} ({role.count})
              </option>
            ))}
          </select>

          {/* Filtre par statut */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label} ({status.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Utilisateurs ({filteredUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Propriétés
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Dernière Activité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                        <div className="text-sm text-neutral-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                        <div className="text-sm text-neutral-500 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {user.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRoleIcon(user.role)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(user.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status === 'active' ? 'Actif' : user.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {user.properties}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {new Date(user.lastActive).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-primary-600 hover:text-primary-900 p-1">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.status === 'suspended' ? (
                        <button className="text-semantic-success hover:text-semantic-success/80 p-1">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      ) : (
                        <button className="text-semantic-error hover:text-semantic-error/80 p-1">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-neutral-400 hover:text-neutral-600 p-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersSection;