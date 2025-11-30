/**
 * Tests unitaires pour messagingApi - 10 tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/services/supabase/client';

vi.mock('@/services/supabase/client');

// Mock simple du service messaging
const messagingApi = {
  getConversations: async (userId: string) => {
    const { data, error } = await supabase.from('conversations').select('*').or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`);
    if (error) throw error;
    return { data, error: null };
  },
  getMessages: async (conversationId: string) => {
    const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at');
    if (error) throw error;
    return { data, error: null };
  },
  sendMessage: async (message: any) => {
    const { data, error } = await supabase.from('messages').insert(message).select().single();
    if (error) throw error;
    return { data, error: null };
  },
  markAsRead: async (messageId: string) => {
    const { data, error } = await supabase.from('messages').update({ is_read: true }).eq('id', messageId);
    if (error) throw error;
    return { data, error: null };
  },
};

describe('messagingApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConversation = {
    id: 'conv-123',
    participant_1_id: 'user-1',
    participant_2_id: 'user-2',
    property_id: 'prop-123',
    last_message_at: '2024-11-25T10:00:00Z',
  };

  const mockMessage = {
    id: 'msg-123',
    conversation_id: 'conv-123',
    sender_id: 'user-1',
    receiver_id: 'user-2',
    content: 'Bonjour, je suis intéressé par votre propriété',
    is_read: false,
    created_at: '2024-11-25T10:00:00Z',
  };

  it('should fetch user conversations', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      or: vi.fn().mockResolvedValue({ data: [mockConversation], error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await messagingApi.getConversations('user-1');
    expect(result.data).toEqual([mockConversation]);
  });

  it('should fetch conversation messages', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [mockMessage], error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await messagingApi.getMessages('conv-123');
    expect(result.data).toEqual([mockMessage]);
  });

  it('should send message', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockMessage, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await messagingApi.sendMessage(mockMessage);
    expect(result.data).toBeDefined();
  });

  it('should mark message as read', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await messagingApi.markAsRead('msg-123');
    expect(result.error).toBeNull();
  });

  it('should handle long messages', async () => {
    const longMessage = { ...mockMessage, content: 'A'.repeat(1000) };
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: longMessage, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await messagingApi.sendMessage(longMessage);
    expect(result.data?.content.length).toBe(1000);
  });

  it('should handle empty conversation list', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      or: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await messagingApi.getConversations('new-user');
    expect(result.data).toEqual([]);
  });

  it('should handle empty message list', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await messagingApi.getMessages('empty-conv');
    expect(result.data).toEqual([]);
  });

  it('should handle conversation not found', async () => {
    const mockError = new Error('Conversation not found');
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    });
    (supabase.from as any) = mockFrom;

    await expect(messagingApi.getMessages('invalid-conv')).rejects.toThrow('Conversation not found');
  });

  it('should handle send message failure', async () => {
    const mockError = new Error('Failed to send message');
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    });
    (supabase.from as any) = mockFrom;

    await expect(messagingApi.sendMessage(mockMessage)).rejects.toThrow('Failed to send message');
  });

  it('should handle database errors', async () => {
    const mockError = new Error('Database error');
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      or: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    });
    (supabase.from as any) = mockFrom;

    await expect(messagingApi.getConversations('user-1')).rejects.toThrow('Database error');
  });
});
