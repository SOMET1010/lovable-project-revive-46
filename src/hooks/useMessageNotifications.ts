/**
 * Hook pour les notifications de messages en temps réel
 * Avec cleanup functions robustes et monitoring des fuites de mémoire
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/services/supabase/client';
import { useCleanupRegistry } from '@/lib/cleanupRegistry';

export function useMessageNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const cleanup = useCleanupRegistry('useMessageNotifications');

  useEffect(() => {
    if (!user) return;

    // Créer un AbortController avec cleanup automatique
    const abortController = cleanup.createAbortController(
      `message-fetch-${user.id}`,
      'Message fetch AbortController',
      'useMessageNotifications'
    );

    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('is_read', false);

        if (error) throw error;
        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    const subscription = supabase
      .channel(`message_notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          fetchUnreadCount();

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Nouveau message', {
              body: 'Vous avez reçu un nouveau message',
              icon: '/favicon.ico'
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Ajouter la subscription avec cleanup automatique
    cleanup.addSubscription(
      `message-notifications-${user.id}`,
      () => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.warn('Error unsubscribing from message notifications:', error);
        }
      },
      'Message notifications real-time subscription',
      'useMessageNotifications'
    );

    // Cleanup function avec AbortController
    return () => {
      if (abortController.signal && !abortController.signal.aborted) {
        abortController.abort();
      }
    };
  }, [user, cleanup]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return { unreadCount, requestNotificationPermission };
}
