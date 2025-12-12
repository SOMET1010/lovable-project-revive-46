import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Video, MapPin, ArrowLeft, Check, ChevronRight, MessageSquare } from 'lucide-react';
import { FormStepper, FormStepContent, useFormStepper } from '@/shared/ui';
import FormPageLayout from '@/shared/components/FormPageLayout';

interface Property {
  id: string;
  title: string;
  address: string | null;
  city: string;
  main_image: string | null;
  owner_id: string | null;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '10:00', available: true },
  { time: '11:00', available: true },
  { time: '14:00', available: true },
  { time: '15:00', available: true },
  { time: '16:00', available: true },
  { time: '17:00', available: true },
];

export default function ScheduleVisit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [visitType, setVisitType] = useState<'physique' | 'virtuelle'>('physique');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Form stepper - 3 steps
  const { step, slideDirection, goToStep, nextStep, prevStep } = useFormStepper(1, 3);

  const propertyId = window.location.pathname.split('/').pop();

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  useEffect(() => {
    if (selectedDate && property) {
      loadAvailableSlots();
    }
  }, [selectedDate, property]);

  const loadProperty = async () => {
    if (!propertyId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, address, city, main_image, owner_id')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      setProperty(data as Property);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate || !property) return;

    const dateStr = selectedDate.toISOString().split('T')[0] ?? '';
    
    try {
      const { data: existingVisits } = await supabase
        .from('visit_requests')
        .select('visit_time')
        .eq('property_id', property.id)
        .eq('visit_date', dateStr)
        .in('status', ['en_attente', 'confirmee']);

      const bookedTimes = new Set((existingVisits || []).map(v => v.visit_time?.substring(0, 5)));
      
      const slots = DEFAULT_TIME_SLOTS.map(slot => ({
        ...slot,
        available: !bookedTimes.has(slot.time)
      }));
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading slots:', error);
      setAvailableSlots(DEFAULT_TIME_SLOTS);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !property || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('visit_requests')
        .insert({
          property_id: property.id,
          tenant_id: user.id,
          visit_type: visitType,
          visit_date: selectedDate.toISOString().split('T')[0] ?? '',
          visit_time: selectedTime,
          visitor_notes: notes || null,
          status: 'en_attente'
        } as never);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate(`/propriete/${property.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error scheduling visit:', error);
      alert('Erreur lors de la planification de la visite');
    } finally {
      setSubmitting(false);
    }
  };

  const getNextDays = (count: number) => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= count; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const canProceedToStep2 = visitType !== null;
  const canProceedToStep3 = selectedDate && selectedTime;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-[#EFEBE9] p-8 text-center max-w-md">
          <Calendar className="w-16 h-16 text-[#A69B95] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2C1810] mb-2">Connexion requise</h2>
          <p className="text-[#6B5A4E] mb-4">Veuillez vous connecter pour planifier une visite</p>
          <a href="/connexion" className="inline-block px-6 py-3 bg-[#F16522] text-white font-semibold rounded-xl hover:bg-[#d9571d] transition-colors">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F16522] mx-auto mb-4"></div>
          <p className="text-[#6B5A4E]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-[#EFEBE9] p-8 text-center">
          <p className="text-[#6B5A4E]">Propriété non trouvée</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-[#EFEBE9] p-8 text-center max-w-md animate-scale-in">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-2">Visite planifiée avec succès !</h2>
          <p className="text-[#6B5A4E] mb-4">Vous recevrez une confirmation par email</p>
          <p className="text-sm text-[#F16522]">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  const stepLabels = ['Type de visite', 'Date & Heure', 'Confirmation'];

  return (
    <FormPageLayout
      title="Planifier une visite"
      subtitle={property.title}
      icon={Calendar}
    >
      {/* Property Info */}
      <div className="flex items-center gap-4 bg-[#FAF7F4] rounded-xl p-4 border border-[#EFEBE9]">
        {property.main_image && (
          <img
            src={property.main_image}
            alt={property.title}
            className="w-20 h-20 rounded-xl object-cover"
          />
        )}
        <div>
          <p className="font-bold text-[#2C1810]">{property.title}</p>
          <p className="text-sm text-[#6B5A4E]">{property.address || ''}, {property.city}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="py-2">
        <FormStepper
          currentStep={step}
          totalSteps={3}
          onStepChange={goToStep}
          labels={stepLabels}
        />
      </div>

      <form onSubmit={handleSubmit}>
        {/* STEP 1: Type de visite */}
        <FormStepContent step={1} currentStep={step} slideDirection={slideDirection} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#2C1810] mb-4">Type de visite</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setVisitType('physique')}
                className={`p-6 text-center rounded-xl border-2 transition-all ${
                  visitType === 'physique' 
                    ? 'border-[#F16522] bg-[#F16522]/5' 
                    : 'border-[#EFEBE9] hover:border-[#F16522]/50'
                }`}
              >
                <MapPin className={`w-10 h-10 mx-auto mb-3 ${visitType === 'physique' ? 'text-[#F16522]' : 'text-[#A69B95]'}`} />
                <p className="font-semibold text-[#2C1810]">Visite physique</p>
                <p className="text-xs mt-1 text-[#6B5A4E]">Visitez le bien en personne</p>
              </button>
              <button
                type="button"
                onClick={() => setVisitType('virtuelle')}
                className={`p-6 text-center rounded-xl border-2 transition-all ${
                  visitType === 'virtuelle' 
                    ? 'border-[#F16522] bg-[#F16522]/5' 
                    : 'border-[#EFEBE9] hover:border-[#F16522]/50'
                }`}
              >
                <Video className={`w-10 h-10 mx-auto mb-3 ${visitType === 'virtuelle' ? 'text-[#F16522]' : 'text-[#A69B95]'}`} />
                <p className="font-semibold text-[#2C1810]">Visite virtuelle</p>
                <p className="text-xs mt-1 text-[#6B5A4E]">Visitez par vidéo conférence</p>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[#EFEBE9]">
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceedToStep2}
              className="px-6 py-3 bg-[#F16522] text-white font-semibold rounded-xl hover:bg-[#d9571d] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <span>Continuer</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </FormStepContent>

        {/* STEP 2: Date & Heure */}
        <FormStepContent step={2} currentStep={step} slideDirection={slideDirection} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#2C1810] mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Choisir une date
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {getNextDays(14).map((date) => (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedTime('');
                  }}
                  className={`p-3 text-center rounded-xl border-2 transition-all ${
                    selectedDate?.toDateString() === date.toDateString()
                      ? 'border-[#F16522] bg-[#F16522]/5'
                      : 'border-[#EFEBE9] hover:border-[#F16522]/50'
                  }`}
                >
                  <p className={`text-sm font-semibold ${
                    selectedDate?.toDateString() === date.toDateString() ? 'text-[#F16522]' : 'text-[#2C1810]'
                  }`}>
                    {formatDate(date)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-[#2C1810] mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Choisir un horaire
              </label>
              {availableSlots.length === 0 ? (
                <div className="text-center py-8 text-[#6B5A4E]">
                  Aucun créneau disponible pour cette date
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`py-3 rounded-xl text-center font-medium transition-all ${
                        selectedTime === slot.time
                          ? 'bg-[#F16522] text-white'
                          : slot.available
                            ? 'border border-[#EFEBE9] text-[#2C1810] hover:border-[#F16522]/50'
                            : 'bg-[#FAF7F4] text-[#A69B95] cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between gap-3 pt-6 border-t border-[#EFEBE9]">
            <button 
              type="button" 
              onClick={prevStep} 
              className="px-6 py-3 border border-[#EFEBE9] text-[#2C1810] font-semibold rounded-xl hover:bg-[#FAF7F4] transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour</span>
            </button>
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceedToStep3}
              className="px-6 py-3 bg-[#F16522] text-white font-semibold rounded-xl hover:bg-[#d9571d] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <span>Continuer</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </FormStepContent>

        {/* STEP 3: Notes & Confirmation */}
        <FormStepContent step={3} currentStep={step} slideDirection={slideDirection} className="space-y-6">
          {/* Summary */}
          <div className="bg-[#FAF7F4] rounded-xl p-4 border border-[#EFEBE9]">
            <h3 className="text-sm font-medium text-[#6B5A4E] mb-4">Récapitulatif</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B5A4E]">Type</span>
                <span className="font-semibold text-[#2C1810]">
                  {visitType === 'physique' ? 'Visite physique' : 'Visite virtuelle'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5A4E]">Date</span>
                <span className="font-semibold text-[#2C1810]">
                  {selectedDate?.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5A4E]">Heure</span>
                <span className="font-semibold text-[#F16522]">{selectedTime}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C1810] mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Notes supplémentaires (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Ajoutez des informations supplémentaires pour le propriétaire..."
              className="w-full px-4 py-3 border border-[#EFEBE9] rounded-xl focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] bg-white resize-none"
            />
          </div>

          <div className="flex justify-between gap-3 pt-6 border-t border-[#EFEBE9]">
            <button 
              type="button" 
              onClick={prevStep} 
              className="px-6 py-3 border border-[#EFEBE9] text-[#2C1810] font-semibold rounded-xl hover:bg-[#FAF7F4] transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour</span>
            </button>
            <button
              type="submit"
              disabled={!selectedDate || !selectedTime || submitting}
              className="px-6 py-3 bg-[#F16522] text-white font-semibold rounded-xl hover:bg-[#d9571d] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Check className="h-5 w-5" />
              <span>{submitting ? 'Planification...' : 'Confirmer la visite'}</span>
            </button>
          </div>
        </FormStepContent>
      </form>
    </FormPageLayout>
  );
}
