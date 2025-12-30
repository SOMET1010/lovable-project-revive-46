/**
 * OTP Unified Service - Brevo Integration
 *
 * Service unifié pour la gestion des codes OTP via Brevo
 * Supporte Email, SMS et WhatsApp pour l'authentification
 */

import { supabase } from '@/services/supabase/client';

export interface OTPRequest {
  recipient: string; // Email ou numéro de téléphone
  method: 'email' | 'sms' | 'whatsapp';
  userName?: string;
  purpose?: 'auth' | 'verification' | 'reset'; // Usage de l'OTP
  expiresIn?: number; // En minutes (défaut: 10)
}

export interface OTPVerification {
  recipient: string;
  code: string;
  method: 'email' | 'sms' | 'whatsapp';
}

export interface OTPResult {
  success: boolean;
  error?: string;
  otp?: string; // Uniquement en dev
  messageId?: string;
}

export interface OTPVerificationResult {
  success: boolean;
  error?: string;
  isNewUser?: boolean;
  userId?: string;
}

class OTPUnifiedService {
  private readonly DEFAULT_EXPIRY = 10; // minutes

  /**
   * Génère un code OTP sécurisé
   */
  private generateOTP(): string {
    // Utiliser crypto.getRandomValues pour une meilleure sécurité
    const array = new Uint8Array(6);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => (byte % 10).toString()).join('');
  }

  /**
   * Détermine si le recipient est un email ou un numéro de téléphone
   */
  private detectRecipientType(recipient: string): 'email' | 'phone' {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(recipient) ? 'email' : 'phone';
  }

  /**
   * Formate le numéro pour Brevo
   */
  private formatPhoneNumber(phone: string): string {
    // Nettoyer le numéro
    let formatted = phone.replace(/[^\d+]/g, '');

    // Ajouter l'indicatif si absent
    if (formatted.startsWith('07') || formatted.startsWith('05')) {
      formatted = '+225' + formatted;
    }

    // Assurer le format E.164
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }

    return formatted;
  }

  /**
   * Stocke l'OTP en base de données pour vérification ultérieure
   */
  private async storeOTP(
    recipient: string,
    code: string,
    method: string,
    expiresIn: number,
    purpose: string = 'auth'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);

      const { error } = await supabase.from('otp_codes').insert({
        recipient,
        code,
        method,
        purpose,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Erreur stockage OTP:', error);
        return { success: false, error: 'Erreur lors de la sauvegarde du code' };
      }

      return { success: true };
    } catch (error) {
      console.error('Exception stockage OTP:', error);
      return { success: false, error: 'Erreur interne' };
    }
  }

  /**
   * Envoie un OTP par email via Brevo
   */
  private async sendEmailOTP(
    recipient: string,
    otp: string,
    userName?: string
  ): Promise<OTPResult> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email-brevo', {
        body: {
          type: 'otp',
          to: recipient,
          otp,
          toName: userName,
        },
      });

      if (error) {
        console.error('Erreur envoi OTP email:', error);
        return {
          success: false,
          error: error.message || "Erreur lors de l'envoi de l'email",
        };
      }

      return {
        success: data?.status === 'ok',
        error: data?.status === 'error' ? data?.reason : undefined,
        messageId: data?.brevoMessageId,
      };
    } catch (error) {
      console.error('Exception envoi OTP email:', error);
      return {
        success: false,
        error: "Erreur lors de l'envoi de l'email",
      };
    }
  }

  /**
   * Envoie un OTP par SMS via Azure MTN
   */
  private async sendSMSOTP(recipient: string, otp: string): Promise<OTPResult> {
    try {
      const message = `MonToit: Votre code de verification est ${otp}. Valide 10min. Ne partagez jamais ce code.`;

      const { data, error } = await supabase.functions.invoke('send-sms-azure', {
        body: {
          phone: this.formatPhoneNumber(recipient),
          message,
          tag: 'AUTH_OTP',
        },
      });

      if (error) {
        console.error('Erreur envoi OTP SMS:', error);
        return {
          success: false,
          error: error.message || "Erreur lors de l'envoi du SMS",
        };
      }

      return {
        success: data?.status === 'ok',
        error: data?.status === 'error' ? data?.reason : undefined,
        messageId: data?.messageId,
      };
    } catch (error) {
      console.error('Exception envoi OTP SMS:', error);
      return {
        success: false,
        error: "Erreur lors de l'envoi du SMS",
      };
    }
  }

  /**
   * Envoie un OTP par WhatsApp (via SMS Azure MTN)
   */
  private async sendWhatsAppOTP(recipient: string, otp: string): Promise<OTPResult> {
    try {
      // Message optimisé pour WhatsApp
      const message = `MonToit: Votre code de verification est ${otp}. Valide 10min. Ne partagez jamais ce code.`;

      const { data, error } = await supabase.functions.invoke('send-sms-azure', {
        body: {
          phone: this.formatPhoneNumber(recipient),
          message,
          tag: 'WHATSAPP_OTP',
        },
      });

      if (error) {
        console.error('Erreur envoi OTP WhatsApp:', error);
        return {
          success: false,
          error: error.message || "Erreur lors de l'envoi WhatsApp",
        };
      }

      return {
        success: data?.status === 'ok',
        error: data?.status === 'error' ? data?.reason : undefined,
        messageId: data?.messageId,
      };
    } catch (error) {
      console.error('Exception envoi OTP WhatsApp:', error);
      return {
        success: false,
        error: "Erreur lors de l'envoi WhatsApp",
      };
    }
  }

  /**
   * Envoie un code OTP
   */
  async sendOTP(request: OTPRequest): Promise<OTPResult> {
    const {
      recipient,
      method,
      userName,
      purpose = 'auth',
      expiresIn = this.DEFAULT_EXPIRY,
    } = request;

    // Validation de base
    if (!recipient || !method) {
      return {
        success: false,
        error: 'Destinataire et méthode requis',
      };
    }

    // Valider la cohérence email/méthode
    const recipientType = this.detectRecipientType(recipient);
    if (method === 'email' && recipientType !== 'email') {
      return {
        success: false,
        error: 'Méthode email incompatible avec le destinataire',
      };
    }

    if ((method === 'sms' || method === 'whatsapp') && recipientType !== 'phone') {
      return {
        success: false,
        error: 'Méthode SMS/WhatsApp incompatible avec le destinataire',
      };
    }

    // Générer l'OTP
    const otp = this.generateOTP();

    // Stocker l'OTP
    const storageResult = await this.storeOTP(recipient, otp, method, expiresIn, purpose);
    if (!storageResult.success) {
      return {
        success: false,
        error: storageResult.error,
      };
    }

    // Envoyer selon la méthode
    let sendResult: OTPResult;

    switch (method) {
      case 'email':
        sendResult = await this.sendEmailOTP(recipient, otp, userName);
        break;
      case 'sms':
        sendResult = await this.sendSMSOTP(recipient, otp);
        break;
      case 'whatsapp':
        sendResult = await this.sendWhatsAppOTP(recipient, otp);
        break;
      default:
        return {
          success: false,
          error: 'Méthode non supportée',
        };
    }

    // En développement, inclure l'OTP pour faciliter les tests
    const isDev = import.meta.env.DEV;
    if (sendResult.success && isDev) {
      sendResult.otp = otp;
    }

    return sendResult;
  }

  /**
   * Vérifie un code OTP
   */
  async verifyOTP(verification: OTPVerification): Promise<OTPVerificationResult> {
    const { recipient, code, method } = verification;

    try {
      // Récupérer l'OTP valide le plus récent
      const { data: otpData, error: fetchError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('recipient', recipient)
        .eq('method', method)
        .eq('code', code)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        console.error('Erreur vérification OTP:', fetchError);
        return {
          success: false,
          error: 'Code invalide ou expiré',
        };
      }

      if (!otpData) {
        return {
          success: false,
          error: 'Code invalide ou expiré',
        };
      }

      // Marquer l'OTP comme utilisé
      await supabase
        .from('otp_codes')
        .update({
          used: true,
          used_at: new Date().toISOString(),
        })
        .eq('id', otpData.id);

      // Vérifier si l'utilisateur existe déjà
      const isEmail = this.detectRecipientType(recipient) === 'email';
      let userExists = false;
      let userId: string | undefined;

      if (isEmail) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', recipient)
          .maybeSingle();
        userExists = !!profile;
        userId = profile?.id;
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone', recipient)
          .maybeSingle();
        userExists = !!profile;
        userId = profile?.id;
      }

      return {
        success: true,
        isNewUser: !userExists,
        userId,
      };
    } catch (error) {
      console.error('Exception vérification OTP:', error);
      return {
        success: false,
        error: 'Erreur lors de la vérification',
      };
    }
  }

  /**
   * Vérifie le rate limiting pour un destinataire
   */
  async checkRateLimit(
    recipient: string,
    action: string = 'otp-send',
    windowMinutes: number = 5,
    maxAttempts: number = 3
  ): Promise<{ allowed: boolean; remainingTime?: number }> {
    try {
      const cutoffTime = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('otp_codes')
        .select('created_at')
        .eq('recipient', recipient)
        .gte('created_at', cutoffTime)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur rate limit check:', error);
        return { allowed: true }; // En cas d'erreur, autoriser
      }

      if (!data || data.length < maxAttempts) {
        return { allowed: true };
      }

      const lastAttempt = new Date(data[0].created_at);
      const remainingTime = Math.ceil(
        (lastAttempt.getTime() + windowMinutes * 60 * 1000 - Date.now()) / 1000
      );

      return { allowed: false, remainingTime: Math.max(0, remainingTime) };
    } catch (error) {
      console.error('Exception rate limit check:', error);
      return { allowed: true };
    }
  }
}

// Export du singleton
export const otpUnifiedService = new OTPUnifiedService();
export default otpUnifiedService;
