/**
 * ProfileCompletionPage - Version Premium "Split Screen"
 * Une expérience d'onboarding immersive qui valorise l'utilisateur.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, User, MapPin, FileText, Loader2, Check, 
  Mail, Camera, Phone, CheckCircle2, Key, Briefcase, 
  ShieldCheck, Star, ArrowRight 
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/shared/ui';
import { supabase } from '@/integrations/supabase/client';

// --- CONFIGURATION ---

const USER_TYPES = [
  { 
    value: 'tenant', 
    label: 'Locataire', 
    description: 'Je cherche mon futur logement',
    icon: Key,
  },
  { 
    value: 'owner', 
    label: 'Propriétaire', 
    description: 'Je veux louer mes biens',
    icon: Building2,
  },
  { 
    value: 'agent', 
    label: 'Agent Immobilier', 
    description: 'Je gère un portefeuille',
    icon: Briefcase,
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
    if (!file.type.startsWith('image/')) { setError('Image requise'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Max 5 Mo'); return; }

    const reader = new FileReader();
    reader.onload = (event) => setAvatarPreview(event.target?.result as string);
    reader.readAsDataURL(file);

    if (user) {
      setUploadingAvatar(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        setAvatarUrl(publicUrl);
      } catch (_err) { setError("Erreur d'upload"); } finally { setUploadingAvatar(false); }
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(value && !isValidEmail(value) ? 'Email invalide' : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) { setError('Nom requis'); return; }
    if (email && !isValidEmail(email)) { setError('Email invalide'); return; }

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
      const redirectPath = userType === 'tenant' ? '/recherche' : userType === 'owner' ? '/dashboard/ajouter-propriete' : '/dashboard';
      navigate(redirectPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAF7F4]">
        <Loader2 className="h-10 w-10 animate-spin text-[#F16522]" />
      </div>
    );
  }
  
  if (!user) { 
    navigate('/connexion'); 
    return null; 
  }

  const displayPhone = formatPhoneForDisplay(profile?.phone);

  return (
    <div className="min-h-screen bg-white flex font-sans selection:bg-[#F16522] selection:text-white">
      
      {/* ==================== COLONNE GAUCHE (VISUELLE) ==================== */}
      <div className="hidden lg:flex w-5/12 bg-[#2C1810] relative flex-col justify-between overflow-hidden p-12">
        {/* Fond Image */}
        <div className="absolute inset-0 opacity-30">
           <img 
             src="/images/hero/hero1.jpg" 
             alt="Background" 
             className="w-full h-full object-cover grayscale mix-blend-overlay"
           />
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810] via-[#2C1810]/80 to-transparent" />
        
        {/* Contenu Gauche */}
        <div className="relative z-10 space-y-6">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#F16522] rounded-xl flex items-center justify-center shadow-lg">
                <span className="font-bold text-white text-xl">M</span>
             </div>
             <span className="text-white font-bold text-xl tracking-wide">Mon Toit</span>
           </div>
           
           <div className="mt-20">
             <h1 className="text-4xl font-extrabold text-white leading-tight mb-6">
               Bienvenue dans la <br/>
               <span className="text-[#F16522]">référence immobilière</span>
             </h1>
             <p className="text-[#E8D4C5] text-lg leading-relaxed max-w-sm">
               Complétez votre profil pour accéder à des milliers de biens vérifiés et interagir avec notre communauté de confiance.
             </p>
           </div>
        </div>

        {/* Avantages */}
        <div className="relative z-10 space-y-4">
           {[
             { icon: ShieldCheck, text: "Identité Vérifiée & Sécurisée" },
             { icon: Star, text: "Accès au Trust Score" },
             { icon: FileText, text: "Dossier Locataire Digital" }
           ].map((item, i) => (
             <div key={i} className="flex items-center gap-3 text-[#E8D4C5]">
                <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                  <item.icon className="w-5 h-5 text-[#F16522]" />
                </div>
                <span className="font-medium">{item.text}</span>
             </div>
           ))}
        </div>
      </div>

      {/* ==================== COLONNE DROITE (FORMULAIRE) ==================== */}
      <div className="w-full lg:w-7/12 flex flex-col min-h-screen overflow-y-auto bg-[#FAF7F4]">
        <div className="flex-1 w-full max-w-2xl mx-auto p-6 md:p-12 lg:p-16">
          
          {/* Header Mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#F16522] rounded-xl flex items-center justify-center shadow-lg">
              <span className="font-bold text-white text-xl">M</span>
            </div>
            <span className="text-[#2C1810] font-bold text-xl tracking-wide">Mon Toit</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[#2C1810] mb-2">Finalisons votre compte</h2>
            <p className="text-[#6B5A4E]">Cela ne prendra qu'une minute.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. PHOTO PROFIL */}
            <div className="flex items-center gap-6 p-6 bg-white rounded-[24px] border border-[#EFEBE9] shadow-sm">
               <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                 <div className="w-20 h-20 rounded-full bg-[#FAF7F4] flex items-center justify-center overflow-hidden border-2 border-[#EFEBE9] group-hover:border-[#F16522] transition-all">
                    {avatarPreview ? (
                      <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <User className="w-8 h-8 text-[#A69B95]" />
                    )}
                 </div>
                 <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#2C1810] rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg">
                    {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                 </div>
               </div>
               <div>
                 <h3 className="font-bold text-[#2C1810]">Photo de profil</h3>
                 <p className="text-xs text-[#6B5A4E] mt-1 mb-2">Une photo rassure les propriétaires et augmente vos chances.</p>
                 <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-[#F16522] hover:underline">
                   Choisir une photo
                 </button>
                 <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
               </div>
            </div>

            {/* 2. TYPE UTILISATEUR */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase text-[#A69B95] tracking-widest">Je suis ici pour</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {USER_TYPES.map((type) => {
                  const isSelected = userType === type.value;
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setUserType(type.value)}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col justify-between h-32 ${
                        isSelected 
                        ? `border-[#F16522] bg-white shadow-[0_10px_30px_rgba(241,101,34,0.15)] ring-1 ring-[#F16522]` 
                        : 'border-transparent bg-white hover:border-[#EFEBE9] shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-[#F16522] text-white' : 'bg-[#FAF7F4] text-[#A69B95]'}`}>
                         <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${isSelected ? 'text-[#2C1810]' : 'text-[#6B5A4E]'}`}>{type.label}</p>
                        <p className="text-[10px] text-[#A69B95] mt-1 line-clamp-1">{type.description}</p>
                      </div>
                      {isSelected && <div className="absolute top-3 right-3 text-[#F16522]"><CheckCircle2 className="w-5 h-5" /></div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. INFORMATIONS PERSONNELLES */}
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                 {/* Nom */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#A69B95] tracking-widest ml-1">Nom Complet *</label>
                    <div className="relative group">
                       <User className="absolute left-4 top-3.5 w-5 h-5 text-[#A69B95] group-focus-within:text-[#F16522] transition-colors" />
                       <input 
                         type="text" 
                         value={fullName}
                         onChange={e => setFullName(e.target.value)}
                         placeholder="Jean Kouassi"
                         className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#EFEBE9] rounded-xl text-[#2C1810] font-medium focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] outline-none transition-all placeholder:text-[#D5CCC7]"
                       />
                    </div>
                 </div>

                 {/* Ville */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#A69B95] tracking-widest ml-1">Ville de résidence</label>
                    <div className="relative group">
                       <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-[#A69B95] group-focus-within:text-[#F16522] transition-colors" />
                       <select 
                         value={city}
                         onChange={e => setCity(e.target.value)}
                         className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#EFEBE9] rounded-xl text-[#2C1810] font-medium focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] outline-none transition-all appearance-none cursor-pointer"
                       >
                         <option value="">Choisir...</option>
                         {IVORIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
              </div>

              {/* Contact (Tel & Email) */}
              <div className="p-5 bg-white rounded-2xl border border-[#EFEBE9] space-y-4">
                 <h4 className="font-bold text-[#2C1810] text-sm flex items-center gap-2">
                   <Phone className="w-4 h-4 text-[#F16522]" /> Coordonnées
                 </h4>
                 
                 {displayPhone && (
                   <div className="flex items-center justify-between p-3 bg-[#FAF7F4] rounded-xl border border-[#EFEBE9]">
                      <div className="flex items-center gap-3">
                         <span className="text-lg">🇨🇮</span>
                         <span className="font-bold text-[#2C1810]">{displayPhone}</span>
                      </div>
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> VÉRIFIÉ
                      </span>
                   </div>
                 )}

                 <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[#A69B95] group-focus-within:text-[#F16522] transition-colors" />
                    <input 
                       type="email" 
                       value={email}
                       onChange={e => handleEmailChange(e.target.value)}
                       placeholder="Email de récupération (Optionnel)"
                       className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl text-[#2C1810] font-medium focus:ring-2 focus:ring-[#F16522]/20 outline-none transition-all placeholder:text-[#D5CCC7] ${
                         emailError ? 'border-red-400 focus:border-red-400' : 'border-[#EFEBE9] focus:border-[#F16522]'
                       }`}
                    />
                    {emailError && <p className="text-xs text-red-500 mt-1 ml-1">{emailError}</p>}
                 </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-[#A69B95] tracking-widest ml-1">À propos de vous</label>
                 <textarea 
                   value={bio}
                   onChange={e => setBio(e.target.value)}
                   placeholder="Dites bonjour à la communauté..."
                   rows={3}
                   maxLength={300}
                   className="w-full p-4 bg-white border border-[#EFEBE9] rounded-xl text-[#2C1810] font-medium focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] outline-none transition-all resize-none placeholder:text-[#D5CCC7]"
                 />
                 <div className="text-right text-[10px] text-[#A69B95]">{bio.length}/300</div>
              </div>
            </div>

            {/* Error & Submit */}
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" /> {error}
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                disabled={submitting || !fullName.trim() || !!emailError}
                className="w-full py-4 text-lg rounded-2xl bg-[#F16522] hover:bg-[#D95318] text-white shadow-xl shadow-[#F16522]/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Finalisation...
                  </>
                ) : (
                  <>
                    Commencer l'aventure <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-[#A69B95] mt-4">
                Vos données sont protégées et ne seront pas partagées sans votre accord.
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
