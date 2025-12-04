import { ServiceManager, ServiceConfig } from '../_shared/serviceManager.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SMSRequest {
  phoneNumber: string;
  message: string;
  sender?: string;
}

function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '225' + cleaned;
  }

  if (!cleaned.startsWith('225')) {
    cleaned = '225' + cleaned;
  }

  return '+' + cleaned;
}

function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  const validPrefixes = ['07', '05', '054', '055', '056', '01', '227'];
  return validPrefixes.some(prefix =>
    cleaned.startsWith(prefix) || cleaned.startsWith('225' + prefix)
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phoneNumber, message, sender = 'MonToit' } = await req.json() as SMSRequest;

    if (!phoneNumber || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: phoneNumber, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (message.length > 160) {
      return new Response(
        JSON.stringify({ error: 'Message too long (max 160 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const serviceManager = new ServiceManager();

    // Define handlers for each SMS provider
    const handlers = {
      intouch: async (config: ServiceConfig, params: { phoneNumber: string; message: string; sender: string }) => {
        const agencyCode = Deno.env.get('INTOUCH_AGENCY_CODE');
        const apiKey = Deno.env.get('INTOUCH_API_KEY');

        if (!agencyCode || !apiKey) {
          throw new Error('InTouch credentials not configured (INTOUCH_AGENCY_CODE, INTOUCH_API_KEY)');
        }

        // InTouch SMS API - URL correcte
        const intouchUrl = `https://apidist.gutouch.net/apidist/sec/${agencyCode}/sms`;
        console.log('📤 InTouch SMS request to:', intouchUrl);

        const response = await fetch(intouchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${agencyCode}:${apiKey}`)}`,
          },
          body: JSON.stringify({
            recipient_phone_number: params.phoneNumber.replace('+', ''),
            message: params.message,
            sender_id: config.config?.sender || params.sender || 'MonToit',
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ InTouch SMS error:', errorText);
          throw new Error(`InTouch SMS failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ InTouch SMS success:', data);

        return {
          success: true,
          messageId: data.message_id || data.id || data.transaction_id,
          provider: 'intouch',
        };
      },

      azure: async (config: ServiceConfig, params: any) => {
        const { SmsClient } = await import('https://esm.sh/@azure/communication-sms');
        const connectionString = Deno.env.get('AZURE_COMMUNICATION_CONNECTION_STRING');

        if (!connectionString) {
          throw new Error('Azure Communication connection string not configured');
        }

        const client = new SmsClient(connectionString);

        const sendResults = await client.send({
          from: config.config.from || '+1234567890',
          to: [params.phoneNumber],
          message: params.message,
        });

        if (!sendResults[0].successful) {
          throw new Error(`Azure SMS failed: ${sendResults[0].errorMessage}`);
        }

        return {
          success: true,
          messageId: sendResults[0].messageId,
          provider: 'azure',
        };
      },

      brevo: async (config: ServiceConfig, params: any) => {
        const apiKey = Deno.env.get('BREVO_API_KEY');

        if (!apiKey) {
          throw new Error('Brevo API key not configured');
        }

        console.log('📤 Brevo SMS request to:', params.phoneNumber);
        
        // Correct Brevo SMS endpoint: /sms (not /send)
        const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            sender: (config.config?.sender || params.sender || 'ANSUT').substring(0, 11),
            recipient: params.phoneNumber,
            content: params.message,
            type: 'transactional'
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Brevo SMS error:', response.status, errorText);
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(`Brevo SMS failed: ${errorData.message || response.statusText}`);
          } catch {
            throw new Error(`Brevo SMS failed: ${response.status} - ${errorText}`);
          }
        }

        const result = await response.json();
        console.log('✅ Brevo SMS success:', result);
        return {
          success: true,
          messageId: result.messageId,
          reference: result.reference,
          provider: 'brevo',
        };
      },
    };

    // Execute with automatic fallback
    const result = await serviceManager.executeWithFallback(
      'sms',
      handlers,
      { phoneNumber: formattedPhone, message, sender }
    );

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error sending SMS with hybrid system:', error);

    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'All SMS providers failed. Please check service configuration.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
