/**
 * Service de données de démonstration pour MONTOITVPROD
 * Fournit des données factices pour que l'interface fonctionne sans backend
 */

// Données de démonstration pour les propriétés
export const demoProperties = [
  {
    id: '1',
    title: 'Magnifique villa moderne à Cocody',
    description: 'Belle villa de 4 chambres avec piscine, située dans un quartier résidentiel calme de Cocody.',
    price: 150000,
    currency: 'XOF',
    type: 'vente',
    property_type: 'villa',
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    city: 'Abidjan',
    district: 'Cocody',
    address: 'Rue des Jardins, Cocody',
    images: ['/images/hero-villa-cocody.jpg'],
    features: ['Piscine', 'Garage', 'Jardin', 'Sécurité 24h/24'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: 'demo-owner-1',
    status: 'disponible'
  },
  {
    id: '2',
    title: 'Appartement moderne au Plateau',
    description: 'Appartement 3 chambres meublé au cœur du Plateau, идеально для профессионалов.',
    price: 200000,
    currency: 'XOF',
    type: 'location',
    property_type: 'appartement',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    city: 'Abidjan',
    district: 'Plateau',
    address: 'Avenue Lamblin, Plateau',
    images: ['/images/hero-immeuble-moderne.png'],
    features: ['Meublé', 'Climatisé', 'Ascenseur', 'Parking'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: 'demo-owner-2',
    status: 'disponible'
  },
  {
    id: '3',
    title: 'Studio étudiant à Yopougon',
    description: 'Studio abordable pour étudiants, proche des universités et commodités.',
    price: 35000,
    currency: 'XOF',
    type: 'location',
    property_type: 'studio',
    bedrooms: 1,
    bathrooms: 1,
    area: 30,
    city: 'Abidjan',
    district: 'Yopougon',
    address: 'Carrefour Niangon, Yopougon',
    images: ['/images/hero-maison-moderne.jpg'],
    features: ['Étudiant', 'WiFi', 'Loyer abordable'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: 'demo-owner-3',
    status: 'disponible'
  }
];

// Données de démonstration pour les messages
export const demoMessages = [
  {
    id: '1',
    conversation_id: 'conv-1',
    sender_id: 'demo-user-123',
    content: 'Bonjour, je suis intéressé par votre propriété à Cocody. Est-elle toujours disponible ?',
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 heure ago
    read: false
  },
  {
    id: '2',
    conversation_id: 'conv-1',
    sender_id: 'demo-owner-1',
    content: 'Bonjour ! Oui, la villa est toujours disponible. Voulez-vous programmer une visite ?',
    created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    read: true
  },
  {
    id: '3',
    conversation_id: 'conv-2',
    sender_id: 'demo-user-456',
    content: 'Pouvez-vous me donner plus d\'informations sur l\'appartement au Plateau ?',
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 heures ago
    read: true
  }
];

// Données de démonstration pour les contrats
export const demoContracts = [
  {
    id: '1',
    property_id: '1',
    tenant_id: 'demo-user-123',
    owner_id: 'demo-owner-1',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 an
    monthly_rent: 150000,
    currency: 'XOF',
    status: 'actif',
    created_at: new Date().toISOString()
  }
];

// Fonction utilitaire pour simuler des délais de réseau
export const simulateNetworkDelay = (min = 500, max = 1500): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Service mock pour les propriétés
export const demoPropertyService = {
  async getAll() {
    await simulateNetworkDelay();
    return { data: demoProperties, error: null };
  },

  async getById(id: string) {
    await simulateNetworkDelay();
    const property = demoProperties.find(p => p.id === id);
    return { data: property || null, error: property ? null : { message: 'Propriété non trouvée' } };
  },

  async search(filters: any) {
    await simulateNetworkDelay();
    let results = [...demoProperties];
    
    // Appliquer les filtres de base
    if (filters.type) {
      results = results.filter(p => p.type === filters.type);
    }
    if (filters.city) {
      results = results.filter(p => p.city === filters.city);
    }
    if (filters.maxPrice) {
      results = results.filter(p => p.price <= filters.maxPrice);
    }
    
    return { data: results, error: null };
  },

  async getFavorites(userId: string) {
    await simulateNetworkDelay();
    return { data: demoProperties.slice(0, 2), error: null };
  }
};

// Service mock pour les messages
export const demoMessageService = {
  async getConversations(userId: string) {
    await simulateNetworkDelay();
    return { 
      data: [
        {
          id: 'conv-1',
          property_id: '1',
          property_title: 'Magnifique villa moderne à Cocody',
          last_message: demoMessages[1].content,
          last_message_time: demoMessages[1].created_at,
          unread_count: 1
        }
      ], 
      error: null 
    };
  },

  async getMessages(conversationId: string) {
    await simulateNetworkDelay();
    const messages = demoMessages.filter(m => m.conversation_id === conversationId);
    return { data: messages, error: null };
  },

  async sendMessage(conversationId: string, content: string, senderId: string) {
    await simulateNetworkDelay();
    const newMessage = {
      id: String(Date.now()),
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      created_at: new Date().toISOString(),
      read: false
    };
    demoMessages.push(newMessage);
    return { data: newMessage, error: null };
  }
};

// Service mock pour les profils
export const demoProfileService = {
  async getProfile(userId: string) {
    await simulateNetworkDelay();
    return {
      data: {
        id: 'demo-user-123',
        email: 'demo@montoit.ci',
        full_name: 'Utilisateur Démo',
        user_type: 'locataire',
        phone: '+225 XX XX XX XX',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      error: null
    };
  },

  async updateProfile(userId: string, updates: any) {
    await simulateNetworkDelay();
    return { data: { id: userId, ...updates }, error: null };
  }
};

// Service mock global
export const demoService = {
  property: demoPropertyService,
  message: demoMessageService,
  profile: demoProfileService
};

export default demoService;