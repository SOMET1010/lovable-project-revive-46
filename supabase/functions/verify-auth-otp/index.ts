import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { edgeLogger } from "../_shared/logger.ts";
import type { VerifyOTPRequest, OTPRecord } from "../_shared/types/sms.types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ProfileRecord {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

interface AuthUserData {
  user: {
    id: string;
    email?: string;
  } | null;
}

interface MagicLinkData {
  properties?: {
    action_link?: string;
  };
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
    edgeLogger.debug('Using redirectTo', { redirectTo });

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

    edgeLogger.info('Verifying OTP', { phone: normalizedPhone, oldFormat: oldFormatPhone, hasName: !!fullName });

    // ========== RECHERCHE FLEXIBLE DU CODE OTP ==========
    // Essayer d'abord le nouveau format, puis l'ancien
    let otpRecord: OTPRecord | null = null;
    let otpError: Error | null = null;

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
      otpError = errNew as unknown as Error;
    } else if (otpNew) {
      otpRecord = otpNew as OTPRecord;
      edgeLogger.debug('OTP found with new format', { phone: normalizedPhone });
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
        otpError = errOld as unknown as Error;
      } else if (otpOld) {
        otpRecord = otpOld as OTPRecord;
        edgeLogger.debug('OTP found with old format', { phone: oldFormatPhone });
        
        // Migrer vers le nouveau format
        await supabaseAdmin
          .from('verification_codes')
          .update({ phone: normalizedPhone })
          .eq('id', otpOld.id);
      }
    }

    if (otpError) {
      edgeLogger.error('Error fetching OTP', otpError);
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
        const lastCodeTyped = lastCode as { id: string; attempts: number };
        await supabaseAdmin
          .from('verification_codes')
          .update({ attempts: (lastCodeTyped.attempts || 0) + 1 })
          .eq('id', lastCodeTyped.id);
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

    edgeLogger.info('OTP code valid', { phone: normalizedPhone });

    // ========== RECHERCHE FLEXIBLE DU PROFIL ==========
    let existingProfile: ProfileRecord | null = null;

    // 1. Recherche avec nouveau format (13 chiffres)
    const { data: profileNew } = await supabaseAdmin
      .from('profiles')
      .select('user_id, full_name, email, phone')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (profileNew) {
      existingProfile = profileNew as ProfileRecord;
      edgeLogger.debug('Profile found with new format', { phone: normalizedPhone });
    }

    // 2. Si non trouvé, essayer l'ancien format (12 chiffres)
    if (!existingProfile && oldFormatPhone) {
      const { data: profileOld } = await supabaseAdmin
        .from('profiles')
        .select('user_id, full_name, email, phone')
        .eq('phone', oldFormatPhone)
        .maybeSingle();

      if (profileOld) {
        existingProfile = profileOld as ProfileRecord;
        edgeLogger.debug('Profile found with old format, migrating', { oldPhone: oldFormatPhone, newPhone: normalizedPhone });
        
        // Migrer le profil vers le nouveau format
        await supabaseAdmin
          .from('profiles')
          .update({ phone: normalizedPhone, updated_at: new Date().toISOString() })
          .eq('user_id', (profileOld as ProfileRecord).user_id);
      }
    }

    // ========== CASE 1: EXISTING USER → LOGIN ==========
    if (existingProfile?.user_id) {
      await supabaseAdmin
        .from('verification_codes')
        .update({ verified_at: new Date().toISOString() })
        .eq('id', otpRecord.id);

      edgeLogger.info('Existing user found', { userId: existingProfile.user_id });
      
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(existingProfile.user_id) as { data: AuthUserData };
      
      if (userData?.user?.email) {
        const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: userData.user.email,
          options: {
            redirectTo,
          },
        });

        if (sessionError) {
          edgeLogger.error('Session error', sessionError as Error);
          return new Response(
            JSON.stringify({ error: 'Erreur de connexion' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const sessionUrl = (sessionData as MagicLinkData)?.properties?.action_link;
        if (!sessionUrl) {
          edgeLogger.error('Magic link generation failed - no action_link', undefined, { 
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

        edgeLogger.info('Login sessionUrl generated', { userId: existingProfile.user_id });

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
      edgeLogger.info('New user, requesting name', { phone: normalizedPhone });
      
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

    edgeLogger.info('Creating new user', { phone: normalizedPhone, fullName });
    
    const generatedEmail = `${normalizedPhone}@phone.montoit.ci`;
    const generatedPassword = crypto.randomUUID();
    
    let newUser: { user: { id: string } };
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
        edgeLogger.info('User exists in auth, fetching by email', { email: generatedEmail });
        
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users?.users?.find(u => u.email === generatedEmail);
        
        if (existingUser) {
          newUser = { user: { id: existingUser.id } };
          edgeLogger.debug('Found existing auth user', { userId: existingUser.id });
        } else {
          edgeLogger.error('Email exists but user not found');
          return new Response(
            JSON.stringify({ error: 'Erreur de récupération du compte existant' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      } else {
        edgeLogger.error('Error creating user', createError as Error);
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la création du compte' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      newUser = { user: { id: createdUser.user.id } };
    }

    edgeLogger.info('User created', { userId: newUser.user.id });

    // Calculer le trust_score initial: 10 (nom) + 10 (téléphone vérifié) = 20
    const initialTrustScore = 20;

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        user_id: newUser.user.id,
        phone: normalizedPhone, // Toujours utiliser le nouveau format
        email: generatedEmail,
        full_name: fullName,
        user_type: null,
        trust_score: initialTrustScore,
        profile_setup_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (profileError) {
      edgeLogger.error('Error creating profile', profileError as Error);
    }

    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: generatedEmail,
      options: {
        redirectTo,
      },
    });

    if (sessionError) {
      edgeLogger.error('Session error for new user', sessionError as Error);
      return new Response(
        JSON.stringify({ error: 'Compte créé mais erreur de connexion' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const sessionUrl = (sessionData as MagicLinkData)?.properties?.action_link;
    if (!sessionUrl) {
      edgeLogger.error('Magic link generation failed for new user - no action_link', undefined, { 
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

    edgeLogger.info('New user registered', { userId: newUser.user.id });

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
    edgeLogger.error('Error in verify-auth-otp', error instanceof Error ? error : undefined);
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
