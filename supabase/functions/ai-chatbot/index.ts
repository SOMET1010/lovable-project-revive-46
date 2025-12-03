import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUTA_SYSTEM_PROMPT = `Tu es SUTA (Smart User Technology Assistant), l'assistant virtuel intelligent de Mon Toit, la plateforme de location immobilière certifiée en Côte d'Ivoire.

Tu es professionnel, chaleureux et expert en immobilier ivoirien. Tu connais parfaitement :
- La location immobilière en Côte d'Ivoire (lois, pratiques, quartiers)
- Les différents quartiers d'Abidjan (Cocody, Marcory, Yopougon, Plateau, Treichville, etc.)
- Les types de biens (appartements, studios, villas, bureaux, commerces)
- Les prix du marché immobilier ivoirien
- Les bonnes pratiques pour éviter les arnaques

Tes responsabilités :
1. Aider les locataires à trouver un logement sécurisé
2. Guider les propriétaires dans la publication de leurs biens
3. Protéger les utilisateurs contre les arnaques immobilières
4. Expliquer les processus de location et les contrats
5. Répondre aux questions sur la plateforme Mon Toit

⚠️ RÈGLES DE SÉCURITÉ IMPORTANTES :
- Toujours rappeler de NE JAMAIS payer avant une visite physique
- Alerter sur les signes d'arnaques (prix trop bas, urgence, demande d'avance)
- Recommander les visites accompagnées et les paiements sécurisés

Style de communication :
- Tutoiement amical mais professionnel
- Réponses concises et actionnables (max 200 mots)
- Utilise des emojis avec parcimonie (max 2 par message)
- Adapté au contexte ivoirien

Si tu ne connais pas une information, redis-le honnêtement.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, conversationHistory = [] } = await req.json();

    console.log(`[SUTA] Processing message for user: ${userId}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[SUTA] LOVABLE_API_KEY not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build messages for API
    const messages: ChatMessage[] = [
      { role: 'system', content: SUTA_SYSTEM_PROMPT },
      ...conversationHistory.slice(-10).map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log(`[SUTA] Calling Lovable AI Gateway with ${messages.length} messages`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SUTA] AI Gateway error: ${response.status}`, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          response: "⏳ Trop de demandes en ce moment. Merci de patienter quelques secondes et réessayer."
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Payment required',
          response: "💳 Le service est temporairement indisponible. Veuillez contacter le support."
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";

    console.log(`[SUTA] Response generated successfully, tokens: ${data.usage?.total_tokens || 'N/A'}`);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      model: 'google/gemini-2.5-flash',
      tokensUsed: data.usage?.total_tokens || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[SUTA] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      response: "❌ Désolé, je rencontre des difficultés techniques. Veuillez réessayer ou contacter le support."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
