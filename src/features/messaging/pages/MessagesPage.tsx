import { useSearchParams } from 'react-router-dom';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toUserId = searchParams.get('to');
  const subject = searchParams.get('subject');

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
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
        
        {/* Interface de messagerie */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-100">
          {toUserId ? (
            <div className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <p className="text-sm text-primary-800 font-medium">
                  Nouvelle conversation
                </p>
                {subject && (
                  <p className="text-sm text-primary-700 mt-1">
                    Sujet : {subject}
                  </p>
                )}
              </div>
              
              {/* Zone de message */}
              <div className="border border-neutral-200 rounded-xl p-4 min-h-[200px] bg-neutral-50">
                <p className="text-neutral-500 text-sm">
                  La fonctionnalité de messagerie est en cours de développement...
                </p>
              </div>
              
              {/* Zone de saisie */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled
                />
                <Button variant="primary" disabled>
                  Envoyer
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">
                Sélectionnez une conversation ou démarrez-en une nouvelle.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
