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

    const { lease_id, agent_id, agency_id } = await req.json();

    console.log('Calculating commission for lease:', lease_id, 'agent:', agent_id);

    // Get lease details
    const { data: lease, error: leaseError } = await supabase
      .from('lease_contracts')
      .select('*, properties(*)')
      .eq('id', lease_id)
      .single();

    if (leaseError || !lease) {
      throw new Error('Lease not found');
    }

    // Get mandate for commission rate
    const { data: mandate } = await supabase
      .from('agency_mandates')
      .select('commission_rate')
      .eq('agency_id', agency_id)
      .eq('property_id', lease.property_id)
      .eq('status', 'active')
      .single();

    const commissionRate = mandate?.commission_rate || 10;

    // Get agent's commission split
    const { data: agent } = await supabase
      .from('agency_agents')
      .select('commission_split')
      .eq('id', agent_id)
      .single();

    const agentSplit = agent?.commission_split || 50;

    // Calculate amounts
    const monthlyRent = lease.monthly_rent || 0;
    const grossAmount = (monthlyRent * commissionRate) / 100;
    const agentShare = (grossAmount * agentSplit) / 100;
    const agencyShare = grossAmount - agentShare;

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('agency_transactions')
      .insert({
        agency_id,
        agent_id,
        property_id: lease.property_id,
        lease_id,
        transaction_type: 'commission_rental',
        description: `Commission bail - ${lease.properties?.title || 'Propriété'}`,
        gross_amount: grossAmount,
        agency_share: agencyShare,
        agent_share: agentShare,
        status: 'pending',
        transaction_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (txError) {
      console.error('Error creating transaction:', txError);
      throw txError;
    }

    // Log activity
    await supabase.from('agent_activities').insert({
      agent_id,
      activity_type: 'commission_earned',
      entity_type: 'transaction',
      entity_id: transaction.id,
      description: `Commission de ${grossAmount.toLocaleString()} FCFA générée`,
      metadata: { lease_id, gross_amount: grossAmount, agent_share: agentShare },
    });

    console.log('Commission calculated successfully:', transaction.id);

    return new Response(JSON.stringify({ 
      success: true, 
      transaction,
      summary: {
        grossAmount,
        agentShare,
        agencyShare,
        commissionRate,
        agentSplit,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error calculating commission:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
