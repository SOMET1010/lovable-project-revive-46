import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.21.4";
import edgeLogger from "../_shared/logger.ts";

// --- CORS ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// --- CONFIG ---
const NEOFACE_API_BASE = Deno.env.get("NEOFACE_API_BASE") || "https://neoface.aineo.ai/api/v2";
const NEOFACE_TOKEN = Deno.env.get("NEOFACE_BEARER_TOKEN");
const TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;

// --- SCHEMAS ZOD ---
const UploadDocumentSchema = z.object({
  action: z.literal('upload_document'),
  cni_photo_url: z.string().url('URL de la CNI invalide'),
  user_id: z.string().uuid('user_id invalide'),
});

const VerifySelfieSchema = z.object({
  action: z.literal('verify_selfie_base64'),
  document_id: z.string().min(1, 'document_id requis'),
  selfie_base64: z.string().min(1000, 'Image selfie trop petite'),
  verification_id: z.string().optional(),
  user_id: z.string().uuid().optional(),
});

const CheckStatusSchema = z.object({
  action: z.literal('check_status'),
  document_id: z.string().min(1, 'document_id requis'),
  verification_id: z.string().optional(),
  user_id: z.string().uuid().optional(),
});

const RequestSchema = z.discriminatedUnion("action", [
  UploadDocumentSchema,
  VerifySelfieSchema,
  CheckStatusSchema,
]);

// --- FETCH WITH RETRY & EXPONENTIAL BACKOFF ---
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries = MAX_RETRIES, 
  timeoutMs = TIMEOUT_MS
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      
      // Retry uniquement sur erreurs 5xx (serveur NeoFace temporairement down)
      if (response.ok || response.status < 500) {
        return response;
      }
      
      lastError = new Error(`Erreur serveur NeoFace: ${response.status}`);
      edgeLogger.warn(`Tentative ${attempt + 1}/${maxRetries + 1} échouée`, { 
        status: response.status, 
        url 
      });
    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err instanceof Error && err.name === 'AbortError') {
        lastError = new Error(`Timeout après ${timeoutMs}ms`);
      } else {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
      
      edgeLogger.warn(`Tentative ${attempt + 1}/${maxRetries + 1} échouée`, { 
        error: lastError.message 
      });
    }
    
    // Backoff exponentiel : 1s, 2s, 4s...
    if (attempt < maxRetries) {
      const delay = 1000 * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  throw lastError || new Error('Échec après plusieurs tentatives');
}

