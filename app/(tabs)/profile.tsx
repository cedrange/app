import { useAuth } from '@/hooks/useAuth';
import { fetchUserAnnouncements } from '@/store/slices/userAnnouncementsSlice';
import { fetchCurrentUser } from '@/store/slices/userSlice';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AnnouncementCard from '../../components/AnnouncementCard';
import { apiService } from '../../services/apiService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';


export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const  currentUser= useAuth().user;
  const loading = useAppSelector(state => state.user.loading);
  const userAnnouncements = useAppSelector(state => state.userAnnouncements.data);
  
  const isOwnProfile = currentUser?.id?.toString() === id;
  
  useEffect(() => {
    console.log('id param:', id);
    
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    try {
      dispatch(fetchCurrentUser());
      dispatch(fetchUserAnnouncements(currentUser!.id));
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
      console.error('Error loading profile data:', error);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: number) => {
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
              /*setUserAnnouncements(prev => prev.filter(a => a.id !== announcementId));*/
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
    const lost = userAnnouncements.filter(a => a.type === 'perdu').length;
    const found = userAnnouncements.filter(a => a.type === 'trouvé').length;
    return { lost, found, total: lost + found };
  };

  if (loading || !currentUser) {
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
          <TouchableOpacity 
                onPress={() => router.push(`/profileSettings/${currentUser.id}` as any)}
              >
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <FontAwesome name="user" size={40} color="white" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {currentUser?.firstName} {currentUser?.lastName}
              </Text>
              <Text style={styles.userEmail}>{currentUser?.email}</Text>
              <Text style={styles.userRole}>
                {getRoleDisplayName(currentUser?.role || '')}
              </Text>
            </View>
          </View></TouchableOpacity>
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
            <Text style={styles.statLabel}>res</Text>
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
                  currentUserId={currentUser!.id}
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