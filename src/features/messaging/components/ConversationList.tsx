import { Search, MessageSquare, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { Conversation } from '../services/messaging.service';
import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
  loading: boolean;
}

export function ConversationList({ conversations, selectedId, onSelect, loading }: ConversationListProps) {
  const [search, setSearch] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
      conv.other_participant?.full_name?.toLowerCase().includes(searchLower) ??
      conv.property?.title?.toLowerCase().includes(searchLower) ??
      conv.subject?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#111B21]">
      {/* WhatsApp Header */}
      <div className="bg-[#202C33] px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#E9EDEF]">Mon Toit</h2>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-[#374248] rounded-full transition-colors">
            <MoreVertical className="h-5 w-5 text-[#AEBAC1]" />
          </button>
        </div>
      </div>

      {/* Search Bar - WhatsApp Style */}
      <div className="px-3 py-2 bg-[#111B21]">
        <div className="relative bg-[#202C33] rounded-lg flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-[#8696A0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher ou démarrer une discussion"
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm text-[#E9EDEF] placeholder-[#8696A0] focus:outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse px-3">
                <div className="w-12 h-12 bg-[#202C33] rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#202C33] rounded w-3/4" />
                  <div className="h-3 bg-[#202C33] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-[#3B4A54] mx-auto mb-3" />
            <p className="text-[#8696A0] text-sm">
              {search ? 'Aucune conversation trouvée' : 'Aucune conversation'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isSelected={selectedId === conv.id}
              onClick={() => onSelect(conv)}
            />
          ))
        )}
      </div>
    </div>
  );
}
