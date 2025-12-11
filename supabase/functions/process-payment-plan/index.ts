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

    const { action, planId, installments, reason, leaseId, ownerId, decision, decisionReason } = await req.json();

    if (action === 'create') {
      // Get lease details
      const { data: lease, error: leaseError } = await supabase
        .from('lease_contracts')
        .select('monthly_rent, owner_id, tenant_id, next_payment_due_date')
        .eq('id', leaseId)
        .single();

      if (leaseError || !lease) {
        throw new Error('Lease not found');
      }

      // Calculate total with fees (3% for payment plan)
      const totalAmount = lease.monthly_rent;
      const fees = totalAmount * 0.03;
      const totalWithFees = totalAmount + fees;

      // Generate installment schedule
      const installmentAmount = Math.ceil(totalWithFees / installments);
      const installmentSchedule = [];
      const startDate = new Date();

      for (let i = 0; i < installments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + (i + 1) * 15); // Every 15 days
        
        installmentSchedule.push({
          number: i + 1,
          amount: i === installments - 1 
            ? totalWithFees - (installmentAmount * (installments - 1)) 
            : installmentAmount,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'pending',
          paid_at: null,
        });
      }

      // Create payment plan request
      const { data: plan, error: planError } = await supabase
        .from('payment_plans')
        .insert({
          lease_id: leaseId,
          tenant_id: lease.tenant_id,
          owner_id: lease.owner_id,
          total_amount: totalWithFees,
          installments: installmentSchedule,
          fees,
          status: 'pending',
          reason,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Notify owner
      await supabase.from('notifications').insert({
        user_id: lease.owner_id,
        title: 'Demande d\'échéancier',
        message: `Un locataire demande un échéancier de ${installments} versements pour ${totalWithFees.toLocaleString()} FCFA`,
        type: 'info',
        action_url: '/dashboard/echeanciers',
        metadata: { plan_id: plan.id },
      });

      // Check auto-approval based on tenant score
      const { data: settings } = await supabase
        .from('owner_notification_settings')
        .select('auto_approve_schedule_score')
        .eq('owner_id', lease.owner_id)
        .single();

      const { data: tenantProfile } = await supabase
        .from('profiles')
        .select('trust_score')
        .eq('user_id', lease.tenant_id)
        .single();

      if (settings?.auto_approve_schedule_score && tenantProfile?.trust_score) {
        if (tenantProfile.trust_score >= settings.auto_approve_schedule_score) {
          // Auto-approve
          await supabase
            .from('payment_plans')
            .update({
              status: 'approved',
              approved_at: new Date().toISOString(),
            })
            .eq('id', plan.id);

          await supabase.from('notifications').insert({
            user_id: lease.tenant_id,
            title: 'Échéancier approuvé',
            message: `Votre demande d'échéancier a été automatiquement approuvée. Premier versement: ${installmentSchedule[0].due_date}`,
            type: 'success',
            action_url: '/mes-echeanciers',
          });

          return new Response(
            JSON.stringify({ success: true, plan, autoApproved: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true, plan, autoApproved: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'decide') {
      // Owner decision on payment plan
      const { data: plan, error: planError } = await supabase
        .from('payment_plans')
        .select('*, lease_contracts(tenant_id)')
        .eq('id', planId)
        .eq('owner_id', ownerId)
        .single();

      if (planError || !plan) {
        throw new Error('Plan not found or unauthorized');
      }

      const updateData: Record<string, unknown> = {
        status: decision === 'approve' ? 'approved' : 'rejected',
        approved_at: decision === 'approve' ? new Date().toISOString() : null,
        approved_by: decision === 'approve' ? ownerId : null,
        rejection_reason: decision === 'reject' ? decisionReason : null,
      };

      await supabase
        .from('payment_plans')
        .update(updateData)
        .eq('id', planId);

      // Notify tenant
      await supabase.from('notifications').insert({
        user_id: plan.tenant_id,
        title: decision === 'approve' ? 'Échéancier approuvé' : 'Échéancier refusé',
        message: decision === 'approve'
          ? 'Votre demande d\'échéancier a été approuvée. Respectez les dates de paiement.'
          : `Votre demande d'échéancier a été refusée. Motif: ${decisionReason || 'Non spécifié'}`,
        type: decision === 'approve' ? 'success' : 'error',
        action_url: '/mes-echeanciers',
      });

      return new Response(
        JSON.stringify({ success: true, decision }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'pay_installment') {
      // Record installment payment
      const { data: plan, error: planError } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError || !plan) {
        throw new Error('Plan not found');
      }

      const installmentsList = plan.installments as Array<{
        number: number;
        amount: number;
        due_date: string;
        status: string;
        paid_at: string | null;
      }>;

      const installmentIndex = installmentsList.findIndex((i) => i.status === 'pending');
      if (installmentIndex === -1) {
        throw new Error('No pending installments');
      }

      installmentsList[installmentIndex].status = 'paid';
      installmentsList[installmentIndex].paid_at = new Date().toISOString();

      const allPaid = installmentsList.every((i) => i.status === 'paid');

      await supabase
        .from('payment_plans')
        .update({
          installments: installmentsList,
          status: allPaid ? 'completed' : 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId);

      return new Response(
        JSON.stringify({ success: true, completed: allPaid }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-payment-plan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
