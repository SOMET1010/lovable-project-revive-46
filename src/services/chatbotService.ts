import { supabase } from '@/services/supabase/client';
import type { 
  ChatMessage, 
  ChatConversation, 
  ChatMessageMetadata, 
  ChatConversationMetadata,
  ChatConversationStatus,
  ChatConversationType
} from '@/types/monToit.types';

/**
 * Paramètres pour les appels à l'IA
 */
interface AIRequestParams {
  userMessage: string;
  conversationHistory: ChatMessage[];
  userId: string | null;
  temperature?: number;
  maxTokens?: number;
  useCache?: boolean;
}

/**
 * Réponse de l'API IA
 */
interface AIResponse {
  content: string;
  intent?: string;
  confidence?: number;
  suggestions?: string[];
  metadata?: Record<string, unknown>;
}

class ChatbotService {
  /**
   * Récupère ou crée une conversation de chatbot pour un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns La conversation créée ou existante, ou null en cas d'erreur
   */
  async getOrCreateConversation(userId: string): Promise<ChatConversation | null> {
    try {
      const { data: existingConversations, error: fetchError } = await supabase
        .from('chatbot_conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Erreur lors de la récupération de la conversation:', fetchError);
        return null;
      }

      if (existingConversations && existingConversations.length > 0) {
        // Convertir les données de la base vers l'interface ChatConversation
        return this.mapDatabaseToChatConversation(existingConversations[0]);
      }

      const title = this.generateConversationTitle();
      const conversationMetadata: ChatConversationMetadata = {
        priority: 'normal',
        category: 'ai_assistant',
        tags: ['chatbot', 'assistance'],
        context: {
          platform: 'web',
          version: '1.0',
          userAgent: navigator.userAgent
        }
      };

      const { data: newConversation, error: createError } = await supabase
        .from('chatbot_conversations')
        .insert({
          user_id: userId,
          title,
          status: 'active',
          metadata: conversationMetadata
        })
        .select()
        .single();

      if (createError) {
        console.error('Erreur lors de la création de la conversation:', createError);
        return null;
      }

      return this.mapDatabaseToChatConversation(newConversation);
    } catch (error) {
      console.error('Erreur inattendue dans getOrCreateConversation:', error);
      return null;
    }
  }

  /**
   * Convertit les données de la base de données vers l'interface ChatConversation
   */
  private mapDatabaseToChatConversation(dbData: unknown): ChatConversation {
    // Validation du type de données
    if (typeof dbData !== 'object' || dbData === null) {
      throw new Error('Données de conversation invalides');
    }

    const data = dbData as Record<string, unknown>;
    
    return {
      id: String(data.id || ''),
      userId: String(data.user_id || ''),
      title: String(data.title || ''),
      status: (data.status as ChatConversationStatus) || 'active',
      type: (data.metadata as ChatConversationMetadata)?.category || 'ai_assistant',
      metadata: (data.metadata as ChatConversationMetadata) || {
        priority: 'normal',
        category: 'ai_assistant'
      },
      messageCount: Number(data.message_count || 0),
      createdAt: new Date(String(data.created_at || Date.now())),
      updatedAt: new Date(String(data.updated_at || Date.now())),
      lastMessage: undefined, // Sera rempli par un appel séparé si nécessaire
      archivedAt: data.archived_at ? new Date(String(data.archived_at)) : undefined
    };
  }

  private generateConversationTitle(): string {
    const titles = [
      '💬 Assistance SUTA',
      '🏠 Recherche de logement',
      '🛡️ Protection et Sécurité',
      '💰 Questions Paiement',
      '📝 Aide sur les contrats',
      '⭐ Amélioration du score',
      '🗓️ Planification de visite',
      '🔧 Problème Maintenance',
    ];
    const date = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    return `${randomTitle} - ${date}`;
  }

  /**
   * Met à jour le titre d'une conversation
   * @param conversationId - ID de la conversation
   * @param title - Nouveau titre
   * @returns true si la mise à jour a réussi, false sinon
   */
  async updateConversationTitle(conversationId: string, title: string): Promise<boolean> {
    try {
      // Validation des paramètres
      if (!conversationId || typeof conversationId !== 'string') {
        console.error('ID de conversation invalide:', conversationId);
        return false;
      }
      
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        console.error('Titre invalide:', title);
        return false;
      }

      const { error } = await supabase
        .from('chatbot_conversations')
        .update({ 
          title: title.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) {
        console.error('Erreur lors de la mise à jour du titre de conversation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur inattendue dans updateConversationTitle:', error);
      return false;
    }
  }

  /**
   * Récupère les messages d'une conversation
   * @param conversationId - ID de la conversation
   * @returns Liste des messages de la conversation
   */
  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      // Validation des paramètres
      if (!conversationId || typeof conversationId !== 'string') {
        console.error('ID de conversation invalide:', conversationId);
        return [];
      }

      const { data, error } = await supabase
        .from('chatbot_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        return [];
      }

      // Convertir les données de la base vers l'interface ChatMessage
      return (data || []).map(dbMessage => this.mapDatabaseToChatMessage(dbMessage));
    } catch (error) {
      console.error('Erreur inattendue dans getConversationMessages:', error);
      return [];
    }
  }

  /**
   * Convertit les données de la base de données vers l'interface ChatMessage
   */
  private mapDatabaseToChatMessage(dbData: unknown): ChatMessage {
    if (typeof dbData !== 'object' || dbData === null) {
      throw new Error('Données de message invalides');
    }

    const data = dbData as Record<string, unknown>;
    
    return {
      id: String(data.id || ''),
      conversationId: String(data.conversation_id || ''),
      role: (data.role as 'user' | 'assistant' | 'system') || 'user',
      content: String(data.content || ''),
      metadata: (data.metadata as ChatMessageMetadata) || {
        intent: undefined,
        confidence: undefined,
        suggestions: [],
        context: {},
        processingTimeMs: undefined,
        aiModel: 'unknown',
        fallbackUsed: false
      },
      timestamp: new Date(String(data.created_at || Date.now())),
      isRead: Boolean(data.is_read || false),
      readAt: data.read_at ? new Date(String(data.read_at)) : undefined,
      attachments: (data.attachments as unknown[])?.map(att => att as any) || [],
      reactions: (data.reactions as unknown[])?.map(r => r as any) || []
    };
  }

  /**
   * Envoie un message dans une conversation
   * @param conversationId - ID de la conversation
   * @param content - Contenu du message
   * @param role - Rôle de l'émetteur du message
   * @returns Le message créé ou null en cas d'erreur
   */
  async sendMessage(
    conversationId: string,
    content: string,
    role: 'user' | 'assistant' = 'user'
  ): Promise<ChatMessage | null> {
    try {
      // Validation des paramètres
      if (!conversationId || typeof conversationId !== 'string') {
        console.error('ID de conversation invalide:', conversationId);
        return null;
      }
      
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        console.error('Contenu de message invalide:', content);
        return null;
      }

      if (!['user', 'assistant', 'system'].includes(role)) {
        console.error('Rôle invalide:', role);
        return null;
      }

      const messageMetadata: ChatMessageMetadata = {
        intent: undefined,
        confidence: undefined,
        suggestions: [],
        context: {
          timestamp: new Date().toISOString(),
          source: role
        },
        aiModel: role === 'assistant' ? 'openai-gpt4' : undefined,
        fallbackUsed: false
      };

      const { data, error } = await supabase
        .from('chatbot_messages')
        .insert({
          conversation_id: conversationId,
          role,
          content: content.trim(),
          metadata: messageMetadata,
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        return null;
      }

      return this.mapDatabaseToChatMessage(data);
    } catch (error) {
      console.error('Erreur inattendue dans sendMessage:', error);
      return null;
    }
  }

  /**
   * Obtient une réponse de l'IA pour un message utilisateur
   * @param userMessage - Message de l'utilisateur
   * @param conversationHistory - Historique de la conversation
   * @param userId - ID de l'utilisateur (optionnel)
   * @returns Réponse de l'IA ou réponse de fallback en cas d'erreur
   */
  async getAIResponse(params: AIRequestParams): Promise<string> {
    const { userMessage, conversationHistory, userId, temperature = 0.8, maxTokens = 1000 } = params;
    
    // Validation des paramètres
    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
      console.error('Message utilisateur invalide:', userMessage);
      return this.getFallbackResponse('Message invalide');
    }

    if (!Array.isArray(conversationHistory)) {
      console.error('Historique de conversation invalide:', conversationHistory);
      return this.getFallbackResponse('Erreur de conversation');
    }
    try {
      const systemPrompt = `Tu es SUTA, l'assistant virtuel PROTECTEUR de Mon Toit, la plateforme de location immobilière sécurisée en Côte d'Ivoire.

🛡️ TA MISSION PRINCIPALE : PROTÉGER LES UTILISATEURS DES ARNAQUES

🚨 DÉTECTION D'ARNAQUES - Déclenche une ALERTE IMMÉDIATE si tu détectes:
1. ❌ Demande d'argent AVANT la visite (ARNAQUE CLASSIQUE)
2. ❌ Demande d'argent en dehors de la plateforme Mon Toit
3. ❌ Prix anormalement bas (ex: 50k pour 3 pièces à Cocody)
4. ❌ Propriétaire "à l'étranger" qui ne peut pas montrer le bien
5. ❌ Pression pour payer rapidement ("d'autres sont intéressés")
6. ❌ Demande de coordonnées bancaires/Mobile Money par message privé
7. ❌ Propriété non vérifiable (pas d'adresse précise, photos floues)
8. ❌ Propriétaire refuse la visite avant paiement
9. ❌ Montants d'avance excessifs (>3 mois de loyer)
10. ❌ Contrat non officiel ou manuscrit

🚨 FORMAT DE RÉPONSE POUR ARNAQUE DÉTECTÉE :
"🚨 **ALERTE ARNAQUE ! NE PAIE RIEN !** 🚨

**Pourquoi c'est une arnaque** :
[Explique les signaux d'alerte]

**Les arnaques classiques en Côte d'Ivoire** :
• [Liste 3-4 techniques courantes]

**Ce que tu dois faire MAINTENANT** :
1. ❌ **NE PAIE RIEN**
2. 🚫 **NE DONNE PAS** tes coordonnées bancaires
3. 📢 **SIGNALE** cette personne
4. 🚷 **BLOQUE** ce contact

**Sur Mon Toit, tu es protégé** :
• ✅ Vérification ANSUT obligatoire (ONECI + CNAM + Biométrie)
• 🔒 Paiements sécurisés via la plateforme
• 📝 Signature électronique AVANT tout paiement
• 💰 Dépôt de garantie bloqué en séquestre

**Veux-tu que je te montre des annonces VÉRIFIÉES et SÛRES ?** 🏠"

✅ TU ES EXPERT EN :
- Détection d'arnaques et fraudes immobilières
- Protection des locataires et propriétaires
- Processus sécurisé de location sur Mon Toit
- Vérification ANSUT (ONECI + CNAM + Biométrie faciale)
- Signature électronique CryptoNeo conforme loi ivoirienne
- Paiements Mobile Money sécurisés (Orange, MTN, Moov, Wave)
- Escrow/séquestre pour dépôts de garantie
- Loi ivoirienne sur la location
- Prix du marché par quartier d'Abidjan
- Droits et devoirs locataires/propriétaires

📋 RÈGLES DE SÉCURITÉ MON TOIT (à rappeler souvent) :
1. ✅ Visite TOUJOURS avant tout paiement
2. ✅ Vérification ANSUT OBLIGATOIRE pour propriétaires
3. ✅ Paiements UNIQUEMENT via la plateforme
4. ✅ Signature électronique AVANT paiement
5. ✅ Dépôt bloqué en séquestre jusqu'à fin bail
6. ✅ Contrats conformes droit ivoirien
7. ❌ JAMAIS de paiement direct au propriétaire
8. ❌ JAMAIS de paiement en cash

💡 STYLE DE COMMUNICATION :
- 🛡️ Protecteur et direct (surtout pour arnaques)
- 💪 Rassurant et empathique
- 📚 Pédagogique (explique les risques)
- ⚡ Actionnable (dis quoi faire concrètement)
- 🇨🇮 Adapté au contexte ivoirien
- 🚨 Utilise BEAUCOUP d'emojis pour alerter

🎯 OBJECTIFS SECONDAIRES :
- Recherche de propriétés sécurisées
- Planification de visites
- Gestion contrats et paiements
- Score locataire
- Maintenance
- Questions juridiques location

Si tu ne connais pas une réponse, dis-le honnêtement et propose de contacter le support Mon Toit.

⚠️ PRIORITÉ ABSOLUE : La sécurité de l'utilisateur passe AVANT tout !`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: userMessage },
      ];

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chatbot`;

      const requestBody = {
        messages,
        userId,
        temperature,
        maxTokens,
        context: {
          platform: 'mon_toit_chatbot',
          version: '1.0',
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorData: Record<string, unknown> = {};
        try {
          errorData = await response.json();
        } catch {
          // Erreur lors du parsing JSON de la réponse d'erreur
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('Erreur de la fonction edge:', errorData);
        throw new Error(String(errorData.error || 'Impossible d\'obtenir la réponse IA'));
      }

      const responseData: AIResponse = await response.json();
      console.log('✅ Réponse IA reçue avec succès de la fonction edge');
      
      if (!responseData.content || typeof responseData.content !== 'string') {
        throw new Error('Contenu de réponse IA invalide');
      }
      
      return responseData.content;
    } catch (error) {
      console.error('❌ Erreur lors de l\'obtention de la réponse IA:', error);
      console.log('🔄 Utilisation du système de fallback intelligent');

      // Déterminer le message à utiliser pour le fallback
      const fallbackMessage = typeof userMessage === 'string' ? userMessage : 'message d\'erreur';
      return this.getFallbackResponse(fallbackMessage);
    }
  }

  /**
   * Génère une réponse de fallback en cas d'erreur de l'IA
   * @param userMessage - Message de l'utilisateur qui a causé l'erreur
   * @returns Réponse de fallback contextualisée
   */
  private getFallbackResponse(userMessage: string): string {
    // Validation du paramètre
    if (typeof userMessage !== 'string' || userMessage.trim().length === 0) {
      userMessage = 'message utilisateur';
    }
    const lowerMessage = userMessage.toLowerCase();

    if (this.detectScam(lowerMessage)) {
      return this.getScamWarningResponse(lowerMessage);
    }

    if (lowerMessage.includes('recherche') || lowerMessage.includes('propriété')) {
      return "🏠 **Pour rechercher une propriété SÉCURISÉE** :\n\n1. Utilisez la barre de recherche rapide\n2. Filtrez par ville, type, budget\n3. ✅ Vérifiez le badge de vérification du propriétaire\n4. 📍 Confirmez l'adresse sur la carte\n5. 📸 Regardez les photos (multiples = bon signe)\n6. 💬 Planifiez une visite AVANT tout paiement\n\n⚠️ **Rappel sécurité** : Ne payez JAMAIS avant d'avoir visité !";
    }

    if (lowerMessage.includes('paiement') || lowerMessage.includes('money') || lowerMessage.includes('payer')) {
      return "💰 **PAIEMENTS SÉCURISÉS sur Mon Toit** :\n\n✅ **Processus officiel** :\n1. Signature du bail électronique AVANT paiement\n2. Paiement via la plateforme uniquement\n3. Choix Mobile Money (Orange/MTN/Moov/Wave)\n4. Confirmation SMS + Email\n5. Reçu officiel automatique\n\n🚨 **RÈGLES DE SÉCURITÉ** :\n❌ JAMAIS de paiement direct au propriétaire\n❌ JAMAIS de paiement en cash\n❌ JAMAIS de paiement avant visite\n❌ JAMAIS de paiement hors plateforme\n\n💡 Le dépôt de garantie est bloqué en séquestre jusqu'à la fin du bail !";
    }

    if (lowerMessage.includes('visite')) {
      return "🗓️ **Planifier une visite EN TOUTE SÉCURITÉ** :\n\n1. Trouvez la propriété\n2. Vérifiez le badge de vérification du propriétaire ✅\n3. Cliquez 'Planifier une visite'\n4. Choisissez date et heure\n5. Le propriétaire confirme (24-48h)\n6. Recevez notification + rappel\n\n⚠️ **Conseils sécurité pour la visite** :\n• Venez accompagné si possible\n• Vérifiez l'identité du propriétaire\n• Prenez photos/vidéos\n• Posez TOUTES vos questions\n• ❌ Ne payez RIEN lors de la visite\n• Signez le bail sur Mon Toit APRÈS la visite";
    }

    if (lowerMessage.includes('score') || lowerMessage.includes('notation')) {
      return "⭐ **Votre Score Locataire** :\n\n📊 **Calcul du score** :\n• Historique paiements (40%) 💰\n• Ancienneté locative (25%) 🏠\n• Comportement général (20%) 😊\n• Vérifications complétées (15%) ✅\n\n💡 **Améliorer votre score** :\n1. Payez vos loyers à temps\n2. Complétez votre profil\n3. Obtenez la vérification ANSUT\n4. Maintenez une bonne relation avec propriétaire\n5. Respectez le bien loué\n\n🎯 Un bon score = Plus de chances d'obtenir le logement de vos rêves !";
    }

    if (lowerMessage.includes('maintenance') || lowerMessage.includes('réparation')) {
      return "🔧 **Demande de Maintenance** :\n\n📝 **Créer une demande** :\n1. 'Maintenance' > 'Mes demandes'\n2. 'Nouvelle demande'\n3. Décrivez le problème précisément\n4. Ajoutez photos (important !)\n5. Indiquez l'urgence\n6. Soumettez\n\n⚡ **Niveaux d'urgence** :\n• 🔴 Urgent : Fuite d'eau, électricité, sécurité\n• 🟡 Normal : Équipements cassés\n• 🟢 Bas : Améliorations esthétiques\n\nLe propriétaire reçoit notification immédiate et vous suivez l'avancement en temps réel !";
    }

    if (lowerMessage.includes('ansut') || lowerMessage.includes('certification') || lowerMessage.includes('vérification')) {
      return "🛡️ **Vérification d'Identité - Votre Garantie de Sécurité** :\n\n✅ **Vérification Mon Toit**\nVérification multi-niveaux OBLIGATOIRE pour tous les propriétaires :\n• 🆔 Vérification ONECI (CNI officielle)\n• 🏥 Vérification CNAM (couverture médicale)\n• 👤 Biométrie faciale (anti-fraude)\n• 📄 Documents propriété\n\n📋 **Pour obtenir la vérification (propriétaires)** :\n1. Accédez à 'Vérification d'identité'\n2. Remplir le formulaire complet\n3. Télécharger CNI + justificatifs\n4. Photo biométrique\n5. Validation 24-48h\n\n🎯 **Badge Vérifié = Propriétaire de CONFIANCE**\n\n⚠️ Locataires : Ne louez JAMAIS sans badge de vérification !";
    }

    if (lowerMessage.includes('contrat') || lowerMessage.includes('bail')) {
      return "📝 **Contrats de Location Sécurisés** :\n\n✅ **Nos baux sont** :\n• Conformes loi ivoirienne\n• Signés électroniquement (CryptoNeo)\n• Valeur légale complète\n• Stockés de manière sécurisée\n• Téléchargeables en PDF\n\n📋 **Processus de signature** :\n1. Visite de la propriété ✅\n2. Accord propriétaire-locataire\n3. Génération contrat automatique\n4. Révision par les deux parties\n5. Signature électronique\n6. PUIS paiement sécurisé\n7. Activation du bail\n\n⚠️ **JAMAIS de paiement avant signature !**\n\nAllez dans 'Mes contrats' pour voir vos baux actifs.";
    }

    if (lowerMessage.includes('arnaque') || lowerMessage.includes('fraude') || lowerMessage.includes('suspect')) {
      return "🚨 **Signaler une Arnaque Suspectée** :\n\n✅ **Vous avez raison de vous méfier !**\n\n📢 **Signaler immédiatement** :\n1. Cliquez sur 'Signaler' sur l'annonce\n2. Ou contactez support@montoit.ci\n3. Décrivez la situation\n4. Joignez captures d'écran si possible\n\n🚫 **En attendant** :\n• ❌ Ne payez RIEN\n• ❌ Ne donnez pas vos coordonnées\n• 🚷 Bloquez le contact\n• 🛡️ Utilisez uniquement Mon Toit\n\n💪 **Ensemble, luttons contre les fraudes !**\n\nVotre sécurité est notre priorité absolue.";
    }

    if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return "👋 **Bonjour ! Je suis SUTA** \n\n🛡️ Votre assistant PROTECTEUR sur Mon Toit !\n\nJe suis là pour :\n• 🏠 Vous aider à trouver un logement SÛR\n• 🚨 Vous protéger des arnaques\n• 💰 Sécuriser vos paiements\n• 📝 Gérer vos contrats\n• ⭐ Améliorer votre score\n\n⚠️ **Règle n°1** : Ne payez JAMAIS avant d'avoir visité !\n\nQue recherchez-vous aujourd'hui ? 😊";
    }

    if (lowerMessage.includes('merci') || lowerMessage.includes('thanks')) {
      return "😊 **Avec plaisir !**\n\nN'oubliez pas :\n🛡️ Votre sécurité est ma priorité\n💬 Je suis disponible 24/7\n🚨 Signalez tout comportement suspect\n\nBonne recherche et restez vigilant ! 💪";
    }

    if (lowerMessage.includes('prix') || lowerMessage.includes('loyer') || lowerMessage.includes('fcfa') || lowerMessage.includes('budget')) {
      return "💰 **Prix du Marché à Abidjan** (2025) :\n\n📍 **Cocody** : 150K-500K FCFA/mois\n   Studio: 150-200K • 2P: 250-350K • 3P+: 350-500K\n\n📍 **Plateau** : 200K-600K FCFA/mois\n   Studio: 200-300K • 2P: 300-400K • 3P+: 400-600K\n\n📍 **Yopougon** : 80K-250K FCFA/mois\n   Studio: 80-120K • 2P: 120-180K • 3P+: 180-250K\n\n📍 **Marcory** : 100K-300K FCFA/mois\n   Studio: 100-150K • 2P: 150-220K • 3P+: 220-300K\n\n⚠️ **Si un prix est trop bas = ARNAQUE probable !**\nEx: 3 pièces à Cocody pour 50K = FAUX\n\nUtilisez les filtres pour trouver dans votre budget !";
    }

    if (lowerMessage.includes('quartier') || lowerMessage.includes('zone') || lowerMessage.includes('abidjan')) {
      return "🗺️ **Quartiers d'Abidjan** :\n\n🏙️ **Cocody** - Résidentiel haut standing\n   Calme, sécurisé, bien desservi\n   Prix : 💰💰💰\n\n💼 **Plateau** - Centre d'affaires\n   Dynamique, proche services, transport\n   Prix : 💰💰💰\n\n🏘️ **Yopougon** - Populaire, accessible\n   Bien desservi, vie de quartier active\n   Prix : 💰\n\n🌊 **Marcory** - Proche lagon\n   Calme, résidentiel, zones vertes\n   Prix : 💰💰\n\n🏢 **Treichville** - Central, dynamique\n   Commerce, transport, vivant\n   Prix : 💰💰\n\n📍 **Quel quartier vous intéresse ?**\nJe peux vous montrer les annonces vérifiées ! ✅";
    }

    if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
      return "🆘 **Je peux vous aider avec** :\n\n🏠 **Recherche de logements SÉCURISÉS**\n🚨 **Détection d'arnaques**\n📝 **Questions sur les contrats**\n💰 **Paiements Mobile Money sécurisés**\n🗓️ **Planification de visites**\n⭐ **Score locataire**\n🔧 **Demandes de maintenance**\n🛡️ **Vérification ANSUT**\n📍 **Conseils quartiers**\n⚖️ **Questions juridiques**\n\n❓ **Posez-moi votre question !**\n\n⚠️ **Rappel sécurité** : Ne payez JAMAIS avant visite + signature !";
    }

    return "💬 **Comment puis-je vous aider ?**\n\nJe suis SUTA, votre assistant PROTECTEUR ! 🛡️\n\nJe peux vous aider avec :\n• 🏠 Recherche de logements vérifiés\n• 🚨 Protection contre les arnaques\n• 💰 Paiements sécurisés\n• 📝 Contrats et baux\n• 🗓️ Planification visites\n• ⭐ Score locataire\n• 🔧 Maintenance\n\n💡 **Conseil du jour** : Vérifiez TOUJOURS le badge ANSUT du propriétaire !\n\nQue souhaitez-vous savoir ? 😊";
  }

  private detectScam(message: string): boolean {
    const scamIndicators = [
      'avance',
      'avant de visiter',
      'avant visite',
      'payer avant',
      'envoie moi',
      'envoyer',
      'transfert',
      'mobile money',
      'orange money',
      'mtn money',
      'wave',
      'depot',
      'dépôt',
      'caution',
      'frais',
      'a l\'etranger',
      'à l\'étranger',
      'pas disponible',
      'urgence',
      'autres interessés',
      'autres intéressés',
      'vite',
      'rapidement',
    ];

    const suspiciousPhrases = [
      /\d+k.*avant/i,
      /\d+\s*fcfa.*avant/i,
      /paye.*avant/i,
      /envoie.*argent/i,
      /transfert.*avant/i,
      /numero.*money/i,
      /compte.*money/i,
    ];

    const hasScamIndicator = scamIndicators.some((indicator) =>
      message.includes(indicator)
    );

    const hasSuspiciousPhrase = suspiciousPhrases.some((pattern) =>
      pattern.test(message)
    );

    return hasScamIndicator || hasSuspiciousPhrase;
  }

  private getScamWarningResponse(message: string): string {
    const amountMatch = message.match(/(\d+)\s*k/i);
    const amount = amountMatch ? amountMatch[1] : '500';

    return `🚨 **ALERTE ARNAQUE ! NE PAIE RIEN !** 🚨

