import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Upload, X, Star, Move, Camera, AlertCircle } from 'lucide-react';

interface PropertyImageUploadProps {
  images: File[];
  mainImageIndex: number;
  onImagesAdd: (files: File[]) => void;
  onImageRemove: (index: number) => void;
  onMainImageSet: (index: number) => void;
  onImagesReorder: (fromIndex: number, toIndex: number) => void;
  disabled?: boolean;
  maxImages?: number;
}

const PropertyImageUpload: React.FC<PropertyImageUploadProps> = ({
  images,
  mainImageIndex,
  onImagesAdd,
  onImageRemove,
  onMainImageSet,
  onImagesReorder,
  disabled = false,
  maxImages = 20
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Nettoyage des URLs de prévisualisation pour éviter les memory leaks
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls]);

  // Gestion du drag & drop pour la zone d'upload principale
  const handleMainDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [disabled]);

  // Gestion des fichiers
  const handleFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        alert(`Le fichier ${file.name} n'est pas une image valide`);
        return false;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`L'image ${file.name} dépasse la taille maximale de 5MB`);
        return false;
      }
      
      return true;
    });

    if (images.length + validFiles.length > maxImages) {
      alert(`Vous ne pouvez pas ajouter plus de ${maxImages} images`);
      return;
    }

    onImagesAdd(validFiles);

    // Générer les URLs de prévisualisation
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  }, [images.length, maxImages, onImagesAdd]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  // Gestion du clic sur le bouton d'upload
  const handleUploadClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Suppression d'une image et de son URL de prévisualisation
  const handleRemoveImage = useCallback((index: number) => {
    onImageRemove(index);
    
    // Libérer l'URL de prévisualisation
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
      const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
      setPreviewUrls(newPreviewUrls);
    }
  }, [onImageRemove, previewUrls]);

  // Définir l'image principale
  const handleSetMainImage = useCallback((index: number) => {
    onMainImageSet(index);
  }, [onMainImageSet]);

  // Reorder par drag & drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    if (!disabled) {
      setDraggedIndex(index);
    }
  }, [disabled]);

  const handleImageDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onImagesReorder(draggedIndex, index);
      setDraggedIndex(index);
    }
  }, [draggedIndex, onImagesReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Zone d'upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${dragOver && !disabled
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleMainDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Camera className="w-6 h-6 text-gray-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ajoutez des photos de votre propriété
            </h3>
            <p className="text-gray-600 mb-4">
              Glissez-déposez vos images ici ou cliquez pour sélectionner
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>Formats acceptés: JPG, PNG, WebP</span>
              <span>•</span>
              <span>Taille max: 5MB par image</span>
              <span>•</span>
              <span>Maximum {maxImages} images</span>
            </div>
          </div>

          <button
            type="button"
            disabled={disabled}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4 mr-2" />
            Sélectionner des images
          </button>
        </div>

        {dragOver && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-90 rounded-lg flex items-center justify-center">
            <div className="text-blue-600 font-medium">
              Relâchez pour ajouter les images
            </div>
          </div>
        )}
      </div>

      {/* Avertissement */}
      {images.length === 0 && (
        <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">
              Photos importantes
            </h4>
            <p className="text-sm text-yellow-700 mt-1">
              Les propriétés avec des photos obtienen 5x plus de vues. Ajoutez au minimum 3 photos de qualité.
            </p>
          </div>
        </div>
      )}

      {/* Galerie d'images */}
      {images.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Photos de votre propriété ({images.length}/{maxImages})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((file, index) => (
              <div
                key={index}
                className={`
                  relative group rounded-lg overflow-hidden bg-gray-100 border-2 transition-all duration-200
                  ${index === mainImageIndex ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-gray-200'}
                  ${draggedIndex === index ? 'opacity-50' : ''}
                `}
                draggable={!disabled}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                {/* Image */}
                <div className="aspect-square relative">
                  <img
                    src={previewUrls[index] || URL.createObjectURL(file)}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Indicateur image principale */}
                  {index === mainImageIndex && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Principale
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      {/* Définir comme principale */}
                      {index !== mainImageIndex && (
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(index)}
                          disabled={disabled}
                          className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 disabled:opacity-50"
                          title="Définir comme image principale"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}

                      {/* Déplacer */}
                      {!disabled && (
                        <button
                          type="button"
                          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                          title="Glisser pour réorganiser"
                        >
                          <Move className="w-4 h-4" />
                        </button>
                      )}

                      {/* Supprimer */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        disabled={disabled}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 disabled:opacity-50"
                        title="Supprimer cette image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Informations */}
                <div className="p-2 bg-white">
                  <div className="text-xs text-gray-600 truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Conseils */}
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="text-sm font-medium text-green-800 mb-2">
              💡 Conseils pour de belles photos
            </h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Utilisez un éclairage naturel</li>
              <li>• Prenez des photos de chaque pièce</li>
              <li>• Mettez en valeur les points forts (vue, jardin, etc.)</li>
              <li>• Définissez une photo principale attrayante</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyImageUpload;
