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

    console.log('Starting ghost tenant detection...');

    // Get all active leases with significant delays
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const { data: delayedLeases, error } = await supabase
      .from('lease_contracts')
      .select(`
        id,
        tenant_id,
        owner_id,
        property_id,
        next_payment_due_date,
        ghost_tenant_detected
      `)
      .eq('status', 'active')
      .eq('ghost_tenant_detected', false)
      .lt('next_payment_due_date', tenDaysAgo.toISOString().split('T')[0]);

    if (error) throw error;

    console.log(`Checking ${delayedLeases?.length || 0} leases for ghost tenants`);

    const ghostTenants = [];

    for (const lease of (delayedLeases || [])) {
      // Check unopened notifications (8+ unopened in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('id, is_read')
        .eq('user_id', lease.tenant_id)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (notifError) continue;

      const unopenedCount = notifications?.filter((n) => !n.is_read).length || 0;

      // Check unopened rent reminders
      const { data: reminders } = await supabase
        .from('rent_reminders')
        .select('id, status, opened_at')
        .eq('tenant_id', lease.tenant_id)
        .eq('lease_id', lease.id)
        .is('opened_at', null);

      const unopenedReminders = reminders?.length || 0;

      // Ghost tenant criteria:
      // - 10+ days late on payment
      // - 8+ unopened notifications OR 3+ unopened rent reminders
      const isGhost = unopenedCount >= 8 || unopenedReminders >= 3;

      if (isGhost) {
        // Mark as ghost tenant
        await supabase
          .from('lease_contracts')
          .update({ ghost_tenant_detected: true })
          .eq('id', lease.id);

        // Notify owner
        await supabase.from('notifications').insert({
          user_id: lease.owner_id,
          title: '⚠️ Locataire injoignable détecté',
          message: `Un locataire ne répond plus depuis plus de 10 jours et a ${unopenedReminders} rappels non lus. Action recommandée.`,
          type: 'error',
          action_url: '/dashboard/multi-biens',
          metadata: {
            lease_id: lease.id,
            tenant_id: lease.tenant_id,
            unopened_notifications: unopenedCount,
            unopened_reminders: unopenedReminders,
          },
        });

        // Record in delay history with critical risk
        await supabase.from('payment_delay_history').insert({
          tenant_id: lease.tenant_id,
          property_id: lease.property_id,
          lease_id: lease.id,
          days_late: Math.floor((new Date().getTime() - new Date(lease.next_payment_due_date).getTime()) / (1000 * 60 * 60 * 24)),
          risk_level: 'critical',
        });

        ghostTenants.push({
          lease_id: lease.id,
          tenant_id: lease.tenant_id,
          unopened_notifications: unopenedCount,
          unopened_reminders: unopenedReminders,
        });
      }
    }

    console.log(`Detected ${ghostTenants.length} ghost tenants`);

    return new Response(
      JSON.stringify({
        success: true,
        ghost_tenants_detected: ghostTenants.length,
        details: ghostTenants,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in detect-ghost-tenant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
