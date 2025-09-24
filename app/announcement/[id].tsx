import { AppDispatch, RootState } from '@/store/store';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { apiService } from '../../services/apiService';
import { fetchAnnouncementById } from '../../store/slices/announcementSlice';
import { useAppSelector } from '@/store/hooks';


export default function AnnouncementDetailScreen() {
  const { id, edit } = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const announcement = useAppSelector(state => state.announcement.current);
  const loading = useSelector((state: RootState) => state.announcement.loading);
  const {user} = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {     
      if (typeof id === 'string') {        
        dispatch(fetchAnnouncementById(Number(id)));        
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger l\'annonce');
      console.error('Error loading announcement:', error);
      router.back();
    }
  };

  const handleContactUser = () => {
    if (!announcement || !user) return;
    // Create a mock match ID for the chat
    const matchId = `${announcement.id}-${user.id}`;
    router.push(`/chat/${matchId}`);
  };

  const handleViewMatches = () => {
    if (!announcement) return;
    router.push(`/matches/${announcement.id}`);
  };

  const handleEdit = () => {
    if (!announcement) return;
    try {
      router.push({
        pathname: "/announcement/edit/[id]",
        params: { id: announcement.id.toString(), edit: "true" },
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible d’ouvrir l’éditeur d’annonce");
      console.error("Error navigating to edit:", error);
    }
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
  const typeColor = announcement.type === 'perdu' ? '#FF6B6B' : '#4ECDC4';
  const typeText = announcement.type === 'perdu' ? 'Objet Perdu' : 'Objet Trouvé';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: typeColor }]}>
          <View style={styles.typeContainer}>
            <FontAwesome 
              name={announcement.type === 'perdu' ? 'search' : 'check-circle'} 
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
          <Image source={{ uri: `data:image/jpeg;base64,${announcement.photo.data}` }} style={styles.image} />
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{announcement.titre_annonce}</Text>
          
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <FontAwesome name="map-marker" size={16} color="#666" />
              <Text style={styles.metadataText}>
                {announcement.ville}, {announcement.codePostal}
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
              <Text style={styles.metadataText}>{announcement.categorie_libelle}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{announcement.description}</Text>
          </View>

          {announcement.criteres.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Caractéristiques</Text>
              {announcement.criteres.map((criterion) => {
                const value = announcement.criteres[criterion.id];
                if (!value) return null;
                
                return (
                  <View key={criterion.id} style={styles.criteriaItem}>
                    <Text style={styles.criteriaLabel}>{criterion.libelle}:</Text>
                    <Text style={styles.criteriaValue}>{criterion.value}</Text>
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
                  {announcement.userFirstname} {announcement.userLastname}
                </Text>
                <Text style={styles.publishDate}>
                  Publié le {new Date('01-10-2025').toLocaleDateString('fr-FR')}
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
