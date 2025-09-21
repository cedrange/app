import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAnnouncements } from '@/store/slices/announcementsSlice';
import { fetchCategories } from '@/store/slices/categoriesSliceNew';
import { fetchCurrentUser } from '@/store/slices/userSlice';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AnnouncementCard from '../../components/AnnouncementCard';

export default function HomeScreen() {
   const dispatch = useAppDispatch();
   const { currentUser, loading, error } = useAppSelector(state => state.user);    
   const recentAnnouncements = useAppSelector(state => state.announcements.data);
   

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    dispatch(fetchCategories());
    dispatch(fetchCurrentUser());
    dispatch(fetchAnnouncements());
  };

  const handleQuickAction = (type: 'LOST' | 'FOUND') => {
    router.push({
      pathname: '/add-announcement',
      params: { type }
    });
  };

  if (loading || !currentUser) {
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
            Bonjour {currentUser.firstName} !
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

          {Array.isArray(recentAnnouncements) &&
            recentAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onPress={() => router.push(`/announcement/${announcement.id}`)}
              currentUserId={currentUser.id}
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