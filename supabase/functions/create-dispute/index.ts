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

    const { 
      respondent_id, 
      property_id, 
      contract_id, 
      intervention_id,
      category, 
      subject, 
      description, 
      evidence 
    } = await req.json();

    // Validation
    if (!respondent_id || !category || !subject || !description) {
      return new Response(
        JSON.stringify({ error: 'Données manquantes: respondent_id, category, subject, description requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (user.id === respondent_id) {
      return new Response(
        JSON.stringify({ error: 'Vous ne pouvez pas créer un litige contre vous-même' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Déterminer la priorité selon la catégorie
    const priorityMap: Record<string, string> = {
      'payment': 'high',
      'deposit': 'high',
      'damages': 'high',
      'maintenance': 'normal',
      'noise': 'low',
      'lease_violation': 'high',
      'other': 'normal'
    };

    const priority = priorityMap[category] || 'normal';

    // Créer le litige
    const { data: dispute, error: createError } = await supabase
      .from('disputes')
      .insert({
        complainant_id: user.id,
        respondent_id,
        property_id: property_id || null,
        contract_id: contract_id || null,
        intervention_id: intervention_id || null,
        category,
        subject,
        description,
        evidence: evidence || [],
        priority,
        status: 'open'
      })
      .select()
      .single();

    if (createError) {
      console.error('Erreur création litige:', createError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création du litige' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Assigner automatiquement un agent
    const { data: agentId } = await supabase.rpc('assign_dispute_to_agent', {
      p_dispute_id: dispute.id
    });

    // Créer message système initial
    await supabase
      .from('dispute_messages')
      .insert({
        dispute_id: dispute.id,
        sender_id: user.id,
        sender_role: 'system',
        content: `Litige ${dispute.dispute_number} créé. Catégorie: ${category}. Un médiateur sera assigné sous peu.`,
        is_internal: false
      });

    // Notifier le répondant
    await supabase
      .from('notifications')
      .insert({
        user_id: respondent_id,
        title: 'Nouveau litige',
        message: `Un litige a été ouvert contre vous: ${subject}`,
        type: 'dispute',
        action_url: `/litige/${dispute.id}`,
        metadata: { dispute_id: dispute.id, dispute_number: dispute.dispute_number }
      });

    // Notifier l'agent assigné si présent
    if (agentId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: agentId,
          title: 'Nouveau litige assigné',
          message: `Litige ${dispute.dispute_number}: ${subject}`,
          type: 'dispute',
          action_url: `/trust-agent/mediation/${dispute.id}`,
          metadata: { dispute_id: dispute.id, priority }
        });
    }

    console.log(`Litige créé: ${dispute.dispute_number}, agent assigné: ${agentId || 'aucun'}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        dispute,
        assigned_agent_id: agentId
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur create-dispute:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
