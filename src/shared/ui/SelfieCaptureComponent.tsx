import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface SelfieCaptureComponentProps {
  onCapture: (base64Image: string) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

const SelfieCaptureComponent: React.FC<SelfieCaptureComponentProps> = ({
  onCapture,
  onCancel,
  isProcessing = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Démarrer la caméra
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraReady(false);

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
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      
      if (message.includes('NotAllowedError') || message.includes('Permission')) {
        setCameraError('Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
      } else if (message.includes('NotFoundError')) {
        setCameraError('Aucune caméra détectée sur cet appareil.');
      } else {
        setCameraError(`Impossible d'accéder à la caméra : ${message}`);
      }
    }
  }, []);

  // Arrêter la caméra
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  // Capturer le selfie
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Dimensions du canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Miroir horizontal pour une vue naturelle
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    // Extraire en base64 (JPEG pour réduire la taille)
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(base64);
    
    // Arrêter la caméra après capture
    stopCamera();
  }, [stopCamera]);

  // Confirmer et envoyer
  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      // Envoyer seulement la partie base64 sans le préfixe data:image/jpeg;base64,
      const base64Data = capturedImage.split(',')[1];
      onCapture(base64Data ?? capturedImage);
    }
  }, [capturedImage, onCapture]);

  // Reprendre une nouvelle photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // Démarrer la caméra au montage
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="space-y-4">
      {/* Erreur caméra */}
      {cameraError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-700 font-medium">{cameraError}</p>
          <Button
            onClick={startCamera}
            variant="outline"
            className="mt-3 text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Réessayer
          </Button>
        </div>
      )}

      {/* Zone caméra / photo capturée */}
      {!cameraError && (
        <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3]">
          {/* Chargement caméra */}
          {!cameraReady && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#2C1810]">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-2" />
                <p className="text-white/80 text-sm">Activation de la caméra...</p>
              </div>
            </div>
          )}

          {/* Vidéo live */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${capturedImage ? 'hidden' : ''}`}
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* Image capturée */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Selfie capturé"
              className="w-full h-full object-cover"
            />
          )}

          {/* Overlay guide visage */}
          {cameraReady && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-60 border-4 border-white/50 rounded-[50%] relative">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
                  Cadrez votre visage
                </div>
              </div>
            </div>
          )}

          {/* Badge capture réussie */}
          {capturedImage && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Capturé
            </div>
          )}

          {/* Canvas hidden pour capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Boutons d'action */}
      <div className="space-y-3">
        {/* Bouton capturer */}
        {cameraReady && !capturedImage && (
          <Button
            onClick={capturePhoto}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" /> Prendre le selfie
          </Button>
        )}

        {/* Boutons après capture */}
        {capturedImage && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={retakePhoto}
              variant="outline"
              disabled={isProcessing}
              className="py-3 border-2 border-border text-[#2C1810] font-bold rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Reprendre
            </Button>
            <Button
              onClick={confirmCapture}
              disabled={isProcessing}
              className="py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Envoi...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Confirmer
                </>
              )}
            </Button>
          </div>
        )}

        {/* Bouton annuler */}
        <Button
          onClick={onCancel}
          variant="ghost"
          disabled={isProcessing}
          className="w-full text-[#A69B95] hover:text-[#6B5A4E] text-sm"
        >
          Annuler / Recommencer
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-[#FAF7F4] border border-border rounded-xl p-4">
        <h4 className="font-bold text-[#2C1810] text-sm mb-2">Conseils pour une bonne photo :</h4>
        <ul className="text-xs text-[#6B5A4E] space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
            Regardez directement la caméra
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
            Assurez un bon éclairage (pas de contre-jour)
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
            Retirez lunettes de soleil et chapeau
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
            Expression neutre, visage bien visible
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SelfieCaptureComponent;
