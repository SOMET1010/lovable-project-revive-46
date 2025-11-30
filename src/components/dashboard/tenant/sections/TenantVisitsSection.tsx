/**
 * Tenant Visits Section - Gestion des visites programmées
 */

import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  RefreshCw,
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';

interface Visit {
  id: string;
  property_id: string;
  property_title: string;
  property_city: string;
  property_address?: string;
  property_image?: string;
  visit_date: string;
  visit_time: string;
  status: 'en_attente' | 'confirmee' | 'annulee' | 'terminee';
  visit_type: 'physique' | 'virtuelle';
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  created_at: string;
  notes?: string;
  reminder_sent?: boolean;
}

interface TenantVisitsSectionProps {
  visits?: Visit[];
  showHeader?: boolean;
}

export function TenantVisitsSection({ visits = [], showHeader = false }: TenantVisitsSectionProps) {
  const [view, setView] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Données mock pour la démo
  const mockVisits: Visit[] = [
    {
      id: '1',
      property_id: 'prop1',
      property_title: 'Appartement moderne Cocody',
      property_city: 'Cocody',
      property_address: 'Boulevard Lagunaire, Cocody',
      property_image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      visit_date: '2025-12-02',
      visit_time: '14:00',
      status: 'confirmee',
      visit_type: 'physique',
      owner_name: 'Jean Kouassi',
      owner_phone: '+225 07 00 00 00 01',
      owner_email: 'jean.kouassi@email.com',
      created_at: '2025-11-28',
      notes: 'Visite organisée par l\'agent immobilier',
      reminder_sent: true,
    },
    {
      id: '2',
      property_id: 'prop2',
      property_title: 'Studio Plateau Centre',
      property_city: 'Abidjan Plateau',
      property_address: 'Avenue Chardy, Plateau',
      property_image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      visit_date: '2025-12-03',
      visit_time: '10:30',
      status: 'en_attente',
      visit_type: 'virtuelle',
      owner_name: 'Marie Bah',
      owner_phone: '+225 07 00 00 00 02',
      owner_email: 'marie.bah@email.com',
      created_at: '2025-11-25',
      notes: 'Visite virtuelle par visioconférence',
      reminder_sent: false,
    },
    {
      id: '3',
      property_id: 'prop3',
      property_title: 'Villa familiale Bingerville',
      property_city: 'Bingerville',
      property_address: 'Lotissement Les Palmiers, Bingerville',
      property_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
      visit_date: '2025-11-20',
      visit_time: '16:00',
      status: 'terminee',
      visit_type: 'physique',
      owner_name: 'Paul Ouattara',
      owner_phone: '+225 07 00 00 00 03',
      owner_email: 'paul.ouattara@email.com',
      created_at: '2025-11-15',
      notes: 'Visite terminée, décision en attente',
      reminder_sent: true,
    },
    {
      id: '4',
      property_id: 'prop4',
      property_title: 'Appartement 2 pièces Yopougon',
      property_city: 'Yopougon',
      property_address: 'Rue des Jardins, Yopougon',
      property_image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      visit_date: '2025-11-18',
      visit_time: '11:00',
      status: 'annulee',
      visit_type: 'physique',
      owner_name: 'Sophie Koné',
      owner_phone: '+225 07 00 00 00 04',
      owner_email: 'sophie.kone@email.com',
      created_at: '2025-11-10',
      notes: 'Annulée par le propriétaire',
      reminder_sent: false,
    },
  ];

  const allVisits = visits.length > 0 ? visits : mockVisits;

  const today = new Date().toISOString().split('T')[0];

  const filteredVisits = allVisits.filter(visit => {
    if (view === 'upcoming') {
      return visit.visit_date >= today && visit.status !== 'annulee';
    } else if (view === 'past') {
      return visit.visit_date < today || visit.status === 'annulee' || visit.status === 'terminee';
    }
    return true;
  });

  const getStatusInfo = (status: Visit['status']) => {
    switch (status) {
      case 'en_attente':
        return {
          label: 'En attente',
          color: 'amber',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          icon: AlertCircle,
        };
      case 'confirmee':
        return {
          label: 'Confirmée',
          color: 'green',
          bg: 'bg-green-50',
          text: 'text-green-700',
          icon: CheckCircle,
        };
      case 'annulee':
        return {
          label: 'Annulée',
          color: 'red',
          bg: 'bg-red-50',
          text: 'text-red-700',
          icon: XCircle,
        };
      case 'terminee':
        return {
          label: 'Terminée',
          color: 'blue',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          icon: CheckCircle,
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const isToday = (dateString: string) => {
    return dateString === today;
  };

  const isTomorrow = (dateString: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateString === tomorrow.toISOString().split('T')[0];
  };

  const getRelativeDate = (dateString: string) => {
    if (isToday(dateString)) return 'Aujourd\'hui';
    if (isTomorrow(dateString)) return 'Demain';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const handleConfirmVisit = (visitId: string) => {
    // TODO: Implémenter la confirmation de visite
    console.log('Confirmer visite:', visitId);
  };

  const handleRescheduleVisit = (visitId: string) => {
    // TODO: Implémenter la reprogrammation
    console.log('Reprogrammer visite:', visitId);
  };

  const handleCancelVisit = (visitId: string) => {
    // TODO: Implémenter l'annulation
    console.log('Annuler visite:', visitId);
  };

  const stats = {
    total: allVisits.length,
    upcoming: allVisits.filter(v => v.visit_date >= today && v.status !== 'annulee').length,
    confirmed: allVisits.filter(v => v.status === 'confirmee').length,
    pending: allVisits.filter(v => v.status === 'en_attente').length,
    past: allVisits.filter(v => v.visit_date < today || v.status === 'annulee' || v.status === 'terminee').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {(showHeader || visits.length === 0) && (
        <div>
          <h2 className="text-h3 font-bold text-text-primary mb-2">
            Mes visites
          </h2>
          <p className="text-body text-text-secondary">
            Planifiez et gérez vos visites de propriétés
          </p>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card variant="bordered" className="text-center">
          <CardBody className="py-4">
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
            <p className="text-sm text-text-secondary">Total</p>
          </CardBody>
        </Card>
        <Card variant="bordered" className="text-center">
          <CardBody className="py-4">
            <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
            <p className="text-sm text-text-secondary">À venir</p>
          </CardBody>
        </Card>
        <Card variant="bordered" className="text-center">
          <CardBody className="py-4">
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-sm text-text-secondary">Confirmées</p>
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
            <p className="text-2xl font-bold text-text-secondary">{stats.past}</p>
            <p className="text-sm text-text-secondary">Passées</p>
          </CardBody>
        </Card>
      </div>

      {/* Filtres */}
      <Card variant="bordered">
        <CardBody>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={view === 'upcoming' ? 'primary' : 'ghost'}
              size="small"
              onClick={() => setView('upcoming')}
            >
              À venir ({stats.upcoming})
            </Button>
            <Button
              variant={view === 'past' ? 'primary' : 'ghost'}
              size="small"
              onClick={() => setView('past')}
            >
              Historique ({stats.past})
            </Button>
            <Button
              variant={view === 'all' ? 'primary' : 'ghost'}
              size="small"
              onClick={() => setView('all')}
            >
              Toutes ({stats.total})
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Calendrier simple et liste des visites */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mini calendrier */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="text-lg">Décembre 2025</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-text-disabled mx-auto mb-3" />
              <p className="text-sm text-text-secondary">Calendrier interactif</p>
              <p className="text-xs text-text-disabled">À implémenter</p>
            </div>
          </CardBody>
        </Card>

        {/* Liste des visites */}
        <div className="lg:col-span-2 space-y-4">
          {filteredVisits.length > 0 ? (
            filteredVisits.map((visit) => {
              const statusInfo = getStatusInfo(visit.status);
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={visit.id} variant="bordered" hoverable>
                  <CardBody>
                    <div className="flex gap-4">
                      {/* Image de la propriété */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={visit.property_image || 'https://via.placeholder.com/80'}
                          alt={visit.property_title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Contenu principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-primary mb-1">
                              {visit.property_title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-text-secondary mb-2">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {visit.property_city}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {getRelativeDate(visit.visit_date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(visit.visit_time)}
                              </div>
                              {visit.visit_type === 'virtuelle' && (
                                <div className="flex items-center gap-1">
                                  <Video className="h-3 w-3" />
                                  Virtuelle
                                </div>
                              )}
                            </div>
                            {visit.property_address && (
                              <p className="text-xs text-text-disabled">
                                {visit.property_address}
                              </p>
                            )}
                          </div>

                          {/* Badge de statut */}
                          <span className={`
                            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                            ${statusInfo.bg} ${statusInfo.text}
                          `}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Propriétaire */}
                        {visit.owner_name && (
                          <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {visit.owner_name}
                            </div>
                            {visit.owner_phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {visit.owner_phone}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {visit.notes && (
                          <p className="text-sm text-text-secondary mb-3 bg-neutral-50 p-2 rounded-lg">
                            {visit.notes}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-text-disabled">
                            Programmé le {formatDate(visit.visit_date)}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="small"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Détails
                            </Button>
                            {visit.status === 'en_attente' && (
                              <>
                                <Button
                                  variant="primary"
                                  size="small"
                                  onClick={() => handleConfirmVisit(visit.id)}
                                >
                                  Confirmer
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="small"
                                  onClick={() => handleRescheduleVisit(visit.id)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                  Reprog.
                                </Button>
                              </>
                            )}
                            {visit.status === 'confirmee' && (
                              <Button
                                variant="ghost"
                                size="small"
                                onClick={() => handleCancelVisit(visit.id)}
                                className="text-semantic-error hover:bg-semantic-error hover:text-white"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Annuler
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })
          ) : (
            <Card variant="bordered">
              <CardBody className="text-center py-12">
                <Calendar className="h-16 w-16 text-text-disabled mx-auto mb-4" />
                <h3 className="text-h5 font-semibold text-text-primary mb-2">
                  {view === 'upcoming' ? 'Aucune visite à venir' : 
                   view === 'past' ? 'Aucun historique' : 'Aucune visite'}
                </h3>
                <p className="text-body text-text-secondary mb-6">
                  {view === 'upcoming' 
                    ? 'Vous n\'avez pas de visites programmées.'
                    : 'Aucune visite dans cette période.'
                  }
                </p>
                <Button variant="primary">
                  Planifier une visite
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}