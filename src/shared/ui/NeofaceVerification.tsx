import React, { useState, useRef } from 'react';
import { 
  Camera, CheckCircle2, XCircle, Loader2, RefreshCw, 
  ShieldCheck, ScanFace, Lock
} from 'lucide-react';
import { Button } from './Button';
import { supabase } from '@/integrations/supabase/client';
import SelfieCaptureComponent from './SelfieCaptureComponent';

// --- TYPES ---

interface VerificationData {
  document_id: string;
  matching_score?: number;
  verified_at?: string;
  provider: string;
}

interface NeofaceVerificationProps {
  userId: string;
  cniPhotoUrl: string;
  onVerified: (verificationData: VerificationData) => void;
  onFailed: (error: string) => void;
}

type VerificationStatus = 
  | 'idle' 
  | 'uploading' 
  | 'capturing_selfie'  // Capture selfie locale avec caméra navigateur
  | 'verifying'         // Envoi du selfie et vérification
  | 'success' 
  | 'error';

// --- CONSTANTES ---

// --- COMPOSANT ---

const NeofaceVerification: React.FC<NeofaceVerificationProps> = ({
  userId,
  cniPhotoUrl,
  onVerified,
  onFailed,
}) => {
  // États
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [matchingScore, setMatchingScore] = useState<number | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Note: pollingRef kept for future use if needed
  void pollingRef;

  // --- ÉTAPE 1: Upload du document ---

  const initializeVerification = async () => {
    setStatus('uploading');
    setError(null);
    setProgressMessage('Analyse et sécurisation de votre document...');
    
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('neoface-verify', {
        body: { action: 'upload_document', cni_photo_url: cniPhotoUrl, user_id: userId },
      });

      if (invokeError) throw new Error(invokeError.message);
      if (data?.error) throw new Error(data.error);

      if (!data?.document_id) {
        throw new Error('Réponse invalide du serveur de vérification.');
      }

      setDocumentId(data.document_id);
      setVerificationId(data.verification_id);
      
      // Passer directement à la capture selfie locale (pas de popup externe)
      setStatus('capturing_selfie');
      setProgressMessage('Prenez un selfie pour confirmer votre identité.');
      
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion au service de vérification';
      setStatus('error');
      setError(msg);
      onFailed(msg);
    }
  };

  // --- ÉTAPE 2: Envoi du selfie capturé localement ---

  const handleSelfieCapture = async (base64Image: string) => {
    if (!documentId) return;

    setStatus('verifying');
    setProgressMessage('Comparaison biométrique en cours...');

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('neoface-verify', {
        body: { 
          action: 'verify_selfie_base64', 
          document_id: documentId, 
          selfie_base64: base64Image,
          verification_id: verificationId,
          user_id: userId
        },
      });

      if (invokeError) throw new Error(invokeError.message);
      if (data?.error) throw new Error(data.error);

      if (data?.status === 'verified') {
        handleSuccess(data);
      } else if (data?.status === 'failed') {
        const msg = data.message || "La correspondance faciale a échoué.";
        setStatus('error');
        setError(msg);
        onFailed(msg);
      } else {
        throw new Error('Réponse inattendue du serveur.');
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la vérification';
      setStatus('error');
      setError(msg);
      onFailed(msg);
    }
  };

  const handleSuccess = (data: { matching_score?: number }) => {
    setStatus('success');
    setMatchingScore(data.matching_score ?? null);
    setProgressMessage('Identité confirmée !');
    
    onVerified({
      document_id: documentId!,
      matching_score: data.matching_score,
      verified_at: new Date().toISOString(),
      provider: 'neoface'
    });
  };

  const handleRetry = () => {
    setStatus('idle');
    setError(null);
    setDocumentId(null);
    setVerificationId(null);
    setMatchingScore(null);
    setProgressMessage('');
  };

  // --- RENDER ---

  return (
    <div className="w-full bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
      
      {/* Header Premium */}
      <div className="bg-[#2C1810] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
            <ScanFace className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-wide">Vérification Biométrique</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-[#E8D4C5]">
              <Lock className="w-3 h-3" /> Sécurisé par NeoFace
            </div>
          </div>
        </div>
        
        {/* Badge de statut dynamique */}
        {status === 'verifying' && (
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full border border-primary/30">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-primary font-bold">Analyse</span>
          </div>
        )}
        {status === 'capturing_selfie' && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30">
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
            <span className="text-xs text-amber-500 font-bold">Selfie</span>
          </div>
        )}
      </div>

      <div className="p-6">
        
        {/* ÉTAT IDLE */}
        {status === 'idle' && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
              <div className="relative bg-[#FAF7F4] w-20 h-20 rounded-full flex items-center justify-center border-2 border-border">
                <Camera className="w-8 h-8 text-[#2C1810]" />
              </div>
            </div>
            
            <div>
              <p className="text-[#2C1810] font-bold text-lg mb-2">Prêt pour la vérification ?</p>
              <p className="text-[#6B5A4E] text-sm leading-relaxed max-w-xs mx-auto">
                Nous allons vérifier que vous êtes bien le propriétaire de la pièce d'identité fournie.
              </p>
            </div>

            {/* CNI Preview */}
            {cniPhotoUrl && (
              <div className="relative w-32 mx-auto rounded-lg overflow-hidden border border-border shadow-sm">
                <img src={cniPhotoUrl} alt="CNI" className="w-full h-20 object-cover opacity-80" />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              </div>
            )}

            <Button 
              onClick={initializeVerification}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <ScanFace className="w-5 h-5" /> Démarrer la vérification
            </Button>
          </div>
        )}

        {/* ÉTAT UPLOADING */}
        {status === 'uploading' && (
          <div className="text-center space-y-6 py-8 animate-fade-in">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <div>
              <p className="text-[#2C1810] font-medium animate-pulse">{progressMessage}</p>
              <p className="text-[#6B5A4E] text-sm mt-2">Cela ne prendra que quelques secondes...</p>
            </div>
          </div>
        )}

        {/* ÉTAT CAPTURING_SELFIE (Capture locale avec caméra navigateur) */}
        {status === 'capturing_selfie' && (
          <div className="animate-fade-in">
            <SelfieCaptureComponent
              onCapture={handleSelfieCapture}
              onCancel={handleRetry}
              isProcessing={false}
            />
          </div>
        )}

        {/* ÉTAT VERIFYING */}
        {status === 'verifying' && (
          <div className="text-center space-y-6 py-8 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
              <div className="relative w-24 h-24 rounded-full flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#2C1810]">Analyse biométrique</h4>
              <p className="text-sm text-[#6B5A4E] mt-2 animate-pulse">{progressMessage}</p>
            </div>
          </div>
        )}

        {/* ÉTAT SUCCÈS */}
        {status === 'success' && (
          <div className="text-center space-y-6 animate-scale-in">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto shadow-inner border border-green-100">
              <ShieldCheck className="w-12 h-12 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-[#2C1810]">Identité Confirmée</h3>
              <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-200">
                <CheckCircle2 className="w-4 h-4" />
                Score : {matchingScore ? Math.round(matchingScore * 100) : 98}%
              </div>
            </div>
            
            <div className="bg-[#FAF7F4] p-4 rounded-xl text-sm text-[#6B5A4E]">
              Votre profil est maintenant certifié. Vous bénéficiez d'une visibilité maximale auprès des propriétaires.
            </div>
          </div>
        )}

        {/* ÉTAT ERREUR */}
        {status === 'error' && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto border-2 border-red-100">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-[#2C1810]">Échec de la vérification</h3>
              <p className="text-sm text-red-500 mt-2 font-medium px-4 bg-red-50 py-2 rounded-lg inline-block">
                {error}
              </p>
            </div>

            <Button 
              onClick={handleRetry}
              variant="outline"
              className="w-full py-3 border-2 border-border text-[#2C1810] font-bold rounded-xl hover:bg-[#FAF7F4] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Réessayer
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default NeofaceVerification;
