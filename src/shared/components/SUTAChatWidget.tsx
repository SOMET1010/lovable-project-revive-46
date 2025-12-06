import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';
import { getAIResponse } from '@/services/chatbotService';
import type { ChatMessage } from '@/shared/types/monToit.types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  'Comment fonctionne le Trust Score ?',
  'Comment trouver un appartement ?',
  'Quels documents fournir ?',
  'Comment contacter un propriétaire ?'
];

interface SUTAChatWidgetProps {
  className?: string;
}

/**
 * SUTAChatWidget - Assistant IA SUTA intégré
 * Style WhatsApp avec réponses IA via edge function
 */
export default function SUTAChatWidget({ className = '' }: SUTAChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Bonjour ! Je suis SUTA, votre assistant Mon Toit. Comment puis-je vous aider aujourd\'hui ? 🏠',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Convert messages to ChatMessage format for API
      const conversationHistory: ChatMessage[] = messages.map(msg => ({
        id: msg.id,
        conversationId: 'widget',
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        metadata: {},
        isRead: true
      }));

      const response = await getAIResponse({
        userMessage: content.trim(),
        conversationHistory,
        userId: 'anonymous'
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (_error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Désolé, je rencontre un problème technique. Veuillez réessayer ou contacter notre équipe directement.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div 
      className={`flex flex-col h-full ${className}`}
      style={{ 
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center gap-3 px-5 py-4"
        style={{ 
          backgroundColor: '#075E54',
          color: '#FFFFFF'
        }}
      >
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">SUTA - Assistant Mon Toit</p>
          <p className="text-xs opacity-80">En ligne • Répond instantanément</p>
        </div>
        <Sparkles className="w-5 h-5 opacity-60" />
      </div>

      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ 
          backgroundColor: '#ECE5DD',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23c8c4be\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`relative max-w-[85%] px-4 py-2.5 ${
                message.role === 'user' 
                  ? 'rounded-tl-2xl rounded-tr-sm rounded-bl-2xl rounded-br-2xl' 
                  : 'rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
              }`}
              style={{
                backgroundColor: message.role === 'user' ? '#DCF8C6' : '#FFFFFF',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Avatar for assistant */}
              {message.role === 'assistant' && (
                <div 
                  className="absolute -left-8 top-0 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#075E54' }}
                >
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}
              
              <p 
                className="text-sm leading-relaxed"
                style={{ color: '#303030' }}
              >
                {message.content}
              </p>
              <p 
                className="text-right mt-1"
                style={{ color: '#8696A0', fontSize: '11px' }}
              >
                {message.timestamp.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
                {message.role === 'user' && (
                  <span className="ml-1" style={{ color: '#34B7F1' }}>✓✓</span>
                )}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div 
              className="px-4 py-3 rounded-2xl"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions (show only at start) */}
      {messages.length <= 1 && (
        <div className="px-4 py-3 flex flex-wrap gap-2" style={{ backgroundColor: '#F5F5F5' }}>
          {QUICK_QUESTIONS.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#075E54',
                borderRadius: '16px',
                border: '1px solid #E0E0E0'
              }}
            >
              {question}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form 
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-3"
        style={{ backgroundColor: '#F0F0F0' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Posez votre question..."
          disabled={isLoading}
          className="flex-1 h-10 px-4 text-sm bg-white focus:outline-none disabled:opacity-50"
          style={{ 
            borderRadius: '20px',
            color: '#303030'
          }}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
          style={{ 
            backgroundColor: '#25D366',
            color: '#FFFFFF'
          }}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
