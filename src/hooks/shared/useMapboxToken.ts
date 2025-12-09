import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMapboxToken() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["mapbox-token"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-mapbox-token");
      
      if (error) {
        console.error("Failed to fetch Mapbox token:", error);
        throw error;
      }
      
      if (!data?.token) {
        throw new Error("No token returned");
      }
      
      return data.token as string;
    },
    staleTime: Infinity, // Token stable, pas besoin de refetch
    gcTime: Infinity, // Garder en cache indéfiniment
    retry: 2,
  });

  return { 
    token: data, 
    isLoading, 
    error: error as Error | null 
  };
}
