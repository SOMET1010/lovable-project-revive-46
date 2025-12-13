import { useRef, useCallback, useEffect } from 'react';

/**
 * Options de configuration pour le hook usePolling
 */
interface UsePollingOptions<T> {
  /** Callback appelé quand le polling réussit (données finales reçues) */
  onSuccess: (data: T) => void;
  /** Callback appelé en cas d'erreur */
  onError: (error: Error) => void;
  /** Callback appelé quand le timeout est atteint */
  onTimeout: () => void;
  /** Intervalle entre chaque tentative en ms (défaut: 2000) */
  intervalMs?: number;
  /** Nombre maximum de tentatives (défaut: 30) */
  maxAttempts?: number;
}

/**
 * Retour du hook usePolling
 */
interface UsePollingReturn<T> {
  /** Démarre le polling avec la fonction de fetch */
  start: (fetchFn: () => Promise<T | null>) => void;
  /** Arrête le polling */
  stop: () => void;
  /** Nombre de tentatives actuelles */
  attempts: number;
  /** Indique si le polling est actif */
  isPolling: boolean;
}

/**
 * Hook générique pour le polling avec cleanup automatique
 * 
 * @example
 * const polling = usePolling<VerificationResult>({
 *   onSuccess: (data) => handleSuccess(data),
 *   onError: (err) => setError(err.message),
 *   onTimeout: () => setError('Délai dépassé'),
 *   intervalMs: 2000,
 *   maxAttempts: 30,
 * });
 * 
 * // Démarrer le polling
 * polling.start(async () => {
 *   const result = await fetchStatus();
 *   if (result.status === 'waiting') return null; // Continue polling
 *   return result; // Arrête et retourne les données
 * });
 */
export function usePolling<T>(options: UsePollingOptions<T>): UsePollingReturn<T> {
  const { 
    intervalMs = 2000, 
    maxAttempts = 30, 
    onSuccess, 
    onError, 
    onTimeout 
  } = options;
  
  const attemptRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActiveRef = useRef(false);
  const fetchFnRef = useRef<(() => Promise<T | null>) | null>(null);

  /**
   * Arrête le polling et nettoie les ressources
   */
  const stop = useCallback(() => {
    isActiveRef.current = false;
    fetchFnRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Exécute une tentative de polling
   */
  const poll = useCallback(async () => {
    if (!isActiveRef.current || !fetchFnRef.current) return;
    
    // Vérifier le timeout
    if (attemptRef.current >= maxAttempts) {
      stop();
      onTimeout();
      return;
    }

    attemptRef.current++;

    try {
      const result = await fetchFnRef.current();
      
      // Si null, le polling continue
      if (result === null) {
        if (isActiveRef.current) {
          timeoutRef.current = setTimeout(poll, intervalMs);
        }
      } else {
        // Résultat final reçu
        stop();
        onSuccess(result);
      }
    } catch (err) {
      stop();
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [intervalMs, maxAttempts, onSuccess, onError, onTimeout, stop]);

  /**
   * Démarre le polling avec la fonction de fetch fournie
   */
  const start = useCallback((fetchFn: () => Promise<T | null>) => {
    // Reset l'état
    stop();
    attemptRef.current = 0;
    isActiveRef.current = true;
    fetchFnRef.current = fetchFn;
    
    // Lance immédiatement la première tentative
    poll();
  }, [poll, stop]);

  /**
   * Cleanup automatique à l'unmount du composant
   */
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { 
    start, 
    stop, 
    attempts: attemptRef.current,
    isPolling: isActiveRef.current,
  };
}

export default usePolling;
