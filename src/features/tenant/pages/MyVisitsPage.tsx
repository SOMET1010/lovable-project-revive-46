import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, MapPin, Video, X, MessageCircle, Star, CheckCircle, AlertCircle, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import TenantDashboardLayout from '../components/TenantDashboardLayout';
import { logger } from '@/shared/lib/logger';
import { toast } from 'sonner';
import type { Visit, VisitFilter } from '@/types/visit.types';

export default function MyVisits() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<VisitFilter>('upcoming');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (user) {
      loadVisits();
    }
  }, [user, filter]);

  const loadVisits = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('visit_requests')
        .select(`
          id,
          property_id,
          visit_type,
          visit_date,
          visit_time,
          status,
          notes,
          feedback,
          rating,
          properties!inner(id, title, address, city, main_image)
        `)
        .eq('tenant_id', user.id)
        .order('visit_date', { ascending: false })
        .order('visit_time', { ascending: false });

      if (filter === 'upcoming') {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('visit_date', today ?? '').in('status', ['en_attente', 'confirmee']);
      } else if (filter === 'past') {
        const today = new Date().toISOString().split('T')[0];
        query = query.or(`visit_date.lt.${today},status.eq.terminee,status.eq.annulee`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedVisits: Visit[] = (data || []).map((visit) => ({
        id: visit.id,
        property_id: visit.property_id,
        visit_type: visit.visit_type || 'physique',
        visit_date: visit.visit_date,
        visit_time: visit.visit_time,
        status: visit.status || 'en_attente',
        notes: visit.notes,
        feedback: visit.feedback,
        rating: visit.rating,
        property: visit.properties
      }));

      setVisits(formattedVisits);
    } catch (error) {
      logger.error('Failed to load visits', error instanceof Error ? error : undefined, { userId: user.id, filter });
      toast.error('Erreur lors du chargement des visites');
    } finally {
      setLoading(false);
    }
  };

  const cancelVisit = async (visitId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette visite ?')) return;

    try {
      const { error } = await supabase
        .from('visit_requests')
        .update({ status: 'annulee', cancelled_at: new Date().toISOString(), cancellation_reason: 'Annulée par le visiteur' })
        .eq('id', visitId);

      if (error) throw error;
      toast.success('Visite annulée');
      loadVisits();
    } catch (error) {
      logger.error('Failed to cancel visit', error instanceof Error ? error : undefined, { visitId });
      toast.error("Erreur lors de l'annulation");
    }
  };

  const submitFeedback = async () => {
    if (!selectedVisit || rating === 0) return;

    setSubmittingFeedback(true);
    try {
      const { error } = await supabase
        .from('visit_requests')
        .update({ feedback, rating, status: 'terminee' })
        .eq('id', selectedVisit.id);

      if (error) throw error;

      toast.success('Merci pour votre avis !');
      setShowFeedbackModal(false);
      setFeedback('');
      setRating(0);
      loadVisits();
    } catch (error) {
      logger.error('Failed to submit feedback', error instanceof Error ? error : undefined, { visitId: selectedVisit.id });
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; icon: any; className: string }> = {
      en_attente: { label: 'En attente', icon: AlertCircle, className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
      confirmee: { label: 'Confirmée', icon: CheckCircle, className: 'bg-green-100 text-green-700 border border-green-200' },
      annulee: { label: 'Annulée', icon: XCircle, className: 'bg-red-100 text-red-700 border border-red-200' },
      terminee: { label: 'Terminée', icon: CheckCircle, className: 'bg-blue-100 text-blue-700 border border-blue-200' }
    };
    return configs[status] || { label: status, icon: AlertCircle, className: 'bg-[#FAF7F4] text-[#6B5A4E] border border-[#EFEBE9]' };
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (time: string) => time.slice(0, 5);

  const stats = {
    total: visits.length,
    pending: visits.filter(v => v.status === 'en_attente').length,
    confirmed: visits.filter(v => v.status === 'confirmee').length,
    completed: visits.filter(v => v.status === 'terminee').length
  };

  if (!user) {
    return (
      <TenantDashboardLayout title="Mes Visites">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#FAF7F4] flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-[#A69B95]" />
            </div>
            <h2 className="text-xl font-semibold text-[#2C1810] mb-2">Connexion requise</h2>
            <p className="text-[#6B5A4E]">Veuillez vous connecter pour voir vos visites</p>
          </div>
        </div>
      </TenantDashboardLayout>
    );
  }

  return (
    <TenantDashboardLayout title="Mes Visites">
      <div className="max-w-7xl mx-auto">
        {/* Header Premium */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F16522] to-[#D95318] flex items-center justify-center shadow-lg shadow-[#F16522]/20">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2C1810]">Mes Visites</h1>
              <p className="text-[#6B5A4E]">Gérez vos demandes et visites programmées</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-[20px] border border-[#EFEBE9] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F4] flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#6B5A4E]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2C1810]">{stats.total}</p>
                  <p className="text-xs text-[#A69B95]">Total</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[20px] border border-[#EFEBE9] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2C1810]">{stats.pending}</p>
                  <p className="text-xs text-[#A69B95]">En attente</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[20px] border border-[#EFEBE9] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2C1810]">{stats.confirmed}</p>
                  <p className="text-xs text-[#A69B95]">Confirmées</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[20px] border border-[#EFEBE9] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2C1810]">{stats.completed}</p>
                  <p className="text-xs text-[#A69B95]">Terminées</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'upcoming', label: 'À venir' },
              { value: 'past', label: 'Passées' },
              { value: 'all', label: 'Toutes' }
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value as VisitFilter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filter === item.value
                    ? 'bg-[#F16522] text-white shadow-lg shadow-[#F16522]/20'
                    : 'bg-white text-[#6B5A4E] border border-[#EFEBE9] hover:border-[#F16522] hover:text-[#F16522]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F16522]"></div>
          </div>
        ) : visits.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-[#EFEBE9] shadow-lg shadow-[#2C1810]/5 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-[#FAF7F4] flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-[#A69B95]" />
            </div>
            <h3 className="text-xl font-semibold text-[#2C1810] mb-2">Aucune visite</h3>
            <p className="text-[#6B5A4E] mb-6">Vous n'avez pas encore planifié de visite</p>
            <Link to="/recherche" className="inline-flex items-center gap-2 px-6 py-3 bg-[#F16522] hover:bg-[#D95318] text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-[#F16522]/20">
              Rechercher des biens
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => {
              const statusConfig = getStatusConfig(visit.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={visit.id} className="bg-white rounded-[24px] border border-[#EFEBE9] shadow-lg shadow-[#2C1810]/5 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-40 md:h-auto">
                      <img src={visit.property.main_image || '/placeholder-property.jpg'} alt={visit.property.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-[#2C1810] mb-2">{visit.property.title}</h3>
                          <p className="text-[#6B5A4E]">{visit.property.address}, {visit.property.city}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConfig.className}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-[#6B5A4E]">
                          <div className="w-7 h-7 rounded-full bg-[#FAF7F4] flex items-center justify-center">
                            <Calendar className="w-3.5 h-3.5 text-[#F16522]" />
                          </div>
                          <span className="text-sm">{formatDate(visit.visit_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#6B5A4E]">
                          <div className="w-7 h-7 rounded-full bg-[#FAF7F4] flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5 text-[#F16522]" />
                          </div>
                          <span className="text-sm">{formatTime(visit.visit_time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#6B5A4E]">
                          <div className="w-7 h-7 rounded-full bg-[#FAF7F4] flex items-center justify-center">
                            {visit.visit_type === 'physique' ? <MapPin className="w-3.5 h-3.5 text-[#F16522]" /> : <Video className="w-3.5 h-3.5 text-[#F16522]" />}
                          </div>
                          <span className="text-sm">{visit.visit_type === 'physique' ? 'Physique' : 'Virtuelle'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#6B5A4E]">
                          <div className="w-7 h-7 rounded-full bg-[#FAF7F4] flex items-center justify-center">
                            <MessageCircle className="w-3.5 h-3.5 text-[#F16522]" />
                          </div>
                          <span className="text-sm">Contact</span>
                        </div>
                      </div>

                      {visit.notes && (
                        <div className="bg-[#FAF7F4] rounded-xl p-3 border border-[#EFEBE9] mb-4">
                          <p className="text-xs font-medium text-[#A69B95] uppercase tracking-wider mb-1">Mes notes</p>
                          <p className="text-sm text-[#6B5A4E]">{visit.notes}</p>
                        </div>
                      )}

                      {visit.feedback && (
                        <div className="bg-green-50 rounded-xl p-3 border border-green-200 mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-green-700">Mon avis</p>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-4 h-4 ${star <= (visit.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-green-600">{visit.feedback}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <Link to={`/propriete/${visit.property_id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-[#F16522] hover:bg-[#D95318] text-white font-medium rounded-xl transition-all duration-200 text-sm">
                          Voir le bien
                        </Link>
                        {(visit.status === 'en_attente' || visit.status === 'confirmee') && (
                          <button onClick={() => cancelVisit(visit.id)} className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 text-sm font-medium">
                            Annuler
                          </button>
                        )}
                        {visit.status === 'confirmee' && !visit.feedback && (
                          <button onClick={() => { setSelectedVisit(visit); setShowFeedbackModal(true); }} className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#F16522] text-[#F16522] hover:bg-[#F16522] hover:text-white font-medium rounded-xl transition-all duration-200 text-sm">
                            <Star className="w-4 h-4" />
                            Laisser un avis
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedVisit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] border border-[#EFEBE9] shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#2C1810]">Laisser un avis</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="w-10 h-10 rounded-xl border border-[#EFEBE9] flex items-center justify-center text-[#6B5A4E] hover:bg-[#FAF7F4]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#2C1810] mb-3">Note</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                    <Star className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-[#EFEBE9]'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#2C1810] mb-2">Commentaire</label>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} placeholder="Partagez votre expérience..." className="w-full px-4 py-3 rounded-xl border border-[#EFEBE9] focus:outline-none focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] text-[#2C1810] placeholder:text-[#A69B95] resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowFeedbackModal(false)} className="flex-1 px-4 py-3 border border-[#EFEBE9] text-[#6B5A4E] font-medium rounded-xl hover:bg-[#FAF7F4]">Annuler</button>
              <button onClick={submitFeedback} disabled={rating === 0 || submittingFeedback} className="flex-1 px-4 py-3 bg-[#F16522] hover:bg-[#D95318] text-white font-medium rounded-xl disabled:opacity-50 shadow-lg shadow-[#F16522]/20">
                {submittingFeedback ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </TenantDashboardLayout>
  );
}