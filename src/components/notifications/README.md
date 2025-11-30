# Système de Notifications Temps Réel - Guide Complet

## Vue d'ensemble

Le système de notifications temps réel pour MonToit offre une expérience utilisateur moderne et intuitive pour gérer les notifications liées aux candidatures immobilières.

## Composants Créés

### 1. 🔔 NotificationBell
Cloche avec compteur de notifications non lues.

**Props:**
- `className?: string` - Classes CSS personnalisées
- `size?: 'small' | 'medium' | 'large'` - Taille de la cloche
- `showTooltip?: boolean` - Afficher le tooltip

**Exemple d'utilisation:**
```tsx
<NotificationBell size="medium" showTooltip={true} />
```

### 2. 📋 NotificationCenter
Centre principal de gestion des notifications avec filtres et paramètres.

**Props:**
- `isOpen: boolean` - État d'ouverture du panneau
- `onClose: () => void` - Callback de fermeture
- `className?: string` - Classes CSS personnalisées

**Fonctionnalités:**
- Liste des notifications avec pagination
- Recherche textuelle
- Filtres par type, priorité, statut de lecture
- Actions en lot (tout marquer lu)
- Paramètres de notifications

### 3. 📄 NotificationItem
Élément individuel de notification avec actions.

**Props:**
- `notification: ApplicationNotification` - Données de la notification
- `onMarkAsRead: (id: string) => void` - Action marquer lu
- `onDelete: (id: string) => void` - Action supprimer
- `className?: string` - Classes CSS personnalisées

### 4. ⚙️ NotificationSettings
Interface de configuration des préférences de notifications.

**Fonctionnalités:**
- Paramètres généraux (email, push, son)
- Heures silencieuses
- Configuration par type de notification
- Activation/désactivation par canal

## Hook Principal: useNotifications

### Utilisation de base
```tsx
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  } = useNotifications();

  return (
    <div>
      <p>Notifications non lues: {unreadCount}</p>
      {/* Votre UI ici */}
    </div>
  );
}
```

### Options avancées
```tsx
const {
  notifications,
  unreadCount,
  filter,
  settings,
  setFilter,
  updateSettings,
  isSubscribed,
  subscribe,
  unsubscribe
} = useNotifications();

// Filtrer les notifications
setFilter({
  type: 'application_received',
  priority: 'high',
  read: false,
  limit: 20
});

// Modifier les paramètres
updateSettings({
  sound_enabled: false,
  quiet_hours_enabled: true
});
```

## Types de Notifications

### 1. application_received
**Pour:** Propriétaires  
**Déclenchement:** Nouvelle candidature reçue  
**Priorité:** High  

```tsx
applicationNotificationService.notifyApplicationReceived({
  ownerId: 'owner-123',
  applicantName: 'Jean Dupont',
  propertyTitle: 'Appartement 3 pièces - Paris',
  propertyId: 'prop-456',
  applicationId: 'app-789'
});
```

### 2. application_status_change
**Pour:** Candidats  
**Déclenchement:** Changement de statut de candidature  
**Priorité:** Normal/High selon le statut  

```tsx
applicationNotificationService.notifyStatusChange({
  applicantId: 'applicant-123',
  propertyTitle: 'Studio - Lyon',
  propertyId: 'prop-456',
  applicationId: 'app-789',
  oldStatus: 'pending',
  newStatus: 'approved'
});
```

### 3. document_reminder
**Pour:** Candidats  
**Déclenchement:** Documents manquants  
**Priorité:** Urgent si moins de 24h  

```tsx
applicationNotificationService.notifyDocumentReminder({
  userId: 'user-123',
  documentType: 'justificatif de revenus',
  propertyTitle: 'Appartement 2 pièces',
  dueDate: '2025-12-05T23:59:59Z',
  propertyId: 'prop-456',
  applicationId: 'app-789'
});
```

### 4. contract_deadline
**Pour:** Propriétaires et candidats  
**Déclenchement:** Échéance de contrat  
**Priorité:** Urgent si moins de 24h  

```tsx
applicationNotificationService.notifyContractDeadline({
  userId: 'user-123',
  propertyTitle: 'Maison avec jardin',
  contractId: 'contract-456',
  dueDate: '2025-12-03T12:00:00Z',
  actionRequired: 'signature du bail'
});
```

### 5. new_message
**Pour:** Propriétaires et candidats  
**Déclenchement:** Nouveau message reçu  
**Priorité:** Normal  

```tsx
applicationNotificationService.notifyNewMessage({
  userId: 'user-123',
  senderName: 'Marie Martin',
  propertyTitle: 'Appartement centre-ville',
  messagePreview: 'Bonjour, je suis interested in...',
  propertyId: 'prop-456',
  messageId: 'msg-789'
});
```

## Intégration dans l'Application

### 1. Header Principal
```tsx
// Dans votre composant Header
import { NotificationBell, NotificationCenter } from '@/components/notifications';

function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="flex items-center justify-between p-4">
      {/* Logo et navigation */}
      
      <div className="flex items-center space-x-4">
        <NotificationBell />
        <NotificationCenter 
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />
      </div>
    </header>
  );
}
```

