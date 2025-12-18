import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Types for ONECI API
interface FaceAuthRequest {
  action: 'face_auth';
  uin: string; // NNI (Numéro National d'Identification)
  faceImage: string; // Base64 JPG image (ICAO compliant)
  userId?: string;
  verificationId?: string;
}

interface PersonAuthRequest {
  action: 'person_auth';
  uin: string;
  fingerprint: string; // Base64 WSQ format
  fingerPosition?: number; // 1-10 for finger position
  userId?: string;
  verificationId?: string;
}

interface ReadPersonRequest {
  action: 'read_person';
  uin: string;
  userId?: string;
  verificationId?: string;
}

interface MatchCaseRequest {
  action: 'match_case';
  uin: string;
  lastName?: string;
  firstName?: string;
  birthDate?: string; // YYYY-MM-DD format
  userId?: string;
  verificationId?: string;
}

type ONECIRequest = FaceAuthRequest | PersonAuthRequest | ReadPersonRequest | MatchCaseRequest;

// Response types matching ONECI API documentation
interface FaceAuthResponse {
  UIN: string;
  Code: string;
  Message: string;
  "Face authentication": string; // "True" or "False"
}

interface PersonAuthResponse {
  UIN: string;
  Code: string;
  Message: string;
  "Finger authentication": string;
  "Finger position": string;
}

interface ReadPersonResponse {
  UIN: string;
  LAST_NAME: string;
  FIRST_NAME: string;
  GENDER: string;
  BIRTH_DATE: string;
  FATHER_FIRST_NAME: string;
  FATHER_LAST_NAME: string;
  FATHER_BIRTH_DATE: string;
  MOTHER_FIRST_NAME: string;
  MOTHER_LAST_NAME: string;
  MOTHER_BIRTH_DATE: string;
  RESIDENCE_ADR_1: string;
  RESIDENCE_ADR_2: string;
  NATIONALITY: string;
  ID_CARD_NUMBER: string;
  BIRTH_TOWN: string;
  BIRTH_COUNTRY: string;
  SPOUSE_NAME: string;
  RESIDENCE_TOWN: string;
  FATHER_UIN: string;
  MOTHER_UIN: string;
}

interface MatchCaseError {
  AttributeName: string;
  ErrorCode: string; // "1" = no match
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseClient: AnySupabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const requestData = await req.json() as ONECIRequest;
    const { action } = requestData;

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action requise: face_auth, person_auth, read_person, ou match_case' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get ONECI API configuration
    const { data: apiKeys, error: keyError } = await supabaseClient.rpc('get_api_keys', { service: 'oneci' });

