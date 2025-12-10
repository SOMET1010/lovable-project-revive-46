/**
 * AvailabilitiesPage - Gestion des créneaux de visite pour les propriétaires
 * Permet de créer, modifier et supprimer des créneaux de disponibilité
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, ArrowLeft, Plus, Trash2, Clock, MapPin, Video, 
  Home, ChevronLeft, ChevronRight, Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, parseISO, setHours, setMinutes, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Property {
  id: string;
  title: string;
  city: string;
  main_image: string | null;
}

interface VisitSlot {
  id: string;
  property_id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number | null;
  is_booked: boolean | null;
  booked_by: string | null;
  visit_type: string | null;
  notes: string | null;
}

export default function AvailabilitiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [slots, setSlots] = useState<VisitSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state pour nouveau créneau
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '09:00',
    endTime: '09:30',
    visitType: 'physical' as 'physical' | 'virtual',
    recurring: false,
    recurringDays: [] as number[]
  });

  useEffect(() => {
    if (user) loadProperties();
  }, [user]);

  useEffect(() => {
    if (selectedProperty) loadSlots();
  }, [selectedProperty, weekOffset]);

  const loadProperties = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, city, main_image')
        .eq('owner_id', user.id)
        .eq('status', 'disponible');

      if (error) throw error;
      setProperties(data || []);
      if (data && data.length > 0 && data[0]) {
        setSelectedProperty(data[0].id);
      }
    } catch {
      toast.error('Erreur lors du chargement des propriétés');
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    if (!selectedProperty || !user) return;

    const weekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7);
    const weekEnd = addDays(weekStart, 7);

    try {
      const { data, error } = await supabase
        .from('visit_slots')
        .select('*')
        .eq('property_id', selectedProperty)
        .eq('owner_id', user.id)
        .gte('start_time', weekStart.toISOString())
        .lt('start_time', weekEnd.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSlots(data || []);
    } catch {
      toast.error('Erreur lors du chargement des créneaux');
    }
  };

  const createSlot = async () => {
    if (!selectedProperty || !user || !newSlot.date) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const startDateTime = new Date(`${newSlot.date}T${newSlot.startTime}:00`);
    const endDateTime = new Date(`${newSlot.date}T${newSlot.endTime}:00`);

    if (!isAfter(endDateTime, startDateTime)) {
      toast.error('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    if (!isAfter(startDateTime, new Date())) {
      toast.error('Le créneau doit être dans le futur');
      return;
    }

    try {
      const slotsToCreate = [];

      if (newSlot.recurring && newSlot.recurringDays.length > 0) {
        // Créer des créneaux récurrents pour les 4 prochaines semaines
        for (let week = 0; week < 4; week++) {
          for (const dayOfWeek of newSlot.recurringDays) {
            const baseDate = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), week * 7 + dayOfWeek);
            const [startH, startM] = newSlot.startTime.split(':');
            const [endH, endM] = newSlot.endTime.split(':');
            const slotStart = setMinutes(setHours(baseDate, parseInt(startH || '9')), parseInt(startM || '0'));
            const slotEnd = setMinutes(setHours(baseDate, parseInt(endH || '10')), parseInt(endM || '0'));

            if (isAfter(slotStart, new Date())) {
              slotsToCreate.push({
                property_id: selectedProperty,
                owner_id: user.id,
                start_time: slotStart.toISOString(),
                end_time: slotEnd.toISOString(),
                duration_minutes: Math.round((slotEnd.getTime() - slotStart.getTime()) / 60000),
                visit_type: newSlot.visitType,
                is_booked: false
              });
            }
          }
        }
      } else {
        slotsToCreate.push({
          property_id: selectedProperty,
          owner_id: user.id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          duration_minutes: Math.round((endDateTime.getTime() - startDateTime.getTime()) / 60000),
          visit_type: newSlot.visitType,
          is_booked: false
        });
      }

      const { error } = await supabase
        .from('visit_slots')
        .insert(slotsToCreate);

      if (error) throw error;

      toast.success(`${slotsToCreate.length} créneau(x) créé(s)`);
      setShowAddModal(false);
      setNewSlot({
        date: '',
        startTime: '09:00',
        endTime: '09:30',
        visitType: 'physical',
        recurring: false,
        recurringDays: []
      });
      loadSlots();
    } catch {
      toast.error('Erreur lors de la création');
    }
  };

  const deleteSlot = async (slotId: string) => {
    if (!confirm('Supprimer ce créneau ?')) return;

    try {
      const { error } = await supabase
        .from('visit_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;
      toast.success('Créneau supprimé');
      loadSlots();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const weekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Grouper les créneaux par jour
  const slotsByDay: Record<string, VisitSlot[]> = {};
  slots.forEach(slot => {
    const day = format(parseISO(slot.start_time), 'yyyy-MM-dd');
    if (!slotsByDay[day]) slotsByDay[day] = [];
    slotsByDay[day].push(slot);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link to="/dashboard/proprietaire" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mes disponibilités</h1>
              <p className="text-muted-foreground">
                Gérez les créneaux de visite pour vos propriétés
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {properties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-border">
            <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune propriété</h3>
            <p className="text-muted-foreground mb-4">
              Ajoutez une propriété pour configurer vos disponibilités
            </p>
            <Link
              to="/dashboard/ajouter-propriete"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une propriété
            </Link>
          </div>
        ) : (
          <>
            {/* Sélecteur de propriété */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Propriété</label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-border rounded-lg bg-white"
              >
                {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>
                    {prop.title} - {prop.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekOffset(w => w - 1)}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-medium">
                  {format(weekStart, 'dd MMM', { locale: fr })} - {format(addDays(weekStart, 6), 'dd MMM yyyy', { locale: fr })}
                </span>
                <button
                  onClick={() => setWeekOffset(w => w + 1)}
                  disabled={weekOffset >= 8}
                  className="p-2 hover:bg-muted rounded-lg disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Ajouter un créneau
              </button>
            </div>

            {/* Calendrier */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="grid grid-cols-7">
                {/* Headers */}
                {weekDays.map((day, i) => (
                  <div key={i} className="p-3 text-center border-b border-r border-border last:border-r-0 bg-muted/30">
                    <p className="text-xs text-muted-foreground uppercase">
                      {format(day, 'EEE', { locale: fr })}
                    </p>
                    <p className="text-lg font-semibold">{format(day, 'd')}</p>
                  </div>
                ))}

                {/* Créneaux */}
                {weekDays.map((day, dayIndex) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const daySlots = slotsByDay[dayKey] || [];
                  const isPast = !isAfter(day, new Date());

                  return (
                    <div
                      key={dayIndex}
                      className={`min-h-[150px] p-2 border-r border-border last:border-r-0 ${isPast ? 'bg-muted/20' : ''}`}
                    >
                      {daySlots.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center mt-8">
                          {isPast ? '-' : 'Aucun créneau'}
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {daySlots.map(slot => (
                            <div
                              key={slot.id}
                              className={`p-2 rounded-lg text-xs ${
                                slot.is_booked
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(parseISO(slot.start_time), 'HH:mm')}
                                </span>
                                <div className="flex items-center gap-1">
                                  {slot.visit_type === 'virtual' ? (
                                    <Video className="w-3 h-3 text-blue-500" />
                                  ) : (
                                    <MapPin className="w-3 h-3" />
                                  )}
                                  {!slot.is_booked && !isPast && (
                                    <button
                                      onClick={() => deleteSlot(slot.id)}
                                      className="p-0.5 hover:bg-red-200 rounded"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-600" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              {slot.is_booked && (
                                <p className="text-[10px] mt-0.5">Réservé</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{slots.length}</p>
                <p className="text-sm text-muted-foreground">Créneaux cette semaine</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {slots.filter(s => !s.is_booked).length}
                </p>
                <p className="text-sm text-muted-foreground">Disponibles</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {slots.filter(s => s.is_booked).length}
                </p>
                <p className="text-sm text-muted-foreground">Réservés</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal ajout créneau */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Nouveau créneau
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={newSlot.date}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setNewSlot(p => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Début</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot(p => ({ ...p, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fin</label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot(p => ({ ...p, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type de visite</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSlot(p => ({ ...p, visitType: 'physical' }))}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                      newSlot.visitType === 'physical'
                        ? 'bg-primary text-white'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    Physique
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSlot(p => ({ ...p, visitType: 'virtual' }))}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                      newSlot.visitType === 'virtual'
                        ? 'bg-primary text-white'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Virtuel
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newSlot.recurring}
                  onChange={(e) => setNewSlot(p => ({ ...p, recurring: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="recurring" className="text-sm">
                  Répéter chaque semaine (4 semaines)
                </label>
              </div>

              {newSlot.recurring && (
                <div>
                  <label className="block text-sm font-medium mb-2">Jours de répétition</label>
                  <div className="flex flex-wrap gap-2">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setNewSlot(p => ({
                            ...p,
                            recurringDays: p.recurringDays.includes(i)
                              ? p.recurringDays.filter(d => d !== i)
                              : [...p.recurringDays, i]
                          }));
                        }}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          newSlot.recurringDays.includes(i)
                            ? 'bg-primary text-white'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 border border-border rounded-lg hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={createSlot}
                className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
