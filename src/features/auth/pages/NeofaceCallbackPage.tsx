import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { supabase } from '@/integrations/supabase/client';

interface StatusResponse {
  status: 'waiting' | 'verified' | 'failed';
  message: string;
  document_id: string;
  matching_score?: number;
  verified_at?: string;
  provider: string;
}

const NEOFACE_STORAGE_KEY = 'neoface_verification_data';

const NeofaceCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'polling' | 'success' | 'error'>('polling');
  const [progress, setProgress] = useState('Vérification de votre identité en cours...');
  const [matchingScore, setMatchingScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Get stored verification data
    const storedData = localStorage.getItem(NEOFACE_STORAGE_KEY);
    
    if (!storedData) {
      // Check URL params as fallback
      const docId = searchParams.get('document_id');
      const verifyId = searchParams.get('verification_id');
      
      if (!docId || !verifyId) {
        setStatus('error');
        setError('Données de vérification manquantes. Veuillez recommencer le processus.');
        return;
      }
      
      startPolling(docId, verifyId);
    } else {
      try {
        const data = JSON.parse(storedData);
        startPolling(data.document_id, data.verification_id);
      } catch {
        setStatus('error');
        setError('Données de vérification invalides. Veuillez recommencer le processus.');
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchParams]);

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

  const updateProfileVerification = async (matchScore: number | null) => {
    const storedData = localStorage.getItem(NEOFACE_STORAGE_KEY);
    if (!storedData) return;

    try {
      const data = JSON.parse(storedData);
      
      await supabase
        .from('profiles')
        .update({
          facial_verification_status: 'verified',
          facial_verification_score: matchScore,
          facial_verification_date: new Date().toISOString(),
        })
        .eq('user_id', data.user_id);
    } catch (err) {
      console.error('[NeoFace Callback] Error updating profile:', err);
    }
  };

  const startPolling = (docId: string, verifyId: string) => {
    setStatus('polling');
    setProgress('Vérification en cours...');
    let pollAttempts = 0;
    const maxAttempts = 100;

    // Timeout after 5 minutes
    timeoutRef.current = setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      setStatus('error');
      setError('Timeout: La vérification n\'a pas été complétée dans les délais.');
    }, 5 * 60 * 1000);

    pollingIntervalRef.current = setInterval(async () => {
      pollAttempts++;
      setAttempts(pollAttempts);

      try {
        const statusData = await checkVerificationStatus(docId, verifyId);

        if (statusData.status === 'verified') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);

          setStatus('success');
          setMatchingScore(statusData.matching_score || null);
          setProgress('Identité vérifiée avec succès !');

          // Update profile
          await updateProfileVerification(statusData.matching_score || null);

          // Clean up storage
          localStorage.removeItem(NEOFACE_STORAGE_KEY);

        } else if (statusData.status === 'failed') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);

          setStatus('error');
          setError(statusData.message || 'La vérification a échoué');
          localStorage.removeItem(NEOFACE_STORAGE_KEY);

        } else {
          setProgress(`En attente de la vérification (tentative ${pollAttempts}/${maxAttempts})...`);
        }

        if (pollAttempts >= maxAttempts) {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setStatus('error');
          setError('Nombre maximum de tentatives atteint. Veuillez réessayer.');
        }
      } catch (err) {
        console.error('[NeoFace Callback] Error checking status:', err);
      }
    }, 3000);
  };

  const handleContinue = () => {
    // Get return URL from storage or default to profile completion
    const storedData = localStorage.getItem(NEOFACE_STORAGE_KEY);
    let returnUrl = '/completer-profil';
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        returnUrl = data.returnUrl || '/completer-profil';
      } catch {
        // Use default
      }
    }
    
    navigate(returnUrl, { replace: true });
  };

  const handleRetry = () => {
    localStorage.removeItem(NEOFACE_STORAGE_KEY);
    navigate('/completer-profil', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-[#3C2A1E]/10 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#3C2A1E] to-[#5D4037] text-white text-center">
          <CardTitle className="text-xl text-white">
            Vérification NeoFace
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6 bg-white">
          {status === 'polling' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-[#F16522]/10 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#F16522] animate-spin" />
              </div>
              <div>
                <p className="text-lg font-medium text-[#3C2A1E]">{progress}</p>
                {attempts > 0 && (
                  <p className="text-sm text-[#5D4037] mt-2">
                    Tentative {attempts}
                  </p>
                )}
              </div>
              <p className="text-sm text-[#5D4037]">
                Veuillez patienter pendant que nous vérifions votre identité...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-green-800">Identité Vérifiée !</p>
                <p className="text-sm text-green-600 mt-2">
                  Votre identité a été vérifiée avec succès.
                </p>
                {matchingScore !== null && (
                  <p className="text-sm text-green-700 mt-2 font-medium">
                    Score de correspondance : {(matchingScore * 100).toFixed(1)}%
                  </p>
                )}
              </div>
              <Button
                onClick={handleContinue}
                className="w-full bg-[#F16522] hover:bg-[#D95318] text-white"
              >
                Continuer
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-red-800">Échec de la vérification</p>
                <p className="text-sm text-red-600 mt-2">
                  {error}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleRetry}
                  className="w-full bg-[#F16522] hover:bg-[#D95318] text-white"
                >
                  Réessayer
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full border-[#3C2A1E] text-[#3C2A1E]"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NeofaceCallbackPage;
