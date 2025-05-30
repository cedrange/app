import axios from 'axios';
import { CATEGORIES } from '../constants';
import { Announcement, Category, CreateAnnouncementData, Match, User } from '../types';

const API_BASE_URL = 'http://localhost:5000/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock user pour la démo
const MOCK_USER: User = {
  id: '1',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'USER',
};

// Mock data pour développement
const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'iPhone 13 Pro perdu',
    description: 'iPhone 13 Pro noir perdu près de la gare centrale',
    city: 'Bruxelles',
    postalCode: '1000',
    date: '2025-05-29',
    category: CATEGORIES[0],
    type: 'LOST',
    photo: 'https://picsum.photos/200/200?random=1',
    criteriaValues: {
      '1': 'Apple',
      '2': 'Noir',
      '3': 'iPhone 13 Pro'
    },
    userId: '2',
    user: {
      id: '2',
      email: 'other@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'USER'
    },
    createdAt: '2025-05-29T10:00:00Z',
    updatedAt: '2025-05-29T10:00:00Z'
  },
  {
    id: '2',
    title: 'Téléphone trouvé',
    description: 'Smartphone trouvé dans le parc du Cinquantenaire',
    city: 'Bruxelles',
    postalCode: '1000',
    date: '2025-05-30',
    category: CATEGORIES[0],
    type: 'FOUND',
    photo: 'https://picsum.photos/200/200?random=2',
    secretQuestion: 'Quelle est la couleur de votre coque ?',
    criteriaValues: {
      '1': 'Apple',
      '2': 'Noir'
    },
    userId: '3',
    user: {
      id: '3',
      email: 'finder@example.com',
      firstName: 'Bob',
      lastName: 'Wilson',
      role: 'USER'
    },
    createdAt: '2025-05-30T08:00:00Z',
    updatedAt: '2025-05-30T08:00:00Z'
  }
];

export const apiService = {
  // Auth
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
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
    type?: 'LOST' | 'FOUND';
    city?: string;
    categoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Announcement[]> => {
    try {
      const response = await api.get('/announcements', { params: filters });
      return response.data;
    } catch (error) {
      console.log('Using mock announcements for development');
      let filtered = [...MOCK_ANNOUNCEMENTS];
      
      if (filters?.type) {
        filtered = filtered.filter(a => a.type === filters.type);
      }
      if (filters?.city) {
        filtered = filtered.filter(a => 
          a.city.toLowerCase().includes(filters.city!.toLowerCase())
        );
      }
      if (filters?.categoryId) {
        filtered = filtered.filter(a => a.category.id === filters.categoryId);
      }
      
      return Promise.resolve(filtered);
    }
  },

  getAnnouncementById: async (id: string): Promise<Announcement | null> => {
    try {
      const response = await api.get(`/announcements/${id}`);
      return response.data;
    } catch (error) {
      const found = MOCK_ANNOUNCEMENTS.find(a => a.id === id);
      return Promise.resolve(found || null);
    }
  },

  createAnnouncement: async (announcement: CreateAnnouncementData): Promise<Announcement> => {
    try {
      const response = await api.post('/announcements', announcement);
      return response.data;
    } catch (error) {
      console.log('Mock creating announcement');
      const category = CATEGORIES.find(c => c.id === announcement.categoryId);
      const newAnnouncement: Announcement = {
        id: Math.random().toString(36).substr(2, 9),
        ...announcement,
        category: category!,
        userId: MOCK_USER.id,
        user: MOCK_USER,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      MOCK_ANNOUNCEMENTS.push(newAnnouncement);
      return Promise.resolve(newAnnouncement);
    }
  },

  updateAnnouncement: async (id: string, announcement: Partial<CreateAnnouncementData>): Promise<Announcement> => {
    try {
      const response = await api.put(`/announcements/${id}`, announcement);
      return response.data;
    } catch (error) {
      console.log('Mock updating announcement');
      const index = MOCK_ANNOUNCEMENTS.findIndex(a => a.id === id);
      if (index !== -1) {
        MOCK_ANNOUNCEMENTS[index] = {
          ...MOCK_ANNOUNCEMENTS[index],
          ...announcement,
          updatedAt: new Date().toISOString()
        };
        return Promise.resolve(MOCK_ANNOUNCEMENTS[index]);
      }
      throw new Error('Announcement not found');
    }
  },

  deleteAnnouncement: async (id: string): Promise<void> => {
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

  getUserAnnouncements: async (userId: string): Promise<Announcement[]> => {
    try {
      const response = await api.get(`/users/${userId}/announcements`);
      return response.data;
    } catch (error) {
      const userAnnouncements = MOCK_ANNOUNCEMENTS.filter(a => a.userId === userId);
      return Promise.resolve(userAnnouncements);
    }
  },

  // Matches
  getAnnouncementMatches: async (announcementId: string): Promise<Match[]> => {
    try {
      const response = await api.get(`/announcements/${announcementId}/matches`);
      return response.data;
    } catch (error) {
      console.log('Mock matches');
      // Mock matching logic - find opposite type announcements in same category
      const announcement = MOCK_ANNOUNCEMENTS.find(a => a.id === announcementId);
      if (!announcement) return [];
      
      const oppositeType = announcement.type === 'LOST' ? 'FOUND' : 'LOST';
      const matches = MOCK_ANNOUNCEMENTS
        .filter(a => 
          a.id !== announcementId && 
          a.type === oppositeType && 
          a.category.id === announcement.category.id &&
          a.city === announcement.city
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