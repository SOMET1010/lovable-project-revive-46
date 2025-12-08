import { useState } from 'react';
import { XCircle, X, Loader2 } from 'lucide-react';

interface RejectMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  loading: boolean;
}

export default function RejectMaintenanceModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  loading 
}: RejectMaintenanceModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  const quickReasons = [
    "Demande non pertinente pour ce type de bien",
    "Le problème relève de la responsabilité du locataire",
    "Travaux déjà effectués récemment",
    "Budget insuffisant actuellement",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-2xl border border-border shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Refuser la demande</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        
        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Raison du refus *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquez pourquoi vous refusez cette demande..."
              required
              rows={3}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Le locataire recevra cette explication
            </p>
          </div>
          
          {/* Quick Reasons */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Raisons fréquentes :</p>
            <div className="flex flex-wrap gap-2">
              {quickReasons.map((qr, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(qr)}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs text-muted-foreground transition-colors"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-muted hover:bg-muted/80 rounded-xl text-sm font-medium text-foreground transition-colors"
              disabled={submitting || loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
              disabled={submitting || loading || !reason.trim()}
            >
              {(submitting || loading) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Refus...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Confirmer le refus
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
