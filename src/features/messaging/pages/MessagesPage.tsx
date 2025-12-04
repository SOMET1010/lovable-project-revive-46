import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { ConversationList } from '../components/ConversationList';
import { MessageThread } from '../components/MessageThread';
import { EmptyConversation } from '../components/EmptyConversation';
import { Conversation } from '../services/messaging.service';

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  
  const { conversations, loading: loadingConversations, getOrCreateConversation } = useConversations();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showMobileThread, setShowMobileThread] = useState(false);
  
  const { messages, loading: loadingMessages, sending, sendMessage } = useMessages(
    selectedConversation?.id ?? null
  );

  // Handle URL parameters for creating new conversation
  useEffect(() => {
    const toUserId = searchParams.get('to');
    const propertyId = searchParams.get('property');
    const subject = searchParams.get('subject');

    if (toUserId && user?.id) {
      getOrCreateConversation(toUserId, propertyId, subject).then((conv) => {
        if (conv) {
          setSelectedConversation(conv);
          setShowMobileThread(true);
          setSearchParams({});
        }
      });
    }
  }, [searchParams, user?.id, getOrCreateConversation, setSearchParams]);

  // Update selected conversation when conversations list updates
  useEffect(() => {
    if (selectedConversation && conversations.length > 0) {
      const updated = conversations.find((c) => c.id === selectedConversation.id);
      if (updated) {
        setSelectedConversation(updated);
      }
    }
  }, [conversations, selectedConversation]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setShowMobileThread(true);
  };

  const handleBack = () => {
    setShowMobileThread(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#111B21] flex items-center justify-center">
        <p className="text-[#8696A0]">Veuillez vous connecter pour accéder aux messages.</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#111B21] flex flex-col overflow-hidden">
      {/* Main content - Full height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list - hidden on mobile when viewing thread */}
        <div
          className={`w-full lg:w-[420px] flex-shrink-0 border-r border-[#222D34] ${
            showMobileThread ? 'hidden lg:block' : ''
          }`}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation?.id ?? null}
            onSelect={handleSelectConversation}
            loading={loadingConversations}
          />
        </div>

        {/* Message thread */}
        <div
          className={`flex-1 ${
            !showMobileThread ? 'hidden lg:block' : ''
          }`}
        >
          {selectedConversation ? (
            <MessageThread
              conversation={selectedConversation}
              messages={messages}
              currentUserId={user.id}
              loading={loadingMessages}
              sending={sending}
              onSend={sendMessage}
              onBack={handleBack}
            />
          ) : (
            <EmptyConversation />
          )}
        </div>
      </div>
    </div>
  );
}
