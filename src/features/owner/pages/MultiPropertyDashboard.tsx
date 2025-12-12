import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, TrendingUp, AlertTriangle, Clock, CheckCircle, 
  ChevronRight, Calendar, DollarSign, Users, Bell
} from 'lucide-react';
import { Button, Card, CardContent } from '@/shared/ui';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import OwnerDashboardLayout from '../components/OwnerDashboardLayout';

interface PropertySummary {
  total_properties: number;
  rented_properties: number;
  vacant_properties: number;
  expected_monthly_revenue: number;
  on_time_count: number;
  minor_delay_count: number;
  major_delay_count: number;
}

interface PropertyWithLease {
  id: string;
  title: string;
  address: string;
  city: string;
  monthly_rent: number;
  status: string;
  main_image: string | null;
  lease_contracts: Array<{
    id: string;
    tenant_id: string;
    monthly_rent: number;
    next_payment_due_date: string | null;
    status: string;
  }>;
  tenant_profile?: {
    full_name: string;
    trust_score: number;
  };
}

export default function MultiPropertyDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PropertySummary | null>(null);
  const [properties, setProperties] = useState<PropertyWithLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingPlans, setPendingPlans] = useState(0);
  const [pendingPostponements, setPendingPostponements] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Get summary via RPC
      const { data: summaryData } = await supabase.rpc('get_owner_properties_summary', {
        p_owner_id: user.id,
      });
      setSummary(summaryData as unknown as PropertySummary);

      // Get properties with leases
      const { data: propertiesData } = await supabase
        .from('properties')
        .select(`
          id, title, address, city, monthly_rent, status, main_image,
          lease_contracts(id, tenant_id, monthly_rent, next_payment_due_date, status)
        `)
        .eq('owner_id', user.id);

      if (propertiesData) {
        // Enrich with tenant profiles
        const enrichedProperties = await Promise.all(
          propertiesData.map(async (prop) => {
            const activeLease = prop.lease_contracts?.find((l) => l.status === 'active');
            if (activeLease?.tenant_id) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, trust_score')
                .eq('user_id', activeLease.tenant_id)
                .single();
              return { ...prop, tenant_profile: profile || undefined };
            }
            return prop;
          })
        );
        setProperties(enrichedProperties as PropertyWithLease[]);
      }

      // Get pending actions count
      const { count: plansCount } = await supabase
        .from('payment_plans')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('status', 'pending');
      setPendingPlans(plansCount || 0);

      const { count: postponementsCount } = await supabase
        .from('postponement_requests')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('status', 'pending');
      setPendingPostponements(postponementsCount || 0);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = (property: PropertyWithLease) => {
    const activeLease = property.lease_contracts?.find((l) => l.status === 'active');
    if (!activeLease) return { status: 'vacant', label: 'Vacant', color: 'bg-muted' };
    
    if (!activeLease.next_payment_due_date) {
      return { status: 'ok', label: 'À jour', color: 'bg-green-500' };
    }

    const dueDate = new Date(activeLease.next_payment_due_date);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) return { status: 'ok', label: 'À jour', color: 'bg-green-500' };
    if (daysDiff <= 4) return { status: 'minor', label: `${daysDiff}j retard`, color: 'bg-yellow-500' };
    return { status: 'major', label: `${daysDiff}j retard`, color: 'bg-red-500' };
  };

  if (loading) {
    return (
      <OwnerDashboardLayout title="Tableau de bord Multi-Biens">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#EFEBE9] rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-[#EFEBE9] rounded-xl"></div>
            ))}
          </div>
        </div>
      </OwnerDashboardLayout>
    );
  }

  return (
    <OwnerDashboardLayout title="Tableau de bord Multi-Biens">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Tableau de bord Multi-Biens
            </h1>
            <p className="text-muted-foreground mt-1">
              Vue consolidée de tous vos biens et paiements
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard/parametres-notifications">
              <Button variant="outline" size="small">
                <Bell className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
            </Link>
            <Link to="/dashboard/finances">
              <Button size="small">
                <TrendingUp className="w-4 h-4 mr-2" />
                Finances
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Biens</p>
                  <p className="text-2xl font-bold">{summary?.total_properties || 0}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {summary?.rented_properties || 0} loués • {summary?.vacant_properties || 0} vacants
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenus attendus</p>
                  <p className="text-xl font-bold">
                    {(summary?.expected_monthly_revenue || 0).toLocaleString()} F
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">À jour</p>
                  <p className="text-2xl font-bold text-green-600">
                    {summary?.on_time_count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En retard</p>
                  <p className="text-2xl font-bold text-red-600">
                    {(summary?.minor_delay_count || 0) + (summary?.major_delay_count || 0)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {summary?.minor_delay_count || 0} mineurs • {summary?.major_delay_count || 0} graves
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Actions */}
        {(pendingPlans > 0 || pendingPostponements > 0) && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">Actions en attente</h3>
              </div>
              <div className="flex flex-wrap gap-4">
                {pendingPlans > 0 && (
                  <Link to="/dashboard/echeanciers" className="flex items-center gap-2 text-orange-700 hover:underline">
                    <span>{pendingPlans} demande(s) d'échéancier</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
                {pendingPostponements > 0 && (
                  <Link to="/dashboard/reports" className="flex items-center gap-2 text-orange-700 hover:underline">
                    <span>{pendingPostponements} demande(s) de report</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Properties Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Mes biens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => {
              const paymentStatus = getPaymentStatus(property);
              const activeLease = property.lease_contracts?.find((l) => l.status === 'active');

              return (
                <Link key={property.id} to={`/dashboard/bien/${property.id}/paiements`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative h-32 bg-muted rounded-t-lg overflow-hidden">
                      {property.main_image ? (
                        <img
                          src={property.main_image}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs text-white ${paymentStatus.color}`}>
                        {paymentStatus.label}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">{property.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {property.address}, {property.city}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-bold text-primary">
                          {property.monthly_rent?.toLocaleString()} F/mois
                        </span>
                        {activeLease && property.tenant_profile && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span className="truncate max-w-20">
                              {property.tenant_profile.full_name?.split(' ')[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      {activeLease?.next_payment_due_date && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Échéance: {new Date(activeLease.next_payment_due_date).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </OwnerDashboardLayout>
  );
}
