import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { ConversationList } from '../components/ConversationList';
import { MessageThread } from '../components/MessageThread';
import { EmptyConversation } from '../components/EmptyConversation';
import { Conversation } from '../services/messaging.service';

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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
      // Create or get conversation
      getOrCreateConversation(toUserId, propertyId, subject).then((conv) => {
        if (conv) {
          setSelectedConversation(conv);
          setShowMobileThread(true);
          // Clear URL params
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500">Veuillez vous connecter pour accéder aux messages.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary-500" />
            Messages
          </h1>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden h-[calc(100vh-180px)]">
          <div className="flex h-full">
            {/* Conversation list - hidden on mobile when viewing thread */}
            <div
              className={`w-full lg:w-80 xl:w-96 flex-shrink-0 ${
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
      </div>
    </div>
  );
}