### 2. Sidebar
```tsx
// Dans votre composant Sidebar
import { NotificationBell } from '@/components/notifications';

function Sidebar() {
  return (
    <nav>
      {/* Éléments de navigation */}
      <button className="flex items-center space-x-2">
        <NotificationBell size="small" showTooltip={false} />
        <span>Notifications</span>
      </button>
    </nav>
  );
}
```

### 3. Dashboard
```tsx
// Dans une page de tableau de bord
import { useNotificationIntegration } from '@/components/notifications/examples';

function Dashboard() {
  const {
    NotificationButton,
    NotificationCenterComponent
  } = useNotificationIntegration();

  return (
    <div>
      {/* Contenu du dashboard */}
      
      {/* Bouton notifications */}
      {NotificationButton}
      
      {/* Centre de notifications */}
      {NotificationCenterComponent}
    </div>
  );
}
```

## Notifications Push du Navigateur

Le système inclut automatiquement les notifications push du navigateur:

```tsx
// Demande de permission (automatique)
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, []);

// Affichage automatique des notifications push
// (configuré dans useNotifications.ts)
```

## Sons de Notification

Le système génère automatiquement des sons différenciés:
- **Son nouveau:** Haute fréquence (800Hz) + plus long (200ms)
- **Son lu:** Fréquence plus basse (600Hz) + plus court (100ms)

**Contrôle:**
```tsx
// Dans les paramètres
updateSettings({
  sound_enabled: false  // Désactiver les sons
});
```

## Accessibilité

Tous les composants respectent les standards d'accessibilité:

- **Navigation clavier:** Tab, Enter, Space
- **ARIA labels:** Descriptions complètes pour les lecteurs d'écran
- **Contrastes:** Respect des ratios WCAG AA
- **Focus visible:** Anneaux de focus visibles
- **Texte alternatif:** Icônes avec aria-hidden

## Animations et Transitions

### Animations CSS personnalisées
```css
/* Dans votre fichier CSS global */
@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.animate-bounce-subtle {
  animation: bounce-subtle 1s infinite;
}
```

### Transitions fluides
- **Cloche:** Rotation et coloration selon l'état
- **Badge:** Animation de rebond pour les nouvelles notifications
- **Panneau:** Slide-in depuis la droite
- **Items:** Hover states et transitions de couleur

## Personnalisation du Style

### Classes CSS disponibles
```tsx
// NotificationBell
<NotificationBell className="custom-bell-class" />

// NotificationItem
<NotificationItem className="custom-item-class" />

// NotificationCenter
<NotificationCenter className="custom-center-class" />
```

### Variables CSS personnalisées
```css
:root {
  --notification-pulse-color: #3B82F6;
  --notification-success-color: #10B981;
  --notification-warning-color: #F59E0B;
  --notification-error-color: #EF4444;
}
```

## Base de Données

### Table notifications (existante)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channels TEXT[] DEFAULT ARRAY['in_app'],
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  action_label TEXT,
  metadata JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Index recommandés
```sql
-- Performance des requêtes
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type_priority ON notifications(type, priority);
```

## Optimisations de Performance

### 1. Pagination
```tsx
// Charger par lots
setFilter({
  limit: 20,
  offset: currentPage * 20
});
```

### 2. Filtrage côté client
```tsx
// Filtrage immédiat sans requête supplémentaire
const filteredNotifications = notifications.filter(/* logique */);
```

### 3. Subscription cleanup
```tsx
// Nettoyage automatique des subscriptions
useEffect(() => {
  return () => {
    unsubscribe(); // Nettoyage lors du unmount
  };
}, []);
```

## Tests

### Tests unitaires recommandés
```tsx
// test/NotificationBell.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBell } from '@/components/notifications';

test('affiche le compteur pour les notifications non lues', () => {
  render(<NotificationBell />);
  expect(screen.getByText('5')).toBeInTheDocument();
});
```

### Tests d'intégration
```tsx
// test/NotificationSystem.test.tsx
import { renderWithProviders } from '@/test-utils';
import { useNotifications } from '@/hooks/useNotifications';

test('marque toutes les notifications comme lues', async () => {
  // Test de l'action markAllAsRead
});
```

## Monitoring et Analytics

### Métriques à suivre
- Nombre de notifications envoyées par type
- Taux de lecture des notifications
- Temps de réponse moyen
- Erreurs d'envoi

### Logging
```tsx
// Dans le service
console.log('Notification sent:', {
  userId,
  type,
  priority,
  timestamp: new Date().toISOString()
});
```

## Dépannage

### Problèmes courants

**1. Les notifications ne s'affichent pas**
- Vérifier la permission du navigateur
- Contrôler la connexion WebSocket
- Vérifier les filtres actifs

**2. Le son ne fonctionne pas**
- Vérifier les paramètres utilisateur
- Contrôler les heures silencieuses
- Tester l'AudioContext

**3. Performance dégradée**
- Vérifier la pagination
- Optimiser les filtres
- Nettoyer les subscriptions

### Debug Mode
```tsx
// Activer le mode debug
localStorage.setItem('notifications-debug', 'true');
```

Ce système de notifications offre une expérience moderne et complète pour gérer efficacement les communications dans MonToit. L'intégration est simple et les fonctionnalités avancées assurent une expérience utilisateur optimale.