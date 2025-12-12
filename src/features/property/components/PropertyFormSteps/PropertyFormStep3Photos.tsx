/**
 * PropertyFormStep3Photos - Photos du bien
 * Upload et gestion des images
 */

import React from 'react';
import { ImageIcon, AlertTriangle } from 'lucide-react';
import PropertyImageUpload from '../PropertyImageUpload';
import { PropertyData } from '../../services/propertyService';

interface PropertyFormStep3Props {
  formData: PropertyData;
  errors: Partial<Record<keyof PropertyData, string>>;
  updateField: (field: keyof PropertyData, value: unknown) => void;
  isSubmitting: boolean;
  addImages: (files: File[]) => void;
  removeImage: (index: number) => void;
  setMainImage: (index: number) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
}

export const PropertyFormStep3Photos: React.FC<PropertyFormStep3Props> = ({
  formData,
  errors,
  updateField: _updateField,
  isSubmitting,
  addImages,
  removeImage,
  setMainImage,
  reorderImages
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-[#F16522]/10 rounded-xl">
            <ImageIcon className="w-5 h-5 text-[#F16522]" />
          </div>
          <div>
            <h3 className="font-bold text-[#2C1810]">Photos du bien</h3>
            <p className="text-xs text-[#A69B95]">Ajoutez jusqu'à 20 photos (max 5MB/image)</p>
          </div>
        </div>

        <PropertyImageUpload
          images={formData['images'] as File[]}
          mainImageIndex={(formData['mainImageIndex'] as number) || 0}
          onImagesAdd={addImages}
          onImageRemove={removeImage}
          onMainImageSet={setMainImage}
          onImagesReorder={reorderImages}
          disabled={isSubmitting}
          maxImages={20}
        />
        
        {errors['images'] && (
          <div className="flex items-center gap-2 text-red-500 mt-4 p-3 bg-red-50 rounded-xl">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{errors['images']}</span>
          </div>
        )}
      </div>

      <div className="bg-[#F16522]/5 border border-[#F16522]/20 rounded-xl p-4">
        <p className="text-sm text-[#6B5A4E]">
          <strong className="text-[#2C1810]">💡 Conseil :</strong> Des photos de qualité multiplient par 5 vos chances de location/vente. Prenez vos photos en journée avec une bonne luminosité.
        </p>
      </div>
    </div>
  );
};

export default PropertyFormStep3Photos;