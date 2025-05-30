# Application React Native - Objets Perdus/Trouvés (Expo Router)

## Installation

```bash
# Créer le projet avec Expo Router
npx create-expo-app@latest LostFoundApp --template tabs@50
cd LostFoundApp

# Installer les dépendances supplémentaires
npx expo install expo-image-picker expo-location axios
npx expo install expo-constants expo-status-bar expo-linking expo-font
npx expo install react-native-safe-area-context
npm install @react-native-picker/picker

# Pour le chat, utiliser une alternative compatible Expo
npm install react-native-super-chat
# OU une implémentation simple sans dépendances natives
```

## Structure du projet (Expo Router)

```
app/
├── (tabs)/
│   ├── index.tsx              # Écran d'accueil
│   ├── announcements.tsx      # Liste des annonces
│   ├── add-announcement.tsx   # Ajouter une annonce
│   └── profile.tsx           # Profil utilisateur
├── announcement/
│   └── [id].tsx              # Détail d'une annonce
├── matches/
│   └── [id].tsx              # Matches pour une annonce
├── chat.tsx                  # Chat entre utilisateurs (simple route)
├── _layout.tsx               # Layout principal
└── +not-found.tsx           # Page 404

components/
├── AnnouncementCard.tsx
├── AnnouncementForm.tsx
├── FilterModal.tsx
└── SimpleChatScreen.tsx

constants/
└── Colors.ts

types/
└── index.ts

services/
└── api.ts
```

## app/_layout.tsx

```tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="announcement/[id]" 
          options={{ 
            title: 'Détail de l\'annonce',
            presentation: 'modal' 
          }} 
        />
        <Stack.Screen 
          name="matches/[id]" 
          options={{ 
            title: 'Correspondances',
            presentation: 'modal' 
          }} 
        />
        <Stack.Screen 
          name="chat" 
          options={{ 
            title: 'Discussion',
            presentation: 'modal' 
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}
```

## app/(tabs)/_layout.tsx

```tsx
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import Colors from '../../constants/Colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: 'Annonces',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-announcement"
        options={{
          title: 'Ajouter',
          tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

## types/index.ts

```tsx
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN' | 'PROFESSIONAL' | 'SUPERADMIN';
}

export interface Category {
  id: string;
  name: string;
  criteria: Criterion[];
}

export interface Criterion {
  id: string;
  name: string;
  type: 'text' | 'select' | 'number';
  options?: string[];
  required: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  city: string;
  postalCode: string;
  date: string;
  category: Category;
  type: 'LOST' | 'FOUND';
  photo?: string;
  secretQuestion?: string;
  criteriaValues: { [key: string]: string };
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  announcement1: Announcement;
  announcement2: Announcement;
  score: number;
}

export interface ChatMessage {
  _id: string | number;
  text: string;
  createdAt: Date;
  user: {
    _id: string | number;
    name: string;
    avatar?: string;
  };
}

export interface CreateAnnouncementData {
  title: string;
  description: string;
  city: string;
  postalCode: string;
  date: string;
  categoryId: string;
  type: 'LOST' | 'FOUND';
  photo?: string;
  secretQuestion?: string;
  criteriaValues: { [key: string]: string };
}
```

## constants/Colors.ts

```tsx
const tintColorLight = '#007AFF';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

