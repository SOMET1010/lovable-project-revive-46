/**
 * PropertyFormStep1General - Informations générales du bien
 * Catégorie, titre, description, caractéristiques, équipements
 */

import React from 'react';
import { 
  Home, 
  Building2, 
  Sparkles, 
  Ruler, 
  Bed, 
  Bath, 
  Car, 
  Trees, 
  Shield,
  CheckCircle 
} from 'lucide-react';
import { propertyService, PropertyData } from '../../services/propertyService';

interface PropertyFormStep1Props {
  formData: PropertyData;
  errors: Partial<Record<keyof PropertyData, string>>;
  updateField: (field: keyof PropertyData, value: unknown) => void;
  isSubmitting: boolean;
}

export const PropertyFormStep1General: React.FC<PropertyFormStep1Props> = ({
  formData,
  errors,
  updateField,
  isSubmitting: _isSubmitting
}) => {
  const propertyTypes = propertyService.getPropertyTypes();

  return (
    <div className="space-y-8">
      {/* Catégorie */}
      <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-[#F16522]/10 rounded-xl">
            <Building2 className="w-5 h-5 text-[#F16522]" />
          </div>
          <h3 className="font-bold text-[#2C1810]">Catégorie de bien</h3>
        </div>
        
        <div className="flex gap-4">
          {['residential', 'commercial'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => updateField('priceType', cat === 'residential' ? 'location' : 'achat')}
              className={`
                flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300
                ${formData.priceType === (cat === 'residential' ? 'location' : 'achat')
                  ? 'bg-[#F16522] text-white shadow-lg shadow-[#F16522]/30 scale-[1.02]'
                  : 'bg-[#FAF7F4] text-[#6B5A4E] hover:bg-[#EFEBE9] border-2 border-transparent hover:border-[#EFEBE9]'
                }
              `}
            >
              {cat === 'residential' ? <Home className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
              <span className="capitalize">{cat === 'residential' ? 'Résidentiel' : 'Commercial'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Titre et Type */}
      <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm space-y-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-[#F16522]/10 rounded-xl">
            <Sparkles className="w-5 h-5 text-[#F16522]" />
          </div>
          <h3 className="font-bold text-[#2C1810]">Informations principales</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
              Titre de l'annonce <span className="text-[#F16522]">*</span>
            </label>
            <input
              type="text"
              value={formData['title']}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Ex: Villa duplex 5 pièces Riviera"
              maxLength={100}
              className={`
                w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                font-medium text-[#2C1810] placeholder:text-[#C5BAB3]
                ${errors['title'] 
                  ? 'border-red-400 bg-red-50/30' 
                  : formData['title'].length >= 5 
                    ? 'border-green-400 bg-green-50/30' 
                    : 'border-[#EFEBE9] hover:border-[#F16522]/50'
                }
                focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
              `}
            />
            {errors['title'] && <p className="text-red-500 text-xs mt-1.5">{errors['title']}</p>}
            <p className="text-xs text-[#A69B95] mt-1.5">{formData['title'].length}/100 caractères</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
              Type de propriété <span className="text-[#F16522]">*</span>
            </label>
            <select
              value={formData['propertyType']}
              onChange={(e) => updateField('propertyType', e.target.value)}
              className={`
                w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                font-medium text-[#2C1810] appearance-none bg-white cursor-pointer
                ${errors['propertyType'] ? 'border-red-400' : 'border-[#EFEBE9] hover:border-[#F16522]/50'}
                focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
              `}
            >
              {propertyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors['propertyType'] && <p className="text-red-500 text-xs mt-1.5">{errors['propertyType']}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
            Description détaillée <span className="text-[#F16522]">*</span>
          </label>
          <textarea
            value={formData['description']}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Décrivez les atouts de votre bien, son environnement..."
            rows={4}
            maxLength={2000}
            className={`
              w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 resize-none
              font-medium text-[#2C1810] placeholder:text-[#C5BAB3]
              ${errors['description'] 
                ? 'border-red-400 bg-red-50/30' 
                : formData['description'].length >= 20 
                  ? 'border-green-400 bg-green-50/30' 
                  : 'border-[#EFEBE9] hover:border-[#F16522]/50'
              }
              focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
            `}
          />
          {errors['description'] && <p className="text-red-500 text-xs mt-1.5">{errors['description']}</p>}
          <p className="text-xs text-[#A69B95] mt-1.5">{formData['description'].length}/2000 caractères</p>
        </div>
      </div>

      {/* Caractéristiques */}
      <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-[#F16522]/10 rounded-xl">
            <Ruler className="w-5 h-5 text-[#F16522]" />
          </div>
          <h3 className="font-bold text-[#2C1810]">Caractéristiques</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
              <Bed className="inline w-3.5 h-3.5 mr-1" /> Chambres <span className="text-[#F16522]">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={formData['bedrooms']}
              onChange={(e) => updateField('bedrooms', parseInt(e.target.value) || 0)}
              className={`
                w-full px-4 py-3 rounded-xl border-2 transition-all font-medium text-[#2C1810]
                ${errors['bedrooms'] ? 'border-red-400' : 'border-[#EFEBE9]'}
                focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
              `}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
              <Bath className="inline w-3.5 h-3.5 mr-1" /> Salles de bain <span className="text-[#F16522]">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={formData['bathrooms']}
              onChange={(e) => updateField('bathrooms', parseInt(e.target.value) || 0)}
              className={`
                w-full px-4 py-3 rounded-xl border-2 transition-all font-medium text-[#2C1810]
                ${errors['bathrooms'] ? 'border-red-400' : 'border-[#EFEBE9]'}
                focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
              `}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
              <Ruler className="inline w-3.5 h-3.5 mr-1" /> Surface (m²) <span className="text-[#F16522]">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData['area']}
              onChange={(e) => updateField('area', parseInt(e.target.value) || 0)}
              className={`
                w-full px-4 py-3 rounded-xl border-2 transition-all font-medium text-[#2C1810]
                ${errors['area'] ? 'border-red-400' : 'border-[#EFEBE9]'}
                focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
              `}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
              Transaction
            </label>
            <select
              value={formData.priceType}
              onChange={(e) => updateField('priceType', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#EFEBE9] font-medium text-[#2C1810] focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none"
            >
              <option value="location">À louer</option>
              <option value="achat">À vendre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Équipements */}
      <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-[#F16522]/10 rounded-xl">
            <Shield className="w-5 h-5 text-[#F16522]" />
          </div>
          <h3 className="font-bold text-[#2C1810]">Équipements</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { key: 'furnished', label: 'Meublé', icon: <Home className="w-4 h-4" /> },
            { key: 'parking', label: 'Parking', icon: <Car className="w-4 h-4" /> },
            { key: 'garden', label: 'Jardin', icon: <Trees className="w-4 h-4" /> },
            { key: 'terrace', label: 'Terrasse', icon: <Home className="w-4 h-4" /> },
            { key: 'elevator', label: 'Ascenseur', icon: <Building2 className="w-4 h-4" /> },
            { key: 'security', label: 'Sécurité', icon: <Shield className="w-4 h-4" /> }
          ].map((amenity) => (
            <label
              key={amenity.key}
              className={`
                flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${formData[amenity.key as keyof PropertyData]
                  ? 'border-[#F16522] bg-[#F16522]/5 text-[#F16522]'
                  : 'border-[#EFEBE9] hover:border-[#F16522]/30 text-[#6B5A4E]'
                }
              `}
            >
              <input
                type="checkbox"
                checked={formData[amenity.key as keyof PropertyData] as boolean}
                onChange={(e) => updateField(amenity.key as keyof PropertyData, e.target.checked)}
                className="sr-only"
              />
              <div className={`p-1.5 rounded-lg ${formData[amenity.key as keyof PropertyData] ? 'bg-[#F16522]/10' : 'bg-[#FAF7F4]'}`}>
                {amenity.icon}
              </div>
              <span className="font-medium text-sm">{amenity.label}</span>
              {formData[amenity.key as keyof PropertyData] && (
                <CheckCircle className="w-4 h-4 ml-auto text-[#F16522]" />
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyFormStep1General;