import { useState, useEffect, useRef, useCallback } from 'react';
import type React from 'react';
import * as faceapi from '@vladmandic/face-api';

// Inline types and utils to avoid import issues
interface Point {
  x: number;
  y: number;
}

export type LivenessChallenge = 'blink' | 'turn_left' | 'turn_right' | 'look_up';
export type FaceDistance = 'too_far' | 'too_close' | 'optimal' | 'unknown';

const LIVENESS_CHALLENGES: LivenessChallenge[] = ['blink', 'turn_left', 'turn_right', 'look_up'];

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
}

// Model URLs - local first, CDN fallback
const LOCAL_MODEL_URL = '/models/face-api';
const CDN_MODEL_URL = 'https://vladmandic.github.io/face-api/model';

// Timeout for model loading (15 seconds)
const MODEL_LOAD_TIMEOUT = 15000;

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

// Load models with timeout
const loadModelsFromUrl = async (url: string, timeout: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout loading models from ${url}`));
    }, timeout);

    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(url),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(url),
    ])
      .then(() => {
        clearTimeout(timeoutId);
        resolve();
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

// Try loading models with fallback strategy
const loadModelsWithFallback = async (): Promise<{ source: 'local' | 'cdn' }> => {
  // Try local first
  try {
    await loadModelsFromUrl(LOCAL_MODEL_URL, MODEL_LOAD_TIMEOUT);
    return { source: 'local' };
  } catch (_localError) {
    if (import.meta.env.DEV) {
      console.warn('Local models not available, trying CDN...');
    }
  }

  // Fallback to CDN
  try {
    await loadModelsFromUrl(CDN_MODEL_URL, MODEL_LOAD_TIMEOUT);
    return { source: 'cdn' };
  } catch (_cdnError) {
    if (import.meta.env.DEV) {
      console.error('CDN models also failed');
    }
    throw new Error('models_unavailable');
  }
};

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

  // Load face-api models with fallback
  useEffect(() => {
    const loadModels = async () => {
      if (state.modelsLoaded || state.modelsLoading) return;

      setState(prev => ({ ...prev, modelsLoading: true, modelsError: null }));

      try {
        const result = await loadModelsWithFallback();
        
        if (import.meta.env.DEV) {
          console.log(`Face-api models loaded from ${result.source}`);
        }

        setState(prev => ({
          ...prev,
          modelsLoaded: true,
          modelsLoading: false,
          modelsError: null,
        }));
      } catch (_error) {
        setState(prev => ({
          ...prev,
          modelsLoading: false,
          modelsError: 'slow_connection',
        }));
      }
    };

    loadModels();
  }, [state.modelsLoaded, state.modelsLoading, loadAttempt]);

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
    setTimeLeft(CHALLENGE_TIMEOUT); // Reset timer
    setIsFailed(false); // Reset failed state
    // Re-randomize challenges on reset
    setChallenges(shuffleArray(LIVENESS_CHALLENGES));
    blinkStateRef.current = { startedAt: null, eyesWereClosed: false };
    headTurnStartRef.current = null;
    lookUpStartRef.current = null;
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
  }, [enabled, state.modelsLoaded, videoRef, detectionInterval, currentChallenge, completeChallenge, isLivenessComplete]);

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
  };
};
