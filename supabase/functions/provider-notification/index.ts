import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  provider_ids: string[];
  maintenance_request_id: string;
  notification_type: 'new_job' | 'job_assigned' | 'reminder' | 'quote_accepted';
  urgency?: string;
  message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      provider_ids, 
      maintenance_request_id, 
      notification_type,
      urgency = 'normale',
      message 
    }: NotificationRequest = await req.json();

    console.log(`[provider-notification] Sending ${notification_type} to ${provider_ids.length} providers`);

    // Get maintenance request details
    const { data: maintenanceRequest, error: mrError } = await supabase
      .from('maintenance_requests')
      .select(`
        id,
        issue_type,
        description,
        urgency,
        property:properties(title, city, neighborhood)
      `)
      .eq('id', maintenance_request_id)
      .single();

    if (mrError) {
      console.error('[provider-notification] Error fetching maintenance request:', mrError);
      throw mrError;
    }

    // Get provider details
    const { data: providers, error: providersError } = await supabase
      .from('service_providers')
      .select('id, user_id, company_name, phone, email')
      .in('id', provider_ids);

    if (providersError) {
      console.error('[provider-notification] Error fetching providers:', providersError);
      throw providersError;
    }

    // Prepare notification messages based on type
    const getNotificationContent = (type: string) => {
      const property = maintenanceRequest?.property as { title?: string; city?: string; neighborhood?: string } | null;
      const location = property ? `${property.neighborhood || ''}, ${property.city || ''}`.trim() : '';
      
      switch (type) {
        case 'new_job':
          return {
            title: urgency === 'urgente' || urgency === 'critique' 
              ? '🚨 URGENT: Nouvelle demande de travaux'
              : '🔧 Nouvelle demande de travaux',
            message: `Nouvelle demande: ${maintenanceRequest?.issue_type}\n` +
                     `Lieu: ${location}\n` +
                     `Urgence: ${maintenanceRequest?.urgency || urgency}\n` +
                     `Connectez-vous pour voir les détails et soumettre un devis.`
          };
        case 'job_assigned':
          return {
            title: '✅ Travaux attribués',
            message: `Vous avez été sélectionné pour: ${maintenanceRequest?.issue_type}\n` +
                     `Lieu: ${location}\n` +
                     `Connectez-vous pour confirmer et planifier l'intervention.`
          };
        case 'reminder':
          return {
            title: '⏰ Rappel: Demande en attente',
            message: `Une demande de travaux attend votre réponse.\n` +
                     `Type: ${maintenanceRequest?.issue_type}\n` +
                     `Répondez rapidement pour ne pas perdre cette opportunité.`
          };
        case 'quote_accepted':
          return {
            title: '🎉 Devis accepté!',
            message: `Votre devis a été accepté pour: ${maintenanceRequest?.issue_type}\n` +
                     `Lieu: ${location}\n` +
                     `Contactez le propriétaire pour planifier l'intervention.`
          };
        default:
          return {
            title: 'Notification Mon Toit',
            message: message || 'Vous avez une nouvelle notification.'
          };
      }
    };

    const content = getNotificationContent(notification_type);
    const notificationResults: { provider_id: string; status: string; error?: string }[] = [];

    // Create in-app notifications for each provider
    for (const provider of providers || []) {
      try {
        if (provider.user_id) {
          // Create in-app notification
          const { error: notifError } = await supabase
            .from('notifications')
            .insert({
              user_id: provider.user_id,
              title: content.title,
              message: content.message,
              type: notification_type === 'new_job' ? 'maintenance' : 'info',
              action_url: `/prestataire/job/${maintenance_request_id}`,
              metadata: {
                maintenance_request_id,
                notification_type,
                urgency
              }
            });

          if (notifError) {
            console.error(`[provider-notification] Failed to create notification for ${provider.company_name}:`, notifError);
            notificationResults.push({ provider_id: provider.id, status: 'failed', error: notifError.message });
          } else {
            console.log(`[provider-notification] Notification created for ${provider.company_name}`);
            notificationResults.push({ provider_id: provider.id, status: 'success' });
          }
        }

        // Try to send SMS/WhatsApp for urgent notifications
        if ((urgency === 'urgente' || urgency === 'critique') && provider.phone) {
          try {
            await supabase.functions.invoke('send-sms-hybrid', {
              body: {
                phone: provider.phone,
                message: `${content.title}\n${content.message}`.slice(0, 160)
              }
            });
            console.log(`[provider-notification] SMS sent to ${provider.company_name}`);
          } catch (smsError) {
            console.error(`[provider-notification] SMS failed for ${provider.company_name}:`, smsError);
          }
        }

      } catch (providerError) {
        console.error(`[provider-notification] Error processing provider ${provider.id}:`, providerError);
        notificationResults.push({ provider_id: provider.id, status: 'failed', error: String(providerError) });
      }
    }

    const successCount = notificationResults.filter(r => r.status === 'success').length;
    console.log(`[provider-notification] Completed: ${successCount}/${provider_ids.length} notifications sent`);

    return new Response(
      JSON.stringify({
        success: true,
        sent_count: successCount,
        total_count: provider_ids.length,
        results: notificationResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[provider-notification] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
