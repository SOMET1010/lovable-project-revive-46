import { supabase } from '@/services/supabase/client';
import { azureAIService } from './azureAIService';
import type {
  Property,
  PropertyType,
  PropertyFilters,
  PropertyRecommendation,
  RecommendationReason,
  RecommendationFactor,
  RecommendationAlgorithm,
  RecommendationMetadata,
  ActivityData,
  ActivityType,
  UserPreferences,
  MarketTrend,
  SeasonalFactor
} from '@/types/monToit.types';

/**
 * Interface pour les scores de recommandation de propriété
 */
interface RecommendationScore {
  propertyId: string;
  score: number;
  reason: RecommendationReason;
  algorithm: RecommendationAlgorithm;
  confidence: number;
  factors: RecommendationFactor[];
}

/**
 * Interface pour les données de propriété enrichies
 */
interface EnrichedProperty extends Property {
  score?: number;
  recommendationReasons?: string[];
  features: PropertyFeature[];
  location: {
    city: string;
    neighborhood?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  marketData?: {
    averageRent: number;
    demandScore: number;
    trend: 'rising' | 'falling' | 'stable';
  };
}

/**
 * Interface pour les critères de recherche utilisateur
 */
interface UserSearchCriteria {
  propertyTypes: PropertyType[];
  cities: string[];
  priceRange: {
    min: number;
    max: number;
  };
  bedrooms?: number;
  features?: PropertyFeature[];
  preferences: UserPreferences;
}

/**
 * Types de caractéristiques de propriété
 */
type PropertyFeature = 
  | 'parking'
  | 'air_conditioning'
  | 'furnished'
  | 'balcony'
  | 'terrace'
  | 'garden'
  | 'elevator'
  | 'security'
  | 'pool'
  | 'gym';

/**
 * Service de recommandation de propriétés avec typage strict
 * Remplace les types 'any' par des interfaces TypeScript spécifiques
 */
export class RecommendationService {
  /**
   * Suit l'activité d'un utilisateur pour améliorer les recommandations
   * @param userId - ID de l'utilisateur
   * @param propertyId - ID de la propriété (optionnel)
   * @param actionType - Type d'action effectuée
   * @param actionData - Données supplémentaires de l'action
   * @param sessionId - ID de session (optionnel)
   */
  static async trackUserActivity(
    userId: string,
    propertyId: string | null,
    actionType: ActivityType,
    actionData: Record<string, unknown> = {},
    sessionId?: string
  ): Promise<void> {
    try {
      // Validation des paramètres
      if (!userId || typeof userId !== 'string') {
        console.error('ID utilisateur invalide pour le suivi d\'activité:', userId);
        return;
      }

      if (!actionType || typeof actionType !== 'string') {
        console.error('Type d\'action invalide pour le suivi:', actionType);
        return;
      }

      // Enrichir les données d'action avec des métadonnées contextuelles
      const enrichedActionData = {
        ...actionData,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        referrer: typeof document !== 'undefined' ? document.referrer : null,
        url: typeof window !== 'undefined' ? window.location.href : null
      };

      await supabase.rpc('track_user_activity', {
        p_user_id: userId,
        p_property_id: propertyId,
        p_action_type: actionType,
        p_action_data: enrichedActionData,
        p_session_id: sessionId || null,
      });

      console.log(`✅ Activité suivie: ${actionType} pour l'utilisateur ${userId}`);
    } catch (error) {
      console.error('Erreur lors du suivi de l\'activité utilisateur:', error);
      // Ne pas faire échouer l'action principale à cause du suivi
    }
  }

  /**
   * Récupère l'historique d'activité d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param limit - Nombre maximum d'activités à récupérer
   * @returns Liste des activités de l'utilisateur
   */
  static async getUserActivityHistory(
    userId: string,
    limit: number = 50
  ): Promise<ActivityData[]> {
    try {
      // Validation des paramètres
      if (!userId || typeof userId !== 'string') {
        console.error('ID utilisateur invalide pour la récupération d\'historique:', userId);
        return [];
      }

      if (!Number.isInteger(limit) || limit <= 0 || limit > 1000) {
        console.warn('Limite invalide, utilisation de la valeur par défaut:', limit);
        limit = 50;
      }

      const { data, error } = await supabase
        .from('user_activity_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la récupération de l\'historique d\'activité:', error);
        throw error;
      }

      // Convertir les données de la base vers l'interface ActivityData
      return (data || []).map(dbActivity => this.mapDatabaseToActivityData(dbActivity));
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique utilisateur:', error);
      return [];
    }
  }

