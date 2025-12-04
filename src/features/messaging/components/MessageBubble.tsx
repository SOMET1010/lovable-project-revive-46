import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';
import { Message } from '../services/messaging.service';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function getDefaultAvatar(name: string | null) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'U')}&background=FF6C2F&color=fff`;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const senderName = message.sender?.full_name ?? null;
  
  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {!isOwn && (
        <img
          src={message.sender?.avatar_url ?? getDefaultAvatar(senderName)}
          alt={message.sender?.full_name ?? 'Utilisateur'}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      )}

      {/* Bubble */}
      <div
        className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
          isOwn
            ? 'bg-primary-500 text-white rounded-br-md'
            : 'bg-neutral-100 text-neutral-900 rounded-bl-md'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        
        <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-white/70' : 'text-neutral-400'}`}>
          <span className="text-xs">
            {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
          </span>
          {isOwn && (
            message.is_read ? (
              <CheckCheck className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
