/**
 * Service SMS/WhatsApp centralisé
 * 
 * ARCHITECTURE SÉCURISÉE:
 * - Tous les appels SMS/WhatsApp passent par les Edge Functions Supabase
 * - La clé API Brevo n'est JAMAIS exposée côté client
 * - Seules les IP Supabase Edge Functions appellent Brevo
 * 
 * Usage:
 *   import { sendSms, sendWhatsApp } from '@/shared/services/sms';
 *   const result = await sendSms('+2250700000000', 'Votre code: 123456', 'OTP');
 */

import { supabase } from '@/integrations/supabase/client';

interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envoie un SMS via l'Edge Function send-sms-brevo
 * 
 * @param phone - Numéro au format E.164 (ex: +2250700000000)
 * @param message - Contenu du SMS (max 160 caractères)
 * @param tag - Label optionnel pour tracking (ex: "OTP", "NOTIF")
 */
export async function sendSms(
  phone: string, 
  message: string, 
  tag?: string
): Promise<SmsResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-sms-brevo', {
      body: { phone, message, tag },
    });

    if (error) {
      console.error('[sms.service] Edge function error:', error.message);
      return { success: false, error: error.message };
    }

    if (data?.status === 'ok') {
      return { success: true, messageId: data.brevoMessageId };
    }

    return { success: false, error: data?.reason || 'Erreur inconnue' };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur réseau';
    console.error('[sms.service] Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Envoie un message WhatsApp via l'Edge Function send-whatsapp-hybrid
 * 
 * @param phone - Numéro au format E.164 ou local (ex: +2250700000000 ou 0700000000)
 * @param message - Contenu du message
 */
export async function sendWhatsApp(
  phone: string, 
  message: string
): Promise<SmsResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-whatsapp-hybrid', {
      body: { phoneNumber: phone, message },
    });

    if (error) {
      console.error('[sms.service] WhatsApp edge function error:', error.message);
      return { success: false, error: error.message };
    }

    if (data?.success) {
      return { success: true, messageId: data.transactionId };
    }

    return { success: false, error: data?.error || 'Erreur WhatsApp inconnue' };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur réseau';
    console.error('[sms.service] WhatsApp exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Formate un numéro de téléphone au format E.164 pour la Côte d'Ivoire
 * 
 * @param phone - Numéro local ou international
 * @returns Numéro au format E.164 (+225XXXXXXXXXX)
 */
export function formatPhoneE164(phone: string): string {
  // Nettoyer le numéro
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Si déjà en format E.164
  if (cleaned.startsWith('+225')) {
    return cleaned;
  }
  
  // Si commence par 225 sans +
  if (cleaned.startsWith('225')) {
    return '+' + cleaned;
  }
  
  // Si commence par 0 (format local ivoirien)
  if (cleaned.startsWith('0')) {
    return '+225' + cleaned;
  }
  
  // Sinon, ajouter le préfixe ivoirien
  return '+225' + cleaned;
}