  /**
   * Convertit les données de la base vers l'interface ActivityData
   */
  private static mapDatabaseToActivityData(dbData: unknown): ActivityData {
    if (typeof dbData !== 'object' || dbData === null) {
      throw new Error('Données d\'activité invalides');
    }

    const data = dbData as Record<string, unknown>;
    
    return {
      id: String(data.id || ''),
      userId: String(data.user_id || ''),
      type: String(data.action_type || '') as ActivityType,
      timestamp: new Date(String(data.created_at || Date.now())),
      duration: typeof data.duration === 'number' ? data.duration : undefined,
      metadata: (data.action_data as Record<string, unknown>) || {},
      sessionId: typeof data.session_id === 'string' ? data.session_id : undefined,
      ipAddress: typeof data.ip_address === 'string' ? data.ip_address : undefined,
      userAgent: typeof data.user_agent === 'string' ? data.user_agent : undefined
    };
  }

  /**
   * Récupère la liste des propriétés favorites d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Liste des IDs des propriétés favorites
   */
  static async getUserFavorites(userId: string): Promise<string[]> {
    try {
      // Validation des paramètres
      if (!userId || typeof userId !== 'string') {
        console.error('ID utilisateur invalide pour la récupération des favoris:', userId);
        return [];
      }

      const { data, error } = await supabase
        .from('property_favorites')
        .select('property_id')
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors de la récupération des favoris:', error);
        throw error;
      }

      // Validation et conversion des données
      return (data || [])
        .map(item => item?.property_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris utilisateur:', error);
      return [];
    }
  }

