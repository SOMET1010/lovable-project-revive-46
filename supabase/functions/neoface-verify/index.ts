import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const NEOFACE_API_BASE = Deno.env.get("NEOFACE_API_BASE");
const NEOFACE_TOKEN = Deno.env.get("NEOFACE_BEARER_TOKEN");

interface UploadDocumentRequest {
  action: 'upload_document';
  cni_photo_url: string;
  user_id: string;
}

interface VerifySelfieRequest {
  action: 'verify_selfie';
  document_id: string;
  selfie_url: string;
  verification_id: string;
}

interface CheckStatusRequest {
  action: 'check_status';
  document_id: string;
  verification_id?: string;
}

interface NeofaceUploadResponse {
  document_id: string;
  url: string;
  success: boolean;
}

interface NeofaceVerifyResponse {
  status: 'waiting' | 'verified' | 'failed';
  message: string;
  document_id: string;
  matching_score?: number;
  verified_at?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Vérifier que les credentials NeoFace sont configurés
  if (!NEOFACE_API_BASE || !NEOFACE_TOKEN) {
    console.error('[NeoFace] Missing credentials: NEOFACE_API_BASE or NEOFACE_BEARER_TOKEN');
    return new Response(
      JSON.stringify({ 
        error: 'Configuration NeoFace manquante. Veuillez contacter l\'administrateur.',
        provider: 'neoface'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? '',
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ''
    );

    const body = await req.json();
    const { action } = body;

    console.log('[NeoFace] Action:', action);

    if (action === 'upload_document') {
      return await handleUploadDocument(body as UploadDocumentRequest, supabase);
    } else if (action === 'verify_selfie') {
      return await handleVerifySelfie(body as VerifySelfieRequest, supabase);
    } else if (action === 'check_status') {
      return await handleCheckStatus(body as CheckStatusRequest, supabase);
    } else {
      return new Response(
        JSON.stringify({ error: 'Action invalide. Actions: upload_document, verify_selfie, check_status' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: unknown) {
    console.error('[NeoFace] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne';

    return new Response(
      JSON.stringify({
        error: errorMessage,
        provider: 'neoface'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleUploadDocument(
  request: UploadDocumentRequest,
  supabase: any
): Promise<Response> {
  const { cni_photo_url, user_id } = request;
  const startTime = Date.now();

  console.log('[NeoFace] Uploading document for user:', user_id);

  // Télécharger l'image CNI
  const imageResponse = await fetch(cni_photo_url);
  if (!imageResponse.ok) {
    throw new Error(`Échec téléchargement de l'image: ${imageResponse.statusText}`);
  }

  const imageBlob = await imageResponse.blob();
  const imageSizeKB = imageBlob.size / 1024;
  const imageSizeMB = imageSizeKB / 1024;
  
  console.log(`[NeoFace] Image fetched, size: ${imageSizeKB.toFixed(0)}KB (${imageSizeMB.toFixed(2)}MB)`);

  // Validate image size before sending to NeoFace (max 2MB to prevent 413 errors)
  const MAX_SIZE_MB = 2;
  if (imageSizeMB > MAX_SIZE_MB) {
    console.error(`[NeoFace] Image too large: ${imageSizeMB.toFixed(2)}MB > ${MAX_SIZE_MB}MB limit`);
    throw new Error(`Image trop volumineuse (${imageSizeMB.toFixed(1)}MB). Maximum autorisé: ${MAX_SIZE_MB}MB. Veuillez compresser l'image.`);
  }

  // Préparer le FormData pour NeoFace
  const formData = new FormData();
  formData.append("token", NEOFACE_TOKEN!);
  formData.append("doc_file", imageBlob, "cni.jpg");

  // Appeler l'API NeoFace
  const uploadResponse = await fetch(`${NEOFACE_API_BASE}/document_capture`, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('[NeoFace] Upload failed:', errorText);

    await supabase.from('service_usage_logs').insert({
      service_name: 'face_recognition',
      provider: 'neoface',
      status: 'failure',
      error_message: `Upload failed: ${uploadResponse.status} - ${errorText}`,
      response_time_ms: Date.now() - startTime,
    });

    throw new Error(`NeoFace upload failed: ${uploadResponse.status}`);
  }

  const uploadData: NeofaceUploadResponse = await uploadResponse.json();
  console.log('[NeoFace] Document uploaded:', uploadData.document_id);

  // Logger la tentative de vérification
  const { data: verificationId, error: dbError } = await supabase
    .rpc('log_facial_verification_attempt', {
      p_user_id: user_id,
      p_provider: 'neoface',
      p_document_id: uploadData.document_id,
      p_document_url: cni_photo_url,
    });

  if (dbError) {
    console.error('[NeoFace] Failed to log verification attempt:', dbError);
  }

  await supabase.from('service_usage_logs').insert({
    service_name: 'face_recognition',
    provider: 'neoface',
    status: 'success',
    response_time_ms: Date.now() - startTime,
  });

  return new Response(
    JSON.stringify({
      success: true,
      document_id: uploadData.document_id,
      verification_id: verificationId,
      provider: 'neoface',
      message: 'Document téléchargé. Veuillez prendre un selfie pour la vérification.',
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function handleVerifySelfie(
  request: VerifySelfieRequest,
  supabase: any
): Promise<Response> {
  const { document_id, selfie_url, verification_id } = request;
  const startTime = Date.now();

  console.log('[NeoFace] Verifying selfie for document:', document_id);

  // Télécharger le selfie
  const selfieResponse = await fetch(selfie_url);
  if (!selfieResponse.ok) {
    throw new Error(`Échec téléchargement du selfie: ${selfieResponse.statusText}`);
  }

  const selfieBlob = await selfieResponse.blob();

  // Préparer le FormData pour NeoFace
  const formData = new FormData();
  formData.append("token", NEOFACE_TOKEN!);
  formData.append("document_id", document_id);
  formData.append("selfie_file", selfieBlob, "selfie.jpg");

  // Appeler l'API NeoFace pour la vérification
  const verifyResponse = await fetch(`${NEOFACE_API_BASE}/match_verify`, {
    method: "POST",
    body: formData,
  });

  const verifyData = await verifyResponse.json();
  console.log('[NeoFace] Verification result:', verifyData);

  // Mettre à jour le statut de vérification
  if (verification_id) {
    const dbStatus = verifyData.status === 'verified' ? 'passed' : 
                     verifyData.status === 'failed' ? 'failed' : 'pending';

    await supabase.rpc('update_facial_verification_status', {
      p_verification_id: verification_id,
      p_status: dbStatus,
      p_matching_score: verifyData.matching_score || null,
      p_provider_response: verifyData,
      p_is_match: verifyData.status === 'verified',
      p_is_live: verifyData.status === 'verified',
      p_failure_reason: verifyData.status === 'failed' ? verifyData.message : null,
    });
  }

  await supabase.from('service_usage_logs').insert({
    service_name: 'face_recognition',
    provider: 'neoface',
    status: verifyData.status === 'verified' ? 'success' : 'failure',
    error_message: verifyData.status === 'failed' ? verifyData.message : null,
    response_time_ms: Date.now() - startTime,
  });

  return new Response(
    JSON.stringify({
      ...verifyData,
      provider: 'neoface',
    }),
    {
      status: verifyResponse.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function handleCheckStatus(
  request: CheckStatusRequest,
  supabase: any
): Promise<Response> {
  const { document_id, verification_id } = request;
  const startTime = Date.now();

  console.log('[NeoFace] Checking status for document:', document_id);

  // Appeler l'API NeoFace pour vérifier le statut
  const verifyResponse = await fetch(`${NEOFACE_API_BASE}/match_verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: NEOFACE_TOKEN,
      document_id: document_id,
    }),
  });

  const statusCode = verifyResponse.status;
  const verifyData: NeofaceVerifyResponse = await verifyResponse.json();

  console.log('[NeoFace] Status check result:', verifyData.status);

  // Mettre à jour si le statut a changé
  if (verification_id && (verifyData.status === 'verified' || verifyData.status === 'failed')) {
    const dbStatus = verifyData.status === 'verified' ? 'passed' : 'failed';

    await supabase.rpc('update_facial_verification_status', {
      p_verification_id: verification_id,
      p_status: dbStatus,
      p_matching_score: verifyData.matching_score || null,
      p_provider_response: verifyData,
      p_is_match: verifyData.status === 'verified',
      p_is_live: verifyData.status === 'verified',
      p_failure_reason: verifyData.status === 'failed' ? verifyData.message : null,
    });

    await supabase.from('service_usage_logs').insert({
      service_name: 'face_recognition',
      provider: 'neoface',
      status: verifyData.status === 'verified' ? 'success' : 'failure',
      error_message: verifyData.status === 'failed' ? verifyData.message : null,
      response_time_ms: Date.now() - startTime,
    });
  }

  return new Response(
    JSON.stringify({
      ...verifyData,
      provider: 'neoface',
    }),
    {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
