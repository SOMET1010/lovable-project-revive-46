import { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Phone, MapPin, Shield, Camera, Save, CheckCircle, AlertCircle, Scan } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { toast } from '@/shared/hooks/useSafeToast';
import TenantDashboardLayout from '../components/TenantDashboardLayout';
import FeatureGate from '@/shared/ui/FeatureGate';
import ONECIForm from '@/features/verification/components/ONECIForm';
import CNAMForm from '@/features/verification/components/CNAMForm';

interface Profile {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  bio: string | null;
  avatar_url: string | null;
  user_type: string | null;
  is_verified: boolean | null;
  oneci_verified: boolean | null;
  cnam_verified: boolean | null;
  trust_score: number | null;
  facial_verification_status: string | null;
  facial_verification_score: number | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'infos');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    address: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      const profileData: Profile = {
        id: data.id,
        user_id: data.user_id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        address: data.address,
        bio: data.bio,
        avatar_url: data.avatar_url,
        user_type: data.user_type,
        is_verified: data.is_verified,
        oneci_verified: data.oneci_verified,
        cnam_verified: data.cnam_verified,
        trust_score: data.trust_score,
        facial_verification_status: data.facial_verification_status,
        facial_verification_score: data.facial_verification_score,
      };
      
      setProfile(profileData);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        city: data.city || '',
        address: data.address || '',
        bio: data.bio || '',
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Profil mis à jour avec succès');
      loadProfile();
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <TenantDashboardLayout title="Mon Profil">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </TenantDashboardLayout>
    );
  }

  const tabs = [
    { id: 'infos', label: 'Informations', icon: User },
    { id: 'verification', label: 'Vérification', icon: Shield },
  ];

  return (
    <TenantDashboardLayout title="Mon Profil">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-2xl shadow-card p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{profile?.full_name || 'Mon Profil'}</h1>
              <p className="text-muted-foreground">{profile?.email || user?.email}</p>
              {profile?.trust_score && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Score de confiance:</span>
                  <span className={`font-semibold ${profile.trust_score >= 70 ? 'text-green-600' : profile.trust_score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                    {profile.trust_score}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-card rounded-2xl shadow-card p-6">
          {activeTab === 'infos' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Informations personnelles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.full_name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, full_name: e.target.value })}
                      className="pl-10"
                      placeholder="Votre nom complet"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.phone}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                      placeholder="+225 XX XX XX XX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Ville</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.city}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, city: e.target.value })}
                      className="pl-10"
                      placeholder="Votre ville"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Adresse</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.address}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })}
                      className="pl-10"
                      placeholder="Votre adresse"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Parlez-nous de vous..."
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Statut de vérification</h2>
              
              {/* Statuts actuels */}
              <div className="space-y-4">
                <VerificationItem
                  title="Identité ANSUT"
                  description="Vérification de votre identité via le système ANSUT"
                  verified={profile?.is_verified ?? null}
                />
                <VerificationItem
                  title="OnECI"
                  description="Vérification de votre carte nationale d'identité"
                  verified={profile?.oneci_verified ?? null}
                />
                <VerificationItem
                  title="CNAM"
                  description="Vérification de votre assurance maladie"
                  verified={profile?.cnam_verified ?? null}
                />
                <VerificationItem
                  title="Vérification Faciale"
                  description="Comparaison biométrique avec votre CNI"
                  verified={profile?.facial_verification_status === 'verified'}
                  score={profile?.facial_verification_score ?? undefined}
                />
              </div>

              {/* Biometric Verification CTA */}
              {profile?.facial_verification_status !== 'verified' && (
                <div className="border-t border-border pt-6 mt-6">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Scan className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Vérification Biométrique NeoFace</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Certifiez votre identité en comparant votre photo CNI avec un selfie en temps réel.
                        </p>
                        <Link
                          to="/verification-biometrique"
                          className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                          <Scan className="h-4 w-4" />
                          Lancer la vérification faciale
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulaires de vérification */}
              <div className="border-t border-border pt-6 mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Lancer une vérification</h3>
                
                <div className="space-y-6">
                  {/* ONECI Form */}
                  {!profile?.oneci_verified && user && (
                    <FeatureGate feature="oneci_verification" showMessage>
                      <div className="border border-border rounded-xl p-6">
                        <ONECIForm userId={user.id} onSuccess={loadProfile} />
                      </div>
                    </FeatureGate>
                  )}

                  {/* CNAM Form */}
                  {!profile?.cnam_verified && user && (
                    <FeatureGate feature="cnam_verification" showMessage>
                      <div className="border border-border rounded-xl p-6">
                        <CNAMForm userId={user.id} onSuccess={loadProfile} />
                      </div>
                    </FeatureGate>
                  )}

                  {profile?.oneci_verified && profile?.cnam_verified && (
                    <div className="text-center py-6 bg-green-50 rounded-xl border border-green-200">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <h4 className="text-lg font-semibold text-green-700">Toutes les vérifications sont complètes !</h4>
                      <p className="text-green-600">Votre profil est entièrement vérifié.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TenantDashboardLayout>
  );
}

function VerificationItem({ title, description, verified, score }: { title: string; description: string; verified: boolean | null; score?: number }) {
  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
      <div className="flex items-center gap-3">
        {verified ? (
          <CheckCircle className="w-6 h-6 text-green-600" />
        ) : (
          <AlertCircle className="w-6 h-6 text-amber-500" />
        )}
        <div>
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          {score && verified && (
            <p className="text-xs text-green-600 mt-0.5">Score: {(score * 100).toFixed(0)}%</p>
          )}
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}>
        {verified ? 'Vérifié' : 'Non vérifié'}
      </span>
    </div>
  );
}
