import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';
import { Message } from '../services/messaging.service';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
      {/* Bubble with tail */}
      <div
        className={`relative max-w-[85%] md:max-w-[65%] px-3 py-2 shadow-sm ${
          isOwn
            ? 'bg-[#005C4B] text-[#E9EDEF] rounded-lg rounded-tr-none'
            : 'bg-[#202C33] text-[#E9EDEF] rounded-lg rounded-tl-none'
        }`}
      >
        {/* Bubble tail */}
        <div
          className={`absolute top-0 w-3 h-3 overflow-hidden ${
            isOwn ? '-right-2' : '-left-2'
          }`}
        >
          <div
            className={`w-4 h-4 transform rotate-45 ${
              isOwn ? 'bg-[#005C4B] -translate-x-2' : 'bg-[#202C33] translate-x-1'
            }`}
          />
        </div>

        {/* Message content */}
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
        
        {/* Time and read status */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[11px] text-[#8696A0]">
            {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
          </span>
          {isOwn && (
            message.is_read ? (
              <CheckCheck className="h-4 w-4 text-[#53BDEB]" />
            ) : (
              <Check className="h-4 w-4 text-[#8696A0]" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
