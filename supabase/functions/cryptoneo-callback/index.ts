import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operationId, status, signedFiles } = await req.json();

    console.log('📥 Callback CryptoNeo reçu:', { operationId, status });

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Trouver le contrat par operationId dans lease_contracts
    const { data: lease, error: leaseError } = await supabaseAdmin
      .from('lease_contracts')
      .select('*')
      .eq('cryptoneo_operation_id', operationId)
      .single();

    if (leaseError || !lease) {
      console.error('Contrat non trouvé pour operationId:', operationId);
      return new Response(
        JSON.stringify({ error: 'Contrat non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Contrat trouvé:', lease.id);

    if (status === 'completed' && signedFiles && signedFiles.length > 0) {
      console.log('📄 Signature réussie, téléchargement du document signé...');

      const signedFile = signedFiles[0];
      
      // 2. Télécharger le PDF signé depuis CryptoNeo
      const signedPdfResponse = await fetch(signedFile.downloadUrl);
      if (!signedPdfResponse.ok) {
        throw new Error('Échec téléchargement du PDF signé');
      }

      const signedPdfBlob = await signedPdfResponse.blob();
      const signedPdfBuffer = await signedPdfBlob.arrayBuffer();

      // 3. Upload vers Supabase Storage
      const fileName = `${lease.id}_signed_${Date.now()}.pdf`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('lease-documents')
        .upload(fileName, signedPdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error('Erreur upload Storage:', uploadError);
        throw uploadError;
      }

      // 4. Obtenir l'URL publique
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('lease-documents')
        .getPublicUrl(fileName);

      console.log('✅ Document signé uploadé:', publicUrl);

      // 5. Mettre à jour le contrat avec le document signé
      const { error: updateError } = await supabaseAdmin
        .from('lease_contracts')
        .update({
          cryptoneo_signed_document_url: publicUrl,
          signed_document_url: publicUrl,
          cryptoneo_signature_status: 'completed',
          cryptoneo_callback_received_at: new Date().toISOString(),
          is_electronically_signed: true,
          landlord_cryptoneo_signature_at: new Date().toISOString(),
          tenant_cryptoneo_signature_at: new Date().toISOString(),
          certification_status: 'certified',
          ansut_certified_at: new Date().toISOString(),
          status: 'actif'
        })
        .eq('id', lease.id);

      if (updateError) {
        console.error('Erreur mise à jour contrat:', updateError);
        throw updateError;
      }

      // 6. Créer des notifications pour les deux parties
      await supabaseAdmin.from('notifications').insert([
        {
          user_id: lease.owner_id,
          type: 'contract',
          title: 'Bail signé électroniquement',
          message: 'Le bail a été signé électroniquement avec succès via CryptoNeo.',
          action_url: `/contrat/${lease.id}`
        },
        {
          user_id: lease.tenant_id,
          type: 'contract',
          title: 'Bail signé électroniquement',
          message: 'Le bail a été signé électroniquement avec succès via CryptoNeo.',
          action_url: `/contrat/${lease.id}`
        }
      ]);

      // 7. Logger dans les audit logs
      await supabaseAdmin.from('admin_audit_logs').insert({
        user_id: lease.owner_id,
        action: 'lease_electronically_signed',
        entity_type: 'lease_contract',
        entity_id: lease.id,
        details: { operationId, signedDocumentUrl: publicUrl }
      });

      console.log('✅ Callback traité avec succès pour contrat:', lease.id);

    } else if (status === 'failed') {
      console.error('❌ Signature échouée pour operationId:', operationId);

      // Mettre à jour le contrat avec le statut échec
      await supabaseAdmin
        .from('lease_contracts')
        .update({
          cryptoneo_signature_status: 'failed',
          cryptoneo_callback_received_at: new Date().toISOString()
        })
        .eq('id', lease.id);

      // Créer des notifications d'échec
      await supabaseAdmin.from('notifications').insert([
        {
          user_id: lease.owner_id,
          type: 'contract',
          title: 'Échec signature électronique',
          message: 'La signature électronique du bail a échoué. Veuillez réessayer.',
          action_url: `/contrat/${lease.id}`
        },
        {
          user_id: lease.tenant_id,
          type: 'contract',
          title: 'Échec signature électronique',
          message: 'La signature électronique du bail a échoué. Veuillez réessayer.',
          action_url: `/contrat/${lease.id}`
        }
      ]);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Callback traité' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in cryptoneo-callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
