/**
 * PropertyFormStep2Location - Localisation du bien
 * CitySelector et adresse détaillée
 */

import React from 'react';
import { MapPin } from 'lucide-react';
import CitySelector from '../CitySelector';
import { PropertyData } from '../../services/propertyService';

interface PropertyFormStep2Props {
  formData: PropertyData;
  errors: Partial<Record<keyof PropertyData, string>>;
  updateField: (field: keyof PropertyData, value: unknown) => void;
  isSubmitting: boolean;
  subNeighborhood: string;
  setSubNeighborhood: (value: string) => void;
  latitude: number | null;
  longitude: number | null;
  onCoordinatesChange: (lat: number, lng: number) => void;
}

export const PropertyFormStep2Location: React.FC<PropertyFormStep2Props> = ({
  formData,
  errors,
  updateField,
  isSubmitting,
  subNeighborhood,
  setSubNeighborhood,
  latitude,
  longitude,
  onCoordinatesChange
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
        <CitySelector
          selectedCity={formData.city}
          selectedDistrict={formData.district}
          subNeighborhood={subNeighborhood}
          latitude={latitude}
          longitude={longitude}
          onCitySelect={(city) => {
            updateField('city', city);
            updateField('district', '');
          }}
          onDistrictSelect={(district) => updateField('district', district)}
          onSubNeighborhoodChange={setSubNeighborhood}
          onCoordinatesChange={onCoordinatesChange}
          disabled={isSubmitting}
        />
      </div>

      {/* Adresse détaillée */}
      <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
        <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2.5 tracking-wide">
          <MapPin className="inline w-3.5 h-3.5 mr-1" /> Adresse détaillée (optionnel)
        </label>
        <input
          type="text"
          value={formData['address']}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="Numéro, nom de rue, références supplémentaires..."
          className={`
            w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200
            font-medium text-[#2C1810] placeholder:text-[#C5BAB3]
            ${errors['address'] ? 'border-red-400' : 'border-[#EFEBE9] hover:border-[#F16522]/50'}
            focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
          `}
        />
        {errors['address'] && <p className="text-red-500 text-xs mt-1.5">{errors['address']}</p>}
      </div>
    </div>
  );
};

export default PropertyFormStep2Location;