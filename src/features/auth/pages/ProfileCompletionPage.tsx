/**
 * ProfileCompletionPage - Complétion du profil après première connexion
 * Design: Premium Ivorian (Chocolat/Orange/Sable)
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, User, MapPin, FileText, Loader2, Check, 
  Mail, Camera, Phone, CheckCircle2, Key, Briefcase 
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { InputWithIcon, Button } from '@/shared/ui';
import { supabase } from '@/integrations/supabase/client';

// --- CONFIGURATION ---

const USER_TYPES = [
  { 
    value: 'tenant', 
    label: 'Locataire', 
    description: 'Je cherche un logement',
    icon: Key 
  },
  { 
    value: 'owner', 
    label: 'Propriétaire', 
    description: 'Je loue mes biens',
    icon: Building2 
  },
  { 
    value: 'agent', 
    label: 'Agence', 
    description: 'Je gère des biens',
    icon: Briefcase 
  },
] as const;

const IVORIAN_CITIES = [
  'Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo',
  'Man', 'Daloa', 'Gagnoa', 'Divo', 'Abengourou',
  'Grand-Bassam', 'Assinie', 'Bingerville', 'Cocody', 'Marcory',
  'Plateau', 'Treichville', 'Yopougon', 'Adjamé', 'Abobo',
];

// --- UTILS ---

const formatPhoneForDisplay = (phone: string | null | undefined): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('225') && digits.length >= 13) {
    const localNumber = digits.slice(3);
    return `+225 ${localNumber.replace(/(\d{2})(?=\d)/g, '$1 ').trim()}`;
  }
  return phone;
};

const isValidEmail = (email: string): boolean => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// --- COMPOSANT ---

export default function ProfileCompletionPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // États
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'tenant' | 'owner' | 'agent'>('tenant');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // États UI
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Init Data
  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.email) setEmail(profile.email);
      if (profile.user_type) setUserType(profile.user_type as 'tenant' | 'owner' | 'agent');
      if (profile.city) setCity(profile.city);
      if (profile.bio) setBio(profile.bio);
      if (profile.avatar_url) {
        setAvatarUrl(profile.avatar_url);
        setAvatarPreview(profile.avatar_url);
      }
    }
  }, [profile]);

  // Handlers
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5 Mo');
      return;
    }

    // Preview immédiate
    const reader = new FileReader();
    reader.onload = (event) => setAvatarPreview(event.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
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

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(value && !isValidEmail(value) ? 'Format email invalide' : '');
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

      const redirectPath = userType === 'tenant' 
        ? '/recherche' 
        : userType === 'owner' 
          ? '/dashboard/ajouter-propriete'
          : '/dashboard';

      navigate(redirectPath);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#F16522]" />
          <p className="text-[#6B5A4E] font-medium">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/connexion');
    return null;
  }

  const displayPhone = formatPhoneForDisplay(profile?.phone);

  return (
    <div className="min-h-screen bg-[#FAF7F4] py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4 border border-[#EFEBE9]">
            <Building2 className="h-8 w-8 text-[#F16522]" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#2C1810] mb-2">
            Complétez votre profil
          </h1>
          <p className="text-[#6B5A4E]">
            Pour une expérience personnalisée sur <span className="font-bold text-[#F16522]">Mon Toit</span>
          </p>
        </div>

        {/* Card Formulaire */}
        <div className="bg-white rounded-[32px] shadow-xl shadow-[#2C1810]/5 border border-[#EFEBE9] p-8 md:p-10 animate-in zoom-in-95 duration-500">
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm font-medium">
                <div className="w-1 h-1 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            {/* AVATAR UPLOAD (Centré) */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div 
                  className="w-28 h-28 rounded-full bg-[#FAF7F4] border-4 border-white shadow-lg flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-105"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-[#A69B95]" />
                  )}
                  
                  {/* Overlay Loader */}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-9 h-9 bg-[#F16522] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#D95318] transition-colors border-2 border-white"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="text-xs text-[#A69B95] mt-3 font-medium">Photo de profil (Optionnel)</p>
            </div>

            {/* INFOS PERSONNELLES */}
            <div className="space-y-5">
              {/* Téléphone (Lecture Seule) */}
              {displayPhone && (
                <div>
                  <label className="text-xs font-bold uppercase text-[#A69B95] mb-1.5 flex items-center gap-2 tracking-wide">
                    Téléphone vérifié <CheckCircle2 className="w-3 h-3 text-green-500" />
                  </label>
                  <div className="w-full px-5 py-3.5 bg-[#FAF7F4] border border-[#EFEBE9] rounded-xl text-[#2C1810] font-bold flex items-center gap-3 opacity-80 cursor-not-allowed shadow-inner">
                    <Phone className="w-4 h-4 text-[#A69B95]" />
                    <span>{displayPhone}</span>
                  </div>
                </div>
              )}

              {/* Nom Complet */}
              <div>
                <label className="text-xs font-bold uppercase text-[#A69B95] mb-1.5 block tracking-wide">Nom complet *</label>
                <InputWithIcon
                  icon={User}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Jean Kouassi"
                  required
                  className="w-full px-5 py-3.5 rounded-xl border border-[#EFEBE9] focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 transition-all font-medium text-[#2C1810]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold uppercase text-[#A69B95] mb-1.5 flex justify-between tracking-wide">
                  <span>Email</span>
                  <span className="text-[10px] font-normal normal-case bg-[#FAF7F4] px-2 py-0.5 rounded text-[#A69B95]">Pour la récupération du compte</span>
                </label>
                <InputWithIcon
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="jean.kouassi@email.com"
                  className={`w-full px-5 py-3.5 rounded-xl border transition-all font-medium text-[#2C1810] ${emailError ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-[#EFEBE9] focus:border-[#F16522] focus:ring-[#F16522]/10'}`}
                />
                {emailError && <p className="text-xs text-red-500 mt-1.5 font-medium">{emailError}</p>}
              </div>
            </div>

            {/* TYPE UTILISATEUR (Grille) */}
            <div>
              <label className="text-xs font-bold uppercase text-[#A69B95] mb-3 block tracking-wide">Je suis *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {USER_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = userType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setUserType(type.value)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all duration-300 flex flex-col gap-2 ${
                        isSelected
                          ? 'border-[#F16522] bg-[#F16522]/5 shadow-md scale-[1.02] z-10'
                          : 'border-[#EFEBE9] bg-white hover:border-[#F16522]/30 hover:bg-[#FAF7F4]'
                      }`}
                    >
                      <div className={`p-2 rounded-lg w-fit ${isSelected ? 'bg-[#F16522] text-white' : 'bg-[#FAF7F4] text-[#A69B95]'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${isSelected ? 'text-[#2C1810]' : 'text-[#6B5A4E]'}`}>
                          {type.label}
                        </p>
                        <p className="text-[10px] text-[#A69B95] leading-tight mt-0.5">
                          {type.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-[#F16522]">
                          <CheckCircle2 className="w-5 h-5 fill-[#F16522] text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VILLE & BIO */}
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase text-[#A69B95] mb-1.5 block tracking-wide">Ville de résidence</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-[#A69B95]" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[#EFEBE9] bg-white focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none appearance-none font-medium text-[#2C1810] cursor-pointer"
                  >
                    <option value="">Sélectionnez une ville</option>
                    {IVORIAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#A69B95] mb-1.5 block tracking-wide">À propos de moi</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3.5 w-5 h-5 text-[#A69B95]" />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Dites-en un peu plus sur vous..."
                    rows={3}
                    maxLength={300}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[#EFEBE9] focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none resize-none font-medium text-[#2C1810] placeholder:text-[#A69B95]/50"
                  />
                  <p className="text-[10px] text-[#A69B95] text-right mt-1">{bio.length}/300</p>
                </div>
              </div>
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              disabled={submitting || !fullName.trim() || !!emailError}
              className="w-full bg-[#F16522] hover:bg-[#D95318] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-[#F16522]/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <span>Terminer mon profil</span>
                  <Check className="h-5 w-5" />
                </>
              )}
            </Button>

          </form>
        </div>

        <p className="text-center mt-8 text-sm text-[#A69B95]">
          Vous pourrez modifier ces informations plus tard dans <span className="text-[#2C1810] font-medium">Mon Compte</span>
        </p>
      </div>
    </div>
  );
}
