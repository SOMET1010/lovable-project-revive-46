import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

interface KnowledgeEntry {
  question: string;
  answer: string;
  category: string;
}

// Detect category from user message
function detectCategory(message: string): string {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('arnaque') || lowerMsg.includes('fraude') || lowerMsg.includes('escroquerie') || lowerMsg.includes('sécurité')) {
    return 'securite';
  }
  if (lowerMsg.includes('contrat') || lowerMsg.includes('bail') || lowerMsg.includes('signature')) {
    return 'contrat';
  }
  if (lowerMsg.includes('payer') || lowerMsg.includes('loyer') || lowerMsg.includes('paiement') || lowerMsg.includes('argent')) {
    return 'paiement';
  }
  if (lowerMsg.includes('quartier') || lowerMsg.includes('abidjan') || lowerMsg.includes('cocody') || lowerMsg.includes('marcory')) {
    return 'quartiers';
  }
  if (lowerMsg.includes('document') || lowerMsg.includes('dossier') || lowerMsg.includes('papier')) {
    return 'location';
  }
  
  return 'general';
}

// Extract keywords from message for knowledge search
function extractKeywords(message: string): string[] {
  const stopWords = ['je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'à', 'au', 'aux', 'et', 'ou', 'mais', 'donc', 'car', 'ni', 'que', 'qui', 'quoi', 'comment', 'pourquoi', 'est', 'sont', 'suis', 'es', 'ai', 'as', 'a', 'avons', 'avez', 'ont', 'pour', 'dans', 'sur', 'avec', 'sans', 'par', 'en', 'ne', 'pas', 'plus', 'moins', 'très', 'bien', 'mal', 'tout', 'tous', 'toute', 'toutes', 'ce', 'cette', 'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses'];
  
  return message
    .toLowerCase()
    .replace(/[^\w\sàâäéèêëïîôùûüç]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 5);
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

    // Initialize Supabase client for knowledge base
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search knowledge base for relevant information
    let knowledgeContext = '';
    const category = detectCategory(message);
    const keywords = extractKeywords(message);

    try {
      // Search by category and keywords
      const { data: knowledgeEntries } = await supabase
        .from('suta_knowledge_base')
        .select('question, answer, category, id')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(5);

      if (knowledgeEntries && knowledgeEntries.length > 0) {
        // Filter entries that match keywords or category
        const relevantEntries = knowledgeEntries.filter((entry: KnowledgeEntry) => {
          const entryText = `${entry.question} ${entry.answer}`.toLowerCase();
          const categoryMatch = entry.category === category;
          const keywordMatch = keywords.some(kw => entryText.includes(kw));
          return categoryMatch || keywordMatch;
        }).slice(0, 3);

        if (relevantEntries.length > 0) {
          knowledgeContext = `
📚 INFORMATIONS PERTINENTES DE LA BASE DE CONNAISSANCES :
${relevantEntries.map((entry: KnowledgeEntry) => `
Q: ${entry.question}
R: ${entry.answer}
`).join('\n')}

Utilise ces informations si elles sont pertinentes pour répondre à la question de l'utilisateur.
`;
          console.log(`[SUTA] Found ${relevantEntries.length} relevant knowledge entries`);
          
          // Update usage count for used entries
          for (const entry of relevantEntries) {
            const entryWithId = entry as KnowledgeEntry & { id: string };
            await supabase
              .from('suta_knowledge_base')
              .update({ usage_count: supabase.rpc('increment_usage', { row_id: entryWithId.id }) })
              .eq('id', entryWithId.id);
          }
        }
      }

      // Log analytics
      await supabase.rpc('upsert_suta_analytics', {
        p_category: category,
        p_topic: keywords[0] || 'general',
        p_is_positive: null
      });

    } catch (kbError) {
      console.log('[SUTA] Knowledge base lookup skipped:', kbError);
    }

    // Build enriched system prompt
    const enrichedSystemPrompt = SUTA_SYSTEM_PROMPT + knowledgeContext;

    // Build messages for API
    const messages: ChatMessage[] = [
      { role: 'system', content: enrichedSystemPrompt },
      ...conversationHistory.slice(-10).map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log(`[SUTA] Calling Lovable AI Gateway with ${messages.length} messages, category: ${category}`);

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

    console.log(`[SUTA] Response generated successfully, tokens: ${data.usage?.total_tokens || 'N/A'}, category: ${category}`);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      model: 'google/gemini-2.5-flash',
      tokensUsed: data.usage?.total_tokens || 0,
      category: category
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
