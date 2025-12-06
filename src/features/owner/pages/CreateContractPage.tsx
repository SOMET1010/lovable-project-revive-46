import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/app/layout/Header';
import Footer from '@/app/layout/Footer';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  Home, 
  ArrowLeft,
  Loader,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  address: string | null;
  city: string;
  monthly_rent: number;
}

interface AcceptedApplication {
  id: string;
  applicant_id: string;
  property_id: string;
  status: string | null;
  profiles: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

export default function CreateContractPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<AcceptedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [chargesAmount, setChargesAmount] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentDay, setPaymentDay] = useState('5');
  const [customClauses, setCustomClauses] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    // Auto-fill rent from selected property
    if (selectedProperty) {
      const property = properties.find(p => p.id === selectedProperty);
      if (property) {
        setMonthlyRent(property.monthly_rent.toString());
        // Default deposit: 2 months rent
        setDepositAmount((property.monthly_rent * 2).toString());
      }
    }
  }, [selectedProperty, properties]);

  useEffect(() => {
    // Filter applications by selected property
    if (selectedProperty) {
      loadApplications(selectedProperty);
    }
  }, [selectedProperty]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      // Load owner's properties
      const { data: propsData, error: propsError } = await supabase
        .from('properties')
        .select('id, title, address, city, monthly_rent')
        .eq('owner_id', user.id)
        .eq('status', 'disponible');

      if (propsError) throw propsError;
      setProperties(propsData || []);
    } catch (err: unknown) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('rental_applications')
        .select(`
          id,
          applicant_id,
          property_id,
          status
        `)
        .eq('property_id', propertyId)
        .eq('status', 'acceptee');

      if (error) throw error;

      // Load profiles for each applicant
      if (data && data.length > 0) {
        const applicantIds = data.map(app => app.applicant_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email, phone')
          .in('user_id', applicantIds);

        const appsWithProfiles = data.map(app => ({
          ...app,
          profiles: profiles?.find(p => p.user_id === app.applicant_id) || null
        }));

        setApplications(appsWithProfiles);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
    }
  };

  const generateContractNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MT-${year}${month}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedProperty || !selectedTenant) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const contractNumber = generateContractNumber();
      
      const { data, error: insertError } = await supabase
        .from('lease_contracts')
        .insert({
          contract_number: contractNumber,
          property_id: selectedProperty,
          owner_id: user.id,
          tenant_id: selectedTenant,
          monthly_rent: parseInt(monthlyRent),
          deposit_amount: parseInt(depositAmount),
          charges_amount: parseInt(chargesAmount),
          start_date: startDate,
          end_date: endDate,
          payment_day: parseInt(paymentDay),
          custom_clauses: customClauses || null,
          status: 'brouillon'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update property status
      await supabase
        .from('properties')
        .update({ status: 'reserve' })
        .eq('id', selectedProperty);

      // Create notification for tenant
      await supabase.from('notifications').insert({
        user_id: selectedTenant,
        type: 'contract_created',
        title: 'Nouveau contrat de bail',
        message: `Un contrat de bail a été créé pour vous. Numéro: ${contractNumber}`,
        action_url: `/signer-bail/${data.id}`
      });

      setSuccess('Contrat créé avec succès!');
      
      setTimeout(() => {
        navigate(`/contrat/${data.id}`);
      }, 2000);

    } catch (err: unknown) {
      console.error('Error creating contract:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du contrat');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Veuillez vous connecter</p>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader className="w-12 h-12 text-primary animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 card-animate-in">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Créer un contrat de bail</h1>
                <p className="text-muted-foreground">Générez un contrat conforme au droit ivoirien</p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start space-x-3 mb-6 card-animate-in">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start space-x-3 mb-6 card-animate-in">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-600">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Selection */}
            <div className="bg-card rounded-2xl border border-border p-6 card-animate-in card-hover-premium card-stagger-1">
              <div className="flex items-center space-x-3 mb-4">
                <Home className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Propriété</h2>
              </div>
              
              {properties.length === 0 ? (
                <div className="text-center py-6">
                  <Home className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Aucune propriété disponible</p>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/ajouter-propriete')}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter une propriété</span>
                  </button>
                </div>
              ) : (
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                >
                  <option value="">Sélectionner une propriété</option>
                  {properties.map(prop => (
                    <option key={prop.id} value={prop.id}>
                      {prop.title} - {prop.city} ({prop.monthly_rent.toLocaleString()} FCFA/mois)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tenant Selection */}
            <div className="bg-card rounded-2xl border border-border p-6 card-animate-in card-hover-premium card-stagger-2">
              <div className="flex items-center space-x-3 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Locataire</h2>
              </div>
              
              {!selectedProperty ? (
                <p className="text-muted-foreground text-sm">Sélectionnez d'abord une propriété</p>
              ) : applications.length === 0 ? (
                <div className="text-center py-6">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Aucune candidature acceptée pour cette propriété</p>
                </div>
              ) : (
                <select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                >
                  <option value="">Sélectionner un locataire</option>
                  {applications.map(app => (
                    <option key={app.id} value={app.applicant_id}>
                      {app.profiles?.full_name || 'Nom non renseigné'} - {app.profiles?.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Financial Terms */}
            <div className="bg-card rounded-2xl border border-border p-6 card-animate-in card-hover-premium card-stagger-3">
              <div className="flex items-center space-x-3 mb-4">
                <DollarSign className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Conditions financières</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Loyer mensuel (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Dépôt de garantie (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Charges mensuelles (FCFA)
                  </label>
                  <input
                    type="number"
                    value={chargesAmount}
                    onChange={(e) => setChargesAmount(e.target.value)}
                    min="0"
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Jour de paiement (1-28)
                  </label>
                  <input
                    type="number"
                    value={paymentDay}
                    onChange={(e) => setPaymentDay(e.target.value)}
                    min="1"
                    max="28"
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-card rounded-2xl border border-border p-6 card-animate-in card-hover-premium card-stagger-4">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Durée du bail</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Date de fin *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* Custom Clauses */}
            <div className="bg-card rounded-2xl border border-border p-6 card-animate-in card-hover-premium card-stagger-5">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Clauses personnalisées</h2>
              </div>
              
              <textarea
                value={customClauses}
                onChange={(e) => setCustomClauses(e.target.value)}
                rows={4}
                placeholder="Ajoutez des clauses personnalisées si nécessaire..."
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !selectedProperty || !selectedTenant}
              className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 card-animate-in"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Créer le contrat de bail</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
