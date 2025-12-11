import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { X, Star, Send } from 'lucide-react';
import { Button, Label } from '@/shared/ui';

interface RateProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  interventionId: string;
  providerName: string;
  onRated: () => void;
}

const RateProviderModal: React.FC<RateProviderModalProps> = ({
  isOpen,
  onClose,
  interventionId,
  providerName,
  onRated
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [criteria, setCriteria] = useState({
    punctuality: 0,
    quality: 0,
    cleanliness: 0,
    price: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCriteriaChange = (criterion: keyof typeof criteria, value: number) => {
    setCriteria(prev => ({ ...prev, [criterion]: value }));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Veuillez donner une note globale');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('interventions')
        .update({
          owner_rating: rating,
          owner_review: review || null,
          rating_criteria: criteria
        })
        .eq('id', interventionId);

      if (error) throw error;

      toast.success('Merci pour votre évaluation!');
      onRated();
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Erreur lors de l\'envoi de l\'évaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (value: number, onChange: (v: number) => void, size: 'lg' | 'sm' = 'sm') => {
    const starSize = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => size === 'lg' && setHoverRating(star)}
            onMouseLeave={() => size === 'lg' && setHoverRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`${starSize} ${
                star <= (size === 'lg' ? (hoverRating || value) : value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-foreground">Évaluer le prestataire</h2>
            <p className="text-sm text-muted-foreground mt-1">{providerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Global rating */}
          <div className="text-center">
            <Label className="text-lg mb-3 block">Note globale</Label>
            {renderStars(rating, setRating, 'lg')}
            <p className="text-sm text-muted-foreground mt-2">
              {rating === 0 ? 'Cliquez pour noter' : 
               rating === 1 ? 'Très insatisfait' :
               rating === 2 ? 'Insatisfait' :
               rating === 3 ? 'Correct' :
               rating === 4 ? 'Satisfait' :
               'Très satisfait'}
            </p>
          </div>

          {/* Criteria ratings */}
          <div className="space-y-4">
            <Label>Critères détaillés (optionnel)</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Ponctualité</span>
                {renderStars(criteria.punctuality, (v) => handleCriteriaChange('punctuality', v))}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Qualité du travail</span>
                {renderStars(criteria.quality, (v) => handleCriteriaChange('quality', v))}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Propreté</span>
                {renderStars(criteria.cleanliness, (v) => handleCriteriaChange('cleanliness', v))}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Rapport qualité/prix</span>
                {renderStars(criteria.price, (v) => handleCriteriaChange('price', v))}
              </div>
            </div>
          </div>

          {/* Review text */}
          <div>
            <Label htmlFor="review">Commentaire (optionnel)</Label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Partagez votre expérience..."
              className="mt-2 w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? 'Envoi...' : 'Envoyer l\'évaluation'}
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RateProviderModal;
