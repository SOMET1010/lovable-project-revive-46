/**
 * PropertyFormStep4Pricing - Prix, contact et vérification CNI
 */

import React from 'react';
import { 
  DollarSign, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle, 
  Upload, 
  Camera, 
  RefreshCw, 
  Loader2, 
  X, 
  FileCheck 
} from 'lucide-react';
import { PropertyData } from '../../services/propertyService';

interface PropertyFormStep4Props {
  formData: PropertyData;
  errors: Partial<Record<keyof PropertyData, string>>;
  updateField: (field: keyof PropertyData, value: unknown) => void;
  isSubmitting: boolean;
  // CNI verification props
  cniFile: File | null;
  cniPreviewUrl: string | null;
  cniUploadedUrl: string | null;
  cniUploading: boolean;
  cniVerificationStatus: 'pending' | 'verifying' | 'verified' | 'failed';
  cniMatchingScore: number | null;
  onCniUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveCni: () => void;
  onStartVerification: () => void;
  onRetryVerification: () => void;
}

export const PropertyFormStep4Pricing: React.FC<PropertyFormStep4Props> = ({
  formData,
  errors,
  updateField,
  isSubmitting: _isSubmitting,
  cniFile,
  cniPreviewUrl,
  cniUploadedUrl,
  cniUploading,
  cniVerificationStatus,
  cniMatchingScore,
  onCniUpload,
  onRemoveCni,
  onStartVerification,
  onRetryVerification
}) => {
  return (
    <div className="space-y-6">
      {/* Prix */}
      <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-[#F16522]/10 rounded-xl">
            <DollarSign className="w-5 h-5 text-[#F16522]" />
          </div>
          <h3 className="font-bold text-[#2C1810]">Prix</h3>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2.5 tracking-wide">
            Prix {formData.priceType === 'achat' ? '(FCFA)' : '(FCFA/mois)'} <span className="text-[#F16522]">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={formData['price'] || ''}
              onChange={(e) => updateField('price', parseInt(e.target.value) || 0)}
              placeholder="0"
              className={`
                w-full pl-16 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200
                font-medium text-[#2C1810] placeholder:text-[#C5BAB3]
                ${errors['price'] ? 'border-red-400' : 'border-[#EFEBE9] hover:border-[#F16522]/50'}
                focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
              `}
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-[#A69B95] font-medium">FCFA</span>
            </div>
          </div>
          {errors['price'] && <p className="text-red-500 text-xs mt-1.5">{errors['price']}</p>}
          {(formData['price'] as number) > 0 && (
            <p className="text-sm text-[#6B5A4E] mt-2 font-medium">
              Prix formaté: {(formData['price'] as number).toLocaleString()} FCFA
              {formData['priceType'] === 'location' && ' / mois'}
            </p>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-[#F16522]/10 rounded-xl">
            <User className="w-5 h-5 text-[#F16522]" />
          </div>
          <h3 className="font-bold text-[#2C1810]">Vos informations de contact</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
              Nom complet <span className="text-[#F16522]">*</span>
            </label>
            <input
              type="text"
              value={formData['ownerName']}
              onChange={(e) => updateField('ownerName', e.target.value)}
              placeholder="Votre nom et prénom"
              className={`
                w-full px-4 py-3.5 rounded-xl border-2 transition-all font-medium text-[#2C1810]
                ${errors['ownerName'] ? 'border-red-400' : 'border-[#EFEBE9]'}
                focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
              `}
            />
            {errors['ownerName'] && <p className="text-red-500 text-xs mt-1.5">{errors['ownerName']}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
              <Mail className="inline w-3.5 h-3.5 mr-1" /> Email <span className="text-[#F16522]">*</span>
            </label>
            <input
              type="email"
              value={formData['ownerEmail']}
              onChange={(e) => updateField('ownerEmail', e.target.value)}
              placeholder="votre@email.com"
              className={`
                w-full px-4 py-3.5 rounded-xl border-2 transition-all font-medium text-[#2C1810]
                ${errors['ownerEmail'] ? 'border-red-400' : 'border-[#EFEBE9]'}
                focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
              `}
            />
            {errors['ownerEmail'] && <p className="text-red-500 text-xs mt-1.5">{errors['ownerEmail']}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
              <Phone className="inline w-3.5 h-3.5 mr-1" /> Téléphone <span className="text-[#F16522]">*</span>
            </label>
            <input
              type="tel"
              value={formData['ownerPhone']}
              onChange={(e) => updateField('ownerPhone', e.target.value)}
              placeholder="+225 XX XX XX XX"
              className={`
                w-full px-4 py-3.5 rounded-xl border-2 transition-all font-medium text-[#2C1810]
                ${errors['ownerPhone'] ? 'border-red-400' : 'border-[#EFEBE9]'}
                focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
              `}
            />
            {errors['ownerPhone'] && <p className="text-red-500 text-xs mt-1.5">{errors['ownerPhone']}</p>}
            <p className="text-xs text-[#A69B95] mt-1.5">
              Format accepté: +225 XX XX XX XX ou 0X XX XX XX XX
            </p>
          </div>
        </div>
      </div>

      {/* Vérification d'identité CNI - OBLIGATOIRE */}
      <div className={`bg-white p-6 rounded-2xl border-2 shadow-sm ${
        cniVerificationStatus === 'verified' 
          ? 'border-green-400 bg-green-50/30' 
          : cniVerificationStatus === 'failed'
            ? 'border-red-400 bg-red-50/30'
            : 'border-[#EFEBE9]'
      }`}>
        <div className="flex items-center gap-3 mb-5">
          <div className={`p-2.5 rounded-xl ${
            cniVerificationStatus === 'verified' ? 'bg-green-100' : 'bg-[#F16522]/10'
          }`}>
            <ShieldCheck className={`w-5 h-5 ${
              cniVerificationStatus === 'verified' ? 'text-green-600' : 'text-[#F16522]'
            }`} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#2C1810]">Vérification d'identité <span className="text-[#F16522]">*</span></h3>
            <p className="text-xs text-[#A69B95]">CNI, passeport ou carte de séjour - Obligatoire</p>
          </div>
          {cniVerificationStatus === 'verified' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-700">Vérifié</span>
              {cniMatchingScore && (
                <span className="text-xs text-green-600">({cniMatchingScore.toFixed(0)}%)</span>
              )}
            </div>
          )}
        </div>

        {/* Zone d'upload ou prévisualisation */}
        {!cniFile ? (
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-[#EFEBE9] rounded-xl p-8 text-center hover:border-[#F16522] hover:bg-[#F16522]/5 transition-all">
              <Upload className="w-10 h-10 text-[#A69B95] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#2C1810] mb-1">
                Cliquez pour uploader votre pièce d'identité
              </p>
              <p className="text-xs text-[#A69B95]">
                JPG ou PNG, max 5 Mo
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={onCniUpload}
              className="hidden"
              disabled={cniUploading}
            />
          </label>
        ) : (
          <div className="space-y-4">
            {/* Prévisualisation de la CNI */}
            <div className="relative rounded-xl overflow-hidden border border-[#EFEBE9]">
              <img
                src={cniPreviewUrl || ''}
                alt="Pièce d'identité"
                className="w-full h-48 object-contain bg-[#FAF7F4]"
              />
              {cniUploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#F16522] animate-spin" />
                </div>
              )}
              {cniVerificationStatus !== 'verified' && !cniUploading && (
                <button
                  type="button"
                  onClick={onRemoveCni}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Statut de vérification */}
            {cniVerificationStatus === 'pending' && cniUploadedUrl && (
              <button
                type="button"
                onClick={onStartVerification}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#F16522] text-white rounded-xl font-bold hover:bg-[#D55A1B] transition-colors"
              >
                <Camera className="w-5 h-5" />
                Vérifier mon identité
              </button>
            )}

            {cniVerificationStatus === 'verifying' && (
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#F16522]/10 rounded-xl">
                <Loader2 className="w-5 h-5 text-[#F16522] animate-spin" />
                <span className="text-sm font-medium text-[#F16522]">Vérification en cours...</span>
              </div>
            )}

            {cniVerificationStatus === 'failed' && (
              <button
                type="button"
                onClick={onRetryVerification}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Réessayer la vérification
              </button>
            )}
          </div>
        )}

        {/* Info de sécurité */}
        <div className="mt-4 pt-4 border-t border-[#EFEBE9]">
          <p className="text-xs text-[#6B5A4E] flex items-start gap-2">
            <FileCheck className="w-4 h-4 text-[#F16522] flex-shrink-0 mt-0.5" />
            <span>
              Cette vérification biométrique garantit que vous êtes bien le propriétaire déclaré. 
              Vos données sont sécurisées et ne sont utilisées que pour la vérification.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyFormStep4Pricing;