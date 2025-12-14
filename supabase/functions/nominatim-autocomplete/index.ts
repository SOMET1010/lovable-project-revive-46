import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nominatim API - gratuit, pas de clé requise
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

interface NominatimResult {
  place_id: number;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
  type?: string;
  importance?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, input, placeId, country = 'ci' } = await req.json();

    // Action: Autocomplete - Get suggestions
    if (action === 'autocomplete') {
      if (!input || input.length < 2) {
        return new Response(
          JSON.stringify({ predictions: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Nominatim autocomplete: "${input}" in ${country}`);

      const searchQuery = encodeURIComponent(`${input}, Côte d'Ivoire`);
      const url = `${NOMINATIM_BASE_URL}/search?q=${searchQuery}&countrycodes=${country}&format=json&limit=5&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MonToit-App/1.0 (contact@montoit.ci)',
          'Accept-Language': 'fr',
        },
      });

      if (!response.ok) {
        console.error('Nominatim API error:', response.status);
        return new Response(
          JSON.stringify({ predictions: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data: NominatimResult[] = await response.json();
      console.log(`Found ${data.length} results`);

      // Transform to match expected format
      const predictions = data.map((result) => {
        const address = result.address || {};
        const mainText = address.road || address.suburb || address.neighbourhood || 
                        address.city || address.town || address.village || 
                        result.display_name.split(',')[0] || '';
        const secondaryText = [
          address.suburb || address.neighbourhood,
          address.city || address.town || address.village,
          address.state
        ].filter(Boolean).join(', ');

        return {
          place_id: String(result.place_id),
          osm_id: String(result.osm_id),
          description: result.display_name,
          structured_formatting: {
            main_text: mainText,
            secondary_text: secondaryText || "Côte d'Ivoire",
          },
          geometry: {
            location: {
              lat: parseFloat(result.lat),
              lng: parseFloat(result.lon),
            },
          },
          address_components: {
            city: address.city || address.town || address.village,
            neighborhood: address.suburb || address.neighbourhood,
            state: address.state,
          },
        };
      });

      return new Response(
        JSON.stringify({ predictions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Details - Get place coordinates (for Nominatim, data is already in autocomplete)
    if (action === 'details') {
      if (!placeId) {
        return new Response(
          JSON.stringify({ error: 'placeId required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Nominatim details for placeId: ${placeId}`);

      // Lookup by OSM place_id
      const url = `${NOMINATIM_BASE_URL}/lookup?osm_ids=N${placeId},W${placeId},R${placeId}&format=json&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MonToit-App/1.0 (contact@montoit.ci)',
          'Accept-Language': 'fr',
        },
      });

      if (!response.ok) {
        // Fallback: use place_id directly with details endpoint
        const searchUrl = `${NOMINATIM_BASE_URL}/details?place_id=${placeId}&format=json&addressdetails=1`;
        const searchResponse = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'MonToit-App/1.0 (contact@montoit.ci)',
            'Accept-Language': 'fr',
          },
        });

        if (searchResponse.ok) {
          const result = await searchResponse.json();
          return new Response(
            JSON.stringify({
              result: {
                geometry: {
                  location: {
                    lat: result.centroid?.coordinates?.[1] || result.lat,
                    lng: result.centroid?.coordinates?.[0] || result.lon,
                  },
                },
                formatted_address: result.localname || result.names?.name || '',
                address_components: [
                  { types: ['locality'], long_name: result.address?.city || result.address?.town },
                  { types: ['sublocality'], long_name: result.address?.suburb },
                ],
              },
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.error('Nominatim lookup failed');
        return new Response(
          JSON.stringify({ error: 'Place not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data: NominatimResult[] = await response.json();
      
      if (data.length > 0) {
        const result = data[0];
        const address = result.address || {};

        return new Response(
          JSON.stringify({
            result: {
              geometry: {
                location: {
                  lat: parseFloat(result.lat),
                  lng: parseFloat(result.lon),
                },
              },
              formatted_address: result.display_name,
              address_components: [
                { types: ['locality'], long_name: address.city || address.town || address.village },
                { types: ['sublocality'], long_name: address.suburb || address.neighbourhood },
                { types: ['administrative_area_level_1'], long_name: address.state },
              ],
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Place not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "autocomplete" or "details".' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in nominatim-autocomplete:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
