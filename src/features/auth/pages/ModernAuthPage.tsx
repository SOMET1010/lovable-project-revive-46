/**
 * ModernAuthPage - Authentification simplifiée pour la Côte d'Ivoire
 * Téléphone = méthode principale (pas d'email requis)
 * Email = option secondaire
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Mail, Lock, User, Phone, Loader2, ArrowRight, ArrowLeft, Smartphone } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import { InputWithIcon } from '@/shared/ui';

type MainTab = 'login' | 'register';
type AuthMethod = 'phone' | 'email'; // Phone first!
type PhoneStep = 'enter' | 'verify';

export default function ModernAuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialTab = (): MainTab => {
    if (location.pathname === '/inscription') return 'register';
    return 'login';
  };

  // State
  const [mainTab, setMainTab] = useState<MainTab>(getInitialTab);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone'); // Default to phone!
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('enter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Phone fields - restore from location.state if available
  const savedPhone = (location.state as { phoneNumber?: string; fullName?: string })?.phoneNumber || '';
  const savedName = (location.state as { phoneNumber?: string; fullName?: string })?.fullName || '';
  
  const [phoneNumber, setPhoneNumber] = useState(savedPhone);
  const [otp, setOtp] = useState('');
  const [sendMethod, setSendMethod] = useState<'sms' | 'whatsapp'>('whatsapp');
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  
  // Initialize fullName from saved state (only once)
  useEffect(() => {
    if (savedName && !fullName) {
      setFullName(savedName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [resendTimer]);

  // Sync URL → Tab (but preserve phone data)
  useEffect(() => {
    const expectedTab: MainTab = location.pathname === '/inscription' ? 'register' : 'login';
    if (mainTab !== expectedTab) {
      setMainTab(expectedTab);
      setPhoneStep('enter');
      setError('');
      setSuccess('');
      setOtp('');
      setDevOtp(null);
      // Phone number preserved via location.state - don't reset it
    }
  }, [location.pathname]);

  const handleMainTabChange = (tab: MainTab) => {
    const targetPath = tab === 'register' ? '/inscription' : '/connexion';
    navigate(targetPath, { replace: true });
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
          data: { full_name: fullName },
        },
      });

      if (signUpError) throw signUpError;

      setSuccess('Compte créé ! Vous pouvez maintenant vous connecter.');
      setTimeout(() => handleMainTabChange('login'), 2000);
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

      // Handle account not found - preserve phone number
      if (data?.accountNotFound) {
        setSuccess('');
        navigate('/inscription', { 
          replace: true, 
          state: { phoneNumber, fullName } 
        });
        setError('Aucun compte trouvé. Créez un compte avec ce numéro.');
        setLoading(false);
        return;
      }

      // Handle rate limiting
      if (data?.rateLimited && data?.retryAfter) {
        setResendTimer(data.retryAfter);
        setError(`Patientez ${data.retryAfter} secondes`);
        return;
      }

      if (invokeError) {
        throw new Error(invokeError.message || 'Erreur lors de l\'envoi du code');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Dev mode OTP display
      if (data?.otp) {
        setDevOtp(data.otp);
        setSuccess(`🧪 Mode dev - Code: ${data.otp}`);
      } else {
        setSuccess(`Code envoyé par ${sendMethod === 'sms' ? 'SMS' : 'WhatsApp'} !`);
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
          <p className="text-gray-600">Trouvez votre logement en Côte d'Ivoire</p>
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

          {/* Method selector - Phone is PRIMARY */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => handleMethodChange('phone')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium border-2 transition-all flex items-center justify-center gap-2 ${
                authMethod === 'phone'
                  ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Smartphone className="h-5 w-5" />
              <span>Téléphone</span>
              <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">Recommandé</span>
            </button>
            <button
              onClick={() => handleMethodChange('email')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium border-2 transition-all flex items-center justify-center gap-2 ${
                authMethod === 'email'
                  ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Mail className="h-5 w-5" />
              <span>Email</span>
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

          {/* ==================== PHONE AUTH (Both Login & Register) ==================== */}
          {authMethod === 'phone' && (
            <div className="space-y-5">
              {phoneStep === 'enter' ? (
                <>
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {mainTab === 'login' ? 'Connectez-vous' : 'Créez votre compte'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {mainTab === 'login' 
                        ? 'Avec votre numéro de téléphone' 
                        : 'Inscription rapide sans email'}
                    </p>
                  </div>

                  {/* Name field only for registration */}
                  {mainTab === 'register' && (
                    <InputWithIcon
                      icon={User}
                      label="Votre nom"
                      variant="modern"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Jean Kouassi"
                      required
                      autoFocus
                    />
                  )}

                  <InputWithIcon
                    icon={Phone}
                    label="Numéro de téléphone"
                    variant="modern"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="07 XX XX XX XX"
                    autoFocus={mainTab === 'login'}
                  />

                  {/* Send method selector */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recevoir le code par :
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSendMethod('whatsapp')}
                        className={`py-3 px-4 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                          sendMethod === 'whatsapp'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        💬 WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendMethod('sms')}
                        className={`py-3 px-4 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                          sendMethod === 'sms'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        📱 SMS
                      </button>
                    </div>
                  </div>

                  {/* Info box */}
                  {mainTab === 'login' && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-blue-800">
                        Vous recevrez un code à 6 chiffres pour vous connecter.
                      </p>
                    </div>
                  )}

                  {mainTab === 'register' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-800">
                        ✓ Inscription simple et rapide<br />
                        ✓ Pas besoin d'adresse email
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleSendOTP}
                    disabled={
                      loading || 
                      phoneNumber.replace(/\D/g, '').length < 10 || 
                      (mainTab === 'register' && !fullName.trim())
                    }
                    className="w-full py-4 bg-gradient-to-r from-terracotta-600 to-coral-600 text-white rounded-xl font-bold text-lg hover:from-terracotta-700 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /><span>Envoi en cours...</span></>
                    ) : (
                      <><span>Recevoir mon code</span><ArrowRight className="h-5 w-5" /></>
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

          {/* ==================== EMAIL LOGIN ==================== */}
          {mainTab === 'login' && authMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Connexion par email</h2>
                <p className="text-gray-500 text-sm">Entrez vos identifiants</p>
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

          {/* ==================== EMAIL REGISTER ==================== */}
          {mainTab === 'register' && authMethod === 'email' && (
            <form onSubmit={handleEmailRegister} className="space-y-5">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Inscription par email</h2>
                <p className="text-gray-500 text-sm">Créez votre compte avec email</p>
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

          {/* Footer link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {mainTab === 'login' ? (
                <>Pas de compte ? <button onClick={() => handleMainTabChange('register')} className="text-terracotta-600 font-semibold hover:underline">Inscrivez-vous</button></>
              ) : (
                <>Déjà inscrit ? <button onClick={() => handleMainTabChange('login')} className="text-terracotta-600 font-semibold hover:underline">Connectez-vous</button></>
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
        <h2 className="text-xl font-bold text-gray-900 mb-2">Entrez votre code</h2>
        <p className="text-gray-600 text-sm">
          Code envoyé par {sendMethod === 'sms' ? 'SMS' : 'WhatsApp'} au
          <br />
          <span className="font-bold text-gray-900">{phoneNumber}</span>
        </p>
      </div>

      {/* Dev Mode OTP */}
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
          Code à 6 chiffres
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

      <div className="text-center mt-4">
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
        className="w-full mt-4 py-4 bg-gradient-to-r from-terracotta-600 to-coral-600 text-white rounded-xl font-bold text-lg hover:from-terracotta-700 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="h-5 w-5 animate-spin" /><span>Vérification...</span></>
        ) : (
          <><span>Valider</span><ArrowRight className="h-5 w-5" /></>
        )}
      </button>
    </>
  );
}
