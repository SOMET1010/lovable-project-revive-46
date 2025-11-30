import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  FileText, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Calendar,
  Home,
  User,
  Trash2,
  Check
} from 'lucide-react';
import { ApplicationNotification } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface NotificationItemProps {
  notification: ApplicationNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const getNotificationIcon = (type: string) => {
  const iconMap = {
    application_received: Home,
    application_status_change: CheckCircle,
    document_reminder: FileText,
    contract_deadline: Clock,
    new_message: MessageSquare,
    payment_reminder: DollarSign,
    lease_expiry: Calendar
  };

  return iconMap[type as keyof typeof iconMap] || AlertCircle;
};

const getPriorityColor = (priority: string) => {
  const colorMap = {
    low: 'info',
    normal: 'default',
    high: 'warning',
    urgent: 'error'
  };

  return colorMap[priority as keyof typeof colorMap] || 'default';
};

const getStatusIcon = (type: string, newStatus?: string) => {
  if (type === 'application_status_change' && newStatus) {
    switch (newStatus) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
    }
  }
  return null;
};

const formatNotificationMessage = (notification: ApplicationNotification) => {
  const { type, metadata, message } = notification;

  switch (type) {
    case 'application_received':
      return `${metadata.applicant_name} a postulé pour votre bien "${metadata.property_title || 'un bien'}"`;
    
    case 'application_status_change':
      const statusMessages: Record<string, string> = {
        pending: 'en attente de traitement',
        reviewed: 'en cours d\'examen', 
        approved: 'approuvée',
        rejected: 'rejetée',
        hired: 'retenue'
      };
      const statusMessage = statusMessages[metadata.new_status] || metadata.new_status;
      return `Votre candidature pour "${metadata.property_title || 'un bien'}" est maintenant ${statusMessage}`;
    
    case 'document_reminder':
      const dueDate = new Date(metadata.due_date);
      const now = new Date();
      const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      return `Il vous reste ${daysDiff} jour(s) pour fournir votre ${metadata.document_type} pour "${metadata.property_title || 'un bien'}"`;
    
    case 'contract_deadline':
      const contractDueDate = new Date(metadata.due_date);
      const hoursDiff = Math.ceil((contractDueDate.getTime() - now.getTime()) / (1000 * 3600));
      return `Échéance pour "${metadata.action_required}" concernant "${metadata.property_title || 'un bien'}" dans ${Math.ceil(hoursDiff / 24)} jour(s)`;
    
    case 'new_message':
      return `${metadata.sender_name}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`;
    
    case 'payment_reminder':
      return `Rappel de paiement de ${metadata.amount}€ pour "${metadata.property_title || 'un bien'}"`;
    
    case 'lease_expiry':
      return `Le bail pour "${metadata.property_title || 'un bien'}" expire bientôt`;
    
    default:
      return message;
  }
};

export function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  className = '' 
}: NotificationItemProps) {
  const IconComponent = getNotificationIcon(notification.type);
  const priorityColor = getPriorityColor(notification.priority);
  const statusIcon = getStatusIcon(notification.type, notification.metadata?.new_status);
  
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: fr
  });

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={[
        'group relative flex items-start p-4 border-b border-neutral-100 last:border-b-0',
        'hover:bg-neutral-50 transition-colors duration-200',
        'cursor-pointer',
        notification.read ? 'bg-white' : 'bg-blue-50/30',
        className
      ].join(' ')}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Notification: ${notification.title}`}
    >
      {/* Status indicator */}
      <div className={[
        'absolute left-0 top-0 bottom-0 w-1 rounded-r',
        notification.read ? 'bg-neutral-200' : 'bg-blue-500'
      ]} />

      {/* Icon */}
      <div className={[
        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3',
        notification.read ? 'bg-neutral-100' : 'bg-blue-100',
        'transition-colors duration-200'
      ].join(' ')}>
        <IconComponent 
          className={`w-5 h-5 ${
            notification.read ? 'text-neutral-600' : 'text-blue-600'
          }`} 
          aria-hidden="true" 
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h4 className={[
            'text-sm font-medium truncate',
            notification.read ? 'text-neutral-700' : 'text-neutral-900'
          ].join(' ')}>
            {notification.title}
            {statusIcon && (
              <span className="ml-2 inline-flex" aria-label="Statut">
                {statusIcon}
              </span>
            )}
          </h4>
          
          {/* Priority badge and time */}
          <div className="flex items-center space-x-2 ml-2">
            {notification.priority !== 'normal' && (
              <Badge 
                variant={priorityColor} 
                size="small"
                className="text-xs"
              >
                {notification.priority === 'urgent' ? 'Urgent' : 
                 notification.priority === 'high' ? 'Important' : 'Faible'}
              </Badge>
            )}
            <span className="text-xs text-neutral-500 whitespace-nowrap">
              {timeAgo}
            </span>
          </div>
        </div>

        {/* Message */}
        <p className={[
          'text-sm mb-2',
          notification.read ? 'text-neutral-600' : 'text-neutral-700'
        ].join(' ')}>
          {formatNotificationMessage(notification)}
        </p>

        {/* Action label */}
        {notification.action_label && (
          <span className="text-xs text-blue-600 font-medium hover:text-blue-700">
            {notification.action_label} →
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center space-x-1">
          {!notification.read && (
            <button
              onClick={handleMarkAsRead}
              className="p-1.5 text-neutral-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors duration-200"
              title="Marquer comme lu"
              aria-label="Marquer comme lu"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={handleDelete}
            className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
            title="Supprimer"
            aria-label="Supprimer la notification"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </div>
      )}
    </div>
  );
}