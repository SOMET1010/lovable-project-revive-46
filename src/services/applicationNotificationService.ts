import { ApplicationNotification, NotificationType, NotificationPriority } from '@/types';
import { supabase } from '@/services/supabase/client';

export interface CreateApplicationNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface NotificationStatistics {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

export const applicationNotificationService = {
  // Get notifications with filters
  async getNotifications(params: {
    userId: string;
    limit?: number;
    offset?: number;
    type?: NotificationType;
    priority?: NotificationPriority;
    read?: boolean;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApplicationNotification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false });

    if (params.limit) {
      query = query.limit(params.limit);
    }
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
    }
    if (params.type) {
      query = query.eq('type', params.type);
    }
    if (params.priority) {
      query = query.eq('priority', params.priority);
    }
    if (params.read !== undefined) {
      query = query.eq('read', params.read);
    }
    if (params.dateFrom) {
      query = query.gte('created_at', params.dateFrom);
    }
    if (params.dateTo) {
      query = query.lte('created_at', params.dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  // Create a new notification
  async createNotification(params: CreateApplicationNotificationParams): Promise<string> {
    const notificationData = {
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      channels: ['in_app'],
      read: false,
      action_url: params.actionUrl,
      action_label: params.actionLabel,
      metadata: params.metadata || {},
      priority: params.priority || 'normal'
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  // Mark as read
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
  },

  // Mark all as read
  async markAllAsRead(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('read', false)
      .select('id');

    if (error) throw error;
    return data?.length || 0;
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  // Get statistics
  async getStatistics(userId: string, daysBack: number = 30): Promise<NotificationStatistics> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - daysBack);
    const dateFromStr = dateFrom.toISOString();

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', dateFromStr);

    if (error) throw error;

    const notifications = data || [];
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    
    const byType: Record<NotificationType, number> = {
      application_received: 0,
      application_status_change: 0,
      document_reminder: 0,
      contract_deadline: 0,
      new_message: 0,
      payment_reminder: 0,
      lease_expiry: 0
    };

    const byPriority: Record<NotificationPriority, number> = {
      low: 0,
      normal: 0,
      high: 0,
      urgent: 0
    };

    notifications.forEach(notification => {
      byType[notification.type as NotificationType]++;
      byPriority[notification.priority as NotificationPriority]++;
    });

    return {
      total,
      unread,
      byType,
      byPriority
    };
  },

  // Predefined notification creators
  async notifyApplicationReceived(params: {
    ownerId: string;
    applicantName: string;
    propertyTitle: string;
    propertyId: string;
    applicationId: string;
  }): Promise<string> {
    return this.createNotification({
      userId: params.ownerId,
      type: 'application_received',
      title: 'Nouvelle candidature reçue',
      message: `${params.applicantName} a postulé pour votre bien "${params.propertyTitle}"`,
      priority: 'high',
      actionUrl: `/dashboard/applications/${params.applicationId}`,
      actionLabel: 'Voir la candidature',
      metadata: {
        property_id: params.propertyId,
        application_id: params.applicationId,
        applicant_name: params.applicantName
      }
    });
  },

  async notifyStatusChange(params: {
    applicantId: string;
    propertyTitle: string;
    propertyId: string;
    applicationId: string;
    oldStatus: string;
    newStatus: string;
  }): Promise<string> {
    const statusMessages: Record<string, string> = {
      pending: 'en attente de traitement',
      reviewed: 'en cours d\'examen',
      approved: 'approuvée',
      rejected: 'rejetée',
      hired: 'retenue'
    };

    return this.createNotification({
      userId: params.applicantId,
      type: 'application_status_change',
      title: 'Statut de candidature mis à jour',
      message: `Votre candidature pour "${params.propertyTitle}" est maintenant ${statusMessages[params.newStatus] || params.newStatus}`,
      priority: params.newStatus === 'approved' ? 'high' : 'normal',
      actionUrl: `/dashboard/my-applications/${params.applicationId}`,
      actionLabel: 'Voir ma candidature',
      metadata: {
        property_id: params.propertyId,
        application_id: params.applicationId,
        old_status: params.oldStatus,
        new_status: params.newStatus
      }
    });
  },

  async notifyDocumentReminder(params: {
    userId: string;
    documentType: string;
    propertyTitle: string;
    dueDate: string;
    propertyId: string;
    applicationId: string;
  }): Promise<string> {
    const dueDate = new Date(params.dueDate);
    const now = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    let priority: NotificationPriority = 'normal';
    let title = 'Documents manquants';
    
    if (daysDiff <= 1) {
      priority = 'urgent';
      title = 'Documents manquants - Urgent';
    } else if (daysDiff <= 3) {
      priority = 'high';
      title = 'Documents manquants -Important';
    }

    return this.createNotification({
      userId: params.userId,
      type: 'document_reminder',
      title,
      message: `Il vous reste ${daysDiff} jour(s) pour fournir votre ${params.documentType} pour "${params.propertyTitle}"`,
      priority,
      actionUrl: `/dashboard/my-applications/${params.applicationId}/documents`,
      actionLabel: 'Télécharger les documents',
      metadata: {
        property_id: params.propertyId,
        application_id: params.applicationId,
        document_type: params.documentType,
        due_date: params.dueDate
      }
    });
  },

  async notifyContractDeadline(params: {
    userId: string;
    propertyTitle: string;
    contractId: string;
    dueDate: string;
    actionRequired: string;
  }): Promise<string> {
    const dueDate = new Date(params.dueDate);
    const now = new Date();
    const hoursDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600));
    
    let priority: NotificationPriority = 'normal';
    if (hoursDiff <= 24) {
      priority = 'urgent';
    } else if (hoursDiff <= 72) {
      priority = 'high';
    }

    return this.createNotification({
      userId: params.userId,
      type: 'contract_deadline',
      title: 'Échéance contrat',
      message: `Échéance pour "${params.actionRequired}" concernant "${params.propertyTitle}" dans ${Math.ceil(hoursDiff / 24)} jour(s)`,
      priority,
      actionUrl: `/dashboard/contracts/${params.contractId}`,
      actionLabel: 'Voir le contrat',
      metadata: {
        contract_id: params.contractId,
        property_title: params.propertyTitle,
        due_date: params.dueDate,
        action_required: params.actionRequired
      }
    });
  },

  async notifyNewMessage(params: {
    userId: string;
    senderName: string;
    propertyTitle: string;
    messagePreview: string;
    propertyId: string;
    messageId: string;
  }): Promise<string> {
    return this.createNotification({
      userId: params.userId,
      type: 'new_message',
      title: 'Nouveau message',
      message: `${params.senderName}: ${params.messagePreview.substring(0, 100)}${params.messagePreview.length > 100 ? '...' : ''}`,
      priority: 'normal',
      actionUrl: `/dashboard/messages/${params.messageId}`,
      actionLabel: 'Lire le message',
      metadata: {
        property_id: params.propertyId,
        message_id: params.messageId,
        sender_name: params.senderName
      }
    });
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(
    userId: string,
    callback: (notification: ApplicationNotification) => void
  ): () => void {
    const subscription = supabase
      .channel('application_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as ApplicationNotification);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
};