import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_FAILURES = 3;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    
    console.log(`[process-recurring-payments] Running for date: ${todayStr}`);

    // Get active payment schedules due today
    const { data: schedules, error: schedulesError } = await supabase
      .from("payment_schedules")
      .select(`
        *,
        contract:lease_contracts(
          id,
          owner_id,
          tenant_id,
          monthly_rent,
          property:properties(id, title)
        )
      `)
      .eq("is_active", true)
      .eq("next_payment_date", todayStr)
      .lt("failure_count", MAX_FAILURES);

    if (schedulesError) {
      console.error("[process-recurring-payments] Error fetching schedules:", schedulesError);
      throw schedulesError;
    }

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      deactivated: 0
    };

    for (const schedule of schedules || []) {
      results.processed++;
      
      console.log(`[process-recurring-payments] Processing schedule ${schedule.id}`);

      try {
        // Create pending payment record
        const { data: payment, error: paymentError } = await supabase
          .from("payments")
          .insert({
            amount: schedule.amount,
            payer_id: schedule.tenant_id,
            receiver_id: schedule.contract?.owner_id,
            contract_id: schedule.contract_id,
            property_id: schedule.contract?.property?.id,
            payment_type: "loyer",
            payment_method: schedule.payment_method,
            status: "en_attente",
            due_date: todayStr
          })
          .select()
          .single();

        if (paymentError) {
          console.error(`[process-recurring-payments] Error creating payment:`, paymentError);
          throw paymentError;
        }

        // Attempt mobile money payment
        const { data: mmResult, error: mmError } = await supabase.functions.invoke("mobile-money-webhook", {
          body: {
            action: "initiate",
            paymentId: payment.id,
            provider: schedule.mobile_money_provider,
            phoneNumber: schedule.mobile_money_number,
            amount: schedule.amount,
            reference: `AUTO-${schedule.id}-${todayStr}`
          }
        });

        if (mmError || !mmResult?.success) {
          throw new Error(mmError?.message || mmResult?.error || "Payment failed");
        }

        // Update payment status
        await supabase
          .from("payments")
          .update({
            status: "paye",
            paid_date: today.toISOString(),
            transaction_ref: mmResult.transactionId
          })
          .eq("id", payment.id);

        // Update schedule
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(schedule.payment_day);

        await supabase
          .from("payment_schedules")
          .update({
            last_payment_date: todayStr,
            next_payment_date: nextMonth.toISOString().split("T")[0],
            failure_count: 0
          })
          .eq("id", schedule.id);

        // Generate receipt
        await supabase.functions.invoke("generate-payment-receipt", {
          body: { paymentId: payment.id }
        });

        // Notify tenant
        await supabase.from("notifications").insert({
          user_id: schedule.tenant_id,
          title: "Paiement automatique effectué",
          message: `Votre loyer de ${schedule.amount.toLocaleString("fr-CI")} FCFA a été prélevé automatiquement.`,
          type: "payment",
          action_url: "/mes-paiements"
        });

        results.successful++;
        console.log(`[process-recurring-payments] Successfully processed schedule ${schedule.id}`);

      } catch (processError) {
        console.error(`[process-recurring-payments] Error processing schedule ${schedule.id}:`, processError);
        results.failed++;

        // Increment failure count
        const newFailureCount = (schedule.failure_count || 0) + 1;
        const shouldDeactivate = newFailureCount >= MAX_FAILURES;

        await supabase
          .from("payment_schedules")
          .update({
            failure_count: newFailureCount,
            is_active: !shouldDeactivate
          })
          .eq("id", schedule.id);

        // Notify tenant of failure
        await supabase.from("notifications").insert({
          user_id: schedule.tenant_id,
          title: shouldDeactivate ? "Paiement automatique désactivé" : "Échec du paiement automatique",
          message: shouldDeactivate
            ? `Votre paiement automatique a été désactivé après ${MAX_FAILURES} échecs consécutifs. Veuillez mettre à jour vos informations de paiement.`
            : `Le prélèvement automatique de votre loyer a échoué (tentative ${newFailureCount}/${MAX_FAILURES}). Veuillez vérifier votre solde.`,
          type: "payment",
          action_url: "/effectuer-paiement"
        });

        if (shouldDeactivate) {
          results.deactivated++;
        }
      }
    }

    console.log(`[process-recurring-payments] Results:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        date: todayStr,
        results
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[process-recurring-payments] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
