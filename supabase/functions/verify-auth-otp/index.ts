import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerifyOTPRequest {
  phoneNumber: string;
  code: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phoneNumber, code }: VerifyOTPRequest = await req.json();

    // Validation
    if (!phoneNumber || !code) {
      return new Response(
        JSON.stringify({ error: 'Numéro et code requis' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const normalizedPhone = phoneNumber.replace(/\D/g, '');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Récupérer le code OTP valide depuis verification_codes
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('verification_codes')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('code', code)
      .eq('type', 'sms')
      .is('verified_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.error('Error fetching OTP:', otpError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la vérification' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!otpRecord) {
      // Incrémenter les tentatives sur le dernier code non vérifié
      const { data: lastCode } = await supabaseAdmin
        .from('verification_codes')
        .select('id, attempts')
        .eq('phone', normalizedPhone)
        .is('verified_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastCode) {
        await supabaseAdmin
          .from('verification_codes')
          .update({ attempts: (lastCode.attempts || 0) + 1 })
          .eq('id', lastCode.id);
      }

      return new Response(
        JSON.stringify({ error: 'Code invalide ou expiré' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Vérifier le nombre de tentatives
    const maxAttempts = otpRecord.max_attempts || 3;
    if ((otpRecord.attempts || 0) >= maxAttempts) {
      return new Response(
        JSON.stringify({ error: 'Trop de tentatives. Demandez un nouveau code.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Marquer comme vérifié
    await supabaseAdmin
      .from('verification_codes')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', otpRecord.id);

    console.log(`[VERIFY-OTP] Code verified for phone: ${normalizedPhone}`);

    // Chercher un profil existant avec ce téléphone
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_id, full_name, email')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (existingProfile?.user_id) {
      // Utilisateur existant - générer un magic link
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(existingProfile.user_id);
      
      if (userData?.user?.email) {
        const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: userData.user.email,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          return new Response(
            JSON.stringify({ error: 'Erreur de session' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            userId: existingProfile.user_id,
            action: 'login',
            sessionUrl: sessionData.properties?.action_link,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Nouvel utilisateur - nécessite inscription
    return new Response(
      JSON.stringify({
        success: true,
        action: 'register',
        phoneVerified: true,
        message: 'Téléphone vérifié. Complétez votre inscription.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in verify-auth-otp:', error);
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
