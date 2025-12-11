import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting agent performance sync...');

    const currentMonth = new Date();
    const periodStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
    const periodEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];

    // Get all active agents
    const { data: agents, error: agentsError } = await supabase
      .from('agency_agents')
      .select('id, agency_id, target_monthly')
      .eq('status', 'active');

    if (agentsError) {
      throw agentsError;
    }

    console.log(`Processing ${agents?.length || 0} agents`);

    const results = [];

    for (const agent of agents || []) {
      // Get agent's transactions for current month
      const { data: transactions } = await supabase
        .from('agency_transactions')
        .select('*')
        .eq('agent_id', agent.id)
        .gte('transaction_date', periodStart)
        .lte('transaction_date', periodEnd);

      // Get agent's leases signed this month
      const { data: leases } = await supabase
        .from('lease_contracts')
        .select('id')
        .gte('signed_at', periodStart)
        .lte('signed_at', periodEnd + 'T23:59:59');

      // Get or create performance target
      const { data: existingTarget } = await supabase
        .from('agent_performance_targets')
        .select('*')
        .eq('agent_id', agent.id)
        .eq('period_start', periodStart)
        .single();

      const actualRevenue = transactions?.reduce((sum, t) => sum + (t.gross_amount || 0), 0) || 0;
      const actualLeases = leases?.length || 0;
      
      // Calculate bonus if target exceeded
      const targetRevenue = agent.target_monthly || 0;
      let bonusEarned = 0;
      if (targetRevenue > 0 && actualRevenue > targetRevenue) {
        bonusEarned = (actualRevenue - targetRevenue) * 0.05; // 5% bonus on excess
      }

      if (existingTarget) {
        // Update existing target
        await supabase
          .from('agent_performance_targets')
          .update({
            actual_revenue: actualRevenue,
            actual_leases: actualLeases,
            bonus_earned: bonusEarned,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingTarget.id);
      } else {
        // Create new target record
        await supabase
          .from('agent_performance_targets')
          .insert({
            agent_id: agent.id,
            period_start: periodStart,
            period_end: periodEnd,
            target_revenue: targetRevenue,
            actual_revenue: actualRevenue,
            actual_leases: actualLeases,
            bonus_earned: bonusEarned,
          });
      }

      results.push({
        agent_id: agent.id,
        actual_revenue: actualRevenue,
        actual_leases: actualLeases,
        bonus_earned: bonusEarned,
      });
    }

    console.log('Performance sync completed for', results.length, 'agents');

    return new Response(JSON.stringify({ 
      success: true, 
      synced_agents: results.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error syncing performance:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
