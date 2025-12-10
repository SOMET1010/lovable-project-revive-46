/**
 * Service de Scoring Centralisé - Mon Toit (CDC v3)
 * Score de complétude détaillé : Profession 30pts, Finances 25pts, Garant 20pts, Historique 15pts, Personnel 10pts
 */

import { supabase } from '@/integrations/supabase/client';

// ============ TYPES ============

export interface ScoreBreakdown {
  profileScore: number;
  verificationScore: number;
  historyScore: number;
  globalScore: number;
  recommendation: 'approved' | 'conditional' | 'rejected';
  details: {
    profile: ProfileScoreDetails;
    verification: VerificationScoreDetails;
    history: HistoryScoreDetails;
  };
}

export interface ProfileScoreDetails {
  occupation: boolean;
  employer: boolean;
  employmentType: boolean;
  monthlyIncome: boolean;
  hasDocuments: boolean;
  hasGuarantor: boolean;
  hasRentalHistory: boolean;
  fullName: boolean;
  phone: boolean;
  avatar: boolean;
  city: boolean;
  total: number;
}

export interface VerificationScoreDetails {
  facial: boolean;
  montoit: boolean;
  total: number;
}

export interface HistoryScoreDetails {
  paymentReliability: number;
  propertyCondition: number;
  leaseCompliance: number;
  total: number;
}

// ============ WEIGHTS CDC v3 ============

const WEIGHTS = {
  profile: 0.20,
  verification: 0.40,
  history: 0.40,
};

const PROFILE_POINTS = {
  occupation: 10,
  employer: 10,
  employmentType: 10,
  monthlyIncome: 15,
  hasDocuments: 10,
  hasGuarantor: 20,
  hasRentalHistory: 15,
  fullName: 3,
  phone: 3,
  avatar: 2,
  city: 2,
};

const VERIFICATION_POINTS = {
  facial: 60,
  montoit: 40,
};

// ============ SERVICE ============

