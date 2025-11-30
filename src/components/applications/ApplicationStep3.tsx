/**
 * ApplicationStep3 - Validation et soumission finale
 */

import { HTMLAttributes, useState } from 'react';
import { ApplicationData } from './ApplicationStep1';
import { DocumentFile } from './ApplicationStep2';
import { ApplicationReview } from './ApplicationReview';

// Types pour la validation
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

interface DocumentValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [documentValidationErrors, setDocumentValidationErrors] = useState<Record<string, string>>({});

  // Validation des données personnelles
  const validateApplicationData = (data: ApplicationData): ValidationResult => {
    const errors: Record<string, string> = {};

    // Validation des champs obligatoires
    if (!data.firstName?.trim()) {
      errors.firstName = 'Le prénom est obligatoire';
    } else if (data.firstName.trim().length < 2) {
      errors.firstName = 'Le prénom doit contenir au moins 2 caractères';
    }

    if (!data.lastName?.trim()) {
      errors.lastName = 'Le nom est obligatoire';
    } else if (data.lastName.trim().length < 2) {
      errors.lastName = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!data.email?.trim()) {
      errors.email = 'L\'adresse email est obligatoire';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'L\'adresse email n\'est pas valide';
      }
    }

    if (!data.phone?.trim()) {
      errors.phone = 'Le numéro de téléphone est obligatoire';
    } else {
      // Validation du format telephone ivoirien
      const phoneRegex = /^(\+225|0)?[0-9]{8,10}$/;
      const cleanPhone = data.phone.replace(/\s/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errors.phone = 'Le numéro de téléphone doit être un numéro ivoirien valide (8 chiffres après l\'indicatif)';
      }
    }

    if (!data.dateOfBirth) {
      errors.dateOfBirth = 'La date de naissance est obligatoire';
    } else {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        errors.dateOfBirth = 'Vous devez avoir au moins 18 ans pour postuler';
      } else if (age > 100) {
        errors.dateOfBirth = 'L\'âge indiqué semble incohérent';
      }
    }

    if (!data.nationality?.trim()) {
      errors.nationality = 'La nationalité est obligatoire';
    }

    if (!data.address?.trim()) {
      errors.address = 'L\'adresse est obligatoire';
    }

    if (!data.city?.trim()) {
      errors.city = 'La ville est obligatoire';
    }

    if (!data.postalCode?.trim()) {
      errors.postalCode = 'Le code postal est obligatoire';
    }

    if (!data.country?.trim()) {
      errors.country = 'Le pays est obligatoire';
    }

    if (!data.employmentStatus) {
      errors.employmentStatus = 'Le statut professionnel est obligatoire';
    }

    // Validation conditionnelle selon le statut professionnel
    if (data.employmentStatus === 'employed' || data.employmentStatus === 'self-employed') {
      if (!data.employerName?.trim()) {
        errors.employerName = data.employmentStatus === 'self-employed' 
          ? 'Le nom de l\'entreprise est obligatoire'
          : 'Le nom de l\'employeur est obligatoire';
      }

      if (!data.jobTitle?.trim()) {
        errors.jobTitle = 'Le poste occupé est obligatoire';
      }

      if (!data.monthlyIncome || data.monthlyIncome <= 0) {
        errors.monthlyIncome = 'Les revenus mensuels sont obligatoires et doivent être supérieurs à 0';
      } else if (data.monthlyIncome < 10000) {
        errors.monthlyIncome = 'Les revenus semblent faibles, vérifiez le montant en FCFA';
      } else if (data.monthlyIncome > 5000000) {
        errors.monthlyIncome = 'Les revenus semblent incohérents, vérifiez le montant';
      }
    }

    if (data.employmentStatus === 'unemployed') {
      // Vérifier si un garant est présent pour les demandeurs d'emploi
      if (!data.hasGuarantor) {
        errors.guarantorRequired = 'Un garant est obligatoire pour les demandeurs d\'emploi';
      }
    }

    // Validation du garant si présent
    if (data.hasGuarantor) {
      if (!data.guarantorFirstName?.trim()) {
        errors.guarantorFirstName = 'Le prénom du garant est obligatoire';
      }

      if (!data.guarantorLastName?.trim()) {
        errors.guarantorLastName = 'Le nom du garant est obligatoire';
      }

      if (!data.guarantorEmail?.trim()) {
        errors.guarantorEmail = 'L\'email du garant est obligatoire';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.guarantorEmail)) {
          errors.guarantorEmail = 'L\'email du garant n\'est pas valide';
        }
      }

      if (!data.guarantorPhone?.trim()) {
        errors.guarantorPhone = 'Le téléphone du garant est obligatoire';
      } else {
        const phoneRegex = /^(\+225|0)?[0-9]{8,10}$/;
        const cleanPhone = data.guarantorPhone.replace(/\s/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          errors.guarantorPhone = 'Le numéro de téléphone du garant doit être un numéro ivoirien valide';
        }
      }
    }

    // Validation de cohérence - ratio revenus/loyer (simulation avec un loyer moyen)
    if (data.monthlyIncome) {
      const estimatedRent = 150000; // Loyer moyen estimé en FCFA
      const ratio = data.monthlyIncome / estimatedRent;
      
      if (ratio < 3) {
        errors.incomeRatio = 'Vos revenus semblent insuffisants pour le loyer (ratio revenus/loyer < 3)';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Validation des documents
  const validateDocuments = (docs: DocumentFile[]): DocumentValidationResult => {
    const errors: Record<string, string> = {};

    // Documents obligatoires et leurs catégories
    const requiredDocuments = [
      { category: 'identity', label: 'Pièce d\'identité', minFiles: 1 },
      { category: 'income', label: 'Justificatifs de revenus', minFiles: 1 },
      { category: 'employment', label: 'Justificatif d\'emploi', minFiles: 1 }
    ];

    requiredDocuments.forEach(docType => {
      const files = docs.filter(doc => 
        doc.id.startsWith(docType.category) && doc.status === 'uploaded'
      );

      if (files.length < docType.minFiles) {
        errors[docType.category] = `${docType.label} : au moins ${docType.minFiles} fichier(s) uploadé(s) requis`;
      }

      // Vérification de la qualité des documents uploadés
      files.forEach((file, index) => {
        if (file.size === 0) {
          errors[`${docType.category}_${index}`] = `${docType.label} : Le fichier "${file.name}" semble corrompu (taille nulle)`;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB
          errors[`${docType.category}_size_${index}`] = `${docType.label} : Le fichier "${file.name}" est trop volumineux (max 10MB)`;
        }
      });
    });

    // Vérification spécifique pour les revenus
    const incomeFiles = docs.filter(doc => 
      doc.id.startsWith('income') && doc.status === 'uploaded'
    );
    
    if (incomeFiles.length === 0) {
      errors.income = 'Au moins un justificatif de revenus est obligatoire';
    } else if (incomeFiles.length < 3) {
      errors.incomeWeak = `Seulement ${incomeFiles.length} justificatif(s) fourni(s). Il est recommandé d\'en fournir au moins 3`;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Validation de la signature
  const validateSignature = (value: string): boolean => {
    if (!value?.trim()) {
      setSignatureError('La signature est obligatoire');
      return false;
    }
    
    if (value.trim().length < 2) {
      setSignatureError('La signature doit contenir au moins 2 caractères');
      return false;
    }

    // Vérification de cohérence signature/nom
    const fullName = `${applicationData.firstName} ${applicationData.lastName}`.toLowerCase().trim();
    const signatureLower = value.toLowerCase().trim();
    
    // Au moins 80% des mots de la signature doivent correspondre au nom complet
    const signatureWords = signatureLower.split(/\s+/);
    const nameWords = fullName.split(/\s+/);
    const matchingWords = signatureWords.filter(word => 
      word.length > 2 && nameWords.includes(word)
    );
    
    if (matchingWords.length === 0) {
      setSignatureError('La signature doit contenir au moins une partie de votre nom complet');
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

  // Validation complète
  const canSubmit = (): boolean => {
    // Reset des erreurs
    setValidationErrors({});
    setDocumentValidationErrors({});

    // Validation des données
    const dataValidation = validateApplicationData(applicationData);
    if (!dataValidation.isValid) {
      setValidationErrors(dataValidation.errors);
      return false;
    }

    // Validation des documents
    const documentsValidation = validateDocuments(documents);
    if (!documentsValidation.isValid) {
      setDocumentValidationErrors(documentsValidation.errors);
      return false;
    }

    // Validation de la signature
    if (!validateSignature(signature)) {
      return false;
    }

    // Validation des consentements
    if (!agreedToTerms) {
      setValidationErrors({ ...validationErrors, terms: 'Vous devez accepter les conditions pour continuer' });
      return false;
    }

    if (!agreedToPrivacy) {
      setValidationErrors({ ...validationErrors, privacy: 'Vous devez accepter la politique de confidentialité' });
      return false;
    }

    return true;
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
        
        {/* Affichage des erreurs de validation */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-2">
                  Erreurs dans vos informations personnelles
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field} className="flex items-start space-x-1">
                      <span className="text-red-500">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Affichage des erreurs de documents */}
        {Object.keys(documentValidationErrors).length > 0 && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-orange-800 mb-2">
                  Problèmes avec vos documents
                </h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  {Object.entries(documentValidationErrors).map(([field, error]) => (
                    <li key={field} className="flex items-start space-x-1">
                      <span className="text-orange-500">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations personnelles */}
          <div>
            <h4 className="font-medium text-neutral-900 mb-3">Informations personnelles</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Nom:</span>
                <span className={`${validationErrors.lastName ? 'text-red-600 font-medium' : 'text-neutral-900'}`}>
                  {applicationData.lastName || 'Non renseigné'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Prénom:</span>
                <span className={`${validationErrors.firstName ? 'text-red-600 font-medium' : 'text-neutral-900'}`}>
                  {applicationData.firstName || 'Non renseigné'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Email:</span>
                <span className={`${validationErrors.email ? 'text-red-600 font-medium' : 'text-neutral-900'}`}>
                  {applicationData.email || 'Non renseigné'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Téléphone:</span>
                <span className={`${validationErrors.phone ? 'text-red-600 font-medium' : 'text-neutral-900'}`}>
                  {applicationData.phone || 'Non renseigné'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Statut:</span>
                <span className={`${validationErrors.employmentStatus ? 'text-red-600 font-medium' : 'text-neutral-900'}`}>
                  {applicationData.employmentStatus === 'employed' ? 'Salarié(e)' :
                   applicationData.employmentStatus === 'self-employed' ? 'Indépendant(e)' :
                   applicationData.employmentStatus === 'unemployed' ? 'Sans emploi' :
                   applicationData.employmentStatus === 'retired' ? 'Retraité(e)' : 'Étudiant(e)' || 'Non renseigné'}
                </span>
              </div>
              {applicationData.monthlyIncome && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Revenus mensuels:</span>
                  <span className={`${validationErrors.monthlyIncome ? 'text-red-600 font-medium' : 'text-neutral-900'}`}>
                    {applicationData.monthlyIncome.toLocaleString()} FCFA
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div>
            <h4 className="font-medium text-neutral-900 mb-3">Documents téléchargés</h4>
            <div className="space-y-2">
              {getDocumentSummary().map((doc) => {
                const hasDocError = documentValidationErrors[doc.category];
                const isComplete = doc.status === 'complete';
                
                return (
                  <div key={doc.category} className="flex items-center justify-between text-sm">
                    <span className={`${hasDocError ? 'text-red-600 font-medium' : 'text-neutral-600'}`}>
                      {doc.label}
                      {doc.required && <span className="text-red-500 ml-1">*</span>}
                      {hasDocError && (
                        <svg className="w-4 h-4 text-red-500 inline ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={
                        hasDocError ? 'text-red-600 font-medium' :
                        isComplete ? 'text-green-600' : 
                        doc.status === 'missing' ? 'text-red-500' : 
                        'text-neutral-500'
                      }>
                        {doc.files} fichier{doc.files !== 1 ? 's' : ''}
                      </span>
                      {isComplete && !hasDocError ? (
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : hasDocError ? (
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Déclarations et consentements */}
      <div className={sectionClasses}>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Déclarations et consentements
        </h3>
        
        {/* Erreurs de validation des consentements */}
        {(validationErrors.terms || validationErrors.privacy) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              {validationErrors.terms && <span className="block">{validationErrors.terms}</span>}
              {validationErrors.privacy && <span className="block">{validationErrors.privacy}</span>}
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className={`${checkboxClasses} ${validationErrors.terms ? 'border-red-500' : ''}`}
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              disabled={loading}
            />
            <span className={`text-sm ${validationErrors.terms ? 'text-red-700 font-medium' : 'text-neutral-700'}`}>
              J'atteste sur l'honneur que les informations fournies dans ce formulaire sont exactes et complètes. 
              Je m'engage à fournir tout document complémentaire qui pourrait être demandé dans le cadre de 
              l'instruction de ma demande de location.
            </span>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className={`${checkboxClasses} ${validationErrors.privacy ? 'border-red-500' : ''}`}
              checked={agreedToPrivacy}
              onChange={(e) => setAgreedToPrivacy(e.target.checked)}
              disabled={loading}
            />
            <span className={`text-sm ${validationErrors.privacy ? 'text-red-700 font-medium' : 'text-neutral-700'}`}>
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
            className={`${signatureInputClasses} mt-2 ${
              signatureError ? 'border-red-500' : ''
            }`}
            value={signature}
            onChange={(e) => handleSignatureChange(e.target.value)}
            onBlur={() => validateSignature(signature)}
            placeholder={`${applicationData.firstName} ${applicationData.lastName}`}
            disabled={loading}
            aria-describedby={signatureError ? 'signature-error' : undefined}
          />
          {signatureError && (
            <div id="signature-error" className="text-sm text-red-600 mt-1 flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{signatureError}</span>
            </div>
          )}
          <p className="text-xs text-neutral-500 mt-2">
            En signant électronique, vous acceptez que cette signature ait la même valeur légale qu'une signature manuscrite.
            <br />
            <span className="text-xs text-neutral-400">
              Conseil : utilisez exactement votre nom complet ({applicationData.firstName} {applicationData.lastName})
            </span>
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
              Important - Dernière vérification
            </h4>
            <div className="text-xs text-amber-700 space-y-1">
              <p>
                {Object.keys(validationErrors).length > 0 || Object.keys(documentValidationErrors).length > 0 ? (
                  <>
                    <strong>Veuillez corriger les erreurs ci-dessus avant de soumettre votre candidature.</strong>
                    <br />
                    Cliquez sur "Retour" pour modifier vos informations ou documents.
                  </>
                ) : (
                  <>
                    Une fois votre candidature soumise, elle sera transmise au propriétaire pour étude. 
                    Vous recevrez une confirmation par email et serez tenu informé de l'avancement de votre demande.
                  </>
                )}
              </p>
              {applicationData.hasGuarantor && (
                <p className="text-amber-600">
                  <strong>Note :</strong> Un garant a été renseigné. Il sera contacté si nécessaire pour finaliser votre candidature.
                </p>
              )}
            </div>
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
            'text-white',
            'font-semibold',
            'rounded-lg',
            'transition-all duration-200',
            'focus:outline-none',
            'focus:ring-3',
            'focus:ring-primary-500/15',
            'disabled:opacity-50',
            'disabled:cursor-not-allowed',
          ].join(' ')}
          style={{
            backgroundColor: (!canSubmit() || loading) ? '#9CA3AF' : '#3B82F6'
          }}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Soumission en cours...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {!canSubmit() && (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>
                    Corriger les erreurs ({Object.keys(validationErrors).length + Object.keys(documentValidationErrors).length})
                  </span>
                </>
              )}
              {canSubmit() && (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Soumettre ma candidature</span>
                </>
              )}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}