/**
 * Service Analytics
 * Centralise toutes les opérations d'analytics et de reporting
 */

import { supabase } from './supabase/client';

// =====================================================
// Types
// =====================================================

export interface PlatformMetrics {
  date: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  tenantUsers: number;
  ownerUsers: number;
  totalProperties: number;
  newProperties: number;
  activeProperties: number;
  rentedProperties: number;
  totalViews: number;
  uniqueVisitors: number;
  totalSearches: number;
  totalFavorites: number;
  totalApplications: number;
  totalVisitsScheduled: number;
  visitorToUserRate: number;
  viewToFavoriteRate: number;
  viewToApplicationRate: number;
  totalRevenue: number;
  avgPropertyPrice: number;
}

export interface GeographicAnalytics {
  date: string;
  city: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  searchCount: number;
  viewCount: number;
  propertyCount: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  demandScore: number;
  supplyScore: number;
  competitionScore: number;
}

export interface ConversionFunnel {
  date: string;
  step1Visitors: number;
  step2Searches: number;
  step3Views: number;
  step4Favorites: number;
  step5Applications: number;
  step6Visits: number;
  step7Leases: number;
  visitorToSearchRate: number;
  searchToViewRate: number;
  viewToFavoriteRate: number;
  favoriteToApplicationRate: number;
  applicationToVisitRate: number;
  visitToLeaseRate: number;
  overallConversionRate: number;
}

export interface PropertyStats {
  propertyId: string;
  date: string;
  totalViews: number;
  uniqueViews: number;
  favoritesAdded: number;
  visitRequests: number;
  applications: number;
  avgDurationSeconds: number;
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

// =====================================================
// Métriques de Plateforme (Admin)
// =====================================================

class AnalyticsService {
  /**
   * Récupérer les métriques de plateforme
   */
  async getPlatformMetrics(
    startDate: string,
    endDate: string
  ): Promise<PlatformMetrics[]> {
    const { data, error } = await supabase
      .from('platform_metrics')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;

    return (data || []).map(this.transformPlatformMetrics);
  }

  /**
   * Récupérer les métriques du jour
   */
  async getTodayMetrics(): Promise<PlatformMetrics | null> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('platform_metrics')
      .select('*')
      .eq('date', today)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return this.transformPlatformMetrics(data);
  }

  /**
   * Récupérer tendance d'une métrique
   */
  async getMetricTrend(
    table: string,
    column: string,
    days: number = 7
  ): Promise<TrendData> {
    const { data, error } = await supabase
      .rpc('get_metric_trend', {
        p_table: table,
        p_column: column,
        p_days: days,
      });

    if (error) throw error;
    return data;
  }

  // =====================================================
  // Analytics Géographiques
  // =====================================================

  /**
   * Récupérer analytics géographiques pour heatmap
   */
  async getGeographicAnalytics(
    startDate: string,
    endDate: string
  ): Promise<GeographicAnalytics[]> {
    const { data, error } = await supabase
      .from('geographic_analytics')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('demand_score', { ascending: false });

    if (error) throw error;

    return (data || []).map(this.transformGeographicAnalytics);
  }

