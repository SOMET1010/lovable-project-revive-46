import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, XCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { supabase } from '@/integrations/supabase/client';

interface NeofaceVerificationProps {
  userId: string;
  cniPhotoUrl: string | null;
  onVerified: (verificationData: unknown) => void;
  onFailed: (error: string) => void;
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

const NeofaceVerification: React.FC<NeofaceVerificationProps> = ({
  userId,
  cniPhotoUrl,
  onVerified,
  onFailed,
}) => {
  const hasDocument = Boolean(cniPhotoUrl);
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<
    'idle' | 'uploading' | 'waiting' | 'polling' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);
  const [_documentId, setDocumentId] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [_verificationId, setVerificationId] = useState<string | null>(null);
  const [matchingScore, setMatchingScore] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [progress, setProgress] = useState('');
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
    if (!cniPhotoUrl) {
      throw new Error('La photo du document est requise avant la vérification');
    }

    console.log('[NeoFace UI] URL de la photo CNI:', cniPhotoUrl);

    // Extraire les informations de l'URL pour éviter les problèmes avec les URLs signées
    let bucket: string;
    let path: string;

    // Nettoyer l'URL pour enlever les paramètres
    const cleanUrl = cniPhotoUrl.split('?')[0];

    // Détecter le type d'URL et extraire bucket et path
    const signMatch = cleanUrl.match(/\/storage\/v1\/object\/sign\/([^\/]+)\/(.+)/);
    const publicMatch = cleanUrl.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)/);
    const authMatch = cleanUrl.match(/\/storage\/v1\/object\/authenticated\/([^\/]+)\/(.+)/);

    if (signMatch) {
      bucket = signMatch[1];
      path = signMatch[2];
    } else if (publicMatch) {
      bucket = publicMatch[1];
      path = publicMatch[2];
    } else if (authMatch) {
      bucket = authMatch[1];
      path = authMatch[2];
    } else {
      console.error('[NeoFace UI] Format d\'URL non reconnu:', cniPhotoUrl);
      throw new Error('Format d\'URL de stockage non reconnu');
    }

    console.log('[NeoFace UI] Bucket détecté:', bucket);
    console.log('[NeoFace UI] Chemin détecté:', path);

    const { data, error } = await supabase.functions.invoke('neoface-verify', {
      body: {
        action: 'upload_document',
        bucket: bucket,
        path: path,
        user_id: userId,
      },
    });

    if (error) {
      throw new Error(error.message || 'Échec du téléchargement du document');
    }

    return data as VerificationResponse;
  };

  const checkVerificationStatus = async (
    docId: string,
    verifyId: string
  ): Promise<StatusResponse> => {
    try {
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
    } catch (err) {
      console.error('[NeoFace] Erreur lors de la vérification du statut:', err);

      // En cas d'erreur 403, on simule un échec temporaire
      if (err instanceof Error && err.message.includes('403')) {
        // Simuler une réponse d'échec après quelques tentatives
        const maxRetries = 5;
        if (attempts >= maxRetries) {
          return {
            status: 'failed',
            message: 'Vérification échouée: problème de connexion avec NeoFace. Veuillez réessayer plus tard.',
            document_id: docId,
            provider: 'neoface',
          };
        }

        // Simuler "waiting" pour permettre d'autres tentatives
        return {
          status: 'waiting',
          message: 'Vérification en cours de traitement...',
          document_id: docId,
          provider: 'neoface',
        };
      }

      throw err;
    }
  };

  const startPolling = (docId: string, verifyId: string) => {
    setStatus('polling');
    setProgress('Vérification en cours...');
    let pollAttempts = 0;
    const maxAttempts = 100;

    timeoutRef.current = setTimeout(
      () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        setStatus('error');
        setError(
          "Timeout: La vérification n'a pas été complétée dans les délais. Veuillez réessayer."
        );
        if (selfieWindowRef.current && !selfieWindowRef.current.closed) {
          selfieWindowRef.current.close();
        }
      },
      5 * 60 * 1000
    );

    // Vérifier si la fenêtre a été fermée par l'utilisateur
    const windowCheckInterval = setInterval(() => {
      if (selfieWindowRef.current?.closed) {
        clearInterval(windowCheckInterval);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setStatus('error');
        setError('La fenêtre de vérification a été fermée. Veuillez réessayer.');
        onFailed('Fenêtre fermée par l\'utilisateur');
      }
    }, 1000);

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
        let message = 'Erreur lors du suivi de la vérification';

        if (err instanceof Error) {
          if (err.message.includes('429') || err.message.toLowerCase().includes('too many')) {
            message = 'Limite de débit NeoFace atteinte. Réessayez dans quelques instants.';
          } else if (err.message.includes('403') || err.message.includes('Forbidden')) {
            message = 'Accès refusé par NeoFace. Veuillez réessayer ou contacter le support.';
          } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
            message = 'Token NeoFace invalide. Contactez le support.';
          } else {
            message = err.message;
          }
        }

        setStatus('error');
        setError(message);
        onFailed(message);
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (selfieWindowRef.current && !selfieWindowRef.current.closed) {
          selfieWindowRef.current.close();
        }
      }
    }, 3000);
  };

  const handleVerification = async () => {
    if (!hasDocument) {
      setError("Ajoutez d'abord une photo de votre document d'identité pour continuer.");
      setStatus('error');
      return;
    }

    setIsVerifying(true);
    setStatus('uploading');
    setError(null);
    setProgress('Téléchargement du document en cours...');

    try {
      const uploadData = await uploadDocument();

      console.log('[NeoFace UI] Upload response:', uploadData);
      console.log('[NeoFace UI] Document ID:', uploadData.document_id);
      console.log('[NeoFace UI] Selfie URL:', uploadData.selfie_url);
      console.log('[NeoFace UI] Verification ID:', uploadData.verification_id);

      setDocumentId(uploadData.document_id);
      setSelfieUrl(uploadData.selfie_url);
      setVerificationId(uploadData.verification_id);
      setProgress('Document téléchargé avec succès !');

      setStatus('waiting');
      setProgress('Redirection vers la page de vérification NeoFace...');

      // Vérifier si l'URL est valide
      if (!uploadData.selfie_url || !uploadData.selfie_url.startsWith('http')) {
        throw new Error(`URL NeoFace invalide: ${uploadData.selfie_url}`);
      }

      console.log('[NeoFace UI] Redirection vers:', uploadData.selfie_url);

      // NOTE: NeoFace utilise X-Frame-Options: DENY, donc impossible d'utiliser iframe/popup
      // On doit rediriger l'utilisateur vers la page NeoFace
      // On stocke les infos de vérification pour les récupérer au retour
      sessionStorage.setItem('neoface_verification', JSON.stringify({
        document_id: uploadData.document_id,
        verification_id: uploadData.verification_id,
        user_id: userId,
        timestamp: Date.now()
      }));

      // Rediriger vers la page NeoFace
      window.location.href = uploadData.selfie_url;

      // Le code ci-dessous ne sera pas exécuté à cause de la redirection
      // startPolling sera appelé quand l'utilisateur reviendra sur la page

    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification';
      console.error('[NeoFace UI] Erreur lors de la vérification:', err);

      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('too many')) {
        errorMessage =
          'Trop de requêtes NeoFace. Attendez quelques instants avant de relancer la vérification.';
      }
      if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('token')) {
        errorMessage =
          'Token NeoFace invalide ou expiré. Contactez le support pour régénérer le jeton.';
      }

      setStatus('error');
      setError(errorMessage);
      onFailed(errorMessage);
      setIsVerifying(false);
    }
  };

  // Vérifier si on revient de NeoFace
  React.useEffect(() => {
    const verificationData = sessionStorage.getItem('neoface_verification');
    if (verificationData && status === 'idle') {
      try {
        const data = JSON.parse(verificationData);
        const timeDiff = Date.now() - data.timestamp;

        // Si ça fait moins de 30 minutes, on considère que c'est valide
        if (timeDiff < 30 * 60 * 1000 && data.document_id && data.verification_id) {
          console.log('[NeoFace UI] Retour de NeoFace détecté, démarrage du polling');

          // Nettoyer le sessionStorage
          sessionStorage.removeItem('neoface_verification');

          // Démarrer le polling pour vérifier le statut
          setStatus('polling');
          setProgress('Vérification du statut en cours...');
          setDocumentId(data.document_id);
          setVerificationId(data.verification_id);
          startPolling(data.document_id, data.verification_id);
        }
      } catch (e) {
        console.error('[NeoFace UI] Erreur lors de la lecture des données de retour:', e);
        sessionStorage.removeItem('neoface_verification');
      }
    }
  }, []);

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

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleReopenWindow = () => {
    if (selfieUrl && (!selfieWindowRef.current || selfieWindowRef.current.closed)) {
      selfieWindowRef.current = window.open(
        selfieUrl,
        'NeofaceVerification',
        'width=800,height=600,left=100,top=100'
      );
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
          Vérification biométrique gratuite avec détection de vivacité
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6 bg-[#FDF6E3]">
        {cniPhotoUrl && (
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={cniPhotoUrl}
                alt="Photo CNI"
                className="max-w-xs rounded-xl border-2 border-[#3C2A1E]/20 shadow-md"
                onError={(e) => {
                  console.error('[NeoFace] Erreur de chargement de l\'image:', e);
                  e.currentTarget.src = '';
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={(e) => {
                  console.log('[NeoFace] Image chargée avec succès');
                  e.currentTarget.style.display = 'block';
                }}
              />
              {!cniPhotoUrl && (
                <div className="w-64 h-40 bg-gray-200 rounded-xl flex items-center justify-center">
                  <p className="text-gray-500">Chargement de l'image...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!hasDocument && status === 'idle' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Photo requise</p>
                <p className="text-sm text-amber-700 mt-1">
                  Ajoutez la photo de votre document d'identité avant de lancer la vérification.
                </p>
              </div>
            </div>
          </div>
        )}

        {status !== 'idle' && status !== 'success' && (
          <div className="bg-[#F16522]/10 border border-[#F16522]/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-[#F16522] animate-spin flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#3C2A1E]">{progress}</p>
                {attempts > 0 && (
                  <p className="text-xs text-[#F16522] mt-1">Tentative {attempts}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {status === 'waiting' && selfieUrl && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Fenêtre de capture ouverte</p>
                <p className="text-sm text-amber-700 mt-1">
                  Suivez les instructions dans la fenêtre popup pour capturer votre selfie.
                </p>
                <Button
                  onClick={handleReopenWindow}
                  variant="outline"
                  size="small"
                  className="mt-2 border-[#F16522] text-[#F16522] hover:bg-[#F16522]/10"
                >
                  Rouvrir la fenêtre
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
            disabled={isVerifying || !hasDocument}
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
                {hasDocument ? 'Commencer la Vérification' : 'Ajoutez une photo pour commencer'}
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
            <li>✓ Service 100% gratuit (0 FCFA)</li>
            <li>✓ Données cryptées et sécurisées</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NeofaceVerification;
