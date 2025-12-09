import { useState, useEffect, useRef, useCallback } from 'react';
import type React from 'react';
import * as faceapi from '@vladmandic/face-api';

// Inline types and utils to avoid import issues
interface Point {
  x: number;
  y: number;
}

type LivenessChallenge = 'blink' | 'turn_left' | 'turn_right';

const LIVENESS_CHALLENGES: LivenessChallenge[] = ['blink', 'turn_left', 'turn_right'];

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

const detectBlink = (leftEAR: number, rightEAR: number, threshold: number = 0.20): boolean => {
  const avgEAR = (leftEAR + rightEAR) / 2;
  return avgEAR < threshold;
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

const detectHeadTurn = (yaw: number, threshold: number = 12): 'left' | 'right' | 'center' => {
  if (yaw > threshold) return 'right';
  if (yaw < -threshold) return 'left';
  return 'center';
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
  isBlinking: boolean;
  headDirection: 'left' | 'right' | 'center';
}

interface UseFaceDetectionReturn extends FaceDetectionState {
  currentChallenge: LivenessChallenge | null;
  completedChallenges: LivenessChallenge[];
  isLivenessComplete: boolean;
  progress: number;
  resetChallenges: () => void;
}

const MODEL_URL = '/models';

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
    isBlinking: false,
    headDirection: 'center',
  });

  const [completedChallenges, setCompletedChallenges] = useState<LivenessChallenge[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

  const animationRef = useRef<number | null>(null);
  const lastDetectionRef = useRef<number>(0);
  const blinkStartRef = useRef<number | null>(null);
  const headTurnStartRef = useRef<{ direction: 'left' | 'right'; time: number } | null>(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      if (state.modelsLoaded || state.modelsLoading) return;

      setState(prev => ({ ...prev, modelsLoading: true }));

      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);

        setState(prev => ({
          ...prev,
          modelsLoaded: true,
          modelsLoading: false,
          modelsError: null,
        }));
      } catch (error) {
        console.error('Error loading face-api models:', error);
        setState(prev => ({
          ...prev,
          modelsLoading: false,
          modelsError: 'Impossible de charger les modèles de détection faciale',
        }));
      }
    };

    loadModels();
  }, [state.modelsLoaded, state.modelsLoading]);

  const currentChallenge = currentChallengeIndex < LIVENESS_CHALLENGES.length
    ? LIVENESS_CHALLENGES[currentChallengeIndex]
    : null;

  const isLivenessComplete = completedChallenges.length === LIVENESS_CHALLENGES.length;
  const progress = (completedChallenges.length / LIVENESS_CHALLENGES.length) * 100;

  const completeChallenge = useCallback((challenge: LivenessChallenge) => {
    if (!completedChallenges.includes(challenge)) {
      setCompletedChallenges(prev => [...prev, challenge]);
      setCurrentChallengeIndex(prev => prev + 1);
    }
  }, [completedChallenges]);

  const resetChallenges = useCallback(() => {
    setCompletedChallenges([]);
    setCurrentChallengeIndex(0);
    blinkStartRef.current = null;
    headTurnStartRef.current = null;
  }, []);

  // Face detection loop
  useEffect(() => {
    if (!enabled || !state.modelsLoaded || !videoRef.current || isLivenessComplete) {
      return;
    }

    const video = videoRef.current;

    const detectFace = async () => {
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
          // Left eye: 36-41, Right eye: 42-47
          const leftEyePoints: Point[] = positions.slice(36, 42).map(p => ({ x: p.x, y: p.y }));
          const rightEyePoints: Point[] = positions.slice(42, 48).map(p => ({ x: p.x, y: p.y }));

          // Nose tip: index 30
          const nosePoint = positions[30];
          const noseTip: Point = nosePoint ? { x: nosePoint.x, y: nosePoint.y } : { x: 0, y: 0 };

          // Calculate metrics
          const leftEAR = calculateEAR(leftEyePoints);
          const rightEAR = calculateEAR(rightEyePoints);
          const isBlinking = detectBlink(leftEAR, rightEAR, 0.21);

          const leftEyeCenter = getCenterPoint(leftEyePoints);
          const rightEyeCenter = getCenterPoint(rightEyePoints);
          const headYaw = calculateHeadYaw(noseTip, leftEyeCenter, rightEyeCenter);
          const headDirection = detectHeadTurn(headYaw, 12);

          setState(prev => ({
            ...prev,
            faceDetected: true,
            leftEAR,
            rightEAR,
            headYaw,
            isBlinking,
            headDirection,
          }));

          // Check current challenge completion
          if (currentChallenge === 'blink') {
            if (isBlinking) {
              if (!blinkStartRef.current) {
                blinkStartRef.current = now;
              } else if (now - blinkStartRef.current > 80) {
                completeChallenge('blink');
                blinkStartRef.current = null;
              }
            } else {
              blinkStartRef.current = null;
            }
          } else if (currentChallenge === 'turn_left') {
            if (headDirection === 'left') {
              if (!headTurnStartRef.current || headTurnStartRef.current.direction !== 'left') {
                headTurnStartRef.current = { direction: 'left', time: now };
              } else if (now - headTurnStartRef.current.time > 400) {
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
              } else if (now - headTurnStartRef.current.time > 400) {
                completeChallenge('turn_right');
                headTurnStartRef.current = null;
              }
            } else {
              headTurnStartRef.current = null;
            }
          }
        } else {
          setState(prev => ({
            ...prev,
            faceDetected: false,
            isBlinking: false,
            headDirection: 'center',
          }));
        }
      } catch (error) {
        // Silently handle detection errors to avoid console spam
      }

      animationRef.current = requestAnimationFrame(detectFace);
    };

    animationRef.current = requestAnimationFrame(detectFace);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, state.modelsLoaded, videoRef, detectionInterval, currentChallenge, completeChallenge, isLivenessComplete]);

  return {
    ...state,
    currentChallenge: currentChallenge ?? null,
    completedChallenges,
    isLivenessComplete,
    progress,
    resetChallenges,
  };
};
