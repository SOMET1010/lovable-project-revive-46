# Scripts de Test SMS Brevo

Ce répertoire contient des scripts pour tester l'intégration SMS avec Brevo.

## Prérequis

### 1. Variables d'Environnement

Configurez les variables d'environnement suivantes :

```bash
# Pour tous les tests
export SUPABASE_URL="https://votre-projet.supabase.co"
export SUPABASE_ANON_KEY="votre-clé-anon-supabase"

# Pour le test direct API Brevo
export BREVO_API_KEY="votre-clé-api-brevo"
```

Ou créez un fichier `.env` :
```bash
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-clé-anon-supabase
BREVO_API_KEY=votre-clé-api-brevo
```

### 2. Node.js

Assurez-vous d'avoir Node.js installé (v14+).

## Scripts Disponibles

### 1. `test-sms-brevo.js` - Test via Edge Function Supabase

Teste l'envoi de SMS via l'Edge Function Supabase.

```bash
# Avec variables d'environnement exportées
node scripts/test-sms-brevo.js

# Ou avec dotenv
npm install dotenv
node -r dotenv/config scripts/test-sms-brevo.js
```

**Ce script effectue :**
- Test 1: SMS simple
- Test 2: SMS avec code OTP
- Test 3: Test d'erreur (numéro invalide)

### 2. `test-sms-direct.js` - Test direct API Brevo

Teste l'API Brevo directement (bypass Supabase).

```bash
# Avec la clé API Brevo
node scripts/test-sms-direct.js
```

**Utile pour :**
- Vérifier que la clé API Brevo fonctionne
- Déboguer les problèmes de configuration Supabase

### 3. `test-sms-otp.js` - Test flux complet OTP

Teste le flux complet d'authentification par numéro de téléphone.

```bash
# Test interactif du flux OTP
node scripts/test-sms-otp.js
```

**Le script :**
1. Envoie un OTP par SMS
2. Attend 30 secondes pour recevoir le SMS
3. Demande le code reçu
4. Vérifie le code et authentifie l'utilisateur

## Numéro de Test

Tous les scripts utilisent par défaut le numéro : `+2250140984943`

## Dépannage

### Erreurs Courantes

1. **401 Unauthorized**
   - Vérifiez que `BREVO_API_KEY` est correcte
   - Assurez-vous que la clé a les permissions SMS

2. **403 Forbidden**
   - L'IP de Supabase n'est peut-être pas whitelistée chez Brevo
   - Contactez Brevo pour ajouter les IP d'Edge Functions

3. **404 Not Found**
   - Vérifiez que l'Edge Function est déployée
   - L'URL Supabase doit être correcte

4. **429 Too Many Requests**
   - Rate limiting actif (attendre 60 secondes)
   - Limite: 1 SMS par minute par numéro

5. **Aucun SMS reçu**
   - Vérifiez le format du numéro (+225...)
   - Confirmez que le numéro est actif
   - Vérifiez les logs Supabase

### Vérifications

1. **Logs Supabase**
   ```bash
   # Voir les logs de l'Edge Function
   npx supabase functions logs send-sms-brevo
   ```

2. **Configuration Brevo**
   - Clé API active avec permissions SMS
   - Solde disponible
   - IP de Supabase whitelistée (si requis)

3. **Format du Numéro**
   ```
   Correct: +2250140984943
   Incorrect: 002250140984943
   Incorrect: 0140984943
   ```

## Monitoring en Production

- Surveillez les taux d'échec
- Configurez des alertes pour les erreurs 4xx/5xx
- Vérifiez l'utilisation des crédits SMS Brevo