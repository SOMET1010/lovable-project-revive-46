import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CertifyRequest {
  leaseId: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { leaseId }: CertifyRequest = await req.json();

    if (!leaseId) {
      return new Response(
        JSON.stringify({ error: "leaseId requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[ansut-certify-contract] Certifying lease: ${leaseId}`);

    // Fetch lease contract with related data
    const { data: lease, error: leaseError } = await supabase
      .from("lease_contracts")
      .select(`
        *,
        property:properties(
          id,
          title,
          address,
          city,
          ansut_verified
        ),
        tenant:profiles!lease_contracts_tenant_id_fkey(
          user_id,
          full_name,
          oneci_verified,
          is_verified
        )
      `)
      .eq("id", leaseId)
      .maybeSingle();

    if (leaseError || !lease) {
      console.error("[ansut-certify-contract] Lease not found:", leaseError);
      return new Response(
        JSON.stringify({ error: "Contrat non trouvé" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify contract is signed
    if (!lease.is_electronically_signed && !lease.signed_at) {
      return new Response(
        JSON.stringify({ error: "Le contrat doit être signé avant certification" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify both parties have signed
    if (!lease.landlord_signed_at || !lease.tenant_signed_at) {
      return new Response(
        JSON.stringify({ 
          error: "Les deux parties doivent signer avant certification",
          landlordSigned: !!lease.landlord_signed_at,
          tenantSigned: !!lease.tenant_signed_at
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already certified
    if (lease.ansut_certified_at) {
      return new Response(
        JSON.stringify({
          success: true,
          alreadyCertified: true,
          certifiedAt: lease.ansut_certified_at,
          message: "Ce contrat est déjà certifié ANSUT"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate certification score
    let certificationScore = 0;
    const certificationDetails: Record<string, boolean> = {};

    // Contract completeness (40 points)
    if (lease.contract_number) {
      certificationScore += 10;
      certificationDetails.hasContractNumber = true;
    }
    if (lease.monthly_rent && lease.deposit_amount !== null) {
      certificationScore += 10;
      certificationDetails.hasFinancialTerms = true;
    }
    if (lease.start_date && lease.end_date) {
      certificationScore += 10;
      certificationDetails.hasDates = true;
    }
    if (lease.document_url || lease.signed_document_url || lease.cryptoneo_signed_document_url) {
      certificationScore += 10;
      certificationDetails.hasDocument = true;
    }

    // Electronic signature (30 points)
    if (lease.is_electronically_signed || lease.cryptoneo_signature_status === "completed") {
      certificationScore += 30;
      certificationDetails.hasElectronicSignature = true;
    }

    // Property verification (15 points)
    if (lease.property?.ansut_verified) {
      certificationScore += 15;
      certificationDetails.propertyVerified = true;
    }

    // Tenant verification (15 points)
    if (lease.tenant?.is_verified || lease.tenant?.oneci_verified) {
      certificationScore += 15;
      certificationDetails.tenantVerified = true;
    }

    // Determine certification status
    let certificationStatus: string;
    if (certificationScore >= 85) {
      certificationStatus = "certified";
    } else if (certificationScore >= 60) {
      certificationStatus = "partial";
    } else {
      certificationStatus = "pending";
    }

    // Generate certification reference
    const certificationRef = `ANSUT-${new Date().getFullYear()}-${leaseId.slice(0, 8).toUpperCase()}`;

    // Update lease contract
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("lease_contracts")
      .update({
        ansut_certified_at: certificationStatus === "certified" ? now : null,
        certification_status: certificationStatus
      })
      .eq("id", leaseId);

    if (updateError) {
      console.error("[ansut-certify-contract] Update error:", updateError);
      throw updateError;
    }

    // Create audit log
    await supabase.from("admin_audit_logs").insert({
      action: "ansut_certification",
      entity_type: "lease_contract",
      entity_id: leaseId,
      details: {
        certificationStatus,
        certificationScore,
        certificationDetails,
        certificationRef
      }
    });

    // Notify both parties
    const notificationMessage = certificationStatus === "certified"
      ? `Votre contrat ${lease.contract_number} a été certifié ANSUT (Réf: ${certificationRef}).`
      : `Votre contrat ${lease.contract_number} est en cours de vérification ANSUT (Score: ${certificationScore}%).`;

    // Notify tenant
    await supabase.from("notifications").insert({
      user_id: lease.tenant_id,
      title: certificationStatus === "certified" ? "Contrat certifié ANSUT" : "Certification ANSUT en cours",
      message: notificationMessage,
      type: "contract",
      action_url: `/contrat/${leaseId}`,
      metadata: { leaseId, certificationStatus, certificationRef }
    });

    // Notify owner
    await supabase.from("notifications").insert({
      user_id: lease.owner_id,
      title: certificationStatus === "certified" ? "Contrat certifié ANSUT" : "Certification ANSUT en cours",
      message: notificationMessage,
      type: "contract",
      action_url: `/contrat/${leaseId}`,
      metadata: { leaseId, certificationStatus, certificationRef }
    });

    console.log(`[ansut-certify-contract] Certification complete: ${certificationStatus} (score: ${certificationScore})`);

    return new Response(
      JSON.stringify({
        success: true,
        leaseId,
        certificationStatus,
        certificationScore,
        certificationRef: certificationStatus === "certified" ? certificationRef : null,
        certificationDetails,
        message: certificationStatus === "certified"
          ? "Contrat certifié ANSUT avec succès"
          : `Certification partielle (${certificationScore}%). Complétez les vérifications manquantes.`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[ansut-certify-contract] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
