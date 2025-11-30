/**
 * Owner Applications Section - Gestion des candidatures reçues
 */

import { Badge } from '../../ui/Badge';
import { Table, Column } from '../../ui/Table';

interface Application {
  id: string;
  candidate_name: string;
  candidate_email: string;
  property_title: string;
  property_city: string;
  monthly_rent: number;
  status: 'nouveau' | 'en_cours' | 'accepté' | 'refusé';
  score: number;
  applied_at: string;
}

interface OwnerApplicationsSectionProps {
  applications: Application[];
  showHeader?: boolean;
}

export function OwnerApplicationsSection({ applications, showHeader = false }: OwnerApplicationsSectionProps) {
  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'nouveau':
        return <Badge variant="info" size="small">Nouveau</Badge>;
      case 'en_cours':
        return <Badge variant="warning" size="small">En cours</Badge>;
      case 'accepté':
        return <Badge variant="success" size="small">Accepté</Badge>;
      case 'refusé':
        return <Badge variant="error" size="small">Refusé</Badge>;
      default:
        return <Badge variant="default" size="small">Inconnu</Badge>;
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge variant="success" size="small">Excellent</Badge>;
    if (score >= 75) return <Badge variant="info" size="small">Bon</Badge>;
    if (score >= 60) return <Badge variant="warning" size="small">Moyen</Badge>;
    return <Badge variant="error" size="small">Faible</Badge>;
  };

  const columns: Column<Application>[] = [
    {
      key: 'candidate',
      title: 'Candidat',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {record.candidate_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-text-primary">{record.candidate_name}</div>
            <div className="text-sm text-text-secondary">{record.candidate_email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'property',
      title: 'Propriété',
      render: (_, record) => (
        <div>
          <div className="font-medium text-text-primary">{record.property_title}</div>
          <div className="text-sm text-text-secondary">{record.property_city}</div>
        </div>
      ),
    },
    {
      key: 'applied_at',
      title: 'Date',
      dataIndex: 'applied_at',
      render: (value: string) => (
        <div className="text-text-primary">
          {new Date(value).toLocaleDateString('fr-FR')}
        </div>
      ),
    },
    {
      key: 'monthly_rent',
      title: 'Loyer',
      dataIndex: 'monthly_rent',
      align: 'right',
      render: (value: number) => (
        <div className="font-semibold text-text-primary">
          {value.toLocaleString()} FCFA
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Statut',
      dataIndex: 'status',
      render: (value: Application['status']) => getStatusBadge(value),
    },
    {
      key: 'score',
      title: 'Score',
      dataIndex: 'score',
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-text-primary">{value}%</div>
          {getScoreBadge(value)}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.status === 'nouveau' && (
            <>
              <button 
                className="px-3 py-1 bg-semantic-success text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                title="Accepter"
              >
                Accepter
              </button>
              <button 
                className="px-3 py-1 bg-semantic-error text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                title="Refuser"
              >
                Refuser
              </button>
            </>
          )}
          {record.status === 'en_cours' && (
            <button 
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Demander documents"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          )}
          {record.status === 'accepté' && (
            <button 
              className="p-2 text-semantic-success hover:bg-green-50 rounded-lg transition-colors"
              title="Contacter"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          )}
          <button 
            className="p-2 text-text-secondary hover:bg-neutral-100 rounded-lg transition-colors"
            title="Voir détails"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const newApplications = applications.filter(a => a.status === 'nouveau');
  const inProgressApplications = applications.filter(a => a.status === 'en_cours');
  const acceptedApplications = applications.filter(a => a.status === 'accepté');

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Candidatures Reçues</h2>
            <p className="text-text-secondary">Gérez les demandes de location</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="px-3 py-2 border border-neutral-200 rounded-lg text-sm">
              <option value="">Tous les statuts</option>
              <option value="nouveau">Nouveaux</option>
              <option value="en_cours">En cours</option>
              <option value="accepté">Acceptés</option>
              <option value="refusé">Refusés</option>
            </select>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background-page p-4 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-semantic-info">{newApplications.length}</div>
              <div className="text-sm text-text-secondary">Nouvelles candidatures</div>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <span className="text-blue-600">📝</span>
            </div>
          </div>
        </div>
        
        <div className="bg-background-page p-4 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-semantic-warning">{inProgressApplications.length}</div>
              <div className="text-sm text-text-secondary">En cours</div>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
              <span className="text-amber-600">⏳</span>
            </div>
          </div>
        </div>
        
        <div className="bg-background-page p-4 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-semantic-success">{acceptedApplications.length}</div>
              <div className="text-sm text-text-secondary">Acceptées</div>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <span className="text-green-600">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-background-page p-4 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-text-primary">
                {applications.length > 0 ? Math.round(applications.reduce((sum, a) => sum + a.score, 0) / applications.length) : 0}%
              </div>
              <div className="text-sm text-text-secondary">Score moyen</div>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <span className="text-primary-600">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <Table
        columns={columns}
        data={applications}
        emptyMessage="Aucune candidature reçue"
        rowKey="id"
      />

      {/* New applications alert */}
      {newApplications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800">
                {newApplications.length} nouvelle{newApplications.length > 1 ? 's' : ''} candidature{newApplications.length > 1 ? 's' : ''}
              </h4>
              <p className="text-sm text-blue-700">
                Des candidats attendent votre réponse
              </p>
            </div>
            <div className="ml-auto">
              <button className="text-sm font-medium text-blue-800 hover:text-blue-900 bg-blue-100 px-3 py-1 rounded-lg">
                Traiter maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High scoring applications */}
      {applications.filter(a => a.score >= 85 && (a.status === 'nouveau' || a.status === 'en_cours')).length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-800">
                Candidats de qualité identifiés
              </h4>
              <p className="text-sm text-green-700">
                {applications.filter(a => a.score >= 85 && (a.status === 'nouveau' || a.status === 'en_cours')).length} candidat{applications.filter(a => a.score >= 85 && (a.status === 'nouveau' || a.status === 'en_cours')).length > 1 ? 's' : ''} avec un excellent score
              </p>
            </div>
            <div className="ml-auto">
              <button className="text-sm font-medium text-green-800 hover:text-green-900 bg-green-100 px-3 py-1 rounded-lg">
                Prioriser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}