# Système de Communication Intégré - MONTOIT

## Vue d'ensemble

Le **Système de Communication Intégré** permet aux locataires et propriétaires de communiquer facilement via chat en temps réel, prise de rendez-vous pour visites, et notifications multi-canaux (in-app, email, SMS, WhatsApp).

**Date de développement**: Sprint 4 (2025-11-30)  
**Status**: ✅ COMPLET ET OPÉRATIONNEL

---

## Architecture

### Stack technique

- **Frontend**: React 18.3 + TypeScript 5.5
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Messaging**: Supabase Realtime (WebSocket)
- **Notifications**: Multi-canal (in-app, email, SMS, WhatsApp via InTouch)
- **UI**: Design tokens + Lucide React icons

### Structure des fichiers

```
src/features/messaging/
├── components/
│   ├── ChatMessage.tsx
│   ├── Chatbot.tsx
│   ├── MessageTemplates.tsx
│   └── NotificationCenter.tsx        # Dropdown notifications (220 lignes)
│
├── hooks/
│   ├── useMessages.ts                # Hook gestion messages
│   └── useMessageNotifications.ts    # Hook compteur non lus
│
├── pages/
│   ├── MessagesPage.tsx             # Chat complet (527 lignes)
│   ├── NotificationsPage.tsx        # Page notifications (372 lignes) ✨ NOUVEAU
│   └── NotificationPreferencesPage.tsx
│
├── services/
│   └── messaging.api.ts             # API messaging

src/features/tenant/pages/
├── MyVisitsPage.tsx                 # Gestion visites (471 lignes)
├── ScheduleVisitPage.tsx            # Prise de RDV (401 lignes)
└── CalendarPage.tsx                 # Calendrier visites

src/services/
└── notificationService.ts           # Service notifications

supabase/migrations/
├── 20251029131525_add_messaging_features.sql
├── 20251029135628_add_visit_scheduling_system.sql
└── 20251029180000_add_comprehensive_notifications_system.sql
```

---

## Fonctionnalités principales

### 1. Chat temps réel (`MessagesPage.tsx`)

**Fonctionnalités:**
- Liste des conversations avec prévisualisation dernier message
- Chat en temps réel via Supabase Realtime
- Indicateurs de lecture (lu/non lu)
- Badge de messages non lus
- Recherche dans les conversations
- Archivage de conversations
- Pièces jointes (photos, documents)
- Auto-scroll vers les nouveaux messages
- États de chargement et d'envoi

**Code clé - Abonnement Realtime:**
```typescript
const subscribeToMessages = () => {
  const subscription = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user?.id}`
      },
      (payload) => {
        const newMessage = payload.new as Message;
        if (newMessage.conversation_id === selectedConversation?.id) {
          setMessages(prev => [...prev, newMessage]);
        }
        loadConversations();
      }
    )
    .subscribe();
};
```

**Routes:**
- `/messages` - Page chat complète

**Intégration Header:**
- Lien "Messages" avec badge de compteur non lus
- Hook `useMessageNotifications()` pour le compteur

---

### 2. Prise de rendez-vous (`ScheduleVisitPage.tsx`, `MyVisitsPage.tsx`)

**Fonctionnalités:**

**a) Planification de visite (`ScheduleVisitPage.tsx`)**
- Formulaire de demande de visite
- Choix du type (physique / virtuelle)
- Sélection date et heure
- Disponibilités du propriétaire
- Notes du visiteur
- Confirmation instantanée

**b) Gestion des visites (`MyVisitsPage.tsx`)**
- Liste de toutes les visites (à venir, passées, annulées)
- Filtres par statut
- Annulation de visite
- Feedback et notation après visite
- Rappels automatiques (24h, 2h, 30min)

**Code clé - Création de visite:**
```typescript
const { error } = await supabase
  .from('property_visits')
  .insert({
    property_id: propertyId,
    visitor_id: user.id,
    owner_id: property.owner_id,
    visit_type: visitType,
    visit_date: selectedDate,
    visit_time: selectedTime,
    duration_minutes: 60,
    visitor_notes: notes,
    status: 'en_attente'
  });
