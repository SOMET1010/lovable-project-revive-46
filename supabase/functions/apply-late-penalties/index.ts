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

    console.log('Starting apply-late-penalties CRON job...');

    // Get all active leases with overdue payments
    const today = new Date().toISOString().split('T')[0];
    
    const { data: overdueLeases, error } = await supabase
      .from('lease_contracts')
      .select(`
        id,
        tenant_id,
        owner_id,
        property_id,
        monthly_rent,
        next_payment_due_date,
        penalty_rate,
        penalty_cap,
        grace_period_days,
        legal_action_started
      `)
      .eq('status', 'active')
      .lt('next_payment_due_date', today);

    if (error) throw error;

    console.log(`Found ${overdueLeases?.length || 0} overdue leases`);

    const results = [];

    for (const lease of (overdueLeases || [])) {
      const dueDate = new Date(lease.next_payment_due_date);
      const todayDate = new Date();
      const daysLate = Math.floor((todayDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      // Skip if within grace period
      if (daysLate <= (lease.grace_period_days || 4)) {
        continue;
      }

      // Calculate penalty
      const effectiveDays = daysLate - (lease.grace_period_days || 4);
      let penalty = lease.monthly_rent * ((lease.penalty_rate || 5) / 100) * effectiveDays;
      const maxPenalty = lease.monthly_rent * ((lease.penalty_cap || 50) / 100);
      penalty = Math.min(penalty, maxPenalty);

      // Check if we should start legal action (15+ days late)
      if (daysLate >= 15 && !lease.legal_action_started) {
        // Get owner settings
        const { data: settings } = await supabase
          .from('owner_notification_settings')
          .select('auto_engage_lawyer_days')
          .eq('owner_id', lease.owner_id)
          .single();

        const autoEngageDays = settings?.auto_engage_lawyer_days || 15;

        if (daysLate >= autoEngageDays) {
          await supabase
            .from('lease_contracts')
            .update({
              legal_action_started: true,
              legal_action_started_at: new Date().toISOString(),
            })
            .eq('id', lease.id);

          // Notify owner
          await supabase.from('notifications').insert({
            user_id: lease.owner_id,
            title: 'Procédure juridique initiée',
            message: `Suite à ${daysLate} jours de retard, la procédure juridique automatique a été déclenchée.`,
            type: 'error',
            action_url: '/dashboard/multi-biens',
            metadata: { lease_id: lease.id },
          });

          // Notify tenant
          await supabase.from('notifications').insert({
            user_id: lease.tenant_id,
            title: 'Avis de procédure juridique',
            message: `Suite à ${daysLate} jours de retard de paiement, une procédure juridique a été engagée. Contactez-nous immédiatement.`,
            type: 'error',
            action_url: '/mes-rappels',
            metadata: { lease_id: lease.id },
          });
        }
      }

      // Record in delay history
      const { data: existingHistory } = await supabase
        .from('payment_delay_history')
        .select('id')
        .eq('lease_id', lease.id)
        .eq('days_late', daysLate)
        .single();

      if (!existingHistory) {
        await supabase.from('payment_delay_history').insert({
          tenant_id: lease.tenant_id,
          property_id: lease.property_id,
          lease_id: lease.id,
          days_late: daysLate,
          amount_due: lease.monthly_rent + penalty,
          penalty_applied: penalty,
          risk_level: daysLate >= 15 ? 'critical' : daysLate >= 10 ? 'high' : 'medium',
        });
      }

      results.push({
        lease_id: lease.id,
        days_late: daysLate,
        penalty,
        legal_action: daysLate >= 15,
      });
    }

    console.log(`Processed ${results.length} leases with penalties`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        details: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in apply-late-penalties:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
