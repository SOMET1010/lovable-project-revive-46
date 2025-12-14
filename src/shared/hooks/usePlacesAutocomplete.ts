import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlaceSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
  // Nominatim includes coordinates directly in autocomplete response
  latitude?: number;
  longitude?: number;
  city?: string;
  neighborhood?: string;
}

export interface PlaceDetails {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city?: string;
  neighborhood?: string;
}

interface NominatimPrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
  geometry?: {
    lat: number;
    lng: number;
  };
  address_data?: {
    city?: string;
    neighborhood?: string;
  };
}

interface UsePlacesAutocompleteOptions {
  country?: string;
  debounceMs?: number;
}

export function usePlacesAutocomplete(options: UsePlacesAutocompleteOptions = {}) {
  const { country = 'ci', debounceMs = 300 } = options;
  
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady] = useState(true); // Always ready - Nominatim requires no API key
  const [error, setError] = useState<string | null>(null);
  
  // Store full prediction data for getDetails
  const predictionsCache = useRef<Map<string, NominatimPrediction>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch suggestions from Nominatim via edge function
  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input || input.length < 2) {
      setSuggestions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('get-place-details', {
        body: { 
          action: 'autocomplete',
          input,
          country 
        },
      });

      if (invokeError) throw invokeError;

      if (data?.predictions) {
        // Cache predictions for getDetails
        predictionsCache.current.clear();
        
        const mappedSuggestions = data.predictions.map((p: NominatimPrediction) => {
          // Store in cache
          predictionsCache.current.set(p.place_id, p);
          
          return {
            placeId: p.place_id,
            mainText: p.structured_formatting?.main_text || p.description.split(',')[0] || '',
            secondaryText: p.structured_formatting?.secondary_text || '',
            description: p.description,
            // Nominatim includes coordinates directly
            latitude: p.geometry?.lat,
            longitude: p.geometry?.lng,
            city: p.address_data?.city,
            neighborhood: p.address_data?.neighborhood,
          };
        });
        
        setSuggestions(mappedSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Nominatim autocomplete error:', err);
        setError('Erreur de recherche');
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [country]);

  // Debounced search
  const search = useCallback((input: string) => {
    setQuery(input);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(input);
    }, debounceMs);
  }, [fetchSuggestions, debounceMs]);

  // Get place details - Nominatim already provides coordinates in autocomplete
  // This checks cache first, then falls back to API call
  const getDetails = useCallback(async (placeId: string): Promise<PlaceDetails | null> => {
    // Check cache first (Nominatim includes coordinates in autocomplete response)
    const cached = predictionsCache.current.get(placeId);
    if (cached?.geometry) {
      return {
        latitude: cached.geometry.lat,
        longitude: cached.geometry.lng,
        formattedAddress: cached.description,
        city: cached.address_data?.city,
        neighborhood: cached.address_data?.neighborhood,
      };
    }

    // Fallback to API call if not in cache
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('get-place-details', {
        body: { 
          action: 'details',
          placeId 
        },
      });

      if (invokeError) throw invokeError;

      if (data?.result) {
        return {
          latitude: data.result.geometry?.location?.lat,
          longitude: data.result.geometry?.location?.lng,
          formattedAddress: data.result.formatted_address,
          city: data.result.address_components?.find(
            (c: { types: string[] }) => c.types.includes('locality')
          )?.long_name,
          neighborhood: data.result.address_components?.find(
            (c: { types: string[] }) => c.types.includes('sublocality') || c.types.includes('neighborhood')
          )?.long_name,
        };
      }
      return null;
    } catch (err) {
      console.error('Place details error:', err);
      return null;
    }
  }, []);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    predictionsCache.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery: search,
    suggestions,
    isLoading,
    isReady,
    error,
    getDetails,
    clearSuggestions,
  };
}
