import { supabase } from '@/integrations/supabase/client';

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  property_id: string | null;
  subject: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  other_participant?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  property?: {
    id: string;
    title: string;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // Attachment fields
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
  attachment_size?: number | null;
  // Joined data
  sender?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface Attachment {
  url: string;
  type: 'image' | 'document';
  name: string;
  size: number;
}

class MessagingService {
  private isValidUuid(id: string | null | undefined) {
    return !!id && /^[0-9a-fA-F-]{36}$/.test(id);
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('user_conversations')
      .select(`*`)
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    // Fetch participant profiles and unread counts + properties
    const propertyIds = Array.from(
      new Set(
        (data ?? [])
          .map((c) => c.property_id as string | null)
          .filter((id): id is string => this.isValidUuid(id))
      )
    );

    const { data: propertiesData } = propertyIds.length
      ? await supabase
          .from('properties')
          .select('id, title')
          .in('id', propertyIds)
      : { data: [] as any };

    const propertiesMap = new Map((propertiesData ?? []).map((p: any) => [p.id, p]));

    const conversationsWithDetails = await Promise.all(
      (data ?? []).map(async (conv) => {
        const otherParticipantId = conv.participant_1_id === userId 
          ? conv.participant_2_id 
          : conv.participant_1_id;

        // Get other participant profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', otherParticipantId)
          .single();

        // Get unread count
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('receiver_id', userId)
          .eq('is_read', false);

        return {
          ...conv,
          other_participant: profile ?? { id: otherParticipantId, full_name: null, avatar_url: null },
          property: propertiesMap.get(conv.property_id) ?? null,
          unread_count: count ?? 0,
        } as Conversation;
      })
    );

    return conversationsWithDetails;
  }

  async getOrCreateConversation(
    userId: string,
    otherUserId: string,
    propertyId?: string | null,
    subject?: string | null
  ): Promise<Conversation | null> {
    const validPropertyId = this.isValidUuid(propertyId || '') ? propertyId : null;
    // First, try to find existing conversation
    // Build query based on whether propertyId exists
    let query = supabase
      .from('user_conversations')
      .select('*')
      .or(`and(participant_1_id.eq.${userId},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${userId})`);
    
    if (validPropertyId) {
      query = query.eq('property_id', validPropertyId);
    } else {
      query = query.is('property_id', null);
    }
    
    const { data: existing } = await query.maybeSingle();

    if (existing) {
      return existing as Conversation;
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from('user_conversations')
      .insert({
        participant_1_id: userId,
        participant_2_id: otherUserId,
        property_id: validPropertyId,
        subject: subject ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return newConv as Conversation;
  }

  async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    // Fetch sender profiles
    const messagesWithSenders = await Promise.all(
      (data ?? []).map(async (msg) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', msg.sender_id)
          .single();

        return {
          ...msg,
          sender: profile ?? { id: msg.sender_id, full_name: null, avatar_url: null },
        } as Message;
      })
    );

    return messagesWithSenders;
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    content: string,
    attachment?: Attachment | null
  ): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        is_read: false,
        attachment_url: attachment?.url ?? null,
        attachment_type: attachment?.type ?? null,
        attachment_name: attachment?.name ?? null,
        attachment_size: attachment?.size ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return data as Message;
  }

  async uploadAttachment(file: File, conversationId: string): Promise<Attachment | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${conversationId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('message-attachments')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading attachment:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(fileName);

    const type: 'image' | 'document' = file.type.startsWith('image/') ? 'image' : 'document';

    return {
      url: publicUrl,
      type,
      name: file.name,
      size: file.size,
    };
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .eq('is_read', false);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }

    return count ?? 0;
  }

  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const msg = payload.new as Message;
          // Fetch sender profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('user_id', msg.sender_id)
            .single();

          callback({
            ...msg,
            sender: profile ?? { id: msg.sender_id, full_name: null, avatar_url: null },
          });
        }
      )
      .subscribe();
  }

  subscribeToConversations(userId: string, callback: () => void) {
    return supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_conversations',
        },
        () => callback()
      )
      .subscribe();
  }
}

export const messagingService = new MessagingService();
