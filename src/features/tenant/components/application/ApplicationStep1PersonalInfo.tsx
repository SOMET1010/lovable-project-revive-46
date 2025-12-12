import { User, CheckCircle, AlertCircle, Shield, Phone, Mail, MapPin, Briefcase, Users } from 'lucide-react';
import { ScoreBadge } from '@/shared/ui/ScoreBadge';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  occupation: string | null;
  employer: string | null;
  monthly_income: number | null;
  trust_score: number | null;
  is_verified: boolean | null;
}

interface ApplicationStep1PersonalInfoProps {
  profile: Profile | null;
  userEmail: string | null | undefined;
  applicationScore: number;
  isVerified: boolean;
  onNext: () => void;
}

export default function ApplicationStep1PersonalInfo({
  profile,
  userEmail,
  applicationScore,
  isVerified,
  onNext
}: ApplicationStep1PersonalInfoProps) {
  return (
    <div className="space-y-6">
      {/* Profil candidat */}
      <div className="bg-[#FAF7F4] rounded-xl p-6 border border-[#EFEBE9]">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#F16522]/10 flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-[#F16522]" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#2C1810]">
              {profile?.full_name || 'Utilisateur'}
            </h3>
            <p className="text-[#A69B95]">Candidat</p>
          </div>
          <ScoreBadge score={profile?.trust_score || 0} size="lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-[#6B5A4E]">
            <Mail className="w-5 h-5 text-[#A69B95]" />
            <span>{userEmail || 'Non renseigné'}</span>
          </div>
          <div className="flex items-center gap-3 text-[#6B5A4E]">
            <Phone className="w-5 h-5 text-[#A69B95]" />
            <span>{profile?.phone || 'Non renseigné'}</span>
          </div>
          <div className="flex items-center gap-3 text-[#6B5A4E]">
            <MapPin className="w-5 h-5 text-[#A69B95]" />
            <span>{profile?.city || 'Non renseigné'}</span>
          </div>
          <div className="flex items-center gap-3 text-[#6B5A4E]">
            <Briefcase className="w-5 h-5 text-[#A69B95]" />
            <span>{profile?.occupation || 'Non renseigné'}</span>
          </div>
          {profile?.employer && (
            <div className="flex items-center gap-3 text-[#6B5A4E]">
              <Users className="w-5 h-5 text-[#A69B95]" />
              <span>{profile.employer}</span>
            </div>
          )}
          {profile?.monthly_income && (
            <div className="flex items-center gap-3 text-[#6B5A4E]">
              <span className="text-[#A69B95] font-medium">Revenus:</span>
              <span>{profile.monthly_income.toLocaleString()} FCFA/mois</span>
            </div>
          )}
        </div>
      </div>

      {/* Vérification */}
      <div className={`rounded-xl p-5 border ${isVerified ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-center gap-3">
          {isVerified ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Profil vérifié</p>
                <p className="text-sm text-green-600">Votre identité a été confirmée</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-800">Vérification en attente</p>
                <p className="text-sm text-amber-600">Complétez la vérification pour améliorer votre dossier</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Score de candidature */}
      <div className="bg-white rounded-xl p-6 border border-[#EFEBE9]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-[#2C1810] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#F16522]" />
            Score de votre candidature
          </h4>
          <span className={`text-2xl font-bold ${applicationScore >= 70 ? 'text-green-600' : applicationScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
            {applicationScore}/100
          </span>
        </div>
        <div className="w-full bg-[#EFEBE9] rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all ${applicationScore >= 70 ? 'bg-green-500' : applicationScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${applicationScore}%` }}
          />
        </div>
        <p className="text-sm text-[#A69B95] mt-3">
          {applicationScore >= 70 
            ? 'Excellent dossier ! Vos chances d\'acceptation sont élevées.'
            : applicationScore >= 50 
            ? 'Bon dossier. Ajoutez plus d\'informations pour l\'améliorer.'
            : 'Complétez votre profil et vérifiez votre identité pour améliorer votre score.'}
        </p>
      </div>

      {/* Bouton suivant */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          className="bg-[#F16522] hover:bg-[#d9571d] text-white font-semibold py-3 px-8 rounded-xl transition-colors"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
