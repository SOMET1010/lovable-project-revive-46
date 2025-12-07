import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, Paperclip, Bot } from 'lucide-react';
import { getAIResponse } from '@/services/chatbotService';
import type { ChatMessage } from '@/shared/types/monToit.types';

// --- TYPES ---

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface SUTAChatWidgetProps {
  /** Mode d'affichage : 'floating' (bulle en bas) ou 'embedded' (intégré dans une div) */
  mode?: 'floating' | 'embedded';
  /** Position si mode floating */
  position?: 'bottom-right' | 'bottom-left';
  /** Classe CSS additionnelle */
  className?: string;
}

// --- CONSTANTES ---

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  text: "Bonjour ! Je suis SUTA, votre assistant immobilier personnel. Je peux vous aider à trouver un bien, estimer un loyer ou contacter une agence. Que souhaitez-vous faire ?",
  sender: 'ai',
  timestamp: new Date(),
};

const QUICK_ACTIONS = [
  "🏠 Trouver un logement",
  "💰 Estimer mon budget",
  "📞 Parler à un agent",
  "📄 Dossier locataire"
];

// --- COMPOSANT ---

export default function SUTAChatWidget({
  mode = 'floating',
  position = 'bottom-right',
  className = '',
}: SUTAChatWidgetProps) {
  // États
  const [isOpen, setIsOpen] = useState(mode === 'embedded');
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs pour le scroll auto
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Si on passe en mode embedded, on force l'ouverture
  useEffect(() => {
    if (mode === 'embedded') setIsOpen(true);
  }, [mode]);

  // --- LOGIQUE IA RÉELLE ---

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim() || isTyping) return;

    // 1. Ajouter message utilisateur
    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Convertir les messages au format ChatMessage pour l'API
      const conversationHistory: ChatMessage[] = messages.map(msg => ({
        id: msg.id,
        conversationId: 'widget',
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.text,
        timestamp: msg.timestamp,
        metadata: {},
        isRead: true
      }));

      // Appel IA réel via Lovable AI Gateway (Gemini 2.5 Flash)
      const response = await getAIResponse({
        userMessage: textToSend,
        conversationHistory,
        userId: 'anonymous'
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      // Gestion des erreurs (429, 402, technique)
      let errorText = '❌ Problème technique. Veuillez réessayer.';
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          errorText = '⏳ Trop de demandes, réessayez dans quelques secondes.';
        } else if (error.message.includes('402')) {
          errorText = '💳 Crédit épuisé. Veuillez contacter notre équipe.';
        }
      }
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- RENDER ---

  // Classes de positionnement pour le mode Floating
  const floatingClasses = mode === 'floating' 
    ? `fixed z-50 ${position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6'}`
    : 'relative w-full h-full';

  // Si fermé en mode floating, afficher juste le bouton
  if (mode === 'floating' && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed z-50 ${position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6'} w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 bg-primary`}
        aria-label="Ouvrir le chat SUTA"
      >
        <MessageSquare className="w-8 h-8 text-primary-foreground" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full border-2 border-background animate-pulse"></span>
      </button>
    );
  }

  return (
    <div className={`${floatingClasses} ${className} flex flex-col font-sans`}>
      <div className={`flex flex-col bg-background overflow-hidden shadow-2xl ${mode === 'floating' ? 'w-[380px] h-[600px] max-h-[80vh] rounded-3xl' : 'w-full h-full rounded-3xl border border-border'}`}>
        
        {/* HEADER */}
        <div className="p-4 flex items-center justify-between text-white relative overflow-hidden shrink-0 bg-[#2C1810]">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Assistant SUTA</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-white/80">En ligne</span>
              </div>
            </div>
          </div>

          {mode === 'floating' && (
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10"
              aria-label="Fermer le chat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F4] relative">
          {/* Date separator */}
          <div className="flex justify-center my-2">
            <span className="text-[10px] text-muted-foreground bg-white/50 px-2 py-1 rounded-full">Aujourd'hui</span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                  : 'bg-background text-foreground border border-border rounded-tl-sm'
              }`}>
                {msg.text}
                <p className="text-right mt-1 text-[10px] opacity-60">
                  {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  {msg.sender === 'user' && <span className="ml-1 text-sky-400">✓✓</span>}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-background border border-border rounded-2xl rounded-tl-sm p-3 shadow-sm flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* QUICK ACTIONS (Chips) */}
        <div className="bg-[#FAF7F4] px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action}
              onClick={() => handleSendMessage(action)}
              disabled={isTyping}
              className="whitespace-nowrap px-3 py-1.5 bg-background border border-border rounded-full text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors shadow-sm flex-shrink-0 disabled:opacity-50"
            >
              {action}
            </button>
          ))}
        </div>

        {/* INPUT AREA */}
        <div className="p-3 bg-background border-t border-border shrink-0">
          <div className="flex items-center gap-2 bg-muted p-2 rounded-2xl border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <button 
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-background"
              aria-label="Ajouter une pièce jointe"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Écrivez votre message..."
              disabled={isTyping}
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50"
            />
            <button 
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              className={`p-2 rounded-full transition-all ${
                inputValue.trim() && !isTyping
                  ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-md' 
                  : 'bg-muted-foreground/30 text-muted-foreground cursor-not-allowed'
              }`}
              aria-label="Envoyer le message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 
              Powered by Mon Toit AI
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
