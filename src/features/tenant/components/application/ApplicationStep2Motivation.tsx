import { ArrowLeft, Send, AlertCircle, Loader2 } from 'lucide-react';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { useState } from 'react';

interface ApplicationStep2MotivationProps {
  coverLetter: string;
  onCoverLetterChange: (value: string) => void;
  isVerified: boolean;
  submitting: boolean;
  existingApplication: boolean;
  error: string | null;
  onPrev: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ApplicationStep2Motivation({
  coverLetter,
  onCoverLetterChange,
  isVerified,
  submitting,
  existingApplication,
  error,
  onPrev,
  onSubmit
}: ApplicationStep2MotivationProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);

  const hasError = coverLetter.length > 0 && coverLetter.length < 50;
  const canSubmit = termsAccepted && !existingApplication && coverLetter.length >= 50;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Lettre de motivation */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#2C1810]">
          Lettre de motivation <span className="text-[#F16522]">*</span>
        </label>
        <textarea
          value={coverLetter}
          onChange={(e) => onCoverLetterChange(e.target.value)}
          rows={6}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors resize-none ${
            hasError
              ? 'border-red-300 focus:ring-red-200'
              : 'border-[#EFEBE9] focus:ring-[#F16522]/20 focus:border-[#F16522]'
          }`}
          placeholder="Présentez-vous et expliquez pourquoi vous êtes un bon candidat pour ce logement..."
        />
        <div className="flex justify-between text-sm">
          {hasError ? (
            <span className="text-red-600">La lettre doit contenir au moins 50 caractères</span>
          ) : (
            <span className="text-[#A69B95]">Minimum 50 caractères</span>
          )}
          <span className={coverLetter.length >= 50 ? 'text-green-600' : 'text-[#A69B95]'}>
            {coverLetter.length}/500
          </span>
        </div>
      </div>

      {/* Termes et conditions */}
      <div className="bg-[#FAF7F4] rounded-xl p-5 border border-[#EFEBE9]">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            className="mt-0.5"
          />
          <Label htmlFor="terms" className="text-sm text-[#6B5A4E] cursor-pointer">
            J'accepte que mes informations soient transmises au propriétaire pour l'évaluation de ma candidature. 
            Je certifie que les informations fournies sont exactes.
          </Label>
        </div>
      </div>

      {/* Avertissement vérification */}
      {!isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Votre profil n'est pas encore vérifié. Les propriétaires privilégient les candidats vérifiés. 
            <a href="/profil?tab=verification" className="underline font-medium ml-1">
              Vérifier mon identité
            </a>
          </p>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Candidature existante */}
      {existingApplication && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Vous avez déjà postulé pour ce bien. Vous ne pouvez pas soumettre une nouvelle candidature.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between gap-4 pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 border border-[#EFEBE9] text-[#2C1810] hover:bg-[#FAF7F4] font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className={`flex items-center gap-2 font-semibold py-3 px-8 rounded-xl transition-colors ${
            canSubmit && !submitting
              ? 'bg-[#F16522] hover:bg-[#d9571d] text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Envoyer ma candidature
            </>
          )}
        </button>
      </div>
    </form>
  );
}
