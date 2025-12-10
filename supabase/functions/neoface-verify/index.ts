import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const NEOFACE_API_BASE = Deno.env.get("NEOFACE_API_BASE") || "https://neoface.aineo.ai/api/v2";
const NEOFACE_TOKEN = Deno.env.get("NEOFACE_BEARER_TOKEN");

// Request timeout (15 seconds)
const TIMEOUT_MS = 15000;

interface UploadDocumentRequest {
  action: 'upload_document';
  cni_photo_url: string;
  user_id: string;
}

interface VerifySelfieBase64Request {
  action: 'verify_selfie_base64';
  document_id: string;
  selfie_base64: string;
  verification_id: string;
}

interface CheckStatusRequest {
  action: 'check_status';
  document_id: string;
  verification_id?: string;
}

// Fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Timeout après ${timeoutMs}ms`);
    }
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Check credentials
  if (!NEOFACE_TOKEN) {
    console.error('[NeoFace] Missing NEOFACE_BEARER_TOKEN');
    return new Response(
      JSON.stringify({ 
        error: 'Configuration NeoFace manquante. Contactez l\'administrateur.',
        provider: 'neoface'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? '',
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ''
    );

    const body = await req.json();
    const { action } = body;

    console.log(`[NeoFace] Action: ${action}`);

    switch (action) {
      case 'upload_document':
        return await handleUploadDocument(body as UploadDocumentRequest, supabase);
      case 'verify_selfie_base64':
        return await handleVerifySelfie(body as VerifySelfieBase64Request, supabase);
      case 'check_status':
        return await handleCheckStatus(body as CheckStatusRequest, supabase);
      default:
        return new Response(
          JSON.stringify({ error: 'Action invalide' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne';
    console.error('[NeoFace] Error:', errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage, provider: 'neoface' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ==================== UPLOAD DOCUMENT ====================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleUploadDocument(
  request: UploadDocumentRequest,
  supabase: any
): Promise<Response> {
  const { cni_photo_url, user_id } = request;
  const startTime = Date.now();

  console.log('[NeoFace] Uploading document for user:', user_id);
  console.log('[NeoFace] CNI URL:', cni_photo_url);

  // Fetch the CNI image
  const imageResponse = await fetchWithTimeout(cni_photo_url, { method: 'GET' });
  if (!imageResponse.ok) {
    throw new Error(`Échec téléchargement image: ${imageResponse.statusText}`);
  }

  const imageBlob = await imageResponse.blob();
  const imageSizeKB = imageBlob.size / 1024;
  console.log(`[NeoFace] Image size: ${imageSizeKB.toFixed(0)}KB`);

  // Validate size (max 5MB)
  if (imageSizeKB > 5120) {
    throw new Error(`Image trop volumineuse (${(imageSizeKB/1024).toFixed(1)}MB). Max: 5MB`);
  }

  // Create FormData (multipart is more reliable than JSON for images)
  const formData = new FormData();
  formData.append("doc_file", imageBlob, "document.jpg");

  // Call NeoFace API
  console.log('[NeoFace] Calling API:', `${NEOFACE_API_BASE}/document_capture`);
  
  const uploadResponse = await fetchWithTimeout(
    `${NEOFACE_API_BASE}/document_capture`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NEOFACE_TOKEN}`,
      },
      body: formData,
    }
  );

  const responseText = await uploadResponse.text();
  console.log('[NeoFace] Upload response status:', uploadResponse.status);
  console.log('[NeoFace] Upload response:', responseText.substring(0, 500));

  if (!uploadResponse.ok) {
    await logServiceUsage(supabase, 'failure', `Upload failed: ${uploadResponse.status}`, startTime);
    throw new Error(`Upload échoué: ${uploadResponse.status}`);
  }

  let uploadData;
  try {
    uploadData = JSON.parse(responseText);
  } catch {
    throw new Error('Réponse NeoFace invalide');
  }

  const documentId = uploadData.document_id;
  if (!documentId) {
    throw new Error('document_id manquant dans la réponse');
  }

  console.log('[NeoFace] Document uploaded:', documentId);

  // Log to database
  let verificationId = null;
  try {
    const { data, error: dbError } = await supabase
      .rpc('log_facial_verification_attempt', {
        p_user_id: user_id,
        p_provider: 'neoface',
        p_document_id: documentId,
        p_document_url: cni_photo_url,
      });
    if (!dbError) verificationId = data;
  } catch (e) {
    console.error('[NeoFace] DB log error:', e);
  }

  await logServiceUsage(supabase, 'success', null, startTime);

  return new Response(
    JSON.stringify({
      success: true,
      document_id: documentId,
      verification_id: verificationId,
      provider: 'neoface',
      message: 'Document téléchargé. Prenez un selfie.',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ==================== VERIFY SELFIE ====================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleVerifySelfie(
  request: VerifySelfieBase64Request,
  supabase: any
): Promise<Response> {
  const { document_id, selfie_base64, verification_id } = request;
  const startTime = Date.now();

  console.log('[NeoFace] Verifying selfie for document:', document_id);
  console.log('[NeoFace] Selfie base64 length:', selfie_base64?.length || 0);

  if (!selfie_base64) {
    throw new Error('Selfie base64 manquant');
  }

  if (!document_id) {
    throw new Error('document_id manquant');
  }

  // Convert base64 to blob
  const binaryString = atob(selfie_base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const selfieBlob = new Blob([bytes], { type: 'image/jpeg' });

  console.log('[NeoFace] Selfie blob size:', (selfieBlob.size / 1024).toFixed(0), 'KB');

  // Create FormData
  const formData = new FormData();
  formData.append("document_id", document_id);
  formData.append("selfie_file", selfieBlob, "selfie.jpg");

  // Call NeoFace API
  console.log('[NeoFace] Calling match_verify API...');
  
  const verifyResponse = await fetchWithTimeout(
    `${NEOFACE_API_BASE}/match_verify`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NEOFACE_TOKEN}`,
      },
      body: formData,
    }
  );

  const responseText = await verifyResponse.text();
  console.log('[NeoFace] Verify response status:', verifyResponse.status);
  console.log('[NeoFace] Verify response:', responseText.substring(0, 500));

  let verifyData;
  try {
    verifyData = JSON.parse(responseText);
  } catch {
    console.error('[NeoFace] Failed to parse verify response');
    throw new Error('Réponse NeoFace invalide');
  }

  // Determine verification result (CDC v3: seuil 85%)
  const isVerified = verifyData.status === 'verified' || 
                     verifyData.match === true || 
                     (verifyData.matching_score && verifyData.matching_score > 0.85);
  
  const matchingScore = verifyData.matching_score || verifyData.score || null;
  const status = isVerified ? 'verified' : 'failed';
  const message = isVerified 
    ? 'Identité vérifiée avec succès' 
    : (verifyData.message || 'Les visages ne correspondent pas');

  console.log('[NeoFace] Final status:', status, 'Score:', matchingScore);

  // Update database
  if (verification_id) {
    try {
      await supabase.rpc('update_facial_verification_status', {
        p_verification_id: verification_id,
        p_status: isVerified ? 'passed' : 'failed',
        p_matching_score: matchingScore,
        p_provider_response: verifyData,
        p_is_match: isVerified,
        p_is_live: isVerified,
        p_failure_reason: !isVerified ? message : null,
      });
    } catch (e) {
      console.error('[NeoFace] DB update error:', e);
    }
  }

  await logServiceUsage(supabase, isVerified ? 'success' : 'failure', !isVerified ? message : null, startTime);

  return new Response(
    JSON.stringify({
      status,
      message,
      matching_score: matchingScore,
      verified_at: isVerified ? new Date().toISOString() : null,
      provider: 'neoface',
    }),
    { 
      status: verifyResponse.ok ? 200 : verifyResponse.status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// ==================== CHECK STATUS ====================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCheckStatus(
  request: CheckStatusRequest,
  supabase: any
): Promise<Response> {
  const { document_id, verification_id } = request;

  console.log('[NeoFace] Checking status for document:', document_id);

  const formData = new FormData();
  formData.append("document_id", document_id);

  const verifyResponse = await fetchWithTimeout(
    `${NEOFACE_API_BASE}/match_verify`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NEOFACE_TOKEN}`,
      },
      body: formData,
    }
  );

  const verifyData = await verifyResponse.json();
  console.log('[NeoFace] Status check result:', verifyData);

  // Update DB if final status
  if (verification_id && (verifyData.status === 'verified' || verifyData.status === 'failed')) {
    try {
      await supabase.rpc('update_facial_verification_status', {
        p_verification_id: verification_id,
        p_status: verifyData.status === 'verified' ? 'passed' : 'failed',
        p_matching_score: verifyData.matching_score || null,
        p_provider_response: verifyData,
        p_is_match: verifyData.status === 'verified',
        p_is_live: verifyData.status === 'verified',
        p_failure_reason: verifyData.status === 'failed' ? verifyData.message : null,
      });
    } catch (e) {
      console.error('[NeoFace] DB update error:', e);
    }
  }

  return new Response(
    JSON.stringify({ ...verifyData, provider: 'neoface' }),
    { status: verifyResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper to log service usage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logServiceUsage(
  supabase: any,
  status: 'success' | 'failure',
  errorMessage: string | null,
  startTime: number
) {
  try {
    await supabase.from('service_usage_logs').insert({
      service_name: 'face_recognition',
      provider: 'neoface',
      status,
      error_message: errorMessage,
      response_time_ms: Date.now() - startTime,
    });
  } catch (e) {
    console.error('[NeoFace] Log error:', e);
  }
}
