/**
 * CNI Pre-Validation Service using face-api.js
 * Filters invalid CNI images BEFORE making paid NeoFace API calls
 * Runs entirely in the browser - FREE
 */
import * as faceapi from '@vladmandic/face-api';

// CDN URL for face-api models (lightweight, reliable)
const MODEL_URL = 'https://vladmandic.github.io/face-api/model';
let modelsLoaded = false;
let modelsLoading = false;

/**
 * Load face-api.js models (only once, cached)
 */
export async function loadCNIValidationModels(): Promise<boolean> {
  if (modelsLoaded) return true;
  if (modelsLoading) {
    // Wait for existing load to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    return loadCNIValidationModels();
  }
  
  modelsLoading = true;
  
  try {
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    modelsLoaded = true;
    if (import.meta.env.DEV) {
      console.log('[CNI Pre-validation] Models loaded successfully');
    }
    return true;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[CNI Pre-validation] Failed to load models:', err);
    }
    modelsLoading = false;
    return false;
  }
}

export interface CNIValidationResult {
  valid: boolean;
  error?: string;
  faceCount: number;
  faceAreaRatio?: number;
  confidence?: number;
}

/**
 * Validate CNI image before uploading to NeoFace
 * Returns immediately if image is invalid - saves paid API calls
 * 
 * @param imageUrl - URL or base64 of the CNI image
 * @returns Validation result with error message if invalid
 */
export async function validateCNIImage(imageUrl: string): Promise<CNIValidationResult> {
  try {
    // Load models if not already loaded
    const loaded = await loadCNIValidationModels();
    if (!loaded) {
      // If models fail to load, skip pre-validation and let NeoFace handle it
      return { valid: true, faceCount: -1 };
    }
    
    // Load the image
    const img = await faceapi.fetchImage(imageUrl);
    
    // Detect all faces in the image
    const detections = await faceapi.detectAllFaces(img);
    
    // Case 1: No face detected
    if (detections.length === 0) {
      return { 
        valid: false, 
        error: "Aucun visage détecté sur le document. Veuillez prendre une photo plus nette de votre pièce d'identité.",
        faceCount: 0 
      };
    }
    
    // Case 2: Multiple faces detected
    if (detections.length > 1) {
      return { 
        valid: false, 
        error: "Plusieurs visages détectés. Assurez-vous que seule votre photo d'identité est visible.",
        faceCount: detections.length 
      };
    }
    
    // Case 3: Single face - check quality
    const detection = detections[0];
    if (!detection) {
      return { valid: true, faceCount: -1 };
    }
    
    const faceBox = detection.box;
    const faceArea = faceBox.width * faceBox.height;
    const imageArea = img.width * img.height;
    const faceRatio = faceArea / imageArea;
    const confidence = detection.score;
    
    // Face too small (< 3% of image = likely too far or low quality)
    if (faceRatio < 0.03) {
      return { 
        valid: false, 
        error: "Le visage sur le document est trop petit ou flou. Rapprochez-vous ou améliorez l'éclairage.",
        faceCount: 1,
        faceAreaRatio: faceRatio,
        confidence
      };
    }
    
    // Low detection confidence (< 50%)
    if (confidence < 0.5) {
      return { 
        valid: false, 
        error: "La qualité de l'image est insuffisante. Prenez une photo plus nette avec un bon éclairage.",
        faceCount: 1,
        faceAreaRatio: faceRatio,
        confidence
      };
    }
    
    // All checks passed
    return { 
      valid: true, 
      faceCount: 1, 
      faceAreaRatio: faceRatio,
      confidence
    };
    
  } catch (err) {
    // If validation fails for any reason, skip it and let NeoFace handle
    if (import.meta.env.DEV) {
      console.warn('[CNI Pre-validation] Error during validation:', err);
    }
    return { valid: true, faceCount: -1 };
  }
}

/**
 * Check if models are loaded (for UI feedback)
 */
export function areCNIModelsLoaded(): boolean {
  return modelsLoaded;
}
