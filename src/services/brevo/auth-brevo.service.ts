/**
 * Auth Brevo Service
 *
 * Service d'authentification utilisant le système OTP unifié de Brevo
 * Remplace les anciennes méthodes d'authentification
 */

import { supabase } from '@/services/supabase/client';
import { otpUnifiedService, type OTPRequest, type OTPVerification } from './otp-unified.service';

export interface SignUpData {
  email?: string;
  phone?: string;
  fullName: string;
  method: 'email' | 'phone';
}

export interface SignInData {
  recipient: string; // email ou phone
  method: 'email' | 'phone';
}

export interface AuthResult {
  success: boolean;
  error?: string;
  isNewUser?: boolean;
  needsName?: boolean;
  userId?: string;
  otpSent?: boolean;
}

class AuthBrevoService {
  /**
   * Inscription ou connexion unifiée par OTP
   */
  async initiateAuth(data: SignUpData | SignInData): Promise<AuthResult> {
    const { method } = data;

    // Déterminer le destinataire (email ou téléphone)
    const recipient =
      'email' in data && data.email
        ? data.email
        : 'phone' in data && data.phone
          ? data.phone
          : (data as SignInData).recipient;

    if (!recipient) {
      return {
        success: false,
        error: 'Email ou numéro de téléphone requis',
      };
    }

    // Vérifier le rate limiting
    const rateLimitCheck = await otpUnifiedService.checkRateLimit(recipient);
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: `Veuillez patienter ${rateLimitCheck.remainingTime} secondes avant de réessayer`,
      };
    }

    // Envoyer l'OTP
    const otpRequest: OTPRequest = {
      recipient,
      method: method === 'phone' ? 'whatsapp' : 'email', // Par défaut WhatsApp pour téléphone
      userName: 'fullName' in data ? data.fullName : undefined,
      purpose: 'auth',
      expiresIn: 10,
    };

    const otpResult = await otpUnifiedService.sendOTP(otpRequest);

    if (!otpResult.success) {
      return {
        success: false,
        error: otpResult.error || "Erreur lors de l'envoi du code de vérification",
      };
    }

    return {
      success: true,
      otpSent: true,
    };
  }

  /**
   * Vérifie l'OTP et crée la session utilisateur
   */
  async verifyOTP(
    recipient: string,
    code: string,
    method: 'email' | 'phone',
    fullName?: string
  ): Promise<AuthResult> {
    // Vérifier le code OTP
    const verification: OTPVerification = {
      recipient,
      code,
      method: method === 'phone' ? 'whatsapp' : 'email',
    };

    const verifyResult = await otpUnifiedService.verifyOTP(verification);

    if (!verifyResult.success) {
      return {
        success: false,
        error: verifyResult.error || 'Code invalide ou expiré',
      };
    }

    const { isNewUser } = verifyResult;

    // Si nouvel utilisateur et nom fourni, créer le compte
    if (isNewUser && fullName) {
      return await this.createNewUser(recipient, method, fullName);
    }

    // Si nouvel utilisateur sans nom, demander le nom
    if (isNewUser && !fullName) {
      return {
        success: true,
        isNewUser: true,
        needsName: true,
        error: 'Veuillez fournir votre nom pour créer votre compte',
      };
    }

    // Utilisateur existant -> créer la session
    return await this.createSession(recipient, method);
  }

  /**
   * Crée un nouvel utilisateur
   */
  private async createNewUser(
    recipient: string,
    method: 'email' | 'phone',
    fullName: string
  ): Promise<AuthResult> {
    try {
      // Générer un mot de passe aléatoire sécurisé
      const tempPassword = this.generateSecurePassword();

      // Déterminer si c'est un email ou téléphone
      const isEmail = method === 'email';

      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        ...(isEmail ? { email: recipient } : { phone: recipient }),
        password: tempPassword,
        options: {
          data: {
            full_name: fullName,
            user_type: null, // Sera défini plus tard
            signup_method: method,
          },
        },
      });

      if (authError) {
        console.error('Erreur création utilisateur:', authError);
        return {
          success: false,
          error: 'Erreur lors de la création du compte',
        };
      }

      // Créer le profil dans la table profiles
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          email: isEmail ? recipient : null,
          phone: !isEmail ? recipient : null,
          full_name: fullName,
          user_type: null,
          created_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error('Erreur création profil:', profileError);
          return {
            success: false,
            error: 'Erreur lors de la création du profil',
          };
        }
      }

      // Créer la session
      return await this.createSession(recipient, method);
    } catch (error) {
      console.error('Exception création utilisateur:', error);
      return {
        success: false,
        error: 'Erreur lors de la création du compte',
      };
    }
  }

  /**
   * Crée une session utilisateur
   */
  private async createSession(recipient: string, method: 'email' | 'phone'): Promise<AuthResult> {
    try {
      // Récupérer le profil utilisateur
      const isEmail = method === 'email';
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq(isEmail ? 'email' : 'phone', recipient)
        .single();

      if (profileError || !profile) {
        return {
          success: false,
          error: 'Profil utilisateur non trouvé',
        };
      }

      // Pour la connexion OTP, nous devons utiliser une méthode différente
      // car nous n'avons pas de mot de passe utilisateur

      // Utiliser le magic link ou créer un token manuellement
      const { data, error } = await supabase.auth.setSession({
        access_token: this.generateTemporaryToken(profile.id),
        refresh_token: this.generateTemporaryToken(profile.id, 'refresh'),
      });

      if (error) {
        console.error('Erreur création session:', error);
        return {
          success: false,
          error: 'Erreur lors de la connexion',
        };
      }

      return {
        success: true,
        userId: profile.id,
      };
    } catch (error) {
      console.error('Exception création session:', error);
      return {
        success: false,
        error: 'Erreur lors de la connexion',
      };
    }
  }

  /**
   * Met à jour le profil utilisateur avec le rôle
   */
  async updateProfileRole(
    userId: string,
    role: 'locataire' | 'proprietaire' | 'agence'
  ): Promise<AuthResult> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Erreur mise à jour rôle:', error);
        return {
          success: false,
          error: 'Erreur lors de la mise à jour du profil',
        };
      }

      return {
        success: true,
        userId,
      };
    } catch (error) {
      console.error('Exception mise à jour rôle:', error);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du profil',
      };
    }
  }

  /**
   * Déconnexion
   */
  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erreur déconnexion:', error);
        return {
          success: false,
          error: 'Erreur lors de la déconnexion',
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Exception déconnexion:', error);
      return {
        success: false,
        error: 'Erreur lors de la déconnexion',
      };
    }
  }

  /**
   * Génère un mot de passe sécurisé
   */
  private generateSecurePassword(): string {
    const length = 32;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }

  /**
   * Génère un token temporaire (à remplacer par une vraie implémentation JWT)
   * Note: Ceci est une simplification. En production, utilisez le vrai système Supabase
   */
  private generateTemporaryToken(userId: string, type: 'access' | 'refresh' = 'access'): string {
    const timestamp = Date.now();
    const payload = btoa(
      JSON.stringify({
        userId,
        type,
        exp: timestamp + (type === 'access' ? 3600 : 86400) * 1000, // 1h ou 24h
        iat: timestamp,
      })
    );

    return `tmp.${payload}.${timestamp}`;
  }
}

// Export du singleton
export const authBrevoService = new AuthBrevoService();
export default authBrevoService;
