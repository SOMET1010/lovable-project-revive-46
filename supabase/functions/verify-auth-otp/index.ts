import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerifyOTPRequest {
  phoneNumber: string;
  code: string;
  fullName?: string;
}

/**
 * Helper: Génère l'ancien format 12 chiffres à partir du nouveau format 13 chiffres
 * 2250709753232 (13) → 225709753232 (12)
 */
function getOldPhoneFormat(normalizedPhone: string): string | null {
  if (normalizedPhone.length === 13 && normalizedPhone.startsWith('2250')) {
    return '225' + normalizedPhone.substring(4);
  }
  return null;
}

/**
 * SIMPLIFIED verify-auth-otp with flexible phone format lookup
 * Supports both 12-digit (old) and 13-digit (new) phone formats
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phoneNumber, code, fullName }: VerifyOTPRequest = await req.json();

    if (!phoneNumber || !code) {
      return new Response(
        JSON.stringify({ error: 'Numéro et code requis' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract origin for dynamic redirect URL
    const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || 'https://silkjqepcbhlflbdtvgg.lovable.app';
    const redirectTo = `${origin}/auth/callback`;
    console.log(`[VERIFY-OTP] Using redirectTo: ${redirectTo}`);

    // Normaliser le numéro (format 13 chiffres: 2250XXXXXXXXX)
    let normalizedPhone = phoneNumber.replace(/\D/g, '');
    if (!normalizedPhone.startsWith('225')) {
      normalizedPhone = '225' + normalizedPhone;
    }
    
    const oldFormatPhone = getOldPhoneFormat(normalizedPhone);
    const e164Phone = '+' + normalizedPhone;

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`[VERIFY-OTP] Phone: ${normalizedPhone}, oldFormat: ${oldFormatPhone}, hasName: ${!!fullName}`);

    // ========== RECHERCHE FLEXIBLE DU CODE OTP ==========
    // Essayer d'abord le nouveau format, puis l'ancien
    let otpRecord = null;
    let otpError = null;

    // 1. Recherche avec nouveau format (13 chiffres)
    const { data: otpNew, error: errNew } = await supabaseAdmin
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

    if (errNew) {
      otpError = errNew;
    } else if (otpNew) {
      otpRecord = otpNew;
      console.log(`[VERIFY-OTP] ✅ OTP trouvé avec nouveau format: ${normalizedPhone}`);
    }

    // 2. Si non trouvé, essayer l'ancien format (12 chiffres)
    if (!otpRecord && oldFormatPhone) {
      const { data: otpOld, error: errOld } = await supabaseAdmin
        .from('verification_codes')
        .select('*')
        .eq('phone', oldFormatPhone)
        .eq('code', code)
        .in('type', ['sms', 'whatsapp'])
        .is('verified_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (errOld && !otpError) {
        otpError = errOld;
      } else if (otpOld) {
        otpRecord = otpOld;
        console.log(`[VERIFY-OTP] ✅ OTP trouvé avec ancien format: ${oldFormatPhone}`);
        
        // Migrer vers le nouveau format
        await supabaseAdmin
          .from('verification_codes')
          .update({ phone: normalizedPhone })
          .eq('id', otpOld.id);
      }
    }

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
      // Incrémenter les tentatives sur le dernier code
      const { data: lastCode } = await supabaseAdmin
        .from('verification_codes')
        .select('id, attempts')
        .or(`phone.eq.${normalizedPhone}${oldFormatPhone ? `,phone.eq.${oldFormatPhone}` : ''}`)
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

    console.log(`[VERIFY-OTP] ✅ Code valid for: ${normalizedPhone}`);

    // ========== RECHERCHE FLEXIBLE DU PROFIL ==========
    let existingProfile = null;

    // 1. Recherche avec nouveau format (13 chiffres)
    const { data: profileNew } = await supabaseAdmin
      .from('profiles')
      .select('user_id, full_name, email, phone')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (profileNew) {
      existingProfile = profileNew;
      console.log(`[VERIFY-OTP] 👤 Profil trouvé avec nouveau format: ${normalizedPhone}`);
    }

    // 2. Si non trouvé, essayer l'ancien format (12 chiffres)
    if (!existingProfile && oldFormatPhone) {
      const { data: profileOld } = await supabaseAdmin
        .from('profiles')
        .select('user_id, full_name, email, phone')
        .eq('phone', oldFormatPhone)
        .maybeSingle();

      if (profileOld) {
        existingProfile = profileOld;
        console.log(`[VERIFY-OTP] 👤 Profil trouvé avec ancien format: ${oldFormatPhone}, migration vers ${normalizedPhone}`);
        
        // Migrer le profil vers le nouveau format
        await supabaseAdmin
          .from('profiles')
          .update({ phone: normalizedPhone, updated_at: new Date().toISOString() })
          .eq('user_id', profileOld.user_id);
      }
    }

    // ========== CASE 1: EXISTING USER → LOGIN ==========
    if (existingProfile?.user_id) {
      await supabaseAdmin
        .from('verification_codes')
        .update({ verified_at: new Date().toISOString() })
        .eq('id', otpRecord.id);

      console.log(`[VERIFY-OTP] 👤 Existing user found: ${existingProfile.user_id}`);
      
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(existingProfile.user_id);
      
      if (userData?.user?.email) {
        const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: userData.user.email,
          options: {
            redirectTo,
          },
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

        const sessionUrl = sessionData?.properties?.action_link;
        if (!sessionUrl) {
          console.error('[VERIFY-OTP] ❌ Magic link generation failed - no action_link', { 
            sessionData: JSON.stringify(sessionData),
            email: userData.user.email 
          });
          return new Response(
            JSON.stringify({ error: 'Erreur de génération du lien de connexion. Vérifiez la configuration Site URL.' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        console.log(`[VERIFY-OTP] ✅ Login sessionUrl generated for: ${existingProfile.user_id}`);

        return new Response(
          JSON.stringify({
            success: true,
            action: 'login',
            userId: existingProfile.user_id,
            sessionUrl,
            isNewUser: false,
            message: `Bienvenue ${existingProfile.full_name || ''} !`,
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

    // ========== CASE 2: NEW USER, NO NAME PROVIDED → REQUEST NAME ==========
    if (!fullName?.trim()) {
      console.log(`[VERIFY-OTP] 🆕 New user, requesting name for: ${normalizedPhone}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          action: 'needsName',
          message: 'Code vérifié ! Entrez votre nom pour créer votre compte.',
          phoneVerified: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // ========== CASE 3: NEW USER WITH NAME → CREATE ACCOUNT ==========
    await supabaseAdmin
      .from('verification_codes')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', otpRecord.id);

    console.log(`[VERIFY-OTP] 🆕 Creating new user: ${normalizedPhone} - ${fullName}`);
    
    const generatedEmail = `${normalizedPhone}@phone.montoit.ci`;
    const generatedPassword = crypto.randomUUID();
    
    let newUser;
    const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: generatedEmail,
      password: generatedPassword,
      email_confirm: true,
      phone: e164Phone,
      phone_confirm: true,
      user_metadata: {
        phone: e164Phone,
        full_name: fullName,
        auth_method: 'phone',
      },
    });

    if (createError) {
      if (createError.code === 'email_exists' || createError.message?.includes('already been registered')) {
        console.log(`[VERIFY-OTP] User exists in auth, fetching by email: ${generatedEmail}`);
        
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

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        user_id: newUser.user.id,
        phone: normalizedPhone, // Toujours utiliser le nouveau format
        email: generatedEmail,
        full_name: fullName,
        user_type: null,
        profile_setup_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: generatedEmail,
      options: {
        redirectTo,
      },
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

    const sessionUrl = sessionData?.properties?.action_link;
    if (!sessionUrl) {
      console.error('[VERIFY-OTP] ❌ Magic link generation failed for new user - no action_link', { 
        sessionData: JSON.stringify(sessionData),
        email: generatedEmail 
      });
      return new Response(
        JSON.stringify({ error: 'Compte créé mais erreur de génération du lien. Vérifiez la configuration Site URL.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[VERIFY-OTP] ✅ New user registered: ${newUser.user.id}, sessionUrl generated`);

    return new Response(
      JSON.stringify({
        success: true,
        action: 'register',
        userId: newUser.user.id,
        sessionUrl,
        isNewUser: true,
        needsProfileCompletion: true,
        message: 'Compte créé avec succès ! Bienvenue sur Mon Toit.',
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
