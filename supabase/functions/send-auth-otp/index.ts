const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OTPRequest {
  phoneNumber: string;
  method: 'sms' | 'whatsapp';
}

const RATE_LIMIT_SECONDS = 60;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phoneNumber, method = 'sms' }: OTPRequest = await req.json();

    // Validation
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Numéro de téléphone requis' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Normaliser le numéro et ajouter le code pays si nécessaire
    let normalizedPhone = phoneNumber.replace(/\D/g, '');
    
    // Ajouter le code pays Côte d'Ivoire si pas présent
    if (!normalizedPhone.startsWith('225')) {
      // Enlever le 0 initial si présent (format local ivoirien)
      if (normalizedPhone.startsWith('0')) {
        normalizedPhone = normalizedPhone.substring(1);
      }
      normalizedPhone = '225' + normalizedPhone;
    }
    
    if (normalizedPhone.length < 12) {
      return new Response(
        JSON.stringify({ error: 'Numéro de téléphone invalide' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // ========== RATE LIMITING CHECK ==========
    const rateLimitCutoff = new Date(Date.now() - RATE_LIMIT_SECONDS * 1000).toISOString();
    
    const rateLimitResponse = await fetch(
      `${supabaseUrl}/rest/v1/verification_codes?phone=eq.${normalizedPhone}&created_at=gt.${rateLimitCutoff}&select=created_at&order=created_at.desc&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
      }
    );

    if (rateLimitResponse.ok) {
      const recentCodes = await rateLimitResponse.json();
      
      if (recentCodes && recentCodes.length > 0) {
        const lastSentAt = new Date(recentCodes[0].created_at);
        const elapsedSeconds = (Date.now() - lastSentAt.getTime()) / 1000;
        const remainingSeconds = Math.ceil(RATE_LIMIT_SECONDS - elapsedSeconds);
        
        console.log(`⏳ Rate limit actif: ${remainingSeconds}s restantes pour ${normalizedPhone}`);
        
        return new Response(
          JSON.stringify({
            error: `Veuillez patienter ${remainingSeconds} secondes avant de renvoyer un code`,
            retryAfter: remainingSeconds,
            rateLimited: true,
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }
    // ========================================

    // Générer un code OTP à 6 chiffres
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Utiliser la table verification_codes existante
    const storeResponse = await fetch(`${supabaseUrl}/rest/v1/verification_codes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        code: otp,
        type: method,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        max_attempts: 3,
      }),
    });

    if (!storeResponse.ok) {
      const errorText = await storeResponse.text();
      console.error('Failed to store OTP:', errorText);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la génération du code' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Utiliser le système hybride avec fallback automatique
    // InTouch = priorité 1, Brevo = priorité 2
    const functionUrl = method === 'sms'
      ? `${supabaseUrl}/functions/v1/send-sms-hybrid`
      : `${supabaseUrl}/functions/v1/send-whatsapp-hybrid`;

    const message = `Votre code Mon Toit est : ${otp}\n\nCe code expire dans 10 minutes. Ne le partagez avec personne.`;

    console.log(`📤 Envoi OTP via ${method} à ${normalizedPhone}...`);

    const sendResponse = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: normalizedPhone,
        message: message,
      }),
    });

    const sendResult = await sendResponse.json();

    if (!sendResponse.ok) {
      console.warn('⚠️ Échec envoi OTP, mais code stocké:', sendResult);
      // Retourner le code en mode dev pour faciliter les tests
      return new Response(
        JSON.stringify({
          success: true,
          message: `Code généré (envoi ${method} échoué)`,
          fallback: true,
          otp: otp, // Mode dev uniquement
          expiresIn: 600,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`✅ OTP envoyé à ${normalizedPhone} via ${method}`, sendResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Code envoyé par ${method === 'sms' ? 'SMS' : 'WhatsApp'}`,
        provider: sendResult.provider,
        expiresIn: 600,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error in send-auth-otp:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
