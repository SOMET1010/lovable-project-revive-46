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

    const { request_id, action, rejection_reason, reviewer_id } = await req.json();

    console.log('Processing agent registration:', request_id, action);

    // Get the registration request
    const { data: request, error: reqError } = await supabase
      .from('agent_registration_requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (reqError || !request) {
      throw new Error('Registration request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request already processed');
    }

    if (action === 'approve') {
      // Check if user already exists with this email
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', request.applicant_email)
        .single();

      let userId = existingProfile?.user_id;

      // Create agent record
      const { data: agent, error: agentError } = await supabase
        .from('agency_agents')
        .insert({
          agency_id: request.agency_id,
          user_id: userId,
          role: 'agent',
          status: 'active',
          phone: request.applicant_phone,
          email: request.applicant_email,
          specialties: request.specialties,
          certifications: request.certifications,
          bio: request.motivation,
        })
        .select()
        .single();

      if (agentError) {
        console.error('Error creating agent:', agentError);
        throw agentError;
      }

      // Update request status
      await supabase
        .from('agent_registration_requests')
        .update({
          status: 'approved',
          reviewed_by: reviewer_id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', request_id);

      // Update agency agent count
      await supabase.rpc('increment_agency_agents', { agency_id: request.agency_id });

      console.log('Agent approved and created:', agent.id);

      return new Response(JSON.stringify({ 
        success: true, 
        agent,
        message: 'Agent créé avec succès'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'reject') {
      // Update request status
      await supabase
        .from('agent_registration_requests')
        .update({
          status: 'rejected',
          reviewed_by: reviewer_id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejection_reason || 'Candidature non retenue',
        })
        .eq('id', request_id);

      console.log('Registration rejected:', request_id);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Candidature rejetée'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error: unknown) {
    console.error('Error processing registration:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
