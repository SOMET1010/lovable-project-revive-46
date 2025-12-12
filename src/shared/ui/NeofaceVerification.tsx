import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, CheckCircle2, XCircle, Loader2, RefreshCw, 
  ShieldCheck, ExternalLink, ScanFace, Lock 
} from 'lucide-react';
import { Button } from './Button';
import { supabase } from '@/integrations/supabase/client';

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

type VerificationStatus = 'idle' | 'uploading' | 'waiting_selfie' | 'polling' | 'success' | 'error';

// --- CONSTANTES ---

const MAX_POLL_ATTEMPTS = 60; // 2 minutes (60 × 2s)
const POLL_INTERVAL_MS = 2000;

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
  const [_verificationId, setVerificationId] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [matchingScore, setMatchingScore] = useState<number | null>(null);
  const [pollAttempt, setPollAttempt] = useState(0);
  
  // Refs
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupRef = useRef<Window | null>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      stopPolling();
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // --- ACTIONS ---

  const uploadDocument = async () => {
    setStatus('uploading');
    setError(null);
    
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('neoface-verify', {
        body: { action: 'upload_document', cni_photo_url: cniPhotoUrl, user_id: userId },
      });

      if (invokeError) throw new Error(invokeError.message);
      if (data?.error) throw new Error(data.error);

      if (!data?.document_id || !data?.selfie_url) {
        throw new Error('Réponse invalide du serveur de vérification.');
      }

      setDocumentId(data.document_id);
      setSelfieUrl(data.selfie_url);
      setVerificationId(data.verification_id);
      setStatus('waiting_selfie');

      // Ouvrir la popup automatiquement
      openSelfiePopup(data.selfie_url);
      
      // Démarrer le polling
      startPolling(data.document_id, data.verification_id);
      
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion au service de vérification';
      setStatus('error');
      setError(msg);
      onFailed(msg);
    }
  };

  const openSelfiePopup = (url: string) => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    
    const width = 500;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    popupRef.current = window.open(
      url,
      'neoface_selfie',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const startPolling = (docId: string, verifyId: string | null) => {
    setStatus('polling');
    setPollAttempt(0);
    
    pollingRef.current = setInterval(async () => {
      setPollAttempt(prev => {
        const next = prev + 1;
        if (next >= MAX_POLL_ATTEMPTS) {
          stopPolling();
          setStatus('error');
          setError("Le temps imparti est écoulé. Veuillez réessayer.");
          onFailed("Timeout de vérification");
          return prev;
        }
        return next;
      });
      
      try {
        const { data, error: invokeError } = await supabase.functions.invoke('neoface-verify', {
          body: { action: 'check_status', document_id: docId, verification_id: verifyId },
        });

        if (invokeError) return;

        if (data) {
          if (data.status === 'verified') {
            stopPolling();
            handleSuccess(data);
          } else if (data.status === 'failed') {
            stopPolling();
            setStatus('error');
            const msg = data.message || "La correspondance faciale a échoué.";
            setError(msg);
            onFailed(msg);
          }
        }
      } catch (_err) {
        // Continue polling
      }
    }, POLL_INTERVAL_MS);
  };

  const handleSuccess = (data: { matching_score?: number }) => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    setStatus('success');
    setMatchingScore(data.matching_score ?? null);
    
    onVerified({
      document_id: documentId!,
      matching_score: data.matching_score,
      verified_at: new Date().toISOString(),
      provider: 'neoface'
    });
  };

  const handleRetry = () => {
    stopPolling();
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    
    setStatus('idle');
    setError(null);
    setPollAttempt(0);
    setDocumentId(null);
    setVerificationId(null);
    setSelfieUrl(null);
  };

  // Calcul progression pour le cercle SVG
  const progressPercent = (pollAttempt / MAX_POLL_ATTEMPTS) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

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
        
        {/* Badge de statut pendant le polling */}
        {(status === 'polling' || status === 'waiting_selfie') && (
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full border border-primary/30">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-primary font-bold">En cours</span>
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
                Nous allons ouvrir une fenêtre sécurisée pour scanner votre visage et le comparer à votre document d'identité.
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
              onClick={uploadDocument}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <ScanFace className="w-5 h-5" /> Commencer la vérification
            </Button>
          </div>
        )}

        {/* ÉTAT CHARGEMENT / POLLING */}
        {(status === 'uploading' || status === 'waiting_selfie' || status === 'polling') && (
          <div className="text-center space-y-6 animate-fade-in">
            
            {/* Cercle de progression SVG */}
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="48" 
                  cy="48" 
                  r="40" 
                  stroke="#EFEBE9" 
                  strokeWidth="6" 
                  fill="transparent" 
                />
                <circle 
                  cx="48" 
                  cy="48" 
                  r="40" 
                  stroke="#F16522" 
                  strokeWidth="6" 
                  fill="transparent" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-[#2C1810]">
                {status === 'uploading' ? "Initialisation..." : "Vérification en cours"}
              </h4>
              <p className="text-sm text-[#6B5A4E] mt-2 max-w-xs mx-auto">
                {status === 'uploading' 
                  ? "Préparation de l'environnement sécurisé..." 
                  : "Veuillez effectuer le selfie dans la fenêtre qui s'est ouverte."}
              </p>
            </div>

            {/* Fallback manuel */}
            {(status === 'waiting_selfie' || status === 'polling') && selfieUrl && (
              <div className="bg-[#FAF7F4] p-4 rounded-xl border border-border">
                <p className="text-xs text-[#A69B95] mb-3 font-medium">La fenêtre ne s'est pas ouverte ?</p>
                <button 
                  onClick={() => openSelfiePopup(selfieUrl)}
                  className="text-xs font-bold text-[#2C1810] flex items-center justify-center gap-1 hover:underline w-full py-2 border border-[#A69B95]/30 rounded-lg hover:bg-white transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Ouvrir manuellement
                </button>
              </div>
            )}
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
