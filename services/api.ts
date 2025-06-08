import axios from 'axios';
import { CATEGORIES } from '../constants';
import { Announcement, Category, ChatMessage, CreateAnnouncementData, Credentials, Match, User } from '../types';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock user pour la démo
const MOCK_USER: User = {
  id: 1,
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'USER',
};

// Mock user pour la démo
const MOCK_LOGIN: Credentials = {
  id: '1',
  email: 'cedrange@gmail.com',
  password: 'Admin123'
};


const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    titre_annonce: "iPhone 13 Pro perdu",
    description: "iPhone 13 Pro noir perdu près de la gare centrale",
    type: "perdu",
    etat: "valide",
    ville: "Bruxelles",
    codePostal: "1000",
    secretQuestion: "Quel est le fond d'écran ?",
    categorieId: 10,
    localiteId: 5,
    annonceCorrespondantId: null,
    date: "2025-05-29T10:00:00Z",
    criteres: [
      {
        id: 1,
        valueId: 13,
        libelle: "Marque",
        type: "text",
        value: "Apple"
      },
      {
        id: 2,
        valueId: 14,
        libelle: "Couleur",
        type: "text",
        value: "Noir"
      },
      {
        id: 3,
        valueId: 15,
        libelle: "Modèle",
        type: "text",
        value: "iPhone 13 Pro"
      }
    ],
    userId: 2,
    userFirstname: "Jane",
    userLastname: "Smith",
    categorie_libelle: "Téléphones",
    photo: {
      id: 1,
      name: "iphone.jpg",
      data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..." // version raccourcie
    }
  },
  {
    id: 2,
    titre_annonce: "Téléphone trouvé",
    description: "Smartphone trouvé dans le parc du Cinquantenaire",
    type: "retrouvé",
    etat: "valide",
    ville: "Bruxelles",
    codePostal: "1000",
    secretQuestion: "Quelle est la couleur de votre coque ?",
    categorieId: 10,
    localiteId: 5,
    annonceCorrespondantId: null,
    date: "2025-05-30T08:00:00Z",
    criteres: [
      {
        id: 1,
        valueId: 13,
        libelle: "Marque",
        type: "text",
        value: "Apple"
      },
      {
        id: 2,
        valueId: 14,
        libelle: "Couleur",
        type: "text",
        value: "Noir"
      }
    ],
    userId: 3,
    userFirstname: "Bob",
    userLastname: "Wilson",
    categorie_libelle: "Téléphones",
    photo: {
      id: 2,
      name: "smartphone.jpg",
      data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
    }
  }
];

export default MOCK_ANNOUNCEMENTS;



