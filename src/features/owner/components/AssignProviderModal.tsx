import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  X, 
  Star, 
  MapPin, 
  CheckCircle, 
  Zap,
  Search,
  Wrench
} from 'lucide-react';
import { Button, Input, Badge } from '@/shared/ui';

interface Provider {
  id: string;
  company_name: string;
  specialties: string[];
  service_areas: string[];
  rating_avg: number | null;
  completed_jobs: number | null;
  hourly_rate: number | null;
  match_score?: number;
}

interface AssignProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceRequestId: string;
  issueType: string;
  city: string;
  urgency: string;
  onAssigned: () => void;
}

const AssignProviderModal: React.FC<AssignProviderModalProps> = ({
  isOpen,
  onClose,
  maintenanceRequestId,
  issueType,
  city,
  urgency,
  onAssigned
}) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadProviders();
    }
  }, [isOpen]);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('id, company_name, specialties, service_areas, rating_avg, completed_jobs, hourly_rate')
        .eq('is_active', true)
        .eq('is_verified', true)
        .order('rating_avg', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error loading providers:', error);
      toast.error('Erreur lors du chargement des prestataires');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoMatch = async () => {
    setIsMatching(true);
    try {
      const { data, error } = await supabase.functions.invoke('match-provider', {
        body: {
          maintenance_request_id: maintenanceRequestId,
          specialty: issueType,
          city,
          urgency
        }
      });

      if (error) throw error;

      if (data?.providers && data.providers.length > 0) {
        setProviders(data.providers);
        toast.success(`${data.providers.length} prestataires recommandés trouvés`);
      } else {
        toast.info('Aucun prestataire correspondant trouvé');
      }
    } catch (error) {
      console.error('Error matching providers:', error);
      toast.error('Erreur lors de la recherche automatique');
    } finally {
      setIsMatching(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedProvider) {
      toast.error('Veuillez sélectionner un prestataire');
      return;
    }

    setIsAssigning(true);
    try {
      // Get owner_id from the maintenance request
      const { data: mrData, error: mrError } = await supabase
        .from('maintenance_requests')
        .select('contract_id, lease_contracts(owner_id)')
        .eq('id', maintenanceRequestId)
        .single();

      if (mrError) throw mrError;

      const leaseContract = mrData?.lease_contracts as { owner_id: string } | null;
      const ownerId = leaseContract?.owner_id;

      if (!ownerId) {
        throw new Error('Impossible de déterminer le propriétaire');
      }

      // Create intervention
      const { error: interventionError } = await supabase
        .from('interventions')
        .insert({
          maintenance_request_id: maintenanceRequestId,
          provider_id: selectedProvider,
          owner_id: ownerId,
          status: 'assigned'
        });

      if (interventionError) throw interventionError;

      // Update maintenance request status
      const { error: updateError } = await supabase
        .from('maintenance_requests')
        .update({ status: 'en_cours' })
        .eq('id', maintenanceRequestId);

      if (updateError) throw updateError;

      // Notify provider
      await supabase.functions.invoke('provider-notification', {
        body: {
          provider_ids: [selectedProvider],
          maintenance_request_id: maintenanceRequestId,
          notification_type: 'job_assigned',
          urgency
        }
      });

      toast.success('Prestataire assigné avec succès!');
      onAssigned();
      onClose();
    } catch (error) {
      console.error('Error assigning provider:', error);
      toast.error('Erreur lors de l\'assignation');
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredProviders = providers.filter(p =>
    p.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-foreground">Assigner un prestataire</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Pour: {issueType} • {city}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="p-4 border-b bg-muted/50">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un prestataire..."
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleAutoMatch}
              disabled={isMatching}
            >
              <Zap className="w-4 h-4 mr-2" />
              {isMatching ? 'Recherche...' : 'Auto-matching'}
            </Button>
          </div>
        </div>

        {/* Providers list */}
        <div className="overflow-y-auto max-h-[400px] p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucun prestataire disponible</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProviders.map(provider => (
                <div
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedProvider === provider.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {provider.company_name}
                        </h3>
                        {selectedProvider === provider.id && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                        {provider.match_score && (
                          <Badge className="bg-green-100 text-green-700">
                            {provider.match_score}% match
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {provider.specialties.slice(0, 3).map(s => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {(provider.rating_avg || 0).toFixed(1)}
                        </span>
                        <span>{provider.completed_jobs || 0} jobs</span>
                        {provider.hourly_rate && (
                          <span>{provider.hourly_rate.toLocaleString()} FCFA/h</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {provider.service_areas.slice(0, 3).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-muted/50">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedProvider || isAssigning}
          >
            {isAssigning ? 'Assignation...' : 'Assigner ce prestataire'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignProviderModal;
