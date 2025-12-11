import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Wrench, 
  Camera,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/shared/ui';
import RateProviderModal from '../components/RateProviderModal';

interface Intervention {
  id: string;
  status: string;
  quoted_amount: number | null;
  final_amount: number | null;
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  photos_before: string[];
  photos_after: string[];
  notes: string | null;
  owner_rating: number | null;
  owner_review: string | null;
  created_at: string;
  provider: {
    id: string;
    company_name: string;
    phone: string | null;
    rating_avg: number;
  } | null;
  maintenance_request: {
    id: string;
    issue_type: string;
    description: string | null;
    urgency: string;
    property: {
      title: string;
      city: string;
      neighborhood: string;
    } | null;
  } | null;
}

const TIMELINE_STEPS = [
  { status: 'assigned', label: 'Assigné', icon: Clock },
  { status: 'accepted', label: 'Accepté', icon: CheckCircle },
  { status: 'in_progress', label: 'En cours', icon: Wrench },
  { status: 'completed', label: 'Terminé', icon: CheckCircle }
];

const InterventionTimelinePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (id && user?.id) {
      loadIntervention();
    }
  }, [id, user?.id]);

  const loadIntervention = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select(`
          *,
          provider:service_providers(id, company_name, phone, rating_avg),
          maintenance_request:maintenance_requests(
            id,
            issue_type,
            description,
            urgency,
            property:properties(title, city, neighborhood)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setIntervention(data as Intervention);
    } catch (error) {
      console.error('Error loading intervention:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    const index = TIMELINE_STEPS.findIndex(s => s.status === status);
    return index >= 0 ? index : 0;
  };

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'critique': return { color: 'bg-red-100 text-red-700', label: 'Critique' };
      case 'urgente': return { color: 'bg-orange-100 text-orange-700', label: 'Urgente' };
      default: return { color: 'bg-blue-100 text-blue-700', label: 'Normale' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!intervention) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Intervention non trouvée</h1>
          <Button onClick={() => navigate('/dashboard/maintenance')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la maintenance
          </Button>
        </div>
      </div>
    );
  }

  const currentStep = getStatusIndex(intervention.status);
  const urgencyConfig = getUrgencyConfig(intervention.maintenance_request?.urgency || 'normale');
  const isCompleted = intervention.status === 'completed';
  const canRate = isCompleted && !intervention.owner_rating;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard/maintenance')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {intervention.maintenance_request?.issue_type}
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {intervention.maintenance_request?.property?.neighborhood}, {intervention.maintenance_request?.property?.city}
            </p>
          </div>
          <Badge className={urgencyConfig.color}>
            {urgencyConfig.label}
          </Badge>
        </div>

        {/* Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-muted">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(currentStep / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {TIMELINE_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isPast = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step.status} className="flex flex-col items-center">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isPast 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        } ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`mt-2 text-sm font-medium ${
                        isPast ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status specific message */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              {intervention.status === 'assigned' && (
                <p className="text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  En attente de confirmation du prestataire
                </p>
              )}
              {intervention.status === 'accepted' && (
                <p className="text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Le prestataire a accepté. Intervention prévue le{' '}
                  {intervention.scheduled_date 
                    ? new Date(intervention.scheduled_date).toLocaleDateString('fr-FR')
                    : 'date à confirmer'}
                </p>
              )}
              {intervention.status === 'in_progress' && (
                <p className="text-sm text-blue-600">
                  <Wrench className="w-4 h-4 inline mr-2" />
                  Intervention en cours depuis{' '}
                  {intervention.started_at 
                    ? new Date(intervention.started_at).toLocaleString('fr-FR')
                    : 'maintenant'}
                </p>
              )}
              {intervention.status === 'completed' && (
                <p className="text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Intervention terminée le{' '}
                  {intervention.completed_at 
                    ? new Date(intervention.completed_at).toLocaleDateString('fr-FR')
                    : ''}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Provider info */}
          <Card>
            <CardHeader>
              <CardTitle>Prestataire</CardTitle>
            </CardHeader>
            <CardContent>
              {intervention.provider ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{intervention.provider.company_name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{intervention.provider.rating_avg.toFixed(1)}</span>
                    </div>
                  </div>

                  {intervention.provider.phone && (
                    <div className="flex gap-3">
                      <a 
                        href={`tel:${intervention.provider.phone}`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-input rounded-md hover:bg-accent"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Appeler
                      </a>
                      <a 
                        href={`https://wa.me/${intervention.provider.phone.replace(/\D/g, '')}`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-input rounded-md hover:bg-accent"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </a>
                    </div>
                  )}

                  {canRate && (
                    <Button 
                      onClick={() => setShowRatingModal(true)}
                      className="w-full"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Noter ce prestataire
                    </Button>
                  )}

                  {intervention.owner_rating && (
                    <div className="p-3 rounded-lg bg-yellow-50">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= intervention.owner_rating!
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {intervention.owner_review && (
                        <p className="text-sm text-muted-foreground">
                          "{intervention.owner_review}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun prestataire assigné</p>
              )}
            </CardContent>
          </Card>

          {/* Financial info */}
          <Card>
            <CardHeader>
              <CardTitle>Coûts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {intervention.quoted_amount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Devis</span>
                  <span className="font-semibold">
                    {intervention.quoted_amount.toLocaleString()} FCFA
                  </span>
                </div>
              )}
              {intervention.final_amount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant final</span>
                  <span className="font-semibold text-primary">
                    {intervention.final_amount.toLocaleString()} FCFA
                  </span>
                </div>
              )}
              {!intervention.quoted_amount && !intervention.final_amount && (
                <p className="text-muted-foreground text-sm">
                  Montants non encore définis
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Photos comparison */}
        {(intervention.photos_before?.length > 0 || intervention.photos_after?.length > 0) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Before photos */}
                <div>
                  <h4 className="font-medium mb-3">Avant intervention</h4>
                  {intervention.photos_before?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {intervention.photos_before.map((url, idx) => (
                        <img
                          key={idx}
                          src={url as string}
                          alt={`Avant ${idx + 1}`}
                          className="rounded-lg w-full h-32 object-cover"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Pas de photos</p>
                  )}
                </div>

                {/* After photos */}
                <div>
                  <h4 className="font-medium mb-3">Après intervention</h4>
                  {intervention.photos_after?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {intervention.photos_after.map((url, idx) => (
                        <img
                          key={idx}
                          src={url as string}
                          alt={`Après ${idx + 1}`}
                          className="rounded-lg w-full h-32 object-cover"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Pas encore de photos</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {intervention.notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {intervention.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Rating Modal */}
        {intervention.provider && (
          <RateProviderModal
            isOpen={showRatingModal}
            onClose={() => setShowRatingModal(false)}
            interventionId={intervention.id}
            providerName={intervention.provider.company_name}
            onRated={loadIntervention}
          />
        )}
      </div>
    </div>
  );
};

export default InterventionTimelinePage;
