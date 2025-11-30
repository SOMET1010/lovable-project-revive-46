/**
 * Section Notifications
 * Affiche et gère les notifications utilisateur
 */

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Eye } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificationItem,
} from '@/services/userDashboardService';

export function NotificationsSection() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getNotifications();
      if (fetchError) throw fetchError;
      setNotifications(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await markNotificationAsRead(id);
      if (error) throw error;
      
      setNotifications(
        notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await markAllNotificationsAsRead();
      if (error) throw error;
      
      setNotifications(
        notifications.map((n) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'property_update':
      case 'new_property':
        return '🏠';
      case 'price_change':
        return '💰';
      case 'message':
        return '💬';
      case 'visit':
        return '📅';
      case 'contract':
        return '📄';
      case 'payment':
        return '💳';
      default:
        return '🔔';
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-neutral-500">Chargement des notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadNotifications}>Réessayer</Button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg shadow-md text-center">
        <Bell className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-h4 font-semibold text-neutral-900 mb-2">
          Aucune notification
        </h3>
        <p className="text-neutral-500">
          Vous serez notifié ici des mises à jour importantes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-h4 font-semibold text-neutral-900">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <p className="text-small text-neutral-500">
              {unreadCount} non {unreadCount > 1 ? 'lues' : 'lue'}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {/* Filtres */}
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-small font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-white text-primary-500 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-md text-small font-semibold transition-colors ${
                filter === 'unread'
                  ? 'bg-white text-primary-500 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Non lues
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary-500 text-white text-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Marquer tout comme lu */}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              title="Marquer tout comme lu"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Liste des notifications */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-neutral-500">Aucune notification à afficher</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md divide-y divide-neutral-100">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 transition-colors ${
                notification.is_read ? 'bg-white' : 'bg-primary-50'
              } hover:bg-neutral-50`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 text-2xl">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900 mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-small text-neutral-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Marquer comme lu"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action data */}
                  {notification.data && notification.data.action_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => window.location.href = notification.data.action_url}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {notification.data.action_label || 'Voir'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
