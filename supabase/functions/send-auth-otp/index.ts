import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OTPRequest {
  phoneNumber: string;
  method: 'sms' | 'whatsapp';
  mode: 'login' | 'register';
  fullName?: string;
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
    const { phoneNumber, method = 'sms', mode = 'login', fullName }: OTPRequest = await req.json();

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

    // Normaliser le numéro
    let normalizedPhone = phoneNumber.replace(/\D/g, '');
    
    if (!normalizedPhone.startsWith('225')) {
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
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // ========== MODE LOGIN: VÉRIFIER QUE LE COMPTE EXISTE ==========
    if (mode === 'login') {
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('phone', normalizedPhone)
        .maybeSingle();

      if (!existingProfile) {
        console.log(`[SEND-OTP] Mode login: aucun compte trouvé pour ${normalizedPhone}`);
        return new Response(
          JSON.stringify({ 
            error: 'Aucun compte associé à ce numéro. Veuillez vous inscrire.',
            accountNotFound: true,
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      console.log(`[SEND-OTP] Mode login: compte trouvé pour ${normalizedPhone}`);
    }

    // ========== MODE REGISTER: VÉRIFIER QUE LE COMPTE N'EXISTE PAS ==========
    if (mode === 'register') {
      if (!fullName?.trim()) {
        return new Response(
          JSON.stringify({ error: 'Nom complet requis pour l\'inscription' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('phone', normalizedPhone)
        .maybeSingle();

      if (existingProfile) {
        console.log(`[SEND-OTP] Mode register: compte existant pour ${normalizedPhone}`);
        return new Response(
          JSON.stringify({ 
            error: 'Ce numéro est déjà associé à un compte. Connectez-vous.',
            accountExists: true,
          }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      console.log(`[SEND-OTP] Mode register: nouveau numéro ${normalizedPhone}`);
    }

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
        
        console.log(`⏳ Rate limit actif: ${remainingSeconds}s pour ${normalizedPhone}`);
        
        return new Response(
          JSON.stringify({
            error: `Veuillez patienter ${remainingSeconds} secondes`,
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

    // ========== GÉNÉRER ET STOCKER L'OTP ==========
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

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

    // ========== ENVOYER L'OTP VIA SMS/WHATSAPP ==========
    const functionUrl = method === 'sms'
      ? `${supabaseUrl}/functions/v1/send-sms-hybrid`
      : `${supabaseUrl}/functions/v1/send-whatsapp-hybrid`;

    const message = `Votre code Mon Toit est : ${otp}\n\nCe code expire dans 10 minutes. Ne le partagez avec personne.`;

    console.log(`📤 Envoi OTP ${mode} via ${method} à ${normalizedPhone}...`);

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
      return new Response(
        JSON.stringify({
          success: true,
          message: `Code généré (envoi ${method} échoué)`,
          fallback: true,
          otp: otp, // Mode dev
          expiresIn: 600,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`✅ OTP ${mode} envoyé à ${normalizedPhone} via ${method}`);

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
