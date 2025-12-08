import { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from '@/shared/hooks/useMapboxToken';
import { usePlacesAutocomplete, PlaceSuggestion } from '@/shared/hooks/usePlacesAutocomplete';
import { Loader2, MapPin, Navigation2, Focus, Search, X } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  monthly_rent: number;
  longitude: number;
  latitude: number;
  status?: string;
  images?: string[];
  city?: string;
  neighborhood?: string;
}

interface MapboxMapProps {
  center?: [number, number];
  zoom?: number;
  properties: Property[];
  highlightedPropertyId?: string;
  onMarkerClick?: (property: Property) => void;
  onBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void;
  clustering?: boolean;
  draggableMarker?: boolean;
  showRadius?: boolean;
  radiusKm?: number;
  fitBounds?: boolean;
  height?: string;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  onMarkerDrag?: (lngLat: { lng: number; lat: number }) => void;
  searchEnabled?: boolean;
  singleMarker?: boolean;
}

// Coordonnées par défaut des villes ivoiriennes pour fallback
const CITY_CENTER_COORDS: Record<string, [number, number]> = {
  'Abidjan': [-4.0083, 5.3600],
  'Cocody': [-3.9878, 5.3545],
  'Plateau': [-4.0213, 5.3235],
  'Marcory': [-3.9989, 5.3010],
  'Riviera': [-3.9700, 5.3600],
  'Yopougon': [-4.0856, 5.3194],
  'Bouaké': [-5.0306, 7.6936],
  'Yamoussoukro': [-5.2767, 6.8277],
  'Grand-Bassam': [-3.7400, 5.2100],
  'Bingerville': [-3.8883, 5.3536],
};

// Composant de recherche intégré à la carte
interface MapSearchControlProps {
  onLocationSelect: (coords: { lng: number; lat: number }) => void;
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

function MapSearchControl({ onLocationSelect, mapRef }: MapSearchControlProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { suggestions, isLoading, setQuery, getDetails, clearSuggestions } = usePlacesAutocomplete({ country: 'ci' });

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    setQuery(value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  }, [setQuery]);

