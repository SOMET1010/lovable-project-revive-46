import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  MapPin, 
  Clock, 
  AlertCircle, 
  ArrowLeft,
  Send,
  Camera,
  XCircle,
  FileText,
  Euro
} from 'lucide-react';
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, Badge } from '@/shared/ui';

interface MaintenanceJob {
  id: string;
  issue_type: string;
  description: string;
  urgency: string;
  status: string;
  images: string[];
  created_at: string;
  property: {
    id: string;
    title: string;
    city: string;
    neighborhood: string;
    address: string;
  } | null;
}

interface ProviderProfile {
  id: string;
  company_name: string;
}

const ProviderJobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState<MaintenanceJob | null>(null);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  
  const [quoteData, setQuoteData] = useState({
    amount: '',
    description: '',
    estimated_duration: ''
  });

  useEffect(() => {
    if (id && user?.id) {
      loadData();
    }
  }, [id, user?.id]);

  const loadData = async () => {
    if (!id || !user?.id) return;
    setIsLoading(true);
    try {
      // Load provider profile
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('id, company_name')
        .eq('user_id', user?.id)
        .single();

      if (providerError) throw providerError;
      setProvider(providerData);

      // Load job details
      const { data: jobData, error: jobError } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          issue_type,
          description,
          urgency,
          status,
          images,
          created_at,
          property:properties(id, title, city, neighborhood, address)
        `)
        .eq('id', id)
        .single();

      if (jobError) throw jobError;
      setJob(jobData as MaintenanceJob);
    } catch (error) {
      console.error('Error loading job:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuote = async () => {
    if (!provider || !job) return;

    if (!quoteData.amount) {
      toast.error('Veuillez entrer un montant');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('provider_quotes')
        .insert({
          maintenance_request_id: job.id,
          provider_id: provider.id,
          amount: parseInt(quoteData.amount),
          description: quoteData.description || null,
          estimated_duration: quoteData.estimated_duration || null,
          validity_days: 7
        });

      if (error) throw error;

      toast.success('Devis envoyé avec succès!');
      setShowQuoteForm(false);
      setQuoteData({ amount: '', description: '', estimated_duration: '' });
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast.error('Erreur lors de l\'envoi du devis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'critique':
        return { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Critique' };
      case 'urgente':
        return { color: 'bg-orange-100 text-orange-700', icon: AlertCircle, label: 'Urgente' };
      case 'normale':
        return { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Normale' };
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: Clock, label: urgency };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Demande non trouvée</h1>
          <p className="text-muted-foreground mb-6">
            Cette demande de maintenance n'existe pas ou a été supprimée.
          </p>
          <Button onClick={() => navigate('/prestataire/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  const urgencyConfig = getUrgencyConfig(job.urgency);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/prestataire/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {/* Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{job.issue_type}</h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {job.property?.neighborhood}, {job.property?.city}
                </p>
              </div>
              <Badge className={urgencyConfig.color}>
                <urgencyConfig.icon className="w-3 h-3 mr-1" />
                {urgencyConfig.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Description du problème
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">
                  {job.description || 'Aucune description fournie'}
                </p>
              </CardContent>
            </Card>

            {/* Photos */}
            {job.images && job.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    Photos ({job.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {job.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Photo ${idx + 1}`}
                        className="rounded-lg w-full h-48 object-cover"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quote Form */}
            {showQuoteForm && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Soumettre un devis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Montant (FCFA) *</Label>
                    <div className="relative mt-1">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        value={quoteData.amount}
                        onChange={(e) => setQuoteData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="Ex: 50000"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="estimated_duration">Durée estimée</Label>
                    <Input
                      id="estimated_duration"
                      value={quoteData.estimated_duration}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                      placeholder="Ex: 2-3 heures"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Détails de l'intervention</Label>
                    <textarea
                      id="description"
                      value={quoteData.description}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez les travaux prévus, le matériel nécessaire..."
                      className="mt-1 w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowQuoteForm(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSubmitQuote}
                      disabled={isSubmitting || !quoteData.amount}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Envoi...' : 'Envoyer le devis'}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Property info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Propriété</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Titre</p>
                  <p className="font-medium">{job.property?.title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">{job.property?.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quartier</p>
                  <p className="font-medium">{job.property?.neighborhood || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ville</p>
                  <p className="font-medium">{job.property?.city || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Request info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Date de création</p>
                  <p className="font-medium">
                    {new Date(job.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant="secondary">{job.status}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {!showQuoteForm && (
              <div className="space-y-3">
                <Button 
                  onClick={() => setShowQuoteForm(true)}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Proposer un devis
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/prestataire/dashboard')}
                >
                  Voir d'autres demandes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderJobDetailPage;
