import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchRequest {
  maintenance_request_id: string;
  specialty: string;
  city: string;
  urgency?: string;
}

interface Provider {
  id: string;
  company_name: string;
  specialties: string[];
  service_areas: string[];
  rating_avg: number;
  completed_jobs: number;
  response_time_avg: number | null;
  hourly_rate: number | null;
}

interface ScoredProvider extends Provider {
  score: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { maintenance_request_id, specialty, city, urgency = 'normale' }: MatchRequest = await req.json();

    console.log(`[match-provider] Matching providers for request ${maintenance_request_id}`);
    console.log(`[match-provider] Criteria: specialty=${specialty}, city=${city}, urgency=${urgency}`);

    // Fetch active verified providers
    const { data: providers, error: providersError } = await supabase
      .from('service_providers')
      .select('id, company_name, specialties, service_areas, rating_avg, completed_jobs, response_time_avg, hourly_rate')
      .eq('is_active', true)
      .eq('is_verified', true);

    if (providersError) {
      console.error('[match-provider] Error fetching providers:', providersError);
      throw providersError;
    }

    if (!providers || providers.length === 0) {
      console.log('[match-provider] No active verified providers found');
      return new Response(
        JSON.stringify({ success: true, providers: [], message: 'Aucun prestataire disponible' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Score each provider
    const scoredProviders: ScoredProvider[] = providers.map((provider: Provider) => {
      let score = 0;

      // Specialty match (40 points max)
      const specialtyMatch = provider.specialties?.some(
        (s: string) => s.toLowerCase().includes(specialty.toLowerCase()) || 
                       specialty.toLowerCase().includes(s.toLowerCase())
      );
      if (specialtyMatch) score += 40;

      // Area match (20 points max)
      const areaMatch = provider.service_areas?.some(
        (a: string) => a.toLowerCase().includes(city.toLowerCase()) || 
                       city.toLowerCase().includes(a.toLowerCase()) ||
                       a.toLowerCase() === 'tout abidjan' ||
                       a.toLowerCase() === 'côte d\'ivoire'
      );
      if (areaMatch) score += 20;

      // Rating score (20 points max)
      const ratingScore = (provider.rating_avg || 0) * 4; // 5 stars = 20 points
      score += ratingScore;

      // Response time score (10 points max) - lower is better
      if (provider.response_time_avg) {
        const responseScore = Math.max(0, 10 - (provider.response_time_avg / 60)); // hours penalty
        score += responseScore;
      } else {
        score += 5; // neutral for unknown
      }

      // Experience score (10 points max)
      const expScore = Math.min(10, (provider.completed_jobs || 0) / 5);
      score += expScore;

      // Urgency bonus for highly rated providers
      if (urgency === 'urgente' || urgency === 'critique') {
        if ((provider.rating_avg || 0) >= 4) score += 10;
        if ((provider.response_time_avg || 999) < 120) score += 5; // responds within 2 hours
      }

      return { ...provider, score };
    });

    // Sort by score descending and take top 5
    const topProviders = scoredProviders
      .filter(p => p.score >= 40) // Minimum threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    console.log(`[match-provider] Found ${topProviders.length} matching providers`);
    topProviders.forEach((p, i) => {
      console.log(`[match-provider] #${i + 1}: ${p.company_name} (score: ${p.score.toFixed(1)})`);
    });

    // If we have providers and this is an urgent request, notify them
    if (topProviders.length > 0 && (urgency === 'urgente' || urgency === 'critique')) {
      // Call provider-notification function for top 3
      const notifyProviders = topProviders.slice(0, 3);
      
      try {
        await supabase.functions.invoke('provider-notification', {
          body: {
            provider_ids: notifyProviders.map(p => p.id),
            maintenance_request_id,
            notification_type: 'new_job',
            urgency
          }
        });
        console.log('[match-provider] Notifications sent to top 3 providers');
      } catch (notifyError) {
        console.error('[match-provider] Failed to send notifications:', notifyError);
        // Don't fail the whole request if notifications fail
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        providers: topProviders.map(p => ({
          id: p.id,
          company_name: p.company_name,
          specialties: p.specialties,
          service_areas: p.service_areas,
          rating_avg: p.rating_avg,
          completed_jobs: p.completed_jobs,
          hourly_rate: p.hourly_rate,
          match_score: Math.round(p.score)
        })),
        total_found: topProviders.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[match-provider] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
