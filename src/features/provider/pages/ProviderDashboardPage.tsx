import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Wrench, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/shared/ui';

interface ProviderProfile {
  id: string;
  company_name: string;
  is_verified: boolean | null;
  rating_avg: number | null;
  rating_count: number | null;
  completed_jobs: number | null;
  specialties: string[];
  service_areas: string[];
  hourly_rate: number | null;
}

interface MaintenanceJob {
  id: string;
  issue_type: string;
  description: string;
  urgency: string;
  status: string;
  created_at: string;
  property: {
    title: string;
    city: string;
    neighborhood: string;
  } | null;
}

interface Intervention {
  id: string;
  status: string;
  scheduled_date: string | null;
  quoted_amount: number | null;
  maintenance_request: {
    issue_type: string;
    property: {
      title: string;
      city: string;
    } | null;
  } | null;
}

const ProviderDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [availableJobs, setAvailableJobs] = useState<MaintenanceJob[]>([]);
  const [myInterventions, setMyInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // Load provider profile
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (providerError) throw providerError;
      setProfile(providerData);

      // Load available maintenance jobs (open requests)
      const { data: jobsData, error: jobsError } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          issue_type,
          description,
          urgency,
          status,
          created_at,
          property:properties(title, city, neighborhood)
        `)
        .in('status', ['ouverte', 'acceptee'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (!jobsError && jobsData) {
        setAvailableJobs(jobsData as MaintenanceJob[]);
      }

      // Load my interventions
      if (providerData) {
        const { data: interventionsData, error: interventionsError } = await supabase
          .from('interventions')
          .select(`
            id,
            status,
            scheduled_date,
            quoted_amount,
            maintenance_request:maintenance_requests(
              issue_type,
              property:properties(title, city)
            )
          `)
          .eq('provider_id', providerData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!interventionsError && interventionsData) {
          setMyInterventions(interventionsData as Intervention[]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critique': return 'bg-red-100 text-red-700';
      case 'urgente': return 'bg-orange-100 text-orange-700';
      case 'normale': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'accepted': return 'bg-yellow-100 text-yellow-700';
      case 'assigned': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      assigned: 'Assigné',
      accepted: 'Accepté',
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé'
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Wrench className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Profil non trouvé</h1>
          <p className="text-muted-foreground mb-6">
            Vous n'avez pas encore de profil prestataire. Inscrivez-vous pour commencer.
          </p>
          <Button asChild>
            <Link to="/devenir-prestataire">Devenir prestataire</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Bonjour, {profile.company_name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {profile.is_verified ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Profil vérifié
                </span>
              ) : (
                <span className="text-yellow-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> En attente de vérification
                </span>
              )}
            </p>
          </div>
          <Link to="/prestataire/profil" className="inline-flex items-center px-4 py-2 border border-input rounded-md hover:bg-accent">
            Modifier mon profil
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(profile.rating_avg || 0).toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">{profile.rating_count || 0} avis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile.completed_jobs || 0}</p>
                  <p className="text-xs text-muted-foreground">Jobs terminés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {myInterventions.filter(i => i.status === 'in_progress').length}
                  </p>
                  <p className="text-xs text-muted-foreground">En cours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{availableJobs.length}</p>
                  <p className="text-xs text-muted-foreground">Opportunités</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Available Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Demandes disponibles
              </CardTitle>
              <Badge variant="secondary">{availableJobs.length}</Badge>
            </CardHeader>
            <CardContent>
              {availableJobs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune demande disponible pour le moment
                </p>
              ) : (
                <div className="space-y-3">
                  {availableJobs.slice(0, 5).map(job => (
                    <Link
                      key={job.id}
                      to={`/prestataire/job/${job.id}`}
                      className="block p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {job.issue_type}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {job.property?.neighborhood}, {job.property?.city}
                          </p>
                        </div>
                        <Badge className={getUrgencyColor(job.urgency)}>
                          {job.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {job.description}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Interventions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Mes interventions
              </CardTitle>
              <Badge variant="secondary">{myInterventions.length}</Badge>
            </CardHeader>
            <CardContent>
              {myInterventions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune intervention en cours
                </p>
              ) : (
                <div className="space-y-3">
                  {myInterventions.slice(0, 5).map(intervention => (
                    <Link
                      key={intervention.id}
                      to={`/prestataire/intervention/${intervention.id}`}
                      className="block p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {intervention.maintenance_request?.issue_type || 'Intervention'}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {intervention.maintenance_request?.property?.city || 'N/A'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(intervention.status)}>
                          {getStatusLabel(intervention.status)}
                        </Badge>
                      </div>
                      {intervention.scheduled_date && (
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(intervention.scheduled_date).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      {intervention.quoted_amount && (
                        <p className="text-sm font-medium text-primary mt-1">
                          {intervention.quoted_amount.toLocaleString()} FCFA
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Specialties & Areas */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mes spécialités</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.specialties.map(specialty => (
                  <Badge key={specialty} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Zones d'intervention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.service_areas.map(area => (
                  <Badge key={area} variant="outline">
                    <MapPin className="w-3 h-3 mr-1" />
                    {area}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboardPage;
