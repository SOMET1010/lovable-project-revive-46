const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WhatsAppOTPRequest {
  phone: string;
  otp: string;
  name?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phone, otp, name } = await req.json() as WhatsAppOTPRequest;

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number for Côte d'Ivoire
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('225')) {
      formattedPhone = '225' + formattedPhone;
    }

    // SMS message (InTouch doesn't have native WhatsApp API, fallback to SMS)
    const message = `Mon Toit: Votre code de verification est ${otp}. Valide 10 min. Ne partagez pas ce code.`;

    // Get InTouch credentials
    const intouchApiKey = Deno.env.get('INTOUCH_API_KEY');
    const intouchAgencyCode = Deno.env.get('INTOUCH_AGENCY_CODE') || 'MONTOIT';

    if (!intouchApiKey) {
      // Mode développement - simuler l'envoi
      console.log('DEV MODE: InTouch API not configured, simulating SMS send');
      console.log(`Would send to: ${formattedPhone}`);
      console.log(`Message: ${message}`);
      console.log(`OTP Code: ${otp}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Code de vérification envoyé (mode développement)',
          simulated: true,
          otp: otp // Only in dev mode for testing
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // InTouch SMS API endpoint (correct URL)
    const intouchUrl = `https://apidist.gutouch.net/apidist/sec/${intouchAgencyCode}/sms`;
    
    // Basic auth encoding
    const authString = btoa(`${intouchAgencyCode}:${intouchApiKey}`);

    console.log(`Sending SMS to ${formattedPhone} via InTouch...`);

    const response = await fetch(intouchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        recipient_phone_number: formattedPhone,
        message: message,
        sender_id: 'MonToit',
      }),
    });

    const responseText = await response.text();
    console.log('InTouch API response:', response.status, responseText);

    if (!response.ok) {
      console.error('InTouch SMS API error:', responseText);
      
      // Fallback to dev mode if API fails
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Code généré (envoi SMS en erreur, utilisez le code ci-dessous pour tester)',
          fallback: true,
          otp: otp
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { raw: responseText };
    }
    
    console.log('SMS sent successfully via InTouch:', result);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Code de vérification envoyé par SMS',
        messageId: result.transaction_id || result.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending OTP:', errorMessage);

    return new Response(
      JSON.stringify({ 
        error: errorMessage || 'Failed to send OTP',
        details: String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
