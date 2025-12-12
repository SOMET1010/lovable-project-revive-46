import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, Video, Home } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { formatAddress } from '@/shared/utils/address';

type VisitsMode = 'owner' | 'agency';
type Filter = 'all' | 'upcoming' | 'past';

interface VisitRow {
  id: string;
  visit_date: string;
  visit_time: string | null;
  visit_type: string | null;
  status: string | null;
  notes: string | null;
  tenant_id?: string | null;
  confirmed_date?: string | null;
  property: {
    id: string;
    title: string | null;
    city: string | null;
    address: any;
    main_image: string | null;
  } | null;
  tenant?: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

interface TenantProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  annulee: 'Annulée',
  terminee: 'Terminée',
};

const STATUS_STYLES: Record<string, string> = {
  en_attente: 'bg-amber-100 text-amber-700',
  confirmee: 'bg-green-100 text-green-700',
  annulee: 'bg-red-100 text-red-700',
  terminee: 'bg-blue-100 text-blue-700',
};

function VisitsPage({ mode }: { mode: VisitsMode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [visits, setVisits] = useState<VisitRow[]>([]);

  useEffect(() => {
    if (!user) return;
    loadVisits();
  }, [user]);

  const loadVisits = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('visit_requests')
        .select(
          `
          id,
          confirmed_date,
          visit_type,
          status,
          notes,
          tenant_id,
          property:properties (
            id,
            title,
            city,
            address,
            main_image
          )
        `
        )
        .eq('owner_id', user.id)
        .order('confirmed_date', { ascending: true });

      if (error) throw error;

      const rows = ((data as VisitRow[]) || []).map((row) => {
        const confirmed = (row as any).confirmed_date || '';
        const [d, t] = confirmed ? confirmed.split('T') : ['', ''];
        const date = d || '';
        const time = t ? t.replace('Z', '') : null;
        return {
          ...row,
          visit_date: date,
          visit_time: time,
        };
      });

      // Récupérer les profils des locataires si besoin
      const tenantIds = Array.from(
        new Set(rows.map((row) => row.tenant_id).filter((id): id is string => !!id))
      );
      let tenantsMap = new Map<string, TenantProfile>();
      if (tenantIds.length > 0) {
        const { data: tenantsData, error: tenantsError } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone')
          .in('id', tenantIds);
        if (!tenantsError && tenantsData) {
          tenantsMap = new Map(tenantsData.map((t) => [t.id, t]));
        }
      }

      const enriched = rows.map((row) => ({
        ...row,
        tenant: row.tenant_id ? tenantsMap.get(row.tenant_id) || null : null,
      }));

      setVisits(enriched);
    } catch (err) {
      console.error('Erreur lors du chargement des visites', err);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVisits = useMemo(() => {
    if (filter === 'all') return visits;

    const now = new Date();
    return visits.filter((visit) => {
      const visitDate = new Date(`${visit.visit_date}T${visit.visit_time || '12:00'}`);
      if (filter === 'upcoming') {
        return (
          visitDate >= now &&
          (visit.status === 'en_attente' || visit.status === 'confirmee' || !visit.status)
        );
      }
      return visitDate < now || visit.status === 'terminee' || visit.status === 'annulee';
    });
  }, [filter, visits]);

  const stats = useMemo(() => {
    const upcoming = visits.filter((v) => {
      const date = new Date(`${v.visit_date}T${v.visit_time || '12:00'}`);
      return date >= new Date() && v.status !== 'annulee';
    }).length;
    const past = visits.length - upcoming;
    const cancelled = visits.filter((v) => v.status === 'annulee').length;
    return { total: visits.length, upcoming, past, cancelled };
  }, [visits]);

  const title = mode === 'agency' ? 'Visites programmées' : 'Mes visites programmées';
  const subtitle =
    mode === 'agency'
      ? 'Consultez les visites prévues pour les biens de votre agence'
      : 'Suivez les visites planifiées pour vos propriétés';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#2C1810] dashboard-header-animate rounded-2xl px-4 sm:px-6 lg:px-8 py-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#F16522] flex items-center justify-center icon-pulse-premium shadow-md">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
              <p className="text-[#E8D4C5] mt-1">{subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-xl font-semibold ${
                filter === 'upcoming'
                  ? 'bg-white text-[#F16522]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              À venir
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-xl font-semibold ${
                filter === 'past'
                  ? 'bg-white text-[#F16522]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Passées/annulées
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-semibold ${
                filter === 'all'
                  ? 'bg-white text-[#F16522]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Toutes
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="À venir" value={stats.upcoming} />
        <StatCard label="Passées" value={stats.past} />
        <StatCard label="Annulées" value={stats.cancelled} />
      </div>

      {/* List */}
      <div className="bg-white rounded-[20px] border border-[#EFEBE9] overflow-hidden">
        <div className="p-6 border-b border-[#EFEBE9] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#2C1810]">Visites</h2>
            <p className="text-[#6B5A4E] mt-1">
              {filteredVisits.length} visite{filteredVisits.length > 1 ? 's' : ''} affichée
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F16522]" />
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="text-center py-12 px-6 text-[#6B5A4E]">
            <Calendar className="h-12 w-12 text-[#6B5A4E] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#2C1810] mb-2">Aucune visite</h3>
            <p className="max-w-md mx-auto">
              {filter === 'upcoming'
                ? 'Aucune visite programmée pour le moment.'
                : 'Aucune visite correspondant à ce filtre.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EFEBE9]">
            {filteredVisits.map((visit) => {
              const statusKey = visit.status || 'en_attente';
              const formattedDate = new Date(
                `${visit.visit_date}T${visit.visit_time || '12:00'}`
              ).toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={visit.id} className="p-6 hover:bg-[#FAF7F4] transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#F16522]/10 flex items-center justify-center">
                          <Home className="h-6 w-6 text-[#F16522]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#2C1810]">
                            {visit.property?.title || 'Propriété'}
                          </h3>
                          <p className="text-[#6B5A4E] flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {visit.property?.address
                              ? formatAddress(visit.property.address)
                              : visit.property?.city || 'Adresse non renseignée'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#6B5A4E]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {visit.visit_type === 'virtuelle' ? 'Visite virtuelle' : 'En physique'}
                          </span>
                        </div>
                        {visit.notes && (
                          <div className="sm:col-span-2 flex items-center gap-2">
                            <MessageIcon />
                            <span className="truncate">{visit.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[220px]">
                      <span
                        className={`inline-flex items-center gap-2 w-fit px-4 py-2 rounded-full text-sm font-semibold ${STATUS_STYLES[statusKey] || STATUS_STYLES['en_attente']}`}
                      >
                        {statusKey === 'en_attente' ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <Calendar className="h-4 w-4" />
                        )}
                        {STATUS_LABELS[statusKey] || statusKey}
                      </span>

                      <div className="bg-[#FAF7F4] border border-[#EFEBE9] rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2 text-[#2C1810] font-semibold">
                          <User className="h-4 w-4" />
                          <span>{visit.tenant?.full_name || 'Candidat inconnu'}</span>
                        </div>
                        {visit.tenant?.email && (
                          <div className="flex items-center gap-2 text-sm text-[#6B5A4E]">
                            <Mail className="h-4 w-4" />
                            <span>{visit.tenant.email}</span>
                          </div>
                        )}
                        {visit.tenant?.phone && (
                          <div className="flex items-center gap-2 text-sm text-[#6B5A4E]">
                            <Phone className="h-4 w-4" />
                            <span>{visit.tenant.phone}</span>
                          </div>
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
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-[20px] p-6 border border-[#EFEBE9] card-animate-in card-hover-premium">
      <div className="flex items-center gap-2 text-sm text-[#6B5A4E] mb-2">{label}</div>
      <p className="text-3xl font-bold text-[#2C1810]">{value}</p>
    </div>
  );
}

function MessageIcon() {
  return <Video className="h-4 w-4 text-[#6B5A4E]" />;
}

export default function OwnerVisitsPage() {
  return <VisitsPage mode="owner" />;
}

export function AgencyVisitsPage() {
  return <VisitsPage mode="agency" />;
}
