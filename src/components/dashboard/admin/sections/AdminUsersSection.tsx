/**
 * Admin Users Section - Gestion complète des utilisateurs
 */

import { useState } from 'react';

interface User {
  id: string;
  full_name: string;
  email: string;
  user_type: 'tenant' | 'owner' | 'agency';
  status: 'active' | 'suspended' | 'banned';
  last_activity: string;
  registration_date: string;
  phone?: string;
  properties_count?: number;
  avatar_url?: string;
}

interface AdminUsersSectionProps {
  users: User[];
  showHeader?: boolean;
}

export function AdminUsersSection({ users, showHeader = false }: AdminUsersSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'tenant' | 'owner' | 'agency'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'activity'>('date');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Générer des données mock réalistes pour simuler 2847 utilisateurs
  const mockUsers = [
    ...users,
    // Ajout d'utilisateurs mock pour atteindre un nombre réaliste
    {
      id: 'user-004',
      full_name: 'Fatou Diallo',
      email: 'fatou.diallo@email.com',
      user_type: 'tenant' as const,
      status: 'active' as const,
      last_activity: '2025-11-30T18:00:00Z',
      registration_date: '2025-11-20T09:15:00Z',
      phone: '+225 07 11 22 33 44',
    },
    {
      id: 'user-005',
      full_name: 'Kouassi Immobilier',
      email: 'contact@kouassi-immo.ci',
      user_type: 'agency' as const,
      status: 'active' as const,
      last_activity: '2025-11-30T17:30:00Z',
      registration_date: '2025-08-15T14:20:00Z',
      phone: '+225 07 55 66 77 88',
      properties_count: 24,
    },
    {
      id: 'user-006',
      full_name: 'Abou Traoré',
      email: 'abou.traore@email.com',
      user_type: 'owner' as const,
      status: 'suspended' as const,
      last_activity: '2025-11-29T16:45:00Z',
      registration_date: '2025-10-05T11:30:00Z',
      phone: '+225 07 99 00 11 22',
      properties_count: 3,
    },
    {
      id: 'user-007',
      full_name: 'Aya Koné',
      email: 'aya.kone@email.com',
      user_type: 'tenant' as const,
      status: 'active' as const,
      last_activity: '2025-11-30T19:15:00Z',
      registration_date: '2025-11-28T13:45:00Z',
      phone: '+225 07 33 44 55 66',
    },
    {
      id: 'user-008',
      full_name: 'Sécurimax SARL',
      email: 'info@securimax.ci',
      user_type: 'agency' as const,
      status: 'banned' as const,
      last_activity: '2025-11-25T10:20:00Z',
      registration_date: '2025-09-12T16:10:00Z',
      phone: '+225 07 77 88 99 00',
      properties_count: 0,
    },
  ];

  const filteredUsers = mockUsers
    .filter(user => {
      const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || user.user_type === filterType;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.full_name.localeCompare(b.full_name);
        case 'date':
          return new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime();
        case 'activity':
          return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
        default:
          return 0;
      }
    });

  const handleUserAction = (userId: string, action: 'suspend' | 'activate' | 'ban' | 'view') => {
    console.log(`${action} user:`, userId);
    // TODO: Implémenter les actions réelles
  };

  const handleBulkAction = (action: 'suspend' | 'activate' | 'ban') => {
    console.log(`Bulk ${action}:`, selectedUsers);
    setSelectedUsers([]);
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'tenant': return 'Locataire';
      case 'owner': return 'Propriétaire';
      case 'agency': return 'Agence';
      default: return type;
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'tenant': return 'bg-blue-100 text-semantic-info';
      case 'owner': return 'bg-success-100 text-success-700';
      case 'agency': return 'bg-purple-100 text-purple-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success-100 text-success-700';
      case 'suspended': return 'bg-semantic-warning text-semantic-warning';
      case 'banned': return 'bg-semantic-error text-semantic-error';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `il y a ${minutes}min`;
    if (hours < 24) return `il y a ${hours}h`;
    if (days < 30) return `il y a ${days}j`;
    return formatDate(dateString);
  };

  const userStats = {
    total: 2847,
    active: 2654,
    suspended: 156,
    banned: 37,
    newThisMonth: 423,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="bg-background-page rounded-2xl border border-neutral-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-h4 font-bold text-text-primary">Gestion des Utilisateurs</h2>
              <p className="text-text-secondary mt-1">
                Administration complète des comptes utilisateurs ({userStats.total.toLocaleString()} total)
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="bg-success-50 px-3 py-2 rounded-lg border border-success-200">
                <div className="text-success-700 text-sm font-semibold">{userStats.active.toLocaleString()}</div>
                <div className="text-success-600 text-xs">Actifs</div>
              </div>
              <div className="bg-semantic-warning bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                <div className="text-yellow-700 text-sm font-semibold">{userStats.suspended}</div>
                <div className="text-yellow-600 text-xs">Suspendus</div>
              </div>
              <div className="bg-semantic-error bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                <div className="text-red-700 text-sm font-semibold">{userStats.banned}</div>
                <div className="text-red-600 text-xs">Bannis</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-background-page rounded-2xl border border-neutral-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les types</option>
              <option value="tenant">Locataires</option>
              <option value="owner">Propriétaires</option>
              <option value="agency">Agences</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="suspended">Suspendus</option>
              <option value="banned">Bannis</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="date">Trier par date</option>
              <option value="name">Trier par nom</option>
              <option value="activity">Trier par activité</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-700">
                {selectedUsers.length} utilisateur(s) sélectionné(s)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="px-3 py-1 bg-semantic-warning text-white text-sm rounded-lg hover:bg-yellow-600"
                >
                  Suspendre
                </button>
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-success-600 text-white text-sm rounded-lg hover:bg-success-700"
                >
                  Activer
                </button>
                <button
                  onClick={() => handleBulkAction('ban')}
                  className="px-3 py-1 bg-semantic-error text-white text-sm rounded-lg hover:bg-red-600"
                >
                  Bannir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-background-page rounded-2xl border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Dernière activité
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                      className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{user.full_name}</div>
                        <div className="text-sm text-neutral-500">{user.email}</div>
                        {user.phone && (
                          <div className="text-xs text-neutral-400">{user.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(user.user_type)}`}>
                      {getUserTypeLabel(user.user_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status === 'active' ? 'Actif' : user.status === 'suspended' ? 'Suspendu' : 'Banni'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {getTimeAgo(user.last_activity)}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {formatDate(user.registration_date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUserAction(user.id, 'view')}
                        className="p-2 text-neutral-500 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Voir détails"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          className="p-2 text-neutral-500 hover:text-semantic-warning hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Suspendre"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user.id, 'activate')}
                          className="p-2 text-neutral-500 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                          title="Activer"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleUserAction(user.id, 'ban')}
                        className="p-2 text-neutral-500 hover:text-semantic-error hover:bg-red-50 rounded-lg transition-colors"
                        title="Bannir"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              Affichage de {filteredUsers.length} sur {userStats.total.toLocaleString()} utilisateurs
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
                Précédent
              </button>
              <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
                2
              </button>
              <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
                3
              </button>
              <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}