// --- MAIN HANDLER ---
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Check credentials
  if (!NEOFACE_TOKEN) {
    edgeLogger.error('Configuration manquante', new Error('NEOFACE_BEARER_TOKEN absent'));
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
    
    // Validation Zod
    const parseResult = RequestSchema.safeParse(body);
    if (!parseResult.success) {
      edgeLogger.warn('Validation échouée', { errors: parseResult.error.flatten() });
      return new Response(
        JSON.stringify({ 
          error: 'Paramètres invalides', 
          details: parseResult.error.flatten().fieldErrors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData = parseResult.data;
    edgeLogger.info(`Action: ${requestData.action}`, { action: requestData.action });

    switch (requestData.action) {
      case 'upload_document':
        return await handleUploadDocument(requestData, supabase);
      case 'verify_selfie_base64':
        return await handleVerifySelfie(requestData, supabase);
      case 'check_status':
        return await handleCheckStatus(requestData, supabase);
      default:
        return new Response(
          JSON.stringify({ error: 'Action invalide' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne';
    edgeLogger.error('Erreur Edge Function', error instanceof Error ? error : new Error(errorMessage));

    return new Response(
      JSON.stringify({ error: errorMessage, provider: 'neoface' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ==================== UPLOAD DOCUMENT ====================
async function handleUploadDocument(
  request: z.infer<typeof UploadDocumentSchema>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<Response> {
  const { cni_photo_url, user_id } = request;
  const startTime = Date.now();

  edgeLogger.info('Upload document', { user_id, cni_photo_url });

  // Fetch the CNI image
  const imageResponse = await fetchWithRetry(cni_photo_url, { method: 'GET' });
  if (!imageResponse.ok) {
    throw new Error(`Échec téléchargement image: ${imageResponse.statusText}`);
  }

  const imageBlob = await imageResponse.blob();
  const imageSizeKB = imageBlob.size / 1024;
  edgeLogger.info('Image téléchargée', { sizeKB: imageSizeKB.toFixed(0) });

  // Validate size (max 5MB)
  if (imageSizeKB > 5120) {
    throw new Error(`Image trop volumineuse (${(imageSizeKB/1024).toFixed(1)}MB). Max: 5MB`);
  }

  // Create FormData
  const formData = new FormData();
  formData.append("doc_file", imageBlob, "document.jpg");

  // Call NeoFace API with retry
  edgeLogger.info('Appel NeoFace document_capture');
  
  const uploadResponse = await fetchWithRetry(
    `${NEOFACE_API_BASE}/document_capture`,
    {
      method: "POST",
      headers: { "Authorization": `Bearer ${NEOFACE_TOKEN}` },
      body: formData,
    }
  );

  const responseText = await uploadResponse.text();
  edgeLogger.info('Réponse NeoFace', { 
    status: uploadResponse.status, 
    preview: responseText.substring(0, 200) 
  });

  if (!uploadResponse.ok) {
    await logServiceUsage(supabase, 'failure', `Upload failed: ${uploadResponse.status}`, startTime);
    throw new Error(`Upload échoué: ${uploadResponse.status}`);
  }

  let uploadData;
  try {
    uploadData = JSON.parse(responseText);
  } catch {
    throw new Error('Réponse NeoFace invalide (JSON parsing)');
  }

  const documentId = uploadData.document_id;
  const selfieUrl = uploadData.url;

  if (!documentId || !selfieUrl) {
    throw new Error('document_id ou url manquant dans la réponse NeoFace');
  }

  edgeLogger.info('Document uploadé', { documentId, selfieUrl });

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
    edgeLogger.warn('Erreur log DB', { error: e instanceof Error ? e.message : String(e) });
  }

  await logServiceUsage(supabase, 'success', null, startTime);

  return new Response(
    JSON.stringify({
      success: true,
      document_id: documentId,
      selfie_url: selfieUrl,
      verification_id: verificationId,
      provider: 'neoface',
      message: 'Document téléchargé. Prenez un selfie.',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ==================== VERIFY SELFIE ====================
async function handleVerifySelfie(
  request: z.infer<typeof VerifySelfieSchema>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<Response> {
  const { document_id, selfie_base64, verification_id } = request;
  const startTime = Date.now();

  edgeLogger.info('Vérification selfie', { 
    document_id, 
    selfieLength: selfie_base64.length 
  });

  // Convert base64 to blob
  const binaryString = atob(selfie_base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const selfieBlob = new Blob([bytes], { type: 'image/jpeg' });

  edgeLogger.info('Selfie blob créé', { sizeKB: (selfieBlob.size / 1024).toFixed(0) });

  // Create FormData
  const formData = new FormData();
  formData.append("document_id", document_id);
  formData.append("selfie_file", selfieBlob, "selfie.jpg");

  // Call NeoFace API with retry
  edgeLogger.info('Appel NeoFace match_verify');
  
  const verifyResponse = await fetchWithRetry(
    `${NEOFACE_API_BASE}/match_verify`,
    {
      method: "POST",
      headers: { "Authorization": `Bearer ${NEOFACE_TOKEN}` },
      body: formData,
    }
  );

  const responseText = await verifyResponse.text();
  edgeLogger.info('Réponse NeoFace', { 
    status: verifyResponse.status, 
    preview: responseText.substring(0, 200) 
  });

  let verifyData;
  try {
    verifyData = JSON.parse(responseText);
  } catch {
    edgeLogger.error('Parsing JSON échoué', new Error('Invalid JSON response'));
    throw new Error('Réponse NeoFace invalide');
  }

  // Determine verification result (CDC v3: seuil 85%)
  const rawStatus = verifyData.status;
  const matchingScore = verifyData.matching_score || verifyData.score || null;

  let status: 'verified' | 'waiting' | 'failed';
  let message: string;
  let isVerified = false;

  if (rawStatus === 'waiting') {
    status = 'waiting';
    message = 'Vérification en cours, veuillez patienter...';
    edgeLogger.info('Status waiting - polling requis');
  } else if (rawStatus === 'verified' || verifyData.match === true || (matchingScore && matchingScore > 0.85)) {
    status = 'verified';
    message = 'Identité vérifiée avec succès';
    isVerified = true;
  } else {
    status = 'failed';
    message = verifyData.message || 'Les visages ne correspondent pas';
  }

  edgeLogger.info('Résultat final', { status, matchingScore });

  // Update database only for final states (not waiting)
  if (verification_id && status !== 'waiting') {
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
      edgeLogger.warn('Erreur update DB', { error: e instanceof Error ? e.message : String(e) });
    }
  }

  // Only log final states
  if (status !== 'waiting') {
    await logServiceUsage(supabase, isVerified ? 'success' : 'failure', !isVerified ? message : null, startTime);
  }

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
async function handleCheckStatus(
  request: z.infer<typeof CheckStatusSchema>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<Response> {
  const { document_id, verification_id } = request;

  edgeLogger.info('Check status', { document_id });

  const formData = new FormData();
  formData.append("document_id", document_id);

  const verifyResponse = await fetchWithRetry(
    `${NEOFACE_API_BASE}/match_verify`,
    {
      method: "POST",
      headers: { "Authorization": `Bearer ${NEOFACE_TOKEN}` },
      body: formData,
    }
  );

  const verifyData = await verifyResponse.json();
  edgeLogger.info('Résultat check_status', { status: verifyData.status });

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
      edgeLogger.warn('Erreur update DB', { error: e instanceof Error ? e.message : String(e) });
    }
  }

  return new Response(
    JSON.stringify({ ...verifyData, provider: 'neoface' }),
    { status: verifyResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// --- HELPER: LOG SERVICE USAGE ---
async function logServiceUsage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    edgeLogger.warn('Log service usage error', { error: e instanceof Error ? e.message : String(e) });
  }
}
