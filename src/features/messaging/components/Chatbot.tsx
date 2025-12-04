import { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Trash2,
  Loader,
  Home,
  Calendar,
  CreditCard,
  FileText,
  HelpCircle,
  Sparkles,
  Clock,
  Shield,
  LogIn,
} from 'lucide-react';
import { chatbotService } from '@/services/chatbotService';
import type { ChatMessage as ChatMessageType, ChatConversation } from '@/shared/types/monToit.types';
import { useAuth } from '@/app/providers/AuthProvider';
import ChatMessage from './ChatMessage';
import sutaAvatar from '@/assets/suta-avatar.jpg';
import { supabase } from '@/services/supabase/client';
import { toast } from 'sonner';

interface QuickAction {
  icon: typeof Shield;
  label: string;
  message: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    icon: Home,
    label: 'Rechercher un logement',
    message: 'Je cherche un logement sécurisé. Peux-tu m\'aider ?',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Shield,
    label: 'Sécurité & Arnaques',
    message: 'Comment puis-je me protéger des arnaques immobilières ?',
    color: 'from-red-500 to-red-600',
  },
  {
    icon: Calendar,
    label: 'Planifier une visite',
    message: 'Comment planifier une visite en toute sécurité ?',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: CreditCard,
    label: 'Paiements sécurisés',
    message: 'Comment fonctionnent les paiements sur Mon Toit ?',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    icon: FileText,
    label: 'Contrats & Baux',
    message: 'J\'ai des questions sur les contrats de location',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: HelpCircle,
    label: 'Aide générale',
    message: 'J\'ai besoin d\'aide avec la plateforme',
    color: 'from-gray-500 to-gray-600',
  },
];