    if (keyError || !apiKeys?.api_key || !apiKeys?.api_url) {
      console.error('ONECI API not configured:', keyError);
      return new Response(
        JSON.stringify({ error: 'Service ONECI non configuré' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const baseUrl = apiKeys.api_url;
    const apiKey = apiKeys.api_key;

    let result;

    switch (action) {
      case 'face_auth':
        result = await handleFaceAuth(requestData as FaceAuthRequest, baseUrl, apiKey, supabaseClient);
        break;
      case 'person_auth':
        result = await handlePersonAuth(requestData as PersonAuthRequest, baseUrl, apiKey, supabaseClient);
        break;
      case 'read_person':
        result = await handleReadPerson(requestData as ReadPersonRequest, baseUrl, apiKey, supabaseClient);
        break;
      case 'match_case':
        result = await handleMatchCase(requestData as MatchCaseRequest, baseUrl, apiKey, supabaseClient);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Action invalide: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('ONECI verification error:', errorMessage);

    try {
      await supabaseClient.rpc('log_api_usage', {
        p_service_name: 'oneci',
        p_action: 'error',
        p_status: 'error',
        p_error_message: errorMessage
      });
    } catch {
      // Ignore logging errors
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Face Authentication - Compare selfie with NNI photo
 * Photo must be JPG format, base64 encoded, ICAO compliant
 */
async function handleFaceAuth(
  request: FaceAuthRequest,
  baseUrl: string,
  apiKey: string,
  supabase: AnySupabaseClient
) {
  const { uin, faceImage, userId, verificationId } = request;

  if (!uin || !faceImage) {
    throw new Error('UIN et image faciale requis');
  }

  console.log(`[ONECI] Face auth for UIN: ${uin.substring(0, 4)}...`);

  // Update verification status if verificationId provided
  if (verificationId) {
    await supabase
      .from('identity_verifications')
      .update({ status: 'processing' })
      .eq('id', verificationId);
  }

  const response = await fetch(`${baseUrl}/face-authentication`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      UIN: uin,
      Face: faceImage, // Base64 JPG, ICAO compliant
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[ONECI] Face auth failed:', response.status, errorText);
    throw new Error(`Erreur API ONECI: ${response.status}`);
  }

  const result = await response.json() as FaceAuthResponse;
  const isAuthenticated = result["Face authentication"] === "True";

  // Log API usage
  await supabase.rpc('log_api_usage', {
    p_service_name: 'oneci',
    p_action: 'face_auth',
    p_status: isAuthenticated ? 'success' : 'failed',
    p_request_data: { uin: uin.substring(0, 4) + '***' },
    p_response_data: { code: result.Code, authenticated: isAuthenticated },
    p_user_id: userId || null
  });

  // Update verification record
  if (verificationId) {
    await supabase
      .from('identity_verifications')
      .update({
        status: isAuthenticated ? 'verified' : 'rejected',
        oneci_response: result,
        verification_score: isAuthenticated ? 100 : 0,
        verified_at: isAuthenticated ? new Date().toISOString() : null,
        rejection_reason: isAuthenticated ? null : 'Authentification faciale échouée'
      })
      .eq('id', verificationId);
  }

  return {
    success: true,
    authenticated: isAuthenticated,
    uin: result.UIN,
    code: result.Code,
    message: result.Message,
  };
}

/**
 * Person Authentication - Compare fingerprints
 * Fingerprint must be WSQ format, base64 encoded
 */
async function handlePersonAuth(
  request: PersonAuthRequest,
  baseUrl: string,
  apiKey: string,
  supabase: AnySupabaseClient
) {
  const { uin, fingerprint, fingerPosition = 2, userId, verificationId } = request;

  if (!uin || !fingerprint) {
    throw new Error('UIN et empreinte digitale requis');
  }

  console.log(`[ONECI] Person auth for UIN: ${uin.substring(0, 4)}...`);

  if (verificationId) {
    await supabase
      .from('identity_verifications')
      .update({ status: 'processing' })
      .eq('id', verificationId);
  }

  const response = await fetch(`${baseUrl}/person-authentication`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      UIN: uin,
      Fingerprint: fingerprint, // Base64 WSQ format
      FingerPosition: fingerPosition,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[ONECI] Person auth failed:', response.status, errorText);
    throw new Error(`Erreur API ONECI: ${response.status}`);
  }

  const result = await response.json() as PersonAuthResponse;
  const isAuthenticated = result["Finger authentication"] === "True";

  await supabase.rpc('log_api_usage', {
    p_service_name: 'oneci',
    p_action: 'person_auth',
    p_status: isAuthenticated ? 'success' : 'failed',
    p_request_data: { uin: uin.substring(0, 4) + '***', fingerPosition },
    p_response_data: { code: result.Code, authenticated: isAuthenticated },
    p_user_id: userId || null
  });

  if (verificationId) {
    await supabase
      .from('identity_verifications')
      .update({
        status: isAuthenticated ? 'verified' : 'rejected',
        oneci_response: result,
        verification_score: isAuthenticated ? 100 : 0,
        verified_at: isAuthenticated ? new Date().toISOString() : null,
        rejection_reason: isAuthenticated ? null : 'Authentification biométrique échouée'
      })
      .eq('id', verificationId);
  }

  return {
    success: true,
    authenticated: isAuthenticated,
    uin: result.UIN,
    code: result.Code,
    message: result.Message,
    fingerPosition: result["Finger position"],
  };
}

/**
 * Read Person - Get alphanumeric data for a NNI
 */
async function handleReadPerson(
  request: ReadPersonRequest,
  baseUrl: string,
  apiKey: string,
  supabase: AnySupabaseClient
) {
  const { uin, userId, verificationId } = request;

  if (!uin) {
    throw new Error('UIN requis');
  }

  console.log(`[ONECI] Read person for UIN: ${uin.substring(0, 4)}...`);

  const response = await fetch(`${baseUrl}/person-features`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      UIN: uin,
      Operation: 'readPerson',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[ONECI] Read person failed:', response.status, errorText);
    throw new Error(`Erreur API ONECI: ${response.status}`);
  }

  const result = await response.json() as ReadPersonResponse;

  await supabase.rpc('log_api_usage', {
    p_service_name: 'oneci',
    p_action: 'read_person',
    p_status: 'success',
    p_request_data: { uin: uin.substring(0, 4) + '***' },
    p_response_data: { hasData: !!result.UIN },
    p_user_id: userId || null
  });

  // Update verification record with retrieved data
  if (verificationId) {
    await supabase
      .from('identity_verifications')
      .update({
        first_name: result.FIRST_NAME,
        last_name: result.LAST_NAME,
        date_of_birth: result.BIRTH_DATE,
        place_of_birth: result.BIRTH_TOWN,
        nationality: result.NATIONALITY === 'CIV' ? 'Ivoirienne' : result.NATIONALITY,
        oneci_response: result,
      })
      .eq('id', verificationId);
  }

  return {
    success: true,
    data: {
      uin: result.UIN,
      lastName: result.LAST_NAME,
      firstName: result.FIRST_NAME,
      gender: result.GENDER,
      birthDate: result.BIRTH_DATE,
      birthTown: result.BIRTH_TOWN,
      birthCountry: result.BIRTH_COUNTRY,
      nationality: result.NATIONALITY,
      idCardNumber: result.ID_CARD_NUMBER,
      residenceAddress: result.RESIDENCE_ADR_1,
      residenceAddress2: result.RESIDENCE_ADR_2,
      residenceTown: result.RESIDENCE_TOWN,
      spouseName: result.SPOUSE_NAME,
      father: {
        firstName: result.FATHER_FIRST_NAME,
        lastName: result.FATHER_LAST_NAME,
        birthDate: result.FATHER_BIRTH_DATE,
        uin: result.FATHER_UIN,
      },
      mother: {
        firstName: result.MOTHER_FIRST_NAME,
        lastName: result.MOTHER_LAST_NAME,
        birthDate: result.MOTHER_BIRTH_DATE,
        uin: result.MOTHER_UIN,
      },
    },
  };
}

/**
 * Match Case - Verify specific attributes against NNI data
 * Returns only mismatched attributes
 */
async function handleMatchCase(
  request: MatchCaseRequest,
  baseUrl: string,
  apiKey: string,
  supabase: AnySupabaseClient
) {
  const { uin, lastName, firstName, birthDate, userId, verificationId } = request;

  if (!uin) {
    throw new Error('UIN requis');
  }

  if (!lastName && !firstName && !birthDate) {
    throw new Error('Au moins un attribut à vérifier requis (lastName, firstName, birthDate)');
  }

  console.log(`[ONECI] Match case for UIN: ${uin.substring(0, 4)}...`);

  if (verificationId) {
    await supabase
      .from('identity_verifications')
      .update({ status: 'processing' })
      .eq('id', verificationId);
  }

  // Build attributes to verify
  const attributes: Record<string, string> = {};
  if (lastName) attributes.LAST_NAME = lastName;
  if (firstName) attributes.FIRST_NAME = firstName;
  if (birthDate) attributes.BIRTH_DATE = birthDate;

  const response = await fetch(`${baseUrl}/person-features`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      UIN: uin,
      Operation: 'matchCase',
      Attributes: attributes,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[ONECI] Match case failed:', response.status, errorText);
    throw new Error(`Erreur API ONECI: ${response.status}`);
  }

  const errors = await response.json() as MatchCaseError[];
  
  // If no errors returned, all attributes match
  const allMatch = !errors || errors.length === 0;
  const mismatchedAttributes = errors?.map(e => e.AttributeName) || [];

  await supabase.rpc('log_api_usage', {
    p_service_name: 'oneci',
    p_action: 'match_case',
    p_status: allMatch ? 'success' : 'partial',
    p_request_data: { uin: uin.substring(0, 4) + '***', attributesChecked: Object.keys(attributes) },
    p_response_data: { allMatch, mismatchedCount: mismatchedAttributes.length },
    p_user_id: userId || null
  });

  // Calculate verification score based on matches
  const totalAttributes = Object.keys(attributes).length;
  const matchedCount = totalAttributes - mismatchedAttributes.length;
  const score = Math.round((matchedCount / totalAttributes) * 100);

  if (verificationId) {
    await supabase
      .from('identity_verifications')
      .update({
        status: allMatch ? 'verified' : (score >= 66 ? 'pending_review' : 'rejected'),
        verification_score: score,
        oneci_response: { errors, attributesChecked: attributes },
        verified_at: allMatch ? new Date().toISOString() : null,
        rejection_reason: allMatch ? null : `Attributs non correspondants: ${mismatchedAttributes.join(', ')}`
      })
      .eq('id', verificationId);
  }

  return {
    success: true,
    allMatch,
    score,
    attributesChecked: Object.keys(attributes),
    mismatchedAttributes,
    details: errors || [],
  };
}