export const apiService = {
  // Auth
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.post('/auth/login', MOCK_LOGIN);
      return response.data.data.user as User;
    } catch (error) {
      // Fallback to mock user for development
      console.log('Using mock user for development');
      return Promise.resolve(MOCK_USER);
    }
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.log('Using mock categories for development');
      return Promise.resolve(CATEGORIES);
    }
  },

  // Announcements
  getAnnouncements: async (filters?: {
  type?: 'perdu' | 'trouvé';
  city?: string;
  categoryId?: number;
  limit?: number;
  offset?: number;
}): Promise<Announcement[]> => {
  try {
    const response = await api.get(`users/1/posts`, { params: filters });

    if (response.status === 204 || !response.data?.data) {
      return [];
    }

    const data = response.data.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data.content)) {
      return data.content;
    }

    return [];
  } catch (error) {
    console.log('Using mock announcements for development');
    let filtered = [...MOCK_ANNOUNCEMENTS];

    if (filters?.type) {
      filtered = filtered.filter(a => a.type === filters.type);
    }
    if (filters?.city) {
      filtered = filtered.filter(a =>
        a.ville.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    if (filters?.categoryId) {
      filtered = filtered.filter(a => a.categorieId === filters.categoryId);
    }

    return Promise.resolve(filtered);
  }
},

  getAnnouncementById: async (id: number): Promise<Announcement | null> => {
    try {
      const response = await api.get(`/posts/${id}`);
      console.log("affiche une annonce"+response.data.data);
      
      return response.data.data;
    } catch (error) {
      const found = MOCK_ANNOUNCEMENTS.find(a => a.id === id);
      return Promise.resolve(found || null);
    }
  },

  createAnnouncement: async (announcement: CreateAnnouncementData): Promise<Announcement> => {
    try {
      //const id= getCurr
      const response = await api.post(`users/${authuser.id}/posts`, announcement);
      return response.data;
    } catch (error: any) {
      console.log('Mock creating announcement');
      const category = CATEGORIES.find(c => c.id === announcement.categoryId);
      /*const newAnnouncement: Announcement = {
        id: Math.random(),
        ...announcement,
        categorieId: category!,
        userId: MOCK_USER.id,        
      };
      MOCK_ANNOUNCEMENTS.push(newAnnouncement);
      return Promise.resolve(newAnnouncement);*/
      return error;
    }
  },

  updateAnnouncement: async (id: number, announcement: Partial<CreateAnnouncementData>): Promise<Announcement> => {
    try {
      const response = await api.put(`/announcements/${id}`, announcement);
      return response.data;
    } catch (error) {
      /*console.log('Mock updating announcement');
      const index = MOCK_ANNOUNCEMENTS.findIndex(a => a.id === id);
      if (index !== -1) {
        MOCK_ANNOUNCEMENTS[index] = {
          ...MOCK_ANNOUNCEMENTS[index],
          ...announcement,
          updatedAt: new Date().toISOString()
        };
        return Promise.resolve(MOCK_ANNOUNCEMENTS[index]);
      }*/
      throw new Error('Announcement not found');
    }
  },

  deleteAnnouncement: async (id: number): Promise<void> => {
    try {
      await api.delete(`/announcements/${id}`);
    } catch (error) {
      console.log('Mock deleting announcement');
      const index = MOCK_ANNOUNCEMENTS.findIndex(a => a.id === id);
      if (index !== -1) {
        MOCK_ANNOUNCEMENTS.splice(index, 1);
      }
    }
  },

  getUserAnnouncements: async (userId: number): Promise<Announcement[]> => {
    try {
      const response = await api.get(`/users/${userId}/announcements`);
      return response.data;
    } catch (error) {
      const userAnnouncements = MOCK_ANNOUNCEMENTS.filter(a => a.userId === userId);
      return Promise.resolve(userAnnouncements);
    }
  },

  // Matches
  getAnnouncementMatches: async (announcementId: number): Promise<Match[]> => {
    try {
      const response = await api.get(`/announcements/${announcementId}/matches`);
      return response.data;
    } catch (error) {
      console.log('Mock matches');
      // Mock matching logic - find opposite type announcements in same category
      const announcement = MOCK_ANNOUNCEMENTS.find(a => a.id === announcementId);
      if (!announcement) return [];
      
      const oppositeType = announcement.type === 'perdu' ? 'trouvé' : 'perdu';
      const matches = MOCK_ANNOUNCEMENTS
        .filter(a => 
          a.id !== announcementId && 
          a.type === oppositeType && 
          a.categorieId === announcement.categorieId &&
          a.ville === announcement.ville
        )
        .map(a => ({
          id: `match-${announcementId}-${a.id}`,
          announcement1: announcement,
          announcement2: a,
          score: Math.floor(Math.random() * 40) + 60 // Random score between 60-100
        }));
      
      return Promise.resolve(matches);
    }
  },

  // Chat
  getChatMessages: async (matchId: string): Promise<ChatMessage[]> => {
    try {
      const response = await api.get(`/matches/${matchId}/messages`);
      return response.data;
    } catch (error) {
      // Mock messages
      return Promise.resolve([
        {
          _id: 1,
          text: 'Bonjour, j\'ai vu votre annonce !',
          createdAt: new Date(Date.now() - 3600000),
          user: {
            _id: 2,
            name: 'Jane Smith',
          }
        },
        {
          _id: 2,
          text: 'Salut ! Oui, avez-vous des détails supplémentaires ?',
          createdAt: new Date(Date.now() - 1800000),
          user: {
            _id: 1,
            name: 'John Doe',
          }
        }
      ]);
    }
  },

  sendChatMessage: async (matchId: string, message: string): Promise<ChatMessage> => {
    try {
      const response = await api.post(`/matches/${matchId}/messages`, { message });
      return response.data;
    } catch (error) {
      // Mock sending message
      const newMessage: ChatMessage = {
        _id: Date.now(),
        text: message,
        createdAt: new Date(),
        user: {
          _id: MOCK_USER.id,
          name: `${MOCK_USER.firstName} ${MOCK_USER.lastName}`,
        }
      };
      return Promise.resolve(newMessage);
    }
  }
};