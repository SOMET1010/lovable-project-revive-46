/**
 * Page complète des notifications
 * Affiche toutes les notifications de l'utilisateur avec filtres et pagination
 */

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, ExternalLink } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { notificationService, Notification } from '@/services/notificationService';
import { Button } from '@/shared/ui/Button';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [notifications, filter, typeFilter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(100);
      setNotifications(data);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Erreur comptage non lus:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.read);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur marquage comme lu:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur marquage tout comme lu:', err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette notification ?')) return;
    
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Erreur suppression notification:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800 border-gray-300',
      normal: 'bg-blue-100 text-blue-800 border-blue-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      urgent: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[priority] || colors['normal'];
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      payment_received: 'Paiement reçu',
      payment_reminder: 'Rappel paiement',
      visit_scheduled: 'Visite programmée',
      visit_reminder: 'Rappel visite',
      application_received: 'Candidature reçue',
      application_status: 'Statut candidature',
      contract_signed: 'Contrat signé',
      contract_expiring: 'Contrat expire',
      message_received: 'Message reçu',
      property_update: 'Mise à jour propriété',
      verification_complete: 'Vérification complète',
      lead_assigned: 'Lead assigné',
      commission_earned: 'Commission gagnée',
      maintenance_request: 'Demande maintenance',
      system_announcement: 'Annonce système'
    };
    return labels[type] || type;
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    if (seconds < 2592000) return `Il y a ${Math.floor(seconds / 86400)}j`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const uniqueTypes = Array.from(new Set(notifications.map(n => n.type)));

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600">Veuillez vous connecter pour voir vos notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h1 font-bold text-neutral-900 flex items-center gap-3">
                <Bell className="h-8 w-8 text-primary-500" />
                Notifications
              </h1>
              <p className="text-neutral-600 mt-2">
                {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Aucune notification non lue'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="small"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Tout marquer lu
                </Button>
              )}
            </div>
          </div>

          {/* Filtres */}
          {showFilters && (
            <div className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Statut
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'all'
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      Toutes
                    </button>
                    <button
                      onClick={() => setFilter('unread')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'unread'
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      Non lues
                    </button>
                    <button
                      onClick={() => setFilter('read')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'read'
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      Lues
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="input w-full"
                  >
                    <option value="all">Tous les types</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>
                        {getTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          )}

          {!loading && filteredNotifications.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Bell className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">
                {filter === 'unread' 
                  ? 'Aucune notification non lue' 
                  : typeFilter !== 'all'
                  ? 'Aucune notification de ce type'
                  : 'Aucune notification'}
              </p>
            </div>
          )}

          {!loading && filteredNotifications.length > 0 && (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all hover:shadow-lg ${
                    !notification.read ? 'border-primary-200 bg-primary-50/30' : 'border-neutral-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {getTypeLabel(notification.type)}
                        </span>
                        {!notification.read && (
                          <span className="h-2 w-2 bg-primary-500 rounded-full"></span>
                        )}
                      </div>

                      <h3 className="text-h5 font-bold text-neutral-900 mb-2">
                        {notification.title}
                      </h3>
                      <p className="text-neutral-700 mb-3">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>{getTimeAgo(notification.created_at)}</span>
                        {notification.read_at && (
                          <span>Lu {getTimeAgo(notification.read_at)}</span>
                        )}
                      </div>

                      {notification.action_url && (
                        <div className="mt-3">
                          <a
                            href={notification.action_url}
                            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm"
                          >
                            <span>{notification.action_label || 'Voir'}</span>
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Marquer comme lu"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredNotifications.length > 0 && (
            <div className="mt-8 text-center">
              <a
                href="/notifications/preferences"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
              >
                Gérer mes préférences de notifications
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
