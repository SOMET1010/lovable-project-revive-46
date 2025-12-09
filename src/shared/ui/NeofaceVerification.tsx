import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, XCircle, Loader2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { supabase } from '@/integrations/supabase/client';

interface NeofaceVerificationProps {
  userId: string;
  cniPhotoUrl: string;
  onVerified: (verificationData: unknown) => void;
  onFailed: (error: string) => void;
  returnUrl?: string;
}

interface VerificationResponse {
  success: boolean;
  document_id: string;
  selfie_url: string;
  verification_id: string;
  provider: string;
  message: string;
}

interface StatusResponse {
  status: 'waiting' | 'verified' | 'failed';
  message: string;
  document_id: string;
  matching_score?: number;
  verified_at?: string;
  provider: string;
}

const NEOFACE_STORAGE_KEY = 'neoface_verification_data';

const NeofaceVerification: React.FC<NeofaceVerificationProps> = ({
  userId,
  cniPhotoUrl,
  onVerified,
  onFailed,
  returnUrl = '/completer-profil',
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'waiting' | 'redirecting' | 'polling' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [_documentId, setDocumentId] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [_verificationId, setVerificationId] = useState<string | null>(null);
  const [matchingScore, setMatchingScore] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [progress, setProgress] = useState('');
  const [usePopupMode, setUsePopupMode] = useState(false);
  const selfieWindowRef = useRef<Window | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (selfieWindowRef.current && !selfieWindowRef.current.closed) {
        selfieWindowRef.current.close();
      }
    };
  }, []);

  const uploadDocument = async (): Promise<VerificationResponse> => {
    const { data, error } = await supabase.functions.invoke('neoface-verify', {
      body: {
        action: 'upload_document',
        cni_photo_url: cniPhotoUrl,
        user_id: userId,
      },
    });

    if (error) {
      throw new Error(error.message || 'Échec du téléchargement du document');
    }

    if (data?.error) {
      const errorMsg = data.error as string;
      if (errorMsg.includes('413') || errorMsg.includes('trop volumineuse') || errorMsg.includes('Too Large')) {
        throw new Error('L\'image CNI est trop volumineuse. Veuillez retourner en arrière et télécharger une image plus petite (< 1MB).');
      }
      throw new Error(errorMsg);
    }

    return data as VerificationResponse;
  };

  const checkVerificationStatus = async (
    docId: string,
    verifyId: string
  ): Promise<StatusResponse> => {
    const { data, error } = await supabase.functions.invoke('neoface-verify', {
      body: {
        action: 'check_status',
        document_id: docId,
        verification_id: verifyId,
      },
    });

    if (error) {
      throw new Error(error.message || 'Échec de la vérification du statut');
    }

    return data as StatusResponse;
  };

  const saveVerificationData = (docId: string, verifyId: string, url: string) => {
    const data = {
      document_id: docId,
      verification_id: verifyId,
      selfie_url: url,
      user_id: userId,
      returnUrl: returnUrl,
      timestamp: Date.now(),
    };
    localStorage.setItem(NEOFACE_STORAGE_KEY, JSON.stringify(data));
  };

  const startPolling = (docId: string, verifyId: string) => {
    setStatus('polling');
    setProgress('Vérification en cours...');
    let pollAttempts = 0;
    const maxAttempts = 100;

    timeoutRef.current = setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      setStatus('error');
      setError('Timeout: La vérification n\'a pas été complétée dans les délais. Veuillez réessayer.');
      if (selfieWindowRef.current && !selfieWindowRef.current.closed) {
        selfieWindowRef.current.close();
      }
    }, 5 * 60 * 1000);

    pollingIntervalRef.current = setInterval(async () => {
      pollAttempts++;
      setAttempts(pollAttempts);

      try {
        const statusData = await checkVerificationStatus(docId, verifyId);

        if (statusData.status === 'verified') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          if (selfieWindowRef.current && !selfieWindowRef.current.closed) {
            selfieWindowRef.current.close();
          }

          setStatus('success');
          setMatchingScore(statusData.matching_score || null);
          setProgress('Identité vérifiée avec succès !');
          localStorage.removeItem(NEOFACE_STORAGE_KEY);

          onVerified({
            document_id: docId,
            matching_score: statusData.matching_score,
            verified_at: statusData.verified_at,
            provider: 'neoface',
          });
        } else if (statusData.status === 'failed') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          if (selfieWindowRef.current && !selfieWindowRef.current.closed) {
            selfieWindowRef.current.close();
          }

          setStatus('error');
          const errorMsg = statusData.message || 'La vérification a échoué';
          setError(errorMsg);
          localStorage.removeItem(NEOFACE_STORAGE_KEY);
          onFailed(errorMsg);
        } else {
          setProgress(`En attente du selfie (tentative ${pollAttempts}/${maxAttempts})...`);
        }

        if (pollAttempts >= maxAttempts) {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setStatus('error');
          setError('Nombre maximum de tentatives atteint. Veuillez réessayer.');
        }
      } catch (err) {
        console.error('[NeoFace] Error checking status:', err);
      }
    }, 3000);
  };

  const handleVerification = async () => {
    setIsVerifying(true);
    setStatus('uploading');
    setError(null);
    setProgress('Téléchargement du document en cours...');

    try {
      const uploadData = await uploadDocument();

      setDocumentId(uploadData.document_id);
      setSelfieUrl(uploadData.selfie_url);
      setVerificationId(uploadData.verification_id);
      setProgress('Document téléchargé avec succès !');

      // Save verification data for callback page
      saveVerificationData(
        uploadData.document_id,
        uploadData.verification_id,
        uploadData.selfie_url
      );

      if (usePopupMode) {
        // Try popup mode
        setStatus('waiting');
        setProgress('Ouverture de la fenêtre de capture du selfie...');

        selfieWindowRef.current = window.open(
          uploadData.selfie_url,
          'NeofaceVerification',
          'width=800,height=600,left=100,top=100'
        );

        if (!selfieWindowRef.current) {
          // Popup blocked, switch to redirect mode
          setUsePopupMode(false);
          handleRedirectMode(uploadData.selfie_url);
        } else {
          startPolling(uploadData.document_id, uploadData.verification_id);
        }
      } else {
        // Use redirect mode (default)
        handleRedirectMode(uploadData.selfie_url);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification';
      setStatus('error');
      setError(errorMessage);
      onFailed(errorMessage);
      setIsVerifying(false);
    }
  };

  const handleRedirectMode = (url: string) => {
    setStatus('redirecting');
    setProgress('Redirection vers NeoFace...');
    
    // Small delay for user to see the message
    setTimeout(() => {
      window.location.href = url;
    }, 1000);
  };

  const handleRetry = () => {
    setStatus('idle');
    setError(null);
    setDocumentId(null);
    setSelfieUrl(null);
    setVerificationId(null);
    setMatchingScore(null);
    setAttempts(0);
    setProgress('');
    setIsVerifying(false);
    localStorage.removeItem(NEOFACE_STORAGE_KEY);

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleOpenInNewTab = () => {
    if (selfieUrl) {
      window.open(selfieUrl, '_blank');
    }
  };

  return (
    <Card className="border-2 border-[#3C2A1E]/10 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#3C2A1E] to-[#5D4037] text-white">
        <CardTitle className="flex items-center gap-2 text-white">
          <Camera className="h-5 w-5" />
          Vérification Faciale NeoFace
        </CardTitle>
        <CardDescription className="text-white/80">
          Vérification biométrique avec détection de vivacité
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6 bg-[#FDF6E3]">
        {cniPhotoUrl && status === 'idle' && (
          <div className="flex justify-center">
            <img
              src={cniPhotoUrl}
              alt="Photo CNI"
              className="max-w-xs rounded-xl border-2 border-[#3C2A1E]/20 shadow-md"
            />
          </div>
        )}

        {(status === 'uploading' || status === 'polling') && (
          <div className="bg-[#F16522]/10 border border-[#F16522]/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-[#F16522] animate-spin flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#3C2A1E]">{progress}</p>
                {attempts > 0 && (
                  <p className="text-xs text-[#F16522] mt-1">
                    Tentative {attempts}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {status === 'redirecting' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium text-blue-900">{progress}</p>
            <p className="text-sm text-blue-700 mt-2">
              Vous allez être redirigé vers la page de capture du selfie.
            </p>
            <p className="text-xs text-blue-600 mt-4">
              Après la capture, vous reviendrez automatiquement sur Mon Toit.
            </p>
          </div>
        )}

        {status === 'waiting' && selfieUrl && usePopupMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Fenêtre de capture ouverte</p>
                <p className="text-sm text-amber-700 mt-1">
                  Suivez les instructions dans la fenêtre popup pour capturer votre selfie.
                </p>
                <Button
                  onClick={handleOpenInNewTab}
                  variant="outline"
                  size="small"
                  className="mt-2 border-[#F16522] text-[#F16522] hover:bg-[#F16522]/10"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ouvrir dans un nouvel onglet
                </Button>
              </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Identité Vérifiée !</p>
                <p className="text-sm text-green-700 mt-1">
                  Votre identité a été vérifiée avec succès via NeoFace.
                </p>
                {matchingScore !== null && (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    Score de correspondance : {(matchingScore * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {status === 'error' && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Erreur de vérification</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <Button
            onClick={handleVerification}
            disabled={isVerifying}
            className="w-full bg-[#F16522] hover:bg-[#D95318] text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-200"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification en cours...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Commencer la Vérification
              </>
            )}
          </Button>
        )}

        {status === 'error' && (
          <Button
            onClick={handleRetry}
            variant="outline"
            className="w-full border-[#3C2A1E] text-[#3C2A1E] hover:bg-[#3C2A1E]/5"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        )}

        <div className="border-t border-[#3C2A1E]/10 pt-4 space-y-2">
          <p className="text-xs text-[#3C2A1E] font-semibold uppercase tracking-wide">
            🔒 Vérification Sécurisée
          </p>
          <ul className="text-xs text-[#5D4037] space-y-1">
            <li>✓ Détection de vivacité (clignement des yeux)</li>
            <li>✓ Reconnaissance faciale par IA</li>
            <li>✓ Service rapide et sécurisé</li>
            <li>✓ Données cryptées et sécurisées</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NeofaceVerification;
