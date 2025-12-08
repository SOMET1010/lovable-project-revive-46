import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlaceSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

export interface PlaceDetails {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city?: string;
  neighborhood?: string;
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
  const [isReady] = useState(true); // Always ready since we use edge function
  const [error, setError] = useState<string | null>(null);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch suggestions from edge function
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
        setSuggestions(data.predictions.map((p: { place_id: string; structured_formatting: { main_text: string; secondary_text: string }; description: string }) => ({
          placeId: p.place_id,
          mainText: p.structured_formatting?.main_text || p.description,
          secondaryText: p.structured_formatting?.secondary_text || '',
          description: p.description,
        })));
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Places autocomplete error:', err);
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

  // Get place details (coordinates)
  const getDetails = useCallback(async (placeId: string): Promise<PlaceDetails | null> => {
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
