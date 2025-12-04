import { useState, useEffect, useCallback } from 'react';
import { messagingService } from '../services/messaging.service';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';

export function useUnreadCount() {
  const { user } = useAuthStore();
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!user?.id) {
      setCount(0);
      return;
    }

    const unreadCount = await messagingService.getUnreadCount(user.id);
    setCount(unreadCount);
  }, [user?.id]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`unread:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchCount]);

  return { count, refetch: fetchCount };
}
