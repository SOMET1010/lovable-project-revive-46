import { useState, useEffect, useCallback, useRef } from 'react';
import { ApplicationNotification, NotificationFilter, NotificationSettings } from '@/types';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';

export interface UseNotificationsReturn {
  notifications: ApplicationNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  filter: NotificationFilter;
  settings: NotificationSettings | null;
  
  // Actions
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  setFilter: (filter: Partial<NotificationFilter>) => void;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  playSound: (type?: 'new' | 'read') => void;
  
  // Real-time subscription
  isSubscribed: boolean;
  subscribe: () => void;
  unsubscribe: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  
  // State
  const [notifications, setNotifications] = useState<ApplicationNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [filter, setFilterState] = useState<NotificationFilter>({
    limit: 50,
    offset: 0
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Refs
  const subscriptionRef = useRef<(() => void) | null>(null);
  const soundEnabledRef = useRef(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Audio context for notification sounds
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playNotificationSound = useCallback((type: 'new' | 'read' = 'new') => {
    if (!soundEnabledRef.current || !settings?.sound_enabled) return;

    try {
      const audioContext = initAudioContext();
      
      // Create a simple beep sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different types
      const frequency = type === 'new' ? 800 : 600;
      const duration = type === 'new' ? 0.2 : 0.1;
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, [initAudioContext, settings?.sound_enabled]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const data = await notificationService.getNotifications(filter.limit);
      
      // Apply filters
      let filteredData = data;
      if (filter.type) {
        filteredData = filteredData.filter(n => n.type === filter.type);
      }
      if (filter.priority) {
        filteredData = filteredData.filter(n => n.priority === filter.priority);
      }
      if (filter.read !== undefined) {
        filteredData = filteredData.filter(n => n.read === filter.read);
      }
      if (filter.dateFrom) {
        filteredData = filteredData.filter(n => n.created_at >= filter.dateFrom!);
      }
      if (filter.dateTo) {
        filteredData = filteredData.filter(n => n.created_at <= filter.dateTo!);
      }

      setNotifications(filteredData);
      
      // Update unread count
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      playNotificationSound('read');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage');
    }
  }, [playNotificationSound]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const count = await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
      playNotificationSound('read');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage');
    }
  }, [playNotificationSound]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // Update unread count if deleted notification was unread
      const deleted = notifications.find(n => n.id === id);
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }, [notifications]);

  // Set filter
  const setFilter = useCallback((newFilter: Partial<NotificationFilter>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }));
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    try {
      if (!user) return;
      
      const updatedSettings = { ...settings, ...newSettings } as NotificationSettings;
      await notificationService.updatePreferences(updatedSettings);
      setSettings(updatedSettings);
      soundEnabledRef.current = updatedSettings.sound_enabled;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour des paramètres');
    }
  }, [user, settings]);

  // Subscribe to real-time notifications
  const subscribe = useCallback(() => {
    if (!user || isSubscribed) return;

    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      (notification) => {
        // Add new notification to the list
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Play sound for new notifications
        playNotificationSound('new');
        
        // Show browser notification if enabled
        if (settings?.push_enabled && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png',
            badge: '/logo-badge.png',
            tag: notification.id,
            requireInteraction: notification.priority === 'urgent'
          });
        }
      }
    );

    subscriptionRef.current = unsubscribe;
    setIsSubscribed(true);
  }, [user, isSubscribed, playNotificationSound, settings?.push_enabled]);

  // Unsubscribe from real-time notifications
  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }
    setIsSubscribed(false);
  }, []);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const preferences = await notificationService.getPreferences();
        if (preferences) {
          setSettings(preferences as NotificationSettings);
          soundEnabledRef.current = preferences.push_enabled;
        }
      } catch (err) {
        console.warn('Failed to load notification settings:', err);
      }
    };

    loadSettings();
  }, [user]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Subscribe to real-time notifications when user changes
  useEffect(() => {
    if (user && settings?.push_enabled) {
      subscribe();
    }

    return () => {
      unsubscribe();
    };
  }, [user, settings?.push_enabled, subscribe, unsubscribe]);

  // Fetch notifications when filters change or user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, filter, fetchNotifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribe();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [unsubscribe]);

  // Play sound method for external use
  const playSound = useCallback((type: 'new' | 'read' = 'new') => {
    playNotificationSound(type);
  }, [playNotificationSound]);

  return {
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
    updateSettings,
    playSound,
    
    isSubscribed,
    subscribe,
    unsubscribe
  };
}