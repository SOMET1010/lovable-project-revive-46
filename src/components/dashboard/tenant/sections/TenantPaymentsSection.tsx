/**
 * Tenant Payments Section - Gestion des paiements et historique financier
 */

import { useState } from 'react';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  Plus,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

interface Payment {
  id: string;
  type: 'loyer' | 'charges' | 'depot' | 'frais' | 'maintenance';
  amount: number;
  currency: 'XOF';
  status: 'paye' | 'en_attente' | 'en_retard' | 'annule';
  due_date: string;
  paid_date?: string;
  property_title: string;
  property_city: string;
  payment_method?: 'carte' | 'mobile_money' | 'virement' | 'especes';
  reference?: string;
  description?: string;
  receipt_url?: string;
  next_payment_date?: string;
}

interface TenantPaymentsSectionProps {
  payments?: Payment[];
}

export function TenantPaymentsSection({ payments = [] }: TenantPaymentsSectionProps) {
  const [filter, setFilter] = useState<'all' | Payment['status'] | Payment['type']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'upcoming' | 'history' | 'all'>('upcoming');

  // Données mock pour la démo
  const mockPayments: Payment[] = [
    {
      id: '1',
      type: 'loyer',
      amount: 180000,
      currency: 'XOF',
      status: 'paye',
      due_date: '2025-11-30',
      paid_date: '2025-11-28',
      property_title: 'Appartement moderne Cocody',
      property_city: 'Cocody',
      payment_method: 'carte',
      reference: 'PAY-2025-1128-001',
      description: 'Loyer décembre 2025',
      receipt_url: '/receipts/pay-001.pdf',
      next_payment_date: '2025-12-30',
    },
    {
      id: '2',
      type: 'charges',
      amount: 25000,
      currency: 'XOF',
      status: 'en_attente',
      due_date: '2025-12-05',
      property_title: 'Appartement moderne Cocody',
      property_city: 'Cocody',
      payment_method: 'mobile_money',
      description: 'Charges communes décembre',
      next_payment_date: '2025-12-05',
    },
    {
      id: '3',
      type: 'depot',
      amount: 360000,
      currency: 'XOF',
      status: 'paye',
      due_date: '2025-11-15',
      paid_date: '2025-11-12',
      property_title: 'Appartement moderne Cocody',
      property_city: 'Cocody',
      payment_method: 'virement',
      reference: 'DEP-2025-1112-001',
      description: 'Dépôt de garantie',
      receipt_url: '/receipts/dep-001.pdf',
    },
    {
      id: '4',
      type: 'loyer',
      amount: 180000,
      currency: 'XOF',
      status: 'en_retard',
      due_date: '2025-10-30',
      property_title: 'Appartement moderne Cocody',
      property_city: 'Cocody',
      description: 'Loyer novembre 2025',
      next_payment_date: '2025-11-30',
    },
    {
      id: '5',
      type: 'maintenance',
      amount: 15000,
      currency: 'XOF',
      status: 'paye',
      due_date: '2025-11-20',
      paid_date: '2025-11-19',
      property_title: 'Appartement moderne Cocody',
      property_city: 'Cocody',
      payment_method: 'carte',
      reference: 'MAINT-2025-1119-001',
      description: 'Réparation plomberie',
      receipt_url: '/receipts/maint-001.pdf',
    },
  ];

  const allPayments = payments.length > 0 ? payments : mockPayments;

  const today = new Date().toISOString().split('T')[0];

  const filteredPayments = allPayments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter || payment.type === filter;
    const matchesSearch = payment.property_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtrer par vue
    let matchesView = true;
    if (viewMode === 'upcoming') {
      matchesView = payment.status === 'en_attente' || payment.status === 'en_retard';
    } else if (viewMode === 'history') {
      matchesView = payment.status === 'paye' || payment.status === 'annule';
    }
    
    return matchesFilter && matchesSearch && matchesView;
  });

  const getStatusInfo = (status: Payment['status']) => {
    switch (status) {
      case 'paye':
        return {
          label: 'Payé',
          color: 'green',
          bg: 'bg-green-50',
          text: 'text-green-700',
          icon: CheckCircle,
        };
      case 'en_attente':
        return {
          label: 'En attente',
          color: 'amber',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          icon: Clock,
        };
      case 'en_retard':
        return {
          label: 'En retard',
          color: 'red',
          bg: 'bg-red-50',
          text: 'text-red-700',
          icon: AlertTriangle,
        };
      case 'annule':
        return {
          label: 'Annulé',
          color: 'gray',
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          icon: RefreshCw,
        };
    }
  };

  const getTypeInfo = (type: Payment['type']) => {
    switch (type) {
      case 'loyer':
        return { label: 'Loyer', color: 'blue' };
      case 'charges':
        return { label: 'Charges', color: 'purple' };
      case 'depot':
        return { label: 'Dépôt', color: 'orange' };
      case 'frais':
        return { label: 'Frais', color: 'gray' };
      case 'maintenance':
        return { label: 'Maintenance', color: 'green' };
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount).replace(currency, 'FCFA');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isOverdue = (dueDate: string, status: Payment['status']) => {
    return status === 'en_attente' && dueDate < today;
  };

  const daysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDownloadReceipt = (paymentId: string) => {
    // TODO: Implémenter le téléchargement de reçu
    console.log('Télécharger reçu:', paymentId);
  };

  const handleMakePayment = (paymentId: string) => {
    // TODO: Implémenter le processus de paiement
    console.log('Effectuer paiement:', paymentId);
  };

  const handleViewDetails = (paymentId: string) => {
    // TODO: Implémenter la navigation vers les détails
    console.log('Voir détails:', paymentId);
  };

  const stats = {
    totalPaid: allPayments.filter(p => p.status === 'paye').reduce((sum, p) => sum + p.amount, 0),
    upcomingDue: allPayments.filter(p => p.status === 'en_attente').reduce((sum, p) => sum + p.amount, 0),
    overdue: allPayments.filter(p => p.status === 'en_retard').length,
    nextPayment: allPayments
      .filter(p => p.status === 'en_attente')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-h3 font-bold text-text-primary mb-2">
            Mes paiements
          </h2>
          <p className="text-body text-text-secondary">
            Gérez vos transactions financières et historique de paiements
          </p>
        </div>
        <Button variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau paiement
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="elevated">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total payé</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(stats.totalPaid, 'XOF')}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">À payer</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatPrice(stats.upcomingDue, 'XOF')}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">En retard</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.overdue}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Prochaine échéance</p>
                <p className="text-lg font-bold text-primary-500">
                  {stats.nextPayment ? formatDate(stats.nextPayment.due_date) : 'N/A'}
                </p>
                {stats.nextPayment && (
                  <p className="text-xs text-text-secondary">
                    {daysUntilDue(stats.nextPayment.due_date) === 0 
                      ? 'Aujourd\'hui' 
                      : daysUntilDue(stats.nextPayment.due_date) > 0
                      ? `Dans ${daysUntilDue(stats.nextPayment.due_date)} jours`
                      : 'En retard'
                    }
                  </p>
                )}
              </div>
              <div className="p-3 bg-primary-50 rounded-xl">
                <Calendar className="h-6 w-6 text-primary-500" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card variant="bordered">
        <CardBody>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Vue */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'upcoming' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setViewMode('upcoming')}
              >
                À venir
              </Button>
              <Button
                variant={viewMode === 'history' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setViewMode('history')}
              >
                Historique
              </Button>
              <Button
                variant={viewMode === 'all' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setViewMode('all')}
              >
                Tout
              </Button>
            </div>

            {/* Filtres de statut */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === 'all' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setFilter('all')}
              >
                Tous
              </Button>
              <Button
                variant={filter === 'paye' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setFilter('paye')}
              >
                Payés
              </Button>
              <Button
                variant={filter === 'en_attente' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setFilter('en_attente')}
              >
                En attente
              </Button>
              <Button
                variant={filter === 'en_retard' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setFilter('en_retard')}
              >
                En retard
              </Button>
            </div>

            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-disabled" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Alertes */}
      {stats.overdue > 0 && (
        <Card variant="elevated" className="border-semantic-error border-2">
          <CardBody>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-semantic-error" />
              <div>
                <h3 className="font-semibold text-semantic-error">
                  Paiement en retard détecté
                </h3>
                <p className="text-sm text-text-secondary">
                  Vous avez {stats.overdue} paiement{stats.overdue > 1 ? 's' : ''} en retard. 
                  Effectuez vos paiements pour éviter des frais supplémentaires.
                </p>
              </div>
              <Button variant="danger" size="small" className="ml-auto">
                Régler maintenant
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Liste des paiements */}
      {filteredPayments.length > 0 ? (
        <div className="space-y-4">
          {filteredPayments.map((payment) => {
            const statusInfo = getStatusInfo(payment.status);
            const typeInfo = getTypeInfo(payment.type);
            const StatusIcon = statusInfo.icon;
            const isPaymentOverdue = isOverdue(payment.due_date, payment.status);
            const daysToDue = daysUntilDue(payment.due_date);

            return (
              <Card 
                key={payment.id} 
                variant="bordered" 
                hoverable
                className={isPaymentOverdue ? 'border-semantic-error' : ''}
              >
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary-50 rounded-lg">
                          <DollarSign className="h-5 w-5 text-primary-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-text-primary mb-1">
                            {payment.description || `${typeInfo.label} - ${payment.property_title}`}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-text-secondary">
                            <span>{payment.property_title}</span>
                            <span>•</span>
                            <span>{payment.property_city}</span>
                            {payment.reference && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-xs">{payment.reference}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-text-primary">
                            {formatPrice(payment.amount, payment.currency)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`
                              inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                              ${statusInfo.bg} ${statusInfo.text}
                            `}>
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </span>
                            {isPaymentOverdue && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                                En retard
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-text-secondary">Date d'échéance</p>
                          <p className="font-medium text-text-primary">
                            {formatDate(payment.due_date)}
                          </p>
                          {payment.status === 'en_attente' && (
                            <p className="text-xs text-text-disabled">
                              {daysToDue === 0 
                                ? 'Aujourd\'hui' 
                                : daysToDue > 0
                                ? `Dans ${daysToDue} jours`
                                : `En retard de ${Math.abs(daysToDue)} jours`
                              }
                            </p>
                          )}
                        </div>
                        
                        {payment.paid_date && (
                          <div>
                            <p className="text-text-secondary">Date de paiement</p>
                            <p className="font-medium text-text-primary">
                              {formatDate(payment.paid_date)}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-text-secondary">Méthode de paiement</p>
                          <p className="font-medium text-text-primary capitalize">
                            {payment.payment_method?.replace('_', ' ') || 'Non spécifiée'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleViewDetails(payment.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                      {payment.receipt_url && (
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleDownloadReceipt(payment.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Reçu
                        </Button>
                      )}
                    </div>
                    
                    {(payment.status === 'en_attente' || payment.status === 'en_retard') && (
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => handleMakePayment(payment.id)}
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Payer maintenant
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card variant="bordered">
          <CardBody className="text-center py-12">
            <CreditCard className="h-16 w-16 text-text-disabled mx-auto mb-4" />
            <h3 className="text-h5 font-semibold text-text-primary mb-2">
              {filter === 'all' ? 'Aucun paiement' : `Aucun paiement ${filter}`}
            </h3>
            <p className="text-body text-text-secondary mb-6">
              {viewMode === 'upcoming' 
                ? 'Vous n\'avez pas de paiements en attente.'
                : viewMode === 'history'
                ? 'Aucun historique de paiement disponible.'
                : 'Aucun paiement trouvé pour les critères sélectionnés.'
              }
            </p>
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Effectuer un paiement
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}