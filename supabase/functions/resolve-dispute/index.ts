import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { dispute_id, resolution, resolution_type } = await req.json();

    if (!dispute_id || !resolution || !resolution_type) {
      return new Response(
        JSON.stringify({ error: 'dispute_id, resolution et resolution_type requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'utilisateur est bien le médiateur assigné ou admin
    const { data: dispute, error: fetchError } = await supabase
      .from('disputes')
      .select('*')
      .eq('id', dispute_id)
      .single();

    if (fetchError || !dispute) {
      return new Response(
        JSON.stringify({ error: 'Litige non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier les permissions
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = roles?.some(r => r.role === 'admin');
    const isTrustAgent = roles?.some(r => r.role === 'trust_agent');
    const isAssignedAgent = dispute.assigned_agent_id === user.id;

    if (!isAdmin && !isTrustAgent && !isAssignedAgent) {
      return new Response(
        JSON.stringify({ error: 'Permission refusée' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mettre à jour le litige
    const { data: updatedDispute, error: updateError } = await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        resolution,
        resolution_type,
        resolved_at: new Date().toISOString()
      })
      .eq('id', dispute_id)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur résolution litige:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la résolution' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ajouter message système
    await supabase
      .from('dispute_messages')
      .insert({
        dispute_id,
        sender_id: user.id,
        sender_role: 'mediator',
        content: `✅ Litige résolu. Décision: ${resolution_type === 'favor_complainant' ? 'En faveur du plaignant' : resolution_type === 'favor_respondent' ? 'En faveur du répondant' : resolution_type === 'compromise' ? 'Compromis' : 'Retiré'}. ${resolution}`,
        is_internal: false
      });

    // Notifier les deux parties
    const notificationPromises = [
      supabase.from('notifications').insert({
        user_id: dispute.complainant_id,
        title: 'Litige résolu',
        message: `Le litige ${dispute.dispute_number} a été résolu.`,
        type: 'dispute',
        action_url: `/litige/${dispute_id}`,
        metadata: { dispute_id, resolution_type }
      }),
      supabase.from('notifications').insert({
        user_id: dispute.respondent_id,
        title: 'Litige résolu',
        message: `Le litige ${dispute.dispute_number} a été résolu.`,
        type: 'dispute',
        action_url: `/litige/${dispute_id}`,
        metadata: { dispute_id, resolution_type }
      })
    ];

    await Promise.all(notificationPromises);

    console.log(`Litige ${dispute.dispute_number} résolu par ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, dispute: updatedDispute }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur resolve-dispute:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