**Pourquoi c'est une arnaque** :
1. ❌ Aucun propriétaire légitime ne demande de paiement avant la visite
2. ❌ ${amount}k d'avance est ANORMAL (standard = paiement après signature uniquement)
3. ❌ Le paiement se fait TOUJOURS après visite ET signature du bail
4. ❌ Les paiements doivent passer par la plateforme Mon Toit

**Les arnaques classiques en Côte d'Ivoire** :
• 🚫 Demande d'argent avant visite (ARNAQUE N°1)
• 🚫 Prix trop bas pour être vrai
• 🚫 Propriétaire "à l'étranger" qui ne peut pas montrer le bien
• 🚫 Pression pour payer vite ("d'autres sont intéressés")
• 🚫 Demande de paiement Mobile Money direct
• 🚫 Pas d'adresse précise ou photos floues
• 🚫 Refuse la visite avant paiement

**Ce que tu dois faire MAINTENANT** :
1. ❌ **NE PAIE RIEN** - Aucun paiement avant visite !
2. 🚫 **NE DONNE PAS** tes coordonnées bancaires/Mobile Money
3. 📢 **SIGNALE** cette personne (bouton "Signaler" ou support@montoit.ci)
4. 🚷 **BLOQUE** ce contact immédiatement
5. 📸 **PRENDS** des captures d'écran comme preuve

