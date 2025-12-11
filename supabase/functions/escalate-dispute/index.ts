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

    const { dispute_id, reason } = await req.json();

    if (!dispute_id || !reason) {
      return new Response(
        JSON.stringify({ error: 'dispute_id et reason requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer le litige
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

    // Escalader le litige
    const { data: updatedDispute, error: updateError } = await supabase
      .from('disputes')
      .update({
        status: 'escalated',
        priority: 'urgent',
        escalated_at: new Date().toISOString()
      })
      .eq('id', dispute_id)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur escalade litige:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'escalade' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ajouter message interne pour les admins
    await supabase
      .from('dispute_messages')
      .insert({
        dispute_id,
        sender_id: user.id,
        sender_role: 'mediator',
        content: `⚠️ ESCALADE: ${reason}`,
        is_internal: true
      });

    // Ajouter message visible pour les parties
    await supabase
      .from('dispute_messages')
      .insert({
        dispute_id,
        sender_id: user.id,
        sender_role: 'system',
        content: `Ce litige a été escaladé pour une attention prioritaire. Un administrateur le traitera sous peu.`,
        is_internal: false
      });

    // Notifier tous les admins
    const { data: admins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (admins && admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        user_id: admin.user_id,
        title: '🚨 Litige escaladé',
        message: `Litige ${dispute.dispute_number} escaladé: ${reason}`,
        type: 'dispute',
        action_url: `/admin/litiges/${dispute_id}`,
        metadata: { dispute_id, priority: 'urgent', reason }
      }));

      await supabase.from('notifications').insert(adminNotifications);
    }

    console.log(`Litige ${dispute.dispute_number} escaladé par ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, dispute: updatedDispute }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur escalate-dispute:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
