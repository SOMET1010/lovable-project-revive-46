/**
 * ApplicationStep3 - Validation et soumission finale
 */

import { HTMLAttributes, useState } from 'react';
import { ApplicationData } from './ApplicationStep1';
import { DocumentFile } from './ApplicationStep2';
import { ApplicationReview } from './ApplicationReview';

export interface ApplicationStep3Props extends HTMLAttributes<HTMLDivElement> {
  applicationData: ApplicationData;
  documents: DocumentFile[];
  onSubmit: () => Promise<void>;
  onPrevious: () => void;
  loading?: boolean;
}

export function ApplicationStep3({
  applicationData,
  documents,
  onSubmit,
  onPrevious,
  loading = false,
  className = '',
  ...props
}: ApplicationStep3Props) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToUpdates, setAgreedToUpdates] = useState(false);
  const [signature, setSignature] = useState('');
  const [signatureError, setSignatureError] = useState('');

  const validateSignature = (value: string) => {
    if (value.trim().length < 2) {
      setSignatureError('La signature doit contenir au moins 2 caractères');
      return false;
    }
    setSignatureError('');
    return true;
  };

  const handleSignatureChange = (value: string) => {
    setSignature(value);
    if (value.length >= 2) {
      validateSignature(value);
    }
  };

  const canSubmit = () => {
    return (
      agreedToTerms &&
      agreedToPrivacy &&
      signature.trim().length >= 2 &&
      !signatureError
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    
    try {
      await onSubmit();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const getDocumentSummary = () => {
    const documentTypes = [
      { category: 'identity', label: 'Pièce d\'identité', required: true },
      { category: 'income', label: 'Justificatifs de revenus', required: true },
      { category: 'employment', label: 'Justificatif d\'emploi', required: true },
      { category: 'guarantor', label: 'Documents du garant', required: false },
    ];

    return documentTypes.map(type => {
      const files = documents.filter(doc => doc.id.startsWith(type.category));
      return {
        ...type,
        files: files.length,
        status: type.required ? (files.length > 0 ? 'complete' : 'missing') : (files.length > 0 ? 'complete' : 'optional'),
      };
    });
  };

  const baseClasses = [
    'w-full',
    'space-y-8',
  ].join(' ');

  const sectionClasses = [
    'space-y-6',
    'p-6',
    'bg-background-surface',
    'rounded-lg',
    'border border-neutral-200',
  ].join(' ');

  const checkboxClasses = [
    'w-4 h-4',
    'text-primary-500',
    'border-neutral-300',
    'rounded',
    'focus:ring-primary-500',
    'focus:ring-2',
  ].join(' ');

  const signatureInputClasses = [
    'w-full',
    'p-4',
    'border border-neutral-200',
    'rounded-lg',
    'text-base',
    'text-neutral-900',
    'bg-background-page',
    'placeholder-neutral-500',
    'focus:outline-none',
    'focus:ring-3',
    'focus:ring-primary-500/15',
    'focus:border-primary-500',
    'transition-all duration-200',
  ].join(' ');

  return (
    <div className={baseClasses} {...props}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Validation & Soumission
        </h2>
        <p className="text-neutral-600">
          Vérifiez vos informations et validez votre candidature
        </p>
      </div>

      {/* Aperçu des données */}
      <div className={sectionClasses}>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Aperçu de votre candidature
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations personnelles */}
          <div>
            <h4 className="font-medium text-neutral-900 mb-3">Informations personnelles</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Nom:</span>
                <span className="text-neutral-900">{applicationData.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Prénom:</span>
                <span className="text-neutral-900">{applicationData.firstName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Email:</span>
                <span className="text-neutral-900">{applicationData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Téléphone:</span>
                <span className="text-neutral-900">{applicationData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Statut:</span>
                <span className="text-neutral-900">
                  {applicationData.employmentStatus === 'employed' ? 'Salarié(e)' :
                   applicationData.employmentStatus === 'self-employed' ? 'Indépendant(e)' :
                   applicationData.employmentStatus === 'unemployed' ? 'Sans emploi' :
                   applicationData.employmentStatus === 'retired' ? 'Retraité(e)' : 'Étudiant(e)'}
                </span>
              </div>
              {applicationData.monthlyIncome && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Revenus mensuels:</span>
                  <span className="text-neutral-900">{applicationData.monthlyIncome}€</span>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div>
            <h4 className="font-medium text-neutral-900 mb-3">Documents téléchargés</h4>
            <div className="space-y-2">
              {getDocumentSummary().map((doc) => (
                <div key={doc.category} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">
                    {doc.label}
                    {doc.required && <span className="text-semantic-error ml-1">*</span>}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={doc.status === 'complete' ? 'text-semantic-success' : doc.status === 'missing' ? 'text-semantic-error' : 'text-neutral-500'}>
                      {doc.files} fichier{doc.files !== 1 ? 's' : ''}
                    </span>
                    {doc.status === 'complete' ? (
                      <svg className="w-4 h-4 text-semantic-success" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Déclarations et consentements */}
      <div className={sectionClasses}>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Déclarations et consentements
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className={checkboxClasses}
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              disabled={loading}
            />
            <span className="text-sm text-neutral-700">
              J'atteste sur l'honneur que les informations fournies dans ce formulaire sont exactes et complètes. 
              Je m'engage à fournir tout document complémentaire qui pourrait être demandé dans le cadre de 
              l'instruction de ma demande de location.
            </span>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className={checkboxClasses}
              checked={agreedToPrivacy}
              onChange={(e) => setAgreedToPrivacy(e.target.checked)}
              disabled={loading}
            />
            <span className="text-sm text-neutral-700">
              J'accepte que mes données personnelles soient traitées conformément à la{' '}
              <a href="/politique-confidentialite" className="text-primary-600 hover:text-primary-700 underline">
                politique de confidentialité
              </a>{' '}
              de MONTOIT dans le cadre de cette candidature.
            </span>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className={checkboxClasses}
              checked={agreedToUpdates}
              onChange={(e) => setAgreedToUpdates(e.target.checked)}
              disabled={loading}
            />
            <span className="text-sm text-neutral-700">
              Je souhaite recevoir des informations sur l'évolution de ma candidature et les opportunités 
              de location par email/SMS.
            </span>
          </label>
        </div>
      </div>

      {/* Signature électronique */}
      <div className={sectionClasses}>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Signature électronique *
        </h3>
        
        <div>
          <label className={signatureInputClasses} htmlFor="signature">
            Tapez votre nom complet pour valider votre signature électronique
          </label>
          <input
            id="signature"
            type="text"
            className={`${signatureInputClasses} mt-2 ${signatureError ? 'border-semantic-error' : ''}`}
            value={signature}
            onChange={(e) => handleSignatureChange(e.target.value)}
            onBlur={() => validateSignature(signature)}
            placeholder="Votre nom et prénom complets"
            disabled={loading}
            aria-describedby={signatureError ? 'signature-error' : undefined}
          />
          {signatureError && (
            <div className="text-sm text-semantic-error mt-1">
              {signatureError}
            </div>
          )}
          <p className="text-xs text-neutral-500 mt-2">
            En signant electronically, vous acceptez que cette signature ait la même valeur légale qu'une signature manuscrite.
          </p>
        </div>
      </div>

      {/* Informations importantes */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-amber-800 mb-1">
              Important
            </h4>
            <p className="text-xs text-amber-700">
              Une fois votre candidature soumise, elle sera transmise au propriétaire pour étude. 
              Vous recevrez une confirmation par email et serez tenu informé de l'avancement de votre demande.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={loading}
          className={[
            'px-6 py-3',
            'border-2',
            'border-neutral-200',
            'text-neutral-700',
            'font-medium',
            'rounded-lg',
            'transition-all duration-200',
            'hover:bg-neutral-50',
            'focus:outline-none',
            'focus:ring-3',
            'focus:ring-neutral-500/15',
            'disabled:opacity-50',
            'disabled:cursor-not-allowed',
          ].join(' ')}
        >
          Retour
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit() || loading}
          className={[
            'px-8 py-3',
            'bg-primary-500',
            'text-white',
            'font-semibold',
            'rounded-lg',
            'transition-all duration-200',
            'hover:bg-primary-600',
            'focus:outline-none',
            'focus:ring-3',
            'focus:ring-primary-500/15',
            'disabled:opacity-50',
            'disabled:cursor-not-allowed',
            'disabled:hover:bg-primary-500',
          ].join(' ')}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Soumission en cours...</span>
            </div>
          ) : (
            'Soumettre ma candidature'
          )}
        </button>
      </div>
    </div>
  );
}