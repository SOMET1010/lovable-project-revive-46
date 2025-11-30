import { supabase } from '@/services/supabase/client';
import { logger } from '@/shared/lib/logger';

export interface HelpTicket {
  id?: string;
  user_id: string;
  subject: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'ouvert' | 'en_cours' | 'resolu' | 'ferme';
  created_at?: string;
  updated_at?: string;
  resolved_at?: string;
  assigned_to?: string;
}

export interface HelpTicketResponse {
  id: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface HelpServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

class HelpService {
  async createTicket(data: Omit<HelpTicket, 'id' | 'created_at' | 'updated_at' | 'resolved_at'>): Promise<HelpServiceResponse<HelpTicket>> {
    try {
      const { data: ticket, error } = await supabase
        .from('help_tickets')
        .insert({
          user_id: data.user_id,
          subject: data.subject,
          category: data.category,
          description: data.description,
          priority: data.priority || 'medium',
          status: data.status || 'ouvert',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Help ticket created successfully', { id: ticket?.id });

      return { data: ticket, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      logger.error('Error creating help ticket', error);
      return { data: null, error };
    }
  }

  async getUserTickets(userId: string, filters?: {
    status?: string;
    limit?: number;
  }): Promise<HelpServiceResponse<HelpTicket[]>> {
    try {
      let query = supabase
        .from('help_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      logger.error('Error fetching user tickets', error);
      return { data: null, error };
    }
  }

  async getAllTickets(filters?: {
    status?: string;
    priority?: string;
    category?: string;
    limit?: number;
  }): Promise<HelpServiceResponse<HelpTicket[]>> {
    try {
      let query = supabase
        .from('help_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      logger.error('Error fetching all tickets', error);
      return { data: null, error };
    }
  }

  async getTicketById(id: string): Promise<HelpServiceResponse<HelpTicket>> {
    try {
      const { data, error } = await supabase
        .from('help_tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      logger.error('Error fetching ticket', error);
      return { data: null, error };
    }
  }

  async updateTicketStatus(
    id: string,
    status: 'ouvert' | 'en_cours' | 'resolu' | 'ferme'
  ): Promise<HelpServiceResponse<HelpTicket>> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'resolu' || status === 'ferme') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('help_tickets')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      logger.info('Ticket status updated', { id, status });

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      logger.error('Error updating ticket status', error);
      return { data: null, error };
    }
  }

  async addTicketResponse(
    ticketId: string,
    userId: string,
    content: string
  ): Promise<HelpServiceResponse<HelpTicketResponse>> {
    try {
      const { data, error } = await supabase
        .from('help_ticket_responses')
        .insert({
          ticket_id: ticketId,
          content,
          created_by: userId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('help_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      logger.info('Ticket response added', { ticketId });

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      logger.error('Error adding ticket response', error);
      return { data: null, error };
    }
  }

  async getTicketResponses(ticketId: string): Promise<HelpServiceResponse<HelpTicketResponse[]>> {
    try {
      const { data, error } = await supabase
        .from('help_ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      logger.error('Error fetching ticket responses', error);
      return { data: null, error };
    }
  }

  async assignTicket(ticketId: string, assignedTo: string): Promise<HelpServiceResponse<HelpTicket>> {
    try {
      const { data, error } = await supabase
        .from('help_tickets')
        .update({
          assigned_to: assignedTo,
          status: 'en_cours',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;

      logger.info('Ticket assigned', { ticketId, assignedTo });

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      logger.error('Error assigning ticket', error);
      return { data: null, error };
    }
  }
}

export const helpService = new HelpService();
