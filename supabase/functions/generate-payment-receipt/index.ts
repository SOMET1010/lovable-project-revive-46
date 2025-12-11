import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReceiptRequest {
  paymentId: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { paymentId }: ReceiptRequest = await req.json();

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: "paymentId requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-payment-receipt] Generating receipt for payment: ${paymentId}`);

    // Fetch payment with related data
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select(`
        *,
        contract:lease_contracts(
          id,
          contract_number,
          monthly_rent,
          property:properties(
            id,
            title,
            address,
            city
          )
        )
      `)
      .eq("id", paymentId)
      .maybeSingle();

    if (paymentError || !payment) {
      console.error("[generate-payment-receipt] Payment not found:", paymentError);
      return new Response(
        JSON.stringify({ error: "Paiement non trouvé" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get payer profile
    const { data: payerProfile } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("user_id", payment.payer_id)
      .maybeSingle();

    // Get receiver profile (owner)
    const { data: receiverProfile } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("user_id", payment.receiver_id)
      .maybeSingle();

    // Generate receipt number
    const { data: receiptNumberData } = await supabase.rpc("generate_receipt_number");
    const receiptNumber = receiptNumberData || `REC-${Date.now()}`;

    // Build receipt HTML for PDF generation
    const receiptDate = new Date().toLocaleDateString("fr-CI", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    const property = payment.contract?.property;
    const contract = payment.contract;

    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #F16522; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #2C1810; }
    .logo span { color: #F16522; }
    .receipt-number { font-size: 14px; color: #666; margin-top: 10px; }
    .title { font-size: 24px; font-weight: bold; color: #2C1810; margin: 20px 0; text-align: center; }
    .section { margin: 20px 0; padding: 20px; background: #FAF7F4; border-radius: 8px; }
    .section-title { font-size: 14px; font-weight: bold; color: #F16522; margin-bottom: 15px; text-transform: uppercase; }
    .row { display: flex; justify-content: space-between; margin: 8px 0; }
    .label { color: #666; }
    .value { font-weight: 500; color: #2C1810; }
    .amount { font-size: 32px; font-weight: bold; color: #F16522; text-align: center; margin: 30px 0; }
    .amount span { font-size: 16px; color: #666; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
    .footer p { color: #666; font-size: 12px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-ansut { background: #F16522; color: white; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Mon<span>Toit</span></div>
    <div class="receipt-number">Reçu N° ${receiptNumber}</div>
    <div class="receipt-number">${receiptDate}</div>
  </div>

  <div class="title">REÇU DE PAIEMENT</div>

  <div class="amount">
    ${payment.amount?.toLocaleString("fr-CI")} <span>FCFA</span>
  </div>

  <div class="section">
    <div class="section-title">Locataire</div>
    <div class="row">
      <span class="label">Nom</span>
      <span class="value">${payerProfile?.full_name || "N/A"}</span>
    </div>
    <div class="row">
      <span class="label">Téléphone</span>
      <span class="value">${payerProfile?.phone || "N/A"}</span>
    </div>
    <div class="row">
      <span class="label">Email</span>
      <span class="value">${payerProfile?.email || "N/A"}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Propriété</div>
    <div class="row">
      <span class="label">Bien</span>
      <span class="value">${property?.title || "N/A"}</span>
    </div>
    <div class="row">
      <span class="label">Adresse</span>
      <span class="value">${property?.address || ""}, ${property?.city || ""}</span>
    </div>
    <div class="row">
      <span class="label">N° Contrat</span>
      <span class="value">${contract?.contract_number || "N/A"}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Détails du paiement</div>
    <div class="row">
      <span class="label">Type</span>
      <span class="value">${payment.payment_type || "Loyer"}</span>
    </div>
    <div class="row">
      <span class="label">Méthode</span>
      <span class="value">${payment.payment_method || "Mobile Money"}</span>
    </div>
    <div class="row">
      <span class="label">Référence</span>
      <span class="value">${payment.transaction_ref || "N/A"}</span>
    </div>
    <div class="row">
      <span class="label">Date de paiement</span>
      <span class="value">${payment.paid_date ? new Date(payment.paid_date).toLocaleDateString("fr-CI") : receiptDate}</span>
    </div>
    <div class="row">
      <span class="label">Statut</span>
      <span class="value"><span class="badge badge-success">Payé</span></span>
    </div>
    ${payment.late_fee_amount > 0 ? `
    <div class="row">
      <span class="label">Pénalités de retard</span>
      <span class="value">${payment.late_fee_amount?.toLocaleString("fr-CI")} FCFA</span>
    </div>
    ` : ""}
  </div>

  <div class="section">
    <div class="section-title">Propriétaire / Bailleur</div>
    <div class="row">
      <span class="label">Nom</span>
      <span class="value">${receiverProfile?.full_name || "N/A"}</span>
    </div>
  </div>

  <div class="footer">
    <p><span class="badge badge-ansut">Certifié Mon Toit</span></p>
    <p>Ce reçu est généré automatiquement par la plateforme Mon Toit.</p>
    <p>Pour toute question, contactez-nous : support@montoit.ci</p>
  </div>
</body>
</html>
    `;

    // Store receipt as HTML in storage (in production, use a PDF service)
    const receiptFileName = `receipts/${paymentId}/${receiptNumber}.html`;
    
    const { error: uploadError } = await supabase.storage
      .from("lease-documents")
      .upload(receiptFileName, new Blob([receiptHtml], { type: "text/html" }), {
        contentType: "text/html",
        upsert: true
      });

    if (uploadError) {
      console.error("[generate-payment-receipt] Upload error:", uploadError);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("lease-documents")
      .getPublicUrl(receiptFileName);

    const receiptUrl = urlData?.publicUrl;

    // Update payment with receipt info
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        receipt_url: receiptUrl,
        receipt_number: receiptNumber
      })
      .eq("id", paymentId);

    if (updateError) {
      console.error("[generate-payment-receipt] Update error:", updateError);
    }

    // Create notification for payer
    await supabase.from("notifications").insert({
      user_id: payment.payer_id,
      title: "Reçu de paiement disponible",
      message: `Votre reçu de paiement N° ${receiptNumber} est disponible au téléchargement.`,
      type: "payment",
      action_url: `/mes-paiements`,
      metadata: { paymentId, receiptNumber, receiptUrl }
    });

    console.log(`[generate-payment-receipt] Receipt generated: ${receiptNumber}`);

    return new Response(
      JSON.stringify({
        success: true,
        receiptNumber,
        receiptUrl,
        receiptHtml
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[generate-payment-receipt] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
