import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, CheckCircle, XCircle, Loader2, RefreshCw, ShieldCheck, ExternalLink } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { supabase } from '@/integrations/supabase/client';

interface NeofaceVerificationProps {
  userId: string;
  cniPhotoUrl: string;
  onVerified: (verificationData: unknown) => void;
  onFailed: (error: string) => void;
}

type VerificationStatus = 'idle' | 'uploading' | 'waiting_selfie' | 'polling' | 'success' | 'error';

const MAX_POLL_ATTEMPTS = 60; // 2 minutes max (60 x 2s)
const POLL_INTERVAL_MS = 2000; // 2 seconds

const NeofaceVerification: React.FC<NeofaceVerificationProps> = ({
  userId,
  cniPhotoUrl,
  onVerified,
  onFailed,
}) => {
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [_verificationId, setVerificationId] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [matchingScore, setMatchingScore] = useState<number | null>(null);
  const [progress, setProgress] = useState('');
  const [pollAttempt, setPollAttempt] = useState(0);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const popupRef = useRef<Window | null>(null);

  // Cleanup on unmount
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

  // Upload document to NeoFace and get selfie URL
  const uploadDocument = async () => {
    setStatus('uploading');
    setProgress('Téléchargement du document CNI...');
    setError(null);
    
    try {
      console.log('[NeoFace] Uploading document...');
      const { data, error: invokeError } = await supabase.functions.invoke('neoface-verify', {
        body: {
          action: 'upload_document',
          cni_photo_url: cniPhotoUrl,
          user_id: userId,
        },
      });

      if (invokeError) throw new Error(invokeError.message);
      if (data?.error) throw new Error(data.error);

      console.log('[NeoFace] Document uploaded:', data);
      
      const docId = data.document_id;
      const selfieLink = data.selfie_url;
      const verifyId = data.verification_id;
      
      if (!docId || !selfieLink) {
        throw new Error('Réponse NeoFace incomplète');
      }

      setDocumentId(docId);
      setSelfieUrl(selfieLink);
      setVerificationId(verifyId);
      setProgress('Document téléchargé ! Ouvrez la fenêtre NeoFace pour capturer votre selfie.');
      setStatus('waiting_selfie');

      // Open NeoFace selfie capture in popup
      openSelfiePopup(selfieLink);
      
      // Start polling for result
      startPolling(docId, verifyId);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du téléchargement';
      console.error('[NeoFace] Upload error:', errorMessage);
      setStatus('error');
      setError(errorMessage);
      onFailed(errorMessage);
    }
  };

  // Open NeoFace selfie capture page in popup
  const openSelfiePopup = (url: string) => {
    console.log('[NeoFace] Opening selfie popup:', url);
    
    // Close existing popup if any
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    
    // Open new popup
    const width = 500;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    popupRef.current = window.open(
      url,
      'neoface_selfie',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    // If popup blocked, user can click link manually
    if (!popupRef.current) {
      console.warn('[NeoFace] Popup blocked, user will need to click link');
    }
  };

  // Manually open popup again if blocked
  const handleOpenPopup = () => {
    if (selfieUrl) {
      openSelfiePopup(selfieUrl);
    }
  };

  // Start polling for verification result
  const startPolling = (docId: string, verifyId: string | null) => {
    console.log('[NeoFace] Starting polling for document:', docId);
    setStatus('polling');
    setPollAttempt(0);
    
    pollingRef.current = setInterval(async () => {
      setPollAttempt(prev => {
        const attempt = prev + 1;
        
        if (attempt > MAX_POLL_ATTEMPTS) {
          stopPolling();
          setStatus('error');
          setError('Délai d\'attente dépassé (2 minutes). Veuillez réessayer.');
          onFailed('Timeout: vérification non complétée');
          return prev;
        }
        
        setProgress(`Vérification en cours... (${attempt}/${MAX_POLL_ATTEMPTS})`);
        return attempt;
      });
      
      try {
        const { data, error: invokeError } = await supabase.functions.invoke('neoface-verify', {
          body: {
            action: 'check_status',
            document_id: docId,
            verification_id: verifyId,
          },
        });

        if (invokeError) {
          console.error('[NeoFace] Poll invoke error:', invokeError);
          return; // Continue polling
        }

        console.log('[NeoFace] Poll result:', data?.status);

        if (data?.status === 'verified') {
          stopPolling();
          handleVerificationSuccess(data);
        } else if (data?.status === 'failed') {
          stopPolling();
          const failMessage = data.message || 'Les visages ne correspondent pas';
          setStatus('error');
          setError(failMessage);
          onFailed(failMessage);
        }
        // If 'waiting', continue polling
        
      } catch (err) {
        console.error('[NeoFace] Poll error:', err);
        // Continue polling on error
      }
    }, POLL_INTERVAL_MS);
  };

  // Handle successful verification
  const handleVerificationSuccess = (data: { matching_score?: number; verified_at?: string }) => {
    console.log('[NeoFace] Verification success!', data);
    
    // Close popup if still open
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    
    setStatus('success');
    setMatchingScore(data.matching_score || null);
    setProgress('Identité vérifiée avec succès !');
    
    onVerified({
      document_id: documentId,
      matching_score: data.matching_score,
      verified_at: data.verified_at,
      provider: 'neoface',
    });
  };

  // Reset and retry
  const handleRetry = () => {
    stopPolling();
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    
    setStatus('idle');
    setError(null);
    setDocumentId(null);
    setVerificationId(null);
    setSelfieUrl(null);
    setMatchingScore(null);
    setProgress('');
    setPollAttempt(0);
  };

  return (
    <Card className="border-2 border-[#3C2A1E]/10 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#3C2A1E] to-[#5D4037] text-white">
        <CardTitle className="flex items-center gap-2 text-white">
          <Camera className="h-5 w-5" />
          Vérification Faciale
        </CardTitle>
        <CardDescription className="text-white/80">
          Vérification biométrique sécurisée avec NeoFace
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 p-6 bg-[#FDF6E3]">
        {/* IDLE: Show CNI and start button */}
        {status === 'idle' && (
          <>
            {cniPhotoUrl && (
              <div className="flex justify-center">
                <img
                  src={cniPhotoUrl}
                  alt="Photo CNI"
                  className="max-w-xs rounded-xl border-2 border-[#3C2A1E]/20 shadow-md"
                />
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-medium mb-2">Comment ça marche :</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Cliquez sur "Commencer la Vérification"</li>
                <li>Une fenêtre NeoFace s'ouvrira pour capturer votre selfie</li>
                <li>Suivez les instructions dans la fenêtre NeoFace</li>
                <li>Revenez ici - la vérification se terminera automatiquement</li>
              </ol>
            </div>
            <Button
              onClick={uploadDocument}
              className="w-full bg-[#F16522] hover:bg-[#D95318] text-white font-semibold py-3 rounded-xl shadow-md"
            >
              <Camera className="mr-2 h-4 w-4" />
              Commencer la Vérification
            </Button>
          </>
        )}

        {/* UPLOADING: Loading state */}
        {status === 'uploading' && (
          <div className="bg-[#F16522]/10 border border-[#F16522]/30 rounded-xl p-6 text-center">
            <Loader2 className="h-10 w-10 text-[#F16522] animate-spin mx-auto mb-4" />
            <p className="text-[#3C2A1E] font-medium">{progress}</p>
          </div>
        )}

        {/* WAITING_SELFIE: Popup opened, waiting for user */}
        {status === 'waiting_selfie' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <ExternalLink className="h-8 w-8 text-amber-600 mx-auto mb-3" />
              <p className="text-amber-800 font-medium mb-2">
                Fenêtre NeoFace ouverte
              </p>
              <p className="text-amber-700 text-sm mb-4">
                Capturez votre selfie dans la fenêtre NeoFace, puis revenez ici.
                La vérification se terminera automatiquement.
              </p>
              
              {selfieUrl && (
                <Button
                  onClick={handleOpenPopup}
                  variant="outline"
                  className="border-amber-400 text-amber-700 hover:bg-amber-100"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Réouvrir la fenêtre NeoFace
                </Button>
              )}
            </div>
            
            <div className="text-center text-sm text-[#5D4037]/70">
              En attente de votre selfie...
            </div>

            <Button onClick={handleRetry} variant="outline" className="w-full">
              Annuler
            </Button>
          </div>
        )}

        {/* POLLING: Checking verification status */}
        {status === 'polling' && (
          <div className="space-y-4">
            <div className="bg-[#F16522]/10 border border-[#F16522]/30 rounded-xl p-6 text-center">
              <Loader2 className="h-10 w-10 text-[#F16522] animate-spin mx-auto mb-4" />
              <p className="text-[#3C2A1E] font-medium mb-2">{progress}</p>
              <p className="text-[#5D4037]/70 text-sm">
                Capturez votre selfie dans la fenêtre NeoFace si ce n'est pas déjà fait.
              </p>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-[#EFEBE9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F16522] transition-all duration-500"
                style={{ width: `${(pollAttempt / MAX_POLL_ATTEMPTS) * 100}%` }}
              />
            </div>

            {selfieUrl && (
              <Button
                onClick={handleOpenPopup}
                variant="outline"
                className="w-full border-[#F16522]/30 text-[#F16522] hover:bg-[#F16522]/10"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ouvrir NeoFace
              </Button>
            )}

            <Button onClick={handleRetry} variant="outline" className="w-full">
              Annuler
            </Button>
          </div>
        )}

        {/* SUCCESS: Verification complete */}
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-green-800 font-semibold text-lg mb-2">Identité Vérifiée !</p>
            {matchingScore && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span className="text-green-700">
                  Score de correspondance : {Math.round(matchingScore * 100)}%
                </span>
              </div>
            )}
            <p className="text-green-700 text-sm">
              Votre identité a été vérifiée avec succès via NeoFace.
            </p>
          </div>
        )}

        {/* ERROR: Show error with retry */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <p className="text-red-800 font-semibold text-lg mb-2">Vérification Échouée</p>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <Button
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NeofaceVerification;
