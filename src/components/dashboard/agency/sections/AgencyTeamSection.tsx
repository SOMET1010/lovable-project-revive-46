/**
 * Agency Team Section - Gestion de l'équipe et des agents
 */

import { useState } from 'react';
import { Badge } from '../../ui/Badge';
import { Progress } from '../../ui/Progress';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  photo?: string;
  specialty: string;
  performance: number;
  propertiesCount: number;
  status: 'actif' | 'en_vacances' | 'inactif';
}

interface AgencyTeamSectionProps {
  team: TeamMember[];
  showHeader?: boolean;
}

export function AgencyTeamSection({ team, showHeader = false }: AgencyTeamSectionProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'actif' | 'en_vacances' | 'inactif'>('all');

  const filteredTeam = team.filter(member => {
    if (filterStatus !== 'all' && member.status !== filterStatus) return false;
    return true;
  });

  const statusColors = {
    actif: 'success',
    en_vacances: 'warning',
    inactif: 'error',
  } as const;

  const statusLabels = {
    actif: 'Actif',
    en_vacances: 'En vacances',
    inactif: 'Inactif',
  };

  const roleIcons = {
    'Directrice': '👩‍💼',
    'Agent Senior': '👨‍💼',
    'Agent Commercial': '👤',
    'Agent Junior': '👨‍💻',
    'Responsable Locative': '👩‍💼',
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'success';
    if (performance >= 75) return 'warning';
    return 'error';
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Équipe et agents</h2>
            <p className="text-text-secondary">Gestion de {team.length} membres</p>
          </div>
          <button className="btn-primary">
            ➕ Ajouter un agent
          </button>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-background-page rounded-xl p-4 border border-neutral-100">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Statut</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="actif">Actifs</option>
              <option value="en_vacances">En vacances</option>
              <option value="inactif">Inactifs</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end">
            <span className="text-sm text-text-secondary">
              {filteredTeam.length} membre(s) trouvé(s)
            </span>
          </div>
        </div>
      </div>

      {/* Grille des membres de l'équipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTeam.map((member) => (
          <div key={member.id} className="bg-background-page rounded-xl border border-neutral-100 p-6 hover:shadow-lg transition-all">
            {/* Photo et statut */}
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center mb-3">
                  <span className="text-white font-semibold text-lg">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className={`
                  absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white
                  ${member.status === 'actif' ? 'bg-semantic-success' : ''}
                  ${member.status === 'en_vacances' ? 'bg-semantic-warning' : ''}
                  ${member.status === 'inactif' ? 'bg-semantic-error' : ''}
                `}></div>
              </div>
              
              <Badge 
                variant={statusColors[member.status] as any}
                size="small"
                className="mb-2"
              >
                {statusLabels[member.status]}
              </Badge>
            </div>

            {/* Informations */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-text-primary text-center">{member.name}</h3>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-lg">{roleIcons[member.role as keyof typeof roleIcons] || '👤'}</span>
                  <span className="text-sm text-text-secondary text-center">{member.role}</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Spécialité</div>
                <div className="text-sm font-medium text-text-primary">{member.specialty}</div>
              </div>

              {/* Performance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Performance</span>
                  <span className="text-sm font-medium text-text-primary">{member.performance}%</span>
                </div>
                <Progress 
                  value={member.performance} 
                  variant={getPerformanceColor(member.performance) as any}
                  size="small"
                />
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary-500">{member.propertiesCount}</div>
                  <div className="text-xs text-text-secondary">Propriétés</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-semantic-success">
                    {Math.round(member.performance * member.propertiesCount / 100)}
                  </div>
                  <div className="text-xs text-text-secondary">Ventes</div>
                </div>
              </div>

              {/* Contact */}
              <div className="pt-2 border-t border-neutral-100 text-xs text-text-secondary space-y-1">
                <div>📧 {member.email}</div>
                <div>📞 {member.phone}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100">
              <button className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                Profil
              </button>
              <button 
                className="px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm"
                title="Assigner propriété"
              >
                🏠
              </button>
              <button 
                className="px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm"
                title="Voir performance"
              >
                📊
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Performance globale de l'équipe */}
      <div className="bg-background-page rounded-xl p-6 border border-neutral-100">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Performance globale de l'équipe</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-semantic-success mb-2">
              {team.filter(m => m.status === 'actif').length}
            </div>
            <div className="text-sm text-text-secondary">Agents actifs</div>
            <div className="text-xs text-text-secondary mt-1">sur {team.length} total</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-500 mb-2">
              {Math.round(team.reduce((acc, m) => acc + m.performance, 0) / team.length)}%
            </div>
            <div className="text-sm text-text-secondary">Performance moyenne</div>
            <div className="text-xs text-semantic-success mt-1">
              +{team.filter(m => m.performance >= 90).length} excellents
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-info mb-2">
              {team.reduce((acc, m) => acc + m.propertiesCount, 0)}
            </div>
            <div className="text-sm text-text-secondary">Propriétés gérées</div>
            <div className="text-xs text-text-secondary mt-1">
              Moyenne: {Math.round(team.reduce((acc, m) => acc + m.propertiesCount, 0) / team.length)} par agent
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-warning mb-2">
              {team.filter(m => m.status === 'en_vacances').length}
            </div>
            <div className="text-sm text-text-secondary">En vacances</div>
            <div className="text-xs text-text-secondary mt-1">
              {team.filter(m => m.status === 'inactif').length} inactifs
            </div>
          </div>
        </div>

        {/* Classement des agents */}
        <div className="space-y-3">
          <h4 className="font-semibold text-text-primary">🏆 Classement des agents (par performance)</h4>
          {team
            .sort((a, b) => b.performance - a.performance)
            .map((member, index) => (
              <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${index === 0 ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${index === 1 ? 'bg-gray-100 text-gray-800' : ''}
                  ${index === 2 ? 'bg-orange-100 text-orange-800' : ''}
                  ${index > 2 ? 'bg-neutral-100 text-neutral-600' : ''}
                `}>
                  {index + 1}
                </div>
                
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-text-primary">{member.name}</div>
                  <div className="text-sm text-text-secondary">{member.specialty}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-text-primary">{member.performance}%</div>
                  <div className="text-sm text-text-secondary">{member.propertiesCount} propriétés</div>
                </div>
                
                <Progress 
                  value={member.performance} 
                  variant={getPerformanceColor(member.performance) as any}
                  size="small"
                  className="w-24"
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}