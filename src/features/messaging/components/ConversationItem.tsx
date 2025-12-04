import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Home, CheckCheck } from 'lucide-react';
import { Conversation } from '../services/messaging.service';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

function getDefaultAvatar(name: string | null) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'U')}&background=00A884&color=fff`;
}

function formatMessageTime(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  if (isYesterday(date)) {
    return 'Hier';
  }
  return format(date, 'dd/MM/yyyy', { locale: fr });
}

export function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  const { other_participant, property, last_message_preview, last_message_at, unread_count } = conversation;
  const participantName = other_participant?.full_name ?? 'Utilisateur';
  const hasUnread = (unread_count ?? 0) > 0;

  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-3 text-left transition-colors hover:bg-[#202C33] ${
        isSelected ? 'bg-[#2A3942]' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <img
          src={other_participant?.avatar_url ?? getDefaultAvatar(participantName)}
          alt={participantName}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0 border-b border-[#222D34] pb-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-[#E9EDEF] truncate">
              {participantName}
            </h4>
            <span className={`text-xs flex-shrink-0 ${hasUnread ? 'text-[#00A884]' : 'text-[#8696A0]'}`}>
              {formatMessageTime(last_message_at)}
            </span>
          </div>

          {/* Property context */}
          {property && (
            <div className="flex items-center gap-1 text-xs text-[#00A884] mt-0.5">
              <Home className="h-3 w-3" />
              <span className="truncate">{property.title}</span>
            </div>
          )}

          {/* Last message preview */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {/* Checkmarks for sent messages */}
              <CheckCheck className="h-4 w-4 text-[#53BDEB] flex-shrink-0" />
              <p className={`text-sm truncate ${hasUnread ? 'text-[#E9EDEF]' : 'text-[#8696A0]'}`}>
                {last_message_preview ?? 'Aucun message'}
              </p>
            </div>
            
            {/* Unread badge - WhatsApp green */}
            {hasUnread && (
              <span className="flex-shrink-0 bg-[#00A884] text-[#111B21] text-xs font-medium rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                {unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
