import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerifyOTPRequest {
  phoneNumber: string;
  code: string;
  mode: 'login' | 'register';
  fullName?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phoneNumber, code, mode = 'login', fullName }: VerifyOTPRequest = await req.json();

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

    // Normaliser le numéro
    let normalizedPhone = phoneNumber.replace(/\D/g, '');
    
    if (!normalizedPhone.startsWith('225')) {
      if (normalizedPhone.startsWith('0')) {
        normalizedPhone = normalizedPhone.substring(1);
      }
      normalizedPhone = '225' + normalizedPhone;
    }
    
    const e164Phone = '+' + normalizedPhone;

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`[VERIFY-OTP] Mode: ${mode}, Phone: ${normalizedPhone}`);

    // ========== VÉRIFIER LE CODE OTP ==========
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
      // Incrémenter les tentatives
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

    console.log(`[VERIFY-OTP] Code verified for: ${normalizedPhone}`);

    // ========== MODE LOGIN: CHERCHER L'UTILISATEUR EXISTANT ==========
    if (mode === 'login') {
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('user_id, full_name, email')
        .eq('phone', normalizedPhone)
        .maybeSingle();

      if (!existingProfile?.user_id) {
        return new Response(
          JSON.stringify({ error: 'Aucun compte trouvé. Veuillez vous inscrire.' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log(`[VERIFY-OTP] Login: user found ${existingProfile.user_id}`);
      
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(existingProfile.user_id);
      
      if (userData?.user?.email) {
        const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: userData.user.email,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          return new Response(
            JSON.stringify({ error: 'Erreur de connexion' }),
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
            isNewUser: false,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Erreur de récupération du compte' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // ========== MODE REGISTER: CRÉER UN NOUVEL UTILISATEUR ==========
    console.log(`[VERIFY-OTP] Register: creating new user for ${normalizedPhone}`);
    
    // Vérifier que le compte n'existe pas déjà
    const { data: existingCheck } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (existingCheck) {
      return new Response(
        JSON.stringify({ error: 'Ce numéro est déjà associé à un compte.' }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Générer un email fictif basé sur le téléphone
    const generatedEmail = `${normalizedPhone}@phone.montoit.ci`;
    const generatedPassword = crypto.randomUUID();
    
    // Créer l'utilisateur dans Supabase Auth
    let newUser;
    const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: generatedEmail,
      password: generatedPassword,
      email_confirm: true,
      phone: e164Phone,
      phone_confirm: true,
      user_metadata: {
        phone: e164Phone,
        full_name: fullName || '',
        auth_method: 'phone',
      },
    });

    if (createError) {
      // Handle case where user exists in auth.users but not in profiles
      if (createError.code === 'email_exists' || createError.message?.includes('already been registered')) {
        console.log(`[VERIFY-OTP] User exists in auth, fetching by email: ${generatedEmail}`);
        
        // Find existing user by email
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users?.users?.find(u => u.email === generatedEmail);
        
        if (existingUser) {
          newUser = { user: existingUser };
          console.log(`[VERIFY-OTP] Found existing auth user: ${existingUser.id}`);
        } else {
          console.error('Error: email exists but user not found');
          return new Response(
            JSON.stringify({ error: 'Erreur de récupération du compte existant' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      } else {
        console.error('Error creating user:', createError);
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la création du compte' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      newUser = createdUser;
    }

    console.log(`[VERIFY-OTP] User created: ${newUser.user.id}`);

    // Créer le profil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: newUser.user.id,
        phone: normalizedPhone,
        email: generatedEmail,
        full_name: fullName || '',
        user_type: 'locataire',
        profile_setup_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    // Générer un magic link
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

    console.log(`[VERIFY-OTP] New user registered and logged in: ${newUser.user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        userId: newUser.user.id,
        action: 'register',
        sessionUrl: sessionData.properties?.action_link,
        isNewUser: true,
        needsProfileCompletion: true,
        message: 'Compte créé avec succès !',
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
