/**
 * Edge Function: send-sms-brevo
 * 
 * Point d'entrée unique et sécurisé pour l'envoi de SMS via Brevo.
 * Cette fonction est conçue pour être whitelistée par IP chez Brevo.
 * 
 * Architecture: Frontend → Supabase Edge Function → Brevo API
 * La clé API Brevo n'est JAMAIS exposée côté client.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmsRequest {
  phone: string;    // Format E.164: +2250700000000
  message: string;  // Contenu SMS
  tag?: string;     // Label optionnel (ex: "OTP", "NOTIF")
}

interface SmsResponse {
  status: 'ok' | 'error';
  brevoMessageId?: string;
  reason?: string;
}

/**
 * Valide le format E.164 du numéro de téléphone
 */
function validatePhone(phone: string): boolean {
  // Format E.164: + suivi de 8 à 15 chiffres
  const e164Regex = /^\+[1-9]\d{7,14}$/;
  return e164Regex.test(phone);
}

/**
 * Valide le payload de la requête
 */
function validatePayload(body: unknown): { valid: boolean; error?: string; data?: SmsRequest } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Corps de requête invalide' };
  }

  const { phone, message, tag } = body as Record<string, unknown>;

  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Numéro de téléphone requis' };
  }

  if (!validatePhone(phone)) {
    return { valid: false, error: 'Format de téléphone invalide. Utilisez le format E.164 (ex: +2250700000000)' };
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return { valid: false, error: 'Message requis et non vide' };
  }

  if (message.length > 160) {
    return { valid: false, error: 'Message trop long (max 160 caractères)' };
  }

  return {
    valid: true,
    data: {
      phone: phone.trim(),
      message: message.trim(),
      tag: typeof tag === 'string' ? tag.trim() : undefined,
    },
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ status: 'error', reason: 'Méthode non autorisée' } as SmsResponse),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse request body
    const body = await req.json();
    
    // Validate payload
    const validation = validatePayload(body);
    if (!validation.valid || !validation.data) {
      console.error('[send-sms-brevo] Validation error:', validation.error);
      return new Response(
        JSON.stringify({ status: 'error', reason: validation.error } as SmsResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { phone, message, tag } = validation.data;

    // Get Brevo API key from environment (never from client)
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    if (!brevoApiKey) {
      console.error('[send-sms-brevo] BREVO_API_KEY not configured');
      return new Response(
        JSON.stringify({ status: 'error', reason: 'Service SMS non configuré' } as SmsResponse),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare Brevo request
    const brevoPayload = {
      sender: 'ANSUT',
      recipient: phone,
      content: message,
      type: 'transactional',
      ...(tag && { tag }),
    };

    console.log('[send-sms-brevo] Sending SMS to:', phone.substring(0, 6) + '****');

    // Call Brevo SMS API
    const brevoResponse = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    });

    const brevoData = await brevoResponse.json();

    // Log response (without sensitive data)
    console.log('[send-sms-brevo] Brevo response status:', brevoResponse.status);
    
    if (!brevoResponse.ok) {
      console.error('[send-sms-brevo] Brevo error:', JSON.stringify(brevoData).substring(0, 200));
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          reason: brevoData.message || 'Erreur lors de l\'envoi du SMS' 
        } as SmsResponse),
        { status: brevoResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[send-sms-brevo] SMS sent successfully, messageId:', brevoData.messageId);

    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        brevoMessageId: brevoData.messageId 
      } as SmsResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[send-sms-brevo] Unexpected error:', error instanceof Error ? error.message : 'Unknown');
    return new Response(
      JSON.stringify({ status: 'error', reason: 'Erreur interne du service SMS' } as SmsResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
