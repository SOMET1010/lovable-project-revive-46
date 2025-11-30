/**
 * Composant GeographicHeatmap
 * Heatmap géographique des zones de demande avec Google Maps
 */

import { useState, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, HeatmapLayer } from '@react-google-maps/api';
import { GeographicAnalytics } from '@/services/analyticsService';
import { Loader2 } from 'lucide-react';

interface GeographicHeatmapProps {
  data: GeographicAnalytics[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: number | string;
}

const libraries: ('visualization')[] = ['visualization'];

export function GeographicHeatmap({
  data,
  center = { lat: 5.345317, lng: -4.024429 }, // Abidjan, Côte d'Ivoire
  zoom = 11,
  height = 500,
}: GeographicHeatmapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Préparer les données pour la heatmap
  const heatmapData = useMemo(() => {
    if (!isLoaded || !data || data.length === 0) return [];

    return data
      .filter((point) => point.latitude && point.longitude)
      .map((point) => ({
        location: new google.maps.LatLng(point.latitude!, point.longitude!),
        weight: point.demandScore, // Intensité basée sur le score de demande
      }));
  }, [data, isLoaded]);

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const onUnmount = () => {
    setMap(null);
  };

  if (loadError) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Erreur de chargement de Google Maps</p>
          <p className="text-sm text-gray-600 mt-2">
            Vérifiez votre connexion et votre clé API
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-600">Chargement de la carte...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Heatmap des zones de demande</h3>
        <p className="text-sm text-gray-600 mt-1">
          Les zones rouges indiquent une forte demande locative
        </p>
      </div>

      <div style={{ height }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '8px' }}
          center={center}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          {heatmapData.length > 0 && (
            <HeatmapLayer
              data={heatmapData}
              options={{
                radius: 30,
                opacity: 0.6,
                gradient: [
                  'rgba(0, 255, 255, 0)',
                  'rgba(0, 255, 255, 1)',
                  'rgba(0, 191, 255, 1)',
                  'rgba(0, 127, 255, 1)',
                  'rgba(0, 63, 255, 1)',
                  'rgba(0, 0, 255, 1)',
                  'rgba(0, 0, 223, 1)',
                  'rgba(0, 0, 191, 1)',
                  'rgba(0, 0, 159, 1)',
                  'rgba(0, 0, 127, 1)',
                  'rgba(63, 0, 91, 1)',
                  'rgba(127, 0, 63, 1)',
                  'rgba(191, 0, 31, 1)',
                  'rgba(255, 0, 0, 1)',
                ],
              }}
            />
          )}
        </GoogleMap>
      </div>

      {/* Légende */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">Faible demande</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600">Demande modérée</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Forte demande</span>
          </div>
        </div>
        <span className="text-gray-500">{data.length} zones analysées</span>
      </div>
    </div>
  );
}
