/**
 * Service de Scoring Centralisé - Mon Toit
 * Calcule le Global Trust Score basé sur 3 sous-scores pondérés
 */

import { supabase } from '@/integrations/supabase/client';

export interface ScoreBreakdown {
  profileScore: number;        // 0-100 (20% du total)
  verificationScore: number;   // 0-100 (40% du total)
  historyScore: number;        // 0-100 (40% du total)
  globalScore: number;         // 0-100 (moyenne pondérée)
  recommendation: 'approved' | 'conditional' | 'rejected';
  details: {
    profile: ProfileScoreDetails;
    verification: VerificationScoreDetails;
    history: HistoryScoreDetails;
  };
}

export interface ProfileScoreDetails {
  fullName: boolean;
  phone: boolean;
  city: boolean;
  bio: boolean;
  avatar: boolean;
  address: boolean;
  total: number;
}

export interface VerificationScoreDetails {
  oneci: boolean;
  cnam: boolean;
  facial: boolean;
  ansut: boolean;
  total: number;
}

export interface HistoryScoreDetails {
  paymentReliability: number;
  propertyCondition: number;
  leaseCompliance: number;
  total: number;
}

// Pondérations des sous-scores
const WEIGHTS = {
  profile: 0.20,      // 20%
  verification: 0.40, // 40%
  history: 0.40,      // 40%
};

// Points pour chaque élément du profil
const PROFILE_POINTS = {
  fullName: 15,
  phone: 15,
  city: 15,
  bio: 15,
  avatar: 20,
  address: 20,
};

// Points pour chaque vérification
const VERIFICATION_POINTS = {
  oneci: 30,
  cnam: 25,
  facial: 25,
  ansut: 20,
};

export const ScoringService = {
  /**
   * Calcule le score de profil (complétude)
   */
  calculateProfileScore(profile: any): { score: number; details: ProfileScoreDetails } {
    const details: ProfileScoreDetails = {
      fullName: !!profile?.full_name,
      phone: !!profile?.phone,
      city: !!profile?.city,
      bio: !!profile?.bio,
      avatar: !!profile?.avatar_url,
      address: !!profile?.address,
      total: 0,
    };

    let score = 0;
    if (details.fullName) score += PROFILE_POINTS.fullName;
    if (details.phone) score += PROFILE_POINTS.phone;
    if (details.city) score += PROFILE_POINTS.city;
    if (details.bio) score += PROFILE_POINTS.bio;
    if (details.avatar) score += PROFILE_POINTS.avatar;
    if (details.address) score += PROFILE_POINTS.address;

    details.total = score;
    return { score, details };
  },

  /**
   * Calcule le score de vérification
   */
  calculateVerificationScore(profile: any): { score: number; details: VerificationScoreDetails } {
    const details: VerificationScoreDetails = {
      oneci: !!profile?.oneci_verified,
      cnam: !!profile?.cnam_verified,
      facial: profile?.facial_verification_status === 'verified',
      ansut: !!profile?.is_verified,
      total: 0,
    };

    let score = 0;
    if (details.oneci) score += VERIFICATION_POINTS.oneci;
    if (details.cnam) score += VERIFICATION_POINTS.cnam;
    if (details.facial) score += VERIFICATION_POINTS.facial;
    if (details.ansut) score += VERIFICATION_POINTS.ansut;

    details.total = score;
    return { score, details };
  },

  /**
   * Calcule le score d'historique via l'edge function
   */
  async calculateHistoryScore(
    userId: string,
    propertyId?: string,
    monthlyRent?: number
  ): Promise<{ score: number; details: HistoryScoreDetails }> {
    try {
      const { data, error } = await supabase.functions.invoke('tenant-scoring', {
        body: {
          applicantId: userId,
          propertyId: propertyId || null,
          monthlyRent: monthlyRent || 0,
        },
      });

      if (error) {
        console.error('Error calling tenant-scoring:', error);
        return {
          score: 50, // Score par défaut pour nouveaux utilisateurs
          details: {
            paymentReliability: 50,
            propertyCondition: 50,
            leaseCompliance: 50,
            total: 50,
          },
        };
      }

      const breakdown = data?.breakdown || {};
      const details: HistoryScoreDetails = {
        paymentReliability: breakdown.payment_history || 50,
        propertyCondition: breakdown.documents || 50,
        leaseCompliance: breakdown.profile_completeness || 50,
        total: data?.score || 50,
      };

      return { score: data?.score || 50, details };
    } catch (err) {
      console.error('Error in calculateHistoryScore:', err);
      return {
        score: 50,
        details: {
          paymentReliability: 50,
          propertyCondition: 50,
          leaseCompliance: 50,
          total: 50,
        },
      };
    }
  },

  /**
   * Calcule le Global Trust Score complet
   */
  async calculateGlobalTrustScore(
    userId: string,
    propertyId?: string,
    monthlyRent?: number
  ): Promise<ScoreBreakdown> {
    // Récupérer le profil utilisateur
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Calculer les 3 sous-scores
    const profileResult = this.calculateProfileScore(profile);
    const verificationResult = this.calculateVerificationScore(profile);
    const historyResult = await this.calculateHistoryScore(userId, propertyId, monthlyRent);

    // Calculer le score global pondéré
    const globalScore = Math.round(
      profileResult.score * WEIGHTS.profile +
      verificationResult.score * WEIGHTS.verification +
      historyResult.score * WEIGHTS.history
    );

    // Déterminer la recommandation
    let recommendation: 'approved' | 'conditional' | 'rejected';
    if (globalScore >= 70) {
      recommendation = 'approved';
    } else if (globalScore >= 50) {
      recommendation = 'conditional';
    } else {
      recommendation = 'rejected';
    }

    return {
      profileScore: profileResult.score,
      verificationScore: verificationResult.score,
      historyScore: historyResult.score,
      globalScore,
      recommendation,
      details: {
        profile: profileResult.details,
        verification: verificationResult.details,
        history: historyResult.details,
      },
    };
  },

  /**
   * Calcule un score simple pour les candidatures (sans appel async)
   */
  calculateSimpleScore(profile: any): number {
    const profileResult = this.calculateProfileScore(profile);
    const verificationResult = this.calculateVerificationScore(profile);
    
    // Score simplifié sans l'historique (pour les nouvelles candidatures)
    const baseHistoryScore = 50; // Score par défaut
    
    return Math.round(
      profileResult.score * WEIGHTS.profile +
      verificationResult.score * WEIGHTS.verification +
      baseHistoryScore * WEIGHTS.history
    );
  },

  /**
   * Obtient le libellé de la recommandation en français
   */
  getRecommendationLabel(recommendation: 'approved' | 'conditional' | 'rejected'): string {
    switch (recommendation) {
      case 'approved':
        return 'Approuvé';
      case 'conditional':
        return 'Sous conditions';
      case 'rejected':
        return 'Non recommandé';
    }
  },

  /**
   * Obtient la couleur de la recommandation
   */
  getRecommendationColor(recommendation: 'approved' | 'conditional' | 'rejected'): string {
    switch (recommendation) {
      case 'approved':
        return 'text-green-600';
      case 'conditional':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
    }
  },
};

export default ScoringService;
