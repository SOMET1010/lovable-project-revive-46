/**
 * ProfileCompletionPage - Complétion du profil après première connexion
 * Design terracotta cohérent avec l'application
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, MapPin, FileText, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { InputWithIcon } from '@/shared/ui';

const USER_TYPES = [
  { value: 'tenant', label: 'Locataire', description: 'Je cherche un logement' },
  { value: 'owner', label: 'Propriétaire', description: 'Je loue mes biens' },
  { value: 'agent', label: 'Agence', description: 'Je gère des biens immobiliers' },
] as const;

const IVORIAN_CITIES = [
  'Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo',
  'Man', 'Daloa', 'Gagnoa', 'Divo', 'Abengourou',
  'Grand-Bassam', 'Assinie', 'Bingerville', 'Cocody', 'Marcory',
  'Plateau', 'Treichville', 'Yopougon', 'Adjamé', 'Abobo',
];

export default function ProfileCompletionPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, updateProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'tenant' | 'owner' | 'agent'>('tenant');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pré-remplir avec les données du profil existant
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
    if (profile?.user_type) {
      setUserType(profile.user_type as 'tenant' | 'owner' | 'agent');
    }
    if (profile?.city) {
      setCity(profile.city);
    }
    if (profile?.bio) {
      setBio(profile.bio);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Veuillez entrer votre nom complet');
      return;
    }

    setSubmitting(true);

    try {
      await updateProfile({
        full_name: fullName.trim(),
        user_type: userType,
        city: city || null,
        bio: bio.trim() || null,
        profile_setup_completed: true,
      });

      // Redirection selon le type d'utilisateur
      const redirectPath = userType === 'tenant' 
        ? '/recherche' 
        : userType === 'owner' 
          ? '/dashboard/ajouter-propriete'
          : '/dashboard';

      navigate(redirectPath);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Afficher un loader pendant le chargement de l'auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-terracotta-50 to-coral-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-terracotta-600 mx-auto" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Rediriger seulement après le chargement si pas d'utilisateur
  if (!user) {
    navigate('/connexion');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-terracotta-50 to-coral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <Building2 className="h-10 w-10 text-terracotta-600" />
            <span className="text-3xl font-bold bg-gradient-to-r from-terracotta-600 to-coral-600 bg-clip-text text-transparent">
              Mon Toit
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complétez votre profil</h1>
          <p className="text-gray-600">Quelques informations pour personnaliser votre expérience</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium animate-slide-down">
                {error}
              </div>
            )}

            {/* Full Name */}
            <InputWithIcon
              icon={User}
              label="Nom complet *"
              variant="modern"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jean Kouassi"
              required
              autoFocus
            />

            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Vous êtes *
              </label>
              <div className="space-y-3">
                {USER_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setUserType(type.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                      userType === type.value
                        ? 'border-terracotta-500 bg-terracotta-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <p className={`font-semibold ${userType === type.value ? 'text-terracotta-700' : 'text-gray-900'}`}>
                        {type.label}
                      </p>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                    {userType === type.value && (
                      <div className="h-6 w-6 rounded-full bg-terracotta-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* City Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Ville (optionnel)
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100 outline-none transition-all bg-white"
              >
                <option value="">Sélectionnez une ville</option>
                {IVORIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Bio (optionnel)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Parlez-nous un peu de vous..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100 outline-none transition-all resize-none"
                maxLength={300}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/300</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !fullName.trim()}
              className="w-full py-4 bg-gradient-to-r from-terracotta-600 to-coral-600 text-white rounded-xl font-bold text-lg hover:from-terracotta-700 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <span>Commencer</span>
                  <Check className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Skip Link */}
        <p className="text-center mt-6 text-sm text-gray-500">
          Vous pourrez modifier ces informations plus tard dans votre profil
        </p>
      </div>
    </div>
  );
}
