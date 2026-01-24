/**
 * Edge Function: send-sms-ansut
 * 
 * Point d'entrée pour l'envoi de SMS via ANSUT SMS Gateway.
 * Remplace Brevo comme provider SMS secondaire.
 * 
 * ARCHITECTURE:
 * - Frontend → send-sms-hybrid (orchestrateur) → send-sms-ansut
 * - Ou appel direct pour tests/diagnostics
 * 
 * SECRETS REQUIS (à configurer après réception doc API):
 * - ANSUT_SMS_API_URL: URL de l'endpoint ANSUT
 * - ANSUT_SMS_API_KEY: Clé API ou token
 * - ANSUT_SMS_USERNAME: Identifiant (si Basic Auth)
 * - ANSUT_SMS_PASSWORD: Mot de passe (si Basic Auth)
 * - ANSUT_SMS_SENDER_ID: Expéditeur affiché (default: MonToit)
 * 
 * STATUS: Template préparé - En attente documentation API ANSUT
 */

import { edgeLogger } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FETCH_TIMEOUT_MS = 10000; // 10 seconds timeout

interface ANSUTSmsRequest {
  phone: string;        // Format à confirmer avec doc ANSUT
  message: string;
  sender?: string;
  // TODO: Ajouter les champs requis par l'API ANSUT
}

interface ANSUTSmsResponse {
  status: 'ok' | 'error';
  messageId?: string;
  reason?: string;
  provider: 'ansut';
}

// TODO: Définir l'interface de réponse ANSUT selon la doc API
interface ANSUTApiResponse {
  success?: boolean;
  message_id?: string;
  id?: string;
  transaction_id?: string;
  error?: string;
  // Champs à compléter après réception documentation
}

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout(
  url: string, 
  options: RequestInit, 
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { 
      ...options, 
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Valide le format du numéro de téléphone ivoirien
 */
function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  const validPrefixes = ['07', '05', '054', '055', '056', '01', '227'];
  return validPrefixes.some(prefix =>
    cleaned.startsWith(prefix) || cleaned.startsWith('225' + prefix)
  );
}

/**
 * Formate le numéro au format E.164 (+225...)
 */
function formatPhoneE164(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '225' + cleaned;
  }

  if (!cleaned.startsWith('225')) {
    cleaned = '225' + cleaned;
  }

  return '+' + cleaned;
}

/**
 * Envoie le SMS via l'API ANSUT
 * TODO: Implémenter après réception documentation API
 */
async function sendToANSUT(
  phone: string, 
  message: string, 
  sender: string
): Promise<ANSUTApiResponse> {
  // Récupérer les credentials depuis les secrets
  const apiUrl = Deno.env.get('ANSUT_SMS_API_URL');
  const apiKey = Deno.env.get('ANSUT_SMS_API_KEY');
  const username = Deno.env.get('ANSUT_SMS_USERNAME');
  const password = Deno.env.get('ANSUT_SMS_PASSWORD');
  const defaultSender = Deno.env.get('ANSUT_SMS_SENDER_ID') || 'MonToit';

  // Vérification des credentials
  if (!apiUrl) {
    throw new Error('ANSUT_SMS_API_URL non configuré. Documentation API requise.');
  }

  edgeLogger.info('ANSUT SMS request', { 
    phone: phone.substring(0, 6) + '****',
    sender: sender || defaultSender,
    timeout: FETCH_TIMEOUT_MS
  });

  // TODO: Adapter le payload selon documentation API ANSUT
  // Structure hypothétique - À MODIFIER selon specs réelles
  const payload = {
    recipient: phone,
    message: message,
    sender_id: sender || defaultSender,
    // Ajouter les champs requis par ANSUT
  };

  // TODO: Adapter les headers selon type d'auth ANSUT (Bearer, Basic, API Key)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Auth par API Key
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
    // OU headers['X-API-Key'] = apiKey; // selon doc ANSUT
  }

  // Auth Basic (si username/password)
  if (username && password) {
    headers['Authorization'] = `Basic ${btoa(`${username}:${password}`)}`;
  }

  const response = await fetchWithTimeout(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  
  edgeLogger.info('ANSUT SMS response', { 
    status: response.status, 
    body: responseText.substring(0, 500) 
  });

  if (!response.ok) {
    edgeLogger.error('ANSUT SMS error', undefined, { 
      status: response.status, 
      error: responseText 
    });
    throw new Error(`ANSUT SMS failed: ${response.status} - ${responseText.substring(0, 200)}`);
  }

  // Parser la réponse - À adapter selon format ANSUT
  try {
    return JSON.parse(responseText) as ANSUTApiResponse;
  } catch {
    // Si réponse non-JSON, considérer comme succès avec l'ID de transaction généré
    return { 
      success: true, 
      transaction_id: `ANSUT_${Date.now()}_${Math.random().toString(36).substring(2, 8)}` 
    };
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ status: 'error', reason: 'Méthode non autorisée', provider: 'ansut' } as ANSUTSmsResponse),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse request body
    const body = await req.json() as ANSUTSmsRequest;
    const { phone, message, sender } = body;

    // Validation
    if (!phone || !message) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          reason: 'Champs requis manquants: phone, message',
          provider: 'ansut'
        } as ANSUTSmsResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!validatePhoneNumber(phone)) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          reason: 'Format de téléphone invalide',
          provider: 'ansut'
        } as ANSUTSmsResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (message.length > 160) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          reason: 'Message trop long (max 160 caractères)',
          provider: 'ansut'
        } as ANSUTSmsResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Formater le numéro
    const formattedPhone = formatPhoneE164(phone);

    // Envoyer via ANSUT
    const result = await sendToANSUT(formattedPhone, message, sender || 'MonToit');

    // Extraire l'ID du message
    const messageId = result.message_id || result.id || result.transaction_id;

    edgeLogger.info('ANSUT SMS success', { messageId });

    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        messageId,
        provider: 'ansut'
      } as ANSUTSmsResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    edgeLogger.error('ANSUT SMS exception', error instanceof Error ? error : undefined);

    return new Response(
      JSON.stringify({ 
        status: 'error', 
        reason: errorMessage,
        provider: 'ansut'
      } as ANSUTSmsResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
