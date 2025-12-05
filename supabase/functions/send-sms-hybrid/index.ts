import { ServiceManager, ServiceConfig } from '../_shared/serviceManager.ts';
import { edgeLogger } from '../_shared/logger.ts';
import type { SMSRequest, SMSHandlerParams, SMSSuccessResponse } from '../_shared/types/sms.types.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InTouchSMSResponse {
  message_id?: string;
  id?: string;
  transaction_id?: string;
}

interface BrevoSMSResponse {
  messageId: string;
  reference?: string;
}

interface AzureSMSResult {
  successful: boolean;
  messageId?: string;
  errorMessage?: string;
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
    const handlers: Record<string, (config: ServiceConfig, params: SMSHandlerParams) => Promise<SMSSuccessResponse>> = {
      intouch: async (config: ServiceConfig, params: SMSHandlerParams): Promise<SMSSuccessResponse> => {
        const agencyCode = Deno.env.get('INTOUCH_AGENCY_CODE');
        const apiKey = Deno.env.get('INTOUCH_API_KEY');

        if (!agencyCode || !apiKey) {
          throw new Error('InTouch credentials not configured (INTOUCH_AGENCY_CODE, INTOUCH_API_KEY)');
        }

        // InTouch SMS API - URL correcte
        const intouchUrl = `https://apidist.gutouch.net/apidist/sec/${agencyCode}/sms`;
        edgeLogger.info('InTouch SMS request', { url: intouchUrl, phone: params.phoneNumber });

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
          edgeLogger.error('InTouch SMS error', undefined, { status: response.status, error: errorText });
          throw new Error(`InTouch SMS failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json() as InTouchSMSResponse;
        edgeLogger.info('InTouch SMS success', { messageId: data.message_id || data.id });

        return {
          success: true,
          messageId: data.message_id || data.id || data.transaction_id,
          provider: 'intouch',
        };
      },

      azure: async (config: ServiceConfig, params: SMSHandlerParams): Promise<SMSSuccessResponse> => {
        const { SmsClient } = await import('https://esm.sh/@azure/communication-sms');
        const connectionString = Deno.env.get('AZURE_COMMUNICATION_CONNECTION_STRING');

        if (!connectionString) {
          throw new Error('Azure Communication connection string not configured');
        }

        const client = new SmsClient(connectionString);
        const configWithFrom = config.config as { from?: string } | undefined;

        const sendResults = await client.send({
          from: configWithFrom?.from || '+1234567890',
          to: [params.phoneNumber],
          message: params.message,
        }) as AzureSMSResult[];

        if (!sendResults[0]?.successful) {
          throw new Error(`Azure SMS failed: ${sendResults[0]?.errorMessage}`);
        }

        return {
          success: true,
          messageId: sendResults[0].messageId,
          provider: 'azure',
        };
      },

      brevo: async (config: ServiceConfig, params: SMSHandlerParams): Promise<SMSSuccessResponse> => {
        const apiKey = Deno.env.get('BREVO_API_KEY');

        if (!apiKey) {
          throw new Error('Brevo API key not configured');
        }

        edgeLogger.info('Brevo SMS request', { phone: params.phoneNumber });
        
        const configWithSender = config.config as { sender?: string } | undefined;
        
        // Correct Brevo SMS endpoint: /sms (not /send)
        const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            sender: (configWithSender?.sender || params.sender || 'ANSUT').substring(0, 11),
            recipient: params.phoneNumber,
            content: params.message,
            type: 'transactional'
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          edgeLogger.error('Brevo SMS error', undefined, { status: response.status, error: errorText });
          try {
            const errorData = JSON.parse(errorText) as { message?: string };
            throw new Error(`Brevo SMS failed: ${errorData.message || response.statusText}`);
          } catch {
            throw new Error(`Brevo SMS failed: ${response.status} - ${errorText}`);
          }
        }

        const result = await response.json() as BrevoSMSResponse;
        edgeLogger.info('Brevo SMS success', { messageId: result.messageId });
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    edgeLogger.error('Error sending SMS with hybrid system', error instanceof Error ? error : undefined);

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: 'All SMS providers failed. Please check service configuration.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
