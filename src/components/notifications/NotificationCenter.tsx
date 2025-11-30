import React, { useState } from 'react';
import { Search, Filter, X, CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { NotificationSettings } from './NotificationSettings';
import { useNotifications } from '@/hooks/useNotifications';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NotificationType, NotificationPriority } from '@/types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  application_received: 'Nouvelle candidature',
  application_status_change: 'Changement de statut',
  document_reminder: 'Documents manquants',
  contract_deadline: 'Échéance contrat',
  new_message: 'Nouveau message',
  payment_reminder: 'Rappel paiement',
  lease_expiry: 'Expiration bail'
};

const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  low: 'Faible',
  normal: 'Normal',
  high: 'Important',
  urgent: 'Urgent'
};

export function NotificationCenter({ isOpen, onClose, className = '' }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    filter,
    settings,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setFilter,
    updateSettings
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [localFilter, setLocalFilter] = useState(filter);

  // Filter notifications based on search
  const filteredNotifications = notifications.filter(notification => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleApplyFilter = () => {
    setFilter(localFilter);
  };

  const handleClearFilter = () => {
    const emptyFilter = { limit: 50, offset: 0 };
    setLocalFilter(emptyFilter);
    setFilter(emptyFilter);
    setSearchQuery('');
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleRefresh = async () => {
    await refreshNotifications();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-neutral-900">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <Badge variant="error" size="small">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              title="Paramètres"
            >
              <Filter className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-b border-neutral-200">
            <NotificationSettings
              settings={settings}
              onUpdateSettings={updateSettings}
              onClose={() => setShowSettings(false)}
            />
          </div>
        )}

        {/* Filters */}
        <div className="p-4 border-b border-neutral-200 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher dans les notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Tout marquer lu
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilter}
              >
                Effacer filtres
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-2 gap-3">
            {/* Type filter */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Type
              </label>
              <select
                value={localFilter.type || ''}
                onChange={(e) => setLocalFilter(prev => ({ 
                  ...prev, 
                  type: e.target.value as NotificationType || undefined 
                }))}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                {Object.entries(NOTIFICATION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority filter */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Priorité
              </label>
              <select
                value={localFilter.priority || ''}
                onChange={(e) => setLocalFilter(prev => ({ 
                  ...prev, 
                  priority: e.target.value as NotificationPriority || undefined 
                }))}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les priorités</option>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Read status filter */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Statut de lecture
            </label>
            <select
              value={localFilter.read === undefined ? '' : localFilter.read.toString()}
              onChange={(e) => setLocalFilter(prev => ({ 
                ...prev, 
                read: e.target.value === '' ? undefined : e.target.value === 'true'
              }))}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              <option value="true">Non lues</option>
              <option value="false">Lues</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {error ? (
            <div className="p-4 text-center text-red-600">
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-2"
              >
                Réessayer
              </Button>
            </div>
          ) : loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-neutral-500">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                <CheckCheck className="w-6 h-6 text-neutral-400" />
              </div>
              <p className="text-sm font-medium">Aucune notification</p>
              <p className="text-xs text-neutral-400 text-center">
                {searchQuery || Object.keys(filter).some(key => filter[key as keyof typeof filter])
                  ? 'Aucune notification ne correspond à vos filtres'
                  : 'Vous êtes à jour !'}
              </p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="divide-y divide-neutral-100">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with stats */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-neutral-200 bg-neutral-50">
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span>
                {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''}
                {filteredNotifications.length !== notifications.length && 
                  ` sur ${notifications.length} au total`
                }
              </span>
              <span>
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}