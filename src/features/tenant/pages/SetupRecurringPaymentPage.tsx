import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { 
  CreditCard, 
  Calendar, 
  Smartphone,
  Shield,
  CheckCircle,
  ArrowLeft,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from '@/shared/ui';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const MOBILE_PROVIDERS = [
  { value: 'orange_money', label: 'Orange Money', color: '#FF6600' },
  { value: 'mtn_money', label: 'MTN Mobile Money', color: '#FFCC00' },
  { value: 'moov_money', label: 'Moov Money', color: '#0066CC' },
  { value: 'wave', label: 'Wave', color: '#1DC9FF' },
];

interface PaymentSchedule {
  id: string;
  contract_id: string;
  amount: number;
  payment_day: number;
  mobile_money_number: string | null;
  mobile_money_provider: string | null;
  is_active: boolean;
  next_payment_date: string | null;
  contract?: {
    contract_number: string;
    monthly_rent: number;
    property?: {
      title: string;
    };
  };
}

export default function SetupRecurringPaymentPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedContract, setSelectedContract] = useState<string>('');
  const [provider, setProvider] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch tenant's active contracts
  const { data: contracts = [] } = useQuery({
    queryKey: ['tenant-contracts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('lease_contracts')
        .select(`
          id,
          contract_number,
          monthly_rent,
          payment_day,
          property:properties(title)
        `)
        .eq('tenant_id', user.id)
        .eq('status', 'actif');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch existing payment schedules
  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ['payment-schedules', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('payment_schedules')
        .select(`
          *,
          contract:lease_contracts(
            contract_number,
            monthly_rent,
            property:properties(title)
          )
        `)
        .eq('tenant_id', user.id);

      if (error) throw error;
      return data as PaymentSchedule[];
    },
    enabled: !!user?.id
  });

  // Create payment schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !selectedContract || !provider || !phoneNumber) {
        throw new Error('Données manquantes');
      }

      const contract = contracts.find(c => c.id === selectedContract);
      if (!contract) throw new Error('Contrat non trouvé');

      // Calculate next payment date
      const today = new Date();
      let nextPaymentDate = new Date(today.getFullYear(), today.getMonth(), contract.payment_day || 5);
      if (nextPaymentDate <= today) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }

      const { error } = await supabase
        .from('payment_schedules')
        .insert({
          contract_id: selectedContract,
          tenant_id: user.id,
          amount: contract.monthly_rent,
          payment_day: contract.payment_day || 5,
          payment_method: 'mobile_money',
          mobile_money_provider: provider,
          mobile_money_number: phoneNumber.replace(/\s/g, ''),
          is_active: true,
          authorization_date: new Date().toISOString(),
          next_payment_date: nextPaymentDate.toISOString().split('T')[0]
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Paiement automatique configuré avec succès');
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      setSelectedContract('');
      setProvider('');
      setPhoneNumber('');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la configuration');
    }
  });

  // Toggle schedule active state
  const toggleScheduleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('payment_schedules')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      toast.success('Statut mis à jour');
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      await createScheduleMutation.mutateAsync();
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedContractData = contracts.find(c => c.id === selectedContract);

  return (
    <div className="min-h-screen bg-[#FAF7F4] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/mes-paiements">
            <Button variant="ghost" size="small" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#2C1810]">Paiement Automatique</h1>
            <p className="text-muted-foreground">Configurez le prélèvement automatique de votre loyer</p>
          </div>
        </div>

        {/* Benefits */}
        <Card className="bg-gradient-to-r from-[#F16522]/10 to-[#F16522]/5 border-[#F16522]/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-[#F16522]/20">
                <Shield className="h-6 w-6 text-[#F16522]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2C1810] mb-2">Pourquoi activer le paiement automatique ?</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Ne ratez plus jamais une échéance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Évitez les pénalités de retard
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Reçu automatique après chaque paiement
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Améliorez votre score de confiance
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Schedules */}
        {schedules.length > 0 && (
          <Card className="bg-white border-[#EFEBE9]">
            <CardHeader>
              <CardTitle className="text-[#2C1810]">Paiements automatiques actifs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingSchedules ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#F16522]" />
                </div>
              ) : (
                schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-[#EFEBE9]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-[#F16522]/10">
                        <CreditCard className="h-5 w-5 text-[#F16522]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#2C1810]">
                          {schedule.contract?.property?.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.amount?.toLocaleString('fr-CI')} FCFA / mois • 
                          {MOBILE_PROVIDERS.find(p => p.value === schedule.mobile_money_provider)?.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Prochain: {schedule.next_payment_date ? new Date(schedule.next_payment_date).toLocaleDateString('fr-CI') : '-'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={schedule.is_active}
                      onCheckedChange={(checked) => toggleScheduleMutation.mutate({ id: schedule.id, isActive: checked })}
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Setup Form */}
        <Card className="bg-white border-[#EFEBE9]">
          <CardHeader>
            <CardTitle className="text-[#2C1810]">Configurer un nouveau prélèvement</CardTitle>
            <CardDescription>
              Sélectionnez un contrat et renseignez vos informations de paiement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contract Selection */}
              <div className="space-y-2">
                <Label>Contrat de location</Label>
                <Select value={selectedContract} onValueChange={setSelectedContract}>
                  <SelectTrigger className="border-[#EFEBE9]">
                    <SelectValue placeholder="Sélectionnez un contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts.map((contract) => (
                      <SelectItem key={contract.id} value={contract.id}>
                        {contract.property?.title} - {contract.monthly_rent?.toLocaleString('fr-CI')} FCFA
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedContractData && (
                <div className="p-4 rounded-xl bg-[#FAF7F4] border border-[#EFEBE9]">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-[#F16522]" />
                    <span>Jour de prélèvement: <strong>le {selectedContractData.payment_day || 5} de chaque mois</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-2">
                    <CreditCard className="h-4 w-4 text-[#F16522]" />
                    <span>Montant: <strong>{selectedContractData.monthly_rent?.toLocaleString('fr-CI')} FCFA</strong></span>
                  </div>
                </div>
              )}

              {/* Mobile Money Provider */}
              <div className="space-y-2">
                <Label>Opérateur Mobile Money</Label>
                <div className="grid grid-cols-2 gap-3">
                  {MOBILE_PROVIDERS.map((prov) => (
                    <button
                      key={prov.value}
                      type="button"
                      onClick={() => setProvider(prov.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        provider === prov.value
                          ? 'border-[#F16522] bg-[#F16522]/5'
                          : 'border-[#EFEBE9] hover:border-[#F16522]/50'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full mb-2"
                        style={{ backgroundColor: prov.color }}
                      />
                      <span className="text-sm font-medium text-[#2C1810]">{prov.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label>Numéro Mobile Money</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="07 XX XX XX XX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10 border-[#EFEBE9]"
                  />
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Important</p>
                  <p>
                    En activant le paiement automatique, vous autorisez Mon Toit à prélever le montant du loyer 
                    sur votre compte Mobile Money le jour d'échéance de chaque mois. Assurez-vous d'avoir 
                    un solde suffisant pour éviter les échecs de paiement.
                  </p>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-[#F16522] hover:bg-[#F16522]/90"
                disabled={!selectedContract || !provider || !phoneNumber || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Configuration en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activer le paiement automatique
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
