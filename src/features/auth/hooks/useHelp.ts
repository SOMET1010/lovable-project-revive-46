import { useState } from 'react';
import { supabase } from '@/services/supabase/client';
import { logger } from '@/shared/lib/logger';
import { useAuth } from '@/app/providers/AuthProvider';

interface HelpTicketData {
  subject: string;
  category: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
}

interface UseHelpReturn {
  submitHelpTicket: (data: HelpTicketData) => Promise<void>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | null;
  reset: () => void;
}

export function useHelp(): UseHelpReturn {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitHelpTicket = async (data: HelpTicketData) => {
    if (!user) {
      setError('Vous devez être connecté pour soumettre un ticket d\'aide');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('help_tickets')
        .insert({
          user_id: user.id,
          subject: data.subject,
          category: data.category,
          description: data.description,
          priority: data.priority || 'medium',
          status: 'ouvert',
          created_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du ticket';
      setError(errorMessage);
      logger.error('Error submitting help ticket', err as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setIsSubmitting(false);
    setIsSubmitted(false);
    setError(null);
  };

  return {
    submitHelpTicket,
    isSubmitting,
    isSubmitted,
    error,
    reset,
  };
}
