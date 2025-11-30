/**
 * ApplicationStep2 - Documents et pièces justificatives
 */

import { HTMLAttributes, useState, useRef } from 'react';

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  error?: string;
}

export interface ApplicationStep2Props extends HTMLAttributes<HTMLDivElement> {
  documents: DocumentFile[];
  onDocumentsChange: (documents: DocumentFile[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  loading?: boolean;
}

const documentTypes = [
  {
    category: 'identity',
    title: 'Pièce d\'identité',
    description: 'Carte d\'identité ou passeport en cours de validité',
    required: true,
    maxFiles: 1,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  {
    category: 'income',
    title: 'Justificatifs de revenus',
    description: '3 dernières fiches de paie ou avis d\'imposition',
    required: true,
    maxFiles: 5,
    acceptedTypes: ['.pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    category: 'employment',
    title: 'Justificatif d\'emploi',
    description: 'Attestation d\'emploi ou contrat de travail',
    required: true,
    maxFiles: 2,
    acceptedTypes: ['.pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    category: 'guarantor',
    title: 'Garant',
    description: 'Pièces d\'identité du garant et justificatifs de revenus',
    required: false,
    maxFiles: 3,
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
] as const;

export function ApplicationStep2({
  documents,
  onDocumentsChange,
  onNext,
  onPrevious,
  loading = false,
  className = '',
  ...props
}: ApplicationStep2Props) {
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (category: string, files: FileList | null) => {
    if (!files) return;

    const documentConfig = documentTypes.find(doc => doc.category === category);
    if (!documentConfig) return;

    const existingFiles = documents.filter(doc => doc.id.startsWith(category));
    
    // Vérifier la limite de fichiers
    if (existingFiles.length + files.length > documentConfig.maxFiles) {
      setErrors(prev => ({
        ...prev,
        [category]: `Maximum ${documentConfig.maxFiles} fichiers autorisé(s)`
      }));
      return;
    }

    Array.from(files).forEach(file => {
      // Vérifier le type de fichier
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!documentConfig.acceptedTypes.includes(fileExtension)) {
        setErrors(prev => ({
          ...prev,
          [category]: `Type de fichier non supporté: ${fileExtension}`
        }));
        return;
      }

      // Vérifier la taille
      if (file.size > documentConfig.maxSize) {
        setErrors(prev => ({
          ...prev,
          [category]: `Fichier trop volumineux: ${Math.round(file.size / 1024 / 1024)}MB (max: ${Math.round(documentConfig.maxSize / 1024 / 1024)}MB)`
        }));
        return;
      }

      // Simuler l'upload (dans un vrai projet, vous utiliseriez une API)
      const fileId = `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newDocument: DocumentFile = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file), // Pour la démo
        uploadedAt: new Date(),
        status: 'uploading',
      };

      setUploadingFiles(prev => ({ ...prev, [fileId]: true }));
      setErrors(prev => ({ ...prev, [category]: '' }));

      // Simuler l'upload avec délai
      setTimeout(() => {
        setUploadingFiles(prev => ({ ...prev, [fileId]: false }));
        newDocument.status = 'uploaded';
        onDocumentsChange([...documents.filter(doc => doc.id !== fileId), newDocument]);
      }, 2000);
    });
  };

  const removeDocument = (documentId: string) => {
    onDocumentsChange(documents.filter(doc => doc.id !== documentId));
  };

  const getFilesByCategory = (category: string) => {
    return documents.filter(doc => doc.id.startsWith(category));
  };

  const isCategoryComplete = (category: string) => {
    const config = documentTypes.find(doc => doc.category === category);
    if (!config) return false;
    
    const files = getFilesByCategory(category);
    return config.required ? files.length > 0 : true;
  };

  const canProceed = () => {
    return documentTypes
      .filter(config => config.required)
      .every(config => isCategoryComplete(config.category));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const baseClasses = [
    'w-full',
    'space-y-8',
  ].join(' ');

  const documentSectionClasses = [
    'space-y-4',
    'p-6',
    'bg-background-surface',
    'rounded-lg',
    'border border-neutral-200',
  ].join(' ');

  const uploadButtonClasses = [
    'flex items-center justify-center',
    'w-full',
    'h-32',
    'border-2',
    'border-dashed',
    'border-neutral-300',
    'rounded-lg',
    'bg-background-page',
    'hover:border-primary-500',
    'hover:bg-primary-50',
    'transition-all duration-200',
    'cursor-pointer',
    'group',
  ].join(' ');

  const fileItemClasses = [
    'flex items-center justify-between',
    'p-4',
    'bg-background-page',
    'border border-neutral-200',
    'rounded-lg',
    'space-x-4',
  ].join(' ');

  return (
    <div className={baseClasses} {...props}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Documents & Justificatifs
        </h2>
        <p className="text-neutral-600">
          Veuillez télécharger les documents requis pour votre candidature
        </p>
      </div>

      {documentTypes.map((config) => {
        const categoryFiles = getFilesByCategory(config.category);
        const isComplete = isCategoryComplete(config.category);
        const hasError = Boolean(errors[config.category]);

        return (
          <div key={config.category} className={documentSectionClasses}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {config.title}
                    {config.required && <span className="text-semantic-error ml-1">*</span>}
                  </h3>
                  {isComplete && (
                    <div className="flex items-center text-sm text-semantic-success">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Complété
                    </div>
                  )}
                </div>
                <p className="text-sm text-neutral-600 mb-3">
                  {config.description}
                </p>
                <div className="flex items-center text-xs text-neutral-500 space-x-4">
                  <span>Types acceptés: {config.acceptedTypes.join(', ')}</span>
                  <span>Max: {Math.round(config.maxSize / 1024 / 1024)}MB par fichier</span>
                  <span>Limite: {config.maxFiles} fichier(s)</span>
                </div>
              </div>
            </div>

            {/* Zone d'upload */}
            <div
              className={uploadButtonClasses}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={config.acceptedTypes.join(',')}
                multiple={config.maxFiles > 1}
                onChange={(e) => handleFileSelect(config.category, e.target.files)}
                disabled={loading || categoryFiles.length >= config.maxFiles}
              />
              
              <div className="text-center">
                <svg className="w-8 h-8 text-neutral-400 group-hover:text-primary-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium text-neutral-700 group-hover:text-primary-600">
                  Cliquez pour télécharger
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  ou glissez-déposez vos fichiers ici
                </p>
              </div>
            </div>

            {/* Erreur */}
            {hasError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-semantic-error">
                  {errors[config.category]}
                </p>
              </div>
            )}

            {/* Liste des fichiers */}
            {categoryFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-neutral-700">
                  Fichiers téléchargés ({categoryFiles.length}/{config.maxFiles})
                </h4>
                {categoryFiles.map((document) => (
                  <div key={document.id} className={fileItemClasses}>
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {document.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {formatFileSize(document.size)} • {document.uploadedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {document.status === 'uploading' && (
                          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        )}
                        {document.status === 'uploaded' && (
                          <div className="w-4 h-4 bg-semantic-success rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {document.status === 'error' && (
                          <div className="w-4 h-4 bg-semantic-error rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeDocument(document.id)}
                          className="text-neutral-400 hover:text-semantic-error transition-colors"
                          disabled={loading}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Résumé */}
      <div className="p-6 bg-neutral-50 rounded-lg border">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Résumé des documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentTypes.map((config) => {
            const files = getFilesByCategory(config.category);
            const isComplete = isCategoryComplete(config.category);
            
            return (
              <div key={config.category} className="flex items-center justify-between">
                <span className={`text-sm ${isComplete ? 'text-neutral-900' : 'text-neutral-500'}`}>
                  {config.title}
                  {config.required && <span className="text-semantic-error"> *</span>}
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${isComplete ? 'text-semantic-success' : 'text-neutral-500'}`}>
                    {files.length}/{config.maxFiles}
                  </span>
                  {isComplete ? (
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
            );
          })}
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
          onClick={onNext}
          disabled={!canProceed() || loading}
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
          {loading ? 'Upload...' : 'Continuer'}
        </button>
      </div>
    </div>
  );
}