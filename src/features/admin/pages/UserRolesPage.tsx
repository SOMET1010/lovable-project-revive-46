import { useState } from 'react';
import {
  Search, Save, AlertCircle, CheckCircle, User, Crown, Building2, 
  Users as UsersIcon, UserCheck, Plus, Edit, Eye, Settings
} from 'lucide-react';
import { supabase } from '@/services/supabase/client';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
  created_at: string;
  color: string;
  icon: React.ComponentType<any>;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  last_login: string;
  created_at: string;
}

export default function AdminUserRoles() {
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedUserType, setSelectedUserType] = useState<string>('');
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [makeTrustAgent, setMakeTrustAgent] = useState(false);

  const availableRoles: Role[] = [
    { 
      id: 'locataire', 
      name: 'Locataire', 
      description: 'Recherche et loue des propriétés', 
      permissions: ['search_properties', 'apply_properties', 'save_favorites'], 
      user_count: 1247,
      created_at: '2024-01-01',
      color: 'cyan',
      icon: User
    },
    { 
      id: 'proprietaire', 
      name: 'Propriétaire', 
      description: 'Gère ses propriétés en location', 
      permissions: ['manage_properties', 'receive_applications', 'manage_contracts'], 
      user_count: 342,
      created_at: '2024-01-01',
      color: 'orange',
      icon: Building2
    },
    { 
      id: 'agence', 
      name: 'Agence', 
      description: 'Agence immobilière partenaires', 
      permissions: ['manage_multiple_properties', 'team_management', 'commission_tracking'], 
      user_count: 23,
      created_at: '2024-01-01',
      color: 'green',
      icon: UsersIcon
    },
    { 
      id: 'trust_agent', 
      name: 'Trust Agent', 
      description: 'Agent de confiance et médiation', 
      permissions: ['validate_users', 'mediate_disputes', 'moderate_content'], 
      user_count: 8,
      created_at: '2024-01-01',
      color: 'purple',
      icon: UserCheck
    },
    { 
      id: 'admin', 
      name: 'Administrateur', 
      description: 'Accès complet à la plateforme', 
      permissions: ['full_access', 'user_management', 'system_config'], 
      user_count: 3,
      created_at: '2024-01-01',
      color: 'blue',
      icon: Crown
    }
  ];

  const userTypes = [
    { value: 'locataire', label: 'Locataire' },
    { value: 'proprietaire', label: 'Propriétaire' },
    { value: 'agence', label: 'Agence' },
    { value: 'admin', label: 'Administrateur' },
  ];

  const searchUser = async () => {
    if (!searchEmail.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer un email' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setFoundUser(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role, status, last_login, created_at')
        .eq('email', searchEmail.trim().toLowerCase())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setMessage({ type: 'error', text: 'Utilisateur non trouvé' });
        return;
      }

      setFoundUser(data);

      // Pré-remplir les rôles actuels
      const currentRoles = data.role ? data.role.split(',') : [];
      setSelectedRoles(currentRoles);
      setSelectedUserType(currentRoles[0] || 'locataire');
      setMakeAdmin(currentRoles.includes('admin'));
      setMakeTrustAgent(currentRoles.includes('trust_agent'));

      setMessage({ type: 'success', text: 'Utilisateur trouvé !' });
    } catch (err: any) {
      console.error('Erreur recherche utilisateur:', err);
      setMessage({ type: 'error', text: err.message || 'Erreur lors de la recherche' });
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(r => r !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const saveRoles = async () => {
    if (!foundUser) return;

    setSaving(true);
    setMessage(null);

    try {
      // Construire la liste des rôles
      let rolesToSave = [...selectedRoles];

      if (makeAdmin && !rolesToSave.includes('admin')) {
        rolesToSave.push('admin');
      }
      if (makeTrustAgent && !rolesToSave.includes('trust_agent')) {
        rolesToSave.push('trust_agent');
      }

      const rolesString = rolesToSave.join(',');

      // Mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: rolesString,
          user_type: makeAdmin ? 'admin' : selectedUserType,
          active_role: makeAdmin ? 'admin' : (rolesToSave[0] || selectedUserType),
          trust_verified: makeTrustAgent,
          trust_score: makeTrustAgent ? 100 : 75,
          is_verified: makeAdmin || makeTrustAgent ? true : true,
        })
        .eq('id', foundUser.id);

      if (profileError) throw profileError;

      setMessage({
        type: 'success',
        text: `Rôles mis à jour avec succès pour ${foundUser.email} !`
      });

      // Rafraîchir les données
      await searchUser();
    } catch (err: any) {
      console.error('Erreur sauvegarde rôles:', err);
      setMessage({ type: 'error', text: err.message || 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (color: string) => {
    const colors = {
      cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration des Rôles</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gérez les rôles et permissions des utilisateurs
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nouveau Rôle</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            <Settings className="w-4 h-4" />
            <span>Paramètres</span>
          </button>
        </div>
      </div>

      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableRoles.map((role) => {
          const Icon = role.icon;
          return (
            <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getRoleColor(role.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{role.user_count}</p>
                  <p className="text-sm text-gray-500">utilisateurs</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{role.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {role.permissions.length} permissions
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Role Assignment */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Attribuer des Rôles</h2>

        {/* Search Section */}
        <div className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Rechercher par email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUser()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <button
              onClick={searchUser}
              disabled={loading}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Recherche...' : 'Rechercher'}</span>
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-4 rounded-lg flex items-center space-x-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}
        </div>

        {/* User Found */}
        {foundUser && (
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Utilisateur Trouvé</h3>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nom Complet</p>
                  <p className="font-semibold text-gray-900">{foundUser.full_name || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{foundUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rôles Actuels</p>
                  <p className="font-semibold text-gray-900">{foundUser.role || 'Aucun'}</p>
                </div>
              </div>
            </div>

            {/* User Type Selection */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Type d'Utilisateur Principal</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {userTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedUserType(type.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      selectedUserType === type.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-orange-300 text-gray-700'
                    }`}
                  >
                    <p className="font-medium">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Rôles Additionnels</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableRoles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRoles.includes(role.id);

                  return (
                    <button
                      key={role.id}
                      onClick={() => toggleRole(role.id)}
                      className={`p-4 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                        isSelected
                          ? getRoleColor(role.color)
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-white' : 'bg-gray-100'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{role.name}</p>
                        <p className="text-sm opacity-75">{role.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        isSelected ? 'bg-current border-current' : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Permissions */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Permissions Spéciales</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={makeAdmin}
                    onChange={(e) => setMakeAdmin(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-5 h-5 text-blue-600" />
                      <p className="font-semibold text-blue-900">Administrateur Principal</p>
                    </div>
                    <p className="text-sm text-blue-700">Accès complet à toutes les fonctionnalités admin</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={makeTrustAgent}
                    onChange={(e) => setMakeTrustAgent(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-5 h-5 text-purple-600" />
                      <p className="font-semibold text-purple-900">Trust Agent</p>
                    </div>
                    <p className="text-sm text-purple-700">Validation, médiation et modération</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={saveRoles}
                disabled={saving}
                className="flex items-center space-x-2 px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Sauvegarde...' : 'Sauvegarder les Rôles'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}