export const ScoringService = {
  async calculateProfileScore(
    profile: Record<string, unknown> | null,
    userId?: string
  ): Promise<{ score: number; details: ProfileScoreDetails }> {
    let hasGuarantor = false;
    let hasDocuments = false;
    let hasRentalHistory = false;

    if (userId) {
      try {
        const [guarantorResult, documentsResult, historyResult] = await Promise.all([
          supabase.from('guarantors').select('id').eq('tenant_id', userId).limit(1),
          supabase.from('user_documents').select('id').eq('user_id', userId).limit(1),
          supabase.from('rental_history').select('id').eq('tenant_id', userId).limit(1),
        ]);
        hasGuarantor = (guarantorResult.data?.length ?? 0) > 0;
        hasDocuments = (documentsResult.data?.length ?? 0) > 0;
        hasRentalHistory = (historyResult.data?.length ?? 0) > 0;
      } catch (err) {
        console.error('Error checking user data:', err);
      }
    }

    const p = profile || {};
    const details: ProfileScoreDetails = {
      occupation: !!p['occupation'],
      employer: !!p['employer'],
      employmentType: !!p['employment_type'],
      monthlyIncome: typeof p['monthly_income'] === 'number' && (p['monthly_income'] as number) > 0,
      hasDocuments,
      hasGuarantor,
      hasRentalHistory,
      fullName: !!p['full_name'],
      phone: !!p['phone'],
      avatar: !!p['avatar_url'],
      city: !!p['city'],
      total: 0,
    };

    let score = 0;
    if (details.occupation) score += PROFILE_POINTS.occupation;
    if (details.employer) score += PROFILE_POINTS.employer;
    if (details.employmentType) score += PROFILE_POINTS.employmentType;
    if (details.monthlyIncome) score += PROFILE_POINTS.monthlyIncome;
    if (details.hasDocuments) score += PROFILE_POINTS.hasDocuments;
    if (details.hasGuarantor) score += PROFILE_POINTS.hasGuarantor;
    if (details.hasRentalHistory) score += PROFILE_POINTS.hasRentalHistory;
    if (details.fullName) score += PROFILE_POINTS.fullName;
    if (details.phone) score += PROFILE_POINTS.phone;
    if (details.avatar) score += PROFILE_POINTS.avatar;
    if (details.city) score += PROFILE_POINTS.city;

    details.total = score;
    return { score, details };
  },

  calculateVerificationScore(profile: Record<string, unknown> | null): { score: number; details: VerificationScoreDetails } {
    const p = profile || {};
    const details: VerificationScoreDetails = {
      facial: p['facial_verification_status'] === 'verified',
      montoit: !!p['is_verified'],
      total: 0,
    };

    let score = 0;
    if (details.facial) score += VERIFICATION_POINTS.facial;
    if (details.montoit) score += VERIFICATION_POINTS.montoit;

    details.total = score;
    return { score, details };
  },

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
        return {
          score: 50,
          details: { paymentReliability: 50, propertyCondition: 50, leaseCompliance: 50, total: 50 },
        };
      }

      const breakdown = data?.breakdown || {};
      return {
        score: data?.score || 50,
        details: {
          paymentReliability: breakdown.payment_history || 50,
          propertyCondition: breakdown.documents || 50,
          leaseCompliance: breakdown.profile_completeness || 50,
          total: data?.score || 50,
        },
      };
    } catch {
      return {
        score: 50,
        details: { paymentReliability: 50, propertyCondition: 50, leaseCompliance: 50, total: 50 },
      };
    }
  },

  async calculateGlobalTrustScore(
    userId: string,
    propertyId?: string,
    monthlyRent?: number
  ): Promise<ScoreBreakdown> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const profileResult = await this.calculateProfileScore(profile, userId);
    const verificationResult = this.calculateVerificationScore(profile);
    const historyResult = await this.calculateHistoryScore(userId, propertyId, monthlyRent);

    const globalScore = Math.round(
      profileResult.score * WEIGHTS.profile +
      verificationResult.score * WEIGHTS.verification +
      historyResult.score * WEIGHTS.history
    );

    let recommendation: 'approved' | 'conditional' | 'rejected';
    if (globalScore >= 70) recommendation = 'approved';
    else if (globalScore >= 50) recommendation = 'conditional';
    else recommendation = 'rejected';

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

  calculateSimpleScore(profile: Record<string, unknown> | null): number {
    const p = profile || {};
    const verificationResult = this.calculateVerificationScore(p);
    
    let profileScore = 0;
    if (p['full_name']) profileScore += PROFILE_POINTS.fullName;
    if (p['phone']) profileScore += PROFILE_POINTS.phone;
    if (p['avatar_url']) profileScore += PROFILE_POINTS.avatar;
    if (p['city']) profileScore += PROFILE_POINTS.city;
    if (p['occupation']) profileScore += PROFILE_POINTS.occupation;
    if (p['employer']) profileScore += PROFILE_POINTS.employer;
    if (p['employment_type']) profileScore += PROFILE_POINTS.employmentType;
    if (typeof p['monthly_income'] === 'number' && (p['monthly_income'] as number) > 0) {
      profileScore += PROFILE_POINTS.monthlyIncome;
    }
    
    const baseHistoryScore = 50;
    
    return Math.round(
      profileScore * WEIGHTS.profile +
      verificationResult.score * WEIGHTS.verification +
      baseHistoryScore * WEIGHTS.history
    );
  },

  getProfileCompletionPercentage(profile: Record<string, unknown> | null): number {
    const p = profile || {};
    let completed = 0;
    const total = 10;

    if (p['full_name']) completed++;
    if (p['phone']) completed++;
    if (p['city']) completed++;
    if (p['avatar_url']) completed++;
    if (p['occupation']) completed++;
    if (p['employer']) completed++;
    if (p['employment_type']) completed++;
    if (typeof p['monthly_income'] === 'number' && (p['monthly_income'] as number) > 0) completed++;
    if (p['bio']) completed++;
    if (p['date_of_birth']) completed++;

    return Math.round((completed / total) * 100);
  },

  getRecommendationLabel(recommendation: 'approved' | 'conditional' | 'rejected'): string {
    switch (recommendation) {
      case 'approved': return 'Approuvé';
      case 'conditional': return 'Sous conditions';
      case 'rejected': return 'Non recommandé';
    }
  },

  getRecommendationColor(recommendation: 'approved' | 'conditional' | 'rejected'): string {
    switch (recommendation) {
      case 'approved': return 'text-green-600';
      case 'conditional': return 'text-yellow-600';
      case 'rejected': return 'text-red-600';
    }
  },
};

export default ScoringService;
