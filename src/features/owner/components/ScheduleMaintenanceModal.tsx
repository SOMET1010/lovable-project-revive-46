import { useState } from 'react';
import { Calendar, X, Loader2 } from 'lucide-react';

interface ScheduleMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scheduledDate: string, estimatedCost?: number) => Promise<void>;
  loading: boolean;
}

export default function ScheduleMaintenanceModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  loading 
}: ScheduleMaintenanceModalProps) {
  const [scheduledDate, setScheduledDate] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate) return;
    
    setSubmitting(true);
    try {
      await onConfirm(
        scheduledDate,
        estimatedCost ? parseFloat(estimatedCost) : undefined
      );
      setScheduledDate('');
      setEstimatedCost('');
    } finally {
      setSubmitting(false);
    }
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

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
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Planifier l'intervention</h2>
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
              Date de l'intervention *
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={minDate}
              required
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Coût estimé (FCFA) - optionnel
            </label>
            <input
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="Ex: 50000"
              min="0"
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
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
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
              disabled={submitting || loading || !scheduledDate}
            >
              {(submitting || loading) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Planification...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Confirmer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
