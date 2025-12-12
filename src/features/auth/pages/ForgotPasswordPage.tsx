import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, KeyRound, Shield } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { InputWithIcon } from '@/shared/ui';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Adresse email invalide');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const { error: resetError } = await resetPassword(email);

      if (resetError) {
        if (resetError.message?.includes('Aucun compte')) {
          setError('Aucun compte associé à cette adresse email. Veuillez vérifier votre email ou créer un compte.');
        } else {
          setError('Erreur lors de l\'envoi du lien de réinitialisation. Veuillez réessayer.');
        }
        return;
      }

      setSuccess(true);
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      setError('Une erreur est survenue. Veuillez réessayer ou contacter le support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/connexion')}
          className="mb-6 flex items-center gap-2 text-[#F16522] hover:text-[#d9571d] transition-colors font-semibold"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour à la connexion</span>
        </button>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-[#FFF5F0] rounded-full flex items-center justify-center mb-4">
              <KeyRound className="h-8 w-8 text-[#F16522]" />
            </div>
            <h2 className="text-2xl font-bold text-[#2C1810]">
              Mot de passe oublié ?
            </h2>
            <p className="text-[#6B5A4E] mt-2">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {!success ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <InputWithIcon
                  icon={Mail}
                  label="Adresse email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  error={error}
                  disabled={loading}
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F16522] hover:bg-[#d9571d] text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Envoi en cours...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <KeyRound className="w-5 h-5" />
                      <span>Envoyer le lien</span>
                    </span>
                  )}
                </button>
              </form>

              {/* Security Info */}
              <div className="p-4 bg-[#FFF5F0] border border-[#F16522]/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-[#F16522] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-[#2C1810]">
                    <p className="font-semibold mb-1">Sécurité :</p>
                    <p>
                      Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation valide pendant 30 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-[#2E7D32]" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#2C1810] mb-2">
                  Email envoyé !
                </h3>
                <p className="text-[#6B5A4E]">
                  Si un compte est associé à <strong>{email}</strong>, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
                </p>
              </div>

              <div className="p-4 bg-[#FFF3E0] border border-[#ED6C02]/20 rounded-xl text-left">
                <p className="text-sm text-[#ED6C02] font-medium mb-2">
                  Vous n'avez pas reçu l'email ?
                </p>
                <ul className="text-xs text-[#6B5A4E] space-y-1 list-disc list-inside">
                  <li>Vérifiez votre dossier spam ou courrier indésirable</li>
                  <li>Assurez-vous d'avoir saisi la bonne adresse email</li>
                  <li>Patientez quelques minutes (délai de livraison possible)</li>
                </ul>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                    setError('');
                  }}
                  className="text-[#F16522] hover:text-[#d9571d] font-semibold text-sm transition-colors"
                >
                  Réessayer avec une autre adresse
                </button>

                <button
                  onClick={() => navigate('/connexion')}
                  className="text-[#6B5A4E] hover:text-[#2C1810] font-medium text-sm transition-colors"
                >
                  Retour à la connexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
