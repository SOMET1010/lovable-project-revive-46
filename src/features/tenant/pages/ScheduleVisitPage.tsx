import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/services/supabase/client';
import { Calendar, Clock, Video, MapPin, ArrowLeft, Check } from 'lucide-react';

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

// Static time slots since RPC doesn't exist
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
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [visitType, setVisitType] = useState<'physique' | 'virtuelle'>('physique');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

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

    // Check existing visits for the selected date
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
        window.location.href = `/propriete/${property.id}`;
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

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Connexion requise
          </h2>
          <p className="text-neutral-600 mb-4">
            Veuillez vous connecter pour planifier une visite
          </p>
          <a
            href="/connexion"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600">Propriété non trouvée</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Visite planifiée avec succès !
          </h2>
          <p className="text-neutral-600 mb-4">
            Vous recevrez une confirmation par email
          </p>
          <p className="text-sm text-neutral-500">
            Redirection en cours...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="flex items-center space-x-4 p-6">
            {property.main_image && (
              <img
                src={property.main_image}
                alt={property.title}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                Planifier une visite
              </h1>
              <p className="text-neutral-600">{property.title}</p>
              <p className="text-sm text-neutral-500">{property.address || ''}, {property.city}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              Type de visite
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setVisitType('physique')}
                className={`p-4 rounded-lg border-2 transition ${
                  visitType === 'physique'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <MapPin className={`w-8 h-8 mx-auto mb-2 ${
                  visitType === 'physique' ? 'text-primary-500' : 'text-neutral-400'
                }`} />
                <p className="font-semibold text-neutral-900">Visite physique</p>
                <p className="text-xs text-neutral-500 mt-1">Visitez le bien en personne</p>
              </button>
              <button
                type="button"
                onClick={() => setVisitType('virtuelle')}
                className={`p-4 rounded-lg border-2 transition ${
                  visitType === 'virtuelle'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <Video className={`w-8 h-8 mx-auto mb-2 ${
                  visitType === 'virtuelle' ? 'text-primary-500' : 'text-neutral-400'
                }`} />
                <p className="font-semibold text-neutral-900">Visite virtuelle</p>
                <p className="text-xs text-neutral-500 mt-1">Visitez par vidéo conférence</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              <Calendar className="w-4 h-4 inline mr-2" />
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
                  className={`p-3 rounded-lg border-2 transition text-center ${
                    selectedDate?.toDateString() === date.toDateString()
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <p className={`text-sm font-semibold ${
                    selectedDate?.toDateString() === date.toDateString()
                      ? 'text-primary-600'
                      : 'text-neutral-900'
                  }`}>
                    {formatDate(date)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                <Clock className="w-4 h-4 inline mr-2" />
                Choisir un horaire
              </label>
              {availableSlots.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
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
                      className={`p-3 rounded-lg border-2 transition ${
                        selectedTime === slot.time
                          ? 'border-primary-500 bg-primary-50 text-primary-600'
                          : slot.available
                          ? 'border-neutral-200 hover:border-neutral-300 text-neutral-900'
                          : 'border-neutral-100 bg-neutral-50 text-neutral-400 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Notes supplémentaires (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Ajoutez des informations supplémentaires pour le propriétaire..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!selectedDate || !selectedTime || submitting}
              className="px-8 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Planification...' : 'Confirmer la visite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
