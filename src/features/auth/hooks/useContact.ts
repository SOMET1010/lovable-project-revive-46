import { useState } from 'react';
import { supabase } from '@/services/supabase/client';
import { logger } from '@/shared/lib/logger';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

interface UseContactReturn {
  submitContact: (data: ContactFormData) => Promise<void>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | null;
  reset: () => void;
}

export function useContact(): UseContactReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitContact = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('contact_submissions')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject,
          message: data.message,
          status: 'nouveau',
          submitted_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi du message';
      setError(errorMessage);
      logger.error('Error submitting contact form', err as Error);
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
    submitContact,
    isSubmitting,
    isSubmitted,
    error,
    reset,
  };
}
