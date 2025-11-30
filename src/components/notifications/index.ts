/**
 * Notification System Components
 * Système de notifications temps réel pour les candidatures
 */

// Core Components
export { NotificationCenter } from './NotificationCenter';
export { NotificationBell } from './NotificationBell';
export { NotificationItem } from './NotificationItem';
export { NotificationSettings } from './NotificationSettings';

// Hook
export { useNotifications } from '@/hooks/useNotifications';

// Services
export { applicationNotificationService } from '@/services/applicationNotificationService';

// Types
export type {
  ApplicationNotification,
  NotificationType,
  NotificationPriority,
  NotificationSettings,
  NotificationFilter
} from '@/types';

// Re-export from services
export type { CreateApplicationNotificationParams } from '@/services/applicationNotificationService';

// Advanced Components
export { NotificationDropdown, NotificationWidget, FloatingNotificationButton } from './NotificationDropdown';

// Examples and utilities
export { NotificationsExample, SidebarNotifications, DashboardWithNotifications, useNotificationIntegration } from './examples';