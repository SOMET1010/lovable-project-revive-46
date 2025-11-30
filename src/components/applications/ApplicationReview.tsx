/**
 * ApplicationReview - Aperçu final de la candidature
 */

import { HTMLAttributes } from 'react';
import { ApplicationData } from './ApplicationStep1';
import { DocumentFile } from './ApplicationStep2';

export interface ApplicationReviewProps extends HTMLAttributes<HTMLDivElement> {
  applicationData: ApplicationData;
  documents: DocumentFile[];
  editable?: boolean;
}

export function ApplicationReview({
  applicationData,
  documents,
  editable = false,
  className = '',
  ...props
}: ApplicationReviewProps) {
  const baseClasses = [
    'w-full',
    'space-y-6',
  ].join(' ');

  const sectionClasses = [
    'p-6',
    'bg-background-surface',
    'rounded-lg',
    'border border-neutral-200',
  ].join(' ');

  const labelClasses = [
    'text-sm',
    'font-medium',
    'text-neutral-600',
  ].join(' ');

  const valueClasses = [
    'text-sm',
    'text-neutral-900',
  ].join(' ');

  const formatEmploymentStatus = (status: string) => {
    const statusMap = {
      'employed': 'Salarié(e)',
      'self-employed': 'Indépendant(e)', 
      'unemployed': 'Sans emploi',
      'retired': 'Retraité(e)',
      'student': 'Étudiant(e)',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getDocumentsByCategory = (category: string) => {
    return documents.filter(doc => doc.id.startsWith(category));
  };

  return (
    <div className={baseClasses} {...props}>
      {/* En-tête */}
      <div className="text-center pb-6 border-b border-neutral-200">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Aperçu de votre candidature
        </h2>
        <p className="text-neutral-600">
          Vérifiez que toutes les informations sont correctes avant la soumission
        </p>
      </div>

      {/* Informations personnelles */}
      <div className={sectionClasses}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">
            Informations personnelles
          </h3>
          {editable && (
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Modifier
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={labelClasses}>Nom de famille</div>
                <div className={valueClasses}>{applicationData.lastName}</div>
              </div>
              <div>
                <div className={labelClasses}>Prénom</div>
                <div className={valueClasses}>{applicationData.firstName}</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className={labelClasses}>Adresse email</div>
              <div className={valueClasses}>{applicationData.email}</div>
            </div>
            
            <div className="mt-4">
              <div className={labelClasses}>Téléphone</div>
              <div className={valueClasses}>{applicationData.phone}</div>
            </div>
          </div>
          
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={labelClasses}>Date de naissance</div>
                <div className={valueClasses}>
                  {applicationData.dateOfBirth ? 
                    new Date(applicationData.dateOfBirth).toLocaleDateString('fr-FR') : 
                    'Non renseigné'
                  }
                </div>
              </div>
              <div>
                <div className={labelClasses}>Nationalité</div>
                <div className={valueClasses}>{applicationData.nationality || 'Non renseigné'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adresse */}
      <div className={sectionClasses}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">
            Adresse
          </h3>
          {editable && (
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Modifier
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <div className={labelClasses}>Adresse complète</div>
            <div className={valueClasses}>{applicationData.address}</div>
          </div>
          
          <div>
            <div className={labelClasses}>Ville</div>
            <div className={valueClasses}>{applicationData.city}</div>
          </div>
          
          <div>
            <div className={labelClasses}>Code postal</div>
            <div className={valueClasses}>{applicationData.postalCode}</div>
          </div>
          
          <div>
            <div className={labelClasses}>Pays</div>
            <div className={valueClasses}>{applicationData.country || 'France'}</div>
          </div>
        </div>
      </div>

      {/* Situation professionnelle */}
      <div className={sectionClasses}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">
            Situation professionnelle
          </h3>
          {editable && (
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Modifier
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className={labelClasses}>Statut professionnel</div>
            <div className={valueClasses}>{formatEmploymentStatus(applicationData.employmentStatus)}</div>
          </div>
          
          {applicationData.employmentStatus === 'employed' && (
            <>
              <div>
                <div className={labelClasses}>Employeur</div>
                <div className={valueClasses}>{applicationData.employerName || 'Non renseigné'}</div>
              </div>
              
              <div>
                <div className={labelClasses}>Poste</div>
                <div className={valueClasses}>{applicationData.jobTitle || 'Non renseigné'}</div>
              </div>
            </>
          )}
          
          <div>
            <div className={labelClasses}>Revenus mensuels</div>
            <div className={valueClasses}>
              {applicationData.monthlyIncome ? 
                formatCurrency(applicationData.monthlyIncome) : 
                'Non renseigné'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Garant */}
      {applicationData.hasGuarantor && (
        <div className={sectionClasses}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Informations du garant
            </h3>
            {editable && (
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Modifier
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={labelClasses}>Prénom</div>
                <div className={valueClasses}>{applicationData.guarantorFirstName || 'Non renseigné'}</div>
              </div>
              <div>
                <div className={labelClasses}>Nom</div>
                <div className={valueClasses}>{applicationData.guarantorLastName || 'Non renseigné'}</div>
              </div>
            </div>
            
            <div>
              <div className={labelClasses}>Email</div>
              <div className={valueClasses}>{applicationData.guarantorEmail || 'Non renseigné'}</div>
            </div>
            
            <div>
              <div className={labelClasses}>Téléphone</div>
              <div className={valueClasses}>{applicationData.guarantorPhone || 'Non renseigné'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Documents */}
      <div className={sectionClasses}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">
            Documents fournis
          </h3>
          {editable && (
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Modifier
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {[
            { category: 'identity', title: 'Pièce d\'identité', required: true },
            { category: 'income', title: 'Justificatifs de revenus', required: true },
            { category: 'employment', title: 'Justificatif d\'emploi', required: true },
            { category: 'guarantor', title: 'Documents du garant', required: false },
          ].map((doc) => {
            const categoryFiles = getDocumentsByCategory(doc.category);
            const isComplete = doc.required ? categoryFiles.length > 0 : categoryFiles.length > 0;
            
            return (
              <div key={doc.category} className="flex items-center justify-between p-4 bg-background-page rounded-lg border border-neutral-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isComplete ? 'bg-semantic-success/10' : doc.required ? 'bg-semantic-error/10' : 'bg-neutral-100'
                  }`}>
                    {isComplete ? (
                      <svg className="w-4 h-4 text-semantic-success" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : doc.required ? (
                      <svg className="w-4 h-4 text-semantic-error" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className={`font-medium ${isComplete ? 'text-neutral-900' : doc.required ? 'text-semantic-error' : 'text-neutral-500'}`}>
                      {doc.title}
                      {doc.required && <span className="text-semantic-error ml-1">*</span>}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {categoryFiles.length} fichier{categoryFiles.length !== 1 ? 's' : ''} fourni{categoryFiles.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                
                {categoryFiles.length > 0 && (
                  <div className="flex items-center space-x-2">
                    {categoryFiles.slice(0, 3).map((file, index) => (
                      <div key={file.id} className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ))}
                    {categoryFiles.length > 3 && (
                      <div className="text-xs text-neutral-500">
                        +{categoryFiles.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Résumé des validations */}
      <div className="p-6 bg-neutral-50 rounded-lg border">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Validation finale
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-neutral-900 mb-2">Informations</h4>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-semantic-success rounded-full"></div>
              <span className="text-neutral-700">Toutes les informations sont saisies</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-neutral-900 mb-2">Documents</h4>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-semantic-success rounded-full"></div>
              <span className="text-neutral-700">
                {documents.filter(doc => doc.status === 'uploaded').length} document(s) téléchargé(s)
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <p className="text-sm text-neutral-600">
            <strong>Statut:</strong> Candidature prête à être soumise
          </p>
        </div>
      </div>
    </div>
  );
}