  /**
   * Récupérer les zones les plus demandées
   */
  async getTopDemandZones(limit: number = 10): Promise<GeographicAnalytics[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('geographic_analytics')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('demand_score', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(this.transformGeographicAnalytics);
  }

  // =====================================================
  // Funnel de Conversion
  // =====================================================

  /**
   * Récupérer données du funnel de conversion
   */
  async getConversionFunnel(
    startDate: string,
    endDate: string
  ): Promise<ConversionFunnel[]> {
    const { data, error } = await supabase
      .from('conversion_funnel')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;

    return (data || []).map(this.transformConversionFunnel);
  }

  /**
   * Récupérer funnel agrégé sur période
   */
  async getAggregatedFunnel(
    startDate: string,
    endDate: string
  ): Promise<ConversionFunnel> {
    const funnelData = await this.getConversionFunnel(startDate, endDate);

    if (funnelData.length === 0) {
      return this.getEmptyFunnel();
    }

    const aggregated = funnelData.reduce((acc, curr) => ({
      date: endDate,
      step1Visitors: acc.step1Visitors + curr.step1Visitors,
      step2Searches: acc.step2Searches + curr.step2Searches,
      step3Views: acc.step3Views + curr.step3Views,
      step4Favorites: acc.step4Favorites + curr.step4Favorites,
      step5Applications: acc.step5Applications + curr.step5Applications,
      step6Visits: acc.step6Visits + curr.step6Visits,
      step7Leases: acc.step7Leases + curr.step7Leases,
      visitorToSearchRate: 0,
      searchToViewRate: 0,
      viewToFavoriteRate: 0,
      favoriteToApplicationRate: 0,
      applicationToVisitRate: 0,
      visitToLeaseRate: 0,
      overallConversionRate: 0,
    }));

    // Recalculer les taux
    aggregated.visitorToSearchRate =
      aggregated.step1Visitors > 0
        ? (aggregated.step2Searches / aggregated.step1Visitors) * 100
        : 0;
    aggregated.searchToViewRate =
      aggregated.step2Searches > 0
        ? (aggregated.step3Views / aggregated.step2Searches) * 100
        : 0;
    aggregated.viewToFavoriteRate =
      aggregated.step3Views > 0
        ? (aggregated.step4Favorites / aggregated.step3Views) * 100
        : 0;
    aggregated.favoriteToApplicationRate =
      aggregated.step4Favorites > 0
        ? (aggregated.step5Applications / aggregated.step4Favorites) * 100
        : 0;
    aggregated.applicationToVisitRate =
      aggregated.step5Applications > 0
        ? (aggregated.step6Visits / aggregated.step5Applications) * 100
        : 0;
    aggregated.visitToLeaseRate =
      aggregated.step6Visits > 0
        ? (aggregated.step7Leases / aggregated.step6Visits) * 100
        : 0;
    aggregated.overallConversionRate =
      aggregated.step1Visitors > 0
        ? (aggregated.step7Leases / aggregated.step1Visitors) * 100
        : 0;

    return aggregated;
  }

  // =====================================================
  // Statistiques Propriétés
  // =====================================================

  /**
   * Récupérer stats d'une propriété
   */
  async getPropertyStats(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<PropertyStats[]> {
    const { data, error } = await supabase
      .from('property_statistics')
      .select('*')
      .eq('property_id', propertyId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;

    return (data || []).map((stat) => this.transformPropertyStats(propertyId, stat));
  }

  /**
   * Récupérer stats agrégées pour toutes les propriétés d'un propriétaire
   */
  async getOwnerPropertiesStats(
    ownerId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    // Récupérer les propriétés du propriétaire
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id')
      .eq('owner_id', ownerId);

    if (propError) throw propError;

    if (!properties || properties.length === 0) {
      return {
        totalViews: 0,
        totalApplications: 0,
        totalFavorites: 0,
        avgConversionRate: 0,
        properties: [],
      };
    }

    const propertyIds = properties.map((p) => p.id);

    // Récupérer les stats pour toutes les propriétés
    const { data: stats, error: statsError } = await supabase
      .from('property_statistics')
      .select('*')
      .in('property_id', propertyIds)
      .gte('date', startDate)
      .lte('date', endDate);

    if (statsError) throw statsError;

    const totalViews = (stats || []).reduce((sum, s) => sum + s.total_views, 0);
    const totalApplications = (stats || []).reduce((sum, s) => sum + s.applications, 0);
    const totalFavorites = (stats || []).reduce((sum, s) => sum + s.favorites_added, 0);

    return {
      totalViews,
      totalApplications,
      totalFavorites,
      avgConversionRate:
        totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(2) : 0,
      properties: propertyIds.length,
    };
  }

  // =====================================================
  // Calculs et Agrégations
  // =====================================================

  /**
   * Déclencher calcul des métriques quotidiennes
   */
  async calculateDailyMetrics(date?: string): Promise<void> {
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Calculer métriques plateforme
    await supabase.rpc('calculate_platform_metrics', { p_date: targetDate });

    // Calculer analytics géographiques
    await supabase.rpc('calculate_geographic_analytics', { p_date: targetDate });

    // Calculer funnel de conversion
    await supabase.rpc('calculate_conversion_funnel', { p_date: targetDate });
  }

  // =====================================================
  // Génération de Rapports
  // =====================================================

  /**
   * Générer un rapport via edge function
   */
  async generateReport(
    reportType: 'property_performance' | 'financial' | 'market_analysis' | 'platform_admin',
    userId: string,
    startDate: string,
    endDate: string,
    config?: any
  ): Promise<any> {
    const { data, error } = await supabase.functions.invoke('generate-analytics-report', {
      body: {
        reportType,
        userId,
        startDate,
        endDate,
        config,
      },
    });

    if (error) throw error;
    return data.data;
  }

  // =====================================================
  // Transformers
  // =====================================================

  private transformPlatformMetrics(data: any): PlatformMetrics {
    return {
      date: data.date,
      totalUsers: data.total_users,
      newUsers: data.new_users,
      activeUsers: data.active_users,
      tenantUsers: data.tenant_users,
      ownerUsers: data.owner_users,
      totalProperties: data.total_properties,
      newProperties: data.new_properties,
      activeProperties: data.active_properties,
      rentedProperties: data.rented_properties,
      totalViews: data.total_views,
      uniqueVisitors: data.unique_visitors,
      totalSearches: data.total_searches,
      totalFavorites: data.total_favorites,
      totalApplications: data.total_applications,
      totalVisitsScheduled: data.total_visits_scheduled,
      visitorToUserRate: data.visitor_to_user_rate,
      viewToFavoriteRate: data.view_to_favorite_rate,
      viewToApplicationRate: data.view_to_application_rate,
      totalRevenue: data.total_revenue,
      avgPropertyPrice: data.avg_property_price,
    };
  }

  private transformGeographicAnalytics(data: any): GeographicAnalytics {
    return {
      date: data.date,
      city: data.city,
      neighborhood: data.neighborhood,
      latitude: data.latitude,
      longitude: data.longitude,
      searchCount: data.search_count,
      viewCount: data.view_count,
      propertyCount: data.property_count,
      avgPrice: data.avg_price,
      minPrice: data.min_price,
      maxPrice: data.max_price,
      demandScore: data.demand_score,
      supplyScore: data.supply_score,
      competitionScore: data.competition_score,
    };
  }

  private transformConversionFunnel(data: any): ConversionFunnel {
    return {
      date: data.date,
      step1Visitors: data.step_1_visitors,
      step2Searches: data.step_2_searches,
      step3Views: data.step_3_views,
      step4Favorites: data.step_4_favorites,
      step5Applications: data.step_5_applications,
      step6Visits: data.step_6_visits,
      step7Leases: data.step_7_leases,
      visitorToSearchRate: data.visitor_to_search_rate,
      searchToViewRate: data.search_to_view_rate,
      viewToFavoriteRate: data.view_to_favorite_rate,
      favoriteToApplicationRate: data.favorite_to_application_rate,
      applicationToVisitRate: data.application_to_visit_rate,
      visitToLeaseRate: data.visit_to_lease_rate,
      overallConversionRate: data.overall_conversion_rate,
    };
  }

  private transformPropertyStats(propertyId: string, data: any): PropertyStats {
    return {
      propertyId,
      date: data.date,
      totalViews: data.total_views,
      uniqueViews: data.unique_views,
      favoritesAdded: data.favorites_added,
      visitRequests: data.visit_requests,
      applications: data.applications,
      avgDurationSeconds: data.avg_duration_seconds,
    };
  }

  private getEmptyFunnel(): ConversionFunnel {
    return {
      date: new Date().toISOString().split('T')[0],
      step1Visitors: 0,
      step2Searches: 0,
      step3Views: 0,
      step4Favorites: 0,
      step5Applications: 0,
      step6Visits: 0,
      step7Leases: 0,
      visitorToSearchRate: 0,
      searchToViewRate: 0,
      viewToFavoriteRate: 0,
      favoriteToApplicationRate: 0,
      applicationToVisitRate: 0,
      visitToLeaseRate: 0,
      overallConversionRate: 0,
    };
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
