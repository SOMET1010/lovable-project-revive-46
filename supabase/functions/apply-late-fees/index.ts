import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Default late fee configuration
const DEFAULT_LATE_FEE_RATE = 0.005; // 0.5% per day
const MAX_LATE_FEE_PERCENT = 0.10; // Maximum 10% of rent
const GRACE_PERIOD_DAYS = 5; // Days after due date before applying fees

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    console.log(`[apply-late-fees] Running for date: ${today.toISOString()}`);

    // Get late fee configuration from business_rules
    const { data: lateFeeRule } = await supabase
      .from("business_rules")
      .select("value_number")
      .eq("rule_key", "late_fee_daily_rate")
      .eq("is_enabled", true)
      .maybeSingle();

    const lateFeeRate = lateFeeRule?.value_number || DEFAULT_LATE_FEE_RATE;

    // Find overdue payments (past due date + grace period, not paid, no late fee applied yet)
    const { data: overduePayments, error: paymentsError } = await supabase
      .from("payments")
      .select(`
        id,
        amount,
        due_date,
        payer_id,
        contract_id,
        late_fee_amount,
        late_fee_applied_at
      `)
      .eq("status", "en_attente")
      .is("late_fee_applied_at", null)
      .not("due_date", "is", null);

    if (paymentsError) {
      console.error("[apply-late-fees] Error fetching payments:", paymentsError);
      throw paymentsError;
    }

    const results = {
      processed: 0,
      feesApplied: 0,
      totalFeesAmount: 0,
      errors: 0
    };

    for (const payment of overduePayments || []) {
      if (!payment.due_date) continue;

      const dueDate = new Date(payment.due_date);
      const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      // Only apply fees after grace period
      if (daysLate <= GRACE_PERIOD_DAYS) continue;

      results.processed++;

      const effectiveDaysLate = daysLate - GRACE_PERIOD_DAYS;
      const baseAmount = payment.amount || 0;
      
      // Calculate late fee: daily rate × days late × amount
      let lateFee = Math.round(baseAmount * lateFeeRate * effectiveDaysLate);
      
      // Cap at maximum percentage
      const maxFee = Math.round(baseAmount * MAX_LATE_FEE_PERCENT);
      lateFee = Math.min(lateFee, maxFee);

      if (lateFee <= 0) continue;

      try {
        // Update payment with late fee
        const { error: updateError } = await supabase
          .from("payments")
          .update({
            late_fee_amount: lateFee,
            late_fee_applied_at: today.toISOString()
          })
          .eq("id", payment.id);

        if (updateError) {
          console.error(`[apply-late-fees] Error updating payment ${payment.id}:`, updateError);
          results.errors++;
          continue;
        }

        // Get tenant profile for notification
        const tenantId = payment.payer_id;
        if (tenantId) {
          const { data: tenant } = await supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("user_id", tenantId)
            .maybeSingle();

          const propertyTitle = "votre logement";

          // Create notification
          await supabase.from("notifications").insert({
            user_id: tenantId,
            title: "Pénalité de retard appliquée",
            message: `Une pénalité de ${lateFee.toLocaleString("fr-CI")} FCFA a été appliquée à votre loyer en retard pour "${propertyTitle}". Total à payer: ${(baseAmount + lateFee).toLocaleString("fr-CI")} FCFA.`,
            type: "payment",
            action_url: "/effectuer-paiement",
            metadata: { 
              paymentId: payment.id, 
              lateFee, 
              daysLate: effectiveDaysLate,
              totalAmount: baseAmount + lateFee
            }
          });

          // Log reminder
          await supabase.from("payment_reminders").insert({
            payment_id: payment.id,
            contract_id: payment.contract_id,
            tenant_id: tenantId,
            reminder_type: "late_fee",
            channel: "in_app",
            message_content: `Pénalité de ${lateFee} FCFA appliquée (${effectiveDaysLate} jours de retard)`,
            sent_at: today.toISOString()
          });

          // Send SMS notification
          if (tenant?.phone) {
            const message = `Mon Toit: Une pénalité de ${lateFee.toLocaleString("fr-CI")} FCFA a été appliquée à votre loyer en retard (${effectiveDaysLate} jours). Régularisez votre situation rapidement.`;
            await supabase.functions.invoke("send-sms-hybrid", {
              body: { phoneNumber: tenant.phone, message }
            });
          }
        }

        results.feesApplied++;
        results.totalFeesAmount += lateFee;

        console.log(`[apply-late-fees] Applied ${lateFee} FCFA fee to payment ${payment.id} (${effectiveDaysLate} days late)`);

      } catch (processError) {
        console.error(`[apply-late-fees] Error processing payment ${payment.id}:`, processError);
        results.errors++;
      }
    }

    console.log(`[apply-late-fees] Results:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        date: today.toISOString(),
        config: {
          lateFeeRate,
          maxFeePercent: MAX_LATE_FEE_PERCENT,
          gracePeriodDays: GRACE_PERIOD_DAYS
        },
        results
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[apply-late-fees] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
