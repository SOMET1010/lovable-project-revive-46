/**
 * ProfileCompletionPage - Version Premium avec NeoFace Integration
 * Flow : Étape 1 (Profil) → Étape 2 (Vérification NeoFace)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, User, MapPin, FileText, Loader2, Check, 
  Mail, Camera, Phone, CheckCircle2, Key, Briefcase, 
  ShieldCheck, Star, ArrowRight, ScanFace, UploadCloud, AlertCircle, RefreshCw, Info
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/shared/ui';
import { supabase } from '@/integrations/supabase/client';
import NeofaceVerification from '@/shared/ui/NeofaceVerification';
import { toast } from 'sonner';

// --- CONFIGURATION ---

const USER_TYPES = [
  { value: 'tenant', label: 'Locataire', description: 'Je cherche mon futur logement', icon: Key },
  { value: 'owner', label: 'Propriétaire', description: 'Je veux louer mes biens', icon: Building2 },
  { value: 'agent', label: 'Agent Immobilier', description: 'Je gère un portefeuille', icon: Briefcase },
] as const;

// Villes ivoiriennes (sans les communes d'Abidjan)
const IVORIAN_CITIES = [
  'Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo',
  'Man', 'Daloa', 'Gagnoa', 'Divo', 'Abengourou',
  'Grand-Bassam', 'Assinie', 'Bingerville', 'Bondoukou', 'Odienné',
  'Séguéla', 'Agboville', 'Dabou', 'Dimbokro', 'Duékoué',
];

// Communes d'Abidjan uniquement
const ABIDJAN_COMMUNES = [
  'Abobo', 'Adjamé', 'Anyama', 'Attécoubé', 'Bingerville',
  'Cocody', 'Koumassi', 'Marcory', 'Plateau', 'Port-Bouët',
  'Songon', 'Treichville', 'Yopougon',
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

// Détecte si l'email est un email technique auto-généré pour les inscriptions par téléphone
const isTechnicalEmail = (email: string): boolean => {
  return email.endsWith('@phone.montoit.ci');
};

// Compress image before upload
const compressImage = async (file: File, maxWidth = 1920, quality = 0.85): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// --- COMPOSANT ---

export default function ProfileCompletionPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cniInputRef = useRef<HTMLInputElement>(null);

  // Flow Step (1: Profile, 2: NeoFace)
  const [step, setStep] = useState(1);

  // États Profil (Step 1)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'tenant' | 'owner' | 'agent'>('tenant');
  const [city, setCity] = useState('');
  const [commune, setCommune] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // États UI Profil
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  // États NeoFace (Step 2)
  const [cniPhotoUrl, setCniPhotoUrl] = useState<string | null>(null);
  const [uploadingCni, setUploadingCni] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');
  const [verificationScore, setVerificationScore] = useState<number | null>(null);

  // Init Data
  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
        if (profile.email && !isTechnicalEmail(profile.email)) {
          setEmail(profile.email);
        }
      if (profile.user_type) setUserType(profile.user_type as 'tenant' | 'owner' | 'agent');
      if (profile.city) setCity(profile.city);
      if (profile.bio) setBio(profile.bio);
      if (profile.avatar_url) {
        setAvatarUrl(profile.avatar_url);
        setAvatarPreview(profile.avatar_url);
      }
      // Pre-fill CNI if exists
      const cniUrl = (profile as { cni_photo_url?: string })?.cni_photo_url;
      if (cniUrl) setCniPhotoUrl(cniUrl);
    }
  }, [profile]);

  // --- HANDLERS PROFIL ---
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

  const goToStep2 = () => {
    setError('');
    if (!fullName.trim()) { setError('Nom requis'); return; }
    if (email && !isValidEmail(email)) { setError('Email invalide'); return; }
    setStep(2);
  };

  // --- HANDLERS NEOFACE ---
  const handleCniUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 10MB)');
      return;
    }

    setUploadingCni(true);
    try {
      const compressedBlob = await compressImage(file, 1920, 0.85);
      
      if (compressedBlob.size > 5 * 1024 * 1024) {
        toast.error('Image trop volumineuse après compression (max 5MB)');
        setUploadingCni(false);
        return;
      }

      const fileName = `${user.id}/cni-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, compressedBlob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setCniPhotoUrl(urlData.publicUrl);

      // Save to profile
      await supabase.from('profiles').update({ cni_photo_url: urlData.publicUrl }).eq('user_id', user.id);
      
      const sizeKB = Math.round(compressedBlob.size / 1024);
      toast.success(`Photo CNI téléchargée (${sizeKB}KB)`);
    } catch (err) {
      console.error('[ProfileCompletion] CNI upload error:', err);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploadingCni(false);
    }
  };

  const handleNeoFaceVerified = async (data: unknown) => {
    const verificationData = data as { matching_score?: number };
    setVerificationStatus('success');
    setVerificationScore(verificationData?.matching_score || null);

    try {
      await supabase.from('profiles').update({
        facial_verification_status: 'verified',
        facial_verification_date: new Date().toISOString(),
        facial_verification_score: verificationData?.matching_score || null,
      }).eq('user_id', user?.id || '');
    } catch (err) {
      console.error('[ProfileCompletion] Profile update error:', err);
    }
  };

  const handleNeoFaceFailed = (errorMsg: string) => {
    setVerificationStatus('failed');
    toast.error(`Vérification échouée: ${errorMsg}`);
  };

  // --- SUBMIT FINAL ---
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      // Si Abidjan avec commune, stocker "Abidjan - Commune"
      const finalCity = city === 'Abidjan' && commune ? `Abidjan - ${commune}` : city || null;
      
      await updateProfile({
        full_name: fullName.trim(),
        email: email.trim() || null,
        user_type: userType,
        city: finalCity,
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
        <div className="absolute inset-0 opacity-30">
           <img src="/images/hero/hero1.jpg" alt="Background" className="w-full h-full object-cover grayscale mix-blend-overlay" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810] via-[#2C1810]/80 to-transparent" />
        
        <div className="relative z-10 space-y-6">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#F16522] rounded-xl flex items-center justify-center shadow-lg">
               <span className="font-bold text-white text-xl">M</span>
             </div>
             <span className="text-white font-bold text-xl tracking-wide">Mon Toit</span>
           </div>
           
           <div className="mt-20">
             <h1 className="text-4xl font-extrabold text-white leading-tight mb-6">
               {step === 1 ? (
                 <>Bienvenue dans la <br/><span className="text-[#F16522]">référence immobilière</span></>
               ) : (
                 <>Sécurité <br/><span className="text-[#F16522]">NeoFace ID</span></>
               )}
             </h1>
             <p className="text-[#E8D4C5] text-lg leading-relaxed max-w-sm">
               {step === 1 
                 ? "Complétez votre profil pour accéder à des milliers de biens vérifiés et interagir avec notre communauté de confiance."
                 : "Nous vérifions votre identité pour garantir une communauté de confiance entre propriétaires et locataires."}
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
           
           {/* Step Indicator */}
           <div className="flex gap-2 mt-6 pt-6 border-t border-white/10">
             <div className={`h-2 rounded-full transition-all duration-500 ${step === 1 ? 'w-12 bg-[#F16522]' : 'w-2 bg-white/20'}`} />
             <div className={`h-2 rounded-full transition-all duration-500 ${step === 2 ? 'w-12 bg-[#F16522]' : 'w-2 bg-white/20'}`} />
           </div>
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

          {/* Back Button (Step 2 only) */}
          {step === 2 && (
            <button 
              onClick={() => setStep(1)} 
              className="flex items-center gap-2 text-[#A69B95] hover:text-[#2C1810] transition-colors mb-4 text-sm font-medium"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> Retour au profil
            </button>
          )}

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#2C1810] mb-2">
              {step === 1 ? "Finalisons votre compte" : "Vérification d'Identité"}
            </h2>
            <p className="text-[#6B5A4E]">
              {step === 1 ? "Cela ne prendra qu'une minute." : "Sécurisez votre compte avec NeoFace."}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2 mb-6">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          {/* ==================== STEP 1: PROFIL ==================== */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); goToStep2(); }} className="space-y-8 animate-in slide-in-from-right duration-300">
              
              {/* 1. PHOTO PROFIL */}
              <div className="flex items-center gap-6 p-6 bg-white rounded-[24px] border border-[#EFEBE9] shadow-sm">
                 <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <div className="w-20 h-20 rounded-full bg-[#FAF7F4] flex items-center justify-center overflow-hidden border-2 border-[#EFEBE9] group-hover:border-[#F16522] transition-all">
                      {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar" /> : <User className="w-8 h-8 text-[#A69B95]" />}
                   </div>
                   <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#2C1810] rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg">
                      {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                   </div>
                 </div>
                 <div>
                   <h3 className="font-bold text-[#2C1810]">Photo de profil</h3>
                   <p className="text-xs text-[#6B5A4E] mt-1 mb-2">Une photo rassure les propriétaires.</p>
                   <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-[#F16522] hover:underline">Choisir une photo</button>
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
                      <button key={type.value} type="button" onClick={() => setUserType(type.value)}
                        className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col justify-between h-32 ${
                          isSelected ? 'border-[#F16522] bg-white shadow-[0_10px_30px_rgba(241,101,34,0.15)] ring-1 ring-[#F16522]' : 'border-transparent bg-white hover:border-[#EFEBE9] shadow-sm hover:shadow-md'
                        }`}>
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
                
                {/* Note explicative multi-rôles */}
                <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <p className="text-blue-800 font-medium">
                      Ce choix définit uniquement votre écran d'accueil.
                    </p>
                    <p className="text-blue-600 mt-1">
                      Vous pourrez à tout moment publier un bien ou chercher un logement. Mon Toit s'adapte automatiquement à vos besoins.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. INFORMATIONS */}
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[#A69B95] tracking-widest ml-1">Nom Complet *</label>
                      <div className="relative group">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A69B95] group-focus-within:text-[#F16522] transition-colors z-10 pointer-events-none" />
                         <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jean Kouassi"
                           className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#EFEBE9] rounded-xl text-[#2C1810] font-medium focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] outline-none transition-all placeholder:text-[#D5CCC7]" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[#A69B95] tracking-widest ml-1">Ville</label>
                      <div className="relative group">
                         <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A69B95] group-focus-within:text-[#F16522] transition-colors z-10 pointer-events-none" />
                         <select value={city} onChange={e => { setCity(e.target.value); setCommune(''); }}
                           className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#EFEBE9] rounded-xl text-[#2C1810] font-medium focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] outline-none transition-all appearance-none cursor-pointer">
                           <option value="">Choisir une ville...</option>
                           {IVORIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                      </div>
                   </div>
                </div>

                {/* Commune (visible uniquement si Abidjan) */}
                {city === 'Abidjan' && (
                  <div className="space-y-2 animate-in slide-in-from-top duration-200">
                    <label className="text-xs font-bold uppercase text-[#A69B95] tracking-widest ml-1">Commune</label>
                    <div className="relative group">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A69B95] group-focus-within:text-[#F16522] transition-colors z-10 pointer-events-none" />
                       <select value={commune} onChange={e => setCommune(e.target.value)}
                         className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#EFEBE9] rounded-xl text-[#2C1810] font-medium focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] outline-none transition-all appearance-none cursor-pointer">
                         <option value="">Choisir une commune...</option>
                         {ABIDJAN_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                  </div>
                )}

                {/* Contact */}
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
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A69B95] group-focus-within:text-[#F16522] transition-colors z-10 pointer-events-none" />
                      <input type="email" value={email} onChange={e => handleEmailChange(e.target.value)} placeholder="Email (Optionnel)"
                        className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl text-[#2C1810] font-medium focus:ring-2 focus:ring-[#F16522]/20 outline-none transition-all placeholder:text-[#D5CCC7] ${emailError ? 'border-red-400' : 'border-[#EFEBE9] focus:border-[#F16522]'}`} />
                      {emailError && <p className="text-xs text-red-500 mt-1 ml-1">{emailError}</p>}
                   </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-[#A69B95] tracking-widest ml-1">À propos de vous</label>
                   <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Dites bonjour à la communauté..." rows={3} maxLength={300}
                     className="w-full p-4 bg-white border border-[#EFEBE9] rounded-xl text-[#2C1810] font-medium focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] outline-none transition-all resize-none placeholder:text-[#D5CCC7]" />
                   <div className="text-right text-[10px] text-[#A69B95]">{bio.length}/300</div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={!fullName.trim() || !!emailError}
                  className="w-full py-4 text-lg rounded-2xl bg-[#2C1810] text-white shadow-xl hover:bg-black font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  Continuer vers la vérification <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </form>
          )}

          {/* ==================== STEP 2: NEOFACE ==================== */}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
              
              {/* Card NeoFace */}
              <div className="bg-white p-8 rounded-[32px] border border-[#EFEBE9] shadow-sm text-center space-y-6">
                
                {/* État: En attente d'upload CNI */}
                {verificationStatus === 'idle' && !cniPhotoUrl && (
                  <>
                    <div className="w-20 h-20 bg-[#F16522]/10 rounded-full flex items-center justify-center mx-auto">
                      <ScanFace className="w-10 h-10 text-[#F16522]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#2C1810]">Vérification Faciale</h3>
                      <p className="text-[#6B5A4E] mt-2 text-sm max-w-xs mx-auto">
                        Téléchargez une photo de votre CNI. Nous comparerons votre visage.
                      </p>
                    </div>

                    <label className="block">
                      <div className="border-2 border-dashed border-[#EFEBE9] rounded-2xl p-8 hover:border-[#F16522] hover:bg-[#FAF7F4] transition-all cursor-pointer group">
                        <UploadCloud className="w-10 h-10 text-[#A69B95] group-hover:text-[#F16522] mx-auto mb-3" />
                        <span className="text-sm font-bold text-[#2C1810]">
                          {uploadingCni ? 'Compression...' : 'Cliquez pour uploader'}
                        </span>
                        <p className="text-xs text-[#A69B95] mt-1">JPG, PNG (max 10Mo)</p>
                      </div>
                      <input ref={cniInputRef} type="file" accept="image/*" onChange={handleCniUpload} className="hidden" disabled={uploadingCni} />
                    </label>
                  </>
                )}

                {/* État: CNI uploadée, prêt pour vérification */}
                {verificationStatus === 'idle' && cniPhotoUrl && (
                  <>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#2C1810]">Photo CNI Prête</h3>
                      <p className="text-[#6B5A4E] mt-2 text-sm">Lancez la vérification NeoFace.</p>
                    </div>
                    
                    <div className="flex justify-center">
                      <img src={cniPhotoUrl} alt="CNI" className="max-w-xs rounded-xl border shadow-md" />
                    </div>
                    
                    <label className="block">
                      <div className="flex items-center justify-center gap-2 py-2 px-4 border border-[#F16522] text-[#F16522] rounded-lg cursor-pointer hover:bg-[#F16522]/10 transition-colors text-sm font-medium">
                        <RefreshCw className="h-4 w-4" />
                        {uploadingCni ? 'Compression...' : 'Remplacer la photo'}
                      </div>
                      <input type="file" accept="image/*" onChange={handleCniUpload} className="hidden" disabled={uploadingCni} />
                    </label>

                    {/* NeoFace Component */}
                    {user && (
                      <NeofaceVerification
                        userId={user.id}
                        cniPhotoUrl={cniPhotoUrl}
                        onVerified={handleNeoFaceVerified}
                        onFailed={handleNeoFaceFailed}
                      />
                    )}
                  </>
                )}

                {/* État: Succès */}
                {verificationStatus === 'success' && (
                  <div className="py-8 space-y-6 animate-in zoom-in">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-12 h-12 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#2C1810]">Identité Confirmée !</h3>
                      {verificationScore && (
                        <p className="text-green-600 font-medium mt-2">
                          Score : {(verificationScore * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                    <Button onClick={handleFinalSubmit} disabled={submitting}
                      className="w-full py-4 rounded-2xl bg-[#2C1810] text-white font-bold shadow-xl hover:bg-black">
                      {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Accéder à mon espace"}
                    </Button>
                  </div>
                )}

                {/* État: Échec */}
                {verificationStatus === 'failed' && (
                  <div className="py-8 space-y-4">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <p className="text-red-600 font-bold">La vérification a échoué.</p>
                    <button onClick={() => setVerificationStatus('idle')} className="text-[#F16522] underline text-sm font-medium">
                      Réessayer
                    </button>
                  </div>
                )}
              </div>
              
              {/* Skip Button */}
              {verificationStatus !== 'success' && (
                <div className="text-center">
                  <button onClick={handleFinalSubmit} disabled={submitting}
                    className="text-[#A69B95] text-xs hover:text-[#2C1810] underline transition-colors">
                    {submitting ? 'Enregistrement...' : 'Passer cette étape (profil non vérifié)'}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
