import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useCallback, useMemo } from 'react';
import { messageRepository } from '../api/repositories';
import type { Database } from '@/shared/lib/database.types';
import { useCleanupRegistry } from '@/lib/cleanupRegistry';

type MessageInsert = Database['public']['Tables']['messages']['Insert'];
type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];

// Configuration React Query optimisée pour les messages
const MESSAGES_QUERY_CONFIG = {
  staleTime: 1000 * 60 * 1, // 1 minute
  gcTime: 1000 * 60 * 10, // 10 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: 'always',
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  networkMode: 'online',
} as const;

export function useConversations(userId: string | undefined) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: () =>
      userId
        ? messageRepository.getConversationsByUserId(userId)
        : Promise.resolve({ data: [], error: null }),
    enabled: !!userId,
    ...MESSAGES_QUERY_CONFIG,
  });
}

export function useConversation(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () =>
      conversationId
        ? messageRepository.getConversationById(conversationId)
        : Promise.resolve({ data: null, error: null }),
    enabled: !!conversationId,
    ...MESSAGES_QUERY_CONFIG,
  });
}

export function useMessages(conversationId: string | undefined, options?: any) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () =>
      conversationId
        ? messageRepository.getMessagesByConversationId(conversationId)
        : Promise.resolve({ data: [], error: null }),
    enabled: !!conversationId,
    refetchInterval: (data, query) => {
      // Arrêter le refetch si la conversation n'est plus active
      return !!conversationId ? 5000 : false;
    },
    refetchIntervalInBackground: false, // Empêcher le refetch en arrière-plan
    ...MESSAGES_QUERY_CONFIG,
    ...options,
  });
}

// Hook optimisé avec pagination infinie pour les longs historiques
export function useInfiniteMessages(conversationId: string | undefined, options?: any) {
  return useInfiniteQuery({
    queryKey: ['messages', 'infinite', conversationId],
    queryFn: ({ pageParam = 1 }) =>
      conversationId
        ? messageRepository.getMessagesByConversationId(conversationId, { page: pageParam, limit: 50 })
        : Promise.resolve({ data: [], error: null }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data?.hasNext) return undefined;
      return (lastPage.data.currentPage || 0) + 1;
    },
    initialPageParam: 1,
    enabled: !!conversationId,
    ...MESSAGES_QUERY_CONFIG,
    ...options,
  });
}

export function useUnreadCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['messages', 'unread', userId],
    queryFn: () =>
      userId ? messageRepository.getUnreadCount(userId) : Promise.resolve({ data: 0, error: null }),
    enabled: !!userId,
    refetchInterval: (data, query) => {
      // Arrêter le refetch si l'utilisateur n'est plus connecté
      return !!userId ? 10000 : false;
    },
    refetchIntervalInBackground: false,
    ...MESSAGES_QUERY_CONFIG,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversation: ConversationInsert) => messageRepository.createConversation(conversation),
    onMutate: async (newConversation) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      
      const previousConversations = queryClient.getQueryData(['conversations']);
      
      queryClient.setQueryData(['conversations'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: [newConversation, ...old.data],
        };
      });

      return { previousConversations };
    },
    onError: (err, newConversation, context) => {
      queryClient.setQueryData(['conversations'], context?.previousConversations);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: MessageInsert) => messageRepository.sendMessage(message),
    onMutate: async (newMessage) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['messages', newMessage.conversation_id] });
      
      const previousMessages = queryClient.getQueryData(['messages', newMessage.conversation_id]);
      
      queryClient.setQueryData(['messages', newMessage.conversation_id], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: [...old.data, { ...newMessage, id: `temp-${Date.now()}` }],
        };
      });

      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      queryClient.setQueryData(['messages', newMessage.conversation_id], context?.previousMessages);
    },
    onSuccess: (data) => {
      if (data.data) {
        queryClient.setQueryData(['messages', data.data.conversation_id], (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((msg: any) => 
              msg.id.startsWith('temp-') ? data.data : msg
            ),
          };
        });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['messages', 'unread'] });
      }
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageIds: string[]) => messageRepository.markAsRead(messageIds),
    onMutate: async (messageIds) => {
      // Optimistic update pour toutes les conversations concernées
      await queryClient.cancelQueries({ queryKey: ['messages'] });
      
      const previousData = queryClient.getQueriesData({ queryKey: ['messages'] });
      
      messageIds.forEach(messageId => {
        queryClient.setQueriesData({ queryKey: ['messages'] }, (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((msg: any) =>
              msg.id === messageId 
                ? { ...msg, read: true, read_at: new Date().toISOString() }
                : msg
            ),
          };
        });
      });

      return { previousData };
    },
    onError: (err, messageIds, context) => {
      // Rollback
      context?.previousData?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread'] });
    },
  });
}

export function useRealtimeMessages(conversationId: string | undefined) {
  const queryClient = useQueryClient();
  const cleanup = useCleanupRegistry('useRealtimeMessages');

  useEffect(() => {
    if (!conversationId) return;

    let isActive = true;
    
    const subscription = messageRepository.subscribeToConversation(conversationId, (newMessage) => {
      if (!isActive) return;
      
      queryClient.setQueryData(['messages', conversationId], (old: any) => {
        if (!old) return { data: [newMessage], error: null };
        
        // Éviter les doublons
        const existingIds = new Set((old.data || []).map((msg: any) => msg.id));
        if (existingIds.has(newMessage.id)) return old;
        
        return { 
          ...old, 
          data: [...(old.data || []), newMessage] 
        };
      });
    });

    // Ajouter la subscription avec cleanup automatique
    cleanup.addSubscription(
      `realtime-messages-${conversationId}`,
      () => subscription.then((sub) => {
        try {
          sub.unsubscribe();
        } catch (error) {
          console.warn('Error unsubscribing from realtime messages:', error);
        }
      }),
      'Real-time messages subscription',
      'useRealtimeMessages'
    );

    return () => {
      isActive = false;
      // Le cleanup automatique s'occupera de la subscription
    };
  }, [conversationId, queryClient, cleanup]);
}

// Hook pour rechercher dans les messages avec debounce
export function useMessageSearch(conversationId: string | undefined, searchTerm: string) {
  return useQuery({
    queryKey: ['messages', 'search', conversationId, searchTerm],
    queryFn: () =>
      conversationId && searchTerm
        ? messageRepository.searchMessages(conversationId, searchTerm)
        : Promise.resolve({ data: [], error: null }),
    enabled: !!conversationId && searchTerm.length > 2,
    staleTime: 1000 * 30, // 30 secondes pour les résultats de recherche
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook pour compter les messages non lus par conversation
export function useUnreadCountByConversation(userId: string | undefined) {
  return useQuery({
    queryKey: ['conversations', 'unread-count', userId],
    queryFn: () =>
      userId ? messageRepository.getUnreadCountByConversation(userId) : Promise.resolve({ data: [], error: null }),
    enabled: !!userId,
    refetchInterval: 15000, // 15 secondes
    ...MESSAGES_QUERY_CONFIG,
  });
}
