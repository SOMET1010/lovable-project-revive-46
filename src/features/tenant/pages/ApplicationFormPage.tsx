import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, CheckCircle, Home, MapPin, Coins, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { ScoringService } from '@/services/scoringService';
import { notifyApplicationReceived } from '@/services/notifications/applicationNotificationService';
import FormPageLayout from '@/shared/components/FormPageLayout';
import { FormStepper, FormStepContent, useFormStepper } from '@/shared/ui';
import { ApplicationStep1PersonalInfo, ApplicationStep2Motivation } from '../components/application';
import type { Database } from '@/shared/lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

interface ExtendedProfile {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  avatar_url: string | null;
  user_type: string | null;
  profile_setup_completed: boolean | null;
  is_verified?: boolean;
  trust_score?: number | null;
  occupation?: string | null;
  employer?: string | null;
  monthly_income?: number | null;
}

export default function ApplicationFormPage() {
  const { id: propertyId } = useParams<{ id: string }>();
  const { user, profile: authProfile } = useAuth();
  const navigate = useNavigate();
  const profile = authProfile as ExtendedProfile | null;
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingApplication, setExistingApplication] = useState(false);
  
  const { step, slideDirection, nextStep, prevStep, goToStep } = useFormStepper(1, 2);
  const isVerified = profile?.is_verified ?? false;
  
  // Calcul du score de candidature
  const applicationScore = useCallback(() => {
    return ScoringService.calculateSimpleScore(profile as Record<string, unknown> | null);
  }, [profile]);

  useEffect(() => {
    if (!user) {
      navigate('/connexion');
      return;
    }

    if (propertyId) {
      loadProperty(propertyId);
    }
  }, [user, propertyId, navigate]);

  const loadProperty = async (id: string) => {
    try {
      const { data, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (propError) throw propError;
      if (!data) {
        navigate('/recherche');
        return;
      }

      setProperty(data);

      // Check for existing application
      if (user) {
        const { data: existing } = await supabase
          .from('rental_applications')
          .select('id')
          .eq('property_id', id)
          .eq('applicant_id', user.id)
          .maybeSingle();

        if (existing) {
          setExistingApplication(true);
          setError('Vous avez déjà postulé pour cette propriété');
        }
      }
    } catch (err) {
      console.error('Error loading property:', err);
      setError('Erreur lors du chargement de la propriété');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !property) return;

    if (coverLetter.length < 50) {
      setError('La lettre de motivation doit contenir au moins 50 caractères');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const score = applicationScore();

      const { data: applicationData, error: insertError } = await supabase
        .from('rental_applications')
        .insert({
          property_id: property.id,
          applicant_id: user.id,
          cover_letter: coverLetter,
          application_score: score,
          status: 'en_attente',
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      // Send notification to owner
      try {
        const appId = (applicationData as { id: string } | null)?.id;
        if (appId) {
          await notifyApplicationReceived(appId);
        }
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la soumission';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // État non connecté
  if (!user) {
    return (
      <FormPageLayout title="Candidature de location" showBackButton={false}>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-[#A69B95] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#2C1810] mb-2">Connexion requise</h2>
          <p className="text-[#A69B95] mb-6">Connectez-vous pour postuler à ce bien</p>
          <button
            onClick={() => navigate('/connexion')}
            className="bg-[#F16522] hover:bg-[#d9571d] text-white font-semibold py-3 px-8 rounded-xl"
          >
            Se connecter
          </button>
        </div>
      </FormPageLayout>
    );
  }

  // Chargement
  if (loading) {
    return (
      <FormPageLayout title="Candidature de location" showBackButton={false}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#F16522]" />
        </div>
      </FormPageLayout>
    );
  }

  // Propriété non trouvée
  if (!property) {
    return (
      <FormPageLayout title="Candidature de location" backPath="/recherche">
        <div className="text-center py-12">
          <Home className="w-16 h-16 text-[#A69B95] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#2C1810] mb-2">Bien introuvable</h2>
          <p className="text-[#A69B95] mb-6">Ce bien n'existe pas ou n'est plus disponible</p>
          <button
            onClick={() => navigate('/recherche')}
            className="bg-[#F16522] hover:bg-[#d9571d] text-white font-semibold py-3 px-8 rounded-xl"
          >
            Rechercher un bien
          </button>
        </div>
      </FormPageLayout>
    );
  }

  // Succès
  if (success) {
    return (
      <FormPageLayout title="Candidature envoyée" icon={CheckCircle} showBackButton={false}>
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-3">
            Candidature envoyée !
          </h2>
          <p className="text-[#6B5A4E] mb-8 max-w-md mx-auto">
            Votre candidature a été transmise au propriétaire. 
            Vous serez notifié dès qu'il aura pris une décision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/mes-candidatures')}
              className="bg-[#F16522] hover:bg-[#d9571d] text-white font-semibold py-3 px-8 rounded-xl"
            >
              Voir mes candidatures
            </button>
            <button
              onClick={() => navigate('/recherche')}
              className="border border-[#EFEBE9] text-[#2C1810] hover:bg-[#FAF7F4] font-semibold py-3 px-8 rounded-xl"
            >
              Continuer ma recherche
            </button>
          </div>
        </div>
      </FormPageLayout>
    );
  }


  // Profil adapté pour le sous-composant
  const profileForStep = profile ? {
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    phone: profile.phone,
    city: profile.city,
    occupation: profile.occupation || null,
    employer: profile.employer || null,
    monthly_income: profile.monthly_income || null,
    trust_score: profile.trust_score || null,
    is_verified: profile.is_verified || null,
  } : null;

  return (
    <FormPageLayout 
      title="Postuler pour ce bien"
      subtitle={property.title}
      icon={FileText}
      backPath={`/propriete/${propertyId}`}
    >
      {/* Résumé du bien */}
      <div className="bg-[#FAF7F4] rounded-xl p-4 border border-[#EFEBE9] mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#EFEBE9] flex-shrink-0">
          {property.main_image ? (
            <img src={property.main_image} alt={property.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="w-6 h-6 text-[#A69B95]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#2C1810] truncate">{property.title}</h3>
          <p className="text-sm text-[#A69B95] flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {property.address ? `${property.address}, ` : ''}{property.city}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-[#F16522] flex items-center gap-1">
            <Coins className="w-4 h-4" />
            {property.monthly_rent.toLocaleString()} FCFA
          </p>
          <p className="text-xs text-[#A69B95]">/mois</p>
        </div>
      </div>

      {/* Stepper */}
      <FormStepper 
        currentStep={step} 
        totalSteps={2} 
        onStepChange={goToStep}
        labels={['Mon profil', 'Motivation']}
        className="mb-8" 
      />

      {/* Étape 1 - Mon profil */}
      <FormStepContent step={1} currentStep={step} slideDirection={slideDirection}>
        <ApplicationStep1PersonalInfo
          profile={profileForStep}
          userEmail={user.email}
          applicationScore={applicationScore()}
          isVerified={isVerified}
          onNext={nextStep}
        />
      </FormStepContent>

      {/* Étape 2 - Motivation */}
      <FormStepContent step={2} currentStep={step} slideDirection={slideDirection}>
        <ApplicationStep2Motivation
          coverLetter={coverLetter}
          onCoverLetterChange={setCoverLetter}
          isVerified={isVerified}
          submitting={submitting}
          existingApplication={existingApplication}
          error={error}
          onPrev={prevStep}
          onSubmit={handleSubmit}
        />
      </FormStepContent>
    </FormPageLayout>
  );
}
