import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Upload, AlertTriangle, Check, FileText } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from '@/shared/ui';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { toast } from 'sonner';

interface LeaseDetails {
  id: string;
  monthly_rent: number;
  next_payment_due_date: string | null;
  owner_id: string;
  property: {
    title: string;
    address: string;
  };
}

const POSTPONEMENT_REASONS = [
  { value: 'health', label: 'Problème de santé', icon: '🏥' },
  { value: 'job_loss', label: 'Perte d\'emploi', icon: '💼' },
  { value: 'family_death', label: 'Décès familial', icon: '🕯️' },
  { value: 'natural_disaster', label: 'Catastrophe naturelle', icon: '🌊' },
  { value: 'other', label: 'Autre raison', icon: '📝' },
];

export default function PostponementRequestPage() {
  const { leaseId } = useParams<{ leaseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lease, setLease] = useState<LeaseDetails | null>(null);
  const [reason, setReason] = useState('');
  const [reasonDetails, setReasonDetails] = useState('');
  const [daysRequested, setDaysRequested] = useState(7);
  const [justificationFile, setJustificationFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
          next_payment_due_date,
          owner_id,
          properties(title, address)
        `)
        .eq('id', leaseId)
        .single();

      if (error) throw error;
      setLease({
        id: data.id,
        monthly_rent: data.monthly_rent,
        next_payment_due_date: data.next_payment_due_date,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas dépasser 5 Mo');
        return;
      }
      setJustificationFile(file);
    }
  };

  const uploadJustification = async (): Promise<string | null> => {
    if (!justificationFile || !user?.id) return null;
    
    setUploading(true);
    try {
      const fileExt = justificationFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('property-documents')
        .upload(fileName, justificationFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('property-documents')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!lease || !user?.id || !reason) {
      toast.error('Veuillez sélectionner un motif');
      return;
    }

    if (!reasonDetails.trim()) {
      toast.error('Veuillez détailler votre situation');
      return;
    }

    setSubmitting(true);
    try {
      let justificationUrl: string | null = null;
      if (justificationFile) {
        justificationUrl = await uploadJustification();
      }

      const originalDueDate = lease.next_payment_due_date 
        ? new Date(lease.next_payment_due_date)
        : new Date();
      
      const newDueDate = new Date(originalDueDate);
      newDueDate.setDate(newDueDate.getDate() + daysRequested);

      const { error } = await supabase
        .from('postponement_requests')
        .insert([{
          lease_id: lease.id,
          tenant_id: user.id,
          owner_id: lease.owner_id,
          reason,
          reason_details: reasonDetails.trim(),
          justification_url: justificationUrl,
          days_requested: daysRequested,
          original_due_date: originalDueDate.toISOString().split('T')[0],
          new_due_date: newDueDate.toISOString().split('T')[0],
        }]);

      if (error) throw error;

      // Notify owner
      await supabase.from('notifications').insert({
        user_id: lease.owner_id,
        title: 'Demande de report de paiement',
        message: `Un locataire demande un report de ${daysRequested} jours. Motif: ${POSTPONEMENT_REASONS.find(r => r.value === reason)?.label}`,
        type: 'info',
        action_url: '/dashboard/reports',
        metadata: { lease_id: lease.id },
      });

      toast.success('Demande de report envoyée');
      navigate('/mes-rappels');
    } catch (error) {
      console.error('Error submitting request:', error);
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
        </div>
      </div>
    );
  }

  const originalDate = lease.next_payment_due_date 
    ? new Date(lease.next_payment_due_date)
    : new Date();
  const newDate = new Date(originalDate);
  newDate.setDate(newDate.getDate() + daysRequested);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-7 h-7" />
            Demande de report
          </h1>
          <p className="text-muted-foreground mt-1">
            Demandez un report exceptionnel de votre échéance
          </p>
        </div>

        {/* Property Info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold">{lease.property.title}</h3>
            <p className="text-sm text-muted-foreground">{lease.property.address}</p>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Échéance actuelle</span>
                <p className="font-medium">{originalDate.toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Montant</span>
                <p className="font-medium">{lease.monthly_rent.toLocaleString()} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reason Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Motif du report *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {POSTPONEMENT_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    reason === r.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl block mb-1">{r.icon}</span>
                  <span className="text-sm">{r.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de votre situation *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <textarea
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                placeholder="Expliquez votre situation en détail..."
                className="w-full p-3 border rounded-lg bg-background min-h-32 resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {reasonDetails.length}/1000 caractères
              </p>
            </div>

            <div>
              <Label>Nombre de jours de report</Label>
              <div className="flex gap-2 mt-2">
                {[7, 14, 21, 30].map(days => (
                  <button
                    key={days}
                    onClick={() => setDaysRequested(days)}
                    className={`flex-1 py-3 rounded-lg border text-center transition-colors ${
                      daysRequested === days
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {days}j
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <span className="text-muted-foreground">Nouvelle échéance proposée: </span>
                <span className="font-medium">{newDate.toLocaleDateString('fr-FR')}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Justification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Justificatif (recommandé)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                id="justification"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              <label htmlFor="justification" className="cursor-pointer">
                {justificationFile ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span>{justificationFile.name}</span>
                  </div>
                ) : (
                  <>
                    <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour ajouter un document justificatif
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPG ou PNG (max 5 Mo)
                    </p>
                  </>
                )}
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-medium">Important</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Le report n'est pas automatique, il doit être approuvé</li>
                <li>Un justificatif augmente vos chances d'approbation</li>
                <li>Maximum 1 report par trimestre</li>
                <li>Le non-respect de la nouvelle échéance entraîne des pénalités</li>
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
            disabled={submitting || uploading || !reason || !reasonDetails.trim()}
          >
            {(submitting || uploading) ? (
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
