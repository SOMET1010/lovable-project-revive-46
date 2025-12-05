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

    console.log(`[VERIFY-OTP] Looking for code for phone: ${normalizedPhone}`);

    // Récupérer le code OTP valide depuis verification_codes
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('verification_codes')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('code', code)
      .in('type', ['sms', 'whatsapp'])
      .is('verified_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log(`[VERIFY-OTP] OTP record found:`, otpRecord ? 'Yes' : 'No', otpError ? `Error: ${otpError.message}` : '');

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
      console.log(`[VERIFY-OTP] Existing user found: ${existingProfile.user_id}`);
      
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

    // ============ NOUVEL UTILISATEUR - CRÉATION AUTOMATIQUE ============
    console.log(`[VERIFY-OTP] Creating new user for phone: ${normalizedPhone}`);
    
    // Générer un email fictif basé sur le téléphone
    const generatedEmail = `${normalizedPhone}@phone.montoit.ci`;
    const generatedPassword = crypto.randomUUID(); // Mot de passe aléatoire (non utilisé)
    
    // Créer l'utilisateur dans Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: generatedEmail,
      password: generatedPassword,
      email_confirm: true, // Auto-confirmer l'email
      phone: `+${normalizedPhone}`,
      phone_confirm: true, // Téléphone vérifié par OTP
      user_metadata: {
        phone: normalizedPhone,
        auth_method: 'phone',
      },
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création du compte' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[VERIFY-OTP] User created: ${newUser.user.id}`);

    // Créer le profil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: newUser.user.id,
        phone: normalizedPhone,
        email: generatedEmail,
        user_type: 'locataire', // Type par défaut
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Continue quand même, le profil peut être créé plus tard
    }

    // Générer un magic link pour connecter automatiquement
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: generatedEmail,
    });

    if (sessionError) {
      console.error('Session error for new user:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Compte créé mais erreur de connexion' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[VERIFY-OTP] New user logged in successfully: ${newUser.user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        userId: newUser.user.id,
        action: 'login', // Même action que pour utilisateur existant
        sessionUrl: sessionData.properties?.action_link,
        isNewUser: true,
        message: 'Compte créé et connecté avec succès !',
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
