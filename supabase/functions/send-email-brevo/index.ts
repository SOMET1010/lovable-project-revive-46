/**
 * Edge Function: send-email-brevo
 *
 * Point d'entrée sécurisé pour l'envoi d'emails transactionnels via Brevo.
 * Optimisé pour l'envoi de codes OTP et emails de vérification.
 *
 * Architecture: Frontend → Supabase Edge Function → Brevo Email API
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGINS') || 'https://montoit.ansut.ci',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface EmailRequest {
  to: string;           // Email du destinataire
  subject: string;      // Sujet de l'email
  htmlContent: string;  // Contenu HTML
  toName?: string;      // Nom du destinataire (optionnel)
  templateId?: number;  // ID de template Brevo (optionnel)
  templateData?: Record<string, any>; // Données pour template (optionnel)
}

interface EmailResponse {
  status: 'ok' | 'error';
  brevoMessageId?: string;
  reason?: string;
}

/**
 * Valide l'adresse email
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide le payload de la requête
 */
function validatePayload(body: unknown): { valid: boolean; error?: string; data?: EmailRequest } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Corps de requête invalide' };
  }

  const { to, subject, htmlContent, toName, templateId, templateData } = body as Record<string, unknown>;

  if (!to || typeof to !== 'string') {
    return { valid: false, error: 'Email destinataire requis' };
  }

  if (!validateEmail(to)) {
    return { valid: false, error: 'Format d\'email invalide' };
  }

  if (!templateId) {
    // Si pas de template, vérifier qu'on a sujet et contenu
    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return { valid: false, error: 'Sujet requis' };
    }

    if (!htmlContent || typeof htmlContent !== 'string' || htmlContent.trim().length === 0) {
      return { valid: false, error: 'Contenu HTML requis' };
    }
  }

  return {
    valid: true,
    data: {
      to: to.trim().toLowerCase(),
      subject: subject?.trim() || '',
      htmlContent: htmlContent?.trim() || '',
      toName: typeof toName === 'string' ? toName.trim() : undefined,
      templateId: typeof templateId === 'number' ? templateId : undefined,
      templateData: templateData && typeof templateData === 'object' ? templateData : undefined,
    },
  };
}

/**
 * Génère le template HTML pour l'email OTP
 */
