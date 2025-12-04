import { useEffect, useRef } from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { Message, Conversation } from '../services/messaging.service';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

interface MessageThreadProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  loading: boolean;
  sending: boolean;
  onSend: (receiverId: string, content: string) => Promise<unknown>;
  onBack?: () => void;
}

export function MessageThread({
  conversation,
  messages,
  currentUserId,
  loading,
  sending,
  onSend,
  onBack,
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const otherParticipantId =
    conversation.participant_1_id === currentUserId
      ? conversation.participant_2_id
      : conversation.participant_1_id;

  const handleSend = async (content: string) => {
    await onSend(otherParticipantId, content);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-neutral-200 flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-lg transition-colors lg:hidden"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-600" />
          </button>
        )}
        
        <img
          src={
            conversation.other_participant?.avatar_url ??
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              conversation.other_participant?.full_name ?? 'U'
            )}&background=FF6C2F&color=fff`
          }
          alt={conversation.other_participant?.full_name ?? 'Utilisateur'}
          className="w-10 h-10 rounded-full object-cover"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 truncate">
            {conversation.other_participant?.full_name ?? 'Utilisateur'}
          </h3>
          {conversation.property && (
            <div className="flex items-center gap-1 text-xs text-primary-600">
              <Home className="h-3 w-3" />
              <span className="truncate">{conversation.property.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-neutral-500">Aucun message</p>
            <p className="text-neutral-400 text-sm mt-1">
              Commencez la conversation !
            </p>
          </div>
        ) : (
          <>
            {/* Subject banner if exists */}
            {conversation.subject && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 text-center">
                <p className="text-sm text-primary-800">{conversation.subject}</p>
              </div>
            )}
            
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} sending={sending} />
    </div>
  );
}
