import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeaseWithDetails {
  id: string;
  tenant_id: string;
  owner_id: string;
  property_id: string;
  monthly_rent: number;
  next_payment_due_date: string;
  penalty_rate: number;
  penalty_cap: number;
  grace_period_days: number;
  auto_reminder_enabled: boolean;
  tenant_profile?: {
    full_name: string;
    phone: string;
    email: string;
  };
  property?: {
    title: string;
    address: string;
  };
}

const REMINDER_CONFIG = {
  j_minus_5: { days: -5, channels: ['push', 'email'], severity: 'info', message: 'Rappel amical : votre loyer est dû dans 5 jours' },
  j_minus_3: { days: -3, channels: ['push', 'sms', 'email'], severity: 'warning', message: 'Important : votre loyer est dû dans 3 jours' },
  j_minus_1: { days: -1, channels: ['push', 'sms'], severity: 'urgent', message: 'Urgent : votre loyer est dû demain' },
  j_day: { days: 0, channels: ['push', 'sms'], severity: 'critical', message: 'Échéance : votre loyer est dû aujourd\'hui' },
  j_plus_5: { days: 5, channels: ['push', 'sms', 'email'], severity: 'late', message: 'Mise en demeure : votre loyer est en retard de 5 jours' },
  j_plus_10: { days: 10, channels: ['push', 'sms', 'email', 'whatsapp'], severity: 'serious', message: 'Retard grave : 10 jours de retard, des pénalités s\'appliquent' },
  j_plus_15: { days: 15, channels: ['sms', 'email'], severity: 'legal', message: 'Dernier avis : transmission au service juridique imminente' },
  j_plus_30: { days: 30, channels: ['sms', 'email'], severity: 'legal_action', message: 'Procédure judiciaire engagée' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting rent reminders CRON job...');

    // Get all active leases with auto_reminder_enabled
    const { data: leases, error: leasesError } = await supabase
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
        auto_reminder_enabled
      `)
      .eq('status', 'active')
      .eq('auto_reminder_enabled', true)
      .not('next_payment_due_date', 'is', null);

    if (leasesError) {
      console.error('Error fetching leases:', leasesError);
      throw leasesError;
    }

    console.log(`Found ${leases?.length || 0} active leases with reminders enabled`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const remindersToSend: Array<{
      lease: LeaseWithDetails;
      reminderType: string;
      config: typeof REMINDER_CONFIG[keyof typeof REMINDER_CONFIG];
      daysLate: number;
    }> = [];

    for (const lease of (leases || [])) {
      const dueDate = new Date(lease.next_payment_due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      // Check which reminder type matches
      for (const [type, config] of Object.entries(REMINDER_CONFIG)) {
        if (daysDiff === config.days) {
          // Check if reminder already sent today for this type
          const { data: existingReminder } = await supabase
            .from('rent_reminders')
            .select('id')
            .eq('lease_id', lease.id)
            .eq('reminder_type', type)
            .gte('created_at', today.toISOString())
            .single();

          if (!existingReminder) {
            remindersToSend.push({
              lease: lease as LeaseWithDetails,
              reminderType: type,
              config,
              daysLate: Math.max(0, daysDiff),
            });
          }
          break;
        }
      }
    }

    console.log(`Sending ${remindersToSend.length} reminders...`);

    const results = [];

    for (const { lease, reminderType, config, daysLate } of remindersToSend) {
      // Calculate penalty if applicable
      let penaltyAmount = 0;
      if (daysLate > (lease.grace_period_days || 4)) {
        const effectiveDays = daysLate - (lease.grace_period_days || 4);
        penaltyAmount = lease.monthly_rent * ((lease.penalty_rate || 5) / 100) * effectiveDays;
        const maxPenalty = lease.monthly_rent * ((lease.penalty_cap || 50) / 100);
        penaltyAmount = Math.min(penaltyAmount, maxPenalty);
      }

      const totalDue = lease.monthly_rent + penaltyAmount;

      // Create reminder record
      const { data: reminder, error: reminderError } = await supabase
        .from('rent_reminders')
        .insert({
          lease_id: lease.id,
          tenant_id: lease.tenant_id,
          owner_id: lease.owner_id,
          property_id: lease.property_id,
          reminder_type: reminderType,
          status: 'pending',
          channels_used: config.channels,
          amount_due: totalDue,
          penalty_amount: penaltyAmount,
          message_content: config.message,
        })
        .select()
        .single();

      if (reminderError) {
        console.error(`Error creating reminder for lease ${lease.id}:`, reminderError);
        continue;
      }

      // Get tenant profile for notification
      const { data: tenantProfile } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('user_id', lease.tenant_id)
        .single();

      // Send notifications via configured channels
      const sentChannels: string[] = [];

      for (const channel of config.channels) {
        try {
          if (channel === 'push') {
            // Create in-app notification
            await supabase.from('notifications').insert({
              user_id: lease.tenant_id,
              title: 'Rappel de loyer',
              message: `${config.message}. Montant: ${totalDue.toLocaleString()} FCFA`,
              type: config.severity === 'legal' || config.severity === 'legal_action' ? 'error' : 'warning',
              action_url: '/mes-rappels',
              metadata: { lease_id: lease.id, reminder_id: reminder.id },
            });
            sentChannels.push('push');
          }

          if (channel === 'sms' && tenantProfile?.phone) {
            // Call SMS service
            await supabase.functions.invoke('send-sms-hybrid', {
              body: {
                phone: tenantProfile.phone,
                message: `${config.message}. Montant dû: ${totalDue.toLocaleString()} FCFA. Payez sur MonToit.`,
              },
            });
            sentChannels.push('sms');
          }

          if (channel === 'email' && tenantProfile?.email) {
            // Could integrate with email service here
            sentChannels.push('email');
          }

          if (channel === 'whatsapp' && tenantProfile?.phone) {
            await supabase.functions.invoke('send-whatsapp-hybrid', {
              body: {
                phone: tenantProfile.phone,
                message: `${config.message}. Montant dû: ${totalDue.toLocaleString()} FCFA.`,
              },
            });
            sentChannels.push('whatsapp');
          }
        } catch (channelError) {
          console.error(`Error sending ${channel} for lease ${lease.id}:`, channelError);
        }
      }

      // Update reminder status
      await supabase
        .from('rent_reminders')
        .update({
          status: sentChannels.length > 0 ? 'sent' : 'failed',
          channels_used: sentChannels,
          sent_at: new Date().toISOString(),
        })
        .eq('id', reminder.id);

      // Record delay history for late payments
      if (daysLate > 0) {
        await supabase.from('payment_delay_history').insert({
          tenant_id: lease.tenant_id,
          property_id: lease.property_id,
          lease_id: lease.id,
          days_late: daysLate,
          amount_due: totalDue,
          penalty_applied: penaltyAmount,
          risk_level: daysLate >= 15 ? 'critical' : daysLate >= 10 ? 'high' : daysLate >= 5 ? 'medium' : 'low',
        });
      }

      // Notify owner for serious delays
      if (daysLate >= 5) {
        await supabase.from('notifications').insert({
          user_id: lease.owner_id,
          title: 'Retard de paiement',
          message: `Le locataire de votre bien a ${daysLate} jours de retard. Montant dû: ${totalDue.toLocaleString()} FCFA`,
          type: 'warning',
          action_url: '/dashboard/multi-biens',
          metadata: { lease_id: lease.id, days_late: daysLate },
        });
      }

      results.push({
        lease_id: lease.id,
        reminder_type: reminderType,
        channels_sent: sentChannels,
        amount_due: totalDue,
      });
    }

    console.log(`Completed sending ${results.length} reminders`);

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: results.length,
        details: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-rent-reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