const suggestionPrompts = [
  'Comment fonctionne la vérification d\'identité ?',
  'Quels sont les prix moyens à Abidjan ?',
  'Comment améliorer mon score locataire ?',
  'Que faire en cas de problème de maintenance ?',
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  
  // Guest mode state
  const [guestMessages, setGuestMessages] = useState<ChatMessageType[]>([]);
  const [guestSessionId] = useState(() => 
    `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  const isAuthenticated = !!user;
  const currentMessages = isAuthenticated ? messages : guestMessages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // Load conversation for authenticated users
  useEffect(() => {
    if (isOpen && user && !conversation) {
      loadConversation();
      loadConversations();
    }
  }, [isOpen, user]);

  // Welcome message for guests
  useEffect(() => {
    if (isOpen && !isAuthenticated && guestMessages.length === 0) {
      const welcomeMessage: ChatMessageType = {
        id: 'welcome-guest',
        conversationId: 'guest',
        role: 'assistant',
        content: `🛡️ **Bonjour ! Je suis SUTA, votre assistant Mon Toit.**

Je suis là pour vous aider à :
• 🏠 Trouver des conseils sur la location
• 🚨 Éviter les arnaques immobilières
• 💡 Répondre à vos questions générales

📝 **Connectez-vous** pour sauvegarder vos conversations et accéder à plus de fonctionnalités !

Comment puis-je vous aider ?`,
        timestamp: new Date(),
        isRead: true,
        metadata: {
          aiModel: 'system'
        }
      };
      setGuestMessages([welcomeMessage]);
      setShowQuickActions(true);
    }
  }, [isOpen, isAuthenticated, guestMessages.length]);

  const loadConversations = async () => {
    if (!user) return;
    const convs = await chatbotService.getAllConversations(user.id);
    setConversations(convs);
  };

  const loadConversation = async () => {
    if (!user) return;

    const conv = await chatbotService.getOrCreateConversation(user.id);
    if (conv) {
      setConversation(conv);
      const msgs = await chatbotService.getConversationMessages(conv.id);
      setMessages(msgs);

      if (msgs.length === 0) {
        const welcomeMessage: ChatMessageType = {
          id: 'welcome',
          conversationId: conv.id,
          role: 'assistant',
          content: `🛡️ **Bonjour ! Je suis SUTA, votre assistant protecteur Mon Toit.**

Je suis là pour vous aider à :
• 🏠 Trouver un logement **SÉCURISÉ**
• 🚨 Vous **PROTÉGER** des arnaques
• 💰 Gérer vos paiements en toute sécurité
• 📝 Comprendre vos contrats et baux
• ⭐ Améliorer votre score locataire

**⚠️ Règle n°1 : Ne payez JAMAIS avant d'avoir visité !**

Comment puis-je vous aider aujourd'hui ? 😊`,
          timestamp: new Date(),
          metadata: {
            intent: undefined,
            confidence: undefined,
            suggestions: [],
            context: {},
            aiModel: 'system',
            fallbackUsed: false
          },
          isRead: true
        };
        setMessages([welcomeMessage]);
        setShowQuickActions(true);
      } else {
        setShowQuickActions(false);
      }
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend) return;

    setInputMessage('');
    setIsLoading(true);
    setShowQuickActions(false);

    // Guest mode - no database persistence
    if (!isAuthenticated) {
      const userMsg: ChatMessageType = {
        id: `guest_user_${Date.now()}`,
        conversationId: 'guest',
        role: 'user',
        content: textToSend,
        timestamp: new Date(),
        isRead: true,
        metadata: {}
      };
      setGuestMessages(prev => [...prev, userMsg]);

      try {
        const response = await fetch(
          `${import.meta.env['VITE_SUPABASE_URL']}/functions/v1/ai-chatbot`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: textToSend,
              userId: guestSessionId,
              conversationHistory: guestMessages.slice(-10).map(m => ({
                role: m.role,
                content: m.content
              }))
            })
          }
        );
        
        if (!response.ok) {
          throw new Error('AI response failed');
        }
        
        const data = await response.json();
        
        const assistantMsg: ChatMessageType = {
          id: `guest_assistant_${Date.now()}`,
          conversationId: 'guest',
          role: 'assistant',
          content: data.response || "Désolé, une erreur s'est produite.",
          timestamp: new Date(),
          isRead: true,
          metadata: { aiModel: 'google/gemini-2.5-flash' }
        };
        setGuestMessages(prev => [...prev, assistantMsg]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        const errorMsg: ChatMessageType = {
          id: `guest_error_${Date.now()}`,
          conversationId: 'guest',
          role: 'assistant',
          content: '❌ Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans quelques instants.',
          timestamp: new Date(),
          isRead: true,
          metadata: {}
        };
        setGuestMessages(prev => [...prev, errorMsg]);
      }
      
      setIsLoading(false);
      inputRef.current?.focus();
      return;
    }

    // Authenticated mode - with database persistence
    if (!conversation || !user) return;

    const userMessage = await chatbotService.sendMessage(
      conversation.id,
      textToSend,
      'user'
    );

    if (userMessage) {
      setMessages((prev) => [...prev, userMessage]);
    }

    try {
      const aiResponse = await chatbotService.getAIResponse({
        userMessage: textToSend,
        conversationHistory: messages,
        userId: user.id
      });

      const assistantMessage = await chatbotService.sendMessage(
        conversation.id,
        aiResponse,
        'assistant'
      );

      if (assistantMessage) {
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = await chatbotService.sendMessage(
        conversation.id,
        '❌ Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans quelques instants ou contacter le support à support@montoit.ci',
        'assistant'
      );
      if (errorMessage) {
        setMessages((prev) => [...prev, errorMessage]);
      }
    }

    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.message);
  };

  const handleSuggestion = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleNewConversation = async () => {
    if (!user || !conversation) return;

    await chatbotService.archiveConversation(conversation.id);
    setConversation(null);
    setMessages([]);
    setShowQuickActions(true);
    await loadConversation();
    await loadConversations();
  };

  const switchConversation = async (conv: ChatConversation) => {
    setConversation(conv);
    const msgs = await chatbotService.getConversationMessages(conv.id);
    setMessages(msgs);
    setShowHistory(false);
    setShowQuickActions(false);
  };

  // Handle feedback submission
  const handleFeedback = async (
    rating: 'positive' | 'negative',
    messageId: string,
    question: string,
    response: string
  ) => {
    try {
      const { error } = await supabase.from('suta_feedback').insert({
        message_id: messageId,
        conversation_id: conversation?.id || null,
        user_id: user?.id || null,
        session_id: !user ? guestSessionId : null,
        rating,
        question,
        response
      });

      if (error) {
        console.error('Feedback error:', error);
        return;
      }

      toast.success(rating === 'positive' 
        ? 'Merci pour votre retour positif ! 👍' 
        : 'Merci, nous allons améliorer nos réponses ! 🙏'
      );

      // Update analytics
      await supabase.rpc('upsert_suta_analytics', {
        p_category: 'feedback',
        p_topic: rating,
        p_is_positive: rating === 'positive'
      });

    } catch (err) {
      console.error('Error saving feedback:', err);
    }
  };

  // Get the previous user message for a given assistant message index
  const getPreviousUserMessage = (index: number): string | undefined => {
    for (let i = index - 1; i >= 0; i--) {
      const msg = currentMessages[i];
      if (msg?.role === 'user') {
        return msg.content;
      }
    }
    return undefined;
  };

  return (
    <>
      {/* Bouton flottant avec avatar SUTA */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Ouvrir le chat SUTA"
        >
          <div className="relative">
            <img
              src={sutaAvatar}
              alt="SUTA Assistant"
              className="w-16 h-16 rounded-full border-4 border-white shadow-2xl object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <span className="absolute -top-1 -right-1 bg-green-500 w-5 h-5 rounded-full animate-pulse border-2 border-white" />
            <span className="absolute -bottom-1 -left-1 bg-gradient-to-r from-terracotta-500 to-coral-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
              SUTA
            </span>
          </div>
        </button>
      )}

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[420px] h-[650px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-200 animate-scale-in overflow-hidden">
          {/* Header avec avatar SUTA */}
          <div className="bg-gradient-to-r from-terracotta-500 via-coral-500 to-terracotta-600 text-white p-4 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <img
                  src={sutaAvatar}
                  alt="SUTA"
                  className="w-12 h-12 rounded-full border-2 border-white/50 object-cover shadow-lg"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  SUTA
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </h3>
                <p className="text-xs text-white/90 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Assistant Protecteur • En ligne
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 relative z-10">
              {/* History button - only for authenticated users */}
              {isAuthenticated && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors relative"
                  title="Historique"
                >
                  <Clock className="h-5 w-5" />
                  {conversations.length > 1 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-terracotta-800 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {conversations.length}
                    </span>
                  )}
                </button>
              )}
              {/* New conversation button - only for authenticated users */}
              {isAuthenticated && (
                <button
                  onClick={handleNewConversation}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Nouvelle conversation"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Fermer le chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Guest login banner */}
          {!isAuthenticated && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-amber-800 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Connectez-vous pour sauvegarder vos conversations
              </span>
              <a 
                href="/connexion" 
                className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 transition-colors"
              >
                <LogIn className="h-3 w-3" />
                Se connecter
              </a>
            </div>
          )}

          {/* Historique des conversations - only for authenticated users */}
          {isAuthenticated && showHistory && (
            <div className="bg-gray-50 border-b border-gray-200 p-3 max-h-48 overflow-y-auto">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Conversations récentes</h4>
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => switchConversation(conv)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      conv.id === conversation?.id
                        ? 'bg-terracotta-100 border border-terracotta-300'
                        : 'bg-white hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">{conv.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(conv.updatedAt).toLocaleDateString('fr-FR')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Zone des messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {currentMessages.map((message, index) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp instanceof Date ? message.timestamp.toISOString() : String(message.timestamp)}
                isNew={index === currentMessages.length - 1}
                messageId={message.id}
                previousUserMessage={getPreviousUserMessage(index)}
                onFeedback={handleFeedback}
              />
            ))}

            {/* Indicateur de chargement avec avatar SUTA */}
            {isLoading && (
              <div className="flex gap-3">
                <img
                  src={sutaAvatar}
                  alt="SUTA"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 border-2 border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin text-terracotta-500" />
                    <span className="text-sm text-gray-600">SUTA analyse votre demande...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions rapides */}
            {showQuickActions && currentMessages.length <= 1 && (
              <div className="animate-fade-in">
                <div className="text-center mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    💬 Actions rapides
                  </h4>
                  <p className="text-xs text-gray-500">
                    Choisissez une option ou posez votre question
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action)}
                      className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border-2 border-gray-200 hover:border-terracotta-400 hover:shadow-md transition-all group"
                    >
                      <div className={`bg-gradient-to-br ${action.color} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-gray-600 mb-2">
                    💡 Suggestions
                  </h4>
                  <div className="space-y-2">
                    {suggestionPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestion(prompt)}
                        className="w-full text-left p-2 px-3 bg-white rounded-lg border border-gray-200 hover:border-terracotta-400 hover:bg-terracotta-50 transition-all text-xs text-gray-700"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question à SUTA..."
                className="flex-1 resize-none border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 max-h-24 text-sm transition-all"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-terracotta-500 to-coral-500 text-white p-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Envoyer le message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">
                🛡️ Assistance sécurisée 24/7 par IA
              </p>
              <p className="text-xs text-gray-400">
                Alimenté par Lovable AI
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
