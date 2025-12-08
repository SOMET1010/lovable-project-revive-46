/**
 * ProfileCompletionPage - Complétion du profil après première connexion
 * Design Premium Ivorian (Chocolat/Orange/Sable)
 * 
 * Features:
 * - Affichage du numéro vérifié (lecture seule)
 * - Upload photo de profil
 * - Email optionnel
 * - Sélection type d'utilisateur
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, User, MapPin, FileText, Loader2, Check, 
  Mail, Camera, Phone, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { InputWithIcon } from '@/shared/ui';
import { supabase } from '@/integrations/supabase/client';
import '@/styles/form-premium.css';

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

// Format phone number for display
const formatPhoneForDisplay = (phone: string | null | undefined): string => {
  if (!phone) return '';
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  // If starts with 225, format as +225 XX XX XX XX XX
  if (digits.startsWith('225') && digits.length >= 13) {
    const localNumber = digits.slice(3);
    return `+225 ${localNumber.replace(/(\d{2})(?=\d)/g, '$1 ').trim()}`;
  }
  // Fallback: just format with spaces
  return phone;
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  if (!email) return true; // Optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function ProfileCompletionPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'tenant' | 'owner' | 'agent'>('tenant');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Pré-remplir avec les données du profil existant
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
    if (profile?.email) {
      setEmail(profile.email);
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
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
      setAvatarPreview(profile.avatar_url);
    }
  }, [profile]);

  // Handle avatar file selection
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5 Mo');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    if (user) {
      setUploadingAvatar(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        setAvatarUrl(publicUrl);
      } catch (err) {
        console.error('Avatar upload error:', err);
        setError('Erreur lors de l\'upload de la photo');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  // Handle email change with validation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !isValidEmail(value)) {
      setEmailError('Format email invalide');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Veuillez entrer votre nom complet');
      return;
    }

    if (email && !isValidEmail(email)) {
      setError('Veuillez entrer un email valide');
      return;
    }

    setSubmitting(true);

    try {
      await updateProfile({
        full_name: fullName.trim(),
        email: email.trim() || null,
        user_type: userType,
        city: city || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
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
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#F16522] mx-auto" />
          <p className="text-[#A69B95]">Chargement...</p>
        </div>
      </div>
    );
  }

  // Rediriger seulement après le chargement si pas d'utilisateur
  if (!user) {
    navigate('/connexion');
    return null;
  }

  const displayPhone = formatPhoneForDisplay(profile?.phone);

  return (
    <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <Building2 className="h-10 w-10 text-[#F16522]" />
            <span className="text-3xl font-bold bg-gradient-to-r from-[#2C1810] to-[#F16522] bg-clip-text text-transparent">
              Mon Toit
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#2C1810] mb-2">Complétez votre profil</h1>
          <p className="text-[#A69B95]">Quelques informations pour personnaliser votre expérience</p>
        </div>

        {/* Form Card */}
        <div className="form-section-premium animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div 
                  className="w-24 h-24 rounded-full bg-[#F5F0EB] border-4 border-white shadow-lg flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-[#A69B95]" />
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#F16522] rounded-full flex items-center justify-center shadow-lg hover:bg-[#E05A1A] transition-colors"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="text-xs text-[#A69B95] mt-2">Cliquez pour ajouter une photo</p>
            </div>

            {/* Phone Number (Read-only) */}
            {displayPhone && (
              <div>
                <label className="form-label-premium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Téléphone
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    Vérifié
                  </span>
                </label>
                <div className="mt-2 p-4 bg-[#F5F0EB] rounded-xl border border-[#EFEBE9] text-[#2C1810] font-medium flex items-center gap-3">
                  <span className="text-lg">🇨🇮</span>
                  <span>{displayPhone}</span>
                </div>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="form-label-premium">Nom complet *</label>
              <InputWithIcon
                icon={User}
                variant="modern"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jean Kouassi"
                required
                autoFocus={!displayPhone}
                className="mt-2"
              />
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="form-label-premium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email (optionnel)
              </label>
              <InputWithIcon
                icon={Mail}
                variant="modern"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="votre@email.com"
                className={`mt-2 ${emailError ? 'border-red-400' : ''}`}
              />
              {emailError ? (
                <p className="text-xs text-red-500 mt-1">{emailError}</p>
              ) : (
                <p className="text-xs text-[#A69B95] mt-1">Pour récupérer votre compte et recevoir des notifications</p>
              )}
            </div>

            {/* User Type Selection */}
            <div>
              <label className="form-label-premium mb-3 block">
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
                        ? 'border-[#F16522] bg-[#F16522]/10 shadow-md'
                        : 'border-[#A69B95]/30 hover:border-[#F16522]/50'
                    }`}
                  >
                    <div>
                      <p className={`font-semibold ${userType === type.value ? 'text-[#F16522]' : 'text-[#2C1810]'}`}>
                        {type.label}
                      </p>
                      <p className="text-sm text-[#A69B95]">{type.description}</p>
                    </div>
                    {userType === type.value && (
                      <div className="h-6 w-6 rounded-full bg-[#F16522] flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* City Selection */}
            <div>
              <label className="form-label-premium">
                <MapPin className="inline h-4 w-4 mr-1" />
                Ville (optionnel)
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="form-input-premium mt-2"
              >
                <option value="">Sélectionnez une ville</option>
                {IVORIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Bio */}
            <div>
              <label className="form-label-premium">
                <FileText className="inline h-4 w-4 mr-1" />
                Bio (optionnel)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Parlez-nous un peu de vous..."
                rows={3}
                className="form-input-premium mt-2 resize-none"
                maxLength={300}
              />
              <p className="text-xs text-[#A69B95] mt-1 text-right">{bio.length}/300</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !fullName.trim() || !!emailError}
              className="form-button-primary w-full flex items-center justify-center gap-2"
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
        <p className="text-center mt-6 text-sm text-[#A69B95]">
          Vous pourrez modifier ces informations plus tard dans votre profil
        </p>
      </div>
    </div>
  );
}
