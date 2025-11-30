import { supabase } from '@/services/supabase/client';
import { logger } from '@/shared/lib/logger';

export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: 'nouveau' | 'en_cours' | 'resolu' | 'ferme';
  submitted_at?: string;
  resolved_at?: string;
}

export interface ContactServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

class ContactService {
  async submitContact(data: Omit<ContactSubmission, 'id' | 'submitted_at' | 'resolved_at'>): Promise<ContactServiceResponse<ContactSubmission>> {
    try {
      const { data: submission, error } = await supabase
        .from('contact_submissions')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject,
          message: data.message,
          status: data.status || 'nouveau',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Contact submission created successfully', { id: submission?.id });

      return { data: submission, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      logger.error('Error submitting contact form', error);
      return { data: null, error };
    }
  }

  async getContactSubmissions(filters?: {
    status?: string;
    limit?: number;
  }): Promise<ContactServiceResponse<ContactSubmission[]>> {
    try {
      let query = supabase
        .from('contact_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

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
      logger.error('Error fetching contact submissions', error);
      return { data: null, error };
    }
  }

  async updateContactStatus(
    id: string,
    status: 'nouveau' | 'en_cours' | 'resolu' | 'ferme'
  ): Promise<ContactServiceResponse<ContactSubmission>> {
    try {
      const updateData: any = { status };

      if (status === 'resolu' || status === 'ferme') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('contact_submissions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      logger.info('Contact submission status updated', { id, status });

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      logger.error('Error updating contact submission status', error);
      return { data: null, error };
    }
  }

  async sendEmail(to: string, subject: string, body: string): Promise<ContactServiceResponse<boolean>> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          html: body,
        },
      });

      if (error) throw error;

      logger.info('Email sent successfully', { to, subject });

      return { data: true, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      logger.error('Error sending email', error);
      return { data: null, error };
    }
  }
}

export const contactService = new ContactService();