  /**
   * Génère des recommandations personnalisées pour un utilisateur
   * @param userId - ID de l'utilisateur
   * @param limit - Nombre maximum de recommandations
   * @returns Liste des propriétés recommandées
   */
  static async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<EnrichedProperty[]> {
    try {
      // Validation des paramètres
      if (!userId || typeof userId !== 'string') {
        console.error('ID utilisateur invalide pour les recommandations:', userId);
        return this.getFallbackRecommendations(limit);
      }

      if (!Number.isInteger(limit) || limit <= 0 || limit > 50) {
        console.warn('Limite invalide pour les recommandations, utilisation de 10:', limit);
        limit = 10;
      }

      console.log(`🔍 Génération de recommandations pour l'utilisateur ${userId}`);

      // Récupération des données utilisateur
      const activity = await this.getUserActivityHistory(userId, 50);
      const favorites = await this.getUserFavorites(userId);

      console.log(`📊 Activité récupérée: ${activity.length} entrées, Favoris: ${favorites.length} propriétés`);

      // Calcul des scores de recommandation
      const scores = await this.calculateRecommendationScores(
        userId,
        activity,
        favorites
      );

      if (scores.length === 0) {
        console.log('⚠️ Aucun score calculé, utilisation des recommandations de fallback');
        return this.getFallbackRecommendations(limit);
      }

      // Sélection des meilleures propriétés
      const topPropertyIds = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((s) => s.propertyId);

      console.log(`🏆 Sélection de ${topPropertyIds.length} propriétés recommandées`);

      // Récupération des propriétés avec enrichissement
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'disponible')
        .in('id', topPropertyIds);

      if (error) {
        console.error('Erreur lors de la récupération des propriétés:', error);
        throw error;
      }

      // Enrichissement des propriétés avec les scores
      const enrichedProperties = topPropertyIds
        .map(id => {
          const property = properties?.find(p => p.id === id);
          const scoreData = scores.find(s => s.propertyId === id);
          
          if (!property || !scoreData) return null;

          return this.enrichPropertyWithRecommendation(property, scoreData);
        })
        .filter((p): p is EnrichedProperty => p !== undefined);

      // Sauvegarde des recommandations
      await this.storeRecommendations(userId, scores.slice(0, limit));

      // Journalisation pour l'IA
      await azureAIService.logUsage(userId, {
        service_type: 'recommendations',
        operation: 'personalized_recommendations',
        tokens_used: 0,
        cost_fcfa: 0.5,
        success: true,
        metadata: {
          recommendations_count: enrichedProperties.length,
          algorithm: 'hybrid',
          user_activity_count: activity.length,
          favorites_count: favorites.length,
          generation_timestamp: new Date().toISOString()
        },
      });

      console.log(`✅ ${enrichedProperties.length} recommandations générées avec succès`);
      return enrichedProperties;
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error);
      return this.getFallbackRecommendations(limit);
    }
  }

  /**
   * Enrichit une propriété avec les données de recommandation
   */
  private static enrichPropertyWithRecommendation(
    property: Property, 
    scoreData: RecommendationScore
  ): EnrichedProperty {
    return {
      ...property,
      score: scoreData.score,
      recommendationReasons: [scoreData.reason.primary, ...scoreData.reason.secondary],
      features: this.extractPropertyFeatures(property),
      location: {
        city: property.city,
        neighborhood: property.neighborhood || undefined,
        coordinates: undefined // À implémenter si nécessaire
      },
      marketData: {
        averageRent: property.monthly_rent, // Valeur par défaut
        demandScore: scoreData.confidence * 100,
        trend: 'stable' // À calculer avec des données de marché
      }
    };
  }

  /**
   * Extrait les caractéristiques d'une propriété
   */
  private static extractPropertyFeatures(property: Property): PropertyFeature[] {
    const features: PropertyFeature[] = [];
    
    if (property.has_parking) features.push('parking');
    if (property.has_ac) features.push('air_conditioning');
    if (property.is_furnished) features.push('furnished');
    
    return features;
  }

  /**
   * Calcule les scores de recommandation pour toutes les propriétés disponibles
   * @param userId - ID de l'utilisateur
   * @param activity - Historique d'activité de l'utilisateur
   * @param favorites - Propriétés favorites de l'utilisateur
   * @returns Scores de recommandation pour chaque propriété
   */
  private static async calculateRecommendationScores(
    userId: string,
    activity: ActivityData[],
    favorites: string[]
  ): Promise<RecommendationScore[]> {
    // Validation des paramètres d'entrée
    if (!Array.isArray(activity) || !Array.isArray(favorites)) {
      console.error('Paramètres invalides pour le calcul des scores:', { activity, favorites });
      return [];
    }

    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'disponible')
      .limit(100);

    if (error || !properties) {
      console.error('Erreur lors de la récupération des propriétés pour le scoring:', error);
      return [];
    }

    const scores: RecommendationScore[] = [];
    const algorithm: RecommendationAlgorithm = 'hybrid';

    for (const property of properties) {
      let score = 0;
      const primaryReasons: string[] = [];
      const secondaryReasons: string[] = [];
      const factors: RecommendationFactor[] = [];

      // Score pour les favoris similaires
      if (favorites.includes(property.id)) {
        score += 40;
        primaryReasons.push('Propriété similaire à vos favoris');
        factors.push({
          name: 'similar_to_favorites',
          weight: 40,
          description: 'Propriété similaire à celles que vous avez marquées en favoris'
        });
      }

      // Extraction des propriétés consultées et des villes d'intérêt
      const viewedProperties = activity
        .filter((a) => a.type === 'property_view' && a.targetId)
        .map((a) => a.targetId as string);

      const viewedCities = activity
        .filter((a) => a.type === 'property_view')
        .map((a) => {
          const metadata = a.metadata;
          return typeof metadata.city === 'string' ? metadata.city : null;
        })
        .filter((city): city is string => city !== null);

      // Score pour les villes préférées
      if (viewedCities.includes(property.city)) {
        score += 25;
        primaryReasons.push(`Ville préférée: ${property.city}`);
        factors.push({
          name: 'preferred_city',
          weight: 25,
          description: `Vous avez consulté des propriétés dans ${property.city}`
        });
      }

      // Analyse des critères de recherche
      const searchActivity = activity.filter((a) => a.type === 'property_search');
      if (searchActivity.length > 0) {
        // Prendre la recherche la plus récente
        const lastSearch = searchActivity.sort((a, b) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        )[0];
        
        const criteria = this.parseSearchCriteria(lastSearch.metadata);

        if (criteria.propertyTypes.includes(property.property_type as PropertyType)) {
          score += 20;
          secondaryReasons.push('Correspond à vos critères de recherche');
          factors.push({
            name: 'matches_search_criteria',
            weight: 20,
            description: `Type de propriété recherché: ${property.property_type}`
          });
        }

        if (this.isInPriceRange(property.monthly_rent, criteria.priceRange)) {
          score += 15;
          secondaryReasons.push('Dans votre budget');
          factors.push({
            name: 'within_budget',
            weight: 15,
            description: `Prix dans la range ${criteria.priceRange.min}-${criteria.priceRange.max} FCFA`
          });
        }

        if (criteria.bedrooms && property.bedrooms === criteria.bedrooms) {
          score += 10;
          secondaryReasons.push('Nombre de chambres correspondant');
          factors.push({
            name: 'matching_bedrooms',
            weight: 10,
            description: `Nombre de chambres: ${property.bedrooms}`
          });
        }
      }

      // Score de popularité
      const popularityScore = Math.min(property.view_count * 0.1, 20);
      if (popularityScore > 10) {
        score += popularityScore;
        secondaryReasons.push('Populaire auprès des locataires');
        factors.push({
          name: 'popularity',
          weight: popularityScore,
          description: `${property.view_count} consultations (popularité)`
        });
      }

      // Score de fraîcheur (annonce récente)
      const daysOld = Math.floor(
        (Date.now() - new Date(property.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const freshnessScore = Math.max(10 - daysOld, 0);
      if (freshnessScore > 5) {
        score += freshnessScore;
        secondaryReasons.push('Annonce récente');
        factors.push({
          name: 'freshness',
          weight: freshnessScore,
          description: `Annonce publiée il y a ${daysOld} jours`
        });
      }

      // Calcul du score final et de la confiance
      const finalScore = Math.min(Math.max(score, 0), 100);
      const confidence = this.calculateConfidence(factors, finalScore);

      if (finalScore > 0) {
        const recommendationReason: RecommendationReason = {
          primary: primaryReasons.length > 0 ? primaryReasons[0] : 'Correspondance avec vos préférences',
          secondary: secondaryReasons,
          factors: factors
        };

        scores.push({
          propertyId: property.id,
          score: finalScore,
          reason: recommendationReason,
          algorithm,
          confidence,
          factors
        });
      }
    }

    console.log(`📊 Scores calculés pour ${scores.length} propriétés`);
    return scores;

  }

  /**
   * Parse les critères de recherche depuis les métadonnées
   */
  private static parseSearchCriteria(metadata: Record<string, unknown>): UserSearchCriteria {
    const propertyTypes: PropertyType[] = [];
    const cities: string[] = [];
    let priceRange = { min: 0, max: Number.MAX_SAFE_INTEGER };
    let bedrooms: number | undefined;

    // Validation et extraction des critères
    if (typeof metadata.property_type === 'string') {
      propertyTypes.push(metadata.property_type as PropertyType);
    } else if (Array.isArray(metadata.property_types)) {
      metadata.property_types.forEach(type => {
        if (typeof type === 'string') {
          propertyTypes.push(type as PropertyType);
        }
      });
    }

    if (typeof metadata.city === 'string') {
      cities.push(metadata.city);
    } else if (Array.isArray(metadata.cities)) {
      metadata.cities.forEach(city => {
        if (typeof city === 'string') {
          cities.push(city);
        }
      });
    }

    if (typeof metadata.min_price === 'number') {
      priceRange.min = metadata.min_price;
    }
    if (typeof metadata.max_price === 'number') {
      priceRange.max = metadata.max_price;
    }

    if (typeof metadata.bedrooms === 'number') {
      bedrooms = metadata.bedrooms;
    }

    return {
      propertyTypes,
      cities,
      priceRange,
      bedrooms,
      preferences: {
        language: 'fr',
        currency: 'FCFA',
        notifications: {
          email: true,
          push: true,
          sms: true,
          quietHours: { enabled: false, start: '22:00', end: '08:00', timezone: 'Africa/Abidjan' },
          categories: { applications: true, payments: true, messages: true, maintenance: false, marketing: false }
        },
        privacy: {
          showProfile: true,
          showActivity: false,
          allowDirectMessages: true,
          dataSharing: { analytics: true, marketing: false, improvements: true }
        },
        searchDefaults: {
          city: cities[0],
          propertyType: propertyTypes[0],
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          bedrooms
        }
      }
    };
  }

  /**
   * Vérifie si un prix est dans la range donnée
   */
  private static isInPriceRange(price: number, range: { min: number; max: number }): boolean {
    return price >= range.min && price <= range.max;
  }

  /**
   * Calcule la confiance du score de recommandation
   */
  private static calculateConfidence(factors: RecommendationFactor[], score: number): number {
    if (factors.length === 0) return 0.1;
    
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const highWeightFactors = factors.filter(f => f.weight >= 20).length;
    
    let confidence = Math.min(score / 100, 0.9);
    
    // Boost pour les recommandations avec plusieurs facteurs de poids élevé
    if (highWeightFactors >= 2) {
      confidence = Math.min(confidence + 0.1, 1.0);
    }
    
    return Math.round(confidence * 100) / 100;
  }

  /**
   * Sauvegarde les recommandations calculées en base de données
   * @param userId - ID de l'utilisateur
   * @param scores - Scores de recommandation calculés
   */
  private static async storeRecommendations(
    userId: string,
    scores: RecommendationScore[]
  ): Promise<void> {
    try {
      // Validation des paramètres
      if (!userId || typeof userId !== 'string') {
        console.error('ID utilisateur invalide pour le stockage des recommandations:', userId);
        return;
      }

      if (!Array.isArray(scores) || scores.length === 0) {
        console.warn('Aucun score à stocker pour l\'utilisateur:', userId);
        return;
      }

      const recommendations = scores.map((s) => ({
        user_id: userId,
        property_id: s.propertyId,
        recommendation_score: s.score,
        recommendation_reason: JSON.stringify(s.reason),
        algorithm_type: s.algorithm,
        confidence_score: s.confidence,
        factors_data: JSON.stringify(s.factors),
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('ai_recommendations')
        .upsert(recommendations, {
          onConflict: 'user_id,property_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Erreur lors du stockage des recommandations:', error);
        throw error;
      }

      console.log(`✅ ${recommendations.length} recommandations stockées pour l'utilisateur ${userId}`);
    } catch (error) {
      console.error('Erreur lors du stockage des recommandations:', error);
      // Ne pas faire échouer l'action principale à cause du stockage
    }
  }

  /**
   * Récupère des recommandations de fallback (propriétés populaires)
   * @param limit - Nombre maximum de propriétés à retourner
   * @returns Liste des propriétés populaires
   */
  private static async getFallbackRecommendations(
    limit: number
  ): Promise<EnrichedProperty[]> {
    try {
      // Validation de la limite
      if (!Number.isInteger(limit) || limit <= 0 || limit > 50) {
        console.warn('Limite invalide pour les recommandations fallback:', limit);
        limit = 10;
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'disponible')
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la récupération des recommandations fallback:', error);
        throw error;
      }

      // Enrichissement des propriétés de fallback
      const enrichedProperties = (data || []).map(property => {
        const fallbackScore = Math.min((property.view_count || 0) * 0.1, 100);
        const recommendationReason: RecommendationReason = {
          primary: 'Propriété populaire',
          secondary: [`${property.view_count || 0} consultations`],
          factors: [{
            name: 'popularity_fallback',
            weight: fallbackScore,
            description: `Propriété consultée ${property.view_count || 0} fois`
          }]
        };

        return this.enrichPropertyWithRecommendation(property, {
          propertyId: property.id,
          score: fallbackScore,
          reason: recommendationReason,
          algorithm: 'trending',
          confidence: Math.min(fallbackScore / 100, 0.7),
          factors: recommendationReason.factors
        });
      });

      console.log(`🏠 ${enrichedProperties.length} recommandations fallback générées`);
      return enrichedProperties;
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations fallback:', error);
      return [];
    }
  }

  /**
   * Suit les clics sur les recommandations pour améliorer l'algorithme
   * @param userId - ID de l'utilisateur
   * @param propertyId - ID de la propriété cliquée
   */
  static async trackRecommendationClick(
    userId: string,
    propertyId: string
  ): Promise<void> {
    try {
      // Validation des paramètres
      if (!userId || typeof userId !== 'string') {
        console.error('ID utilisateur invalide pour le suivi de clic:', userId);
        return;
      }

      if (!propertyId || typeof propertyId !== 'string') {
        console.error('ID propriété invalide pour le suivi de clic:', propertyId);
        return;
      }

      const { error } = await supabase
        .from('ai_recommendations')
        .update({
          clicked: true,
          clicked_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('property_id', propertyId)
        .is('clicked', false);

      if (error) {
        console.error('Erreur lors du suivi du clic de recommandation:', error);
        // Ne pas faire échouer l'action principale à cause du suivi
      } else {
        console.log(`✅ Clic suivi: utilisateur ${userId}, propriété ${propertyId}`);
      }
    } catch (error) {
      console.error('Erreur inattendue lors du suivi de clic:', error);
    }
  }

  /**
   * Calcule la précision des recommandations sur une période donnée
   * @param days - Nombre de jours à analyser
   * @returns Score de précision (0-1)
   */
  static async getRecommendationAccuracy(days: number = 7): Promise<number> {
    try {
      // Validation des paramètres
      if (!Number.isInteger(days) || days <= 0 || days > 365) {
        console.warn('Nombre de jours invalide pour le calcul de précision:', days);
        days = 7;
      }

      const { data, error } = await supabase.rpc(
        'calculate_recommendation_accuracy',
        { p_days: days }
      );

      if (error) {
        console.error('Erreur lors du calcul de précision:', error);
        throw error;
      }

      const accuracy = typeof data === 'number' ? data : 0;
      console.log(`📊 Précision des recommandations sur ${days} jours: ${(accuracy * 100).toFixed(1)}%`);
      return Math.max(0, Math.min(1, accuracy));
    } catch (error) {
      console.error('Erreur lors du calcul de précision des recommandations:', error);
      return 0;
    }
  }

  /**
   * Trouve des propriétés similaires à une propriété donnée
   * @param propertyId - ID de la propriété de référence
   * @param limit - Nombre maximum de propriétés similaires
   * @returns Liste des propriétés similaires
   */
  static async getAIBasedSimilarProperties(
    propertyId: string,
    limit: number = 5
  ): Promise<EnrichedProperty[]> {
    try {
      // Validation des paramètres
      if (!propertyId || typeof propertyId !== 'string') {
        console.error('ID propriété invalide pour la recherche de similaires:', propertyId);
        return [];
      }

      if (!Number.isInteger(limit) || limit <= 0 || limit > 20) {
        console.warn('Limite invalide pour les propriétés similaires:', limit);
        limit = 5;
      }

      // Récupération de la propriété de référence
      const { data: currentProperty, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .maybeSingle();

      if (propError) {
        console.error('Erreur lors de la récupération de la propriété de référence:', propError);
        return [];
      }

      if (!currentProperty) {
        console.warn('Propriété de référence non trouvée:', propertyId);
        return [];
      }

      // Recherche de propriétés similaires
      const { data: similarProperties, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'disponible')
        .neq('id', propertyId)
        .eq('city', currentProperty.city)
        .eq('property_type', currentProperty.property_type)
        .gte('monthly_rent', currentProperty.monthly_rent * 0.8)
        .lte('monthly_rent', currentProperty.monthly_rent * 1.2)
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la recherche de propriétés similaires:', error);
        throw error;
      }

      // Enrichissement des propriétés similaires
      const enrichedSimilar = (similarProperties || []).map(property => {
        const similarityScore = this.calculateSimilarityScore(property, currentProperty);
        const recommendationReason: RecommendationReason = {
          primary: `Similar to property ${propertyId}`,
          secondary: [
            `Same city: ${property.city}`,
            `Same type: ${property.property_type}`,
            `Similar price range`
          ],
          factors: [{
            name: 'similarity',
            weight: similarityScore,
            description: `Similarité avec la propriété de référence: ${Math.round(similarityScore)}%`
          }]
        };

        return this.enrichPropertyWithRecommendation(property, {
          propertyId: property.id,
          score: similarityScore,
          reason: recommendationReason,
          algorithm: 'content_based',
          confidence: similarityScore / 100,
          factors: recommendationReason.factors
        });
      });

      console.log(`🔍 ${enrichedSimilar.length} propriétés similaires trouvées pour ${propertyId}`);
      return enrichedSimilar;
    } catch (error) {
      console.error('Erreur lors de la recherche de propriétés similaires:', error);
      return [];
    }
  }

  /**
   * Calcule le score de similarité entre deux propriétés
   * @param property - Propriété à évaluer
   * @param referenceProperty - Propriété de référence
   * @returns Score de similarité (0-100)
   */
  private static calculateSimilarityScore(
    property: Property, 
    referenceProperty: Property
  ): number {
    let score = 0;

    // Même ville (40 points)
    if (property.city === referenceProperty.city) {
      score += 40;
    }

    // Même type de propriété (30 points)
    if (property.property_type === referenceProperty.property_type) {
      score += 30;
    }

    // Prix similaire (20 points)
    const priceDiff = Math.abs(property.monthly_rent - referenceProperty.monthly_rent);
    const avgPrice = (property.monthly_rent + referenceProperty.monthly_rent) / 2;
    const priceSimilarity = Math.max(0, 1 - (priceDiff / avgPrice));
    score += priceSimilarity * 20;

    // Même nombre de chambres (10 points)
    if (property.bedrooms === referenceProperty.bedrooms) {
      score += 10;
    }

    return Math.round(score);
  }
}

export const recommendationService = RecommendationService;
