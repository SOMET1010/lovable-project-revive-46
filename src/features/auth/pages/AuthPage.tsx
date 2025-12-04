import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/services/supabase/client';
import { Mail, Lock, User, Shield, CheckCircle, Chrome, Facebook, KeyRound, ArrowLeft, Phone, Home, MessageCircle } from 'lucide-react';
import { PhoneInput } from '@/shared/components/PhoneInput';

export default function Auth() {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const [isLogin, setIsLogin] = useState(currentPath === '/connexion');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'locataire' | 'proprietaire' | 'agence'>('locataire');
  const [verificationType, setVerificationType] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', color: '' });

  const { signIn, signUp, signInWithProvider, resetPassword } = useAuth();

  const validatePassword = (pwd: string) => {
    const hasMinLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    const score = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;

    if (score <= 2) {
      return { score, message: 'Mot de passe faible', color: 'text-red-600', valid: false };
    } else if (score === 3 || score === 4) {
      return { score, message: 'Mot de passe moyen', color: 'text-amber-600', valid: hasMinLength };
    } else {
      return { score, message: 'Mot de passe fort', color: 'text-green-600', valid: true };
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+225\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        if (!email) {
          setError('Veuillez entrer votre adresse email');
          setLoading(false);
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 800));

        const { error } = await resetPassword(email);
        if (error) {
          if (error.message?.includes('Aucun compte')) {
            setError('Aucun compte associé à cette adresse email. Veuillez vérifier votre email ou créer un compte.');
          } else {
            setError(error.message || 'Erreur lors de l\'envoi du lien de réinitialisation');
          }
          return;
        }
        setSuccess('Email de réinitialisation envoyé ! Vérifiez votre boîte de réception (et vos spams).');
        setTimeout(() => {
          setIsForgotPassword(false);
          setIsLogin(true);
          setSuccess('');
        }, 5000);
      } else if (isLogin) {
        if (loginMethod === 'phone') {
          if (!phone) {
            setError('Veuillez entrer votre numéro de téléphone');
            return;
          }

          if (!validatePhone(phone)) {
            setError('Numéro de téléphone invalide. Format: +225 XX XX XX XX XX');
            return;
          }

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, phone, full_name')
            .eq('phone', phone)
            .single();

          if (profileError || !profileData) {
            setError('Aucun compte trouvé avec ce numéro de téléphone. Veuillez vous inscrire.');
            return;
          }

          try {
            const otpType = verificationType === 'email' ? 'sms' : verificationType;
            const { data: _otpData, error: otpError } = await supabase.functions.invoke('send-verification-code', {
              body: {
                phone: phone,
                type: otpType,
                name: profileData.full_name,
                isLogin: true
              }
            });

            if (otpError) {
              console.error('OTP send error:', otpError);
              setError('Erreur lors de l\'envoi du code de vérification. Veuillez réessayer.');
              return;
            }

            const methodName = otpType === 'whatsapp' ? 'WhatsApp' : 'SMS';
            setSuccess(`Code de vérification envoyé par ${methodName}`);
            
            setTimeout(() => {
              navigate('/verification-otp', {
                state: {
                  phone: phone,
                  type: otpType,
                  name: profileData.full_name,
                  isLogin: true
                }
              });
            }, 1500);
          } catch (otpErr: unknown) {
            console.error('OTP error:', otpErr);
            setError('Erreur lors de l\'envoi du code. Veuillez réessayer.');
          }
        } else {
          const { error } = await signIn(email, password);
          if (error) throw error;

          const pendingAction = sessionStorage.getItem('pendingAction');
          if (pendingAction) {
            try {
              const action = JSON.parse(pendingAction);
              sessionStorage.removeItem('pendingAction');
              if (action.action === 'apply') {
                window.location.href = `/candidature/${action.propertyId}`;
              } else if (action.action === 'visit') {
                window.location.href = `/visiter/${action.propertyId}`;
              } else {
                window.location.href = '/';
              }
            } catch (_e) {
              window.location.href = '/';
            }
          } else {
            window.location.href = '/';
          }
        }
      } else {
        if (verificationType === 'email') {
          if (!email || !validateEmail(email)) {
            setError('Adresse email invalide. Veuillez entrer une adresse email valide.');
            return;
          }
        }

        if (verificationType === 'sms' || verificationType === 'whatsapp') {
          if (!phone || !validatePhone(phone)) {
            setError('Numéro de téléphone invalide. Format: +225 XX XX XX XX XX');
            return;
          }
        }

        if (verificationType === 'email') {
          const pwdValidation = validatePassword(password);
          if (!pwdValidation.valid) {
            setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
            return;
          }
          
          const { error } = await signUp(email, password, { full_name: fullName, phone: phone || '', user_type: userType });
          if (error) {
            console.error('Signup error:', error);
            if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
              setError('Cet email est déjà utilisé. Connectez-vous.');
            } else if (error.message?.includes('Database error')) {
              setError('Erreur de base de données. Veuillez réessayer ou contacter le support.');
            } else {
              setError(error.message || 'Erreur lors de l\'inscription');
            }
            return;
          }
        } else {
          const tempPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);
          const tempEmail = email || `${phone.replace(/\+/g, '').replace(/\s/g, '')}@temp.montoit.ci`;
          
          const { error } = await signUp(tempEmail, tempPassword, { 
            full_name: fullName, 
            phone: phone,
            user_type: userType
          });
          if (error) {
            console.error('Signup error:', error);
            if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
              setError('Ce numéro est déjà utilisé. Connectez-vous.');
            } else if (error.message?.includes('Database error')) {
              setError('Erreur de base de données. Veuillez réessayer ou contacter le support.');
            } else {
              setError(error.message || 'Erreur lors de l\'inscription');
            }
            return;
          }
        }
        
        const finalVerificationType = verificationType;
        const finalEmail = verificationType === 'email' ? email : undefined;
        const finalPhone = (verificationType === 'sms' || verificationType === 'whatsapp') ? phone : undefined;
        
        try {
          const { data: _otpData2, error: otpError } = await supabase.functions.invoke('send-verification-code', {
            body: {
              email: finalEmail,
              phone: finalPhone,
              type: finalVerificationType,
              name: fullName
            }
          });

          if (otpError) {
            console.error('OTP send error:', otpError);
            setError('Inscription réussie mais erreur d\'envoi du code de vérification. Veuillez vous reconnecter.');
            return;
          }

          const methodName = finalVerificationType === 'email' ? 'email' : finalVerificationType === 'whatsapp' ? 'WhatsApp' : 'SMS';
          setSuccess(`Inscription réussie ! Code de vérification envoyé par ${methodName}`);
          
          setTimeout(() => {
            navigate('/verify-otp', {
              state: {
                email: finalEmail,
                phone: finalPhone,
                type: finalVerificationType,
                name: fullName
              }
            });
          }, 1500);
        } catch (otpErr: unknown) {
          console.error('OTP error:', otpErr);
          setError('Inscription réussie mais erreur d\'envoi du code. Veuillez vous reconnecter.');
        }
      }
    } catch (err: unknown) {
      console.error('Auth error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setError('');
    setLoading(true);
    try {
      const { error } = await signInWithProvider(provider);
      if (error) throw error;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion sociale';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background-page)] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--color-primary-500)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)]" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="/logo.png"
                alt="Mon Toit Logo"
                className="h-16 w-16 object-contain drop-shadow-lg"
              />
              <span className="text-3xl font-bold text-white">MON TOIT</span>
            </Link>
          </div>

          <div className="space-y-8">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Votre logement idéal vous attend
            </h1>
            <p className="text-xl text-white/90">
              Rejoignez des milliers d'utilisateurs qui ont trouvé leur chez-soi en Côte d'Ivoire.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Sécurité garantie</h3>
                  <p className="text-white/80 text-sm">Vos données et transactions protégées</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Biens vérifiés</h3>
                  <p className="text-white/80 text-sm">Annonces authentiques et contrôlées</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Accès universel</h3>
                  <p className="text-white/80 text-sm">Un logement pour tous les budgets</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-white/60 text-sm">
            © 2024 Mon Toit. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="Mon Toit Logo"
                className="h-12 w-12 object-contain"
              />
              <span className="text-2xl font-bold text-[var(--color-neutral-900)]">MON TOIT</span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-[var(--color-background-surface)] rounded-2xl p-8 shadow-[var(--shadow-lg)] border border-[var(--color-neutral-100)]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-neutral-900)] mb-2">
                {isForgotPassword ? 'Récupération du mot de passe' : isLogin ? 'Connexion' : 'Créer un compte'}
              </h2>
              <p className="text-[var(--color-neutral-600)]">
                {isForgotPassword
                  ? 'Entrez votre email pour recevoir un lien de réinitialisation'
                  : isLogin
                  ? 'Connectez-vous pour accéder à votre espace'
                  : 'Rejoignez la communauté Mon Toit'
                }
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                {success}
              </div>
            )}

            {/* Login Method Selector */}
            {isLogin && !isForgotPassword && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-3">
                  Méthode de connexion
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      loginMethod === 'email'
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                        : 'border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-neutral-300)]'
                    }`}
                  >
                    <Mail className={`h-5 w-5 mx-auto mb-2 ${
                      loginMethod === 'email' ? 'text-[var(--color-primary-500)]' : 'text-[var(--color-neutral-400)]'
                    }`} />
                    <p className={`text-xs font-medium ${
                      loginMethod === 'email' ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-neutral-600)]'
                    }`}>Email + Mot de passe</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginMethod('phone')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      loginMethod === 'phone'
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                        : 'border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-neutral-300)]'
                    }`}
                  >
                    <Phone className={`h-5 w-5 mx-auto mb-2 ${
                      loginMethod === 'phone' ? 'text-[var(--color-primary-500)]' : 'text-[var(--color-neutral-400)]'
                    }`} />
                    <p className={`text-xs font-medium ${
                      loginMethod === 'phone' ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-neutral-600)]'
                    }`}>Téléphone + OTP</p>
                  </button>
                </div>
              </div>
            )}

            {/* OTP Method for phone login */}
            {isLogin && !isForgotPassword && loginMethod === 'phone' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-3">
                  Méthode d'envoi OTP
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVerificationType('sms')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      verificationType === 'sms'
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                        : 'border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-neutral-300)]'
                    }`}
                  >
                    <Phone className={`h-4 w-4 mx-auto mb-1 ${
                      verificationType === 'sms' ? 'text-[var(--color-primary-500)]' : 'text-[var(--color-neutral-400)]'
                    }`} />
                    <p className={`text-xs font-medium ${
                      verificationType === 'sms' ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-neutral-600)]'
                    }`}>SMS</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationType('whatsapp')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      verificationType === 'whatsapp'
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                        : 'border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-neutral-300)]'
                    }`}
                  >
                    <MessageCircle className={`h-4 w-4 mx-auto mb-1 ${
                      verificationType === 'whatsapp' ? 'text-[var(--color-primary-500)]' : 'text-[var(--color-neutral-400)]'
                    }`} />
                    <p className={`text-xs font-medium ${
                      verificationType === 'whatsapp' ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-neutral-600)]'
                    }`}>WhatsApp</p>
                  </button>
                </div>
              </div>
            )}

            {/* Signup Verification Method */}
            {!isLogin && !isForgotPassword && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-3">
                  Méthode de vérification
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerificationType('email')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      verificationType === 'email'
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                        : 'border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-neutral-300)]'
                    }`}
                  >
                    <Mail className={`h-5 w-5 mx-auto mb-1 ${
                      verificationType === 'email' ? 'text-[var(--color-primary-500)]' : 'text-[var(--color-neutral-400)]'
                    }`} />
                    <p className={`text-xs font-medium ${
                      verificationType === 'email' ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-neutral-600)]'
                    }`}>Email</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationType('sms')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      verificationType === 'sms'
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                        : 'border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-neutral-300)]'
                    }`}
                  >
                    <Phone className={`h-5 w-5 mx-auto mb-1 ${
                      verificationType === 'sms' ? 'text-[var(--color-primary-500)]' : 'text-[var(--color-neutral-400)]'
                    }`} />
                    <p className={`text-xs font-medium ${
                      verificationType === 'sms' ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-neutral-600)]'
                    }`}>SMS</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationType('whatsapp')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      verificationType === 'whatsapp'
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                        : 'border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-neutral-300)]'
                    }`}
                  >
                    <MessageCircle className={`h-5 w-5 mx-auto mb-1 ${
                      verificationType === 'whatsapp' ? 'text-[var(--color-primary-500)]' : 'text-[var(--color-neutral-400)]'
                    }`} />
                    <p className={`text-xs font-medium ${
                      verificationType === 'whatsapp' ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-neutral-600)]'
                    }`}>WhatsApp</p>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Signup Fields */}
              {!isLogin && !isForgotPassword && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                      Nom complet
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--color-neutral-400)]" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-[var(--color-neutral-200)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-all bg-white text-[var(--color-neutral-900)]"
                        placeholder="Votre nom complet"
                      />
                    </div>
                  </div>

                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    required={verificationType === 'sms' || verificationType === 'whatsapp'}
                    label={`Numéro de téléphone${(verificationType !== 'sms' && verificationType !== 'whatsapp') ? ' (optionnel)' : ''}`}
                    autoValidate={true}
                  />

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                      Je suis
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setUserType('locataire')}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          userType === 'locataire'
                            ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]'
                            : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:border-[var(--color-neutral-300)]'
                        }`}
                      >
                        🏠 Locataire
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('proprietaire')}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          userType === 'proprietaire'
                            ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]'
                            : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:border-[var(--color-neutral-300)]'
                        }`}
                      >
                        🔑 Propriétaire
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('agence')}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          userType === 'agence'
                            ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]'
                            : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:border-[var(--color-neutral-300)]'
                        }`}
                      >
                        🏢 Agence
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Phone field for phone login */}
              {isLogin && loginMethod === 'phone' && (
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  required={true}
                  label="Numéro de téléphone"
                  autoValidate={true}
                />
              )}

              {/* Email field */}
              {(!isLogin || loginMethod === 'email') && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                    Email {!isLogin && verificationType !== 'email' && <span className="text-[var(--color-neutral-500)] text-xs font-normal">(optionnel)</span>}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--color-neutral-400)]" />
                    <input
                      type="email"
                      required={(isLogin && loginMethod === 'email') || (!isLogin && verificationType === 'email')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-[var(--color-neutral-200)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-all bg-white text-[var(--color-neutral-900)]"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
              )}

              {/* Password field */}
              {!isForgotPassword && (!isLogin || loginMethod === 'email') && (isLogin || verificationType === 'email') && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--color-neutral-400)]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (!isLogin && e.target.value) {
                          setPasswordStrength(validatePassword(e.target.value));
                        }
                      }}
                      className="w-full pl-12 pr-4 py-3 border border-[var(--color-neutral-200)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-all bg-white text-[var(--color-neutral-900)]"
                      placeholder="••••••••"
                      minLength={8}
                    />
                  </div>
                  {!isLogin && password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-[var(--color-neutral-200)] rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passwordStrength.score <= 2 ? 'bg-red-500' :
                              passwordStrength.score <= 4 ? 'bg-amber-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${passwordStrength.color}`}>
                          {passwordStrength.message}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--color-neutral-600)] space-y-1">
                        <div className="flex items-center space-x-1">
                          <span className={password.length >= 8 ? 'text-green-600' : 'text-[var(--color-neutral-400)]'}>✓</span>
                          <span>Au moins 8 caractères</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-[var(--color-neutral-400)]'}>✓</span>
                          <span>Une majuscule</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={/[a-z]/.test(password) ? 'text-green-600' : 'text-[var(--color-neutral-400)]'}>✓</span>
                          <span>Une minuscule</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={/[0-9]/.test(password) ? 'text-green-600' : 'text-[var(--color-neutral-400)]'}>✓</span>
                          <span>Un chiffre</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-[var(--color-neutral-400)]'}>✓</span>
                          <span>Un caractère spécial</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Forgot password link */}
              {isLogin && !isForgotPassword && loginMethod === 'email' && (
                <div className="flex justify-end -mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-sm text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] font-medium transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white py-3 px-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Chargement...</span>
                  </span>
                ) : isForgotPassword ? (
                  <span className="flex items-center justify-center space-x-2">
                    <KeyRound className="w-5 h-5" />
                    <span>Envoyer le lien</span>
                  </span>
                ) : isLogin ? (
                  loginMethod === 'phone' ? 'Recevoir le code OTP' : 'Se connecter'
                ) : (
                  "S'inscrire"
                )}
              </button>
            </form>

            {/* Back to login */}
            {isForgotPassword && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setIsLogin(true);
                    setError('');
                    setSuccess('');
                  }}
                  className="inline-flex items-center space-x-2 text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] font-medium text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour à la connexion</span>
                </button>
              </div>
            )}

            {/* Social login */}
            {!isForgotPassword && import.meta.env['VITE_ENABLE_SOCIAL_AUTH'] === 'true' && (
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--color-neutral-200)]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[var(--color-background-surface)] text-[var(--color-neutral-500)]">ou continuer avec</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={loading}
                    className="flex items-center justify-center space-x-2 px-4 py-3 border border-[var(--color-neutral-200)] rounded-xl hover:bg-[var(--color-neutral-50)] transition-all disabled:opacity-50 font-medium text-[var(--color-neutral-700)]"
                  >
                    <Chrome className="w-5 h-5" />
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={loading}
                    className="flex items-center justify-center space-x-2 px-4 py-3 border border-[var(--color-neutral-200)] rounded-xl hover:bg-[var(--color-neutral-50)] transition-all disabled:opacity-50 font-medium text-[var(--color-neutral-700)]"
                  >
                    <Facebook className="w-5 h-5" />
                    <span>Facebook</span>
                  </button>
                </div>
              </div>
            )}

            {/* Switch login/signup */}
            {!isForgotPassword && (
              <div className="mt-6 text-center">
                <p className="text-[var(--color-neutral-600)] text-sm">
                  {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                  <Link
                    to={isLogin ? '/inscription' : '/connexion'}
                    className="ml-1 text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] font-semibold transition-colors"
                  >
                    {isLogin ? "Inscrivez-vous" : "Connectez-vous"}
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
