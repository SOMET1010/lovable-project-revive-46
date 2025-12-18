import { edgeLogger } from "../_shared/logger.ts";
import type { OTPRequest } from "../_shared/types/sms.types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get('ALLOWED_ORIGINS') || 'https://montoit.ansut.ci',
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const RATE_LIMIT_SECONDS = 60;

/**
 * SIMPLIFIED send-auth-otp
 * - No mode (login/register) - we just send the OTP
 * - Account detection is done in verify-auth-otp after OTP validation
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phoneNumber, method = 'whatsapp' }: OTPRequest = await req.json();

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

    // Normaliser le numéro (Côte d'Ivoire)
    // Format attendu: 2250XXXXXXXXX (13 chiffres)
    let normalizedPhone = phoneNumber.replace(/\D/g, '');
    
    // Ajouter le préfixe 225 si absent (GARDER le 0 initial)
    if (!normalizedPhone.startsWith('225')) {
      normalizedPhone = '225' + normalizedPhone;
    }
    
    // Validation: numéro ivoirien = 225 + 10 chiffres = 13 chiffres
    if (normalizedPhone.length < 13) {
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
      const recentCodes = await rateLimitResponse.json() as Array<{ created_at: string }>;
      
      if (recentCodes && recentCodes.length > 0) {
        const lastSentAt = new Date(recentCodes[0].created_at);
        const elapsedSeconds = (Date.now() - lastSentAt.getTime()) / 1000;
        const remainingSeconds = Math.ceil(RATE_LIMIT_SECONDS - elapsedSeconds);
        
        edgeLogger.info('Rate limit active', { remainingSeconds, phone: normalizedPhone });
        
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
      edgeLogger.error('Failed to store OTP', undefined, { error: errorText });
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
    const e164Phone = `+${normalizedPhone.replace(/^\+/, '')}`;

    edgeLogger.info('Sending OTP', { method, phone: normalizedPhone });

    // Helper pour fallback Brevo SMS direct
    const sendViaBrevoSms = async () => {
      const brevoUrl = `${supabaseUrl}/functions/v1/send-sms-brevo`;
      const brevoResp = await fetch(brevoUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: e164Phone,
          message,
          tag: 'AUTH_OTP',
        }),
      });

      const brevoResult = await brevoResp.json() as { status?: string; reason?: string };
      if (!brevoResp.ok || brevoResult.status !== 'ok') {
        throw new Error(brevoResult.reason || 'Brevo SMS fallback failed');
      }
      return { provider: 'brevo-sms' };
    };

    // Helper pour fallback Brevo WhatsApp direct
    const sendViaBrevoWhatsapp = async () => {
      const brevoUrl = `${supabaseUrl}/functions/v1/send-whatsapp-brevo`;
      const brevoResp = await fetch(brevoUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: normalizedPhone,
          message,
        }),
      });

      const brevoResult = await brevoResp.json() as { error?: string };
      if (!brevoResp.ok) {
        throw new Error(brevoResult?.error || 'Brevo WhatsApp fallback failed');
      }
      return { provider: 'brevo-whatsapp' };
    };

    let provider = method === 'sms' ? 'sms-hybrid' : 'whatsapp-hybrid';

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

    const sendResult = await sendResponse.json() as { provider?: string; error?: string };

    if (!sendResponse.ok) {
      edgeLogger.error('OTP send failed - primary provider', { error: sendResult.error, phone: normalizedPhone.slice(-4), provider });

      try {
        const fallbackResult = method === 'sms' ? await sendViaBrevoSms() : await sendViaBrevoWhatsapp();
        provider = fallbackResult.provider;
        edgeLogger.info('OTP sent via Brevo fallback', { method, phone: normalizedPhone, provider });
      } catch (fallbackErr: any) {
        edgeLogger.error('OTP send failed - Brevo fallback', { error: fallbackErr?.message, phone: normalizedPhone.slice(-4) });
        return new Response(
          JSON.stringify({
            error: 'Service SMS indisponible. Veuillez réessayer plus tard.',
            code: 'SMS_SEND_FAILED'
          }),
          {
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      provider = sendResult.provider || provider;
      edgeLogger.info('OTP sent successfully', { method, phone: normalizedPhone, provider });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Code envoyé par ${method === 'sms' ? 'SMS' : 'WhatsApp'}`,
        provider,
        expiresIn: 600,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    edgeLogger.error('Error in send-auth-otp', error instanceof Error ? error : undefined);
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