```

**Routes:**
- `/visiter/:id` - Planifier une visite
- `/mes-visites` - Gérer mes visites
- `/dashboard/locataire/calendrier` - Calendrier complet

---

### 3. Système de notifications

#### a) NotificationCenter (Dropdown dans Header) ✨

**Fichier**: `/src/features/messaging/components/NotificationCenter.tsx` (220 lignes)

**Fonctionnalités:**
- Dropdown cliquable depuis Header
- Affiche les 20 dernières notifications
- Badge avec compteur non lus
- Marquer comme lu (individuel / tout)
- Lien vers notification complète
- Abonnement Realtime pour nouvelles notifications
- Indicateur de priorité (low, normal, high, urgent)
- Temps relatif (Il y a 5m, 2h, 3j)

**Intégration:**
```typescript
// Dans Header.tsx (ligne 367)
<div className="hidden md:block">
  <NotificationCenter />
</div>
```

#### b) NotificationsPage (Page complète) ✨ NOUVEAU

**Fichier**: `/src/features/messaging/pages/NotificationsPage.tsx` (372 lignes)

**Fonctionnalités:**
- Affiche toutes les notifications (limite 100)
- **Filtres avancés:**
  - Par statut: Toutes / Non lues / Lues
  - Par type: Tous types / Type spécifique
- **Actions:**
  - Marquer comme lu (individuel)
  - Tout marquer comme lu
  - Supprimer une notification
- Affichage détaillé avec metadata
- Lien vers préférences
- Design responsive avec grille adaptative

**Routes:**
- `/notifications` - Page complète ✨ NOUVEAU
- `/notifications/preferences` - Paramètres

#### c) Service de notifications

**Fichier**: `/src/services/notificationService.ts`

**Méthodes:**
```typescript
notificationService.getNotifications(limit)    // Récupérer notifications
notificationService.getUnreadCount()           // Compteur non lus
notificationService.markAsRead(id)             // Marquer lu
notificationService.markAllAsRead()            // Tout marquer lu
notificationService.deleteNotification(id)     // Supprimer ✨ NOUVEAU
notificationService.createNotification(params) // Créer notification
notificationService.subscribeToNotifications() // Abonnement Realtime
```

**Types de notifications:**
- `payment_received` - Paiement reçu
- `payment_reminder` - Rappel paiement
- `visit_scheduled` - Visite programmée
- `visit_reminder` - Rappel visite
- `application_received` - Candidature reçue
- `application_status` - Statut candidature
- `contract_signed` - Contrat signé
- `contract_expiring` - Contrat expire
- `message_received` - Message reçu
- `property_update` - Mise à jour propriété
- `verification_complete` - Vérification complète
- `maintenance_request` - Demande maintenance
- `system_announcement` - Annonce système

---

## Base de données

### Tables principales

#### 1. `conversations`

```sql
CREATE TABLE conversations (
  id uuid PRIMARY KEY,
  participant_1_id uuid REFERENCES auth.users(id),
  participant_2_id uuid REFERENCES auth.users(id),
  property_id uuid REFERENCES properties(id),
  last_message_at timestamptz,
  participant_1_archived boolean,
  participant_2_archived boolean,
  created_at timestamptz
);
```

**Indexes:**
- `idx_conversations_participant_1`
- `idx_conversations_participant_2`
- `idx_conversations_property`
- `idx_conversations_last_message`

#### 2. `messages`

```sql
CREATE TABLE messages (
  id uuid PRIMARY KEY,
  conversation_id uuid REFERENCES conversations(id),
  sender_id uuid REFERENCES auth.users(id),
  receiver_id uuid REFERENCES auth.users(id),
  content text,
  read boolean DEFAULT false,
  read_at timestamptz,
  deleted_by_sender boolean,
  deleted_by_receiver boolean,
  created_at timestamptz
);
```

#### 3. `message_attachments`

```sql
CREATE TABLE message_attachments (
  id uuid PRIMARY KEY,
  message_id uuid REFERENCES messages(id),
  file_url text,
  file_name text,
  file_type text,
  file_size integer,
  created_at timestamptz
);
```

#### 4. `property_visits`

```sql
CREATE TABLE property_visits (
  id uuid PRIMARY KEY,
  property_id uuid REFERENCES properties(id),
  visitor_id uuid REFERENCES auth.users(id),
  owner_id uuid REFERENCES auth.users(id),
  visit_type visit_type, -- 'physique' | 'virtuelle'
  visit_date date,
  visit_time time,
  duration_minutes integer,
  status visit_status, -- 'en_attente' | 'confirmee' | 'annulee' | 'terminee'
  visitor_notes text,
  owner_notes text,
  feedback text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid,
  cancellation_reason text,
  created_at timestamptz,
  updated_at timestamptz
);
```

#### 5. `owner_availability`

```sql
CREATE TABLE owner_availability (
  id uuid PRIMARY KEY,
  owner_id uuid REFERENCES auth.users(id),
  property_id uuid REFERENCES properties(id),
  day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time,
  end_time time,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
);
```

#### 6. `notifications`

```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  type text CHECK (type IN (
    'payment_received', 'payment_reminder', 'visit_scheduled',
    'visit_reminder', 'application_received', 'application_status',
    'contract_signed', 'contract_expiring', 'message_received',
    'property_update', 'verification_complete', 'maintenance_request',
    'system_announcement'
  )),
  title text,
  message text,
  channels jsonb, -- ['in_app', 'email', 'sms', 'whatsapp', 'push']
  read boolean,
  read_at timestamptz,
  action_url text,
  action_label text,
  metadata jsonb,
  priority text CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at timestamptz
);
```

#### 7. `notification_preferences`

```sql
CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  email_enabled boolean,
  sms_enabled boolean,
  whatsapp_enabled boolean,
  push_enabled boolean,
  in_app_enabled boolean,
  email_types jsonb,
  sms_types jsonb,
  whatsapp_types jsonb,
  push_types jsonb,
  quiet_hours_enabled boolean,
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz,
  updated_at timestamptz
);
```

### Fonctions SQL

#### `get_or_create_conversation(user1_id, user2_id, property_id)`

Crée ou récupère une conversation entre deux utilisateurs.

```sql
-- Utilisation dans le code
const conversationId = await supabase.rpc('get_or_create_conversation', {
  p_user1_id: currentUserId,
  p_user2_id: otherUserId,
  p_property_id: propertyId
});
```

#### `create_notification(...)`

Crée une notification avec vérification des préférences utilisateur.

#### `mark_notification_read(notification_id)`

Marque une notification comme lue.

#### `mark_all_notifications_read()`

Marque toutes les notifications de l'utilisateur comme lues.

#### `get_unread_notification_count()`

Retourne le nombre de notifications non lues.

### RLS (Row Level Security)

**Conversations:**
```sql
-- Users can view their own conversations
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);
```

**Messages:**
```sql
-- Users can view messages in their conversations
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
```

**Notifications:**
```sql
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Flux utilisateur

