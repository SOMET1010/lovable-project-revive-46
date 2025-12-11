import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Calculator, FileText, AlertTriangle, Check } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from '@/shared/ui';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { toast } from 'sonner';

interface LeaseDetails {
  id: string;
  monthly_rent: number;
  property: {
    title: string;
    address: string;
  };
  owner_id: string;
}

export default function PaymentPlanRequestPage() {
  const { leaseId } = useParams<{ leaseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lease, setLease] = useState<LeaseDetails | null>(null);
  const [installments, setInstallments] = useState(3);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (leaseId) {
      loadLeaseDetails();
    }
  }, [leaseId]);

  const loadLeaseDetails = async () => {
    if (!leaseId) return;
    
    try {
      const { data, error } = await supabase
        .from('lease_contracts')
        .select(`
          id,
          monthly_rent,
          owner_id,
          properties(title, address)
        `)
        .eq('id', leaseId)
        .single();

      if (error) throw error;
      setLease({
        id: data.id,
        monthly_rent: data.monthly_rent,
        owner_id: data.owner_id,
        property: data.properties as { title: string; address: string },
      });
    } catch (error) {
      console.error('Error loading lease:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const calculateSchedule = () => {
    if (!lease) return [];
    
    const fees = lease.monthly_rent * 0.03;
    const total = lease.monthly_rent + fees;
    const perInstallment = Math.ceil(total / installments);
    
    const schedule = [];
    const today = new Date();
    
    for (let i = 0; i < installments; i++) {
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + (i + 1) * 15);
      
      schedule.push({
        number: i + 1,
        amount: i === installments - 1 ? total - (perInstallment * (installments - 1)) : perInstallment,
        dueDate: dueDate.toLocaleDateString('fr-FR'),
      });
    }
    
    return schedule;
  };

  const handleSubmit = async () => {
    if (!lease || !user?.id || !reason.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-payment-plan', {
        body: {
          action: 'create',
          leaseId: lease.id,
          installments,
          reason: reason.trim(),
        },
      });

      if (error) throw error;

      if (data.autoApproved) {
        toast.success('Votre échéancier a été automatiquement approuvé !');
      } else {
        toast.success('Demande envoyée ! Le propriétaire va l\'examiner.');
      }
      
      navigate('/mes-echeanciers');
    } catch (error) {
      console.error('Error submitting plan:', error);
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
          <h1 className="text-xl font-semibold">Bail non trouvé</h1>
          <p className="text-muted-foreground mt-2">
            Impossible de charger les détails du bail.
          </p>
        </div>
      </div>
    );
  }

  const schedule = calculateSchedule();
  const fees = lease.monthly_rent * 0.03;
  const total = lease.monthly_rent + fees;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-7 h-7" />
            Demande d'échéancier
          </h1>
          <p className="text-muted-foreground mt-1">
            Proposez un plan de paiement en plusieurs fois
          </p>
        </div>

        {/* Property Info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold">{lease.property.title}</h3>
            <p className="text-sm text-muted-foreground">{lease.property.address}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-muted-foreground">Loyer mensuel</span>
              <span className="font-bold">{lease.monthly_rent.toLocaleString()} FCFA</span>
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Configuration de l'échéancier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nombre de versements</Label>
              <div className="flex gap-2 mt-2">
                {[2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => setInstallments(num)}
                    className={`flex-1 py-3 rounded-lg border text-center transition-colors ${
                      installments === num
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {num}x
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Motif de la demande *</Label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Expliquez brièvement votre situation..."
                className="w-full mt-2 p-3 border rounded-lg bg-background min-h-24 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {reason.length}/500 caractères
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Loyer</span>
              <span>{lease.monthly_rent.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm text-orange-600">
              <span>Frais d'échéancier (3%)</span>
              <span>+{fees.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-3">
              <span>Total à payer</span>
              <span>{total.toLocaleString()} FCFA</span>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-3">Calendrier des versements</p>
              <div className="space-y-2">
                {schedule.map((item) => (
                  <div key={item.number} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                        {item.number}
                      </span>
                      <span className="text-sm">{item.dueDate}</span>
                    </div>
                    <span className="font-medium">{item.amount.toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Comment ça marche ?</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Votre demande sera envoyée au propriétaire</li>
                <li>Si votre score de confiance est élevé, l'approbation peut être automatique</li>
                <li>Une fois approuvé, vous recevrez les dates de paiement</li>
                <li>Respectez les échéances pour maintenir votre score</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            Annuler
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={submitting || !reason.trim()}
          >
            {submitting ? (
              <span className="animate-spin mr-2">⏳</span>
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Envoyer la demande
          </Button>
        </div>
      </div>
    </div>
  );
}
