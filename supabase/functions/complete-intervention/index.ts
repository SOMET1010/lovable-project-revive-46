import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompleteInterventionRequest {
  intervention_id: string;
  final_amount?: number;
  photos_after?: string[];
  notes?: string;
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
      intervention_id, 
      final_amount, 
      photos_after,
      notes 
    }: CompleteInterventionRequest = await req.json();

    console.log(`[complete-intervention] Completing intervention ${intervention_id}`);

    // Get intervention details
    const { data: intervention, error: interventionError } = await supabase
      .from('interventions')
      .select(`
        *,
        maintenance_request:maintenance_requests(
          id,
          issue_type,
          tenant_id,
          property:properties(title, owner_id)
        ),
        provider:service_providers(id, company_name, user_id)
      `)
      .eq('id', intervention_id)
      .single();

    if (interventionError || !intervention) {
      console.error('[complete-intervention] Error fetching intervention:', interventionError);
      return new Response(
        JSON.stringify({ success: false, error: 'Intervention non trouvée' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate photos_after are provided
    const existingPhotosAfter = intervention.photos_after || [];
    const allPhotosAfter = [...existingPhotosAfter, ...(photos_after || [])];
    
    if (allPhotosAfter.length === 0) {
      console.log('[complete-intervention] No photos_after provided');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Des photos après intervention sont requises pour clôturer' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update intervention status to completed
    const updateData: Record<string, unknown> = {
      status: 'completed',
      completed_at: new Date().toISOString(),
      photos_after: allPhotosAfter
    };

    if (final_amount !== undefined) {
      updateData.final_amount = final_amount;
    }
    if (notes) {
      updateData.notes = intervention.notes ? `${intervention.notes}\n\n${notes}` : notes;
    }

    const { error: updateError } = await supabase
      .from('interventions')
      .update(updateData)
      .eq('id', intervention_id);

    if (updateError) {
      console.error('[complete-intervention] Error updating intervention:', updateError);
      throw updateError;
    }

    // Update maintenance request status to resolved
    if (intervention.maintenance_request?.id) {
      const { error: mrUpdateError } = await supabase
        .from('maintenance_requests')
        .update({
          status: 'resolue',
          resolved_at: new Date().toISOString(),
          actual_cost: final_amount || intervention.quoted_amount
        })
        .eq('id', intervention.maintenance_request.id);

      if (mrUpdateError) {
        console.error('[complete-intervention] Error updating maintenance request:', mrUpdateError);
      }
    }

    // Notify owner that intervention is complete
    const maintenanceRequest = intervention.maintenance_request as {
      id: string;
      issue_type: string;
      tenant_id: string;
      property: { title: string; owner_id: string } | null;
    } | null;
    
    const provider = intervention.provider as {
      id: string;
      company_name: string;
      user_id: string;
    } | null;

    if (maintenanceRequest?.property?.owner_id) {
      await supabase
        .from('notifications')
        .insert({
          user_id: maintenanceRequest.property.owner_id,
          title: '✅ Intervention terminée',
          message: `L'intervention "${maintenanceRequest.issue_type}" a été terminée par ${provider?.company_name || 'le prestataire'}. Veuillez vérifier et noter le travail effectué.`,
          type: 'maintenance',
          action_url: `/dashboard/intervention/${intervention_id}`,
          metadata: {
            intervention_id,
            maintenance_request_id: maintenanceRequest.id,
            provider_id: provider?.id
          }
        });
      console.log('[complete-intervention] Owner notification sent');
    }

    // Notify tenant that maintenance is resolved
    if (maintenanceRequest?.tenant_id) {
      await supabase
        .from('notifications')
        .insert({
          user_id: maintenanceRequest.tenant_id,
          title: '🔧 Problème résolu',
          message: `La demande de maintenance "${maintenanceRequest.issue_type}" a été résolue. N'hésitez pas à nous contacter si vous avez des questions.`,
          type: 'maintenance',
          action_url: `/mes-demandes-maintenance`,
          metadata: {
            intervention_id,
            maintenance_request_id: maintenanceRequest.id
          }
        });
      console.log('[complete-intervention] Tenant notification sent');
    }

    console.log(`[complete-intervention] Intervention ${intervention_id} completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        intervention_id,
        message: 'Intervention clôturée avec succès',
        final_amount: final_amount || intervention.quoted_amount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[complete-intervention] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  }
});
