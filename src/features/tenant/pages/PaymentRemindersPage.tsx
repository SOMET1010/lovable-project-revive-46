import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, AlertTriangle, Clock, CheckCircle, 
  CreditCard, Calendar, ChevronRight, FileText
} from 'lucide-react';
import { Button, Card, CardContent } from '@/shared/ui';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';

interface RentReminder {
  id: string;
  lease_id: string;
  reminder_type: string;
  status: string;
  amount_due: number;
  penalty_amount: number;
  message_content: string;
  created_at: string;
  sent_at: string | null;
  opened_at: string | null;
  property?: {
    title: string;
    address: string;
  };
}

const REMINDER_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  j_minus_5: { label: 'J-5', color: 'bg-blue-100 text-blue-700', icon: <Clock className="w-4 h-4" /> },
  j_minus_3: { label: 'J-3', color: 'bg-blue-100 text-blue-700', icon: <Clock className="w-4 h-4" /> },
  j_minus_1: { label: 'J-1', color: 'bg-orange-100 text-orange-700', icon: <AlertTriangle className="w-4 h-4" /> },
  j_day: { label: 'Échéance', color: 'bg-orange-100 text-orange-700', icon: <Calendar className="w-4 h-4" /> },
  j_plus_5: { label: 'J+5', color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="w-4 h-4" /> },
  j_plus_10: { label: 'J+10', color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="w-4 h-4" /> },
  j_plus_15: { label: 'J+15', color: 'bg-red-200 text-red-800', icon: <AlertTriangle className="w-4 h-4" /> },
  j_plus_30: { label: 'J+30', color: 'bg-red-300 text-red-900', icon: <AlertTriangle className="w-4 h-4" /> },
};

export default function PaymentRemindersPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<RentReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLeaseId, setActiveLeaseId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadReminders();
    }
  }, [user?.id]);

  const loadReminders = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rent_reminders')
        .select(`
          *,
          properties(title, address)
        `)
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Mark as opened
      const unopenedIds = data?.filter(r => !r.opened_at).map(r => r.id) || [];
      if (unopenedIds.length > 0) {
        await supabase
          .from('rent_reminders')
          .update({ opened_at: new Date().toISOString() })
          .in('id', unopenedIds);
      }

      setReminders((data as RentReminder[]) || []);
      
      // Get active lease
      const { data: lease } = await supabase
        .from('lease_contracts')
        .select('id')
        .eq('tenant_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (lease) {
        setActiveLeaseId(lease.id);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLatestReminder = () => {
    return reminders.find(r => 
      r.reminder_type.includes('plus') || r.reminder_type === 'j_day'
    );
  };

  const latestReminder = getLatestReminder();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
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
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-7 h-7" />
            Mes rappels de loyer
          </h1>
          <p className="text-muted-foreground mt-1">
            Suivez vos échéances et pénalités éventuelles
          </p>
        </div>

        {/* Current Due Alert */}
        {latestReminder && latestReminder.reminder_type.includes('plus') && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800">Paiement en retard</h3>
                  <p className="text-red-700 mt-1">
                    Montant dû: <strong>{latestReminder.amount_due?.toLocaleString()} FCFA</strong>
                    {latestReminder.penalty_amount > 0 && (
                      <span className="ml-2">(dont {latestReminder.penalty_amount?.toLocaleString()} FCFA de pénalités)</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Link to="/effectuer-paiement">
                      <Button size="small">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Payer maintenant
                      </Button>
                    </Link>
                    {activeLeaseId && (
                      <>
                        <Link to={`/proposer-echeancier/${activeLeaseId}`}>
                        <Button variant="outline" size="small">
                            <Calendar className="w-4 h-4 mr-2" />
                            Proposer un échéancier
                          </Button>
                        </Link>
                        <Link to={`/demande-report/${activeLeaseId}`}>
                          <Button variant="outline" size="small">
                            <FileText className="w-4 h-4 mr-2" />
                            Demander un report
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-4">Historique des rappels</h2>
            
            {reminders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>Aucun rappel pour le moment</p>
                <p className="text-sm">Vous êtes à jour dans vos paiements</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder, index) => {
                  const config = REMINDER_LABELS[reminder.reminder_type] || {
                    label: reminder.reminder_type,
                    color: 'bg-gray-100 text-gray-700',
                    icon: <Bell className="w-4 h-4" />,
                  };

                  return (
                    <div
                      key={reminder.id}
                      className={`flex items-start gap-4 p-3 rounded-lg border ${
                        index === 0 ? 'border-primary/30 bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${config.color}`}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(reminder.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{reminder.message_content}</p>
                        {reminder.property && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {reminder.property.title}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="font-medium">
                            {reminder.amount_due?.toLocaleString()} FCFA
                          </span>
                          {reminder.penalty_amount > 0 && (
                            <span className="text-red-600">
                              +{reminder.penalty_amount?.toLocaleString()} pénalités
                            </span>
                          )}
                        </div>
                      </div>
                      {index === 0 && reminder.reminder_type.includes('plus') && (
                        <Link to="/effectuer-paiement">
                          <Button size="small" variant="outline">
                            Payer
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
