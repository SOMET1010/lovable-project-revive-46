import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Building2, 
  Wrench, 
  MapPin, 
  FileText, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Upload,
  Euro
} from 'lucide-react';
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';

const SPECIALTIES = [
  'Plomberie',
  'Électricité', 
  'Peinture',
  'Menuiserie',
  'Maçonnerie',
  'Climatisation',
  'Serrurerie',
  'Carrelage',
  'Toiture',
  'Jardinage',
  'Nettoyage',
  'Déménagement'
];

const SERVICE_AREAS = [
  'Abidjan',
  'Cocody',
  'Plateau',
  'Marcory',
  'Treichville',
  'Yopougon',
  'Abobo',
  'Koumassi',
  'Port-Bouët',
  'Bingerville',
  'Grand-Bassam',
  'Yamoussoukro',
  'Bouaké',
  'San Pedro'
];

const ProviderRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    siret: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    bio: '',
    hourly_rate: '',
    specialties: [] as string[],
    service_areas: [] as string[],
    insurance_expiry: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const toggleServiceArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      service_areas: prev.service_areas.includes(area)
        ? prev.service_areas.filter(a => a !== area)
        : [...prev.service_areas, area]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.company_name && formData.phone && formData.city;
      case 2:
        return formData.specialties.length > 0;
      case 3:
        return formData.service_areas.length > 0;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour vous inscrire');
      navigate('/connexion');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('service_providers')
        .insert({
          user_id: user.id,
          company_name: formData.company_name,
          siret: formData.siret || null,
          phone: formData.phone,
          email: formData.email || user.email,
          address: formData.address || null,
          city: formData.city,
          bio: formData.bio || null,
          hourly_rate: formData.hourly_rate ? parseInt(formData.hourly_rate) : null,
          specialties: formData.specialties,
          service_areas: formData.service_areas,
          insurance_expiry: formData.insurance_expiry || null,
          is_active: true,
          is_verified: false
        });

      if (error) throw error;

      toast.success('Inscription réussie! Votre profil est en attente de vérification.');
      navigate('/prestataire/dashboard');
    } catch (error) {
      console.error('Error registering provider:', error);
      toast.error('Erreur lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Informations de l'entreprise</h2>
              <p className="text-muted-foreground mt-2">Présentez votre activité</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="company_name">Nom de l'entreprise *</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Ex: Plomberie Express"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="siret">RCCM / Numéro d'enregistrement</Label>
                <Input
                  id="siret"
                  name="siret"
                  value={formData.siret}
                  onChange={handleInputChange}
                  placeholder="Optionnel"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+225 07 XX XX XX XX"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@entreprise.ci"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Ex: Abidjan"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Adresse complète"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bio">Description de vos services</Label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre expérience et vos services..."
                  className="mt-1 w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Spécialités</h2>
              <p className="text-muted-foreground mt-2">Sélectionnez vos domaines d'expertise</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SPECIALTIES.map(specialty => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => toggleSpecialty(specialty)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.specialties.includes(specialty)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {formData.specialties.includes(specialty) && (
                      <Check className="w-4 h-4" />
                    )}
                    <span className="font-medium">{specialty}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <Label htmlFor="hourly_rate">Tarif horaire indicatif (FCFA)</Label>
              <div className="relative mt-1">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="hourly_rate"
                  name="hourly_rate"
                  type="number"
                  value={formData.hourly_rate}
                  onChange={handleInputChange}
                  placeholder="Ex: 5000"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Zones d'intervention</h2>
              <p className="text-muted-foreground mt-2">Où pouvez-vous intervenir?</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SERVICE_AREAS.map(area => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleServiceArea(area)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.service_areas.includes(area)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {formData.service_areas.includes(area) && (
                      <Check className="w-4 h-4" />
                    )}
                    <span className="font-medium">{area}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Documents</h2>
              <p className="text-muted-foreground mt-2">Ajoutez vos documents professionnels (optionnel)</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium text-foreground">Glissez vos documents ici</p>
                  <p className="text-sm text-muted-foreground mt-1">ou cliquez pour sélectionner</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Assurance, certificats, diplômes...
                  </p>
                </div>

                <div className="mt-6">
                  <Label htmlFor="insurance_expiry">Date d'expiration de l'assurance</Label>
                  <Input
                    id="insurance_expiry"
                    name="insurance_expiry"
                    type="date"
                    value={formData.insurance_expiry}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entreprise</span>
                  <span className="font-medium">{formData.company_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spécialités</span>
                  <span className="font-medium">{formData.specialties.length} sélectionnées</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zones</span>
                  <span className="font-medium">{formData.service_areas.length} zones</span>
                </div>
                {formData.hourly_rate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tarif horaire</span>
                    <span className="font-medium">{parseInt(formData.hourly_rate).toLocaleString()} FCFA</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map(step => (
              <div 
                key={step}
                className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                    step < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div 
                    className={`flex-1 h-1 mx-2 rounded ${
                      step < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Entreprise</span>
            <span>Spécialités</span>
            <span>Zones</span>
            <span>Documents</span>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="p-6 md:p-8">
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceed()}
                >
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceed()}
                >
                  {isSubmitting ? 'Inscription...' : 'Finaliser l\'inscription'}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderRegistrationPage;
