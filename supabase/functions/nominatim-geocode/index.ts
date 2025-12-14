import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nominatim API - gratuit, pas de clé requise
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, city, latitude, longitude, reverse = false } = await req.json();
    
    console.log('Nominatim geocoding request:', { address, city, reverse, latitude, longitude });

    let url: string;
    
    if (reverse && latitude && longitude) {
      // Reverse geocoding: coordinates → address
      url = `${NOMINATIM_BASE_URL}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    } else {
      // Forward geocoding: address → coordinates
      if (!address && !city) {
        return new Response(
          JSON.stringify({ error: 'Address or city required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const searchQuery = encodeURIComponent(`${address || ''} ${city || ''}, Côte d'Ivoire`.trim());
      url = `${NOMINATIM_BASE_URL}/search?q=${searchQuery}&countrycodes=ci&format=json&limit=1&addressdetails=1`;
    }

    // Nominatim requires User-Agent header
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MonToit-App/1.0 (contact@montoit.ci)',
        'Accept-Language': 'fr',
      },
    });

    if (!response.ok) {
      console.error('Nominatim API error:', response.status);
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Nominatim response:', data);

    if (reverse) {
      // Reverse geocoding response
      if (data && data.lat) {
        return new Response(
          JSON.stringify({
            latitude: parseFloat(data.lat),
            longitude: parseFloat(data.lon),
            formatted_address: data.display_name,
            city: data.address?.city || data.address?.town || data.address?.village,
            neighborhood: data.address?.suburb || data.address?.neighbourhood,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Forward geocoding response
      if (Array.isArray(data) && data.length > 0) {
        const result = data[0];
        return new Response(
          JSON.stringify({
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            formatted_address: result.display_name,
            city: result.address?.city || result.address?.town || result.address?.village,
            neighborhood: result.address?.suburb || result.address?.neighbourhood,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Default to Abidjan center if no results
    console.log('No geocoding results, using default Abidjan coordinates');
    return new Response(
      JSON.stringify({
        latitude: 5.3599,
        longitude: -4.0305,
        formatted_address: `${address || ''}, ${city || 'Abidjan'}, Côte d'Ivoire`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in nominatim-geocode function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
