/**
 * ModernAuthPage - Authentification Premium 2025
 * 3 onglets: Email, Téléphone, Inscription
 * Design harmonisé terracotta
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, Phone, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import { InputWithIcon } from '@/shared/ui';

type Tab = 'email' | 'phone' | 'register';
type PhoneStep = 'enter' | 'verify';

export default function ModernAuthPage() {
  const navigate = useNavigate();

  // State
  const [tab, setTab] = useState<Tab>('email');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('enter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone Auth
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sendMethod, setSendMethod] = useState<'sms' | 'whatsapp'>('sms');
  const [resendTimer, setResendTimer] = useState(0);

  // Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regUserType, setRegUserType] = useState<'locataire' | 'proprietaire' | 'agence'>('locataire');

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [resendTimer]);

  // Email Login Handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  // State for dev mode OTP display
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Send OTP
  const handleSendOTP = async () => {
    setError('');
    setDevOtp(null);
    setLoading(true);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('send-auth-otp', {
        body: { phoneNumber, method: sendMethod },
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Erreur lors de l\'envoi du code');
      }

      // Handle rate limiting (429 response)
      if (data?.rateLimited && data?.retryAfter) {
        setResendTimer(data.retryAfter);
        setError(`Veuillez patienter ${data.retryAfter} secondes avant de renvoyer un code`);
        return;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Dev mode: display OTP if returned by backend (fallback mode)
      if (data?.otp) {
        setDevOtp(data.otp);
        setSuccess(`🧪 Mode dev - Code OTP: ${data.otp}`);
      } else {
        setSuccess(`Code envoyé par ${sendMethod === 'sms' ? 'SMS' : 'WhatsApp'}`);
      }
      
      setPhoneStep('verify');
      setResendTimer(60);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi du code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('verify-auth-otp', {
        body: { phoneNumber, code: otp },
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Code invalide');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.sessionUrl) {
        // Connexion automatique via magic link
        setSuccess(data.isNewUser ? 'Compte créé ! Connexion en cours...' : 'Connexion en cours...');
        window.location.href = data.sessionUrl;
      } else {
        throw new Error('Erreur de connexion - réessayez');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Code invalide ou expiré';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (regPassword !== regConfirm) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      if (regPassword.length < 6) {
        throw new Error('Mot de passe trop court (minimum 6 caractères)');
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            full_name: regName,
            phone: regPhone,
            user_type: regUserType,
          },
        },
      });

      if (signUpError) throw signUpError;

      setSuccess('Compte créé ! Connectez-vous avec votre email.');
      setTimeout(() => {
        setTab('email');
        setEmail(regEmail);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-terracotta-50 to-coral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <Building2 className="h-10 w-10 text-terracotta-600" />
            <span className="text-3xl font-bold bg-gradient-to-r from-terracotta-600 to-coral-600 bg-clip-text text-transparent">
              Mon Toit
            </span>
          </div>
          <p className="text-gray-600">Trouvez votre logement idéal en Côte d'Ivoire</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-scale-in">
          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => { setTab('email'); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 px-2 rounded-xl font-semibold text-sm transition-all ${
                tab === 'email'
                  ? 'bg-gradient-to-r from-terracotta-500 to-coral-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => { setTab('phone'); setError(''); setSuccess(''); setPhoneStep('enter'); }}
              className={`flex-1 py-3 px-2 rounded-xl font-semibold text-sm transition-all ${
                tab === 'phone'
                  ? 'bg-gradient-to-r from-terracotta-500 to-coral-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Téléphone
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 px-2 rounded-xl font-semibold text-sm transition-all ${
                tab === 'register'
                  ? 'bg-gradient-to-r from-terracotta-500 to-coral-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium animate-slide-down">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 text-sm font-medium animate-slide-down">
              {success}
            </div>
          )}

          {/* EMAIL TAB */}
          {tab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <InputWithIcon
                icon={Mail}
                label="Email"
                variant="modern"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoFocus
              />

              <InputWithIcon
                icon={Lock}
                label="Mot de passe"
                variant="modern"
                isPassword
                showPasswordToggle
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate('/mot-de-passe-oublie')}
                  className="text-sm text-terracotta-600 hover:text-terracotta-700 font-semibold"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-terracotta-600 to-coral-600 text-white rounded-xl font-bold text-lg hover:from-terracotta-700 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* PHONE TAB */}
          {tab === 'phone' && (
            <div className="space-y-5">
              {phoneStep === 'enter' ? (
                <>
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion par téléphone</h2>
                    <p className="text-gray-600">Entrez votre numéro pour recevoir un code</p>
                  </div>

                  <InputWithIcon
                    icon={Phone}
                    label="Numéro de téléphone"
                    variant="modern"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+225 07 XX XX XX XX"
                    autoFocus
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Recevoir le code par :</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSendMethod('sms')}
                        className={`py-4 px-4 rounded-xl border-2 font-semibold transition-all ${
                          sendMethod === 'sms'
                            ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700 shadow-md'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        📱 SMS
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendMethod('whatsapp')}
                        className={`py-4 px-4 rounded-xl border-2 font-semibold transition-all ${
                          sendMethod === 'whatsapp'
                            ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700 shadow-md'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        💬 WhatsApp
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={loading || phoneNumber.replace(/\D/g, '').length < 10}
                    className="w-full py-4 bg-gradient-to-r from-terracotta-600 to-coral-600 text-white rounded-xl font-bold text-lg hover:from-terracotta-700 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <span>Envoyer le code</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Entrez le code</h2>
                    <p className="text-gray-600">
                      Code envoyé par {sendMethod === 'sms' ? 'SMS' : 'WhatsApp'} au
                      <br />
                      <span className="font-bold text-gray-900">{phoneNumber}</span>
                    </p>
                  </div>

                  {/* Dev Mode OTP Display */}
                  {devOtp && (
                    <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl animate-pulse">
                      <p className="text-center text-sm text-amber-800 font-medium mb-1">🧪 Mode développement</p>
                      <p className="text-center text-3xl font-mono font-bold text-amber-900 tracking-widest">{devOtp}</p>
                      <button
                        type="button"
                        onClick={() => setOtp(devOtp)}
                        className="w-full mt-2 py-2 text-sm font-semibold text-amber-700 hover:text-amber-900 underline"
                      >
                        Remplir automatiquement
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                      Code de vérification
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100 outline-none transition-all text-center text-3xl font-mono tracking-[0.5em]"
                      maxLength={6}
                      autoFocus
                    />
                  </div>

                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-gray-500 font-medium">
                        Renvoyer dans <span className="text-terracotta-600 font-bold">{resendTimer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        className="text-sm text-terracotta-600 hover:text-terracotta-700 font-bold"
                      >
                        Renvoyer le code
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="w-full py-4 bg-gradient-to-r from-terracotta-600 to-coral-600 text-white rounded-xl font-bold text-lg hover:from-terracotta-700 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Vérification...</span>
                      </>
                    ) : (
                      <>
                        <span>Vérifier et se connecter</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPhoneStep('enter');
                      setOtp('');
                      setError('');
                    }}
                    className="w-full py-3 text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Changer de numéro
                  </button>
                </>
              )}
            </div>
          )}

          {/* REGISTER TAB */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <InputWithIcon
                icon={User}
                label="Nom complet"
                variant="modern"
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Jean Kouassi"
                required
                autoFocus
              />

              <InputWithIcon
                icon={Mail}
                label="Email"
                variant="modern"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />

              <InputWithIcon
                icon={Phone}
                label="Téléphone"
                variant="modern"
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="+225 07 XX XX XX XX"
                required
              />

              <InputWithIcon
                icon={Lock}
                label="Mot de passe"
                variant="modern"
                isPassword
                showPasswordToggle
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                helperText="Minimum 6 caractères"
                required
              />

              <InputWithIcon
                icon={Lock}
                label="Confirmer le mot de passe"
                variant="modern"
                isPassword
                showPasswordToggle={false}
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                placeholder="••••••••"
                required
              />

              {/* Sélection du type d'utilisateur */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Je suis</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegUserType('locataire')}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      regUserType === 'locataire'
                        ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700 shadow-md'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🏠 Locataire
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegUserType('proprietaire')}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      regUserType === 'proprietaire'
                        ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700 shadow-md'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🔑 Propriétaire
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegUserType('agence')}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      regUserType === 'agence'
                        ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700 shadow-md'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🏢 Agence
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-terracotta-600 to-coral-600 text-white rounded-xl font-bold text-lg hover:from-terracotta-700 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Inscription...</span>
                  </>
                ) : (
                  <>
                    <span>Créer mon compte</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <button
            onClick={() => navigate('/')}
            className="hover:text-terracotta-600 font-medium transition-colors"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
