import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Home } from 'lucide-react';
import { Conversation } from '../services/messaging.service';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

function getDefaultAvatar(name: string | null) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'U')}&background=FF6C2F&color=fff`;
}

export function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  const { other_participant, property, last_message_preview, last_message_at, unread_count } = conversation;
  const participantName = other_participant?.full_name ?? null;

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left transition-colors border-b border-neutral-100 hover:bg-neutral-50 ${
        isSelected ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <img
          src={other_participant?.avatar_url ?? getDefaultAvatar(participantName)}
          alt={participantName ?? 'Utilisateur'}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-neutral-900 truncate">
              {participantName ?? 'Utilisateur'}
            </h4>
            <span className="text-xs text-neutral-500 flex-shrink-0">
              {last_message_at ? formatDistanceToNow(new Date(last_message_at), { addSuffix: true, locale: fr }) : ''}
            </span>
          </div>

          {/* Property context */}
          {property && (
            <div className="flex items-center gap-1 text-xs text-primary-600 mt-0.5">
              <Home className="h-3 w-3" />
              <span className="truncate">{property.title}</span>
            </div>
          )}

          {/* Last message preview */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <p className="text-sm text-neutral-600 truncate">
              {last_message_preview ?? 'Aucun message'}
            </p>
            {(unread_count ?? 0) > 0 && (
              <span className="flex-shrink-0 bg-primary-500 text-white text-xs font-medium rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                {unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
