/**
 * Agency Clients Section - Gestion de la base de données clients
 */

import { useState } from 'react';
import { Badge } from '../../ui/Badge';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'acheteur' | 'locataire';
  status: 'prospect' | 'actif' | 'inactif';
  budget?: number;
  preferences?: string;
  lastContact?: string;
}

interface AgencyClientsSectionProps {
  clients: Client[];
  showHeader?: boolean;
}

export function AgencyClientsSection({ clients, showHeader = false }: AgencyClientsSectionProps) {
  const [filterType, setFilterType] = useState<'all' | 'acheteur' | 'locataire'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'prospect' | 'actif' | 'inactif'>('all');
  const [filterBudget, setFilterBudget] = useState<string>('all');

  const filteredClients = clients.filter(client => {
    if (filterType !== 'all' && client.type !== filterType) return false;
    if (filterStatus !== 'all' && client.status !== filterStatus) return false;
    
    if (filterBudget !== 'all' && client.budget) {
      switch (filterBudget) {
        case 'moins_50m':
          return client.budget < 50000000;
        case '50m_100m':
          return client.budget >= 50000000 && client.budget < 100000000;
        case 'plus_100m':
          return client.budget >= 100000000;
        default:
          return true;
      }
    }
    
    return true;
  });

  const statusColors = {
    prospect: 'info',
    actif: 'success',
    inactif: 'default',
  } as const;

  const typeLabels = {
    acheteur: 'Acheteur',
    locataire: 'Locataire',
  };

  const budgetRanges = [
    { value: 'all', label: 'Tous les budgets' },
    { value: 'moins_50m', label: 'Moins de 50M FCFA' },
    { value: '50m_100m', label: '50M - 100M FCFA' },
    { value: 'plus_100m', label: 'Plus de 100M FCFA' },
  ];

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Base clients</h2>
            <p className="text-text-secondary">Gestion de {clients.length} clients</p>
          </div>
          <button className="btn-primary">
            ➕ Nouveau client
          </button>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-background-page rounded-xl p-4 border border-neutral-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Type de client</label>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="acheteur">Acheteurs</option>
              <option value="locataire">Locataires</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Statut</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="prospect">Prospects</option>
              <option value="actif">Actifs</option>
              <option value="inactif">Inactifs</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Budget</label>
            <select 
              value={filterBudget}
              onChange={(e) => setFilterBudget(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {budgetRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
          <span className="text-sm text-text-secondary">
            {filteredClients.length} client(s) trouvé(s)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Trier par:</span>
            <select className="text-sm px-2 py-1 border border-neutral-200 rounded">
              <option>Nom A-Z</option>
              <option>Dernier contact</option>
              <option>Budget décroissant</option>
              <option>Date d'ajout</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des clients */}
      <div className="bg-background-page rounded-xl border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Client</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Budget</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{client.name}</div>
                        <div className="text-sm text-text-secondary">{client.email}</div>
                        {client.preferences && (
                          <div className="text-xs text-text-secondary mt-1">{client.preferences}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <Badge variant="outline">
                      {typeLabels[client.type]}
                    </Badge>
                  </td>
                  
                  <td className="px-6 py-4">
                    <Badge variant={statusColors[client.status] as any}>
                      {client.status}
                    </Badge>
                  </td>
                  
                  <td className="px-6 py-4">
                    {client.budget ? (
                      <div className="text-sm">
                        <div className="font-medium text-text-primary">
                          {(client.budget / 1000000).toFixed(0)}M FCFA
                        </div>
                        <div className="text-xs text-text-secondary">Budget maximum</div>
                      </div>
                    ) : (
                      <span className="text-sm text-text-secondary">Non renseigné</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-text-primary">{client.phone}</div>
                      {client.lastContact && (
                        <div className="text-xs text-text-secondary">
                          Dernier contact: {client.lastContact}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors text-sm"
                        title="Voir le profil"
                      >
                        Profil
                      </button>
                      <button 
                        className="px-3 py-1 border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors text-sm"
                        title="Programmer une visite"
                      >
                        📅
                      </button>
                      <button 
                        className="px-3 py-1 border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors text-sm"
                        title="Envoyer une proposition"
                      >
                        💬
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistiques clients */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background-page rounded-xl p-4 border border-neutral-100 text-center">
          <div className="text-2xl font-bold text-info mb-1">
            {clients.filter(c => c.status === 'prospect').length}
          </div>
          <div className="text-sm text-text-secondary">Prospects</div>
        </div>
        
        <div className="bg-background-page rounded-xl p-4 border border-neutral-100 text-center">
          <div className="text-2xl font-bold text-semantic-success mb-1">
            {clients.filter(c => c.status === 'actif').length}
          </div>
          <div className="text-sm text-text-secondary">Clients actifs</div>
        </div>
        
        <div className="bg-background-page rounded-xl p-4 border border-neutral-100 text-center">
          <div className="text-2xl font-bold text-warning mb-1">
            {clients.filter(c => c.type === 'acheteur').length}
          </div>
          <div className="text-sm text-text-secondary">Acheteurs</div>
        </div>
        
        <div className="bg-background-page rounded-xl p-4 border border-neutral-100 text-center">
          <div className="text-2xl font-bold text-primary-500 mb-1">
            {clients.filter(c => c.type === 'locataire').length}
          </div>
          <div className="text-sm text-text-secondary">Locataires</div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-background-page rounded-xl p-4 border border-neutral-100">
        <h3 className="font-semibold text-text-primary mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
            <span>📧</span>
            <span>Envoyer newsletter</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
            <span>📊</span>
            <span>Générer rapport</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
            <span>📞</span>
            <span>Campagne appel</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
            <span>🎯</span>
            <span>Suivi prospects</span>
          </button>
        </div>
      </div>
    </div>
  );
}