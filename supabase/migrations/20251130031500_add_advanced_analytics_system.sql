/*
  # Système d'Analytics Avancé - Sprint 5
  
  1. Nouvelles Tables
    - `platform_metrics` - Métriques globales de la plateforme (KPIs admin)
    - `report_configs` - Configurations de rapports personnalisés
    - `geographic_analytics` - Données pour heatmaps géographiques
    - `conversion_funnel` - Données funnel de conversion
    
  2. Vues matérialisées pour performances
    - `mv_daily_platform_stats` - Stats quotidiennes plateforme
    
  3. Fonctions avancées
    - Agrégations temps réel
    - Calculs de tendances
    - Fonctions pour export données
*/

-- =====================================================
-- Table: platform_metrics
-- Métriques globales de la plateforme par jour
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  
  -- Métriques utilisateurs
  total_users integer DEFAULT 0,
  new_users integer DEFAULT 0,
  active_users integer DEFAULT 0,
  tenant_users integer DEFAULT 0,
  owner_users integer DEFAULT 0,
  
  -- Métriques propriétés
  total_properties integer DEFAULT 0,
  new_properties integer DEFAULT 0,
  active_properties integer DEFAULT 0,
  rented_properties integer DEFAULT 0,
  
  -- Métriques engagement
  total_views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  total_searches integer DEFAULT 0,
  total_favorites integer DEFAULT 0,
  total_applications integer DEFAULT 0,
  total_visits_scheduled integer DEFAULT 0,
  
  -- Métriques conversion
  visitor_to_user_rate numeric(5,2) DEFAULT 0,
  view_to_favorite_rate numeric(5,2) DEFAULT 0,
  view_to_application_rate numeric(5,2) DEFAULT 0,
  application_to_lease_rate numeric(5,2) DEFAULT 0,
  
  -- Métriques financières (en FCFA)
  total_revenue bigint DEFAULT 0,
  avg_property_price bigint DEFAULT 0,
  
  -- Métriques performance
  avg_response_time integer DEFAULT 0, -- en ms
  avg_page_load_time integer DEFAULT 0, -- en ms
  error_rate numeric(5,2) DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_platform_metrics_date ON platform_metrics(date DESC);

-- =====================================================
-- Table: geographic_analytics
-- Analytics géographiques pour heatmaps
-- =====================================================
CREATE TABLE IF NOT EXISTS geographic_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  city text NOT NULL,
  neighborhood text,
  
  -- Coordonnées pour mapping
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  
  -- Métriques par zone
  search_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  property_count integer DEFAULT 0,
  avg_price bigint DEFAULT 0,
  min_price bigint DEFAULT 0,
  max_price bigint DEFAULT 0,
  
  -- Demande vs offre
  demand_score integer DEFAULT 0, -- 0-100
  supply_score integer DEFAULT 0, -- 0-100
  competition_score integer DEFAULT 0, -- 0-100
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(date, city, COALESCE(neighborhood, ''))
);

-- Index pour requêtes géographiques
CREATE INDEX IF NOT EXISTS idx_geographic_analytics_date ON geographic_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_geographic_analytics_city ON geographic_analytics(city);
CREATE INDEX IF NOT EXISTS idx_geographic_analytics_coords ON geographic_analytics(latitude, longitude);

-- =====================================================
-- Table: conversion_funnel
-- Données du funnel de conversion par jour
-- =====================================================
CREATE TABLE IF NOT EXISTS conversion_funnel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  
  -- Étapes du funnel
  step_1_visitors integer DEFAULT 0,
  step_2_searches integer DEFAULT 0,
  step_3_views integer DEFAULT 0,
  step_4_favorites integer DEFAULT 0,
  step_5_applications integer DEFAULT 0,
  step_6_visits integer DEFAULT 0,
  step_7_leases integer DEFAULT 0,
  
  -- Taux de conversion entre étapes
  visitor_to_search_rate numeric(5,2) DEFAULT 0,
  search_to_view_rate numeric(5,2) DEFAULT 0,
  view_to_favorite_rate numeric(5,2) DEFAULT 0,
  favorite_to_application_rate numeric(5,2) DEFAULT 0,
  application_to_visit_rate numeric(5,2) DEFAULT 0,
  visit_to_lease_rate numeric(5,2) DEFAULT 0,
  
  -- Taux de conversion global
  overall_conversion_rate numeric(5,2) DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(date)
);