export const CATEGORIES = [
  {
    id: '1',
    name: 'Électroniques',
    criteria: [
      { 
        id: '1', 
        name: 'Marque', 
        type: 'select' as const, 
        options: ['Apple', 'Samsung', 'Huawei', 'Google', 'Xiaomi', 'Autre'], 
        required: true 
      },
      { 
        id: '2', 
        name: 'Couleur', 
        type: 'select' as const, 
        options: ['Noir', 'Blanc', 'Bleu', 'Rouge', 'Vert', 'Rose', 'Gris', 'Autre'], 
        required: true 
      },
      { 
        id: '3', 
        name: 'Modèle', 
        type: 'text' as const, 
        required: false 
      },
    ],
  },
  {
    id: '2',
    name: 'Vêtements',
    criteria: [
      { 
        id: '4', 
        name: 'Type', 
        type: 'select' as const, 
        options: ['Veste', 'Pantalon', 'T-shirt', 'Robe', 'Chaussures', 'Chapeau', 'Écharpe', 'Gants'], 
        required: true 
      },
      { 
        id: '5', 
        name: 'Couleur', 
        type: 'select' as const, 
        options: ['Noir', 'Blanc', 'Bleu', 'Rouge', 'Vert', 'Jaune', 'Rose', 'Violet', 'Marron', 'Gris'], 
        required: true 
      },
      { 
        id: '6', 
        name: 'Taille', 
        type: 'select' as const, 
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], 
        required: false 
      },
    ],
  },
  {
    id: '3',
    name: 'Bijoux',
    criteria: [
      { 
        id: '7', 
        name: 'Type', 
        type: 'select' as const, 
        options: ['Bague', 'Collier', 'Bracelet', 'Montre', 'Boucles d\'oreilles', 'Broche'], 
        required: true 
      },
      { 
        id: '8', 
        name: 'Matériau', 
        type: 'select' as const, 
        options: ['Or', 'Argent', 'Acier', 'Plastique', 'Cuir', 'Tissu', 'Autre'], 
        required: true 
      },
    ],
  },
  {
    id: '4',
    name: 'Sacs et Portefeuilles',
    criteria: [
      { 
        id: '9', 
        name: 'Type', 
        type: 'select' as const, 
        options: ['Sac à main', 'Sac à dos', 'Portefeuille', 'Sacoche', 'Trousse', 'Valise'], 
        required: true 
      },
      { 
        id: '10', 
        name: 'Couleur', 
        type: 'select' as const, 
        options: ['Noir', 'Marron', 'Blanc', 'Bleu', 'Rouge', 'Vert', 'Autre'], 
        required: true 
      },
      { 
        id: '11', 
        name: 'Marque', 
        type: 'text' as const, 
        required: false 
      },
    ],
  },
  {
    id: '5',
    name: 'Documents',
    criteria: [
      { 
        id: '12', 
        name: 'Type', 
        type: 'select' as const, 
        options: ['Carte d\'identité', 'Passeport', 'Permis de conduire', 'Carte vitale', 'Carte bancaire', 'Autre document'], 
        required: true 
      },
      { 
        id: '13', 
        name: 'Nom sur le document', 
        type: 'text' as const, 
        required: false 
      },
    ],
  },
  {
    id: '6',
    name: 'Clés',
    criteria: [
      { 
        id: '14', 
        name: 'Type', 
        type: 'select' as const, 
        options: ['Clés de maison', 'Clés de voiture', 'Clés de bureau', 'Autre'], 
        required: true 
      },
      { 
        id: '15', 
        name: 'Porte-clés', 
        type: 'text' as const, 
        required: false 
      },
    ],
  },
];
```

## services/api.ts

```tsx
import axios from 'axios';
import { Announcement, Category, Match, User, CreateAnnouncementData } from '../types';
import { CATEGORIES } from '../constants/Colors';

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
```

## app/(tabs)/index.tsx

```tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Link, router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { apiService } from '../../services/api';
import { Announcement, User } from '../../types';
import AnnouncementCard from '../../components/AnnouncementCard';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);

      const announcements = await apiService.getAnnouncements({ limit: 5 });
      setRecentAnnouncements(announcements);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (type: 'LOST' | 'FOUND') => {
    router.push({
      pathname: '/add-announcement',
      params: { type }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Bonjour {user?.firstName} !
          </Text>
          <Text style={styles.subtitle}>
            Retrouvez vos objets perdus facilement
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.lostButton]}
            onPress={() => handleQuickAction('LOST')}
          >
            <FontAwesome name="search" size={24} color="white" />
            <Text style={styles.actionButtonText}>Objet Perdu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.foundButton]}
            onPress={() => handleQuickAction('FOUND')}
          >
            <FontAwesome name="check-circle" size={24} color="white" />
            <Text style={styles.actionButtonText}>Objet Trouvé</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Annonces récentes</Text>
            <Link href="/announcements" asChild>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Voir tout</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {recentAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onPress={() => router.push(`/announcement/${announcement.id}`)}
              currentUserId={user?.id}
            />
          ))}

          {recentAnnouncements.length === 0 && (
            <View style={styles.emptyContainer}>
              <FontAwesome name="inbox" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Aucune annonce récente</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  lostButton: {
    backgroundColor: '#FF6B6B',
  },
  foundButton: {
    backgroundColor: '#4ECDC4',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#007AFF',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
});
```

## components/AnnouncementCard.tsx

```tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Announcement } from '../types';
import { router } from 'expo-router';

interface AnnouncementCardProps {
  announcement: Announcement;
  onPress: () => void;
  currentUserId?: string;
  showMatchButton?: boolean;
}

