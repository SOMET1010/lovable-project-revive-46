import React, { useRef, useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Eye, ArrowLeft, ArrowRight, ArrowUp, RefreshCw, WifiOff, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useFaceDetection, type LivenessChallenge, type LivenessResult } from '@/shared/hooks/useFaceDetection';

const getChallengeLabel = (challenge: LivenessChallenge): string => {
  switch (challenge) {
    case 'blink':
      return 'Clignez des yeux';
    case 'turn_left':
      return 'Tournez la tête à gauche';
    case 'turn_right':
      return 'Tournez la tête à droite';
    case 'look_up':
      return 'Regardez vers le haut';
    default:
      return '';
  }
};

const getChallengeLabelShort = (challenge: LivenessChallenge): string => {
  switch (challenge) {
    case 'blink':
      return 'Cligner';
    case 'turn_left':
      return 'Gauche';
    case 'turn_right':
      return 'Droite';
    case 'look_up':
      return 'Haut';
    default:
      return '';
  }
};

interface LivenessDetectorProps {
  onComplete: (data: { 
    videoRef: React.RefObject<HTMLVideoElement | null>; 
    screenshot: string | null;
    livenessResult: LivenessResult | null;
  }) => void;
  onError?: (error: string) => void;
  className?: string;
}

const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

const ChallengeIcon: React.FC<{ challenge: LivenessChallenge; isActive: boolean; isComplete: boolean }> = ({
  challenge,
  isActive,
  isComplete,
}) => {
  const iconClass = cn(
    'w-6 h-6 transition-all duration-300',
    isComplete && 'text-green-500',
    isActive && !isComplete && 'text-[#F16522] animate-pulse',
    !isActive && !isComplete && 'text-[#5D4037]/50'
  );

  switch (challenge) {
    case 'blink':
      return <Eye className={iconClass} />;
    case 'turn_left':
      return <ArrowLeft className={iconClass} />;
    case 'turn_right':
      return <ArrowRight className={iconClass} />;
    case 'look_up':
      return <ArrowUp className={iconClass} />;
    default:
      return null;
  }
};

// SVG Circular Timer Component
const CircularTimer: React.FC<{ timeLeft: number; maxTime: number }> = ({ timeLeft, maxTime }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / maxTime) * circumference;
  
  const getColor = () => {
    if (timeLeft <= 3) return '#EF4444'; // red
    if (timeLeft <= 5) return '#F59E0B'; // amber
    return '#22C55E'; // green
  };

  return (
    <div className="relative w-16 h-16">
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        {/* Background circle */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="4"
        />
        {/* Progress circle */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      {/* Center number */}
      <div 
        className="absolute inset-0 flex items-center justify-center text-2xl font-bold"
        style={{ color: getColor() }}
      >
        {timeLeft}
      </div>
    </div>
  );
};

// Confetti particle component
const ConfettiParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => (
  <div
    className="absolute w-2 h-2 rounded-full animate-confetti-fall"
    style={{
      backgroundColor: color,
      left: `${Math.random() * 100}%`,
      animationDelay: `${delay}ms`,
      animationDuration: `${2000 + Math.random() * 1000}ms`,
    }}
  />
);

export const LivenessDetector: React.FC<LivenessDetectorProps> = ({
  onComplete,
  onError,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const hasCompletedRef = useRef(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const loadingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    modelsLoaded,
    modelsLoading,
    modelsError,
    faceDetected,
    faceDistance,
    currentChallenge,
    completedChallenges,
    isLivenessComplete,
    progress,
    resetChallenges,
    retryLoadModels,
    challenges,
    screenshot,
    timeLeft,
    isFailed,
    livenessResult,
    isFlashing,
    flashColor,
  } = useFaceDetection({
    videoRef,
    enabled: cameraReady && !hasCompletedRef.current,
  });

  // Dynamic oval styling based on face distance
  const getOvalStyle = (): string => {
    if (!faceDetected) return 'border-white/50';
    switch (faceDistance) {
      case 'too_far':
        return 'border-amber-400';
      case 'too_close':
        return 'border-red-400';
      case 'optimal':
        return 'border-green-400';
      default:
        return 'border-white/50';
    }
  };

  // Distance guidance message
  const getDistanceMessage = (): string | null => {
    if (!faceDetected) return null;
    switch (faceDistance) {
      case 'too_far':
        return 'Rapprochez-vous de la caméra';
      case 'too_close':
        return 'Éloignez-vous de la caméra';
      default:
        return null;
    }
  };

  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
          setCameraError(null);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur caméra inconnue';
        setCameraError(errorMessage);
        onError?.(errorMessage);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onError]);

  // Track loading time for user feedback
  useEffect(() => {
    if (modelsLoading && !modelsLoaded) {
      setLoadingTime(0);
      loadingTimerRef.current = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      setLoadingTime(0);
    }
    
    return () => {
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
      }
    };
  }, [modelsLoading, modelsLoaded]);

  // Check video stream health
  useEffect(() => {
    if (!cameraReady || !streamRef.current) return;
    
    const checkStream = () => {
      const tracks = streamRef.current?.getVideoTracks();
      if (!tracks || tracks.length === 0 || !tracks[0]?.enabled) {
        setCameraError('Le flux vidéo a été interrompu');
      }
    };
    
    const interval = setInterval(checkStream, 2000);
    return () => clearInterval(interval);
  }, [cameraReady]);

  // Trigger confetti on success
  useEffect(() => {
    if (isLivenessComplete && livenessResult?.isLive) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLivenessComplete, livenessResult]);

  // Notify parent when liveness is complete with screenshot and score
  useEffect(() => {
    if (isLivenessComplete && livenessResult && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete({ videoRef, screenshot, livenessResult });
    }
  }, [isLivenessComplete, livenessResult, onComplete, screenshot]);

  const handleRetry = () => {
    hasCompletedRef.current = false;
    setShowConfetti(false);
    resetChallenges();
  };

  const handleRetryModels = () => {
    retryLoadModels();
  };

  const CHALLENGE_TIMEOUT = 10;

  if (cameraError) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 bg-red-50 rounded-2xl', className)}>
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-800 font-medium text-center mb-4">
          Impossible d'accéder à la caméra
        </p>
        <p className="text-sm text-red-600 text-center">
          {cameraError}
        </p>
      </div>
    );
  }

  if (modelsError) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 bg-amber-50 rounded-2xl border border-amber-200', className)}>
        <WifiOff className="w-12 h-12 text-amber-600 mb-4" />
        <p className="text-[#2C1810] font-semibold text-center mb-2 text-lg">
          Connexion lente détectée
        </p>
        <p className="text-sm text-[#5D4037] text-center mb-6 max-w-xs">
          Le chargement des modèles de détection faciale a pris trop de temps. 
          Vérifiez votre connexion internet et réessayez.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button
            onClick={handleRetryModels}
            className="w-full bg-[#F16522] hover:bg-[#D55A1B] text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer le chargement
          </Button>
          <Button
            variant="outline"
            onClick={() => onError?.('skip_liveness')}
            className="w-full border-[#2C1810]/30 text-[#2C1810] hover:bg-[#FAF7F4]"
          >
            Continuer sans vérification de vivacité
          </Button>
        </div>
        <p className="text-xs text-[#5D4037]/70 text-center mt-4">
          La vérification de vivacité renforce la sécurité mais n'est pas obligatoire.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Video container */}
      <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden bg-black/90 mb-6">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Flash overlay for anti-reflet test */}
        {isFlashing && flashColor && (
          <div 
            className="absolute inset-0 z-40 transition-opacity duration-100"
            style={{ backgroundColor: flashColor, opacity: 0.9 }}
          />
        )}

        {/* Loading overlay with enhanced feedback */}
        {(modelsLoading || !cameraReady) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2C1810]/80 z-10">
            <Loader2 className="w-12 h-12 text-[#F16522] animate-spin mb-4" />
            <p className="text-white text-sm text-center px-4">
              {modelsLoading ? 'Chargement de la détection faciale...' : 'Démarrage de la caméra...'}
            </p>
            
            {/* Progressive feedback based on loading time */}
            {modelsLoading && loadingTime < 10 && (
              <p className="text-white/60 text-xs mt-2">
                Cela peut prendre quelques secondes
              </p>
            )}
            {modelsLoading && loadingTime >= 10 && loadingTime < 20 && (
              <p className="text-amber-300 text-xs mt-2 animate-pulse">
                Chargement long, patientez... ({loadingTime}s)
              </p>
            )}
            {modelsLoading && loadingTime >= 20 && (
              <p className="text-amber-400 text-xs mt-2 animate-pulse">
                Connexion lente détectée ({loadingTime}s)
              </p>
            )}
            
            {/* Skip button after 8 seconds */}
            {modelsLoading && loadingTime >= 8 && (
              <Button
                variant="outline"
                size="small"
                onClick={() => onError?.('skip_liveness')}
                className="mt-4 border-white/30 text-white hover:bg-white/10"
              >
                Continuer sans vérification
              </Button>
            )}
          </div>
        )}

        {/* Face guide overlay */}
        {cameraReady && modelsLoaded && !isLivenessComplete && !isFailed && (
          <>
            {/* Circular Timer */}
            {currentChallenge && faceDetected && faceDistance === 'optimal' && (
              <div className="absolute top-4 left-0 right-0 flex justify-center z-20">
                <CircularTimer timeLeft={timeLeft} maxTime={CHALLENGE_TIMEOUT} />
              </div>
            )}

            {/* Premium oval guide with corner markers */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Outer pulsing circle */}
              <div className={cn(
                'absolute w-52 h-[272px] rounded-[50%] border-2 border-dashed transition-all duration-500',
                faceDetected ? 'border-green-400/30 animate-pulse' : 'border-white/20'
              )} />
              
              {/* Main oval with dynamic color */}
              <div
                className={cn(
                  'relative w-48 h-64 rounded-[50%] border-4 transition-all duration-300',
                  'shadow-[0_0_30px_rgba(255,255,255,0.2)]',
                  getOvalStyle()
                )}
              >
                {/* Corner markers */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 rounded-tl-xl border-current opacity-70" />
                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 rounded-tr-xl border-current opacity-70" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 rounded-bl-xl border-current opacity-70" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 rounded-br-xl border-current opacity-70" />
              </div>
            </div>

            {/* Current challenge instruction */}
            {currentChallenge && faceDetected && faceDistance === 'optimal' && (
              <div className="absolute bottom-6 left-4 right-4 bg-black/70 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F16522]/20 flex items-center justify-center">
                    <ChallengeIcon
                      challenge={currentChallenge}
                      isActive={true}
                      isComplete={false}
                    />
                  </div>
                  <span className="text-white font-medium text-lg">
                    {getChallengeLabel(currentChallenge)}
                  </span>
                </div>
              </div>
            )}

            {/* Distance guidance message */}
            {faceDetected && getDistanceMessage() && (
              <div className="absolute bottom-6 left-4 right-4 bg-amber-500/90 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-white text-center font-medium">
                  {getDistanceMessage()}
                </p>
              </div>
            )}

            {/* Face not detected warning */}
            {!faceDetected && (
              <div className="absolute bottom-6 left-4 right-4 bg-[#2C1810]/80 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <p className="text-white text-center font-medium">
                  Placez votre visage dans le cadre
                </p>
              </div>
            )}
          </>
        )}

        {/* Failed overlay - time's up */}
        {isFailed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2C1810]/90 z-20">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4 animate-pulse">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <p className="text-white text-xl font-bold mb-2">
              Temps écoulé !
            </p>
            <p className="text-white/70 text-sm text-center mb-6 px-8">
              Vous n'avez pas complété le défi à temps.
              Veuillez réessayer dans de meilleures conditions.
            </p>
            <Button
              onClick={handleRetry}
              className="bg-[#F16522] hover:bg-[#D55A1B] text-white px-8"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        )}

        {/* Premium Success overlay with score */}
        {isLivenessComplete && livenessResult && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-green-500/30 to-green-600/40 z-10 backdrop-blur-sm">
            {/* Confetti */}
            {showConfetti && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {['#F16522', '#22C55E', '#3B82F6', '#EAB308', '#EC4899'].map((color, i) => (
                  Array.from({ length: 10 }).map((_, j) => (
                    <ConfettiParticle key={`${i}-${j}`} delay={j * 100 + i * 50} color={color} />
                  ))
                ))}
              </div>
            )}

            {/* Concentric animated circles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-40 h-40 rounded-full border-4 border-green-400/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute w-32 h-32 rounded-full border-4 border-green-400/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
            </div>
            
            {/* Animated checkmark */}
            <div className="relative z-10 w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(34,197,94,0.5)]" style={{ animation: 'scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            
            {/* Score display with animation */}
            <div 
              className={cn(
                'text-6xl font-bold mb-2',
                livenessResult.score >= 80 ? 'text-green-400' :
                livenessResult.score >= 60 ? 'text-amber-400' : 'text-red-400'
              )}
              style={{ animation: 'scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s both' }}
            >
              {livenessResult.score}
              <span className="text-3xl text-white/70">/100</span>
            </div>
            
            {/* Verification badge */}
            <div 
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm mb-3"
              style={{ animation: 'fade-in 0.3s ease-out 0.4s both' }}
            >
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white font-medium">
                {livenessResult.isLive ? 'Identité vérifiée' : 'Vérification incomplète'}
              </span>
            </div>

            {/* Flash test badge */}
            {livenessResult.flashTest?.passed && (
              <div 
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/30 rounded-full text-sm text-blue-200 backdrop-blur-sm"
                style={{ animation: 'fade-in 0.3s ease-out 0.6s both' }}
              >
                <Sparkles className="w-4 h-4" />
                Test anti-reflet réussi
              </div>
            )}

            {/* Security shield badge */}
            <div 
              className="mt-4 flex items-center gap-2 text-white/60 text-xs"
              style={{ animation: 'fade-in 0.3s ease-out 0.8s both' }}
            >
              <Shield className="w-4 h-4" />
              Vérification sécurisée niveau bancaire
            </div>
          </div>
        )}
      </div>

      {/* Progress indicators */}
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="h-2 bg-[#EFEBE9] rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-[#F16522] to-[#FF8A50] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Challenge steps */}
        <div className="flex justify-between items-center mb-6">
          {challenges.map((challenge: LivenessChallenge, index: number) => {
            const isComplete = completedChallenges.includes(challenge);
            const isActive = currentChallenge === challenge;

            return (
              <div
                key={`${challenge}-${index}`}
                className={cn(
                  'flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl transition-all duration-300 flex-1',
                  isComplete && 'bg-green-100',
                  isActive && !isComplete && 'bg-[#F16522]/10'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300',
                    isComplete && 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]',
                    isActive && !isComplete && 'bg-[#F16522] shadow-[0_0_15px_rgba(241,101,34,0.4)]',
                    !isActive && !isComplete && 'bg-[#EFEBE9]'
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  ) : (
                    <ChallengeIcon
                      challenge={challenge}
                      isActive={isActive}
                      isComplete={isComplete}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium text-center',
                    isComplete && 'text-green-600',
                    isActive && !isComplete && 'text-[#F16522]',
                    !isActive && !isComplete && 'text-[#5D4037]/50'
                  )}
                >
                  {index + 1}. {getChallengeLabelShort(challenge)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Retry button */}
        {!isLivenessComplete && completedChallenges.length > 0 && (
          <Button
            variant="outline"
            onClick={handleRetry}
            className="w-full border-[#2C1810]/30 text-[#2C1810] hover:bg-[#FAF7F4]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recommencer
          </Button>
        )}
      </div>
    </div>
  );
};

export default LivenessDetector;
