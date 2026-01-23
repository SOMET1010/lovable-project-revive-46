Oui ! Mon Toit implémente un **système de rôles contextuels** permettant d'être locataire ET propriétaire simultanément.

## Architecture Multi-Rôle Dynamique

```
┌─────────────────────────────────────────────────────────────┐
│                 UTILISATEUR: Konan Yao                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🏠 EST PROPRIÉTAIRE ?                                       │
│  └─ Vérifie: properties.owner_id = user.id                  │
│     → 2 propriétés trouvées ✓                               │
│                                                              │
│  🔑 EST LOCATAIRE ?                                          │
│  └─ Vérifie: lease_contracts.tenant_id = user.id            │
│     → 1 bail actif trouvé ✓                                 │
│                                                              │
│  📊 RÉSULTAT:                                                │
│     isOwner: true   │   isTenant: true                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Comment ça fonctionne

| Aspect | Implémentation |
|--------|----------------|
| **Détection** | Hook `useContextualRoles` vérifie propriétés + baux |
| **Dashboard** | Unifié avec onglets dynamiques selon les rôles |
| **Navigation** | S'adapte automatiquement (liens pertinents uniquement) |
| **Transition** | Instantanée (ex: locataire publie sa 1ère propriété → devient aussi propriétaire) |

## Interface Utilisateur

Le dashboard `/mon-espace` affiche :
- **"Mon Profil"** → Toujours visible
- **"Mes Locations"** → Si `isTenant = true`
- **"Mes Propriétés"** → Si `isOwner = true`

Cette flexibilité reflète la réalité du marché ivoirien où les utilisateurs ont souvent plusieurs relations immobilières !Oui ! Mon Toit implémente un **système de rôles contextuels** permettant d'être locataire ET propriétaire simultanément.

## Architecture Multi-Rôle Dynamique

```
┌─────────────────────────────────────────────────────────────┐
│                 UTILISATEUR: Konan Yao                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🏠 EST PROPRIÉTAIRE ?                                       │
│  └─ Vérifie: properties.owner_id = user.id                  │
│     → 2 propriétés trouvées ✓                               │
│                                                              │
│  🔑 EST LOCATAIRE ?                                          │
│  └─ Vérifie: lease_contracts.tenant_id = user.id            │
│     → 1 bail actif trouvé ✓                                 │
│                                                              │
│  📊 RÉSULTAT:                                                │
│     isOwner: true   │   isTenant: true                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Comment ça fonctionne

| Aspect | Implémentation |
|--------|----------------|
| **Détection** | Hook `useContextualRoles` vérifie propriétés + baux |
| **Dashboard** | Unifié avec onglets dynamiques selon les rôles |
| **Navigation** | S'adapte automatiquement (liens pertinents uniquement) |
| **Transition** | Instantanée (ex: locataire publie sa 1ère propriété → devient aussi propriétaire) |

## Interface Utilisateur

Le dashboard `/mon-espace` affiche :
- **"Mon Profil"** → Toujours visible
- **"Mes Locations"** → Si `isTenant = true`
- **"Mes Propriétés"** → Si `isOwner = true`

Cette flexibilité reflète la réalité du marché ivoirien où les utilisateurs ont souvent plusieurs relations immobilières !