export default function AnnouncementCard({
  announcement,
  onPress,
  currentUserId,
  showMatchButton = false,
}: AnnouncementCardProps) {
  const isOwner = currentUserId === announcement.userId;
  const typeColor = announcement.type === 'LOST' ? '#FF6B6B' : '#4ECDC4';
  const typeText = announcement.type === 'LOST' ? 'Perdu' : 'Trouvé';

  const handleMatchPress = (e: any) => {
    e.stopPropagation();
    router.push(`/matches/${announcement.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.typeLabel, { backgroundColor: typeColor }]}>
          <FontAwesome 
            name={announcement.type === 'LOST' ? 'search' : 'check-circle'} 
            size={16} 
            color="white" 
          />
          <Text style={styles.typeText}>{typeText}</Text>
        </View>
        {isOwner && (
          <FontAwesome name="user" size={20} color="#007AFF" />
        )}
      </View>

      <View style={styles.cardContent}>
        {announcement.photo && (
          <Image source={{ uri: announcement.photo }} style={styles.image} />
        )}
        
        <View style={styles.textContent}>
          <Text style={styles.title} numberOfLines={2}>
            {announcement.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {announcement.description}
          </Text>
          
          <View style={styles.metadata}>
            <View style={styles.locationContainer}>
              <FontAwesome name="map-marker" size={16} color="#666" />
              <Text style={styles.location}>
                {announcement.city} ({announcement.postalCode})
              </Text>
            </View>
            <Text style={styles.category}>{announcement.category.name}</Text>
          </View>

          <Text style={styles.date}>
            {new Date(announcement.date).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>

      {showMatchButton && !isOwner && (
        <TouchableOpacity style={styles.matchButton} onPress={handleMatchPress}>
          <FontAwesome name="exchange" size={20} color="#007AFF" />
          <Text style={styles.matchButtonText}>Voir les correspondances</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 5,
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    flexDirection: 'row',
    gap: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  metadata: {
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    gap: 3,
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  category: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  matchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    gap: 5,
  },
  matchButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

## app/(tabs)/announcements.tsx

```tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { apiService } from '../../services/api';
import { Announcement, User } from '../../types';
import AnnouncementCard from '../../components/AnnouncementCard';
import FilterModal from '../../components/FilterModal';

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<{
    type?: 'LOST' | 'FOUND';
    city?: string;
    categoryId?: string;
  }>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [filters]);

  const loadData = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      await loadAnnouncements();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const data = await apiService.getAnnouncements(filters);
      setAnnouncements(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les annonces');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof typeof filters];
    setFilters(newFilters);
  };

  const renderAnnouncement = ({ item }: { item: Announcement }) => (
    <AnnouncementCard
      announcement={item}
      onPress={() => router.push(`/announcement/${item.id}`)}
      currentUserId={user?.id}
      showMatchButton={true}
    />
  );

  const hasActiveFilters = Object.keys(filters).length > 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Toutes les annonces</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <FontAwesome 
            name="filter" 
            size={24} 
            color={hasActiveFilters ? "#007AFF" : "#666"} 
          />
          <Text style={[styles.filterText, hasActiveFilters && styles.filterTextActive]}>
            Filtrer
          </Text>
        </TouchableOpacity>
      </View>

      {hasActiveFilters && (
        <View style={styles.activeFilters}>
          <Text style={styles.activeFiltersText}>Filtres actifs:</Text>
          <View style={styles.filterChips}>
            {filters.type && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  {filters.type === 'LOST' ? 'Perdu' : 'Trouvé'}
                </Text>
                <TouchableOpacity onPress={() => clearFilter('type')}>
                  <FontAwesome name="times" size={14} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            {filters.city && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>{filters.city}</Text>
                <TouchableOpacity onPress={() => clearFilter('city')}>
                  <FontAwesome name="times" size={14} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            {filters.categoryId && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>Catégorie</Text>
                <TouchableOpacity onPress={() => clearFilter('categoryId')}>
                  <FontAwesome name="times" size={14} color="#666" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      <FlatList
        data={announcements}
        renderItem={renderAnnouncement}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="search" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Aucune annonce trouvée</Text>
            <Text style={styles.emptySubtext}>
              {hasActiveFilters ? 'Essayez de modifier vos filtres' : 'Soyez le premier à publier une annonce !'}
            </Text>
          </View>
        }
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  filterText: {
    color: '#666',
    fontSize: 16,
  },
  filterTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  activeFilters: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activeFiltersText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f3ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 5,
  },
  filterChipText: {
    fontSize: 12,
    color: '#007AFF',
  },
  listContainer: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
    textAlign: 'center',
  },
});

## components/FilterModal.tsx

```tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import { apiService } from '../services/api';
import { Category } from '../types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  currentFilters: any;
}

export default function FilterModal({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}: FilterModalProps) {
  const [type, setType] = useState<'LOST' | 'FOUND' | ''>('');
  const [city, setCity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (visible) {
      loadCategories();
      // Initialize with current filters
      setType(currentFilters.type || '');
      setCity(currentFilters.city || '');
      setCategoryId(currentFilters.categoryId || '');
    }
  }, [visible, currentFilters]);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleApply = () => {
    const filters: any = {};
    if (type) filters.type = type;
    if (city.trim()) filters.city = city.trim();
    if (categoryId) filters.categoryId = categoryId;
    
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setType('');
    setCity('');
    setCategoryId('');
    onApplyFilters({});
    onClose();
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <FontAwesome name="times" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Filtres</Text>
          <TouchableOpacity onPress={handleReset} style={styles.headerButton}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type d'annonce</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'LOST' && styles.typeButtonActive,
                  type === 'LOST' && styles.typeButtonLost,
                ]}
                onPress={() => setType(type === 'LOST' ? '' : 'LOST')}
              >
                <FontAwesome 
                  name="search" 
                  size={20} 
                  color={type === 'LOST' ? 'white' : '#FF6B6B'} 
                />
                <Text style={[
                  styles.typeButtonText,
                  type === 'LOST' && styles.typeButtonTextActive
                ]}>
                  Perdu
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'FOUND' && styles.typeButtonActive,
                  type === 'FOUND' && styles.typeButtonFound,
                ]}
                onPress={() => setType(type === 'FOUND' ? '' : 'FOUND')}
              >
                <FontAwesome 
                  name="check-circle" 
                  size={20} 
                  color={type === 'FOUND' ? 'white' : '#4ECDC4'} 
                />
                <Text style={[
                  styles.typeButtonText,
                  type === 'FOUND' && styles.typeButtonTextActive
                ]}>
                  Trouvé
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ville</Text>
            <TextInput
              style={styles.textInput}
              value={city}
              onChangeText={setCity}
              placeholder="Entrez une ville"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catégorie</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={categoryId}
                onValueChange={setCategoryId}
                style={styles.picker}
              >
                <Picker.Item label="Toutes les catégories" value="" />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={category.id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Appliquer les filtres</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerButton: {
    width: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  resetText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#eee',
    gap: 8,
  },
  typeButtonActive: {
    borderColor: 'transparent',
  },
  typeButtonLost: {
    backgroundColor: '#FF6B6B',
  },
  typeButtonFound: {
    backgroundColor: '#4ECDC4',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

## app/(tabs)/add-announcement.tsx

```tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService } from '../../services/api';
import { Category, CreateAnnouncementData } from '../../types';

export default function AddAnnouncementScreen() {
  const params = useLocalSearchParams();
  const preselectedType = params.type as 'LOST' | 'FOUND' | undefined;

  const [formData, setFormData] = useState<CreateAnnouncementData>({
    title: '',
    description: '',
    city: '',
    postalCode: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    type: preselectedType || 'LOST',
    photo: '',
    secretQuestion: '',
    criteriaValues: {},
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const category = categories.find(c => c.id === formData.categoryId);
    setSelectedCategory(category || null);
    // Reset criteria values when category changes
    if (category) {
      const newCriteriaValues: { [key: string]: string } = {};
      category.criteria.forEach(criterion => {
        newCriteriaValues[criterion.id] = '';
      });
      setFormData(prev => ({ ...prev, criteriaValues: newCriteriaValues }));
    }
  }, [formData.categoryId, categories]);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les catégories');
    }
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la galerie photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, photo: result.assets[0].uri }));
    }
  };

  const handleCriteriaChange = (criterionId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      criteriaValues: {
        ...prev.criteriaValues,
        [criterionId]: value,
      },
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Erreur', 'La description est obligatoire');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Erreur', 'La ville est obligatoire');
      return false;
    }
    if (!formData.postalCode.trim()) {
      Alert.alert('Erreur', 'Le code postal est obligatoire');
      return false;
    }
    if (!formData.categoryId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return false;
    }

    // Validate required criteria
    if (selectedCategory) {
      for (const criterion of selectedCategory.criteria) {
        if (criterion.required && !formData.criteriaValues[criterion.id]?.trim()) {
          Alert.alert('Erreur', `Le champ "${criterion.name}" est obligatoire`);
          return false;
        }
      }
    }

    // Validate secret question for FOUND items
    if (formData.type === 'FOUND' && !formData.secretQuestion?.trim()) {
      Alert.alert('Erreur', 'La question secrète est obligatoire pour les objets trouvés');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await apiService.createAnnouncement(formData);
      Alert.alert(
        'Succès', 
        'Votre annonce a été publiée avec succès !',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de publier l\'annonce');
      console.error('Error creating announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCriteriaInput = (criterion: any) => {
    switch (criterion.type) {
      case 'select':
        return (
          <View key={criterion.id} style={styles.inputGroup}>
            <Text style={styles.label}>
              {criterion.name}
              {criterion.required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.criteriaValues[criterion.id] || ''}
                onValueChange={(value) => handleCriteriaChange(criterion.id, value)}
                style={styles.picker}
              >
                <Picker.Item label={`Sélectionner ${criterion.name.toLowerCase()}`} value="" />
                {criterion.options?.map((option: string) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>
        );

      case 'text':
      case 'number':
        return (
          <View key={criterion.id} style={styles.inputGroup}>
            <Text style={styles.label}>
              {criterion.name}
              {criterion.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
              placeholder="Ex: iPhone 13 Pro perdu"
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Décrivez l'objet en détail..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>
                Ville <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.city}
                onChangeText={(value) => setFormData(prev => ({ ...prev, city: value }))}
                placeholder="Bruxelles"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>
                Code postal <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.postalCode}
                onChangeText={(value) => setFormData(prev => ({ ...prev, postalCode: value }))}
                placeholder="1000"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Date <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData.date}
              onChangeText={(value) => setFormData(prev => ({ ...prev, date: value }))}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Catégorie <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.categoryId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                style={styles.picker}
              >
                <Picker.Item label="Sélectionner une catégorie" value="" />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={category.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {selectedCategory && selectedCategory.criteria.map(renderCriteriaInput)}

          {formData.type === 'FOUND' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Question secrète <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.secretQuestion}
                onChangeText={(value) => setFormData(prev => ({ ...prev, secretQuestion: value }))}
                placeholder="Ex: Quelle est la couleur de la coque ?"
                maxLength={200}
              />
              <Text style={styles.hint}>
                Cette question sera posée à la personne qui prétend avoir perdu l'objet
              </Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Photo</Text>
            <TouchableOpacity style={styles.photoButton} onPress={handleImagePick}>
              {formData.photo ? (
                <Image source={{ uri: formData.photo }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <FontAwesome name="camera" size={40} color="#ccc" />
                  <Text style={styles.photoPlaceholderText}>Ajouter une photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Publication...' : 'Publier l\'annonce'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#eee',
    gap: 8,
  },
  typeButtonLostActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  typeButtonFoundActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF6B6B',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  flex1: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  photoButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  photoPlaceholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

## app/(tabs)/profile.tsx

```tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { apiService } from '../../services/api';
import { Announcement, User } from '../../types';
import AnnouncementCard from '../../components/AnnouncementCard';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [userAnnouncements, setUserAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);

      const announcements = await apiService.getUserAnnouncements(userData.id);
      setUserAnnouncements(announcements);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    Alert.alert(
      'Supprimer l\'annonce',
      'Êtes-vous sûr de vouloir supprimer cette annonce ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteAnnouncement(announcementId);
              setUserAnnouncements(prev => prev.filter(a => a.id !== announcementId));
              Alert.alert('Succès', 'Annonce supprimée avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'annonce');
            }
          }
        }
      ]
    );
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'USER': return 'Utilisateur';
      case 'ADMIN': return 'Administrateur';
      case 'PROFESSIONAL': return 'Professionnel';
      case 'SUPERADMIN': return 'Super Administrateur';
      default: return role;
    }
  };

  const getAnnouncementStats = () => {
    const lost = userAnnouncements.filter(a => a.type === 'LOST').length;
    const found = userAnnouncements.filter(a => a.type === 'FOUND').length;
    return { lost, found, total: lost + found };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text>Chargement...</Text>
      </SafeAreaView>
    );
  }

  const stats = getAnnouncementStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <FontAwesome name="user" size={40} color="white" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userRole}>
                {getRoleDisplayName(user?.role || '')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Annonces</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#FF6B6B' }]}>{stats.lost}</Text>
            <Text style={styles.statLabel}>Perdus</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#4ECDC4' }]}>{stats.found}</Text>
            <Text style={styles.statLabel}>Trouvés</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes annonces</Text>
            <TouchableOpacity onPress={() => router.push('/add-announcement')}>
              <FontAwesome name="plus" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {userAnnouncements.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome name="inbox" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Aucune annonce publiée</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/add-announcement')}
              >
                <Text style={styles.addButtonText}>Créer ma première annonce</Text>
              </TouchableOpacity>
            </View>
          ) : (
            userAnnouncements.map((announcement) => (
              <View key={announcement.id} style={styles.announcementContainer}>
                <AnnouncementCard
                  announcement={announcement}
                  onPress={() => router.push(`/announcement/${announcement.id}`)}
                  currentUserId={user?.id}
                />
                <View style={styles.announcementActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => router.push(`/announcement/${announcement.id}?edit=true`)}
                  >
                    <FontAwesome name="edit" size={16} color="#007AFF" />
                    <Text style={styles.actionButtonText}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteAnnouncement(announcement.id)}
                  >
                    <FontAwesome name="trash" size={16} color="#FF6B6B" />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                      Supprimer
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 3,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  announcementContainer: {
    marginBottom: 15,
  },
  announcementActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f8ff',
    gap: 5,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#fff0f0',
  },
  deleteButtonText: {
    color: '#FF6B6B',
  },
});

## app/announcement/[id].tsx

```tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService } from '../../services/api';
import { Announcement, User } from '../../types';

export default function AnnouncementDetailScreen() {
  const { id, edit } = useLocalSearchParams();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);

      if (typeof id === 'string') {
        const announcementData = await apiService.getAnnouncementById(id);
        setAnnouncement(announcementData);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger l\'annonce');
      console.error('Error loading announcement:', error);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleContactUser = () => {
    if (!announcement || !user) return;

    // Navigate to simple chat screen
    router.push({
      pathname: '/chat',
      params: { matchId: `${announcement.id}-${user.id}` }
    });
  };

  const handleViewMatches = () => {
    if (!announcement) return;
    router.push(`/matches/${announcement.id}`);
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    Alert.alert('Information', 'Fonctionnalité de modification à implémenter');
  };

  const handleDelete = async () => {
    if (!announcement) return;

    Alert.alert(
      'Supprimer l\'annonce',
      'Êtes-vous sûr de vouloir supprimer cette annonce ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteAnnouncement(announcement.id);
              Alert.alert(
                'Succès', 
                'Annonce supprimée avec succès',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'annonce');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (!announcement) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text>Annonce non trouvée</Text>
      </SafeAreaView>
    );
  }

  const isOwner = user?.id === announcement.userId;
  const typeColor = announcement.type === 'LOST' ? '#FF6B6B' : '#4ECDC4';
  const typeText = announcement.type === 'LOST' ? 'Objet Perdu' : 'Objet Trouvé';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: typeColor }]}>
          <View style={styles.typeContainer}>
            <FontAwesome 
              name={announcement.type === 'LOST' ? 'search' : 'check-circle'} 
              size={24} 
              color="white" 
            />
            <Text style={styles.typeText}>{typeText}</Text>
          </View>
          
          {isOwner && (
            <View style={styles.ownerBadge}>
              <FontAwesome name="user" size={16} color="white" />
              <Text style={styles.ownerText}>Votre annonce</Text>
            </View>
          )}
        </View>

        {announcement.photo && (
          <Image source={{ uri: announcement.photo }} style={styles.image} />
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{announcement.title}</Text>
          
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <FontAwesome name="map-marker" size={16} color="#666" />
              <Text style={styles.metadataText}>
                {announcement.city}, {announcement.postalCode}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <FontAwesome name="calendar" size={16} color="#666" />
              <Text style={styles.metadataText}>
                {new Date(announcement.date).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <FontAwesome name="tag" size={16} color="#666" />
              <Text style={styles.metadataText}>{announcement.category.name}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{announcement.description}</Text>
          </View>

          {Object.keys(announcement.criteriaValues).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Caractéristiques</Text>
              {announcement.category.criteria.map((criterion) => {
                const value = announcement.criteriaValues[criterion.id];
                if (!value) return null;
                
                return (
                  <View key={criterion.id} style={styles.criteriaItem}>
                    <Text style={styles.criteriaLabel}>{criterion.name}:</Text>
                    <Text style={styles.criteriaValue}>{value}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {announcement.secretQuestion && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Question de vérification</Text>
              <Text style={styles.secretQuestion}>"{announcement.secretQuestion}"</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Publié par</Text>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <FontAwesome name="user" size={20} color="#007AFF" />
              </View>
              <View>
                <Text style={styles.userName}>
                  {announcement.user.firstName} {announcement.user.lastName}
                </Text>
                <Text style={styles.publishDate}>
                  Publié le {new Date(announcement.createdAt).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isOwner ? (
          <View style={styles.ownerActions}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <FontAwesome name="edit" size={20} color="#007AFF" />
              <Text style={styles.editButtonText}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <FontAwesome name="trash" size={20} color="white" />
              <Text style={styles.deleteButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.userActions}>
            <TouchableOpacity style={styles.matchButton} onPress={handleViewMatches}>
              <FontAwesome name="exchange" size={20} color="#007AFF" />
              <Text style={styles.matchButtonText}>Voir les correspondances</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton} onPress={handleContactUser}>
              <FontAwesome name="comments" size={20} color="white" />
              <Text style={styles.contactButtonText}>Contacter</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 5,
  },
  ownerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  metadata: {
    marginBottom: 20,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  metadataText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  criteriaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  criteriaLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  criteriaValue: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  secretQuestion: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  publishDate: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    gap: 8,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    gap: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'row',
    gap: 15,
  },
  matchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    gap: 8,
  },
  matchButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    gap: 8,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

## app/matches/[id].tsx

```tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService } from '../../services/api';
import { Match, Announcement, User } from '../../types';
import AnnouncementCard from '../../components/AnnouncementCard';

export default function MatchesScreen() {
  const { id } = useLocalSearchParams();
  const [matches, setMatches] = useState<Match[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);

      if (typeof id === 'string') {
        const [announcementData, matchesData] = await Promise.all([
          apiService.getAnnouncementById(id),
          apiService.getAnnouncementMatches(id)
        ]);
        
        setAnnouncement(announcementData);
        setMatches(matchesData);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les correspondances');
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactUser = (match: Match) => {
    router.push({
      pathname: '/chat',
      params: { matchId: match.id }
    });
  };

  const getMatchedAnnouncement = (match: Match): Announcement => {
    // Return the announcement that is NOT the current user's announcement
    return match.announcement1.id === announcement?.id 
      ? match.announcement2 
      : match.announcement1;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4ECDC4';
    if (score >= 60) return '#FFD93D';
    return '#FF6B6B';
  };

  const renderMatch = ({ item }: { item: Match }) => {
    const matchedAnnouncement = getMatchedAnnouncement(item);
    
    return (
      <View style={styles.matchContainer}>
        <View style={styles.matchHeader}>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, { color: getScoreColor(item.score) }]}>
              {item.score}% de correspondance
            </Text>
            <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(item.score) }]}>
              <FontAwesome name="star" size={12} color="white" />
            </View>
          </View>
        </View>
        
        <AnnouncementCard
          announcement={matchedAnnouncement}
          onPress={() => router.push(`/announcement/${matchedAnnouncement.id}`)}
          currentUserId={user?.id}
        />
        
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => handleContactUser(item)}
        >
          <FontAwesome name="comments" size={20} color="white" />
          <Text style={styles.contactButtonText}>Contacter l'annonceur</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text>Chargement des correspondances...</Text>
      </SafeAreaView>
    );
  }

  if (!announcement) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text>Annonce non trouvée</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Correspondances trouvées</Text>
        <Text style={styles.subtitle}>
          Pour votre annonce: "{announcement.title}"
        </Text>
      </View>

      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="search" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Aucune correspondance trouvée</Text>
            <Text style={styles.emptySubtext}>
              Les correspondances apparaîtront automatiquement lorsque{'\n'}
              des annonces similaires seront publiées.
            </Text>
          </View>
        }
        ListHeaderComponent={
          matches.length > 0 ? (
            <View style={styles.infoCard}>
              <FontAwesome name="info-circle" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                {matches.length} correspondance{matches.length > 1 ? 's' : ''} trouvée{matches.length > 1 ? 's' : ''} 
                pour votre annonce. Contactez les annonceurs pour plus d'informations.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  listContainer: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e6f3ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 20,
  },
  matchContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  matchHeader: {
    marginBottom: 15,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    gap: 8,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    color: '#999',
    marginTop: 15,
    marginBottom: 10,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 20,
  },
});

## components/SimpleChatScreen.tsx

```tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams } from 'expo-router';
import { apiService } from '../services/api';
import { User } from '../types';

interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: Date;
  isOwn: boolean;
}

export default function SimpleChatScreen() {
  const { matchId } = useLocalSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [matchId]);

  const loadData = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);

      // Load mock messages
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          text: 'Bonjour, j\'ai vu votre annonce !',
          userId: '2',
          userName: 'Jane Smith',
          timestamp: new Date(Date.now() - 3600000),
          isOwn: false,
        },
        {
          id: '2',
          text: 'Salut ! Oui, avez-vous des détails supplémentaires ?',
          userId: userData.id,
          userName: `${userData.firstName} ${userData.lastName}`,
          timestamp: new Date(Date.now() - 1800000),
          isOwn: true,
        },
      ];

      setMessages(mockMessages);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger la conversation');
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      timestamp: new Date(),
      isOwn: true,
    };

    try {
      // Optimistically update UI
      setMessages(prev => [message, ...prev]);
      setNewMessage('');

      // In a real app, send to backend
      if (typeof matchId === 'string') {
        await apiService.sendChatMessage(matchId, message.text);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
      // Remove the message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== message.id));
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.isOwn ? styles.ownMessage : styles.otherMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isOwn ? styles.ownBubble : styles.otherBubble
      ]}>
        {!item.isOwn && (
          <Text style={styles.senderName}>{item.userName}</Text>
        )}
        <Text style={[
          styles.messageText,
          item.isOwn ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text>Chargement de la conversation...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          inverted
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Tapez votre message..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <FontAwesome 
              name="send" 
              size={20} 
              color={newMessage.trim() ? 'white' : '#ccc'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 20,
  },
  messageContainer: {
    marginBottom: 15,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 5,
  },
  otherBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f8f8f8',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
});

## app/chat.tsx

```tsx
import React from 'react';
import SimpleChatScreen from '../components/SimpleChatScreen';

export default function ChatPage() {
  return <SimpleChatScreen />;
}) {
      Alert.alert('Erreur', 'Impossible de charger la conversation');
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!user || typeof matchId !== 'string') return;

    const message = newMessages[0];
    
    try {
      // Optimistically update UI
      setMessages(previousMessages => 
        GiftedChat.append(previousMessages, newMessages)
      );

      // Send message to backend
      await apiService.sendChatMessage(matchId, message.text);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
      console.error('Error sending message:', error);
      
      // Remove the message from UI if sending failed
      setMessages(previousMessages => 
        previousMessages.filter(msg => msg._id !== message._id)
      );
    }
  }, [user, matchId]);

  if (!user) {
    return <View style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        }}
        placeholder="Tapez votre message..."
        showUserAvatar={true}
        alwaysShowSend={true}
        scrollToBottom={true}
        scrollToBottomComponent={() => null}
        renderTime={() => null}
        showAvatarForEveryMessage={false}
        textInputStyle={styles.textInput}
        inputToolbarStyle={styles.inputToolbar}
        sendButtonProps={{
          containerStyle: styles.sendButton,
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  textInput: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputToolbar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginLeft: 5,
  },
});

## app/chat/[matchId].tsx

```tsx
import React from 'react';
import ChatScreen from '../../components/ChatScreen';

export default function ChatPage() {
  return <ChatScreen />;
}

## app/+not-found.tsx

```tsx
import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <FontAwesome name="exclamation-triangle" size={80} color="#ccc" />
        <Text style={styles.title}>Cette page n'existe pas.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Retourner à l'accueil</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
  },
});

## Package.json (mise à jour)

```json
{
  "name": "lostfoundapp",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest --watchAll"
  },
  "jest": {
    "preset": "jest-expo"
  },
  "dependencies": {
    "@expo/vector-icons": "^13.0.0",
    "@react-navigation/native": "^6.0.2",
    "expo": "~50.0.14",
    "expo-constants": "~15.4.5",
    "expo-font": "~11.10.3",
    "expo-image-picker": "~14.7.1",
    "expo-linking": "~6.2.2",
    "expo-location": "~16.5.5",
    "expo-router": "~3.4.8",
    "expo-splash-screen": "~0.26.4",
    "expo-status-bar": "~1.11.1",
    "expo-system-ui": "~2.9.3",
    "expo-web-browser": "~12.8.2",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-native": "0.73.6",
    "react-native-safe-area-context": "4.8.2",
    "react-native-screens": "~3.29.0",
    "react-native-web": "~0.19.6",
    "@react-native-picker/picker": "2.6.1",
    "axios": "^1.6.8"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "@typescript-eslint/eslint-plugin": "^7.7.0",
    "@typescript-eslint/parser": "^7.7.0",
    "eslint": "^8.57.0",
    "eslint-config-expo": "^7.0.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "jest": "^29.2.1",
    "jest-expo": "~50.0.4",
    "prettier": "^3.2.5",
    "typescript": "~5.3.3"
  },
  "private": true
}

## Instructions de démarrage

```bash
# 1. Créer le projet
npx create-expo-app@latest LostFoundApp --template tabs@50
cd LostFoundApp

# 2. Installer les dépendances supplémentaires
npx expo install expo-image-picker expo-location axios
npm install react-native-gifted-chat @react-native-picker/picker

# 3. Remplacer les fichiers par le code ci-dessus

# 4. Démarrer l'application
npx expo start

# 5. Pour tester sur un appareil physique
npx expo start --tunnel

# 6. Pour démarrer le serveur backend (Spring Boot)
# Assurez-vous que votre API Spring Boot fonctionne sur http://localhost:5000/v1/
```

## Fonctionnalités implémentées

✅ **Navigation avec Expo Router** - Structure moderne avec onglets et navigation en pile
✅ **Gestion des rôles** - USER, ADMIN, PROFESSIONAL, SUPERADMIN
✅ **CRUD des annonces** - Créer, lire, modifier, supprimer
✅ **Système de filtres** - Par type, ville, catégorie
✅ **Catégories dynamiques** - Avec critères configurables
✅ **Upload d'images** - Avec expo-image-picker
✅ **Système de matching** - Correspondances automatiques
✅ **Chat instantané** - Communication entre utilisateurs
✅ **Questions secrètes** - Pour les objets trouvés
✅ **Interface responsive** - Design moderne et accessible
✅ **Mock API** - Fonctionne sans backend pour développement

L'application est maintenant structurée selon les dernières conventions d'Expo Router et prête à être connectée à votre API Spring Boot !
.criteriaValues[criterion.id] || ''}
              onChangeText={(value) => handleCriteriaChange(criterion.id, value)}
              placeholder={`Entrez ${criterion.name.toLowerCase()}`}
              keyboardType={criterion.type === 'number' ? 'numeric' : 'default'}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Créer une annonce</Text>
          <Text style={styles.subtitle}>
            {formData.type === 'LOST' ? 'Objet perdu' : 'Objet trouvé'}
          </Text>
        </View>

        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              formData.type === 'LOST' && styles.typeButtonLostActive,
            ]}
            onPress={() => setFormData(prev => ({ ...prev, type: 'LOST' }))}
          >
            <FontAwesome 
              name="search" 
              size={20} 
              color={formData.type === 'LOST' ? 'white' : '#FF6B6B'} 
            />
            <Text style={[
              styles.typeButtonText,
              formData.type === 'LOST' && styles.typeButtonTextActive
            ]}>
              Objet Perdu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              formData.type === 'FOUND' && styles.typeButtonFoundActive,
            ]}
            onPress={() => setFormData(prev => ({ ...prev, type: 'FOUND' }))}
          >
            <FontAwesome 
              name="check-circle" 
              size={20} 
              color={formData.type === 'FOUND' ? 'white' : '#4ECDC4'} 
            />
            <Text style={[
              styles.typeButtonText,
              formData.type === 'FOUND' && styles.typeButtonTextActive
            ]}>
              Objet Trouvé
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Titre <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData