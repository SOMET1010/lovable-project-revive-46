import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';

// Inline types and utils to avoid import issues
interface Point {
  x: number;
  y: number;
}

export type LivenessChallenge = 'blink' | 'turn_left' | 'turn_right' | 'look_up';
export type FaceDistance = 'too_far' | 'too_close' | 'optimal' | 'unknown';

const LIVENESS_CHALLENGES: LivenessChallenge[] = ['blink', 'turn_left', 'turn_right', 'look_up'];

// ============= Liveness Score Configuration =============
const LIVENESS_SCORE_CONFIG = {
  MIN_EAR_VARIANCE: 0.005,    // Variance minimale attendue (photo = 0)
  MIN_YAW_VARIANCE: 2.0,      // Variance minimale de rotation
  MAX_DETECTION_GAPS: 3,      // Gaps de détection max acceptés
  SAMPLE_SIZE: 20,            // Nombre de frames à analyser
  MIN_JERK_VALUE: 0.5,        // Jerk minimal pour mouvement naturel
};

// ============= Flash Anti-Reflet Configuration =============
const FLASH_CONFIG = {
  FLASH_DURATION: 200,           // Durée du flash en ms
  CAPTURE_DELAY: 100,            // Délai avant capture post-flash
  MIN_BRIGHTNESS_DELTA: 0.06,    // Delta luminosité minimum attendu (6%)
  MAX_BRIGHTNESS_DELTA: 0.60,    // Delta max (évite saturation)
  FLASH_COLORS: ['#FFFFFF', '#00FF00', '#FF0000'] as const, // Couleurs aléatoires
};

// Interface des métriques de vivacité collectées pendant le test
interface LivenessMetrics {
  earSamples: number[];           // Historique EAR pour variabilité
  yawSamples: number[];           // Historique Yaw pour fluidité
  pitchSamples: number[];         // Historique Pitch
  positionSamples: Point[];       // Positions du nez (stabilité)
  detectionGaps: number;          // Compteur de disparitions de visage
  challengeStartTime: number;     // Début du test (pour durée)
}

// Interface résultat du test anti-reflet
export interface FlashResult {
  color: string;                  // Couleur utilisée
  brightnessBefore: number;       // Luminosité moyenne avant
  brightnessAfter: number;        // Luminosité moyenne après
  delta: number;                  // Différence
  passed: boolean;                // Test réussi ?
}

// Interface du score final de vivacité
export interface LivenessResult {
  score: number;                   // 0-100
  isLive: boolean;                 // true si score >= 60
  penalties: {
    staticEyes: number;            // Pénalité yeux statiques
    linearMovement: number;        // Pénalité mouvement linéaire
    detectionInstability: number;  // Pénalité instabilité
    slowCompletion: number;        // Pénalité temps long
    flashTestFailed: number;       // Pénalité test anti-reflet échoué
  };
  metadata: {
    duration: number;              // Durée totale en secondes
    earVariance: number;           // Variance EAR mesurée
    yawVariance: number;           // Variance Yaw mesurée
    movementJerk: number;          // Jerk du mouvement
    samplesCollected: number;      // Nombre d'échantillons
  };
  flashTest?: FlashResult;        // Résultat du test anti-reflet
}

// Shuffle array (Fisher-Yates)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
};

const euclideanDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const calculateEAR = (eyePoints: Point[]): number => {
  if (eyePoints.length < 6) return 0.3;
  const p1 = eyePoints[0]!;
  const p2 = eyePoints[1]!;
  const p3 = eyePoints[2]!;
  const p4 = eyePoints[3]!;
  const p5 = eyePoints[4]!;
  const p6 = eyePoints[5]!;
  const v1 = euclideanDistance(p2, p6);
  const v2 = euclideanDistance(p3, p5);
  const h = euclideanDistance(p1, p4);
  if (h === 0) return 0.3;
  return (v1 + v2) / (2.0 * h);
};

const getCenterPoint = (points: Point[]): Point => {
  if (points.length === 0) return { x: 0, y: 0 };
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
};

const calculateHeadYaw = (noseTip: Point, leftEyeCenter: Point, rightEyeCenter: Point): number => {
  const eyeCenter = {
    x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
    y: (leftEyeCenter.y + rightEyeCenter.y) / 2,
  };
  const eyeDistance = euclideanDistance(leftEyeCenter, rightEyeCenter);
  if (eyeDistance === 0) return 0;
  const noseOffset = noseTip.x - eyeCenter.x;
  return (noseOffset / eyeDistance) * 45;
};

// Calculate head pitch (vertical tilt)
const calculateHeadPitch = (noseTip: Point, leftEyeCenter: Point, rightEyeCenter: Point): number => {
  const eyeCenter = {
    x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
    y: (leftEyeCenter.y + rightEyeCenter.y) / 2,
  };
  const eyeDistance = euclideanDistance(leftEyeCenter, rightEyeCenter);
  if (eyeDistance === 0) return 0;
  const noseOffset = noseTip.y - eyeCenter.y;
  return (noseOffset / eyeDistance) * 45;
};

// Increased threshold to 18° for more stability
const detectHeadTurn = (yaw: number, threshold: number = 18): 'left' | 'right' | 'center' => {
  if (yaw > threshold) return 'right';
  if (yaw < -threshold) return 'left';
  return 'center';
};

// Calculate face distance based on eye distance relative to video width
const calculateFaceDistance = (eyeDist: number, videoWidth: number): FaceDistance => {
  if (videoWidth === 0) return 'unknown';
  const ratio = eyeDist / videoWidth;
  if (ratio < FACE_MIN_DISTANCE_RATIO) return 'too_far';
  if (ratio > FACE_MAX_DISTANCE_RATIO) return 'too_close';
  return 'optimal';
};

// ============= Statistical Functions for Liveness Score =============

// Calculate variance (écart-type simplifié)
const calculateVariance = (samples: number[]): number => {
  if (samples.length < 2) return 0;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const squaredDiffs = samples.map(x => Math.pow(x - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / samples.length);
};

// Calculate movement "jerk" (detects robotic/linear movements)
// Natural movements have micro-variations, deepfakes are often too "smooth"
const calculateMovementJerk = (samples: number[]): number => {
  if (samples.length < 3) return 0;
  
  let jerkSum = 0;
  for (let i = 2; i < samples.length; i++) {
    const accel1 = (samples[i]! - samples[i - 1]!);
    const accel2 = (samples[i - 1]! - samples[i - 2]!);
    jerkSum += Math.abs(accel1 - accel2);
  }
  return jerkSum / (samples.length - 2);
};

interface UseFaceDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled?: boolean;
  detectionInterval?: number;
}

interface FaceDetectionState {
  modelsLoaded: boolean;
  modelsLoading: boolean;
  modelsError: string | null;
  faceDetected: boolean;
  leftEAR: number;
  rightEAR: number;
  headYaw: number;
  headPitch: number;
  isBlinking: boolean;
  headDirection: 'left' | 'right' | 'center';
  faceDistance: FaceDistance;
  eyeDistanceRatio: number;
}

interface UseFaceDetectionReturn extends FaceDetectionState {
  currentChallenge: LivenessChallenge | null;
  completedChallenges: LivenessChallenge[];
  isLivenessComplete: boolean;
  progress: number;
  resetChallenges: () => void;
  retryLoadModels: () => void;
  challenges: LivenessChallenge[];
  screenshot: string | null;
  takeScreenshot: () => string | null;
  timeLeft: number;
  isFailed: boolean;
  livenessResult: LivenessResult | null;
  // Flash anti-reflet
  isFlashing: boolean;
  flashColor: string | null;
  runFlashTest: () => Promise<FlashResult | null>;
  // CDN loading progress
  currentCdnAttempt: number;
  totalCdnSources: number;
}

// Calculate brightness of a region (ITU-R BT.601 formula)
const calculateRegionBrightness = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number
): number => {
  try {
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;
    
    let totalBrightness = 0;
    const pixelCount = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      // ITU-R BT.601 perceived brightness
      totalBrightness += (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
    
    return totalBrightness / pixelCount;
  } catch {
    return 0;
  }
}

// Model URLs - local first for instant loading, CDNs as fallback
const MODEL_SOURCES = [
  { name: 'local', url: '/models/face-api' },
  { name: 'jsdelivr', url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model' },
  { name: 'unpkg', url: 'https://unpkg.com/@vladmandic/face-api/model' },
  { name: 'vladmandic', url: 'https://vladmandic.github.io/face-api/model' },
] as const;

// Global timeout for parallel race (30s - reduced since local is priority)
const GLOBAL_RACE_TIMEOUT = 30000;

// Challenge timer (seconds per challenge)
const CHALLENGE_TIMEOUT = 10;

// Blink validation thresholds
const BLINK_EAR_THRESHOLD = 0.20;
const BLINK_MIN_DURATION = 50; // ms
const BLINK_MAX_DURATION = 500; // ms

// Head movement thresholds
const HEAD_TURN_THRESHOLD = 18; // degrees (increased from 12)
const HEAD_TURN_HOLD_TIME = 400; // ms
const LOOK_UP_THRESHOLD = -8; // negative pitch = looking up
const LOOK_UP_HOLD_TIME = 400; // ms

// Face distance thresholds (based on eye distance relative to video width)
const FACE_MIN_DISTANCE_RATIO = 0.15; // Too far if < 15%
const FACE_MAX_DISTANCE_RATIO = 0.40; // Too close if > 40%

// Load models from a specific URL (no internal timeout - controlled by race)
const loadModelsFromUrl = async (url: string): Promise<void> => {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(url),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(url),
  ]);
};

// Progress callback type for UI feedback  
type LoadProgressCallback = (
  activeCdns: string[], 
  winnerId: number | null,
  downloadProgress?: { loaded: number; total: number; source: string }
) => void;

// Race all sources in parallel using Promise.any - first to SUCCEED wins
const loadModelsWithFallback = async (
  onProgress?: LoadProgressCallback
): Promise<{ source: string }> => {
  const activeCdns = MODEL_SOURCES.map(s => s.name);
  onProgress?.(activeCdns, null);
  
  if (import.meta.env.DEV) {
    console.log(`[FaceAPI] Racing ${MODEL_SOURCES.length} sources (local first)...`);
  }
  
  // AbortController for proper timeout management
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GLOBAL_RACE_TIMEOUT);
  
  try {
    // Polyfill for Promise.any (ES2021) - first to SUCCEED wins
    const promiseAny = <T>(promises: Promise<T>[]): Promise<T> => {
      return new Promise((resolve, reject) => {
        let rejectionCount = 0;
        const errors: Error[] = [];
        
        promises.forEach((promise, index) => {
          Promise.resolve(promise)
            .then(resolve)
            .catch((error) => {
              errors[index] = error;
              rejectionCount++;
              if (rejectionCount === promises.length) {
                reject(new Error('All promises rejected'));
              }
            });
        });
      });
    };

    const result = await promiseAny(
      MODEL_SOURCES.map(async (source, index): Promise<{ source: string; index: number }> => {
        if (controller.signal.aborted) {
          throw new Error('Aborted');
        }
        
        if (import.meta.env.DEV) {
          console.log(`[FaceAPI] Trying ${source.name}...`);
        }
        
        onProgress?.(activeCdns, null, { loaded: 0, total: 100, source: source.name });
        
        await loadModelsFromUrl(source.url);
        
        if (import.meta.env.DEV) {
          console.log(`[FaceAPI] ✓ ${source.name} succeeded!`);
        }
        
        controller.abort();
        clearTimeout(timeoutId);
        
        onProgress?.([], index, { loaded: 100, total: 100, source: source.name });
        return { source: source.name, index };
      })
    );
    
    return { source: result.source };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (import.meta.env.DEV) {
      console.error('[FaceAPI] All sources failed:', error instanceof Error ? error.message : 'Unknown');
    }
    
    throw new Error('models_unavailable');
  }
};

// Initial metrics state
const getInitialMetrics = (): LivenessMetrics => ({
  earSamples: [],
  yawSamples: [],
  pitchSamples: [],
  positionSamples: [],
  detectionGaps: 0,
  challengeStartTime: 0,
});

export const useFaceDetection = ({
  videoRef,
  enabled = true,
  detectionInterval = 100,
}: UseFaceDetectionOptions): UseFaceDetectionReturn => {
  const [state, setState] = useState<FaceDetectionState>({
    modelsLoaded: false,
    modelsLoading: false,
    modelsError: null,
    faceDetected: false,
    leftEAR: 0.3,
    rightEAR: 0.3,
    headYaw: 0,
    headPitch: 0,
    isBlinking: false,
    headDirection: 'center',
    faceDistance: 'unknown',
    eyeDistanceRatio: 0,
  });

  const [screenshot, setScreenshot] = useState<string | null>(null);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_TIMEOUT);
  const [isFailed, setIsFailed] = useState(false);

  // Liveness score result
  const [livenessResult, setLivenessResult] = useState<LivenessResult | null>(null);

  // Flash anti-reflet state
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [_flashResult, setFlashResult] = useState<FlashResult | null>(null);

  // Randomized challenges for each session (anti-replay)
  const [challenges, setChallenges] = useState<LivenessChallenge[]>(() => 
    shuffleArray(LIVENESS_CHALLENGES)
  );
  const [completedChallenges, setCompletedChallenges] = useState<LivenessChallenge[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const animationRef = useRef<number | null>(null);
  const lastDetectionRef = useRef<number>(0);
  const screenshotTakenRef = useRef(false);
  
  // Liveness metrics collection ref
  const livenessMetricsRef = useRef<LivenessMetrics>(getInitialMetrics());
  
  // Strict blink tracking: must close THEN open
  const blinkStateRef = useRef<{
    startedAt: number | null;
    eyesWereClosed: boolean;
  }>({ startedAt: null, eyesWereClosed: false });
  
  const headTurnStartRef = useRef<{ direction: 'left' | 'right'; time: number } | null>(null);
  const lookUpStartRef = useRef<number | null>(null);
  
  // Active flag for cleanup
  const isActiveRef = useRef(true);

  // Screenshot capture function
  const takeScreenshot = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return null;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw without mirror effect for backend processing
        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.85);
      }
    } catch (_error) {
      // Silently handle canvas errors
    }
    return null;
  }, [videoRef]);

  // Flash anti-reflet test
  const runFlashTest = useCallback(async (): Promise<FlashResult | null> => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return null;

    try {
      // 1. Capture frame BEFORE flash
      const canvasBefore = document.createElement('canvas');
      canvasBefore.width = video.videoWidth;
      canvasBefore.height = video.videoHeight;
      const ctxBefore = canvasBefore.getContext('2d');
      if (!ctxBefore) return null;
      ctxBefore.drawImage(video, 0, 0);
      
      // Face region (center of image, 40% width)
      const faceX = Math.floor(video.videoWidth * 0.3);
      const faceY = Math.floor(video.videoHeight * 0.2);
      const faceW = Math.floor(video.videoWidth * 0.4);
      const faceH = Math.floor(video.videoHeight * 0.5);
      
      const brightnessBefore = calculateRegionBrightness(ctxBefore, faceX, faceY, faceW, faceH);

      // 2. Choose random color and flash
      const color = FLASH_CONFIG.FLASH_COLORS[
        Math.floor(Math.random() * FLASH_CONFIG.FLASH_COLORS.length)
      ]!;
      setFlashColor(color);
      setIsFlashing(true);

      // 3. Wait for flash duration + reflection delay
      await new Promise(r => setTimeout(r, FLASH_CONFIG.FLASH_DURATION + FLASH_CONFIG.CAPTURE_DELAY));

      // 4. Capture frame AFTER flash
      const canvasAfter = document.createElement('canvas');
      canvasAfter.width = video.videoWidth;
      canvasAfter.height = video.videoHeight;
      const ctxAfter = canvasAfter.getContext('2d');
      if (!ctxAfter) {
        setIsFlashing(false);
        setFlashColor(null);
        return null;
      }
      ctxAfter.drawImage(video, 0, 0);
      
      const brightnessAfter = calculateRegionBrightness(ctxAfter, faceX, faceY, faceW, faceH);

      // 5. End flash
      setIsFlashing(false);
      setFlashColor(null);

      // 6. Calculate delta
      const delta = brightnessAfter - brightnessBefore;
      const passed = delta >= FLASH_CONFIG.MIN_BRIGHTNESS_DELTA && 
                     delta <= FLASH_CONFIG.MAX_BRIGHTNESS_DELTA;

      const result: FlashResult = { color, brightnessBefore, brightnessAfter, delta, passed };
      setFlashResult(result);
      
      if (import.meta.env.DEV) {
        console.log('[Flash Test]', result);
      }
      
      return result;
    } catch (error) {
      setIsFlashing(false);
      setFlashColor(null);
      if (import.meta.env.DEV) {
        console.error('[Flash Test Error]', error);
      }
      return null;
    }
  }, [videoRef]);

  // Calculate liveness score based on collected metrics
  const calculateLivenessScore = useCallback((flashTestResult?: FlashResult | null): LivenessResult => {
    const metrics = livenessMetricsRef.current;
    const now = performance.now();
    
    // Calculate statistics
    const earVariance = calculateVariance(metrics.earSamples);
    const yawVariance = calculateVariance(metrics.yawSamples);
    const movementJerk = calculateMovementJerk(metrics.yawSamples);
    const duration = metrics.challengeStartTime > 0 
      ? (now - metrics.challengeStartTime) / 1000 
      : 0;
    
    // Initialize penalties
    const penalties = {
      staticEyes: 0,
      linearMovement: 0,
      detectionInstability: 0,
      slowCompletion: 0,
      flashTestFailed: 0,
    };
    
    let score = 100;
    
    // 1. Penalty for static eyes (detects photos)
    if (earVariance < LIVENESS_SCORE_CONFIG.MIN_EAR_VARIANCE) {
      penalties.staticEyes = 50;
      score -= 50;
    } else if (earVariance < LIVENESS_SCORE_CONFIG.MIN_EAR_VARIANCE * 2) {
      penalties.staticEyes = 25;
      score -= 25;
    }
    
    // 2. Penalty for linear/robotic movement (detects deepfakes/videos)
    if (yawVariance < LIVENESS_SCORE_CONFIG.MIN_YAW_VARIANCE) {
      penalties.linearMovement = 20;
      score -= 20;
    }
    
    // 3. Penalty for detection instability (video injection)
    if (metrics.detectionGaps > LIVENESS_SCORE_CONFIG.MAX_DETECTION_GAPS) {
      const excessGaps = metrics.detectionGaps - LIVENESS_SCORE_CONFIG.MAX_DETECTION_GAPS;
      penalties.detectionInstability = Math.min(30, excessGaps * 5);
      score -= penalties.detectionInstability;
    }
    
    // 4. Penalty if user took too long (difficult conditions)
    if (timeLeft < 2) {
      penalties.slowCompletion = 10;
      score -= 10;
    }
    
    // 5. Penalty if flash test failed (detects screens/photos)
    if (flashTestResult && !flashTestResult.passed) {
      penalties.flashTestFailed = 25;
      score -= 25;
    }
    
    const finalScore = Math.max(0, Math.min(100, score));
    
    return {
      score: finalScore,
      isLive: finalScore >= 60,
      penalties,
      metadata: {
        duration,
        earVariance,
        yawVariance,
        movementJerk,
        samplesCollected: metrics.earSamples.length,
      },
      flashTest: flashTestResult || undefined,
    };
  }, [timeLeft]);

  // Retry loading models
  const retryLoadModels = useCallback(() => {
    setState(prev => ({
      ...prev,
      modelsLoaded: false,
      modelsLoading: false,
      modelsError: null,
    }));
    setLoadAttempt(prev => prev + 1);
  }, []);

  // Ref to prevent double loading (avoids dependency on modelsLoading state)
  const modelsLoadingRef = useRef(false);

  // Load face-api models with fallback
  useEffect(() => {
    const loadModels = async () => {
      // Use ref to prevent race conditions
      if (state.modelsLoaded || modelsLoadingRef.current) return;
      
      modelsLoadingRef.current = true;
      setState(prev => ({ ...prev, modelsLoading: true, modelsError: null }));

      try {
        const result = await loadModelsWithFallback((_activeCdns, _winnerId) => {
          // All CDNs racing in parallel, no sequential tracking needed
        });
        
        if (import.meta.env.DEV) {
          console.log(`[FaceAPI] Models loaded from ${result.source}`);
        }

        setState(prev => ({
          ...prev,
          modelsLoaded: true,
          modelsLoading: false,
          modelsError: null,
        }));
      } catch (_error) {
        if (import.meta.env.DEV) {
          console.error('[FaceAPI] Failed to load models');
        }
        setState(prev => ({
          ...prev,
          modelsLoading: false,
          modelsError: 'slow_connection',
        }));
      } finally {
        modelsLoadingRef.current = false;
      }
    };

    loadModels();
  }, [state.modelsLoaded, loadAttempt]); // Removed state.modelsLoading from deps

  const currentChallenge = currentChallengeIndex < challenges.length
    ? challenges[currentChallengeIndex]
    : null;

  const isLivenessComplete = completedChallenges.length === challenges.length;
  const progress = (completedChallenges.length / challenges.length) * 100;

  const completeChallenge = useCallback((challenge: LivenessChallenge) => {
    if (!completedChallenges.includes(challenge)) {
      setCompletedChallenges(prev => [...prev, challenge]);
      setCurrentChallengeIndex(prev => prev + 1);
      setTimeLeft(CHALLENGE_TIMEOUT); // Reset timer for next challenge
    }
  }, [completedChallenges]);

  const resetChallenges = useCallback(() => {
    setCompletedChallenges([]);
    setCurrentChallengeIndex(0);
    setTimeLeft(CHALLENGE_TIMEOUT);
    setIsFailed(false);
    setLivenessResult(null);
    setFlashResult(null);
    setIsFlashing(false);
    setFlashColor(null);
    // Reset liveness metrics
    livenessMetricsRef.current = getInitialMetrics();
    // Re-randomize challenges on reset
    setChallenges(shuffleArray(LIVENESS_CHALLENGES));
    blinkStateRef.current = { startedAt: null, eyesWereClosed: false };
    headTurnStartRef.current = null;
    lookUpStartRef.current = null;
    screenshotTakenRef.current = false;
  }, []);

  // Challenge timer countdown
  useEffect(() => {
    // Don't run timer if: disabled, models not loaded, complete, failed, or no current challenge
    if (!enabled || !state.modelsLoaded || isLivenessComplete || isFailed || !currentChallenge) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFailed(true); // Challenge failed - time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentChallengeIndex, enabled, state.modelsLoaded, isLivenessComplete, isFailed, currentChallenge]);

  // Run flash test and calculate score when all challenges complete
  useEffect(() => {
    if (isLivenessComplete && !livenessResult) {
      // Run flash test then calculate score
      const calculateWithFlash = async () => {
        const flashTestResult = await runFlashTest();
        const result = calculateLivenessScore(flashTestResult);
        setLivenessResult(result);
        
        if (import.meta.env.DEV) {
          console.log('[Liveness] Score calculated:', result);
        }
      };
      calculateWithFlash();
    }
  }, [isLivenessComplete, livenessResult, calculateLivenessScore, runFlashTest]);

  // Face detection loop
  useEffect(() => {
    if (!enabled || !state.modelsLoaded || !videoRef.current || isLivenessComplete || isFailed) {
      return;
    }

    isActiveRef.current = true;
    const video = videoRef.current;

    const detectFace = async () => {
      if (!isActiveRef.current) return;
      
      const now = performance.now();
      if (now - lastDetectionRef.current < detectionInterval) {
        animationRef.current = requestAnimationFrame(detectFace);
        return;
      }
      lastDetectionRef.current = now;

      if (video.paused || video.ended || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(detectFace);
        return;
      }

      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5,
          }))
          .withFaceLandmarks(true);

        if (detection) {
          const landmarks = detection.landmarks;
          const positions = landmarks.positions;

          // Get eye landmarks (face_landmark_68 indices)
          const leftEyePoints: Point[] = positions.slice(36, 42).map(p => ({ x: p.x, y: p.y }));
          const rightEyePoints: Point[] = positions.slice(42, 48).map(p => ({ x: p.x, y: p.y }));

          // Nose tip: index 30
          const nosePoint = positions[30];
          const noseTip: Point = nosePoint ? { x: nosePoint.x, y: nosePoint.y } : { x: 0, y: 0 };

          // Calculate metrics
          const leftEAR = calculateEAR(leftEyePoints);
          const rightEAR = calculateEAR(rightEyePoints);
          const avgEAR = (leftEAR + rightEAR) / 2;
          const isBlinking = avgEAR < BLINK_EAR_THRESHOLD;

          const leftEyeCenter = getCenterPoint(leftEyePoints);
          const rightEyeCenter = getCenterPoint(rightEyePoints);
          const eyeDist = euclideanDistance(leftEyeCenter, rightEyeCenter);
          const videoWidth = video.videoWidth || 640;
          const faceDistance = calculateFaceDistance(eyeDist, videoWidth);
          const eyeDistanceRatio = videoWidth > 0 ? eyeDist / videoWidth : 0;
          
          const headYaw = calculateHeadYaw(noseTip, leftEyeCenter, rightEyeCenter);
          const headPitch = calculateHeadPitch(noseTip, leftEyeCenter, rightEyeCenter);
          const headDirection = detectHeadTurn(headYaw, HEAD_TURN_THRESHOLD);

          setState(prev => ({
            ...prev,
            faceDetected: true,
            leftEAR,
            rightEAR,
            headYaw,
            headPitch,
            isBlinking,
            headDirection,
            faceDistance,
            eyeDistanceRatio,
          }));

          // ============= Collect Liveness Metrics =============
          const metrics = livenessMetricsRef.current;
          
          // Initialize start time if first sample
          if (metrics.challengeStartTime === 0) {
            metrics.challengeStartTime = now;
          }
          
          // Collect samples (FIFO if max size reached)
          if (metrics.earSamples.length < LIVENESS_SCORE_CONFIG.SAMPLE_SIZE) {
            metrics.earSamples.push(avgEAR);
            metrics.yawSamples.push(headYaw);
            metrics.pitchSamples.push(headPitch);
            metrics.positionSamples.push(noseTip);
          } else {
            metrics.earSamples.shift();
            metrics.earSamples.push(avgEAR);
            metrics.yawSamples.shift();
            metrics.yawSamples.push(headYaw);
            metrics.pitchSamples.shift();
            metrics.pitchSamples.push(headPitch);
            metrics.positionSamples.shift();
            metrics.positionSamples.push(noseTip);
          }

          // Block challenge validation if face distance is not optimal
          if (faceDistance !== 'optimal') {
            animationRef.current = requestAnimationFrame(detectFace);
            return;
          }

          // Check current challenge completion (only if distance is optimal)
          if (currentChallenge === 'blink') {
            // Strict blink validation: must close THEN open
            if (avgEAR < BLINK_EAR_THRESHOLD) {
              // Eyes are closed
              if (!blinkStateRef.current.startedAt) {
                blinkStateRef.current.startedAt = now;
              }
              blinkStateRef.current.eyesWereClosed = true;
            } else if (blinkStateRef.current.eyesWereClosed && blinkStateRef.current.startedAt) {
              // Eyes were closed and now open
              const duration = now - blinkStateRef.current.startedAt;
              if (duration >= BLINK_MIN_DURATION && duration <= BLINK_MAX_DURATION) {
                completeChallenge('blink');
              }
              blinkStateRef.current = { startedAt: null, eyesWereClosed: false };
            }
          } else if (currentChallenge === 'turn_left') {
            if (headDirection === 'left') {
              if (!headTurnStartRef.current || headTurnStartRef.current.direction !== 'left') {
                headTurnStartRef.current = { direction: 'left', time: now };
              } else if (now - headTurnStartRef.current.time > HEAD_TURN_HOLD_TIME) {
                completeChallenge('turn_left');
                headTurnStartRef.current = null;
              }
            } else {
              headTurnStartRef.current = null;
            }
          } else if (currentChallenge === 'turn_right') {
            if (headDirection === 'right') {
              if (!headTurnStartRef.current || headTurnStartRef.current.direction !== 'right') {
                headTurnStartRef.current = { direction: 'right', time: now };
              } else if (now - headTurnStartRef.current.time > HEAD_TURN_HOLD_TIME) {
                completeChallenge('turn_right');
                headTurnStartRef.current = null;
              }
            } else {
              headTurnStartRef.current = null;
            }
          } else if (currentChallenge === 'look_up') {
            // Negative pitch = looking up (anti-photo measure)
            if (headPitch < LOOK_UP_THRESHOLD) {
              if (!lookUpStartRef.current) {
                lookUpStartRef.current = now;
              } else if (now - lookUpStartRef.current > LOOK_UP_HOLD_TIME) {
                completeChallenge('look_up');
                lookUpStartRef.current = null;
              }
            } else {
              lookUpStartRef.current = null;
            }
          }
        } else {
          // Face not detected - count as detection gap
          livenessMetricsRef.current.detectionGaps++;
          
          setState(prev => ({
            ...prev,
            faceDetected: false,
            isBlinking: false,
            headDirection: 'center',
            faceDistance: 'unknown',
            eyeDistanceRatio: 0,
          }));
        }
      } catch (_error) {
        // Silently handle detection errors to avoid console spam
      }

      if (isActiveRef.current) {
        animationRef.current = requestAnimationFrame(detectFace);
      }
    };

    animationRef.current = requestAnimationFrame(detectFace);

    return () => {
      isActiveRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, state.modelsLoaded, videoRef, detectionInterval, currentChallenge, completeChallenge, isLivenessComplete, isFailed]);

  // Auto-capture screenshot when liveness is complete
  useEffect(() => {
    if (isLivenessComplete && !screenshotTakenRef.current) {
      screenshotTakenRef.current = true;
      const img = takeScreenshot();
      if (img) {
        setScreenshot(img);
      }
    }
  }, [isLivenessComplete, takeScreenshot]);

  return {
    ...state,
    currentChallenge: currentChallenge ?? null,
    completedChallenges,
    isLivenessComplete,
    progress,
    resetChallenges,
    retryLoadModels,
    challenges,
    screenshot,
    takeScreenshot,
    timeLeft,
    isFailed,
    livenessResult,
    // Flash anti-reflet
    isFlashing,
    flashColor,
    runFlashTest,
    // CDN loading progress (all CDNs race in parallel)
    currentCdnAttempt: 0, // Not used in parallel mode
    totalCdnSources: MODEL_SOURCES.length,
  };
};
