# Sécurité Brevo - Diagnostic Cloudflare

## Architecture Actuelle

```
Frontend (navigateur)
       ↓
Supabase Edge Functions (Deno)
       ↓
API Brevo (https://api.brevo.com)
```

**Clé API Brevo** : stockée exclusivement dans les secrets Supabase, jamais exposée côté client.

## ⚠️ Problème Identifié : Blocage Cloudflare

### Diagnostic

Les Edge Functions Supabase sont bloquées par le WAF Cloudflare de Brevo :

- **Status HTTP** : `403 Forbidden`
- **Ray ID exemple** : `9a97ebd9682bbfc6`
- **IP bloquée** : `2a05:d012:fca:9507:52cb:d93c:eb11:9d04` (IPv6 Supabase)

### Cause Racine

Supabase Edge Functions n'ont **pas d'IP statiques** - elles utilisent des IPs dynamiques partagées. 
Le WAF Cloudflare de Brevo bloque ces IPs comme potentiellement malveillantes.

**Référence officielle** : Les Edge Functions Supabase ne supportent pas les IP statiques sortantes.
(Voir: https://github.com/supabase/supabase/discussions/15044)

## Logs Améliorés

Les 4 Edge Functions Brevo utilisent maintenant `cloudflareDetector.ts` pour :

1. Détecter automatiquement les blocages Cloudflare
2. Extraire le Ray ID et l'IP bloquée
3. Formater des logs clairs :

```
[CLOUDFLARE_BLOCK] endpoint=https://api.brevo.com/v3/transactionalSMS/sms rayId=abc123 blockedIp=2a05:... action=CONTACT_BREVO_SUPPORT
```

## Solutions Possibles

### Option 1 : Contacter Brevo Support (Recommandé)

**Email à envoyer** :

```
À: support@brevo.com
Objet: Cloudflare blocking Supabase Edge Functions - Request WAF exception

Bonjour,

Nous utilisons l'API SMS transactionnel Brevo depuis des Edge Functions Supabase.
Nos requêtes sont bloquées par Cloudflare (erreur 403).

Détails :
- Ray ID: 9a97ebd9682bbfc6
- IP bloquée: 2a05:d012:fca:9507:52cb:d93c:eb11:9d04
- Endpoint: https://api.brevo.com/v3/transactionalSMS/sms
- Clé API: xkeysib-d8c9702a... (masquée)

Pouvez-vous :
1. Vérifier que notre clé API est active et a les permissions SMS
2. Ajouter une exception Cloudflare pour les IPs Supabase Edge Functions
3. Ou nous indiquer comment whitelister notre intégration

Merci.
```

### Option 2 : Proxy avec IP Statique

Déployer un proxy (AWS Lambda, Google Cloud Function, etc.) avec une IP statique :

```
Edge Function → Proxy (IP statique) → Brevo API
```

Coût additionnel et complexité accrue.

### Option 3 : Provider SMS Alternatif

Utiliser InTouch ou Sinch comme provider principal si Brevo reste bloqué.

## Edge Functions Concernées

| Fonction | Endpoint Brevo | Détection CF |
|----------|----------------|--------------|
| `send-sms-brevo` | `/v3/transactionalSMS/sms` | ✅ |
| `send-sms-hybrid` | `/v3/transactionalSMS/sms` | ✅ |
| `send-whatsapp-brevo` | `/v3/whatsapp/sendMessage` | ✅ |
| `send-whatsapp-hybrid` | `/v3/whatsapp/sendMessage` | ✅ |

## Vérification des Logs

Pour consulter les logs Cloudflare après un test :

1. Aller sur Lovable Cloud → Edge Functions → Logs
2. Rechercher `[CLOUDFLARE_BLOCK]` ou `rayId=`
3. Noter le Ray ID pour le support Brevo

## Test de Diagnostic

Déclencher un SMS test :

```typescript
const { data, error } = await supabase.functions.invoke('send-sms-brevo', {
  body: { 
    phone: '+2250709753232', 
    message: 'Test diagnostic Cloudflare',
    tag: 'DIAGNOSTIC'
  }
});

// Si cloudflareBlock: true dans la réponse, contacter Brevo support
console.log(data);
```

## Fichiers Implémentés

| Fichier | Description |
|---------|-------------|
| `supabase/functions/_shared/cloudflareDetector.ts` | Utilitaire de détection Cloudflare |
| `supabase/functions/send-sms-brevo/index.ts` | Edge Function SMS Brevo |
| `supabase/functions/send-sms-hybrid/index.ts` | Edge Function SMS multi-provider |
| `supabase/functions/send-whatsapp-brevo/index.ts` | Edge Function WhatsApp Brevo |
| `supabase/functions/send-whatsapp-hybrid/index.ts` | Edge Function WhatsApp multi-provider |
| `src/shared/services/sms.ts` | Service client centralisé |

## Status Actuel

- [x] Détection Cloudflare implémentée dans les 4 Edge Functions
- [x] Logs structurés avec Ray ID, IP bloquée, endpoint
- [x] Documentation mise à jour
- [ ] **En attente** : Réponse support Brevo pour exception WAF

## Contacts et Support

- **Brevo Support** : https://help.brevo.com ou support@brevo.com
- **Supabase Discussions** : https://github.com/supabase/supabase/discussions
- **Documentation Edge Functions** : https://supabase.com/docs/guides/functions
