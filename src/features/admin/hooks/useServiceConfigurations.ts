import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface ServiceConfiguration {
  id: string;
  service_name: string;
  provider: string;
  is_enabled: boolean | null;
  priority: number | null;
  config: Json;
  created_at: string | null;
  updated_at: string | null;
}

export function useServiceConfigurations() {
  return useQuery({
    queryKey: ['service-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_configurations')
        .select('*')
        .order('service_name')
        .order('priority');
      
      if (error) throw error;
      return data as ServiceConfiguration[];
    },
  });
}

export function useUpdateServiceConfiguration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { is_enabled?: boolean | null; priority?: number | null } }) => {
      const { data, error } = await supabase
        .from('service_configurations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-configurations'] });
      toast.success('Configuration mise à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour: ' + error.message);
    },
  });
}

export function useUpdateProviderPriorities() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: { id: string; priority: number }[]) => {
      const promises = updates.map(({ id, priority }) =>
        supabase
          .from('service_configurations')
          .update({ priority })
          .eq('id', id)
      );
      
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw new Error('Erreur lors de la mise à jour des priorités');
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-configurations'] });
      toast.success('Priorités mises à jour');
    },
    onError: (error) => {
      toast.error('Erreur: ' + error.message);
    },
  });
}
