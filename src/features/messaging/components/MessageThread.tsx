import { useEffect, useRef } from 'react';
import { Home, ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { Message, Conversation, Attachment } from '../services/messaging.service';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { SoundToggle } from './SoundToggle';

interface MessageThreadProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  loading: boolean;
  sending: boolean;
  onSend: (receiverId: string, content: string, attachment?: Attachment | null) => Promise<unknown>;
  onBack?: () => void;
}

function getDefaultAvatar(name: string | null) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'U')}&background=00A884&color=fff`;
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

  const handleSend = async (content: string, attachment?: Attachment | null) => {
    await onSend(otherParticipantId, content, attachment);
  };

  const participantName = conversation.other_participant?.full_name ?? 'Utilisateur';

  return (
    <div className="flex flex-col h-full bg-[#0B141A]">
      {/* WhatsApp Header - Green */}
      <div className="px-4 py-2 bg-[#202C33] flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1 hover:bg-[#374248] rounded-full transition-colors lg:hidden"
          >
            <ArrowLeft className="h-6 w-6 text-[#AEBAC1]" />
          </button>
        )}
        
        <img
          src={conversation.other_participant?.avatar_url ?? getDefaultAvatar(participantName)}
          alt={participantName}
          className="w-10 h-10 rounded-full object-cover"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[#E9EDEF] truncate">
            {participantName}
          </h3>
          <p className="text-xs text-[#8696A0]">en ligne</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <SoundToggle />
          <button className="p-2 hover:bg-[#374248] rounded-full transition-colors">
            <Video className="h-5 w-5 text-[#AEBAC1]" />
          </button>
          <button className="p-2 hover:bg-[#374248] rounded-full transition-colors">
            <Phone className="h-5 w-5 text-[#AEBAC1]" />
          </button>
          <button className="p-2 hover:bg-[#374248] rounded-full transition-colors">
            <MoreVertical className="h-5 w-5 text-[#AEBAC1]" />
          </button>
        </div>
      </div>

      {/* Messages - WhatsApp Background Pattern */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 whatsapp-chat-bg">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#00A884] border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-[#8696A0]">Aucun message</p>
            <p className="text-[#667781] text-sm mt-1">
              Commencez la conversation !
            </p>
          </div>
        ) : (
          <>
            {/* Subject banner - WhatsApp yellow style */}
            {conversation.subject && (
              <div className="bg-[#FFF3C4]/90 rounded-lg p-2 text-center mx-auto max-w-md mb-4 shadow-sm">
                <p className="text-xs text-[#54656F]">{conversation.subject}</p>
              </div>
            )}

            {/* Property context banner */}
            {conversation.property && (
              <div className="bg-[#202C33] rounded-lg p-3 mx-auto max-w-md mb-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-[#00A884]/20 rounded-lg flex items-center justify-center">
                  <Home className="h-6 w-6 text-[#00A884]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#E9EDEF] truncate">{conversation.property.title}</p>
                  <p className="text-xs text-[#8696A0]">Bien immobilier</p>
                </div>
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