function generateOTPEmailTemplate(otp: string, userName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Code de vérification - Mon Toit</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #2C1810;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #FAF7F4;
        }
        .header {
          text-align: center;
          padding: 30px 0;
          border-bottom: 2px solid #F16522;
          background: white;
          border-radius: 20px 20px 0 0;
        }
        .logo {
          width: 60px;
          height: 60px;
          background: #F16522;
          border-radius: 15px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          font-size: 24px;
        }
        .content {
          padding: 40px 30px;
          background: white;
          margin: -1px 0;
          text-align: center;
        }
        .otp-code {
          display: inline-block;
          background: #F8F8F8;
          padding: 20px 40px;
          border-radius: 15px;
          border: 2px solid #F16522;
          box-shadow: 0 4px 15px rgba(241, 101, 34, 0.1);
          font-size: 36px;
          font-weight: bold;
          color: #F16522;
          letter-spacing: 8px;
          margin: 30px 0;
        }
        .security-notice {
          background: #FFF3E0;
          padding: 20px;
          border-radius: 10px;
          border-left: 4px solid #F16522;
          margin: 30px 0;
          text-align: left;
        }
        .footer {
          text-align: center;
          padding: 30px;
          background: #2C1810;
          color: white;
          border-radius: 0 0 20px 20px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🏠</div>
        <h1 style="margin: 0; color: #2C1810; font-size: 32px;">Mon Toit</h1>
        <p style="margin: 5px 0 0; color: #6B5A4E;">Votre plateforme immobilière de confiance</p>
      </div>

      <div class="content">
        <h2 style="color: #2C1810; margin-bottom: 30px;">🔐 Code de vérification</h2>

        <p style="font-size: 16px; margin-bottom: 30px;">
          ${userName ? `Bonjour ${userName},` : 'Bonjour,'}<br><br>
          Vous avez demandé un code de vérification pour accéder à votre compte Mon Toit.
        </p>

        <div class="otp-code">${otp}</div>

        <p style="font-size: 16px; color: #6B5A4E;">
          Ce code est valide pendant <strong>10 minutes</strong>.
        </p>

        <div class="security-notice">
          <p style="margin: 0; color: #8B6914;">
            <strong>⚠️ Sécurité :</strong> Ne partagez jamais ce code avec qui que ce soit.
            L'équipe Mon Toit ne vous demandera jamais votre code par téléphone ou email.
          </p>
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0 0 10px;">
          <strong>Mon Toit</strong> - Certifié ANSUT Côte d'Ivoire
        </p>
        <p style="margin: 0;">
          📞 Contact: +225 07 XX XX XX XX<br>
          🌐 www.montoit.ci<br>
          📍 Cocody, Abidjan, Côte d'Ivoire
        </p>
      </div>
    </body>
    </html>
  `;
}

const BREVO_EMAIL_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ status: 'error', reason: 'Méthode non autorisée' } as EmailResponse),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse request body
    const body = await req.json();

    // Special case for OTP requests
    const isOTPRequest = body.type === 'otp' && body.otp;

    let emailData: EmailRequest;

    if (isOTPRequest) {
      // Generate OTP email automatically
      emailData = {
        to: body.to,
        subject: '🔐 Mon Toit - Code de vérification',
        htmlContent: generateOTPEmailTemplate(body.otp, body.toName),
        toName: body.toName,
      };
    } else {
      // Validate payload for regular emails
      const validation = validatePayload(body);
      if (!validation.valid || !validation.data) {
        console.error('[send-email-brevo] Validation error:', validation.error);
        return new Response(
          JSON.stringify({ status: 'error', reason: validation.error } as EmailResponse),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      emailData = validation.data;
    }

    // Get Brevo API key from environment
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    if (!brevoApiKey) {
      console.error('[send-email-brevo] BREVO_API_KEY not configured');
      return new Response(
        JSON.stringify({ status: 'error', reason: 'Service email non configuré' } as EmailResponse),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  
    // Determine if we're in sandbox mode
    const isSandbox = Deno.env.get('DENO_ENV') === 'development';

    // Prepare Brevo request
    const brevoPayload: any = {
      sender: {
        name: 'Mon Toit',
        email: 'no-reply@montoit.ci',
      },
      to: [{
        email: emailData.to,
        ...(emailData.toName && { name: emailData.toName }),
      }],
    };

    // Add headers only if needed
    if (isSandbox) {
      brevoPayload.headers = {
        'X-Sib-Sandbox': 'drop'
      };
    }

    // Use template if provided
    if (emailData.templateId) {
      brevoPayload.templateId = emailData.templateId;
      if (emailData.templateData) {
        brevoPayload.params = emailData.templateData;
      }
    } else {
      brevoPayload.subject = emailData.subject;
      brevoPayload.htmlContent = emailData.htmlContent;
    }

    console.log('[send-email-brevo] Sending email to:', emailData.to.split('@')[0] + '****');

    // Call Brevo Email API
    const brevoResponse = await fetch(BREVO_EMAIL_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    });

    // Log response status
    console.log('[send-email-brevo] Brevo response status:', brevoResponse.status);

    if (!brevoResponse.ok) {
      // Try to parse error as JSON
      let errorMessage = 'Erreur lors de l\'envoi de l\'email';
      try {
        const errorText = await brevoResponse.text();
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.code || errorMessage;
        console.error('[send-email-brevo] Brevo error:', brevoResponse.status, errorMessage);
      } catch (e) {
        errorMessage = `Erreur HTTP ${brevoResponse.status}`;
        console.error('[send-email-brevo] Brevo error:', brevoResponse.status);
      }

      return new Response(
        JSON.stringify({
          status: 'error',
          reason: errorMessage
        } as EmailResponse),
        { status: brevoResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse successful response
    const brevoData = await brevoResponse.json();
    const messageId = brevoData.messageId || brevoData.messageIds?.[0];

    console.log('[send-email-brevo] Email sent successfully, messageId:', messageId);

    return new Response(
      JSON.stringify({
        status: 'ok',
        brevoMessageId: messageId
      } as EmailResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[send-email-brevo] Unexpected error:', error instanceof Error ? error.message : 'Unknown');
    return new Response(
      JSON.stringify({ status: 'error', reason: 'Erreur interne du service email' } as EmailResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});