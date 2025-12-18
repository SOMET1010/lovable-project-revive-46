import { useState, useEffect } from 'react';
import { X, Cookie, Shield } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'montoit-cookie-consent';

export type ConsentStatus = 'pending' | 'accepted' | 'declined';

export interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [status, setStatus] = useState<ConsentStatus>('pending');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent) {
      setStatus(savedConsent as ConsentStatus);
      return;
    }
    // Show banner after a small delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setStatus('accepted');
    setIsVisible(false);
    onAccept?.();
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setStatus('declined');
    setIsVisible(false);
    onDecline?.();
  };

  if (status !== 'pending' || !isVisible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500"
      role="dialog"
      aria-label="Consentement aux cookies"
    >
      <div className="max-w-4xl mx-auto bg-background border border-border rounded-2xl shadow-2xl p-4 md:p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="hidden md:flex flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl items-center justify-center">
            <Cookie className="w-6 h-6 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Cookie className="w-5 h-5 text-primary md:hidden" />
              <h3 className="font-semibold text-foreground text-base md:text-lg">
                Nous utilisons des cookies
              </h3>
            </div>

            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
              Mon Toit utilise des cookies pour améliorer votre expérience, analyser le trafic et
              personnaliser le contenu. En continuant, vous acceptez notre{' '}
              <a
                href="/politique-confidentialite"
                className="text-primary hover:underline font-medium"
              >
                politique de confidentialité
              </a>
              .
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-3 mb-4 text-xs md:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                Données sécurisées
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                Conforme RGPD
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Accepter tous les cookies"
              >
                Accepter tout
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-secondary text-secondary-foreground rounded-xl font-medium text-sm hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                aria-label="Refuser les cookies non essentiels"
              >
                Refuser
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDecline}
            className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label="Fermer la bannière"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Utility to check consent status
export function getCookieConsent(): ConsentStatus | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentStatus | null;
}

// Utility to reset consent (for testing or settings page)
export function resetCookieConsent(): void {
  localStorage.removeItem(COOKIE_CONSENT_KEY);
}

export default CookieConsent;
