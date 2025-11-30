import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ApplicationNotification, NotificationFilter, NotificationSettings } from '@/types';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { useAsync } from './useAsync';
import { useCleanupRegistry } from '@/lib/cleanupRegistry';

// Configuration optimisée pour les notifications
const NOTIFICATIONS_CONFIG = {
  staleTime: 1000 * 60 * 2, // 2 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
} as const;

// Cache pour les notifications
const notificationsCache = new Map<string, { data: ApplicationNotification[]; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 2; // 2 minutes

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
  const [success, setSuccess] = useState(false);
  
  // Refs
  const subscriptionRef = useRef<(() => void) | null>(null);
  const soundEnabledRef = useRef(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cleanup = useCleanupRegistry('useNotifications');

  // Audio context for notification sounds avec cleanup automatique
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Ajouter l'AudioContext avec cleanup automatique
      cleanup.addAudioContext(
        `notification-sound-${Date.now()}`,
        audioContextRef.current,
        'Notification sound AudioContext',
        'useNotifications'
      );
    }
    return audioContextRef.current;
  }, [cleanup]);

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

  // Fetch notifications avec AbortController et cache optimisé
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau AbortController avec cleanup automatique
    abortControllerRef.current = cleanup.createAbortController(
      `fetch-notifications-${Date.now()}`,
      'Notifications fetch AbortController',
      'useNotifications.fetchNotifications'
    );

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Vérifier le cache
      const cacheKey = JSON.stringify({ userId: user.id, filter });
      const cached = notificationsCache.get(cacheKey);
      
      let data: ApplicationNotification[] = [];
      
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        data = cached.data;
      } else {
        // Récupérer depuis l'API si pas de cache valide
        data = await notificationService.getNotifications(filter.limit);
        
        // Mettre en cache
        notificationsCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }
      
      // Apply filters - optimisé avec early returns
      let filteredData = data;
      
      if (filter.type || filter.priority || filter.read !== undefined || filter.dateFrom || filter.dateTo) {
        filteredData = data.filter(n => {
          if (filter.type && n.type !== filter.type) return false;
          if (filter.priority && n.priority !== filter.priority) return false;
          if (filter.read !== undefined && n.read !== filter.read) return false;
          if (filter.dateFrom && n.created_at < filter.dateFrom) return false;
          if (filter.dateTo && n.created_at > filter.dateTo) return false;
          return true;
        });
      }

      setNotifications(filteredData);
      
      // Update unread count - avec cache
      const countCacheKey = `unread-count-${user.id}`;
      const cachedCount = notificationsCache.get(countCacheKey);
      
      let count = 0;
      if (cachedCount && Date.now() - cachedCount.timestamp < CACHE_TTL) {
        count = cachedCount.data.length;
      } else {
        count = await notificationService.getUnreadCount();
        notificationsCache.set(countCacheKey, {
          data: new Array(count), // Placeholder
          timestamp: Date.now(),
        });
      }
      
      setUnreadCount(count);
      setSuccess(true);
    } catch (err: any) {
      // Ignorer les erreurs d'annulation
      if (err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Mark as read avec optimistic update
  const markAsRead = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Invalider le cache
      if (user) {
        const cacheKey = `unread-count-${user.id}`;
        notificationsCache.delete(cacheKey);
      }
      
      await notificationService.markAsRead(id);
      playNotificationSound('read');
    } catch (err) {
      // Rollback en cas d'erreur
      await fetchNotifications();
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage');
    }
  }, [playNotificationSound, user, fetchNotifications]);

  // Mark all as read avec optimistic update
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
      
      // Invalider le cache
      if (user) {
        const cacheKey = `unread-count-${user.id}`;
        notificationsCache.delete(cacheKey);
      }
      
      await notificationService.markAllAsRead();
      playNotificationSound('read');
    } catch (err) {
      // Rollback en cas d'erreur
      await fetchNotifications();
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage');
    }
  }, [playNotificationSound, user, fetchNotifications]);

  // Delete notification avec optimistic update
  const deleteNotification = useCallback(async (id: string) => {
    try {
      // Optimistic update
      const deleted = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      await notificationService.deleteNotification(id);
    } catch (err) {
      // Rollback en cas d'erreur
      await fetchNotifications();
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }, [notifications, fetchNotifications]);

  // Set filter avec invalidation du cache
  const setFilter = useCallback((newFilter: Partial<NotificationFilter>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }));
    
    // Invalider le cache quand les filtres changent
    if (user) {
      const cacheKey = JSON.stringify({ userId: user.id, filter: { ...filter, ...newFilter } });
      notificationsCache.delete(cacheKey);
    }
  }, [user, filter]);

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

  // Clear cache
  const clearCache = useCallback(() => {
    notificationsCache.clear();
  }, []);

  // Subscribe to real-time notifications avec cleanup automatique
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
    
    // Ajouter la subscription avec cleanup automatique
    cleanup.addSubscription(
      `notifications-subscription-${Date.now()}`,
      unsubscribe,
      'Real-time notifications subscription',
      'useNotifications'
    );
    
    setIsSubscribed(true);
  }, [user, isSubscribed, playNotificationSound, settings?.push_enabled, cleanup]);

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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [unsubscribe]);

  // Annuler les requêtes en cours
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
  }, []);

  // Play sound method for external use
  const playSound = useCallback((type: 'new' | 'read' = 'new') => {
    playNotificationSound(type);
  }, [playNotificationSound]);

  // Valeurs memoized pour éviter les recalculs inutiles
  const memoizedNotifications = useMemo(() => notifications, [notifications]);
  const memoizedUnreadCount = useMemo(() => unreadCount, [unreadCount]);
  const memoizedFilter = useMemo(() => filter, [filter]);
  const memoizedSettings = useMemo(() => settings, [settings]);

  return {
    notifications: memoizedNotifications,
    unreadCount: memoizedUnreadCount,
    loading,
    error,
    filter: memoizedFilter,
    settings: memoizedSettings,
    success,
    
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setFilter,
    updateSettings,
    playSound,
    cancel,
    clearCache,
    
    isSubscribed,
    subscribe,
    unsubscribe
  };
}