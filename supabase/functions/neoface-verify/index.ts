import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const NEOFACE_API_BASE = Deno.env.get("NEOFACE_API_BASE") || "https://neoface.aineo.ai/api/v2";
const NEOFACE_TOKEN = Deno.env.get("NEOFACE_BEARER_TOKEN");

// NeoFace V2 accepts up to 10MB, we use 5MB as safety margin
const MAX_IMAGE_SIZE_MB = 5;

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
  error?: string;
}

interface NeofaceVerifyResponse {
  status: 'waiting' | 'verified' | 'failed';
  message: string;
  document_id: string;
  matching_score?: number;
  verified_at?: string;
  error?: string;
}

// Helper to convert blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to get MIME type from blob or filename
function getMimeType(blob: Blob, filename: string): string {
  if (blob.type && blob.type !== 'application/octet-stream') {
    return blob.type;
  }
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return 'image/jpeg'; // default
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Vérifier que les credentials NeoFace sont configurés
  if (!NEOFACE_TOKEN) {
    console.error('[NeoFace] Missing NEOFACE_BEARER_TOKEN');
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<Response> {
  const { cni_photo_url, user_id } = request;
  const startTime = Date.now();

  console.log('[NeoFace] Uploading document for user:', user_id);
  console.log('[NeoFace] Image URL:', cni_photo_url);

  // Télécharger l'image CNI
  const imageResponse = await fetch(cni_photo_url);
  if (!imageResponse.ok) {
    throw new Error(`Échec téléchargement de l'image: ${imageResponse.statusText}`);
  }

  const imageBlob = await imageResponse.blob();
  const imageSizeKB = imageBlob.size / 1024;
  const imageSizeMB = imageSizeKB / 1024;
  
  console.log(`[NeoFace] Image fetched, size: ${imageSizeKB.toFixed(0)}KB (${imageSizeMB.toFixed(2)}MB)`);

  // Validate image size (NeoFace accepts up to 10MB, we use 5MB safety margin)
  if (imageSizeMB > MAX_IMAGE_SIZE_MB) {
    console.error(`[NeoFace] Image too large: ${imageSizeMB.toFixed(2)}MB > ${MAX_IMAGE_SIZE_MB}MB limit`);
    throw new Error(`Image trop volumineuse (${imageSizeMB.toFixed(1)}MB). Maximum autorisé: ${MAX_IMAGE_SIZE_MB}MB.`);
  }

  // Convert to Base64 for JSON payload (more reliable than multipart for large files)
  const base64Data = await blobToBase64(imageBlob);
  const mimeType = getMimeType(imageBlob, 'cni.jpg');
  
  console.log('[NeoFace] Converted to base64, mime type:', mimeType);

  // Prepare JSON payload with Base64 (as per NeoFace V2 API documentation)
  const payload = {
    doc_file: {
      name: "document.jpg",
      data: base64Data,
      mime_type: mimeType
    }
  };

  // Call NeoFace API with Bearer token in header
  const uploadResponse = await fetch(`${NEOFACE_API_BASE}/document_capture`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NEOFACE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await uploadResponse.text();
  console.log('[NeoFace] Upload response status:', uploadResponse.status);
  console.log('[NeoFace] Upload response:', responseText.substring(0, 500));

  if (!uploadResponse.ok) {
    console.error('[NeoFace] Upload failed:', responseText);

    await supabase.from('service_usage_logs').insert({
      service_name: 'face_recognition',
      provider: 'neoface',
      status: 'failure',
      error_message: `Upload failed: ${uploadResponse.status} - ${responseText.substring(0, 200)}`,
      response_time_ms: Date.now() - startTime,
    });

    // Parse error if JSON
    let errorMsg = `NeoFace upload failed: ${uploadResponse.status}`;
    try {
      const errorData = JSON.parse(responseText);
      if (errorData.error) errorMsg = errorData.error;
    } catch {
      // Not JSON, use default message
    }

    throw new Error(errorMsg);
  }

  let uploadData: NeofaceUploadResponse;
  try {
    uploadData = JSON.parse(responseText);
  } catch {
    throw new Error('Réponse NeoFace invalide');
  }

  console.log('[NeoFace] Document uploaded successfully:', uploadData.document_id);

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
      selfie_url: uploadData.url, // URL for popup selfie capture
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const base64Data = await blobToBase64(selfieBlob);
  const mimeType = getMimeType(selfieBlob, 'selfie.jpg');

  // Prepare JSON payload
  const payload = {
    document_id: document_id,
    selfie_file: {
      name: "selfie.jpg",
      data: base64Data,
      mime_type: mimeType
    }
  };

  // Call NeoFace API for verification
  const verifyResponse = await fetch(`${NEOFACE_API_BASE}/match_verify`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NEOFACE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const verifyData: NeofaceVerifyResponse = await verifyResponse.json();
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<Response> {
  const { document_id, verification_id } = request;
  const startTime = Date.now();

  console.log('[NeoFace] Checking status for document:', document_id);

  // Call NeoFace API to check status (as per V2 documentation)
  const verifyResponse = await fetch(`${NEOFACE_API_BASE}/match_verify`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NEOFACE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
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
