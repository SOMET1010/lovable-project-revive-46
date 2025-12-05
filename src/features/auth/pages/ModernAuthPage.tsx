/**
 * ModernAuthPage - Authentification Premium 2025
 * 2 onglets principaux: Connexion / Inscription
 * Sous-options: Email ou Téléphone
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, Phone, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import { InputWithIcon } from '@/shared/ui';

type MainTab = 'login' | 'register';
type AuthMethod = 'email' | 'phone';
type PhoneStep = 'enter' | 'verify';

export default function ModernAuthPage() {
  const navigate = useNavigate();

  // State
  const [mainTab, setMainTab] = useState<MainTab>('login');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('enter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Phone fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sendMethod, setSendMethod] = useState<'sms' | 'whatsapp'>('sms');
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [resendTimer]);

  // Reset state when changing tabs
  const handleMainTabChange = (tab: MainTab) => {
    setMainTab(tab);
    setAuthMethod('email');
    setPhoneStep('enter');
    setError('');
    setSuccess('');
    setOtp('');
    setDevOtp(null);
  };

  const handleMethodChange = (method: AuthMethod) => {
    setAuthMethod(method);
    setPhoneStep('enter');
    setError('');
    setSuccess('');
    setOtp('');
    setDevOtp(null);
  };

  // ===================== EMAIL LOGIN =====================
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Email ou mot de passe incorrect';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ===================== EMAIL REGISTER =====================
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      if (password.length < 6) {
        throw new Error('Mot de passe trop court (minimum 6 caractères)');
      }
      if (!fullName.trim()) {
        throw new Error('Veuillez entrer votre nom complet');
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      setSuccess('Compte créé ! Vous pouvez maintenant vous connecter.');
      setTimeout(() => {
        setMainTab('login');
        setAuthMethod('email');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ===================== PHONE - SEND OTP =====================
  const handleSendOTP = async () => {
    setError('');
    setDevOtp(null);
    setLoading(true);

    try {
      const mode = mainTab === 'login' ? 'login' : 'register';
      
      const { data, error: invokeError } = await supabase.functions.invoke('send-auth-otp', {
        body: { 
          phoneNumber, 
          method: sendMethod,
          mode,
          fullName: mode === 'register' ? fullName : undefined,
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Erreur lors de l\'envoi du code');
      }

      // Handle rate limiting
      if (data?.rateLimited && data?.retryAfter) {
        setResendTimer(data.retryAfter);
        setError(`Veuillez patienter ${data.retryAfter} secondes`);
        return;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Dev mode OTP display
      if (data?.otp) {
        setDevOtp(data.otp);
        setSuccess(`🧪 Mode dev - Code: ${data.otp}`);
      } else {
        setSuccess(`Code envoyé par ${sendMethod === 'sms' ? 'SMS' : 'WhatsApp'}`);
      }
      
      setPhoneStep('verify');
      setResendTimer(60);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ===================== PHONE - VERIFY OTP =====================
  const handleVerifyOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const mode = mainTab === 'login' ? 'login' : 'register';
      
      const { data, error: invokeError } = await supabase.functions.invoke('verify-auth-otp', {
        body: { 
          phoneNumber, 
          code: otp,
          mode,
          fullName: mode === 'register' ? fullName : undefined,
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Code invalide');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.sessionUrl) {
        setSuccess(data.isNewUser ? 'Compte créé ! Connexion...' : 'Connexion en cours...');
        
        if (data.needsProfileCompletion) {
          sessionStorage.setItem('needsProfileCompletion', 'true');
        }
        
        window.location.href = data.sessionUrl;
      } else {
        throw new Error('Erreur de connexion');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Code invalide ou expiré';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ===================== RENDER =====================
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
          
          {/* Main Tabs: Connexion / Inscription */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => handleMainTabChange('login')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                mainTab === 'login'
                  ? 'bg-gradient-to-r from-terracotta-500 to-coral-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => handleMainTabChange('register')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                mainTab === 'register'
                  ? 'bg-gradient-to-r from-terracotta-500 to-coral-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Sub-method: Email / Téléphone */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => handleMethodChange('email')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-2 ${
                authMethod === 'email'
                  ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button
              onClick={() => handleMethodChange('phone')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-2 ${
                authMethod === 'phone'
                  ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Phone className="h-4 w-4" />
              Téléphone
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

          {/* ==================== CONNEXION + EMAIL ==================== */}
          {mainTab === 'login' && authMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Connectez-vous</h2>
                <p className="text-gray-500 text-sm">Avec votre email et mot de passe</p>
              </div>

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
                  <><Loader2 className="h-5 w-5 animate-spin" /><span>Connexion...</span></>
                ) : (
                  <><span>Se connecter</span><ArrowRight className="h-5 w-5" /></>
                )}
              </button>
            </form>
          )}

          {/* ==================== CONNEXION + PHONE ==================== */}
          {mainTab === 'login' && authMethod === 'phone' && (
            <div className="space-y-5">
              {phoneStep === 'enter' ? (
                <>
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Connectez-vous</h2>
                    <p className="text-gray-500 text-sm">Recevez un code sur votre téléphone</p>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Recevoir par :</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSendMethod('sms')}
                        className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                          sendMethod === 'sms'
                            ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        📱 SMS
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendMethod('whatsapp')}
                        className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                          sendMethod === 'whatsapp'
                            ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        💬 WhatsApp
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-800">
                      ⚠️ Vous devez avoir un compte existant. <button onClick={() => handleMainTabChange('register')} className="font-bold underline">Créer un compte</button>
                    </p>
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={loading || phoneNumber.replace(/\D/g, '').length < 10}
                    className="w-full py-4 bg-gradient-to-r from-terracotta-600 to-coral-600 text-white rounded-xl font-bold text-lg hover:from-terracotta-700 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /><span>Envoi...</span></>
                    ) : (
                      <><span>Recevoir le code</span><ArrowRight className="h-5 w-5" /></>
                    )}
                  </button>
                </>
              ) : (
                <OTPVerifyStep
                  phoneNumber={phoneNumber}
                  sendMethod={sendMethod}
                  otp={otp}
                  setOtp={setOtp}
                  devOtp={devOtp}
                  resendTimer={resendTimer}
                  loading={loading}
                  onVerify={handleVerifyOTP}
                  onResend={handleSendOTP}
                  onBack={() => setPhoneStep('enter')}
                />
              )}
            </div>
          )}

          {/* ==================== INSCRIPTION + EMAIL ==================== */}
          {mainTab === 'register' && authMethod === 'email' && (
            <form onSubmit={handleEmailRegister} className="space-y-5">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Créez votre compte</h2>
                <p className="text-gray-500 text-sm">Inscription avec email et mot de passe</p>
              </div>

              <InputWithIcon
                icon={User}
                label="Nom complet"
                variant="modern"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jean Kouassi"
                required
                autoFocus
              />

              <InputWithIcon
                icon={Mail}
                label="Email"
                variant="modern"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />

              <InputWithIcon
                icon={Lock}
                label="Mot de passe"
                variant="modern"
                isPassword
                showPasswordToggle
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                required
              />

              <InputWithIcon
                icon={Lock}
                label="Confirmer le mot de passe"
                variant="modern"
                isPassword
                showPasswordToggle
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre mot de passe"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-terracotta-600 to-coral-600 text-white rounded-xl font-bold text-lg hover:from-terracotta-700 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /><span>Création...</span></>
                ) : (
                  <><span>Créer mon compte</span><ArrowRight className="h-5 w-5" /></>
                )}
              </button>
            </form>
          )}

          {/* ==================== INSCRIPTION + PHONE ==================== */}
          {mainTab === 'register' && authMethod === 'phone' && (
            <div className="space-y-5">
              {phoneStep === 'enter' ? (
                <>
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Créez votre compte</h2>
                    <p className="text-gray-500 text-sm">Inscription rapide par téléphone</p>
                  </div>

                  <InputWithIcon
                    icon={User}
                    label="Nom complet"
                    variant="modern"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jean Kouassi"
                    required
                    autoFocus
                  />

                  <InputWithIcon
                    icon={Phone}
                    label="Numéro de téléphone"
                    variant="modern"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+225 07 XX XX XX XX"
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Recevoir par :</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSendMethod('sms')}
                        className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                          sendMethod === 'sms'
                            ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        📱 SMS
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendMethod('whatsapp')}
                        className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                          sendMethod === 'whatsapp'
                            ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        💬 WhatsApp
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      ℹ️ Après vérification, vous compléterez votre profil pour accéder à toutes les fonctionnalités.
                    </p>
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={loading || phoneNumber.replace(/\D/g, '').length < 10 || !fullName.trim()}
                    className="w-full py-4 bg-gradient-to-r from-terracotta-600 to-coral-600 text-white rounded-xl font-bold text-lg hover:from-terracotta-700 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /><span>Envoi...</span></>
                    ) : (
                      <><span>Recevoir le code</span><ArrowRight className="h-5 w-5" /></>
                    )}
                  </button>
                </>
              ) : (
                <OTPVerifyStep
                  phoneNumber={phoneNumber}
                  sendMethod={sendMethod}
                  otp={otp}
                  setOtp={setOtp}
                  devOtp={devOtp}
                  resendTimer={resendTimer}
                  loading={loading}
                  onVerify={handleVerifyOTP}
                  onResend={handleSendOTP}
                  onBack={() => setPhoneStep('enter')}
                />
              )}
            </div>
          )}

          {/* Footer link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {mainTab === 'login' ? (
                <>Pas encore de compte ? <button onClick={() => handleMainTabChange('register')} className="text-terracotta-600 font-semibold hover:underline">Inscrivez-vous</button></>
              ) : (
                <>Déjà un compte ? <button onClick={() => handleMainTabChange('login')} className="text-terracotta-600 font-semibold hover:underline">Connectez-vous</button></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== OTP VERIFY STEP COMPONENT =====================
interface OTPVerifyStepProps {
  phoneNumber: string;
  sendMethod: 'sms' | 'whatsapp';
  otp: string;
  setOtp: (otp: string) => void;
  devOtp: string | null;
  resendTimer: number;
  loading: boolean;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
}

function OTPVerifyStep({
  phoneNumber,
  sendMethod,
  otp,
  setOtp,
  devOtp,
  resendTimer,
  loading,
  onVerify,
  onResend,
  onBack,
}: OTPVerifyStepProps) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Modifier le numéro
      </button>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Entrez le code</h2>
        <p className="text-gray-600 text-sm">
          Code envoyé par {sendMethod === 'sms' ? 'SMS' : 'WhatsApp'} au
          <br />
          <span className="font-bold text-gray-900">{phoneNumber}</span>
        </p>
      </div>

      {/* Dev Mode OTP */}
      {devOtp && (
        <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl animate-pulse">
          <p className="text-center text-sm text-amber-800 font-medium mb-1">🧪 Mode dev</p>
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
            onClick={onResend}
            className="text-sm text-terracotta-600 hover:text-terracotta-700 font-bold"
          >
            Renvoyer le code
          </button>
        )}
      </div>

      <button
        onClick={onVerify}
        disabled={loading || otp.length !== 6}
        className="w-full py-4 bg-gradient-to-r from-terracotta-600 to-coral-600 text-white rounded-xl font-bold text-lg hover:from-terracotta-700 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="h-5 w-5 animate-spin" /><span>Vérification...</span></>
        ) : (
          <><span>Vérifier</span><ArrowRight className="h-5 w-5" /></>
        )}
      </button>
    </>
  );
}
