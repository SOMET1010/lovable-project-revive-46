import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, CheckCircle, XCircle, Eye, FileText, AlertTriangle,
  Building2, MapPin, Calendar, ArrowRight, RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';

interface PropertySubmission {
  id: string;
  title: string;
  city: string;
  status: string | null;
  created_at: string | null;
  main_image: string | null;
  monthly_rent: number;
  rejection_reason?: string;
}

const STATUS_CONFIG = {
  en_verification: {
    label: 'En vérification',
    icon: Clock,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-500'
  },
  disponible: {
    label: 'Approuvé',
    icon: CheckCircle,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    iconColor: 'text-emerald-500'
  },
  rejete: {
    label: 'Refusé',
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500'
  },
  loue: {
    label: 'Loué',
    icon: CheckCircle,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500'
  }
};

export default function MySubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<PropertySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.id) {
      loadSubmissions();
    }
  }, [user?.id]);

  const loadSubmissions = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, city, status, created_at, main_image, monthly_rent')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = filter === 'all' 
    ? submissions 
    : submissions.filter(s => s.status === filter);

  const stats = {
    total: submissions.length,
    enVerification: submissions.filter(s => s.status === 'en_verification').length,
    approuve: submissions.filter(s => s.status === 'disponible' || s.status === 'loue').length,
    rejete: submissions.filter(s => s.status === 'rejete').length
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-[#F16522] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F4]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2C1810] mb-2">
            Mes Soumissions
          </h1>
          <p className="text-[#6B5A4E]">
            Suivez le statut de validation de vos biens immobiliers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-[#EFEBE9] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F16522]/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-[#F16522]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2C1810]">{stats.total}</p>
                <p className="text-xs text-[#A69B95]">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#EFEBE9] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2C1810]">{stats.enVerification}</p>
                <p className="text-xs text-[#A69B95]">En attente</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#EFEBE9] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2C1810]">{stats.approuve}</p>
                <p className="text-xs text-[#A69B95]">Approuvés</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#EFEBE9] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2C1810]">{stats.rejete}</p>
                <p className="text-xs text-[#A69B95]">Refusés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { value: 'all', label: 'Tous' },
            { value: 'en_verification', label: 'En vérification' },
            { value: 'disponible', label: 'Approuvés' },
            { value: 'rejete', label: 'Refusés' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === opt.value
                  ? 'bg-[#F16522] text-white shadow-lg shadow-orange-500/20'
                  : 'bg-white text-[#6B5A4E] border border-[#EFEBE9] hover:border-[#F16522]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#EFEBE9]">
            <Building2 className="h-16 w-16 text-[#A69B95] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#2C1810] mb-2">
              Aucune soumission
            </h3>
            <p className="text-[#6B5A4E] mb-6">
              {filter === 'all' 
                ? "Vous n'avez pas encore soumis de bien immobilier."
                : "Aucun bien avec ce statut."}
            </p>
            {filter === 'all' && (
              <Link
                to="/ajouter-propriete"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F16522] text-white font-semibold rounded-full hover:bg-[#D95318] transition-colors"
              >
                Publier un bien
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map(submission => {
              const statusKey = submission.status || 'en_verification';
              const statusConfig = STATUS_CONFIG[statusKey as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.en_verification;
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={submission.id}
                  className={`bg-white rounded-2xl border ${statusConfig.borderColor} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="w-full md:w-48 h-32 md:h-auto relative">
                      <img
                        src={submission.main_image || '/placeholder-property.jpg'}
                        alt={submission.title}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-2 left-2 px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} text-xs font-semibold flex items-center gap-1`}>
                        <StatusIcon className={`h-3 w-3 ${statusConfig.iconColor}`} />
                        {statusConfig.label}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-[#2C1810] mb-1">
                            {submission.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-[#6B5A4E]">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {submission.city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(submission.created_at)}
                            </span>
                          </div>
                          <p className="mt-2 text-lg font-bold text-[#F16522]">
                            {formatPrice(submission.monthly_rent)} FCFA/mois
                          </p>

                          {/* Rejection reason */}
                          {submission.status === 'rejete' && submission.rejection_reason && (
                            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-red-700">Motif du refus :</p>
                                  <p className="text-sm text-red-600">{submission.rejection_reason}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row md:flex-col gap-2">
                          <Link
                            to={`/propriete/${submission.id}`}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#FAF7F4] text-[#6B5A4E] rounded-lg hover:bg-[#EFEBE9] transition-colors text-sm font-medium"
                          >
                            <Eye className="h-4 w-4" />
                            Voir
                          </Link>
                          {submission.status === 'en_verification' && (
                            <Link
                              to={`/dashboard/documents/${submission.id}`}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#F16522] text-white rounded-lg hover:bg-[#D95318] transition-colors text-sm font-medium"
                            >
                              <FileText className="h-4 w-4" />
                              Documents
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
