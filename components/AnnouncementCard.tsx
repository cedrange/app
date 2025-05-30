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