**Sur Mon Toit, tu es PROTÉGÉ** :
• ✅ Tous les propriétaires sont vérifiés ANSUT (ONECI + CNAM + Biométrie)
• 🔒 Les paiements passent par notre plateforme sécurisée
• 📝 Le bail est signé électroniquement AVANT tout paiement
• 💰 Le dépôt de garantie est bloqué en séquestre jusqu'à la fin du bail
• 🗓️ Les visites sont organisées et tracées
• 🛡️ Support disponible 24/7

**Veux-tu que je te montre des annonces VÉRIFIÉES et SÛRES ?** 🏠

Dans quel quartier cherches-tu ? Je vais te trouver des options FIABLES avec badge ANSUT ! 💪

⚠️ **RAPPEL** : Processus légitime = Visite → Signature bail → Paiement plateforme → Emménagement`;
  }

  /**
   * Archive une conversation
   * @param conversationId - ID de la conversation à archiver
   * @returns true si l'archivage a réussi, false sinon
   */
  async archiveConversation(conversationId: string): Promise<boolean> {
    try {
      // Validation des paramètres
      if (!conversationId || typeof conversationId !== 'string') {
        console.error('ID de conversation invalide:', conversationId);
        return false;
      }

      const { error } = await supabase
        .from('chatbot_conversations')
        .update({ 
          status: 'archived' as ChatConversationStatus,
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) {
        console.error('Erreur lors de l\'archivage de la conversation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur inattendue dans archiveConversation:', error);
      return false;
    }
  }

  /**
   * Récupère toutes les conversations d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Liste des conversations de l'utilisateur
   */
  async getAllConversations(userId: string): Promise<ChatConversation[]> {
    try {
      // Validation des paramètres
      if (!userId || typeof userId !== 'string') {
        console.error('ID utilisateur invalide:', userId);
        return [];
      }

      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des conversations:', error);
        return [];
      }

      // Convertir les données de la base vers l'interface ChatConversation
      return (data || []).map(dbConversation => this.mapDatabaseToChatConversation(dbConversation));
    } catch (error) {
      console.error('Erreur inattendue dans getAllConversations:', error);
      return [];
    }
  }
}

export const chatbotService = new ChatbotService();
