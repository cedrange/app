// app/(tabs)/profile/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { updateUser } from '../../../store/slices/authSlice';
import { User } from '../../../types/user';
import * as ImagePicker from 'expo-image-picker';

interface ProfileData extends User {
  avatar?: string;
  bio?: string;
  birthDate?: string;
  city?: string;
  country?: string;
  occupation?: string;
}

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser, logout } = useAuth();
  const dispatch = useAppDispatch();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempProfileData, setTempProfileData] = useState<ProfileData | null>(null);

  const isOwnProfile = currentUser?.id?.toString() === id;

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      
      if (isOwnProfile && currentUser) {
        // Si c'est le profil de l'utilisateur connecté
        setProfileData(currentUser as ProfileData);
      } else {
        // Ici vous pouvez ajouter une API call pour récupérer le profil d'un autre utilisateur
        // const response = await fetchUserProfile(id);
        // setProfileData(response.data);
        
        // Pour l'exemple, on simule un utilisateur
        setProfileData({
          id: parseInt(id),
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          nickname: 'johndoe',
          bio: 'Développeur passionné par les nouvelles technologies',
          phoneNumber: '+33123456789',
          city: 'Paris',
          country: 'France',
          occupation: 'Développeur Full Stack',
          registerDate: Date.now(),
          active: true,
          gender: 'M',
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission requise', 'Vous devez autoriser l\'accès à vos photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setTempProfileData(prev => ({
          ...prev!,
          avatar: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const openEditModal = () => {
    setTempProfileData({ ...profileData! });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (isOwnProfile && tempProfileData) {
        // Mettre à jour le profil dans le store Redux
        dispatch(updateUser(tempProfileData));
        setProfileData(tempProfileData);
        
        // Ici vous pouvez ajouter une API call pour sauvegarder sur le serveur
        // await updateUserProfile(tempProfileData);
      }
      
      setEditModalVisible(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profil non trouvé</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        {isOwnProfile && (
          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Avatar et infos principales */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ 
              uri: profileData.avatar || 'https://via.placeholder.com/120/007AFF/white?text=' + 
                   (profileData.firstName?.[0] || 'U') + (profileData.lastName?.[0] || '') 
            }}
            style={styles.avatar}
          />
          {isOwnProfile && (
            <TouchableOpacity style={styles.cameraButton} onPress={handleImagePicker}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.name}>
          {profileData.firstName} {profileData.lastName}
        </Text>
        
        {profileData.nickname && (
          <Text style={styles.nickname}>@{profileData.nickname}</Text>
        )}

        {profileData.bio && (
          <Text style={styles.bio}>{profileData.bio}</Text>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileData.registerDate ? 
              Math.floor((Date.now() - profileData.registerDate) / (1000 * 60 * 60 * 24)) : 0}
            </Text>
            <Text style={styles.statLabel}>Jours</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileData.active ? 'Actif' : 'Inactif'}</Text>
            <Text style={styles.statLabel}>Statut</Text>
          </View>
        </View>
      </View>

      {/* Informations détaillées */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Informations</Text>
        
        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{profileData.email}</Text>
        </View>

        {profileData.phoneNumber && (
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{profileData.phoneNumber}</Text>
          </View>
        )}

        {profileData.occupation && (
          <View style={styles.infoItem}>
            <Ionicons name="briefcase-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{profileData.occupation}</Text>
          </View>
        )}

        {(profileData.city || profileData.country) && (
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              {[profileData.city, profileData.country].filter(Boolean).join(', ')}
            </Text>
          </View>
        )}

        {profileData.webSite && (
          <View style={styles.infoItem}>
            <Ionicons name="globe-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{profileData.webSite}</Text>
          </View>
        )}
      </View>

      {/* Actions pour le profil personnel */}
      {isOwnProfile && (
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings-outline" size={20} color="#007AFF" />
            <Text style={styles.actionText}>Paramètres</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.actionText}>Aide</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={[styles.actionText, styles.logoutText]}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal d'édition */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancel}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={styles.modalSave}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.editAvatarContainer}>
              <Image
                source={{ 
                  uri: tempProfileData?.avatar || 'https://via.placeholder.com/120/007AFF/white?text=' + 
                       (tempProfileData?.firstName?.[0] || 'U') + (tempProfileData?.lastName?.[0] || '') 
                }}
                style={styles.editAvatar}
              />
              <TouchableOpacity style={styles.changePhotoButton} onPress={handleImagePicker}>
                <Text style={styles.changePhotoText}>Changer la photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.editForm}>
              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Prénom</Text>
                <TextInput
                  style={styles.editInput}
                  value={tempProfileData?.firstName || ''}
                  onChangeText={(text) => setTempProfileData(prev => ({ ...prev!, firstName: text }))}
                />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Nom</Text>
                <TextInput
                  style={styles.editInput}
                  value={tempProfileData?.lastName || ''}
                  onChangeText={(text) => setTempProfileData(prev => ({ ...prev!, lastName: text }))}
                />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Pseudo</Text>
                <TextInput
                  style={styles.editInput}
                  value={tempProfileData?.nickname || ''}
                  onChangeText={(text) => setTempProfileData(prev => ({ ...prev!, nickname: text }))}
                />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Bio</Text>
                <TextInput
                  style={[styles.editInput, styles.textArea]}
                  value={tempProfileData?.bio || ''}
                  onChangeText={(text) => setTempProfileData(prev => ({ ...prev!, bio: text }))}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Téléphone</Text>
                <TextInput
                  style={styles.editInput}
                  value={tempProfileData?.phoneNumber || ''}
                  onChangeText={(text) => setTempProfileData(prev => ({ ...prev!, phoneNumber: text }))}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Profession</Text>
                <TextInput
                  style={styles.editInput}
                  value={tempProfileData?.occupation || ''}
                  onChangeText={(text) => setTempProfileData(prev => ({ ...prev!, occupation: text }))}
                />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Ville</Text>
                <TextInput
                  style={styles.editInput}
                  value={tempProfileData?.city || ''}
                  onChangeText={(text) => setTempProfileData(prev => ({ ...prev!, city: text }))}
                />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Site web</Text>
                <TextInput
                  style={styles.editInput}
                  value={tempProfileData?.webSite || ''}
                  onChangeText={(text) => setTempProfileData(prev => ({ ...prev!, webSite: text }))}
                  keyboardType="url"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  header: {
    height: 200,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  editButton: {
    padding: 8,
  },
  profileSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
    marginTop: -60,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  nickname: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailsSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  actionsSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 12,
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#FF3B30',
  },
  // Styles du modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 50,
  },
  modalCancel: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalSave: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  editAvatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  editAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  editForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  editInputGroup: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});