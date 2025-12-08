import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: Json;
  category: string;
  description: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

export function useSystemSettings(category?: string) {
  return useQuery({
    queryKey: ['system-settings', category],
    queryFn: async () => {
      let query = supabase
        .from('system_settings')
        .select('*')
        .order('category')
        .order('setting_key');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SystemSetting[];
    },
  });
}

export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, setting_value }: { id: string; setting_value: Json }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('system_settings')
        .update({ 
          setting_value,
          updated_by: user?.id 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('Paramètre mis à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour: ' + error.message);
    },
  });
}