### Scénario 1: Envoyer un message

1. Locataire visite une page de propriété
2. Clique sur "Contacter le propriétaire"
3. Système crée/récupère conversation via `get_or_create_conversation`
4. Redirige vers `/messages` avec conversation ouverte
5. Locataire tape son message et envoie
6. Message inséré dans table `messages`
7. **Trigger** met à jour `last_message_at` dans `conversations`
8. **Realtime** notifie le propriétaire
9. **Notification in-app** créée pour le propriétaire
10. **Email** envoyé au propriétaire (si activé dans préférences)

### Scénario 2: Planifier une visite

1. Locataire clique "Planifier une visite" sur propriété
2. Accède à `/visiter/:id` (ScheduleVisitPage)
3. Sélectionne type (physique/virtuelle)
4. Choisit date/heure dans les disponibilités
5. Ajoute des notes
6. Soumet le formulaire
7. Visite créée avec `status: 'en_attente'`
8. **Notification** envoyée au propriétaire
9. Propriétaire confirme ou refuse
10. **Notification** envoyée au locataire
11. **Rappels automatiques** envoyés 24h, 2h, 30min avant

### Scénario 3: Recevoir des notifications

1. Événement se produit (nouveau message, visite confirmée, etc.)
2. **Backend** appelle `create_notification()` via trigger ou edge function
3. Notification insérée dans table `notifications`
4. **Realtime** diffuse la notification
5. **NotificationCenter** reçoit via subscription et affiche badge
6. Utilisateur clique sur l'icône cloche
7. Dropdown s'ouvre avec liste des notifications
8. Utilisateur peut:
   - Cliquer pour voir détails (action_url)
   - Marquer comme lu
   - Voir toutes (/notifications)
