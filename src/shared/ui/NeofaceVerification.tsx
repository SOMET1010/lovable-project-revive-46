import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { supabase } from '@/integrations/supabase/client';
import SelfieCapture from './SelfieCapture';

interface NeofaceVerificationProps {
  userId: string;
  cniPhotoUrl: string;
  onVerified: (verificationData: unknown) => void;
  onFailed: (error: string) => void;
  returnUrl?: string;
}

interface UploadResponse {
  success: boolean;
  document_id: string;
  verification_id: string;
  provider: string;
  message: string;
}

interface VerifyResponse {
  status: 'waiting' | 'verified' | 'failed';
  message: string;
  matching_score?: number;
  verified_at?: string;
  provider: string;
}

const NeofaceVerification: React.FC<NeofaceVerificationProps> = ({
  userId,
  cniPhotoUrl,
  onVerified,
  onFailed,
  returnUrl: _returnUrl = '/completer-profil',
}) => {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'capturing' | 'verifying' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [matchingScore, setMatchingScore] = useState<number | null>(null);
  const [progress, setProgress] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const uploadDocument = async (): Promise<UploadResponse> => {
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

    return data as UploadResponse;
  };

  const verifySelfie = async (selfieBase64: string): Promise<VerifyResponse> => {
    const { data, error } = await supabase.functions.invoke('neoface-verify', {
      body: {
        action: 'verify_selfie_base64',
        document_id: documentId,
        selfie_base64: selfieBase64,
        verification_id: verificationId,
      },
    });

    if (error) {
      throw new Error(error.message || 'Échec de la vérification du selfie');
    }

    if (data?.error) {
      throw new Error(data.error as string);
    }

    return data as VerifyResponse;
  };

  const handleStartVerification = async () => {
    setStatus('uploading');
    setError(null);
    setProgress('Téléchargement du document CNI...');

    try {
      const uploadData = await uploadDocument();

      setDocumentId(uploadData.document_id);
      setVerificationId(uploadData.verification_id);
      setProgress('Document téléchargé !');

      // Switch to selfie capture mode
      setStatus('capturing');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du téléchargement';
      setStatus('error');
      setError(errorMessage);
      onFailed(errorMessage);
    }
  };

  const handleSelfieCapture = async (selfieBase64: string) => {
    setStatus('verifying');
    setProgress('Comparaison des visages en cours...');

    try {
      const verifyData = await verifySelfie(selfieBase64);

      if (verifyData.status === 'verified') {
        setStatus('success');
        setMatchingScore(verifyData.matching_score || null);
        setProgress('Identité vérifiée avec succès !');

        onVerified({
          document_id: documentId,
          matching_score: verifyData.matching_score,
          verified_at: verifyData.verified_at,
          provider: 'neoface',
        });
      } else if (verifyData.status === 'failed') {
        setStatus('error');
        const errorMsg = verifyData.message || 'La vérification a échoué. Les visages ne correspondent pas.';
        setError(errorMsg);
        onFailed(errorMsg);
      } else {
        setStatus('error');
        setError('Statut de vérification inconnu');
        onFailed('Statut de vérification inconnu');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification';
      setStatus('error');
      setError(errorMessage);
      onFailed(errorMessage);
    }
  };

  const handleCancelCapture = () => {
    setStatus('idle');
    setDocumentId(null);
    setVerificationId(null);
  };

  const handleRetry = () => {
    setStatus('idle');
    setError(null);
    setDocumentId(null);
    setVerificationId(null);
    setMatchingScore(null);
    setProgress('');
  };

  return (
    <Card className="border-2 border-[#3C2A1E]/10 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#3C2A1E] to-[#5D4037] text-white">
        <CardTitle className="flex items-center gap-2 text-white">
          <Camera className="h-5 w-5" />
          Vérification Faciale
        </CardTitle>
        <CardDescription className="text-white/80">
          Vérification biométrique de votre identité
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6 bg-[#FDF6E3]">
        
        {/* Step 1: Show CNI and start button */}
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
            <Button
              onClick={handleStartVerification}
              className="w-full bg-[#F16522] hover:bg-[#D95318] text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-200"
            >
              <Camera className="mr-2 h-4 w-4" />
              Commencer la Vérification
            </Button>
          </>
        )}

        {/* Step 2: Uploading document */}
        {status === 'uploading' && (
          <div className="bg-[#F16522]/10 border border-[#F16522]/30 rounded-xl p-6 text-center">
            <Loader2 className="h-10 w-10 text-[#F16522] animate-spin mx-auto mb-4" />
            <p className="text-[#3C2A1E] font-medium">{progress}</p>
            <p className="text-sm text-[#5D4037] mt-2">Veuillez patienter...</p>
          </div>
        )}

        {/* Step 3: Selfie capture */}
        {status === 'capturing' && (
          <SelfieCapture
            onCapture={handleSelfieCapture}
            onCancel={handleCancelCapture}
            isProcessing={false}
          />
        )}

        {/* Step 4: Verifying */}
        {status === 'verifying' && (
          <div className="bg-[#F16522]/10 border border-[#F16522]/30 rounded-xl p-6 text-center">
            <Loader2 className="h-10 w-10 text-[#F16522] animate-spin mx-auto mb-4" />
            <p className="text-[#3C2A1E] font-medium">{progress}</p>
            <p className="text-sm text-[#5D4037] mt-2">
              Analyse biométrique en cours...
            </p>
          </div>
        )}

        {/* Success state */}
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-green-900">Identité Vérifiée !</p>
            <p className="text-sm text-green-700 mt-2">
              Votre identité a été vérifiée avec succès.
            </p>
            {matchingScore !== null && (
              <p className="text-sm text-green-600 mt-3 font-medium">
                Score de correspondance : {(matchingScore * 100).toFixed(1)}%
              </p>
            )}
          </div>
        )}

        {/* Error state */}
        {status === 'error' && error && (
          <>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Erreur de vérification</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="w-full border-[#3C2A1E] text-[#3C2A1E] hover:bg-[#3C2A1E]/5"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </>
        )}

        {/* Security info */}
        <div className="border-t border-[#3C2A1E]/10 pt-4 space-y-2">
          <p className="text-xs text-[#3C2A1E] font-semibold uppercase tracking-wide">
            🔒 Vérification Sécurisée
          </p>
          <ul className="text-xs text-[#5D4037] space-y-1">
            <li>✓ Capture sécurisée via votre caméra</li>
            <li>✓ Reconnaissance faciale par IA</li>
            <li>✓ Comparaison avec votre pièce d'identité</li>
            <li>✓ Données cryptées et sécurisées</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NeofaceVerification;