CREATE INDEX IF NOT EXISTS idx_conversion_funnel_date ON conversion_funnel(date DESC);

-- =====================================================
-- Table: report_configs
-- Configurations de rapports personnalisés
-- =====================================================
CREATE TABLE IF NOT EXISTS report_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Configuration du rapport
  name text NOT NULL,
  description text,
  report_type text CHECK (report_type IN ('property_performance', 'financial', 'market_analysis', 'custom')),
  
  -- Paramètres du rapport (JSON)
  config jsonb DEFAULT '{}'::jsonb NOT NULL,
  
  -- Planification
  is_scheduled boolean DEFAULT false,
  schedule_frequency text CHECK (schedule_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  schedule_day integer, -- jour du mois pour monthly, jour de la semaine pour weekly
  schedule_time time, -- heure d'envoi
  
  -- Format export
  export_format text[] DEFAULT ARRAY['pdf'], -- pdf, excel, csv
  
  -- État
  is_active boolean DEFAULT true,
  last_generated_at timestamptz,
  next_generation_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_configs_user_id ON report_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_report_configs_scheduled ON report_configs(is_scheduled, is_active, next_generation_at) WHERE is_scheduled = true AND is_active = true;

-- =====================================================
-- Table: generated_reports
-- Historique des rapports générés
-- =====================================================
CREATE TABLE IF NOT EXISTS generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_config_id uuid REFERENCES report_configs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Détails du rapport
  report_name text NOT NULL,
  report_type text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  
  -- Fichiers générés
  pdf_url text,
  excel_url text,
  csv_url text,
  
  -- Données du rapport (JSON)
  report_data jsonb DEFAULT '{}'::jsonb,
  
  -- Métadonnées
  file_size bigint,
  generation_duration integer, -- en ms
  
  -- Partage
  is_shared boolean DEFAULT false,
  share_token text,
  share_expires_at timestamptz,
  
  generated_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_generated_reports_user_id ON generated_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_config_id ON generated_reports(report_config_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_generated_at ON generated_reports(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_reports_share_token ON generated_reports(share_token) WHERE share_token IS NOT NULL;

-- =====================================================
-- Vue matérialisée: mv_daily_platform_stats
-- Stats quotidiennes pré-calculées pour performances
-- =====================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_platform_stats AS
WITH daily_data AS (
  SELECT 
    CURRENT_DATE as date,
    
    -- Utilisateurs
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM profiles WHERE DATE(created_at) = CURRENT_DATE) as new_users,
    (SELECT COUNT(DISTINCT user_id) FROM property_views WHERE DATE(viewed_at) = CURRENT_DATE) as active_users,
    (SELECT COUNT(*) FROM profiles WHERE active_role = 'locataire') as tenant_users,
    (SELECT COUNT(*) FROM profiles WHERE active_role = 'proprietaire' OR active_role = 'agence') as owner_users,
    
    -- Propriétés
    (SELECT COUNT(*) FROM properties) as total_properties,
    (SELECT COUNT(*) FROM properties WHERE DATE(created_at) = CURRENT_DATE) as new_properties,
    (SELECT COUNT(*) FROM properties WHERE status = 'disponible') as active_properties,
    (SELECT COUNT(*) FROM properties WHERE status = 'loue') as rented_properties,
    
    -- Engagement
    (SELECT COALESCE(SUM(total_views), 0) FROM property_statistics WHERE date = CURRENT_DATE) as total_views,
    (SELECT COUNT(DISTINCT COALESCE(user_id::text, session_id)) FROM property_views WHERE DATE(viewed_at) = CURRENT_DATE) as unique_visitors,
    (SELECT COUNT(*) FROM search_history WHERE DATE(created_at) = CURRENT_DATE) as total_searches,
    (SELECT COALESCE(SUM(favorites_added), 0) FROM property_statistics WHERE date = CURRENT_DATE) as total_favorites,
    (SELECT COALESCE(SUM(applications), 0) FROM property_statistics WHERE date = CURRENT_DATE) as total_applications,
    (SELECT COALESCE(SUM(visit_requests), 0) FROM property_statistics WHERE date = CURRENT_DATE) as total_visits_scheduled,
    
    -- Revenue
    (SELECT COALESCE(SUM(monthly_rent), 0) FROM leases WHERE status = 'actif') as total_revenue,
    (SELECT COALESCE(AVG(price), 0)::bigint FROM properties WHERE status = 'disponible') as avg_property_price
)
SELECT * FROM daily_data;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_platform_stats_date ON mv_daily_platform_stats(date);

-- =====================================================
-- RLS Policies
-- =====================================================

-- platform_metrics: Admin seulement
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view platform metrics"
  ON platform_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "System can insert platform metrics"
  ON platform_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update platform metrics"
  ON platform_metrics FOR UPDATE
  TO authenticated
  USING (true);

-- geographic_analytics: Tous peuvent voir (données publiques)
ALTER TABLE geographic_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view geographic analytics"
  ON geographic_analytics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage geographic analytics"
  ON geographic_analytics FOR ALL
  TO authenticated
  USING (true);

-- conversion_funnel: Admin seulement
ALTER TABLE conversion_funnel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view conversion funnel"
  ON conversion_funnel FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- report_configs: Utilisateurs peuvent voir leurs propres configs
ALTER TABLE report_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own report configs"
  ON report_configs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own report configs"
  ON report_configs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own report configs"
  ON report_configs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own report configs"
  ON report_configs FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- generated_reports: Utilisateurs peuvent voir leurs propres rapports
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generated reports"
  ON generated_reports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can view shared reports"
  ON generated_reports FOR SELECT
  TO anon
  USING (is_shared = true AND share_expires_at > now());

CREATE POLICY "System can create generated reports"
  ON generated_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- Fonctions SQL Avancées
-- =====================================================

-- Fonction: Calculer les métriques de plateforme quotidiennes
CREATE OR REPLACE FUNCTION calculate_platform_metrics(p_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_views integer;
  v_total_favorites integer;
  v_total_applications integer;
BEGIN
  -- Récupérer les totaux
  SELECT 
    COALESCE(SUM(total_views), 0),
    COALESCE(SUM(favorites_added), 0),
    COALESCE(SUM(applications), 0)
  INTO v_total_views, v_total_favorites, v_total_applications
  FROM property_statistics
  WHERE date = p_date;
  
  -- Insérer ou mettre à jour les métriques
  INSERT INTO platform_metrics (
    date,
    total_users,
    new_users,
    active_users,
    tenant_users,
    owner_users,
    total_properties,
    new_properties,
    active_properties,
    rented_properties,
    total_views,
    unique_visitors,
    total_searches,
    total_favorites,
    total_applications,
    total_visits_scheduled,
    visitor_to_user_rate,
    view_to_favorite_rate,
    view_to_application_rate,
    total_revenue,
    avg_property_price
  )
  SELECT
    p_date,
    (SELECT COUNT(*) FROM profiles WHERE DATE(created_at) <= p_date),
    (SELECT COUNT(*) FROM profiles WHERE DATE(created_at) = p_date),
    (SELECT COUNT(DISTINCT user_id) FROM property_views WHERE DATE(viewed_at) = p_date),
    (SELECT COUNT(*) FROM profiles WHERE active_role = 'locataire' AND DATE(created_at) <= p_date),
    (SELECT COUNT(*) FROM profiles WHERE (active_role = 'proprietaire' OR active_role = 'agence') AND DATE(created_at) <= p_date),
    (SELECT COUNT(*) FROM properties WHERE DATE(created_at) <= p_date),
    (SELECT COUNT(*) FROM properties WHERE DATE(created_at) = p_date),
    (SELECT COUNT(*) FROM properties WHERE status = 'disponible' AND DATE(created_at) <= p_date),
    (SELECT COUNT(*) FROM properties WHERE status = 'loue' AND DATE(created_at) <= p_date),
    v_total_views,
    (SELECT COUNT(DISTINCT COALESCE(user_id::text, session_id)) FROM property_views WHERE DATE(viewed_at) = p_date),
    (SELECT COUNT(*) FROM search_history WHERE DATE(created_at) = p_date),
    v_total_favorites,
    v_total_applications,
    (SELECT COALESCE(SUM(visit_requests), 0) FROM property_statistics WHERE date = p_date),
    -- Taux de conversion
    CASE WHEN v_total_views > 0 THEN (v_total_favorites::numeric / v_total_views::numeric * 100)::numeric(5,2) ELSE 0 END,
    CASE WHEN v_total_views > 0 THEN (v_total_favorites::numeric / v_total_views::numeric * 100)::numeric(5,2) ELSE 0 END,
    CASE WHEN v_total_views > 0 THEN (v_total_applications::numeric / v_total_views::numeric * 100)::numeric(5,2) ELSE 0 END,
    (SELECT COALESCE(SUM(monthly_rent), 0) FROM leases WHERE status = 'actif'),
    (SELECT COALESCE(AVG(price), 0)::bigint FROM properties WHERE status = 'disponible')
  ON CONFLICT (date)
  DO UPDATE SET
    total_users = EXCLUDED.total_users,
    new_users = EXCLUDED.new_users,
    active_users = EXCLUDED.active_users,
    tenant_users = EXCLUDED.tenant_users,
    owner_users = EXCLUDED.owner_users,
    total_properties = EXCLUDED.total_properties,
    new_properties = EXCLUDED.new_properties,
    active_properties = EXCLUDED.active_properties,
    rented_properties = EXCLUDED.rented_properties,
    total_views = EXCLUDED.total_views,
    unique_visitors = EXCLUDED.unique_visitors,
    total_searches = EXCLUDED.total_searches,
    total_favorites = EXCLUDED.total_favorites,
    total_applications = EXCLUDED.total_applications,
    total_visits_scheduled = EXCLUDED.total_visits_scheduled,
    visitor_to_user_rate = EXCLUDED.visitor_to_user_rate,
    view_to_favorite_rate = EXCLUDED.view_to_favorite_rate,
    view_to_application_rate = EXCLUDED.view_to_application_rate,
    total_revenue = EXCLUDED.total_revenue,
    avg_property_price = EXCLUDED.avg_property_price,
    updated_at = now();
END;
$$;

-- Fonction: Calculer l'analytics géographique
CREATE OR REPLACE FUNCTION calculate_geographic_analytics(p_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO geographic_analytics (
    date,
    city,
    neighborhood,
    latitude,
    longitude,
    search_count,
    view_count,
    property_count,
    avg_price,
    min_price,
    max_price,
    demand_score,
    supply_score
  )
  SELECT
    p_date,
    COALESCE(p.city, sh.city) as city,
    p.neighborhood,
    AVG(p.latitude) as latitude,
    AVG(p.longitude) as longitude,
    COUNT(DISTINCT sh.id) as search_count,
    COUNT(DISTINCT pv.id) as view_count,
    COUNT(DISTINCT p.id) as property_count,
    COALESCE(AVG(p.price), 0)::bigint as avg_price,
    COALESCE(MIN(p.price), 0)::bigint as min_price,
    COALESCE(MAX(p.price), 0)::bigint as max_price,
    -- Demand score basé sur recherches et vues
    LEAST(100, (COUNT(DISTINCT sh.id) + COUNT(DISTINCT pv.id)))::integer as demand_score,
    -- Supply score basé sur nombre de propriétés
    LEAST(100, COUNT(DISTINCT p.id) * 2)::integer as supply_score
  FROM properties p
  FULL OUTER JOIN search_history sh ON sh.city = p.city AND DATE(sh.created_at) = p_date
  FULL OUTER JOIN property_views pv ON pv.property_id = p.id AND DATE(pv.viewed_at) = p_date
  WHERE (DATE(sh.created_at) = p_date OR DATE(pv.viewed_at) = p_date OR p.id IS NOT NULL)
  GROUP BY COALESCE(p.city, sh.city), p.neighborhood
  ON CONFLICT (date, city, COALESCE(neighborhood, ''))
  DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    search_count = EXCLUDED.search_count,
    view_count = EXCLUDED.view_count,
    property_count = EXCLUDED.property_count,
    avg_price = EXCLUDED.avg_price,
    min_price = EXCLUDED.min_price,
    max_price = EXCLUDED.max_price,
    demand_score = EXCLUDED.demand_score,
    supply_score = EXCLUDED.supply_score,
    updated_at = now();
    
  -- Calculer competition score
  UPDATE geographic_analytics
  SET competition_score = LEAST(100, GREATEST(0, demand_score - supply_score + 50))::integer
  WHERE date = p_date;
END;
$$;

-- Fonction: Calculer le funnel de conversion
CREATE OR REPLACE FUNCTION calculate_conversion_funnel(p_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_visitors integer;
  v_searches integer;
  v_views integer;
  v_favorites integer;
  v_applications integer;
  v_visits integer;
  v_leases integer;
BEGIN
  -- Compter chaque étape du funnel
  SELECT COUNT(DISTINCT COALESCE(user_id::text, session_id)) INTO v_visitors
  FROM property_views WHERE DATE(viewed_at) = p_date;
  
  SELECT COUNT(*) INTO v_searches
  FROM search_history WHERE DATE(created_at) = p_date;
  
  SELECT COALESCE(SUM(total_views), 0) INTO v_views
  FROM property_statistics WHERE date = p_date;
  
  SELECT COALESCE(SUM(favorites_added), 0) INTO v_favorites
  FROM property_statistics WHERE date = p_date;
  
  SELECT COALESCE(SUM(applications), 0) INTO v_applications
  FROM property_statistics WHERE date = p_date;
  
  SELECT COALESCE(SUM(visit_requests), 0) INTO v_visits
  FROM property_statistics WHERE date = p_date;
  
  SELECT COUNT(*) INTO v_leases
  FROM leases WHERE DATE(created_at) = p_date AND status = 'actif';
  
  -- Insérer les données
  INSERT INTO conversion_funnel (
    date,
    step_1_visitors,
    step_2_searches,
    step_3_views,
    step_4_favorites,
    step_5_applications,
    step_6_visits,
    step_7_leases,
    visitor_to_search_rate,
    search_to_view_rate,
    view_to_favorite_rate,
    favorite_to_application_rate,
    application_to_visit_rate,
    visit_to_lease_rate,
    overall_conversion_rate
  ) VALUES (
    p_date,
    v_visitors,
    v_searches,
    v_views,
    v_favorites,
    v_applications,
    v_visits,
    v_leases,
    CASE WHEN v_visitors > 0 THEN (v_searches::numeric / v_visitors::numeric * 100)::numeric(5,2) ELSE 0 END,
    CASE WHEN v_searches > 0 THEN (v_views::numeric / v_searches::numeric * 100)::numeric(5,2) ELSE 0 END,
    CASE WHEN v_views > 0 THEN (v_favorites::numeric / v_views::numeric * 100)::numeric(5,2) ELSE 0 END,
    CASE WHEN v_favorites > 0 THEN (v_applications::numeric / v_favorites::numeric * 100)::numeric(5,2) ELSE 0 END,
    CASE WHEN v_applications > 0 THEN (v_visits::numeric / v_applications::numeric * 100)::numeric(5,2) ELSE 0 END,
    CASE WHEN v_visits > 0 THEN (v_leases::numeric / v_visits::numeric * 100)::numeric(5,2) ELSE 0 END,
    CASE WHEN v_visitors > 0 THEN (v_leases::numeric / v_visitors::numeric * 100)::numeric(5,2) ELSE 0 END
  )
  ON CONFLICT (date)
  DO UPDATE SET
    step_1_visitors = EXCLUDED.step_1_visitors,
    step_2_searches = EXCLUDED.step_2_searches,
    step_3_views = EXCLUDED.step_3_views,
    step_4_favorites = EXCLUDED.step_4_favorites,
    step_5_applications = EXCLUDED.step_5_applications,
    step_6_visits = EXCLUDED.step_6_visits,
    step_7_leases = EXCLUDED.step_7_leases,
    visitor_to_search_rate = EXCLUDED.visitor_to_search_rate,
    search_to_view_rate = EXCLUDED.search_to_view_rate,
    view_to_favorite_rate = EXCLUDED.view_to_favorite_rate,
    favorite_to_application_rate = EXCLUDED.favorite_to_application_rate,
    application_to_visit_rate = EXCLUDED.application_to_visit_rate,
    visit_to_lease_rate = EXCLUDED.visit_to_lease_rate,
    overall_conversion_rate = EXCLUDED.overall_conversion_rate;
END;
$$;

-- Fonction: Obtenir tendance (croissance par rapport à période précédente)
CREATE OR REPLACE FUNCTION get_metric_trend(
  p_table text,
  p_column text,
  p_days integer DEFAULT 7
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current numeric;
  v_previous numeric;
  v_change numeric;
  v_change_percent numeric;
  v_trend text;
  v_query text;
BEGIN
  -- Période actuelle
  v_query := format(
    'SELECT COALESCE(SUM(%I), 0) FROM %I WHERE date > CURRENT_DATE - %s',
    p_column, p_table, p_days
  );
  EXECUTE v_query INTO v_current;
  
  -- Période précédente
  v_query := format(
    'SELECT COALESCE(SUM(%I), 0) FROM %I WHERE date > CURRENT_DATE - %s AND date <= CURRENT_DATE - %s',
    p_column, p_table, p_days * 2, p_days
  );
  EXECUTE v_query INTO v_previous;
  
  -- Calculer changement
  v_change := v_current - v_previous;
  v_change_percent := CASE 
    WHEN v_previous > 0 THEN ((v_current - v_previous) / v_previous * 100)::numeric(10,2)
    ELSE 0
  END;
  
  v_trend := CASE
    WHEN v_change > 0 THEN 'up'
    WHEN v_change < 0 THEN 'down'
    ELSE 'stable'
  END;
  
  RETURN jsonb_build_object(
    'current', v_current,
    'previous', v_previous,
    'change', v_change,
    'change_percent', v_change_percent,
    'trend', v_trend
  );
END;
$$;

-- Commentaires
COMMENT ON TABLE platform_metrics IS 'Métriques globales de la plateforme par jour (KPIs admin)';
COMMENT ON TABLE geographic_analytics IS 'Analytics géographiques pour heatmaps et analyses de marché';
COMMENT ON TABLE conversion_funnel IS 'Données du funnel de conversion utilisateur';
COMMENT ON TABLE report_configs IS 'Configurations de rapports personnalisés utilisateur';
COMMENT ON TABLE generated_reports IS 'Historique des rapports générés et exportés';

COMMENT ON FUNCTION calculate_platform_metrics IS 'Calcule et stocke les métriques de plateforme pour une date donnée';
COMMENT ON FUNCTION calculate_geographic_analytics IS 'Calcule les analytics géographiques par zone pour une date donnée';
COMMENT ON FUNCTION calculate_conversion_funnel IS 'Calcule les données du funnel de conversion pour une date donnée';
COMMENT ON FUNCTION get_metric_trend IS 'Obtient la tendance d''une métrique (croissance vs période précédente)';
