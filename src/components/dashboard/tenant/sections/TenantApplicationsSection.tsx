/**
 * Tenant Applications Section - Gestion des candidatures du locataire
 */

import { useState } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash2,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  User,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';

interface Application {
  id: string;
  property_id: string;
  property_title: string;
  property_city: string;
  property_image?: string;
  monthly_rent: number;
  status: 'en_attente' | 'en_cours' | 'acceptee' | 'refusee';
  created_at: string;
  updated_at: string;
  applicant_message?: string;
  documents_submitted: string[];
  priority: 'normale' | 'haute' | 'urgente';
}

interface TenantApplicationsSectionProps {
  applications?: Application[];
  showHeader?: boolean;
}

export function TenantApplicationsSection({ applications = [], showHeader = false }: TenantApplicationsSectionProps) {
  const [filter, setFilter] = useState<'all' | Application['status']>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'rent'>('date');

  // Données mock pour la démo
  const mockApplications: Application[] = [
    {
      id: '1',
      property_id: 'prop1',
      property_title: 'Appartement moderne Cocody',
      property_city: 'Cocody',
      property_image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      monthly_rent: 180000,
      status: 'en_cours',
      created_at: '2025-11-28',
      updated_at: '2025-11-29',
      applicant_message: 'Je suis très intéressé par cet appartement et j\'ai tous les documents requis.',
      documents_submitted: ['piece_identite', 'revenus', 'garant'],
      priority: 'haute',
    },
    {
      id: '2',
      property_id: 'prop2',
      property_title: 'Studio Plateau Centre',
      property_city: 'Abidjan Plateau',
      property_image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      monthly_rent: 120000,
      status: 'en_attente',
      created_at: '2025-11-25',
      updated_at: '2025-11-25',
      applicant_message: 'Étudiant cherche un studio pour la durée de mes études.',
      documents_submitted: ['piece_identite', 'revenus'],
      priority: 'normale',
    },
    {
      id: '3',
      property_id: 'prop3',
      property_title: 'Villa familiale Bingerville',
      property_city: 'Bingerville',
      property_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
      monthly_rent: 350000,
      status: 'acceptee',
      created_at: '2025-11-20',
      updated_at: '2025-11-27',
      applicant_message: 'Famille avec enfants cherche une grande villa.',
      documents_submitted: ['piece_identite', 'revenus', 'garant', 'avis_imposition'],
      priority: 'normale',
    },
    {
      id: '4',
      property_id: 'prop4',
      property_title: 'Appartement 2 pièces Yopougon',
      property_city: 'Yopougon',
      property_image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      monthly_rent: 85000,
      status: 'refusee',
      created_at: '2025-11-15',
      updated_at: '2025-11-22',
      applicant_message: 'Premier appartement, garanties limitées.',
      documents_submitted: ['piece_identite'],
      priority: 'normale',
    },
  ];

  const allApplications = applications.length > 0 ? applications : mockApplications;

  const filteredApplications = allApplications.filter(app => 
    filter === 'all' || app.status === filter
  );

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'status':
        const statusOrder = { 'en_attente': 0, 'en_cours': 1, 'acceptee': 2, 'refusee': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'rent':
        return b.monthly_rent - a.monthly_rent;
      default:
        return 0;
    }
  });

  const getStatusInfo = (status: Application['status']) => {
    switch (status) {
      case 'en_attente':
        return {
          label: 'En attente',
          color: 'amber',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          icon: Clock,
        };
      case 'en_cours':
        return {
          label: 'En cours',
          color: 'blue',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          icon: FileText,
        };
      case 'acceptee':
        return {
          label: 'Acceptée',
          color: 'green',
          bg: 'bg-green-50',
          text: 'text-green-700',
          icon: CheckCircle,
        };
      case 'refusee':
        return {
          label: 'Refusée',
          color: 'red',
          bg: 'bg-red-50',
          text: 'text-red-700',
          icon: XCircle,
        };
    }
  };

  const getPriorityInfo = (priority: Application['priority']) => {
    switch (priority) {
      case 'haute':
        return { label: 'Haute', color: 'orange' };
      case 'urgente':
        return { label: 'Urgente', color: 'red' };
      default:
        return { label: 'Normale', color: 'gray' };
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price).replace('XOF', 'FCFA');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleWithdrawApplication = (applicationId: string) => {
    // TODO: Implémenter le retrait de candidature
    console.log('Retirer candidature:', applicationId);
  };

  const handleViewDetails = (applicationId: string) => {
    // TODO: Implémenter la navigation vers les détails
    console.log('Voir détails:', applicationId);
  };

  const stats = {
    total: allApplications.length,
    pending: allApplications.filter(app => app.status === 'en_attente').length,
    active: allApplications.filter(app => app.status === 'en_cours').length,
    accepted: allApplications.filter(app => app.status === 'acceptee').length,
    rejected: allApplications.filter(app => app.status === 'refusee').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {(showHeader || applications.length === 0) && (
        <div>
          <h2 className="text-h3 font-bold text-text-primary mb-2">
            Mes candidatures
          </h2>
          <p className="text-body text-text-secondary">
            Gérez et suivez l'état de vos candidatures de location
          </p>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card variant="bordered" className="text-center">
          <CardBody className="py-4">
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
            <p className="text-sm text-text-secondary">Total</p>
          </CardBody>
        </Card>
        <Card variant="bordered" className="text-center">
          <CardBody className="py-4">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-sm text-text-secondary">En attente</p>
          </CardBody>
        </Card>
        <Card variant="bordered" className="text-center">
          <CardBody className="py-4">
            <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            <p className="text-sm text-text-secondary">En cours</p>
          </CardBody>
        </Card>
        <Card variant="bordered" className="text-center">
          <CardBody className="py-4">
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            <p className="text-sm text-text-secondary">Acceptées</p>
          </CardBody>
        </Card>
        <Card variant="bordered" className="text-center">
          <CardBody className="py-4">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-text-secondary">Refusées</p>
          </CardBody>
        </Card>
      </div>

      {/* Filtres et tri */}
      <Card variant="bordered">
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === 'all' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setFilter('all')}
              >
                Toutes ({stats.total})
              </Button>
              <Button
                variant={filter === 'en_attente' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setFilter('en_attente')}
              >
                En attente ({stats.pending})
              </Button>
              <Button
                variant={filter === 'en_cours' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setFilter('en_cours')}
              >
                En cours ({stats.active})
              </Button>
              <Button
                variant={filter === 'acceptee' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setFilter('acceptee')}
              >
                Acceptées ({stats.accepted})
              </Button>
              <Button
                variant={filter === 'refusee' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setFilter('refusee')}
              >
                Refusées ({stats.rejected})
              </Button>
            </div>
            
            <div className="flex gap-2 ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 border border-neutral-200 rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="date">Trier par date</option>
                <option value="status">Trier par statut</option>
                <option value="rent">Trier par loyer</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Liste des candidatures */}
      {sortedApplications.length > 0 ? (
        <div className="space-y-4">
          {sortedApplications.map((application) => {
            const statusInfo = getStatusInfo(application.status);
            const priorityInfo = getPriorityInfo(application.priority);
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={application.id} variant="bordered" hoverable>
                <CardBody>
                  <div className="flex gap-4">
                    {/* Image de la propriété */}
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={application.property_image || 'https://via.placeholder.com/80'}
                        alt={application.property_title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-text-primary mb-1">
                            {application.property_title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-text-secondary">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {application.property_city}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatPrice(application.monthly_rent)}/mois
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Candidature du {formatDate(application.created_at)}
                            </div>
                          </div>
                        </div>

                        {/* Badge de statut */}
                        <div className="flex items-center gap-2">
                          <span className={`
                            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                            ${statusInfo.bg} ${statusInfo.text}
                          `}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </span>
                          {application.priority !== 'normale' && (
                            <span className={`
                              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                              ${priorityInfo.color === 'orange' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'}
                            `}>
                              {priorityInfo.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Message du candidat */}
                      {application.applicant_message && (
                        <div className="mb-3">
                          <p className="text-sm text-text-secondary italic">
                            "{application.applicant_message}"
                          </p>
                        </div>
                      )}

                      {/* Documents soumis */}
                      <div className="flex items-center gap-2 mb-4">
                        <User className="h-4 w-4 text-text-disabled" />
                        <span className="text-sm text-text-secondary">
                          Documents: {application.documents_submitted.length} soumis
                        </span>
                        <div className="flex gap-1">
                          {application.documents_submitted.map((doc, index) => (
                            <span
                              key={index}
                              className="inline-block w-2 h-2 bg-primary-500 rounded-full"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-text-disabled">
                          Dernière mise à jour: {formatDate(application.updated_at)}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => handleViewDetails(application.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                          {(application.status === 'en_attente' || application.status === 'en_cours') && (
                            <Button
                              variant="ghost"
                              size="small"
                              onClick={() => handleWithdrawApplication(application.id)}
                              className="text-semantic-error hover:bg-semantic-error hover:text-white"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Retirer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card variant="bordered">
          <CardBody className="text-center py-12">
            <FileText className="h-16 w-16 text-text-disabled mx-auto mb-4" />
            <h3 className="text-h5 font-semibold text-text-primary mb-2">
              {filter === 'all' ? 'Aucune candidature' : `Aucune candidature ${filter}`}
            </h3>
            <p className="text-body text-text-secondary mb-6">
              {filter === 'all' 
                ? 'Vous n\'avez pas encore soumis de candidatures.'
                : `Vous n'avez pas de candidatures avec le statut "${filter}".`
              }
            </p>
            <Button variant="primary">
              Rechercher des propriétés
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}