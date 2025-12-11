import { useState, useEffect } from 'react';
import { Calendar, Check, X, User, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { toast } from 'sonner';

interface PaymentPlan {
  id: string;
  lease_id: string;
  tenant_id: string;
  total_amount: number;
  fees: number;
  installments: Array<{
    number: number;
    amount: number;
    due_date: string;
    status: string;
  }>;
  reason: string;
  status: string;
  requested_at: string;
  tenant_profile?: {
    full_name: string;
    trust_score: number;
    avatar_url: string | null;
  };
  property?: {
    title: string;
    address: string;
  };
}

export default function PaymentPlansApprovalPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    if (user?.id) {
      loadPlans();
    }
  }, [user?.id, filter]);

  const loadPlans = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('payment_plans')
        .select(`
          *,
          lease_contracts(
            property_id,
            properties(title, address)
          )
        `)
        .eq('owner_id', user.id)
        .order('requested_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('status', 'pending');
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with tenant profiles
      const enrichedPlans = await Promise.all(
        (data || []).map(async (plan) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, trust_score, avatar_url')
            .eq('user_id', plan.tenant_id)
            .single();

          return {
            ...plan,
            tenant_profile: profile || undefined,
            property: (plan.lease_contracts as { properties: { title: string; address: string } })?.properties,
          };
        })
      );

      setPlans(enrichedPlans as unknown as PaymentPlan[]);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (planId: string, decision: 'approve' | 'reject') => {
    if (!user?.id) return;
    
    if (decision === 'reject' && !rejectReason.trim()) {
      toast.error('Veuillez indiquer un motif de refus');
      return;
    }

    setProcessingId(planId);
    try {
      const { error } = await supabase.functions.invoke('process-payment-plan', {
        body: {
          action: 'decide',
          planId,
          ownerId: user.id,
          decision,
          decisionReason: decision === 'reject' ? rejectReason : undefined,
        },
      });

      if (error) throw error;

      toast.success(decision === 'approve' ? 'Échéancier approuvé' : 'Échéancier refusé');
      setShowRejectModal(null);
      setRejectReason('');
      loadPlans();
    } catch (error) {
      console.error('Error processing decision:', error);
      toast.error('Erreur lors du traitement');
    } finally {
      setProcessingId(null);
    }
  };

  const getRecommendation = (plan: PaymentPlan) => {
    const score = plan.tenant_profile?.trust_score || 0;
    if (score >= 85) {
      return { text: 'Recommandé', color: 'text-green-600 bg-green-50', icon: '✓' };
    }
    if (score >= 70) {
      return { text: 'Acceptable', color: 'text-orange-600 bg-orange-50', icon: '⚠' };
    }
    return { text: 'À évaluer', color: 'text-red-600 bg-red-50', icon: '!' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-7 h-7" />
              Demandes d'échéancier
            </h1>
            <p className="text-muted-foreground mt-1">
              Validez ou refusez les demandes de paiement en plusieurs fois
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'pending' ? 'primary' : 'outline'}
              size="small"
              onClick={() => setFilter('pending')}
            >
              En attente
            </Button>
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="small"
              onClick={() => setFilter('all')}
            >
              Toutes
            </Button>
          </div>
        </div>

        {/* Plans List */}
        {plans.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {filter === 'pending'
                  ? 'Aucune demande en attente'
                  : 'Aucune demande d\'échéancier'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => {
              const recommendation = getRecommendation(plan);
              const installments = plan.installments as PaymentPlan['installments'];

              return (
                <Card key={plan.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="p-4 border-b flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {plan.tenant_profile?.avatar_url ? (
                            <img
                              src={plan.tenant_profile.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {plan.tenant_profile?.full_name || 'Locataire'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {plan.property?.title}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          plan.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          plan.status === 'approved' ? 'bg-green-100 text-green-700' :
                          plan.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {plan.status === 'pending' ? 'En attente' :
                           plan.status === 'approved' ? 'Approuvé' :
                           plan.status === 'rejected' ? 'Refusé' : plan.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(plan.requested_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30">
                      <div>
                        <p className="text-xs text-muted-foreground">Montant total</p>
                        <p className="font-bold">{plan.total_amount.toLocaleString()} F</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Versements</p>
                        <p className="font-bold">{installments.length}x</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Score locataire</p>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="font-bold">{plan.tenant_profile?.trust_score || 0}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Recommandation</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${recommendation.color}`}>
                          {recommendation.icon} {recommendation.text}
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    {plan.reason && (
                      <div className="px-4 py-3 border-t">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Motif: </span>
                          {plan.reason}
                        </p>
                      </div>
                    )}

                    {/* Schedule */}
                    <div className="px-4 py-3 border-t">
                      <p className="text-sm font-medium mb-2">Calendrier proposé</p>
                      <div className="flex flex-wrap gap-2">
                        {installments.map((inst) => (
                          <div key={inst.number} className="px-3 py-1 bg-muted rounded text-sm">
                            <span className="text-muted-foreground">#{inst.number}</span>
                            <span className="mx-2">•</span>
                            <span>{inst.amount.toLocaleString()} F</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(inst.due_date).toLocaleDateString('fr-FR')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    {plan.status === 'pending' && (
                      <div className="p-4 border-t flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleDecision(plan.id, 'approve')}
                          disabled={processingId === plan.id}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approuver
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 text-red-600 hover:bg-red-50"
                          onClick={() => setShowRejectModal(plan.id)}
                          disabled={processingId === plan.id}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Refuser
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Motif du refus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Expliquez pourquoi vous refusez cette demande..."
                  className="w-full p-3 border rounded-lg bg-background min-h-24 resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowRejectModal(null);
                      setRejectReason('');
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => handleDecision(showRejectModal, 'reject')}
                    disabled={processingId === showRejectModal || !rejectReason.trim()}
                  >
                    Confirmer le refus
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
