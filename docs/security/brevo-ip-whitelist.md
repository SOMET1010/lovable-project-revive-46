# Architecture SMS Brevo - Sécurisation par IP Whitelist

## Vue d'ensemble

Ce document décrit l'architecture sécurisée pour l'envoi de SMS via Brevo dans l'application Mon Toit.

## Architecture cible

```
┌─────────────────┐     ┌──────────────────────────┐     ┌─────────────┐
│  Frontend       │────▶│  Supabase Edge Function  │────▶│  Brevo API  │
│  Mon Toit       │     │  send-sms-brevo          │     │             │
└─────────────────┘     └──────────────────────────┘     └─────────────┘
                                    │
                                    │ BREVO_API_KEY
                                    │ (Supabase Secrets)
                                    ▼
                        ┌──────────────────────────┐
                        │  Stockage sécurisé       │
                        │  Jamais côté client      │
                        └──────────────────────────┘
```

### Points clés

1. **Aucune requête directe** du frontend vers Brevo
2. **La clé API Brevo** est stockée uniquement dans les secrets Supabase
3. **Seules les IP Supabase** peuvent appeler l'API Brevo

## Plages IP Supabase à whitelister

Les Edge Functions Supabase utilisent des plages IP spécifiques. Consultez la documentation officielle pour les IP à jour :

📚 **Documentation Supabase** : https://supabase.com/docs/guides/functions/cidr-and-ip

### Procédure de récupération des IP

1. Aller sur le dashboard Supabase du projet
2. Naviguer vers **Settings > Infrastructure**
3. Noter les adresses IP des Edge Functions
4. Ajouter ces IP dans la whitelist Brevo

## Configuration Brevo

### Étape 1 : Accéder aux paramètres de sécurité

1. Se connecter à https://app.brevo.com
2. Aller dans **Paramètres > API Keys**
3. Sélectionner l'API Key utilisée

### Étape 2 : Activer le blocage IP

1. Cliquer sur **Manage IP restrictions**
2. Activer l'option **Block requests from unknown IPs**
3. Ajouter les plages IP Supabase Edge Functions

### Étape 3 : Tester avant activation

⚠️ **IMPORTANT** : Avant d'activer le blocage des IP inconnues :

1. Envoyer un SMS de test via `send-sms-brevo`
2. Vérifier que le SMS est bien reçu
3. Confirmer dans les logs Brevo que l'IP source est whitelistée
4. Seulement ensuite, activer le blocage

## Bonnes pratiques de sécurité

### Stockage des secrets

```bash
# ✅ CORRECT : Clé stockée dans Supabase Secrets
BREVO_API_KEY=xkeysib-xxxxx

# ❌ INTERDIT : Jamais dans le code frontend
# VITE_BREVO_API_KEY=... 
```

### Logs sécurisés

```typescript
// ✅ CORRECT : Log sans clé API
console.log('[send-sms-brevo] Sending to:', phone.substring(0, 6) + '****');

// ❌ INTERDIT : Ne jamais logger la clé
// console.log('API Key:', brevoApiKey);
```

### Validation des entrées

```typescript
// ✅ Toujours valider le format E.164
const e164Regex = /^\+[1-9]\d{7,14}$/;
if (!e164Regex.test(phone)) {
  return { error: 'Format de téléphone invalide' };
}
```

## Tests de bout en bout

### Test 1 : Envoi SMS via Edge Function

```bash
# Via Supabase CLI
supabase functions invoke send-sms-brevo \
  --body '{"phone":"+2250700000000","message":"Test SMS","tag":"TEST"}'
```

### Test 2 : Vérification des logs

1. Aller dans Supabase Dashboard > Edge Functions > Logs
2. Rechercher `[send-sms-brevo]`
3. Vérifier que les SMS sont envoyés avec succès

### Test 3 : Vérification du blocage IP

1. Activer le blocage IP dans Brevo
2. Tenter un envoi depuis une IP non whitelistée (ex: curl local)
3. Vérifier que la requête est bloquée
4. Confirmer que l'Edge Function fonctionne toujours

## Fichiers concernés

| Fichier | Description |
|---------|-------------|
| `supabase/functions/send-sms-brevo/index.ts` | Edge Function SMS Brevo |
| `src/shared/services/sms.ts` | Service client centralisé |
| `supabase/config.toml` | Configuration des fonctions |

## Checklist de déploiement

- [ ] Edge Function `send-sms-brevo` déployée
- [ ] `BREVO_API_KEY` configurée dans Supabase Secrets
- [ ] Aucune référence `BREVO_API_KEY` côté client
- [ ] Service `src/shared/services/sms.ts` utilisé partout
- [ ] IP Supabase whitelistées dans Brevo
- [ ] Tests de bout en bout validés
- [ ] Blocage IP activé dans Brevo

## Contacts et support

- **Brevo Support** : https://help.brevo.com
- **Supabase Support** : https://supabase.com/support
- **Documentation Edge Functions** : https://supabase.com/docs/guides/functions
