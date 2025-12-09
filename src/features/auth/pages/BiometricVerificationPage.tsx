import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, FileCheck, Scan, CheckCircle, ChevronLeft, Upload, AlertCircle } from 'lucide-react';
import { FormStepper, FormStepContent, useFormStepper } from '@/shared/ui/FormStepper';
import NeofaceVerification from '@/shared/ui/NeofaceVerification';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function BiometricVerificationPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { step, slideDirection, nextStep, prevStep, goToStep } = useFormStepper(3);
  
  const [cniPhotoUrl, setCniPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    score?: number;
    message?: string;
  } | null>(null);

  useEffect(() => {
    // Pre-fill with existing CNI photo if available
    const cniUrl = (profile as { cni_photo_url?: string })?.cni_photo_url;
    if (cniUrl) {
      setCniPhotoUrl(cniUrl);
    }
  }, [profile]);

  // Compress image before upload to prevent 413 errors
  const compressImage = async (file: File, maxWidth = 1920, quality = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Image compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 10MB original)
    const MAX_ORIGINAL_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_ORIGINAL_SIZE) {
      toast.error('Image trop volumineuse (max 10MB)');
      return;
    }

    setIsUploading(true);
    try {
      // Compress image to max 1280px and 70% quality for NeoFace API
      const compressedBlob = await compressImage(file, 1280, 0.7);
      
      // Check compressed size (max 1MB for NeoFace API)
      const MAX_COMPRESSED_SIZE = 1 * 1024 * 1024;
      if (compressedBlob.size > MAX_COMPRESSED_SIZE) {
        toast.error('Image trop volumineuse (max 1MB). Utilisez une image plus petite ou de moindre résolution.');
        setIsUploading(false);
        return;
      }

      const fileName = `${user.id}/cni-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, compressedBlob, {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      setCniPhotoUrl(publicUrl);

      // Save CNI photo URL to profile
      await supabase
        .from('profiles')
        .update({ cni_photo_url: publicUrl })
        .eq('user_id', user.id);

      const sizeKB = Math.round(compressedBlob.size / 1024);
      toast.success(`Photo CNI téléchargée (${sizeKB}KB)`);
    } catch (err) {
      console.error('[BiometricVerification] Upload error:', err);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setIsUploading(false);
    }
  };

  const handleVerified = async (data: unknown) => {
    const verificationData = data as { matching_score?: number };
    setVerificationResult({
      success: true,
      score: verificationData?.matching_score,
      message: 'Identité vérifiée avec succès !',
    });

    // Update profile
    try {
      await supabase
        .from('profiles')
        .update({
          facial_verification_status: 'verified',
          facial_verification_date: new Date().toISOString(),
          facial_verification_score: verificationData?.matching_score || null,
        })
        .eq('user_id', user?.id || '');
    } catch (err) {
      console.error('[BiometricVerification] Profile update error:', err);
    }

    goToStep(3);
  };

  const handleFailed = (error: string) => {
    setVerificationResult({
      success: false,
      message: error,
    });
    toast.error(`Vérification échouée: ${error}`);
  };

  const stepLabels = ['Instructions', 'Photo CNI', 'Vérification'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF6E3] via-white to-[#FDF6E3]">
      {/* Header Premium Ivorian */}
      <div className="bg-gradient-to-r from-[#3C2A1E] to-[#5D4037] text-white py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            Retour
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Scan className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Vérification Biométrique</h1>
              <p className="text-white/70 mt-1">Certifiez votre identité avec NeoFace</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Stepper */}
        <div className="mb-8">
          <FormStepper
            currentStep={step}
            totalSteps={3}
            labels={stepLabels}
            allowClickNavigation={false}
            onStepChange={goToStep}
          />
        </div>

        {/* Step 1: Instructions */}
        <FormStepContent step={1} currentStep={step} slideDirection={slideDirection}>
          <div className="bg-white rounded-2xl shadow-lg border border-[#3C2A1E]/10 overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-[#F16522]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="h-10 w-10 text-[#F16522]" />
                </div>
                <h2 className="text-2xl font-bold text-[#3C2A1E]">Préparez-vous</h2>
                <p className="text-[#5D4037] mt-2">Suivez ces étapes pour une vérification réussie</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 bg-[#FDF6E3] rounded-xl">
                  <div className="w-8 h-8 bg-[#F16522] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold text-[#3C2A1E]">Photo de votre CNI</h3>
                    <p className="text-sm text-[#5D4037]">Prenez une photo claire de votre carte d'identité nationale</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-[#FDF6E3] rounded-xl">
                  <div className="w-8 h-8 bg-[#F16522] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold text-[#3C2A1E]">Capture du selfie</h3>
                    <p className="text-sm text-[#5D4037]">Une fenêtre s'ouvrira pour capturer votre visage avec détection de vivacité</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-[#FDF6E3] rounded-xl">
                  <div className="w-8 h-8 bg-[#F16522] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold text-[#3C2A1E]">Vérification automatique</h3>
                    <p className="text-sm text-[#5D4037]">Notre IA compare votre selfie avec la photo de votre CNI</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900">Conseils pour réussir</p>
                    <ul className="text-amber-700 mt-1 space-y-1">
                      <li>• Bonne luminosité (pas de contre-jour)</li>
                      <li>• Visage bien visible et centré</li>
                      <li>• Autorisez les popups dans votre navigateur</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={nextStep}
                className="w-full py-4 bg-[#F16522] text-white rounded-xl font-semibold hover:bg-[#D95318] transition-colors shadow-md"
              >
                Commencer
              </button>
            </div>
          </div>
        </FormStepContent>

        {/* Step 2: CNI Upload */}
        <FormStepContent step={2} currentStep={step} slideDirection={slideDirection}>
          <div className="bg-white rounded-2xl shadow-lg border border-[#3C2A1E]/10 overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-6">
                <Camera className="h-12 w-12 text-[#F16522] mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-[#3C2A1E]">Photo de votre CNI</h2>
                <p className="text-[#5D4037] mt-1">Téléchargez une photo claire de votre carte d'identité</p>
              </div>

              {cniPhotoUrl ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={cniPhotoUrl}
                      alt="Photo CNI"
                      className="max-w-xs rounded-xl border-2 border-[#3C2A1E]/20 shadow-md"
                    />
                  </div>
                  <p className="text-center text-sm text-green-600 font-medium">
                    ✓ Photo prête pour la vérification
                  </p>
                </div>
              ) : (
                <label className="block">
                  <div className="border-2 border-dashed border-[#3C2A1E]/20 rounded-xl p-8 text-center cursor-pointer hover:border-[#F16522]/50 hover:bg-[#F16522]/5 transition-all">
                    <Upload className="h-12 w-12 text-[#5D4037] mx-auto mb-3" />
                    <p className="font-medium text-[#3C2A1E]">
                      {isUploading ? 'Téléchargement...' : 'Cliquez pour télécharger'}
                    </p>
                    <p className="text-sm text-[#5D4037] mt-1">PNG, JPG (max 5MB recommandé)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  onClick={prevStep}
                  className="flex-1 py-3 border-2 border-[#3C2A1E]/20 text-[#3C2A1E] rounded-xl font-semibold hover:bg-[#3C2A1E]/5 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={nextStep}
                  disabled={!cniPhotoUrl}
                  className="flex-1 py-3 bg-[#F16522] text-white rounded-xl font-semibold hover:bg-[#D95318] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuer
                </button>
              </div>
            </div>
          </div>
        </FormStepContent>

        {/* Step 3: Verification */}
        <FormStepContent step={3} currentStep={step} slideDirection={slideDirection}>
          <div className="space-y-6">
            {verificationResult?.success ? (
              <div className="bg-white rounded-2xl shadow-lg border border-green-200 overflow-hidden">
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-900">Vérification Réussie !</h2>
                  <p className="text-green-700 mt-2">{verificationResult.message}</p>
                  {verificationResult.score && (
                    <p className="text-green-600 font-medium mt-3">
                      Score de correspondance : {(verificationResult.score * 100).toFixed(1)}%
                    </p>
                  )}
                  <button
                    onClick={() => navigate('/profil?tab=verification')}
                    className="mt-6 px-8 py-3 bg-[#F16522] text-white rounded-xl font-semibold hover:bg-[#D95318] transition-colors"
                  >
                    Retour au profil
                  </button>
                </div>
              </div>
            ) : (
              <>
                {cniPhotoUrl && user && (
                  <NeofaceVerification
                    userId={user.id}
                    cniPhotoUrl={cniPhotoUrl}
                    onVerified={handleVerified}
                    onFailed={handleFailed}
                  />
                )}
                <button
                  onClick={prevStep}
                  className="w-full py-3 border-2 border-[#3C2A1E]/20 text-[#3C2A1E] rounded-xl font-semibold hover:bg-[#3C2A1E]/5 transition-colors"
                >
                  Retour
                </button>
              </>
            )}
          </div>
        </FormStepContent>
      </div>
    </div>
  );
}
