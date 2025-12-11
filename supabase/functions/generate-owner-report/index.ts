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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { ownerId, reportType } = await req.json();

    console.log(`Generating ${reportType} report for owner ${ownerId}`);

    // Get owner's properties summary
    const { data: summary } = await supabase.rpc('get_owner_properties_summary', {
      p_owner_id: ownerId,
    });

    // Get detailed property data
    const { data: properties } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        address,
        city,
        monthly_rent,
        status,
        lease_contracts!inner(
          id,
          tenant_id,
          monthly_rent,
          status,
          next_payment_due_date,
          last_payment_date
        )
      `)
      .eq('owner_id', ownerId);

    // Get recent payments
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('receiver_id', ownerId)
      .gte('created_at', startOfMonth.toISOString());

    // Get pending payment plan requests
    const { data: pendingPlans } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('status', 'pending');

    // Get pending postponement requests
    const { data: pendingPostponements } = await supabase
      .from('postponement_requests')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('status', 'pending');

    // Calculate financial stats
    const totalReceived = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const expectedRevenue = summary?.expected_monthly_revenue || 0;
    const collectionRate = expectedRevenue > 0 ? (totalReceived / expectedRevenue) * 100 : 0;

    const report = {
      generated_at: new Date().toISOString(),
      report_type: reportType,
      summary: {
        ...summary,
        total_received_this_month: totalReceived,
        collection_rate: Math.round(collectionRate * 100) / 100,
      },
      properties: properties?.map((p) => ({
        id: p.id,
        title: p.title,
        address: p.address,
        city: p.city,
        monthly_rent: p.monthly_rent,
        status: p.status,
        lease: p.lease_contracts?.[0] || null,
        payment_status: p.lease_contracts?.[0]?.next_payment_due_date
          ? new Date(p.lease_contracts[0].next_payment_due_date) < new Date()
            ? 'overdue'
            : 'on_time'
          : 'no_lease',
      })),
      pending_actions: {
        payment_plans: pendingPlans?.length || 0,
        postponements: pendingPostponements?.length || 0,
      },
      recent_payments: payments?.slice(0, 10) || [],
    };

    // Create notification for owner
    if (reportType === 'daily') {
      await supabase.from('notifications').insert({
        user_id: ownerId,
        title: 'Rapport quotidien disponible',
        message: `Taux de recouvrement: ${Math.round(collectionRate)}%. ${summary?.major_delay_count || 0} retard(s) grave(s).`,
        type: collectionRate >= 90 ? 'success' : collectionRate >= 70 ? 'warning' : 'error',
        action_url: '/dashboard/finances',
        metadata: { report_type: reportType },
      });
    }

    return new Response(
      JSON.stringify({ success: true, report }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-owner-report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