9. Sur `/notifications`: filtre, tri, suppression

---

## Configuration Supabase Realtime

### Activation Realtime

Dans le dashboard Supabase:

1. **Database → Replication**
2. Activer Realtime pour les tables:
   - `messages`
   - `conversations`
   - `notifications`
   - `property_visits`

### Code d'abonnement

```typescript
// Messages
const subscription = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${userId}`
    },
    (payload) => {
      handleNewMessage(payload.new);
    }
  )
  .subscribe();

// Notifications
const notifSubscription = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      handleNewNotification(payload.new);
    }
  )
  .subscribe();

// Cleanup
return () => {
  subscription.unsubscribe();
  notifSubscription.unsubscribe();
};
```

---

## Tests

### Tests manuels requis

**1. Chat temps réel**
```
✅ Créer une conversation
✅ Envoyer un message
✅ Recevoir un message en temps réel (via Realtime)
✅ Badge de compteur non lus s'incrémente
✅ Marquer comme lu
✅ Archiver conversation
✅ Rechercher dans conversations
✅ Upload pièce jointe
```

**2. Prise de rendez-vous**
```
✅ Voir disponibilités propriétaire
✅ Créer demande de visite
✅ Notification envoyée au propriétaire
✅ Propriétaire confirme visite
✅ Notification envoyée au locataire
✅ Rappels automatiques (24h, 2h, 30min)
✅ Annulation de visite
✅ Feedback après visite
```

**3. Notifications**
```
✅ NotificationCenter visible dans Header
✅ Badge compteur non lus affiché
✅ Dropdown s'ouvre au clic
✅ Nouvelles notifications apparaissent en temps réel
✅ Marquer une notification comme lue
✅ Tout marquer comme lu
✅ Accès à /notifications
✅ Filtrer par statut (toutes/non lues/lues)
✅ Filtrer par type
✅ Supprimer une notification
✅ Cliquer sur action_url redirige correctement
```

**4. Responsive design**
```
✅ Mobile (375px): Chat utilisable, notifications accessibles
✅ Tablet (768px): Layout adapté
✅ Desktop (1920px): Toutes fonctionnalités visibles
```

### Tests d'intégration

```typescript
// Test création conversation
describe('Messaging System', () => {
  it('should create or get conversation', async () => {
    const { data } = await supabase.rpc('get_or_create_conversation', {
      p_user1_id: user1.id,
      p_user2_id: user2.id,
      p_property_id: property.id
    });
    expect(data).toBeDefined();
  });

  it('should send message', async () => {
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        sender_id: user1.id,
        receiver_id: user2.id,
        content: 'Test message'
      });
    expect(error).toBeNull();
  });
});
```

---

## Gestion des erreurs

### Messages d'erreur utilisateur

**Chat:**
- "Impossible de charger les conversations" - Erreur récupération
- "Erreur d'envoi du message" - Échec insert
- "Connexion perdue, reconnexion..." - Realtime déconnecté

**Visites:**
- "Cette propriété n'est plus disponible" - Propriété supprimée
- "Ce créneau n'est plus disponible" - Conflit horaire
- "Erreur lors de la création de la visite" - Échec insert

**Notifications:**
- "Erreur de chargement des notifications" - Échec récupération
- "Impossible de marquer comme lu" - Échec update

### Gestion technique

```typescript
try {
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData);

  if (error) throw error;
} catch (err) {
  console.error('Erreur messaging:', err);
  setError('Une erreur est survenue lors de l\'envoi');
} finally {
  setLoading(false);
}
```

---

## Optimisations & bonnes pratiques

### Performance

1. **Lazy loading des conversations**
   - Charger seulement 20 conversations initiales
   - Pagination pour le reste

2. **Debounce de la recherche**
   ```typescript
   const debouncedSearch = useMemo(
     () => debounce((query) => handleSearch(query), 300),
     []
   );
   ```

3. **Cleanup des subscriptions**
   ```typescript
   useEffect(() => {
     const sub = subscribeToMessages();
     return () => sub(); // Cleanup
   }, []);
   ```

### Sécurité

1. **RLS strictes**
   - Users ne peuvent voir QUE leurs conversations/notifications
   - Double vérification frontend + backend

2. **Sanitization du contenu**
   ```typescript
   const sanitizedContent = content.trim().slice(0, 5000);
   ```

3. **Rate limiting**
   - Limiter envois de messages (ex: 10/minute)
   - Via edge functions ou triggers

### UX

1. **États de chargement**
   - Skeleton loaders pour conversations
   - Spinner pendant envoi
   - Optimistic UI (message affiché immédiatement)

2. **Feedback visuel**
   - Animation badge notification
   - Son pour nouveau message (optionnel)
   - Toast notifications

3. **Accessibilité**
   - Labels ARIA
   - Navigation clavier
   - Lecteurs d'écran

---

## Évolutions futures

### Fonctionnalités planifiées

1. **Chat vidéo/audio**
   - Intégration WebRTC
   - Visites virtuelles en direct

2. **Messagerie de groupe**
   - Conversations multi-participants
   - Chat agence + propriétaire + locataire

3. **Templates de messages**
   - Réponses pré-définies
   - Variables dynamiques

4. **Traduction automatique**
   - Messages multilingues
   - Détection automatique langue

5. **Bot assistant**
   - Réponses automatiques questions fréquentes
   - Chatbot IA pour première qualification

6. **Push notifications navigateur**
   - Web Push API
   - Notifications desktop

7. **Calendrier synchronisé**
   - Export vers Google Calendar / iCal
   - Synchronisation bidirectionnelle

---

## Dépannage

### Problèmes courants

**1. Messages ne s'affichent pas en temps réel**
```
Vérifier:
- Supabase Realtime activé pour table 'messages'
- Subscription créée correctement
- WebSocket connecté (vérifier Network tab)
- RLS policies permettent SELECT
```

**2. NotificationCenter n'apparaît pas**
```
Vérifier:
- Import dans Header.tsx (ligne 4)
- Composant ajouté ligne 367
- User authentifié
```

**3. Badge compteur non lus incorrect**
```
Vérifier:
- Fonction get_unread_notification_count() existe
- Hook useMessageNotifications() actif
- Subscription aux nouveaux messages
```

**4. Visites ne peuvent pas être créées**
```
Vérifier:
- Table property_visits existe
- RLS policy permet INSERT pour authenticated
- Disponibilités propriétaire configurées
```

---

## Changelog

### Sprint 4 (2025-11-30) ✨ NOUVEAU
- ✅ Intégration NotificationCenter dans Header
- ✅ Création NotificationsPage.tsx (372 lignes)
- ✅ Ajout méthode deleteNotification() au service
- ✅ Ajout route /notifications
- ✅ Documentation complète du système

### Existant avant Sprint 4
- ✅ MessagesPage.tsx - Chat complet (527 lignes)
- ✅ MyVisitsPage.tsx - Gestion visites (471 lignes)
- ✅ ScheduleVisitPage.tsx - Prise RDV (401 lignes)
- ✅ NotificationCenter.tsx - Dropdown (220 lignes)
- ✅ Tables backend complètes
- ✅ Fonctions SQL et triggers
- ✅ RLS policies
- ✅ Hooks et services API

---

## Support & Contact

Pour toute question concernant le Système de Communication Intégré:

- **Documentation**: `/docs/COMMUNICATION_SYSTEM_README.md`
- **Repository**: https://github.com/SOMET1010/MONTOITVPROD
- **Logs Supabase**: Dashboard → Logs

---

**Documentation générée le 2025-11-30**  
**Version: Sprint 4 - Système de Communication Intégré Complet**
