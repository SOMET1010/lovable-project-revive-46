# Guide d'intégration Brevo OTP

Ce guide explique comment intégrer le nouveau système OTP de Brevo dans votre application Mon Toit.

## 🏗️ Architecture

```
Frontend React
    ↓
useBrevoAuth Hook
    ↓
authBrevoService
    ↓
otpUnifiedService
    ↓
Supabase Edge Functions
    ↓
Brevo API (Email + SMS)
```

## 📧 Services Créés

### 1. `otp-unified.service.ts`
Service unifié pour la gestion des codes OTP :
- Génération d'OTP sécurisés
- Envoi par Email, SMS, WhatsApp
- Stockage et vérification
- Rate limiting intégré

### 2. `auth-brevo.service.ts`
Service d'authentification :
- Inscription/connexion par OTP
- Création automatique de comptes
- Gestion des rôles
- Sessions sécurisées

### 3. `useBrevoAuth.ts`
Hook React pour simplifier l'intégration :
- États et actions prédéfinis
- Gestion des erreurs
- Redirections automatiques

## 🔧 Edge Functions

### `send-email-brevo/index.ts`
Nouvelle fonction pour l'envoi d'emails via Brevo :
- Support des templates
- Mode sandbox pour développement
- Validation des payloads

### `send-sms-brevo/index.ts` (existant)
Fonction existante pour l'envoi de SMS via Brevo

## ⚙️ Configuration

Variables d'environnement requises (déjà configurées) :
```bash
# .env
BREVO_API_KEY=xkeysib-votre-clé-api
BREVO_SENDER_EMAIL=no-reply@montoit.ci
BREVO_SENDER_NAME=Mon Toit
```

## 🚀 Utilisation

### 1. Importer le hook

```typescript
import { useBrevoAuth } from '@/hooks/useBrevoAuth';
```

### 2. Utiliser dans un composant

```typescript
function AuthComponent() {
  const {
    loading,
    error,
    success,
    otpSent,
    needsName,
    isNewUser,
    sendOTP,
    verifyOTP,
    submitName,
    selectRole,
    clearError,
    reset,
  } = useBrevoAuth();

  // États du formulaire
  const [recipient, setRecipient] = useState('');
  const [method, setMethod] = useState<'email' | 'phone'>('phone');
  const [otpCode, setOtpCode] = useState('');
  const [fullName, setFullName] = useState('');

  // Envoyer l'OTP
  const handleSendOTP = async () => {
    if (!recipient) return;

    const success = await sendOTP({
      recipient,
      method,
    });

    if (success) {
      // L'OTP a été envoyé
    }
  };

  // Vérifier l'OTP
  const handleVerifyOTP = async () => {
    if (!otpCode) return;

    const success = await verifyOTP(otpCode);

    if (success) {
      // OTP vérifié
    }
  };

  // Soumettre le nom (nouvel utilisateur)
  const handleSubmitName = async () => {
    if (!fullName) return;

    const success = await submitName(fullName);

    if (success) {
      // Compte créé
    }
  };

  return (
    <div>
      {/* Formulaire d'envoi OTP */}
      {!otpSent && (
        <form>
          <input
            type={method === 'email' ? 'email' : 'tel'}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={
              method === 'email' ? 'Email' : 'Numéro de téléphone'
            }
          />

          <button
            type="button"
            onClick={handleSendOTP}
            disabled={loading || !recipient}
          >
            {loading ? 'Envoi...' : 'Recevoir mon code'}
          </button>
        </form>
      )}

      {/* Formulaire de vérification OTP */}
      {otpSent && !needsName && (
        <form>
          <input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="Code à 6 chiffres"
            maxLength={6}
          />

          <button
            type="button"
            onClick={handleVerifyOTP}
            disabled={loading || otpCode.length !== 6}
          >
            {loading ? 'Vérification...' : 'Confirmer'}
          </button>
        </form>
      )}

      {/* Formulaire nom (nouvel utilisateur) */}
      {needsName && (
        <form>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Votre nom complet"
          />

          <button
            type="button"
            onClick={handleSubmitName}
            disabled={loading || !fullName}
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>
      )}

      {/* Messages */}
      {error && (
        <div className="error">
          {error}
          <button onClick={clearError}>×</button>
        </div>
      )}

      {success && (
        <div className="success">
          {success}
        </div>
      )}
    </div>
  );
}
```

## 📱 Migration depuis l'ancien système

### Ancien code (ModernAuthPage.tsx) :
```typescript
// Ancien envoi OTP téléphone
const { data, error } = await supabase.functions.invoke('send-auth-otp', {
  body: { phoneNumber, method: sendMethod },
});

// Ancienne vérification OTP
const { data, error } = await supabase.functions.invoke('verify-auth-otp', {
  body: { phoneNumber, code: otp, fullName, siteUrl },
});
```

### Nouveau code avec Brevo :
```typescript
// Nouvel envoi OTP
const success = await sendOTP({
  recipient: phoneNumber,
  method: 'phone',
});

// Nouvelle vérification OTP
const success = await verifyOTP(otp);
```

## 🎯 Étapes de migration

1. **Installer le hook** dans les composants d'authentification
2. **Remplacer les appels API** par les actions du hook
3. **Adapter l'interface** aux nouveaux états
4. **Tester** les flux d'inscription et connexion
5. **Supprimer** l'ancien code

## 🔍 Points d'attention

### Sécurité
- Les clés API Brevo ne sont JAMAIS exposées côté client
- Rate limiting automatique
- Validation des entrées
- Tokens sécurisés

### Performance
- Cache des états dans le hook
- Appels API optimisés
- Fallbacks intelligents

### UX
- Messages d'erreur clairs
- États de chargement
- Redirections automatiques
- Mode développement avec affichage OTP

## 🧪 Tests

### En développement
- Les codes OTP sont affichés dans la console
- Mode sandbox activé pour les emails
- Logs détaillés

### En production
- Mode sandbox désactivé
- Rate limiting strict
- Monitoring des erreurs

## 📊 Monitoring

### Logs activés
- Envois OTP
- Erreurs d'API
- Taux de succès
- Performance

### Métriques à suivre
- Taux de conversion inscription
- Temps moyen de vérification
- Erreurs par méthode (email/SMS/WhatsApp)

## 🔗 Liens utiles

- Documentation Brevo : https://developers.brevo.com/
- Dashboard Brevo : https://app.brevo.com/
- Guide Supabase Edge Functions : https://supabase.com/docs/guides/functions