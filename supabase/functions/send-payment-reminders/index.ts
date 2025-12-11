import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const todayDate = today.getDate();
    
    console.log(`[send-payment-reminders] Running for date: ${today.toISOString()}`);

    // Get active contracts with payment info
    const { data: contracts, error: contractsError } = await supabase
      .from("lease_contracts")
      .select(`
        id,
        contract_number,
        tenant_id,
        owner_id,
        monthly_rent,
        payment_day,
        property:properties(title, address, city)
      `)
      .eq("status", "actif");

    if (contractsError) {
      console.error("[send-payment-reminders] Error fetching contracts:", contractsError);
      throw contractsError;
    }

    const results = {
      upcoming: 0,
      dueToday: 0,
      overdue: 0,
      errors: 0
    };

    for (const contract of contracts || []) {
      const paymentDay = contract.payment_day || 5;
      const daysUntilPayment = paymentDay - todayDate;

      // Get tenant profile
      const { data: tenant } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .eq("user_id", contract.tenant_id)
        .maybeSingle();

      if (!tenant) continue;

      let reminderType: string | null = null;
      let message = "";

      const propertyTitle = Array.isArray(contract.property) ? contract.property[0]?.title : (contract.property as any)?.title || "votre logement";

      // J-3: Upcoming payment reminder
      if (daysUntilPayment === 3) {
        reminderType = "upcoming";
        message = `Bonjour ${tenant.full_name}, votre loyer de ${contract.monthly_rent?.toLocaleString("fr-CI")} FCFA pour "${propertyTitle}" est dû dans 3 jours (le ${paymentDay} du mois). Pensez à effectuer votre paiement sur Mon Toit.`;
        results.upcoming++;
      }
      // J-Day: Payment due today
      else if (daysUntilPayment === 0) {
        reminderType = "due_today";
        message = `Bonjour ${tenant.full_name}, c'est aujourd'hui le jour de paiement de votre loyer (${contract.monthly_rent?.toLocaleString("fr-CI")} FCFA) pour "${propertyTitle}". Effectuez votre paiement maintenant sur Mon Toit.`;
        results.dueToday++;
      }
      // J+1: Overdue notice
      else if (daysUntilPayment === -1) {
        // Check if payment was made
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const { data: payment } = await supabase
          .from("payments")
          .select("id")
          .eq("contract_id", contract.id)
          .eq("status", "paye")
          .gte("paid_date", startOfMonth.toISOString())
          .maybeSingle();

        if (!payment) {
          reminderType = "overdue";
          message = `Attention ${tenant.full_name}, votre loyer de ${contract.monthly_rent?.toLocaleString("fr-CI")} FCFA pour "${propertyTitle}" est en retard. Veuillez régulariser votre situation rapidement pour éviter des pénalités.`;
          results.overdue++;
        }
      }

      if (reminderType && message) {
        try {
          // Send SMS via hybrid function
          if (tenant.phone) {
            await supabase.functions.invoke("send-sms-hybrid", {
              body: { phoneNumber: tenant.phone, message }
            });
          }

          // Create in-app notification
          await supabase.from("notifications").insert({
            user_id: contract.tenant_id,
            title: reminderType === "overdue" ? "Loyer en retard" : 
                   reminderType === "due_today" ? "Jour de paiement" : 
                   "Rappel de paiement",
            message,
            type: "payment",
            action_url: "/effectuer-paiement",
            metadata: { contractId: contract.id, reminderType }
          });

          // Log reminder
          await supabase.from("payment_reminders").insert({
            contract_id: contract.id,
            tenant_id: contract.tenant_id,
            reminder_type: reminderType,
            channel: "sms",
            message_content: message,
            sent_at: new Date().toISOString()
          });

          console.log(`[send-payment-reminders] Sent ${reminderType} reminder to ${tenant.full_name}`);

        } catch (sendError) {
          console.error(`[send-payment-reminders] Error sending reminder:`, sendError);
          results.errors++;
        }
      }
    }

    console.log(`[send-payment-reminders] Results:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        date: today.toISOString(),
        results
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[send-payment-reminders] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
