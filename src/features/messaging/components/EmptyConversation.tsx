import { MessageSquare } from 'lucide-react';

export function EmptyConversation() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-neutral-50 p-8">
      <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="h-10 w-10 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Vos messages</h3>
      <p className="text-neutral-500 text-center max-w-sm">
        Sélectionnez une conversation pour afficher les messages ou démarrez-en une nouvelle depuis une annonce.
      </p>
    </div>
  );
}
