import { useState, useEffect, useCallback } from 'react';
import { messagingService, Message } from '../services/messaging.service';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';

export function useMessages(conversationId: string | null) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      const data = await messagingService.getMessages(conversationId);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Mark as read when viewing
  useEffect(() => {
    if (conversationId && user?.id) {
      messagingService.markAsRead(conversationId, user.id);
    }
  }, [conversationId, user?.id]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = messagingService.subscribeToMessages(conversationId, (newMessage) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      // Mark as read if we're the receiver
      if (user?.id && newMessage.receiver_id === user.id) {
        messagingService.markAsRead(conversationId, user.id);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id]);

  const sendMessage = useCallback(
    async (receiverId: string, content: string) => {
      if (!conversationId || !user?.id || !content.trim()) return null;

      setSending(true);
      try {
        const message = await messagingService.sendMessage(
          conversationId,
          user.id,
          receiverId,
          content.trim()
        );
        return message;
      } finally {
        setSending(false);
      }
    },
    [conversationId, user?.id]
  );

  return {
    messages,
    loading,
    sending,
    sendMessage,
    refetch: fetchMessages,
  };
}
