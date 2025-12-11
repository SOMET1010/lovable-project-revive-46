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

    const { agency_id, report_type, start_date, end_date } = await req.json();

    console.log('Generating report for agency:', agency_id, report_type);

    const startDt = start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const endDt = end_date || new Date().toISOString().split('T')[0];

    // Get agency info
    const { data: agency } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', agency_id)
      .single();

    // Get agents with performance
    const { data: agents } = await supabase
      .from('agency_agents')
      .select(`
        *,
        profiles:user_id(full_name, avatar_url)
      `)
      .eq('agency_id', agency_id)
      .eq('status', 'active');

    // Get transactions for period
    const { data: transactions } = await supabase
      .from('agency_transactions')
      .select('*')
      .eq('agency_id', agency_id)
      .gte('transaction_date', startDt)
      .lte('transaction_date', endDt);

    // Get property assignments
    const { data: assignments } = await supabase
      .from('property_assignments')
      .select(`
        *,
        properties:property_id(title, city, monthly_rent),
        agent:agent_id(id, profiles:user_id(full_name))
      `)
      .eq('agency_id', agency_id)
      .eq('status', 'active');

    // Calculate summary
    const totalRevenue = transactions?.reduce((sum, t) => sum + (t.gross_amount || 0), 0) || 0;
    const totalAgencyShare = transactions?.reduce((sum, t) => sum + (t.agency_share || 0), 0) || 0;
    const totalAgentShare = transactions?.reduce((sum, t) => sum + (t.agent_share || 0), 0) || 0;
    const pendingCommissions = transactions?.filter(t => t.status === 'pending').reduce((sum, t) => sum + (t.gross_amount || 0), 0) || 0;
    const paidCommissions = transactions?.filter(t => t.status === 'paid').reduce((sum, t) => sum + (t.gross_amount || 0), 0) || 0;

    // Agent performance breakdown
    const agentPerformance = agents?.map(agent => {
      const agentTx = transactions?.filter(t => t.agent_id === agent.id) || [];
      return {
        agent_id: agent.id,
        name: agent.profiles?.full_name || agent.email,
        total_revenue: agentTx.reduce((sum, t) => sum + (t.gross_amount || 0), 0),
        total_commissions: agentTx.reduce((sum, t) => sum + (t.agent_share || 0), 0),
        transaction_count: agentTx.length,
        properties_assigned: assignments?.filter(a => a.agent_id === agent.id).length || 0,
      };
    }).sort((a, b) => b.total_revenue - a.total_revenue) || [];

    const report = {
      agency: {
        id: agency?.id,
        name: agency?.agency_name,
        period: { start: startDt, end: endDt },
      },
      summary: {
        total_revenue: totalRevenue,
        agency_share: totalAgencyShare,
        agent_share: totalAgentShare,
        pending_commissions: pendingCommissions,
        paid_commissions: paidCommissions,
        total_agents: agents?.length || 0,
        total_properties: assignments?.length || 0,
        transaction_count: transactions?.length || 0,
      },
      agent_performance: agentPerformance,
      transactions: transactions?.slice(0, 50) || [],
      generated_at: new Date().toISOString(),
    };

    console.log('Report generated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      report
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error generating report:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