  const handleSelect = useCallback(async (suggestion: PlaceSuggestion) => {
    setInputValue(suggestion.mainText);
    setShowSuggestions(false);
    clearSuggestions();
    
    const details = await getDetails(suggestion.placeId);
    if (details && details.latitude && details.longitude) {
      // Animation flyTo vers le lieu
      mapRef.current?.flyTo({
        center: [details.longitude, details.latitude],
        zoom: 16,
        duration: 2000,
        essential: true
      });
      
      // Déclencher le callback avec les coordonnées
      onLocationSelect({ lng: details.longitude, lat: details.latitude });
    }
  }, [getDetails, clearSuggestions, mapRef, onLocationSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const handleClear = () => {
    setInputValue('');
    clearSuggestions();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="absolute top-4 left-4 z-20 w-72">
      <div className="relative">
        <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
          <Search className="w-4 h-4 text-neutral-400 ml-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Rechercher un lieu..."
            className="flex-1 px-3 py-2.5 text-sm bg-transparent border-none outline-none placeholder:text-neutral-400"
          />
          {isLoading && (
            <Loader2 className="w-4 h-4 text-primary animate-spin mr-3" />
          )}
          {inputValue && !isLoading && (
            <button
              onClick={handleClear}
              className="p-1.5 mr-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          )}
        </div>
        
        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.placeId}
                onClick={() => handleSelect(suggestion)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-neutral-50 transition-colors ${
                  index === selectedIndex ? 'bg-primary/5' : ''
                }`}
              >
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {suggestion.mainText}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {suggestion.secondaryText}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MapboxMap({
  center = [-4.0083, 5.3600],
  zoom = 12,
  properties,
  highlightedPropertyId,
  onMarkerClick,
  onBoundsChange,
  clustering: _clustering = false,
  draggableMarker = false,
  showRadius = false,
  radiusKm = 1,
  fitBounds = false,
  height = '100%',
  onMapClick,
  onMarkerDrag,
  searchEnabled = false,
  singleMarker = false,
}: MapboxMapProps) {
  
  // Filtrer les propriétés avec coordonnées valides et ajouter fallback
  const validProperties = properties.map(p => {
    // Si la propriété a des coordonnées valides, les utiliser
    if (p.latitude && p.longitude && p.latitude !== 0 && p.longitude !== 0) {
      return p;
    }
    // Sinon, essayer de récupérer les coordonnées de la ville
    const cityCoords = p.city ? CITY_CENTER_COORDS[p.city] : null;
    if (cityCoords) {
      // Ajouter un léger décalage aléatoire pour éviter les superpositions
      const jitter = () => (Math.random() - 0.5) * 0.01;
      return {
        ...p,
        longitude: cityCoords[0] + jitter(),
        latitude: cityCoords[1] + jitter(),
      };
    }
    return p;
  }).filter(p => p.latitude && p.longitude && p.latitude !== 0 && p.longitude !== 0);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const { token: mapboxToken, isLoading: tokenLoading, error: tokenError } = useMapboxToken();

  const getMarkerColor = (property: Property) => {
    if (property.status === 'disponible') return '#10B981';
    if (property.status === 'loue') return '#EF4444';
    if (property.status === 'en_attente') return '#F59E0B';
    return '#FF6B35';
  };

  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: zoom,
        attributionControl: false,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: true,
          showZoom: true,
        }),
        'top-right'
      );

      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      if (onBoundsChange) {
        map.current.on('moveend', () => {
          if (map.current) {
            const bounds = map.current.getBounds();
            if (bounds) {
              onBoundsChange(bounds);
            }
          }
        });
      }

      if (onMapClick) {
        map.current.on('click', (e) => {
          onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        });
      }

      map.current.on('load', () => {
        setMapLoaded(true);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    Object.values(markers.current).forEach((marker) => marker.remove());
    markers.current = {};

    if (validProperties.length === 0) return;

    if (singleMarker && validProperties.length > 0) {
      const property = validProperties[0];
      if (!property) return;
      
      const color = getMarkerColor(property);

      const marker = new mapboxgl.Marker({
        color: color,
        draggable: draggableMarker,
        anchor: 'bottom'
      })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current!);

      if (onMarkerDrag) {
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          onMarkerDrag({ lng: lngLat.lng, lat: lngLat.lat });
        });
      }

      markers.current[property.id] = marker;
      map.current?.setCenter([property.longitude, property.latitude]);
    } else {
      validProperties.forEach((property) => {
        const color = getMarkerColor(property);

        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '36px';
        el.style.height = '36px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = color;
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.2s ease';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = 'white';
        el.style.fontSize = '16px';
        el.style.fontWeight = 'bold';
        el.style.position = 'relative';
        el.innerHTML = '🏠';

        el.addEventListener('mouseenter', () => {
          el.style.boxShadow = '0 6px 16px rgba(0,0,0,0.5)';
          el.style.filter = 'brightness(1.1)';
          el.style.zIndex = '1000';
        });

        el.addEventListener('mouseleave', () => {
          el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
          el.style.filter = 'brightness(1)';
          el.style.zIndex = '1';
        });

        const popupContent = `
          <div style="padding: 12px; min-width: 200px;">
            ${Array.isArray(property.images) && property.images.length > 0 ?
              `<img src="${property.images[0]}" alt="${property.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />`
              : ''}
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 4px; color: #1f2937;">${property.title}</h3>
            ${property.city || property.neighborhood ?
              `<p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">${property.city || ''}${property.neighborhood ? ' • ' + property.neighborhood : ''}</p>`
              : ''}
            <p style="color: #ff6b35; font-weight: bold; font-size: 18px; margin-bottom: 8px;">${property.monthly_rent.toLocaleString()} FCFA/mois</p>
            ${property.status ?
              `<span style="background: ${property.status === 'disponible' ? '#10B981' : '#EF4444'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                ${property.status === 'disponible' ? 'Disponible' : property.status === 'loue' ? 'Loué' : 'En attente'}
              </span>`
              : ''}
          </div>
        `;

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          maxWidth: '300px',
        }).setHTML(popupContent);

        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'bottom'
        })
          .setLngLat([property.longitude, property.latitude])
          .setPopup(popup)
          .addTo(map.current!);

        el.addEventListener('click', () => {
          if (onMarkerClick) {
            onMarkerClick(property);
          }
          marker.togglePopup();
        });

        markers.current[property.id] = marker;
      });

      if (fitBounds && validProperties.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        validProperties.forEach((property) => {
          bounds.extend([property.longitude, property.latitude]);
        });
        map.current?.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15,
        });
      }
    }

    if (showRadius && validProperties.length > 0 && map.current) {
      const property = validProperties[0];
      if (!property) return;
      
      const radiusInMeters = radiusKm * 1000;

      const circle = {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [property.longitude, property.latitude],
        },
        properties: {
          radius: radiusInMeters,
        },
      };

      if (!map.current.getSource('radius')) {
        map.current.addSource('radius', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [circle],
          },
        });

        map.current.addLayer({
          id: 'radius-fill',
          type: 'circle',
          source: 'radius',
          paint: {
            'circle-radius': {
              stops: [
                [0, 0],
                [20, radiusInMeters / 0.075],
              ],
              base: 2,
            },
            'circle-color': '#FF6B35',
            'circle-opacity': 0.1,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#FF6B35',
            'circle-stroke-opacity': 0.5,
          },
        });
      }
    }
  }, [properties, mapLoaded, singleMarker, draggableMarker, fitBounds, showRadius, radiusKm]);

  useEffect(() => {
    if (!highlightedPropertyId) {
      Object.values(markers.current).forEach((marker) => {
        const el = marker.getElement();
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      });
      return;
    }

    Object.entries(markers.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      if (id === highlightedPropertyId) {
        el.style.transform = 'scale(1.3)';
        el.style.zIndex = '1000';
        el.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.6)';
      } else {
        el.style.transform = 'scale(0.9)';
        el.style.zIndex = '1';
        el.style.opacity = '0.5';
      }
    });
  }, [highlightedPropertyId]);

  // Loading state
  if (tokenLoading) {
    return (
      <div 
        style={{ width: '100%', height }} 
        className="rounded-lg overflow-hidden bg-muted flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">Chargement de la carte...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (tokenError || !mapboxToken) {
    return (
      <div 
        style={{ width: '100%', height }} 
        className="rounded-lg overflow-hidden bg-muted flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <MapPin className="h-8 w-8" />
          <span className="text-sm">Carte non disponible</span>
        </div>
      </div>
    );
  }

  // Fonction de recentrage sur les propriétés
  const handleResetView = () => {
    if (!map.current || validProperties.length === 0) return;
    
    const bounds = new mapboxgl.LngLatBounds();
    validProperties.forEach(p => {
      bounds.extend([p.longitude, p.latitude]);
    });
    map.current.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      maxZoom: 15,
      duration: 1500
    });
  };

  // Fonction de géolocalisation utilisateur
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Géolocalisation non disponible sur votre appareil');
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        
        // Centrer la carte avec animation
        map.current?.flyTo({
          center: [coords.lng, coords.lat],
          zoom: 14,
          duration: 1500
        });
        
        // Créer ou déplacer le marqueur utilisateur
        if (userMarker.current) {
          userMarker.current.setLngLat([coords.lng, coords.lat]);
        } else {
          const el = document.createElement('div');
          el.innerHTML = `
            <div style="
              width: 18px;
              height: 18px;
              background: hsl(217, 91%, 60%);
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 0 0 6px hsla(217, 91%, 60%, 0.3), 0 2px 8px rgba(0,0,0,0.3);
              animation: userPulse 2s infinite;
            "></div>
            <style>
              @keyframes userPulse {
                0%, 100% { box-shadow: 0 0 0 6px hsla(217, 91%, 60%, 0.3), 0 2px 8px rgba(0,0,0,0.3); }
                50% { box-shadow: 0 0 0 12px hsla(217, 91%, 60%, 0.1), 0 2px 8px rgba(0,0,0,0.3); }
              }
            </style>
          `;
          
          userMarker.current = new mapboxgl.Marker({ element: el })
            .setLngLat([coords.lng, coords.lat])
            .addTo(map.current!);
        }
        
        setIsLocating(false);
      },
      (err) => {
        console.error('Erreur géolocalisation:', err);
        alert('Impossible d\'obtenir votre position. Vérifiez les permissions.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handler pour la recherche sur carte
  const handleSearchLocationSelect = useCallback((coords: { lng: number; lat: number }) => {
    if (onMapClick) {
      onMapClick(coords);
    }
  }, [onMapClick]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        style={{ width: '100%', height }}
        className="rounded-lg overflow-hidden"
        role="application"
        aria-label="Carte interactive des propriétés"
      />
      
      {/* Barre de recherche intégrée */}
      {searchEnabled && mapLoaded && (
        <MapSearchControl 
          onLocationSelect={handleSearchLocationSelect}
          mapRef={map}
        />
      )}
      
      {/* Boutons de contrôle carte */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        {/* Bouton Recentrer sur propriétés */}
        <button
          onClick={handleResetView}
          disabled={validProperties.length === 0}
          className="bg-white hover:bg-neutral-50 p-3 rounded-full shadow-lg border border-neutral-200 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          title="Recentrer sur les propriétés"
          aria-label="Recentrer sur les propriétés"
        >
          <Focus className="w-5 h-5 text-primary" />
        </button>
        
        {/* Bouton Géolocalisation */}
        <button
          onClick={handleLocateUser}
          disabled={isLocating}
          className="bg-white hover:bg-neutral-50 p-3 rounded-full shadow-lg border border-neutral-200 transition-all hover:shadow-xl disabled:opacity-50"
          title="Me localiser"
          aria-label="Centrer sur ma position"
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Navigation2 className="w-5 h-5 text-primary" />
          )}
        </button>
      </div>
    </div>
  );
}
