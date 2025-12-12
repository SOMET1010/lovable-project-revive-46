/**
 * PropertyFormStep5Validation - Récapitulatif et validation finale
 */

import React from 'react';
import { CheckCircle, Bed, Bath, Ruler, MapPin } from 'lucide-react';
import { PropertyData } from '../../services/propertyService';

interface PropertyFormStep5Props {
  formData: PropertyData;
  subNeighborhood: string;
  isSubmitting: boolean;
  uploadProgress: number;
}

export const PropertyFormStep5Validation: React.FC<PropertyFormStep5Props> = ({
  formData,
  subNeighborhood,
  isSubmitting,
  uploadProgress
}) => {
  const mainImageIndex = formData.mainImageIndex ?? 0;
  const mainImage = formData.images[mainImageIndex];

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-gradient-to-br from-[#F16522] to-[#D55A1B] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#F16522]/30">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-[#2C1810] mb-2">Vérification finale</h3>
        <p className="text-[#6B5A4E]">Vérifiez les détails avant la publication</p>
      </div>

      {/* Récapitulatif */}
      <div className="bg-white border-2 border-[#EFEBE9] rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Infos */}
          <div className="p-6 space-y-4">
            <h4 className="font-bold text-[#2C1810] text-lg">{formData.title}</h4>
            <p className="text-sm text-[#6B5A4E] capitalize">{formData.propertyType}</p>
            
            <div className="flex flex-wrap gap-3 text-sm text-[#6B5A4E]">
              <span className="flex items-center gap-1">
                <Bed className="w-4 h-4" /> {formData.bedrooms} ch.
              </span>
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4" /> {formData.bathrooms} sdb
              </span>
              <span className="flex items-center gap-1">
                <Ruler className="w-4 h-4" /> {formData.area} m²
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-[#6B5A4E]">
              <MapPin className="w-4 h-4" />
              {subNeighborhood && `${subNeighborhood}, `}{formData.district}, {formData.city}
            </div>
            
            <div className="text-2xl font-bold text-[#F16522]">
              {formData.price.toLocaleString()} FCFA 
              {formData.priceType === 'location' && <span className="text-base font-normal"> / mois</span>}
            </div>
          </div>

          {/* Image */}
          {formData.images.length > 0 && mainImage && (
            <div className="aspect-video md:aspect-auto bg-[#FAF7F4]">
              <img
                src={URL.createObjectURL(mainImage)}
                alt="Image principale"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#EFEBE9] bg-[#FAF7F4]">
          <p className="text-sm text-[#6B5A4E] line-clamp-3">{formData.description}</p>
        </div>
      </div>

      {/* Progression de soumission */}
      {isSubmitting && (
        <div className="bg-[#F16522]/5 border border-[#F16522]/20 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#F16522]/30 border-t-[#F16522] rounded-full animate-spin"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#2C1810]">Publication en cours...</p>
              {uploadProgress > 0 && (
                <div className="mt-2">
                  <div className="bg-[#F16522]/20 rounded-full h-2">
                    <div 
                      className="bg-[#F16522] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#F16522] mt-1">{uploadProgress}% téléchargé</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFormStep5Validation;