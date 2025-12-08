import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CRYPTONEO_BASE_URL = Deno.env.get('CRYPTONEO_BASE_URL');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leaseId, otp } = await req.json();

    if (!otp) {
      return new Response(
        JSON.stringify({ error: 'Code OTP requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!leaseId) {
      return new Response(
        JSON.stringify({ error: 'leaseId requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔐 Signature électronique CryptoNeo pour contrat:', leaseId);

    // 1. Récupérer le contrat depuis lease_contracts
    const { data: lease, error: leaseError } = await supabaseAdmin
      .from('lease_contracts')
      .select('*, properties(city)')
      .eq('id', leaseId)
      .single();

    if (leaseError || !lease) {
      console.error('Contrat non trouvé:', leaseError);
      return new Response(
        JSON.stringify({ error: 'Contrat non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que les deux parties ont signé (signature simple)
    if (!lease.landlord_signed_at || !lease.tenant_signed_at) {
      return new Response(
        JSON.stringify({ error: 'Les deux parties doivent avoir signé (signature simple) d\'abord' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que le PDF existe
    if (!lease.document_url) {
      return new Response(
        JSON.stringify({ error: 'Le PDF du bail doit être généré' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Vérifier ou auto-générer le certificat
    let certificate = await supabaseAdmin
      .from('digital_certificates')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!certificate.data) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('oneci_verified')
        .eq('user_id', user.id)
        .single();

      if (profile?.oneci_verified) {
        console.log('🔑 Auto-génération du certificat pour:', user.id);
        const genResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/cryptoneo-generate-certificate`, {
          method: 'POST',
          headers: { 
            Authorization: req.headers.get('Authorization')!,
            'Content-Type': 'application/json'
          }
        });
        
        if (!genResponse.ok) {
          return new Response(
            JSON.stringify({ error: 'Échec génération automatique du certificat' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        certificate = await supabaseAdmin
          .from('digital_certificates')
          .select('*')
          .eq('user_id', user.id)
          .single();
      } else {
        return new Response(
          JSON.stringify({ error: 'Certificat actif requis. Vérification ONECI nécessaire.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 3. Télécharger le PDF depuis le storage
    let pdfBlob;
    const pdfPath = lease.document_url;

    if (pdfPath.includes('http')) {
      const pdfResponse = await fetch(pdfPath);
      if (!pdfResponse.ok) {
        throw new Error('Échec téléchargement du PDF depuis URL');
      }
      pdfBlob = await pdfResponse.blob();
    } else {
      const pathParts = pdfPath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      const { data: downloadedBlob, error: downloadError } = await supabaseAdmin.storage
        .from('lease-documents')
        .download(fileName);

      if (downloadError || !downloadedBlob) {
        console.error('Error downloading PDF:', downloadError);
        return new Response(
          JSON.stringify({ error: 'Échec téléchargement du PDF' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      pdfBlob = downloadedBlob;
    }

    // 4. Obtenir le token JWT CryptoNeo
    const authResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/cryptoneo-auth`, {
      headers: { Authorization: req.headers.get('Authorization')! }
    });
    
    if (!authResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Échec authentification CryptoNeo' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { token: jwt } = await authResponse.json();

    // 5. Préparer FormData pour CryptoNeo
    const formData = new FormData();
    formData.append('files', pdfBlob, `contrat_${leaseId}.pdf`);
    formData.append('certificateId', certificate.data.certificate_id);
    formData.append('otp', otp);
    formData.append('callbackUrl', `${Deno.env.get('SUPABASE_URL')}/functions/v1/cryptoneo-callback`);

    console.log('📤 Envoi de la requête de signature à CryptoNeo...');

    // 6. Appeler l'API CryptoNeo sign
    const signResponse = await fetch(`${CRYPTONEO_BASE_URL}/sign/signFileBatch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`
      },
      body: formData
    });

    if (!signResponse.ok) {
      const error = await signResponse.text();
      console.error('CryptoNeo signature failed:', error);
      
      if (error.includes('OTP') || error.includes('8006')) {
        return new Response(
          JSON.stringify({ error: 'Code OTP invalide ou expiré' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Échec signature CryptoNeo' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const signData = await signResponse.json();
    
    if (signData.statusCode !== 7004) {
      return new Response(
        JSON.stringify({ error: signData.statusMessage || 'Échec signature' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const operationId = signData.data?.operationId;
    
    if (!operationId) {
      return new Response(
        JSON.stringify({ error: 'Operation ID manquant dans la réponse CryptoNeo' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Signature initiée avec succès. Operation ID:', operationId);

    // 7. Mettre à jour le contrat avec l'operation ID
    await supabaseAdmin
      .from('lease_contracts')
      .update({
        cryptoneo_operation_id: operationId,
        cryptoneo_signature_status: 'processing'
      })
      .eq('id', leaseId);

    // 8. Créer des notifications
    await supabaseAdmin.from('notifications').insert([
      {
        user_id: lease.owner_id,
        type: 'contract',
        title: 'Signature en cours',
        message: 'La signature électronique du bail est en cours de traitement.',
        action_url: `/contrat/${leaseId}`
      },
      {
        user_id: lease.tenant_id,
        type: 'contract',
        title: 'Signature en cours',
        message: 'La signature électronique du bail est en cours de traitement.',
        action_url: `/contrat/${leaseId}`
      }
    ]);

    // 9. Logger dans les audit logs
    await supabaseAdmin.from('admin_audit_logs').insert({
      user_id: user.id,
      action: 'lease_signature_initiated',
      entity_type: 'lease_contract',
      entity_id: leaseId,
      details: { operationId }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        operationId,
        message: 'Signature en cours de traitement. Vous serez notifié une fois terminée.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in cryptoneo-sign-document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
