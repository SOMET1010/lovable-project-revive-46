# Guide de Sécurité pour les Développeurs

Ce guide explique les bonnes pratiques de sécurité à suivre lors du développement de nouvelles fonctionnalités dans l'application MonToit.

## Table des matières

1. [Principes de Sécurité](#principes-de-sécurité)
2. [Règles de Codage Sécurisé](#règles-de-codage-sécurisé)
3. [Utilisation des Services Sécurisés](#utilisation-des-services-sécurisés)
4. [Gestion des Permissions](#gestion-des-permissions)
5. [Validation des Entrées](#validation-des-entrées)
6. [Gestion des Erreurs](#gestion-des-erreurs)
7. [Logging et Audit](#logging-et-audit)
8. [Tests de Sécurité](#tests-de-sécurité)
9. [Checklist de Sécurité](#checklist-de-sécurité)

---

## Principes de Sécurité

### 1. Principe du Moindre Privilège
Les utilisateurs ne doivent avoir que les permissions strictement nécessaires pour accomplir leurs tâches.

### 2. Défense en Profondeur
Utilisez plusieurs couches de sécurité:
- Validation côté client
- Validation côté serveur
- Vérifications dans la base de données (RLS)

### 3. Validation par Refus (Deny by Default)
Par défaut, refusez l'accès et accordez explicitement les permissions.

### 4. Moindre Surprise
Le comportement par défaut doit être le plus sécurisé possible.

---

## Règles de Codage Sécurisé

### 1. Toujours utiliser le Service Layer

```typescript
// ❌ NE FAITES PAS CELA
export async function deleteProperty(propertyId: string) {
  // Danger: bypass des validations de sécurité!
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId);
  return { error };
}

// ✅ FAITES CELA
export async function deleteProperty(propertyId: string) {
  // Utiliser le service sécurisé avec toutes les validations
  return propertyApi.delete(propertyId);
}
```

### 2. Valider toutes les entrées

```typescript
// ❌ Entrée non validée
const email = req.body.email;

// ✅ Entrée validée
const email = InputValidator.sanitizeString(req.body.email);
if (!InputValidator.isValidEmail(email)) {
  throw new Error('Email invalide');
}
```

### 3. Ne jamais exposer de données sensibles

```typescript
// ❌ Expose des données sensibles
const { data } = await supabase
  .from('users')
  .select('email, password_hash, credit_card');

// ✅ Uniquement les données nécessaires
const { data } = await supabase
  .from('users_public_view')
  .select('full_name, avatar_url');
```

### 4. Utiliser les transactions pour les opérations complexes

```typescript
// ✅ Opération atomique
const { data, error } = await supabase.rpc('transfer_property_ownership', {
  property_id: propertyId,
  new_owner_id: newOwnerId,
});
```

---

## Utilisation des Services Sécurisés

### Authentification

```typescript
import { useSecureAuth } from '@/shared/hooks/useSecureAuth';

function LoginForm() {
  const { signIn, isSigningIn } = useSecureAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn({ email, password });
      // Le rate limiting est automatiquement appliqué
    } catch (error) {
      // L'erreur est déjà formatée et montrée à l'utilisateur
    }
  };
}
```

### Upload de fichiers

```typescript
import SecureUpload from '@/shared/components/SecureUpload';

function PropertyPhotos() {
  return (
    <SecureUpload
      bucket="PROPERTIES"
      resourceType="property"
      resourceId={propertyId}
      accept="image/*"
      maxSizeMB={5}
      compressImage
      onUploadComplete={(url) => {
        // L'upload est déjà sécurisé et validé
        setPhotoUrl(url);
      }}
    />
  );
}
```

### Messagerie

```typescript
import { useSecureMessaging } from '@/features/messaging/hooks/useSecureMessaging';

function ChatComponent() {
  const { sendMessage, isSendingMessage } = useSecureMessaging();

  const handleSend = async (message: string) => {
    // La validation de participants est automatique
    await sendMessage(conversationId, message);
  };
}
```

### Routes protégées

```typescript
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';

function AdminPanel() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}

function PropertyEdit() {
  return (
    <ProtectedRoute requiredPermission="canEditProperty">
      <PropertyEditForm />
    </ProtectedRoute>
  );
}
```

---

## Gestion des Permissions

### 1. Définir les permissions clairement

```typescript
// Dans roleValidation.service.ts
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  owner: {
    canCreateProperty: true,
    canEditProperty: true,
    canDeleteProperty: true,
    // ... autres permissions
  },
  tenant: {
    canCreateProperty: false,
    canEditProperty: false,
    canDeleteProperty: false,
    // ... autres permissions
  },
};
```

### 2. Vérifier les permissions avant les actions

```typescript
export async function updateProperty(propertyId: string, updates: any) {
  // 1. Vérifier la permission générale
  await requirePermission('canEditProperty')();

  // 2. Vérifier la propriété spécifique
  await requireOwnership('property')(propertyId);

  // 3. Procéder à la mise à jour
  return propertyApi.update(propertyId, updates);
}
```

### 3. Utiliser les bons niveaux de permission

- **ADMIN**: Actions système, gestion des utilisateurs
- **TRUST_AGENT**: Vérification des utilisateurs et propriétés
- **MODERATOR**: Modération du contenu
- **AGENCY/OWNER**: Gestion des propriétés
- **TENANT**: Utilisation normale de la plateforme

---

## Validation des Entrées

### 1. Validation côté serveur obligatoire

```typescript
export function validatePropertyData(data: any): PropertyInsert {
  const errors: string[] = [];

  // Validation required
  if (!data.title) errors.push('Le titre est requis');
  if (!data.address) errors.push('L\'adresse est requise');

  // Validation format
  if (data.price && isNaN(Number(data.price))) {
    errors.push('Le prix doit être un nombre');
  }

  // Validation de sécurité
  if (data.description) {
    // Nettoyer le HTML potentiellement dangereux
    data.description = InputValidator.sanitizeString(data.description);
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  return data as PropertyInsert;
}
```

### 2. Validation côté client pour l'UX

```typescript
function PropertyForm() {
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = () => {
    const formErrors = [];

    if (!title) formErrors.push('Le titre est requis');
    if (price && isNaN(price)) formErrors.push('Le prix doit être valide');

    setErrors(formErrors);
    return formErrors.length === 0;
  };
}
```

### 3. Types TypeScript stricts

```typescript
// Définir des types stricts
interface PropertyCreateRequest {
  title: string;
  description: string;
  price: number;
  address: string;
  // Pas de champs optionnels qui pourraient être utilisés malicieusement
}

// Utiliser des types union pour les valeurs connues
type PropertyStatus = 'available' | 'rented' | 'maintenance';
```

---

## Gestion des Erreurs

### 1. Ne jamais exposer d'informations sensibles

```typescript
// ❌ Mauvais - Expose des détails de l'erreur
catch (error) {
  res.status(500).json({
    error: 'Database error',
    details: error.sqlMessage, // Danger!
    stack: error.stack, // Très dangereux!
  });
}

// ✅ Bon - Erreur générique
catch (error) {
  console.error('Error details:', error); // Logger les détails côté serveur
  res.status(500).json({
    error: 'Une erreur est survenue',
    code: 'INTERNAL_ERROR',
  });
}
```

### 2. Logger les erreurs de sécurité

```typescript
import { securityMonitoring } from '@/shared/services/securityMonitoring.service';

catch (error) {
  // Logger pour le debugging
  console.error('Operation failed:', error);

  // Logger pour la sécurité si nécessaire
  if (error.message.includes('unauthorized')) {
    await securityMonitoring.logSecurityEvent(
      'UNAUTHORIZED_ACCESS',
      'MEDIUM',
      { operation: 'updateProperty', attemptedId: propertyId },
      userId,
      req.ip
    );
  }
}
```

### 3. Messages d'erreur cohérents

```typescript
// Utiliser des messages génériques pour les opérations sensibles
const ERROR_MESSAGES = {
  LOGIN_FAILED: 'Email ou mot de passe incorrect',
  ACCESS_DENIED: 'Accès non autorisé',
  RATE_LIMIT: 'Trop de tentatives, veuillez réessayer plus tard',
  INVALID_INPUT: 'Données invalides',
} as const;
```

---

## Logging et Audit

### 1. Logger toutes les actions sensibles

```typescript
export async function deleteUser(userId: string) {
  // Logger avant l'action
  await securityMonitoring.logSecurityEvent(
    'USER_DELETION',
    'HIGH',
    { targetUserId: userId },
    currentUserId,
    requestIp
  );

  // Exécuter l'action
  const result = await userApi.delete(userId);

  // Logger après l'action
  console.log(`User ${userId} deleted by ${currentUserId}`);

  return result;
}
```

### 2. Utiliser les niveaux de log appropriés

```typescript
// ERROR: Problèmes qui nécessitent une attention immédiate
console.error('Security breach detected:', breach);

// WARN: Problèmes potentiels
console.warn('Suspicious activity detected:', activity);

// INFO: Actions importantes mais normales
console.info('User logged in:', userId);

// DEBUG: Information détaillée pour le développement
console.debug('Processing request:', requestDetails);
```

### 3. Inclure le contexte dans les logs

```typescript
const logContext = {
  userId,
  action: 'property.update',
  resourceId: propertyId,
  timestamp: new Date().toISOString(),
  ip: request.ip,
  userAgent: request.headers['user-agent'],
};

logger.info('Action completed', logContext);
```

---

## Tests de Sécurité

### 1. Tester les cas limites

```typescript
describe('Security Tests', () => {
  it('should prevent property deletion by non-owner', async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    const property = await createProperty({ ownerId: user1.id });

    // Tenter de supprimer avec user2
    await expect(
      propertyApi.delete(property.id, user2.id)
    ).rejects.toThrow('Non autorisé');
  });

  it('should sanitize malicious input', () => {
    const malicious = '<script>alert("xss")</script>';
    const sanitized = InputValidator.sanitizeString(malicious);
    expect(sanitized).not.toContain('<script>');
  });
});
```

### 2. Tester le rate limiting

```typescript
it('should block excessive API calls', async () => {
  const userId = 'test-user';
  let lastResult;

  // Faire plusieurs requêtes rapidement
  for (let i = 0; i < 10; i++) {
    lastResult = await rateLimiter.checkLimit(userId, 'test:operation');
  }

  expect(lastResult.allowed).toBe(false);
});
```

### 3. Tests d'injection

```typescript
it('should prevent SQL injection', async () => {
  const maliciousInput = "'; DROP TABLE users; --";

  // La requête devrait échouer ou être ignorée
  const result = await propertyApi.search(maliciousInput);
  expect(result).toBeDefined();

  // Vérifier que la table users existe toujours
  const { data } = await supabase.from('users').select('count');
  expect(data).toBeDefined();
});
```

---

## Checklist de Sécurité

Avant de déployer du nouveau code:

### ✅ Validation des entrées
- [ ] Toutes les entrées utilisateur sont validées
- [ ] Les types sont stricts avec TypeScript
- [ ] Le HTML dangereux est nettoyé
- [ ] Les tailles sont limitées

### ✅ Permissions
- [ ] Les permissions sont vérifiées côté serveur
- [ ] Le principe du moindre privilège est appliqué
- [ ] La propriété des ressources est vérifiée
- [ ] Les rôles sont correctement définis

### ✅ Gestion des erreurs
- [ ] Les erreurs n'exposent pas d'informations sensibles
- [ ] Les erreurs de sécurité sont loggées
- [ ] Les messages sont cohérents

### ✅ Logging
- [ ] Les actions sensibles sont loggées
- [ ] Le contexte est inclus dans les logs
- [ ] Les niveaux de log sont appropriés

### ✅ Tests
- [ ] Tests unitaires pour les validations
- [ ] Tests d'intégration pour les flux
- [ ] Tests de sécurité spécifiques
- [ ] Tests des cas limites

### ✅ Performance
- [ ] Le rate limiting est configuré
- [ ] Les requêtes sont optimisées
- [ ] Pas de fuites d'informations

---

## Ressources Utiles

- [Documentation OWASP](https://owasp.org/)
- [Top 10 OWASP Web Security Risks](https://owasp.org/www-project-top-ten/)
- [TypeScript Security Best Practices](https://typescript-eslint.io/rules/)
- [Supabase Security Guide](https://supabase.com/docs/guides/security)

## Signalement de Vulnérabilités

Si vous découvrez une vulnérabilité de sécurité:
1. Ne la divulguez pas publiquement
2. Contactez immédiatement l'équipe de sécurité
3. Fournissez le maximum de détails pour reproduire le problème
4. Suivez le processus de divulgation responsable

Email de sécurité: security@montoit.ci