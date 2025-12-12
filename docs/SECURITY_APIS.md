# Documentation des APIs Sécurisées

Ce document décrit les nouvelles APIs sécurisées implémentées pour protéger l'application contre les vulnérabilités courantes.

## Table des matières

1. [Service de Validation des Rôles](#service-de-validation-des-rôles)
2. [Service d'Upload Sécurisé](#service-dupload-sécurisé)
3. [Service de Messagerie Sécurisé](#service-de-messagerie-sécurisé)
4. [Service de Contrats Sécurisé](#service-de-contrats-sécurisé)
5. [Service d'Administration Sécurisé](#service-dadministration-sécurisé)
6. [Service de Rate Limiting](#service-de-rate-limiting)
7. [Middleware de Sécurité](#middleware-de-sécurité)
8. [Service de Monitoring de Sécurité](#service-de-monitoring-de-sécurité)

---

## Service de Validation des Rôles

**Fichier**: `src/shared/services/roleValidation.service.ts`

### Description

Ce service centralise la validation des rôles et permissions pour toutes les opérations sensibles de l'application.

### Fonctions principales

#### `hasPermission(permission: keyof RolePermissions): Promise<boolean>`
Vérifie si l'utilisateur courant a une permission spécifique.

**Permissions disponibles**:
- `canCreateProperty`: Créer des propriétés
- `canEditProperty`: Modifier des propriétés
- `canDeleteProperty`: Supprimer des propriétés
- `canViewAllProperties`: Voir toutes les propriétés
- `canManageUsers`: Gérer les utilisateurs
- `canAccessAdminPanel`: Accéder au panneau admin
- `canVerifyUsers`: Vérifier les utilisateurs
- `canModerateContent`: Modérer le contenu
- `canManageContracts`: Gérer les contrats
- `canAccessAllContracts`: Accéder à tous les contrats

**Exemple d'utilisation**:
```typescript
import { hasPermission } from '@/shared/services/roleValidation.service';

const canCreate = await hasPermission('canCreateProperty');
if (!canCreate) {
  throw new Error('Permission refusée');
}
```

#### `hasRole(allowedRoles: UserRole[]): Promise<boolean>`
Vérifie si l'utilisateur a l'un des rôles spécifiés.

**Rôles disponibles**:
- `tenant`: Locataire
- `owner`: Propriétaire
- `agency`: Agence
- `admin`: Administrateur
- `trust_agent`: Agent de vérification
- `moderator`: Modérateur

#### `isResourceOwner(resourceType: 'property' | 'contract' | 'application' | 'message', resourceId: string): Promise<boolean>`
Vérifie si l'utilisateur est propriétaire de la ressource.

**Exemple d'utilisation**:
```typescript
const isOwner = await isResourceOwner('property', propertyId);
if (!isOwner && !await hasRole(['admin'])) {
  throw new Error('Accès non autorisé');
}
```

#### `requirePermission(permission: keyof RolePermissions)`
Middleware qui lance une erreur si la permission n'est pas accordée.

**Exemple d'utilisation**:
```typescript
// Dans une fonction API
await requirePermission('canDeleteProperty')();
```

---

## Service d'Upload Sécurisé

**Fichier**: `src/shared/services/secureUpload.service.ts`

### Description

Ce service ajoute une couche de sécurité à l'upload de fichiers avec validation, scan de sécurité et vérification de permissions.

### Fonctions principales

#### `uploadSecure(options: SecureUploadOptions): Promise<SecureUploadResult>`
Upload un fichier avec validation de sécurité.

**Options**:
```typescript
interface SecureUploadOptions {
  bucket: keyof typeof STORAGE_BUCKETS; // PROPERTIES, DOCUMENTS, AVATARS, etc.
  folder?: string;
  file: File;
  fileName?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  resourceType?: 'property' | 'contract' | 'application' | 'profile';
  resourceId?: string;
  compressImage?: boolean;
}
```

**Exemple d'utilisation**:
```typescript
import { SecureUploadService } from '@/shared/services/secureUpload.service';

const result = await SecureUploadService.uploadSecure({
  bucket: 'PROPERTIES',
  file: imageFile,
  resourceType: 'property',
  resourceId: propertyId,
  compressImage: true,
});

if (result.error) {
  console.error('Upload failed:', result.error);
} else {
  console.log('File uploaded:', result.url);
}
```

### Sécurité implémentée

1. **Validation du type MIME**: Vérification que le type MIME correspond à l'extension
2. **Scan de signatures**: Vérification des en-têtes de fichiers pour détecter les falsifications
3. **Validation des permissions**: Vérification que l'utilisateur peut uploader pour cette ressource
4. **Compression d'images**: Réduction automatique de la taille des images
5. **Métadonnées de suivi**: Enregistrement de qui a uploadé quoi et quand

---

## Service de Messagerie Sécurisé

**Fichier**: `src/features/messaging/services/messaging.api.ts`

### Description

Ce service sécurise toutes les opérations de messagerie en vérifiant que les utilisateurs sont autorisés à communiquer.

### Fonctions principales

#### `getConversations(): Promise<Conversation[]>`
Récupère toutes les conversations de l'utilisateur avec validation d'accès.

#### `getOrCreateConversation(otherUserId: string, propertyId?: string): Promise<Conversation>`
Crée ou récupère une conversation entre deux utilisateurs après vérification.

**Sécurité implémentée**:
- Vérifie que les utilisateurs peuvent communiquer
- Pour les propriétés: vérifie le lien (propriétaire, locataire, agence)
- Bloque les utilisateurs bloqués

#### `sendMessage(conversationId: string, content: string, attachment?: File): Promise<Message>`
Envoie un message dans une conversation.

**Sécurité implémentée**:
- Vérifie que l'utilisateur est participant de la conversation
- Nettoie le contenu contre les injections XSS
- Upload sécurisé des pièces jointes
- Notification du destinataire

#### `reportMessage(messageId: string, reason: string): Promise<void>`
Signale un message inapproprié.

#### `blockUser(userId: string): Promise<void>`
Bloque un utilisateur.

### Hooks React correspondants

**Fichier**: `src/features/messaging/hooks/useSecureMessaging.ts`

```typescript
import { useSecureMessaging } from '@/features/messaging/hooks/useSecureMessaging';

function MyComponent() {
  const { sendMessage, createConversation, isSendingMessage } = useSecureMessaging();

  const handleSend = async () => {
    await sendMessage(conversationId, messageContent);
  };
}
```

---

## Service de Contrats Sécurisé

**Fichier**: `src/features/contract/services/contract.api.ts`

### Description

Ce service sécurise toutes les opérations sur les contrats avec validation stricte des permissions et de la propriété.

### Fonctions principales

#### `create(contract: ContractInsert): Promise<ContractWithDetails>`
Crée un nouveau contrat.

**Sécurité implémentée**:
- Vérifie que l'utilisateur a le droit de créer un contrat
- Valide que l'utilisateur peut gérer la propriété associée
- Génère un numéro de contrat unique

#### `update(id: string, updates: ContractUpdate): Promise<ContractWithDetails>`
Met à jour un contrat.

**Sécurité implémentée**:
- Vérifie la propriété du contrat
- Autorise uniquement les mises à jour sur les brouillons
- Empêche la modification des contrats actifs

#### `signContract(id: string, signatureType: 'owner' | 'tenant'): Promise<ContractWithDetails>`
Signe un contrat.

**Sécurité implémentée**:
- Vérifie que l'utilisateur est autorisé à signer (propriétaire ou locataire)
- Active le contrat uniquement si les deux parties ont signé
- Met à jour le statut de la propriété

#### `terminate(id: string, reason: string): Promise<ContractWithDetails>`
Résilie un contrat.

**Sécurité implémentée**:
- Vérifie la propriété du contrat
- Uniquement les contrats actifs peuvent être résiliés
- Remet la propriété comme disponible

---

## Service d'Administration Sécurisé

**Fichier**: `src/features/admin/services/admin.api.ts`

### Description

Ce service sécurise toutes les opérations administratives avec validation stricte des permissions.

### Fonctions principales

#### `getUsers(page?: number, filters?: any): Promise<{ users: UserProfile[]; total: number }>`
Récupère la liste des utilisateurs avec pagination.

**Sécurité implémentée**:
- Nécessite la permission `canManageUsers`
- Filtre automatiquement selon le rôle de l'admin

#### `verifyUser(userId: string): Promise<UserProfile>`
Vérifie un utilisateur.

**Sécurité implémentée**:
- Nécessite la permission `canVerifyUsers`
- Enregistre qui a vérifié et quand

#### `suspendUser(userId: string, reason: string): Promise<UserProfile>`
Suspend un utilisateur.

#### `changeUserRole(userId: string, newRole: string): Promise<UserProfile>`
Modifie le rôle d'un utilisateur.

**Sécurité implémentée**:
- Nécessite la permission `canManageUsers`
- Enregistre l'historique des changements de rôle

#### `getAuditLogs(page?: number, filters?: any): Promise<{ logs: any[]; total: number }>`
Récupère les logs d'audit.

**Sécurité implémentée**:
- Uniquement accessible aux administrateurs
- Journalisation de toutes les actions sensibles

---

## Service de Rate Limiting

**Fichier**: `src/shared/services/rateLimiter.service.ts`

### Description

Ce service implémente la limitation de débit pour protéger contre les abus et attaques DOS.

### Configurations par défaut

```typescript
const configs = {
  'auth:login': { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  'auth:register': { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  'auth:reset-password': { windowMs: 15 * 60 * 1000, maxRequests: 3 },
  'upload:file': { windowMs: 60 * 1000, maxRequests: 10 },
  'message:send': { windowMs: 60 * 1000, maxRequests: 30 },
  'crud:create': { windowMs: 60 * 1000, maxRequests: 20 },
  'search:general': { windowMs: 60 * 1000, maxRequests: 100 },
};
```

### Fonctions principales

#### `checkLimit(identifier: string, operation: string): Promise<{ allowed: boolean; resetTime?: number; message?: string }>`
Vérifie si une opération est autorisée selon les limites.

**Exemple d'utilisation**:
```typescript
import { rateLimiter } from '@/shared/services/rateLimiter.service';

const result = await rateLimiter.checkLimit(userId, 'auth:login');
if (!result.allowed) {
  throw new Error(result.message || 'Rate limit exceeded');
}
```

#### `checkBruteForce(identifier: string, operation: string): Promise<boolean>`
Protection contre les attaques par force brute.

### Hook React

**Fichier**: `src/shared/services/rateLimiter.service.ts`

```typescript
import { useRateLimiter } from '@/shared/services/rateLimiter.service';

function MyComponent() {
  const { checkRateLimit } = useRateLimiter();

  const handleAction = async () => {
    const result = await checkRateLimit('operation:name');
    if (!result.allowed) {
      alert(result.message);
      return;
    }
    // Continuer l'action
  };
}
```

---

## Middleware de Sécurité

**Fichier**: `src/shared/middleware/security.middleware.ts`

### Description

Ce middleware fournit des protections de sécurité générales pour toutes les requêtes.

### Fonctions principales

#### `addSecurityHeaders(response: Response)`
Ajoute les headers de sécurité:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`
- `Permissions-Policy`

#### `InputValidator`
Classe utilitaire pour valider et nettoyer les entrées:

```typescript
// Nettoyer une chaîne
const clean = InputValidator.sanitizeString('<script>alert("xss")</script>');

// Valider un email
const isValid = InputValidator.isValidEmail('test@example.com');

// Valider un UUID
const isValidUUID = InputValidator.isValidUUID('123e4567-e89b-12d3-a456-426614174000');
```

#### `CSRFProtection`
Gestion des tokens CSRF:

```typescript
// Générer un token
const token = CSRFProtection.generateToken(userId);

// Valider un token
const isValid = CSRFProtection.validateToken(userId, token);
```

#### `SecurityLogger`
Logging des événements de sécurité:

```typescript
SecurityLogger.logSecurityEvent('UNAUTHORIZED_ACCESS', userId, ip, {
  endpoint: '/api/admin/users',
  attemptedAction: 'DELETE',
});
```

### Décorateur pour sécuriser les méthodes

```typescript
import { secure } from '@/shared/middleware/security.middleware';

class MyService {
  @secure('auth:login')
  async login(credentials: LoginData) {
    // La méthode est automatiquement protégée par le rate limiting
    // et les entrées sont nettoyées
  }
}
```

---

## Service de Monitoring de Sécurité

**Fichier**: `src/shared/services/securityMonitoring.service.ts`

### Description

Ce service surveille les événements de sécurité en temps réel et génère des alertes.

### Fonctions principales

#### `logSecurityEvent(type, severity, details, userId?, ip?)`
Enregistre un événement de sécurité.

**Types d'événements**:
- `AUTH_FAILURE`: Échec d'authentification
- `RATE_LIMIT_EXCEEDED`: Limite de débit dépassée
- `UNAUTHORIZED_ACCESS`: Tentative d'accès non autorisée
- `MALICIOUS_UPLOAD`: Upload de fichier malveillant
- `PRIVILEGE_ESCALATION`: Tentative d'élévation de privilèges
- `SUSPICIOUS_ACTIVITY`: Activité suspecte

**Exemple d'utilisation**:
```typescript
import { securityMonitoring } from '@/shared/services/securityMonitoring.service';

await securityMonitoring.logSecurityEvent(
  'AUTH_FAILURE',
  'MEDIUM',
  { email: 'test@example.com' },
  userId,
  ip
);
```

#### `getSecurityMetrics(hours: number): Promise<SecurityMetrics>`
Récupère les métriques de sécurité.

**Métriques disponibles**:
- Nombre total d'événements
- Répartition par type et sévérité
- Top offenders (IPs et utilisateurs)
- IPs actuellement bloquées

### Page de monitoring

**Fichier**: `src/features/admin/pages/SecurityMonitoringPage.tsx`

Cette page fournit une interface complète pour:
- Visualiser les métriques de sécurité
- Voir les événements en temps réel
- Gérer les IPs bloquées
- Exporter les logs d'audit

---

## Bonnes Pratiques

### 1. Toujours utiliser le service layer

```typescript
// ❌ Mauvais - Appel direct à Supabase
const { data } = await supabase.from('properties').delete().eq('id', id);

// ✅ Bon - Utiliser le service sécurisé
await propertyApi.delete(id);
```

### 2. Valider les permissions avant les opérations

```typescript
// Toujours vérifier
await requireOwnership('property')(propertyId);
await requirePermission('canDeleteProperty')();
```

### 3. Utiliser les hooks sécurisés dans React

```typescript
// ✅ Utiliser les hooks avec rate limiting intégré
const { sendMessage } = useSecureMessaging();
const { signUp } = useSecureAuth();
```

### 4. Nettoyer les entrées utilisateur

```typescript
import { InputValidator } from '@/shared/middleware/security.middleware';

const cleanInput = InputValidator.sanitizeString(userInput);
```

### 5. Logger les événements de sécurité

```typescript
import { securityMonitoring } from '@/shared/services/securityMonitoring.service';

// Logger les tentatives d'accès non autorisées
await securityMonitoring.logSecurityEvent(
  'UNAUTHORIZED_ACCESS',
  'HIGH',
  { endpoint, method },
  userId,
  ip
);
```

## Tests

Toutes ces APIs sont accompagnées de tests complets:

- Tests unitaires dans `src/tests/security.test.ts`
- Tests d'intégration dans `src/tests/security.integration.test.ts`

Pour exécuter les tests de sécurité:

```bash
npm run test:security
npm run test:integration:security
```

## Conclusion

Ces APIs sécurisées fournissent une protection complète contre les vulnérabilités courantes. Il est impératif de les utiliser correctement pour maintenir la sécurité de l'application.

Pour toute question ou pour signaler un problème de sécurité, veuillez contacter l'équipe de sécurité.